"use client";

import { useSearchParams } from "next/navigation";
import { ContactForm } from "./contact-form";
import { isRequestType } from "./request-types";

export function ContactFormFromParams({ to }: { to: string }) {
  const t = useSearchParams().get("type");
  const initialType = isRequestType(t) ? t : "general";
  return <ContactForm key={initialType} to={to} initialType={initialType} />;
}
