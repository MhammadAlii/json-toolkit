"use client";

import { useId, useState } from "react";
import { PaperPlaneIcon } from "@/components/icons/paper-plane";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { Textarea } from "@/components/ui/textarea";
import { requestTypes, type RequestType } from "./request-types";

// No backend yet: submitting opens the visitor's email app with the message prefilled.
export function ContactForm({ to, initialType = "general" }: { to: string; initialType?: RequestType }) {
  const id = useId();
  const [type, setType] = useState<RequestType>(initialType);
  const [opened, setOpened] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const field = (key: string) => String(data.get(key) ?? "").trim();
    const typeLabel = requestTypes.find((t) => t.value === type)?.label ?? "General Question";
    const subject = `[${typeLabel}] ${field("subject")}`;
    const body = `${field("message")}\n\n---\nRequest type: ${typeLabel}\nName: ${field("name") || "(not given)"}\nReply to: ${field("email")}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Request Type" htmlFor={`${id}-type`}>
          <Select id={`${id}-type`} name="type" value={type} onChange={(e) => setType(e.target.value as RequestType)} options={requestTypes} />
        </FormField>
        <FormField label="Name" hint="(Optional)" htmlFor={`${id}-name`}>
          <TextInput id={`${id}-name`} name="name" autoComplete="name" placeholder="Alex Dev" />
        </FormField>
      </div>
      <FormField label="Email Address" htmlFor={`${id}-email`}>
        <TextInput id={`${id}-email`} name="email" type="email" required autoComplete="email" placeholder="alex@company.com" />
      </FormField>
      <FormField label="Subject" htmlFor={`${id}-subject`}>
        <TextInput id={`${id}-subject`} name="subject" required placeholder="Brief summary of your request" />
      </FormField>
      <FormField label="Message" htmlFor={`${id}-message`} className="pb-1.5">
        <Textarea id={`${id}-message`} name="message" required rows={6} placeholder="How can we help?" />
      </FormField>

      <Callout icon={<ShieldAlertIcon className="size-3.5" />} title="Security Notice: Do not send secrets">
        Please ensure your message does not contain API keys, passwords, or sensitive PII. If you need to share a sample JSON with
        secrets, use dummy values instead.
      </Callout>

      <Button type="submit" className="w-full">
        Send Message <PaperPlaneIcon className="size-3" />
      </Button>
      <p role="status" className="min-h-4 text-center text-xs text-muted">
        {opened ? `Your email app should open with the message ready to send to ${to}.` : ""}
      </p>
    </form>
  );
}
