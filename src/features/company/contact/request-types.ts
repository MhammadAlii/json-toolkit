export const requestTypes = [
  { value: "general", label: "General Question" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "privacy", label: "Privacy / Data" },
] as const;

export type RequestType = (typeof requestTypes)[number]["value"];

export function isRequestType(v: string | null): v is RequestType {
  return requestTypes.some((t) => t.value === v);
}
