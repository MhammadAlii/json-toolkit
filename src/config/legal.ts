// TODO before launch: replace the bracketed placeholders with real values, confirm the email
// addresses exist, and have the legal pages reviewed.

export const legal = {
  entityName: process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME || "[LEGAL ENTITY NAME]",
  jurisdiction: process.env.NEXT_PUBLIC_LEGAL_JURISDICTION || "[GOVERNING JURISDICTION]",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@jsontoolkit.dev",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@jsontoolkit.dev",
  legalEmail: process.env.NEXT_PUBLIC_LEGAL_EMAIL || "[CONTACT EMAIL]",
  lastUpdated: "2026-10-06",
} as const;

export function formatLegalDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
