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

export const signingAlgorithms = [...Object.keys(algorithms), "none"];

export const keyKind = (alg: unknown): "secret" | "public-key" | null => {
  const a = typeof alg === "string" ? algorithms[alg] : undefined;
  return a ? (a.kind === "hmac" ? "secret" : "public-key") : null;
};

export type Verification = { ok: true; valid: boolean } | { ok: false; error: string };

function pemBytes(pem: string, label: "PUBLIC KEY" | "PRIVATE KEY"): ArrayBuffer | null {
  const m = new RegExp(`-----BEGIN ${label}-----([\\s\\S]+?)-----END ${label}-----`).exec(pem);
  if (!m) return null;
  try {
    const binary = atob(m[1].replace(/\s+/g, ""));
    return Uint8Array.from(binary, (c) => c.charCodeAt(0)).buffer;
  } catch {
    return null;
  }
}

const secretBytes = (key: string, secretIsBase64: boolean) => (secretIsBase64 ? base64UrlBytes(key.trim().replace(/\+/g, "-").replace(/\//g, "_")) : new TextEncoder().encode(key));

const keyParams = (alg: Algorithm) =>
  alg.kind === "ecdsa" ? { name: "ECDSA", namedCurve: alg.curve as string } : { name: alg.kind === "pss" ? "RSA-PSS" : "RSASSA-PKCS1-v1_5", hash: alg.hash };

const signParams = (alg: Algorithm, key: CryptoKey) =>
  alg.kind === "pss" ? { name: "RSA-PSS", saltLength: alg.size as number } : alg.kind === "ecdsa" ? { name: "ECDSA", hash: alg.hash } : key.algorithm.name;

// A secret for HS*, otherwise a PEM or JWK key: public to verify, private to sign.
async function importKey(alg: Algorithm, key: string, secretIsBase64: boolean, usage: "verify" | "sign"): Promise<CryptoKey | string> {
  if (alg.kind === "hmac") {
    const bytes = secretBytes(key, secretIsBase64);
    if (!bytes) return "The secret isn't valid Base64.";
    return crypto.subtle.importKey("raw", bytes as Uint8Array<ArrayBuffer>, { name: "HMAC", hash: alg.hash }, false, [usage]);
  }
  const params = keyParams(alg);
  const trimmed = key.trim();
  const which = usage === "sign" ? "private" : "public";
  if (trimmed.startsWith("{")) {
    try {
      return await crypto.subtle.importKey("jwk", JSON.parse(trimmed) as JsonWebKey, params, false, [usage]);
    } catch {
      return `The JWK couldn't be used with this algorithm${usage === "sign" ? "; signing needs a private JWK (with \"d\")" : ""}.`;
    }
  }
  if (usage === "sign" && /-----BEGIN (RSA|EC) PRIVATE KEY-----/.test(trimmed)) {
    return "This key is in the older PKCS#1 or SEC1 format. Convert it to PKCS#8 with: openssl pkcs8 -topk8 -nocrypt -in key.pem";
  }
  const der = pemBytes(trimmed, usage === "sign" ? "PRIVATE KEY" : "PUBLIC KEY");
  if (!der) return `Paste a PEM ${which} key (-----BEGIN ${which.toUpperCase()} KEY-----) or a JWK.`;
  try {
    return await crypto.subtle.importKey(usage === "sign" ? "pkcs8" : "spki", der, params, false, [usage]);
  } catch {
    return `The ${which} key couldn't be used with this algorithm.`;
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
  const cryptoKey = await importKey(alg, key, secretIsBase64, "verify");
  if (typeof cryptoKey === "string") return { ok: false, error: cryptoKey };
  const [header, payload, signature] = decoded.parts;
  const data = new TextEncoder().encode(`${header}.${payload}`);
  const sig = base64UrlBytes(signature) as Uint8Array<ArrayBuffer>;
  return { ok: true, valid: await crypto.subtle.verify(signParams(alg, cryptoKey), cryptoKey, sig, data) };
}

export const base64Url = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export type SignOptions = {
  alg: string;
  /** The HMAC secret, or a PEM (PKCS#8) or JWK private key. */
  key: string;
  secretIsBase64: boolean;
  kid: string;
  /** Adds "iat" with the current time. */
  issuedAt: boolean;
  /** Adds "exp" this many seconds from now; 0 leaves it out. */
  expiresIn: number;
};

export const defaultSignOptions: SignOptions = { alg: "HS256", key: "", secretIsBase64: false, kid: "", issuedAt: false, expiresIn: 0 };

export type Signed = { ok: true; token: string; parts: [string, string, string]; header: Record<string, unknown>; payload: Record<string, unknown>; notes: string[] } | { ok: false; error: string };

/** Signs a JSON payload as a JWS compact token. `now` is the current Unix time, for iat and exp. */
export async function signJwt(payloadText: string, options: SignOptions, now: number): Promise<Signed> {
  const o = options;
  let payload: unknown;
  try {
    payload = JSON.parse(payloadText) as unknown;
  } catch {
    return { ok: false, error: "The payload isn't valid JSON." };
  }
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return { ok: false, error: "A JWT payload must be a JSON object of claims, like {\"sub\": \"123\"}." };
  const claims = { ...(payload as Record<string, unknown>) };
  if (o.issuedAt) claims.iat = now;
  if (o.expiresIn > 0) claims.exp = now + o.expiresIn;
  const header: Record<string, unknown> = { alg: o.alg, typ: "JWT", ...(o.kid.trim() ? { kid: o.kid.trim() } : {}) };
  const encoder = new TextEncoder();
  const head = `${base64Url(encoder.encode(JSON.stringify(header)))}.${base64Url(encoder.encode(JSON.stringify(claims)))}`;
  const notes: string[] = [];

  if (o.alg === "none") {
    notes.push("Unsigned tokens (alg: none) are accepted by almost no server, and must never be trusted.");
    const parts = head.split(".") as [string, string];
    return { ok: true, token: `${head}.`, parts: [parts[0], parts[1], ""], header, payload: claims, notes };
  }
  const alg = algorithms[o.alg];
  if (!alg) return { ok: false, error: `The algorithm ${o.alg} isn't supported.` };
  if (!o.key.trim()) return { ok: false, error: alg.kind === "hmac" ? "Enter a secret to sign with." : "Enter a private key to sign with, or generate a key pair." };
  if (alg.kind === "hmac") {
    const bytes = secretBytes(o.key, o.secretIsBase64);
    const bits = Number(o.alg.slice(2));
    if (bytes && bytes.length * 8 < bits) notes.push(`${o.alg} secrets should be at least ${bits / 8} bytes (${bits} bits) long; this one is ${bytes.length}.`);
  }
  const key = await importKey(alg, o.key, o.secretIsBase64, "sign");
  if (typeof key === "string") return { ok: false, error: key };
  const signature = new Uint8Array(await crypto.subtle.sign(signParams(alg, key), key, encoder.encode(head)));
  const parts = [...head.split("."), base64Url(signature)] as [string, string, string];
  return { ok: true, token: parts.join("."), parts, header, payload: claims, notes };
}

const pem = (label: string, der: ArrayBuffer) => {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(der)));
  return `-----BEGIN ${label}-----\n${b64.match(/.{1,64}/g)!.join("\n")}\n-----END ${label}-----`;
};

/** A new key pair for an RS*, PS* or ES* algorithm, as PEM: PKCS#8 private, SPKI public. */
export async function generateKeyPair(name: string): Promise<{ privateKey: string; publicKey: string } | null> {
  const alg = algorithms[name];
  if (!alg || alg.kind === "hmac") return null;
  const params = alg.kind === "ecdsa" ? keyParams(alg) : { ...keyParams(alg), modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) };
  const pair = (await crypto.subtle.generateKey(params, true, ["sign", "verify"])) as CryptoKeyPair;
  return {
    privateKey: pem("PRIVATE KEY", await crypto.subtle.exportKey("pkcs8", pair.privateKey)),
    publicKey: pem("PUBLIC KEY", await crypto.subtle.exportKey("spki", pair.publicKey)),
  };
}
