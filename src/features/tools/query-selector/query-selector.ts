import { compileCondition, compileField, queryJsonPath, type FieldPath } from "@/core/json/jsonpath";
import { describeParseError, parseJson } from "@/core/json/parse";

export type StageKind = "path" | "where" | "select" | "sort" | "limit" | "group";
export type Stage = { id: string; kind: StageKind; expr: string };

export const stageInfo: Record<StageKind, { label: string; placeholder: string; hint: string }> = {
  path: { label: "PATH", placeholder: "$.users[*]", hint: "Pick values with a JSONPath expression" },
  where: { label: "WHERE", placeholder: "age > 18", hint: "Keep items matching a condition" },
  select: { label: "SELECT", placeholder: "id, email, profile.name as name", hint: "Keep only some fields" },
  sort: { label: "SORT", placeholder: "age desc, name", hint: "Order items by fields" },
  limit: { label: "LIMIT", placeholder: "10 offset 0", hint: "Keep the first N items" },
  group: { label: "GROUP", placeholder: "country", hint: "Count items per value of a field" },
};

export type PipelineResult = { ok: true; value: unknown; count: number } | { ok: false; error: string; stage?: number };

// Record stages work on lists; a single object is treated as a list of one.
const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : [value]);

const splitList = (src: string) => src.split(",").map((s) => s.trim()).filter(Boolean);

function field(src: string): FieldPath {
  const r = compileField(src);
  if (!r.ok) throw new StageError(r.error);
  return r.field;
}

class StageError extends Error {}

const outputKey = (f: FieldPath) => {
  const last = f.segments[f.segments.length - 1];
  return typeof last === "string" ? last : f.segments.join(".");
};

function compareValues(a: unknown, b: unknown): number {
  if (a === undefined || a === null) return b === undefined || b === null ? 0 : 1;
  if (b === undefined || b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

function applyStage(stage: Stage, value: unknown, root: unknown): unknown {
  const src = stage.expr.trim();
  switch (stage.kind) {
    case "path": {
      const r = queryJsonPath(value, src.startsWith("$") ? src : `$${src.startsWith("[") ? "" : "."}${src}`);
      if (!r.ok) throw new StageError(r.error);
      return r.nodes.map((n) => n.value);
    }
    case "where": {
      const r = compileCondition(src);
      if (!r.ok) throw new StageError(r.error);
      return asList(value).filter((item) => r.test(item, root));
    }
    case "select": {
      const fields = splitList(src).map((part) => {
        const m = /^(.*?)\s+as\s+(.+)$/i.exec(part);
        const f = field(m ? m[1] : part);
        return { f, key: m ? m[2].trim() : outputKey(f) };
      });
      return asList(value).map((item) => Object.fromEntries(fields.map(({ f, key }) => [key, f.get(item) ?? null])));
    }
    case "sort": {
      const keys = splitList(src).map((part) => {
        const m = /^(.*?)(?:\s+(asc|desc))?$/i.exec(part)!;
        return { f: field(m[1]), dir: m[2]?.toLowerCase() === "desc" ? -1 : 1 };
      });
      return [...asList(value)].sort((a, b) => {
        for (const { f, dir } of keys) {
          const c = compareValues(f.get(a), f.get(b));
          if (c !== 0) return c * dir;
        }
        return 0;
      });
    }
    case "limit": {
      const m = /^(\d+)(?:\s*(?:offset|,)\s*(\d+))?$/i.exec(src);
      if (!m) throw new StageError('Use a number, e.g. "10" or "10 offset 20"');
      const offset = Number(m[2] ?? 0);
      return asList(value).slice(offset, offset + Number(m[1]));
    }
    case "group": {
      const f = field(src);
      const key = outputKey(f);
      const groups = new Map<string, { value: unknown; count: number }>();
      for (const item of asList(value)) {
        const v = f.get(item) ?? null;
        const id = JSON.stringify(v);
        const g = groups.get(id);
        if (g) g.count++;
        else groups.set(id, { value: v, count: 1 });
      }
      return [...groups.values()].map((g) => ({ [key]: g.value, count: g.count }));
    }
  }
}

/** Runs the stages in order; empty stages are skipped so a half-built pipeline still shows output. */
export function runPipeline(input: string, stages: Stage[]): PipelineResult {
  const parsed = parseJson(input);
  if (!parsed.ok) return { ok: false, error: describeParseError(parsed.error) };
  let value = parsed.value;
  for (let i = 0; i < stages.length; i++) {
    if (!stages[i].expr.trim()) continue;
    try {
      value = applyStage(stages[i], value, parsed.value);
    } catch (err) {
      if (err instanceof StageError) return { ok: false, error: `${stageInfo[stages[i].kind].label}: ${err.message}`, stage: i };
      throw err;
    }
  }
  return { ok: true, value, count: Array.isArray(value) ? value.length : 1 };
}

export const sampleSource = JSON.stringify(
  {
    users: [
      { id: 1, email: "ada@example.com", age: 36, country: "UK", profile: { name: "Ada Lovelace", active: true } },
      { id: 2, email: "alan@example.com", age: 41, country: "UK", profile: { name: "Alan Turing", active: false } },
      { id: 3, email: "grace@example.com", age: 17, country: "US", profile: { name: "Grace Hopper", active: true } },
      { id: 4, email: "linus@example.com", age: 28, country: "FI", profile: { name: "Linus Torvalds", active: true } },
      { id: 5, email: "margaret@example.com", age: 33, country: "US", profile: { name: "Margaret Hamilton", active: true } },
    ],
  },
  null,
  2,
);

// Starts with empty stages so the placeholders show how to fill them in.
export const defaultPipeline: Stage[] = [
  { id: "path", kind: "path", expr: "" },
  { id: "where", kind: "where", expr: "" },
  { id: "select", kind: "select", expr: "" },
];

export const samplePipeline: Stage[] = [
  { id: "path", kind: "path", expr: "$.users[*]" },
  { id: "where", kind: "where", expr: "age > 18" },
  { id: "select", kind: "select", expr: "id, email, profile.name" },
];
