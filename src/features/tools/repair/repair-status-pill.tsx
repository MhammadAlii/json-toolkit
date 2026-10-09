import { StatusPill } from "@/components/ui/status-pill";
import type { RepairResult } from "./repair";

export function RepairStatusPill({ result }: { result: RepairResult }) {
  if (result.status === "empty") return <StatusPill tone="muted">Waiting for input</StatusPill>;
  if (result.status === "blocked") return <StatusPill tone="warning">Needs a disabled repair</StatusPill>;
  const n = result.changes.length;
  if (n === 0) return <StatusPill tone="success">Already valid JSON</StatusPill>;
  return <StatusPill tone="success">Repaired · {n.toLocaleString()} {n === 1 ? "change" : "changes"}</StatusPill>;
}
