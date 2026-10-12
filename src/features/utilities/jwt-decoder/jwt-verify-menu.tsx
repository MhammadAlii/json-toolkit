"use client";

import { ShieldCheckIcon } from "@/components/icons/shield-check";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { menuFieldClasses } from "@/components/ui/input-styles";
import type { Verification } from "./jwt";

export function JwtVerifyMenu({
  alg,
  kind,
  keyText,
  base64,
  result,
  onKeyChange,
  onBase64Change,
}: {
  alg: string;
  /** What the algorithm needs to verify, or null when it can't be verified. */
  kind: "secret" | "public-key" | null;
  keyText: string;
  base64: boolean;
  result: Verification | null;
  onKeyChange: (key: string) => void;
  onBase64Change: (base64: boolean) => void;
}) {
  const verified = result?.ok && result.valid;
  return (
    <Popover
      label="Verify signature"
      trigger={({ open, toggle, id }) => (
        <Button variant={verified ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <ShieldCheckIcon className="h-[11px] w-auto" /> Verify
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">Verify signature</p>
        {kind === null ? (
          <p className="leading-5 text-muted">{alg === "none" ? "This token is unsigned (alg: none), so there's nothing to verify." : `The ${alg} algorithm can't be verified here.`}</p>
        ) : (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-heading">{kind === "secret" ? "Secret" : "Public key (PEM or JWK)"}</span>
              <textarea
                className={`${menuFieldClasses} h-24 resize-none font-mono`}
                value={keyText}
                onChange={(e) => onKeyChange(e.target.value)}
                placeholder={kind === "secret" ? "your-256-bit-secret" : "-----BEGIN PUBLIC KEY-----"}
                spellCheck={false}
              />
            </label>
            {kind === "secret" && <Checkbox label="Secret is Base64-encoded" checked={base64} onChange={onBase64Change} />}
            {result && (
              <p className={`font-semibold ${result.ok ? (result.valid ? "text-success" : "text-danger") : "text-muted"}`}>
                {result.ok ? (result.valid ? "Signature verified." : "Invalid signature.") : result.error}
              </p>
            )}
            <p className="border-t border-border pt-2 leading-5 text-muted">Checked in your browser; the key is never stored or sent anywhere.</p>
          </>
        )}
      </div>
    </Popover>
  );
}
