export type DecodedJwt =
  | {
      ok: true;
      header: Record<string, unknown>;
      payload: unknown;
      /** The three dot-separated parts as pasted, for showing the token's structure. */
      parts: [string, string, string];
      signatureBytes: number;
    }
  | { ok: false; error: string };

export type JwtStatus = "valid" | "expired" | "not-yet-valid" | "no-expiry";

export type JwtClaim = { key: string; label: string; value: string; time?: number };

const decoder = new TextDecoder("utf-8", { fatal: true });

/** Decodes base64url (padding optional) to bytes, or returns null if it isn't base64url. */
export function base64UrlBytes(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*={0,2}$/.test(text) || text.replace(/=+$/, "").length % 4 === 1) return null;
  const b64 = text.replace(/=+$/, "").replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, "="));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function decodePart(part: string, name: string): { ok: true; value: unknown } | { ok: false; error: string } {
  const bytes = base64UrlBytes(part);
  if (!bytes) return { ok: false, error: `The ${name} isn't valid base64url.` };
  let text: string;
  try {
    text = decoder.decode(bytes);
  } catch {
    return { ok: false, error: `The ${name} isn't UTF-8 text.` };
  }
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, error: `The ${name} isn't JSON.` };
  }
}

/** Decodes a JWS compact token (header.payload.signature). A leading "Bearer " is ignored. */
export function decodeJwt(input: string): DecodedJwt {
  const token = input.trim().replace(/^Bearer\s+/i, "");
  const parts = token.split(".");
  if (parts.length === 5) return { ok: false, error: "This is an encrypted token (JWE). Its payload can only be read with the decryption key." };
  if (parts.length !== 3) return { ok: false, error: `A JWT has three parts separated by dots; this has ${parts.length}.` };
  const header = decodePart(parts[0], "header");
  if (!header.ok) return header;
  if (header.value === null || typeof header.value !== "object" || Array.isArray(header.value)) return { ok: false, error: "The header must be a JSON object." };
  const payload = decodePart(parts[1], "payload");
  if (!payload.ok) return payload;
  const signature = base64UrlBytes(parts[2]);
  if (!signature) return { ok: false, error: "The signature isn't valid base64url." };
  return { ok: true, header: header.value as Record<string, unknown>, payload: payload.value, parts: parts as [string, string, string], signatureBytes: signature.length };
}

const numeric = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

const record = (payload: unknown) => (payload !== null && typeof payload === "object" && !Array.isArray(payload) ? (payload as Record<string, unknown>) : {});

/** Whether the token is currently usable according to its exp and nbf claims. */
export function jwtStatus(payload: unknown, now: number): JwtStatus {
  const p = record(payload);
  const exp = numeric(p.exp);
  const nbf = numeric(p.nbf);
  if (nbf !== undefined && now < nbf) return "not-yet-valid";
  if (exp === undefined) return "no-expiry";
  return now >= exp ? "expired" : "valid";
}

const registered: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expires",
  nbf: "Not before",
  iat: "Issued at",
  jti: "Token ID",
};

const timeClaims = new Set(["exp", "nbf", "iat", "auth_time", "updated_at"]);

/** The registered claims (RFC 7519) first, then the rest; time claims carry their Unix time. */
export function jwtClaims(payload: unknown): JwtClaim[] {
  const p = record(payload);
  const keys = [...Object.keys(registered).filter((k) => k in p), ...Object.keys(p).filter((k) => !(k in registered))];
  return keys.map((key) => {
    const v = p[key];
    const time = timeClaims.has(key) ? numeric(v) : undefined;
    return { key, label: registered[key] ?? "", value: typeof v === "string" ? v : JSON.stringify(v), time };
  });
}

type Algorithm = { kind: "hmac" | "rsa" | "pss" | "ecdsa"; hash: string; curve?: string; size?: number };

const algorithms: Record<string, Algorithm> = {
  HS256: { kind: "hmac", hash: "SHA-256" },
  HS384: { kind: "hmac", hash: "SHA-384" },
  HS512: { kind: "hmac", hash: "SHA-512" },
  RS256: { kind: "rsa", hash: "SHA-256" },
  RS384: { kind: "rsa", hash: "SHA-384" },
  RS512: { kind: "rsa", hash: "SHA-512" },
  PS256: { kind: "pss", hash: "SHA-256", size: 32 },
  PS384: { kind: "pss", hash: "SHA-384", size: 48 },
  PS512: { kind: "pss", hash: "SHA-512", size: 64 },
  ES256: { kind: "ecdsa", hash: "SHA-256", curve: "P-256" },
  ES384: { kind: "ecdsa", hash: "SHA-384", curve: "P-384" },
  ES512: { kind: "ecdsa", hash: "SHA-512", curve: "P-521" },
};

export const keyKind = (alg: unknown): "secret" | "public-key" | null => {
  const a = typeof alg === "string" ? algorithms[alg] : undefined;
  return a ? (a.kind === "hmac" ? "secret" : "public-key") : null;
};

export type Verification = { ok: true; valid: boolean } | { ok: false; error: string };

function pemBytes(pem: string): ArrayBuffer | null {
  const m = /-----BEGIN PUBLIC KEY-----([\s\S]+?)-----END PUBLIC KEY-----/.exec(pem);
  if (!m) return null;
  try {
    const binary = atob(m[1].replace(/\s+/g, ""));
    return Uint8Array.from(binary, (c) => c.charCodeAt(0)).buffer;
  } catch {
    return null;
  }
}

async function importKey(alg: Algorithm, key: string, secretIsBase64: boolean): Promise<CryptoKey | string> {
  if (alg.kind === "hmac") {
    const bytes = secretIsBase64 ? base64UrlBytes(key.trim().replace(/\+/g, "-").replace(/\//g, "_")) : new TextEncoder().encode(key);
    if (!bytes) return "The secret isn't valid Base64.";
    return crypto.subtle.importKey("raw", bytes as Uint8Array<ArrayBuffer>, { name: "HMAC", hash: alg.hash }, false, ["verify"]);
  }
  const params =
    alg.kind === "ecdsa"
      ? { name: "ECDSA", namedCurve: alg.curve as string }
      : { name: alg.kind === "pss" ? "RSA-PSS" : "RSASSA-PKCS1-v1_5", hash: alg.hash };
  const trimmed = key.trim();
  if (trimmed.startsWith("{")) {
    try {
      return await crypto.subtle.importKey("jwk", JSON.parse(trimmed) as JsonWebKey, params, false, ["verify"]);
    } catch {
      return "The JWK couldn't be used with this algorithm.";
    }
  }
  const spki = pemBytes(trimmed);
  if (!spki) return "Paste a PEM public key (-----BEGIN PUBLIC KEY-----) or a JWK.";
  try {
    return await crypto.subtle.importKey("spki", spki, params, false, ["verify"]);
  } catch {
    return "The public key couldn't be used with this algorithm.";
  }
}

/** Checks the signature with Web Crypto: a shared secret for HS*, a PEM or JWK public key for RS*, PS* and ES*. */
export async function verifyJwt(input: string, key: string, secretIsBase64 = false): Promise<Verification> {
  const decoded = decodeJwt(input);
  if (!decoded.ok) return { ok: false, error: decoded.error };
  const name = decoded.header.alg;
  const alg = typeof name === "string" ? algorithms[name] : undefined;
  if (!alg) return { ok: false, error: name === "none" ? "This token is unsigned (alg: none), so there's nothing to verify." : `The algorithm ${String(name)} isn't supported.` };
  if (!key.trim()) return { ok: false, error: alg.kind === "hmac" ? "Enter the secret." : "Enter the public key." };
  const cryptoKey = await importKey(alg, key, secretIsBase64);
  if (typeof cryptoKey === "string") return { ok: false, error: cryptoKey };
  const [header, payload, signature] = decoded.parts;
  const data = new TextEncoder().encode(`${header}.${payload}`);
  const sig = base64UrlBytes(signature) as Uint8Array<ArrayBuffer>;
  const params = alg.kind === "pss" ? { name: "RSA-PSS", saltLength: alg.size as number } : alg.kind === "ecdsa" ? { name: "ECDSA", hash: alg.hash } : cryptoKey.algorithm.name;
  return { ok: true, valid: await crypto.subtle.verify(params, cryptoKey, sig, data) };
}
