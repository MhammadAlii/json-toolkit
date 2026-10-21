"use client";

import { useState } from "react";
import { KeyIcon } from "@/components/icons/key";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CopyIconButton } from "@/components/ui/copy-icon-button";
import { Popover } from "@/components/ui/popover";
import { menuFieldClasses } from "@/components/ui/input-styles";
import { OptionSelect } from "@/features/converters/shared/option-select";
import { generateKeyPair, keyKind, signingAlgorithms, type SignOptions } from "./jwt";

// HMAC secrets suit every HS algorithm and RSA keys both RS and PS; an EC key belongs to one curve.
const keyFamily = (alg: string) => (alg.startsWith("HS") ? "hmac" : alg.startsWith("RS") || alg.startsWith("PS") ? "rsa" : alg);

const lifetimes: [number, string][] = [
  [0, "No expiry"],
  [900, "15 minutes"],
  [3600, "1 hour"],
  [86400, "1 day"],
  [604800, "7 days"],
  [2592000, "30 days"],
];

// Algorithm, key and standard claims for signing. `onPublicKey` receives the public half of a generated
// pair, so the decoder can verify the token after Swap.
export function JwtSignMenu({ options, onChange, onPublicKey }: { options: SignOptions; onChange: (options: SignOptions) => void; onPublicKey: (key: string) => void }) {
  const [publicKey, setPublicKey] = useState("");
  const [generating, setGenerating] = useState(false);
  const kind = keyKind(options.alg);
  const set = <K extends keyof SignOptions>(key: K) => (value: SignOptions[K]) => onChange({ ...options, [key]: value });

  const generate = async () => {
    setGenerating(true);
    const pair = await generateKeyPair(options.alg);
    setGenerating(false);
    if (!pair) return;
    onChange({ ...options, key: pair.privateKey });
    setPublicKey(pair.publicKey);
    onPublicKey(pair.publicKey);
  };

  return (
    <Popover
      label="Signing options"
      trigger={({ open, toggle, id }) => (
        <Button variant={options.key.trim() || options.alg === "none" ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <KeyIcon className="h-[11px] w-auto" /> Sign
        </Button>
      )}
    >
      <div className="flex w-72 flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">Signing</p>
        <div className="grid grid-cols-2 gap-2">
          <OptionSelect
            label="Algorithm"
            value={options.alg}
            onChange={(alg) => {
              // The key carries over only to algorithms that can use it.
              const keep = keyFamily(alg) === keyFamily(options.alg);
              if (!keep) setPublicKey("");
              onChange({ ...options, alg, key: keep ? options.key : "" });
            }}
            choices={signingAlgorithms.map((a) => [a, a])}
          />
          <OptionSelect label="Expires" value={options.expiresIn} onChange={set("expiresIn")} choices={lifetimes} />
        </div>
        {kind !== null && (
          <label className="flex flex-col gap-1">
            <span className="text-heading">{kind === "secret" ? "Secret" : "Private key (PEM or JWK)"}</span>
            <textarea
              className={`${menuFieldClasses} h-24 resize-none font-mono`}
              value={options.key}
              onChange={(e) => {
                set("key")(e.target.value);
                setPublicKey("");
              }}
              placeholder={kind === "secret" ? "your-256-bit-secret" : "-----BEGIN PRIVATE KEY-----"}
              spellCheck={false}
            />
          </label>
        )}
        {kind === "secret" && <Checkbox label="Secret is Base64-encoded" checked={options.secretIsBase64} onChange={set("secretIsBase64")} />}
        {kind === "public-key" && (
          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="xs" onClick={() => void generate()} disabled={generating}>
              {generating ? "Generating…" : `Generate a ${options.alg} key pair`}
            </Button>
            {publicKey && (
              <div className="flex items-start justify-between gap-2 rounded-md border border-border p-2">
                <span className="leading-5 text-muted">The matching public key is ready for verifying; copy it to share.</span>
                <CopyIconButton text={publicKey} label="Copy public key" />
              </div>
            )}
          </div>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-heading">Key ID (kid)</span>
          <input className={menuFieldClasses} value={options.kid} onChange={(e) => set("kid")(e.target.value)} placeholder="Optional" spellCheck={false} />
        </label>
        <Checkbox label="Add issued-at time (iat)" checked={options.issuedAt} onChange={set("issuedAt")} />
        <p className="border-t border-border pt-2 leading-5 text-muted">Signed in your browser; keys are never stored or sent anywhere.</p>
      </div>
    </Popover>
  );
}
