import { StatusPill } from "@/components/ui/status-pill";
import type { Validation } from "./validator";

export function ValidatorStatusPill({ validation }: { validation: Validation }) {
  if (validation.status === "empty") return <StatusPill tone="muted">Waiting for input</StatusPill>;
  if (validation.status === "valid") return <StatusPill tone="success">Valid JSON</StatusPill>;
  return <StatusPill tone="danger">Invalid JSON · line {validation.error.line}</StatusPill>;
}
