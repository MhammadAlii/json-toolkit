"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { relativeTime } from "@/core/text/relative-time";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useNow } from "@/hooks/use-now";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats, type ConverterStat } from "@/features/converters/shared/converter-stats";
import { byteSize } from "@/features/converters/shared/converter";
import { SwapButton } from "@/features/converters/shared/swap-button";
import { decodeJwt, defaultSignOptions, jwtClaims, jwtStatus, keyKind, signingAlgorithms, signJwt, verifyJwt, type JwtStatus, type Signed, type SignOptions, type Verification } from "./jwt";
import { JwtClaimsCard } from "./jwt-claims-card";
import { JwtSignMenu } from "./jwt-sign-menu";
import { JwtTokenParts } from "./jwt-token-parts";
import { JwtVerifyMenu } from "./jwt-verify-menu";

type View = "payload" | "header";

const views = [
  { value: "payload", label: "Payload" },
  { value: "header", label: "Header" },
] as const;

const statusStat: Record<JwtStatus, ConverterStat> = {
  valid: { label: "Status", value: "Valid", tone: "success" },
  expired: { label: "Status", value: "Expired", tone: "danger" },
  "not-yet-valid": { label: "Status", value: "Not yet valid", tone: "danger" },
  "no-expiry": { label: "Status", value: "No expiry" },
};

// One page for both directions: decode (and verify) a token, or encode and sign a JSON payload. Swap flips
// the direction, carrying the payload or token across along with the key, so a signed token shows as verified.
export function JwtDecoderWorkspace() {
  const [input, setInput] = useState("");
  const [decoding, setDecoding] = useState(true);
  const [payloadInput, setPayloadInput] = useState("");
  const [signOptions, setSignOptions] = useState<SignOptions>(defaultSignOptions);
  const [publicKey, setPublicKey] = useState("");
  const [signed, setSigned] = useState<{ for: string; result: Signed } | null>(null);
  const [view, setView] = useState<View>("payload");
  const [keyText, setKeyText] = useState("");
  const [base64, setBase64] = useState(false);
  const [verification, setVerification] = useState<{ for: string; result: Verification } | null>(null);
  const colors = useJsonColors();
  const now = useNow();

  const text = useDeferredValue(input);
  const decoded = useMemo(() => (text.trim() ? decodeJwt(text) : null), [text]);
  const ok = decoded?.ok ? decoded : null;
  const alg = ok ? String(ok.header.alg ?? "—") : "—";
  const kind = ok ? keyKind(ok.header.alg) : null;
  const claims = useMemo(() => (ok ? jwtClaims(ok.payload) : []), [ok]);
  const json = ok ? JSON.stringify(view === "payload" ? ok.payload : ok.header, null, 2) : "";

  // Verification is async; each result is tagged with what it checked, so a late one never shows for newer input.
  const verifyFor = JSON.stringify([text, keyText, base64]);
  useEffect(() => {
    if (!ok || kind === null || !keyText.trim()) return;
    let live = true;
    verifyJwt(text, keyText, base64).then((result) => {
      if (live) setVerification({ for: verifyFor, result });
    });
    return () => {
      live = false;
    };
  }, [ok, kind, text, keyText, base64, verifyFor]);
  const result = keyText.trim() && verification?.for === verifyFor ? verification.result : null;

  // Signing is async too, and tagged the same way.
  const payloadText = useDeferredValue(payloadInput);
  const signFor = JSON.stringify([payloadText, signOptions]);
  useEffect(() => {
    if (decoding || !payloadText.trim()) return;
    let live = true;
    signJwt(payloadText, signOptions, Math.floor(Date.now() / 1000)).then((r) => {
      if (live) setSigned({ for: signFor, result: r });
    });
    return () => {
      live = false;
    };
  }, [decoding, payloadText, signOptions, signFor]);
  const encoded = !decoding && payloadText.trim() && signed?.for === signFor ? signed.result : null;

  const swap = () => {
    if (decoding) {
      setDecoding(false);
      if (!ok) return;
      setPayloadInput(JSON.stringify(ok.payload, null, 2));
      const tokenAlg = String(ok.header.alg);
      if (signingAlgorithms.includes(tokenAlg)) {
        const sameSecret = kind === "secret" && keyKind(tokenAlg) === "secret";
        setSignOptions((o) => ({ ...o, alg: tokenAlg, key: sameSecret ? keyText : o.alg === tokenAlg ? o.key : "", secretIsBase64: sameSecret ? base64 : o.secretIsBase64 }));
      }
    } else {
      setDecoding(true);
      if (!encoded?.ok) return;
      setInput(encoded.token);
      setKeyText(keyKind(signOptions.alg) === "secret" ? signOptions.key : publicKey);
      setBase64(signOptions.secretIsBase64);
    }
  };

  const exp = claims.find((c) => c.key === "exp")?.time;
  const signature: ConverterStat = result?.ok
    ? result.valid
      ? { label: "Signature", value: "Verified", tone: "success" }
      : { label: "Signature", value: "Invalid", tone: "danger" }
    : { label: "Signature", value: alg === "none" ? "Unsigned" : "Not checked" };

  if (!decoding) {
    const expiresAt = encoded?.ok ? encoded.payload.exp : undefined;
    return (
      <div className="flex flex-col gap-8">
        {encoded?.ok && encoded.notes.length > 0 && (
          <div role="status" className="flex flex-col gap-2 rounded-xl border border-tint-amber/30 bg-tint-amber/5 px-4 py-3 text-sm text-tint-amber">
            {encoded.notes.map((n) => (
              <p key={n} className="flex items-center gap-2">
                <ShieldAlertIcon className="size-3.5 shrink-0" /> {n}
              </p>
            ))}
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          <JsonInputPanel
            title="Payload"
            label="JWT payload JSON"
            placeholder='Paste the claims as JSON, e.g. {"sub": "123", "name": "Ada"}'
            value={payloadInput}
            onChange={setPayloadInput}
            extraActions={<SwapButton to="decoding" onClick={swap} />}
          />
          <div style={colors.style} className="min-w-0">
            <ConverterOutputPanel
              title="Encoded Token"
              output={encoded?.ok ? encoded.token : ""}
              error={encoded && !encoded.ok ? encoded.error : undefined}
              fixLinks={false}
              filename="token.jwt"
              mime="text/plain"
              options={<JwtSignMenu options={signOptions} onChange={setSignOptions} onPublicKey={setPublicKey} />}
            >
              {encoded?.ok && (
                <div className="p-4">
                  <JwtTokenParts token={encoded.parts} />
                </div>
              )}
            </ConverterOutputPanel>
          </div>
        </div>
        {payloadText.trim() !== "" && (
          <ConverterStats
            stats={[
              { label: "Algorithm", value: signOptions.alg },
              { label: "Claims", value: encoded?.ok ? Object.keys(encoded.payload).length.toLocaleString() : "—" },
              { label: "Expires", value: typeof expiresAt === "number" && now !== null ? relativeTime(expiresAt, now) : encoded?.ok ? "Never" : "—" },
              { label: "Token Size", value: encoded?.ok ? byteSize(encoded.token) : "—" },
              encoded?.ok ? { label: "Status", value: signOptions.alg === "none" ? "Unsigned" : "Signed", tone: signOptions.alg === "none" ? undefined : "success" } : { label: "Status", value: encoded ? "Can't sign" : "Signing…", tone: encoded ? "danger" : undefined },
              { label: "Processing", value: "Local (Client)", tone: "brand" },
            ]}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title="Encoded Token"
          label="JWT input"
          placeholder="Paste a JWT, e.g. eyJhbGciOiJIUzI1NiIs…"
          value={input}
          onChange={setInput}
          wrap
          extraActions={<SwapButton to="encoding" onClick={swap} />}
        />
        <div style={colors.style} className="min-w-0">
          <ConverterOutputPanel
            title="Decoded JWT"
            header={<SegmentedControl label="Decoded part" options={views} value={view} onChange={setView} />}
            output={json}
            error={decoded && !decoded.ok ? decoded.error : undefined}
            fixLinks={false}
            filename={`jwt-${view}.json`}
            mime="application/json"
            options={
              ok ? <JwtVerifyMenu alg={alg} kind={kind} keyText={keyText} base64={base64} result={result} onKeyChange={setKeyText} onBase64Change={setBase64} /> : undefined
            }
          >
            {json && <JsonCodeView text={json} />}
          </ConverterOutputPanel>
        </div>
      </div>

      {ok && (
        <div style={colors.style} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <JwtClaimsCard claims={claims} now={now} />
          <JwtTokenParts token={ok.parts} />
        </div>
      )}

      {decoded && (
        <ConverterStats
          stats={[
            { label: "Algorithm", value: alg },
            { label: "Type", value: ok ? String(ok.header.typ ?? "—") : "—" },
            ok && now !== null ? statusStat[jwtStatus(ok.payload, now)] : { label: "Status", value: ok ? "—" : "Invalid token", tone: ok ? undefined : "danger" },
            { label: "Expires", value: exp === undefined ? (ok ? "Never" : "—") : now === null ? "—" : relativeTime(exp, now) },
            signature,
            { label: "Processing", value: "Local (Client)", tone: "brand" },
          ]}
        />
      )}
    </div>
  );
}
