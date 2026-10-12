"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { relativeTime } from "@/core/text/relative-time";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useNow } from "@/hooks/use-now";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats, type ConverterStat } from "@/features/converters/shared/converter-stats";
import { decodeJwt, jwtClaims, jwtStatus, keyKind, verifyJwt, type JwtStatus, type Verification } from "./jwt";
import { JwtClaimsCard } from "./jwt-claims-card";
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

export function JwtDecoderWorkspace() {
  const [input, setInput] = useState("");
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

  const exp = claims.find((c) => c.key === "exp")?.time;
  const signature: ConverterStat = result?.ok
    ? result.valid
      ? { label: "Signature", value: "Verified", tone: "success" }
      : { label: "Signature", value: "Invalid", tone: "danger" }
    : { label: "Signature", value: alg === "none" ? "Unsigned" : "Not checked" };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel title="Encoded Token" label="JWT input" placeholder="Paste a JWT, e.g. eyJhbGciOiJIUzI1NiIs…" value={input} onChange={setInput} wrap />
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
