import { isPlainObject } from "@/core/json/path";

export type TsOptions = {
  rootName: string;
  declaration: "interface" | "type";
  arrayStyle: "brackets" | "generic";
  exported: boolean;
  readonly: boolean;
  /** Mark every property optional, not just the ones missing from some array items. */
  allOptional: boolean;
  /** `union` writes `T | null`; `optional` makes null-valued properties optional instead. */
  nulls: "union" | "optional";
  /** The type used where nothing is known, such as items of an empty array. */
  unknownType: "unknown" | "any";
  /** `separate` gives nested objects their own named types; `inline` writes them in place. */
  nested: "separate" | "inline";
  sortProperties: boolean;
  /** Add a JSDoc comment with an example value, noting dates, UUIDs, emails and URLs. */
  comments: boolean;
};

export const defaultTsOptions: TsOptions = {
  rootName: "Root",
  declaration: "interface",
  arrayStyle: "brackets",
  exported: true,
  readonly: false,
  allOptional: false,
  nulls: "union",
  unknownType: "unknown",
  nested: "separate",
  sortProperties: false,
  comments: false,
};

type Field = { type: Shape; optional: boolean; example?: unknown };
type Shape =
  | { kind: "string" | "number" | "boolean" | "null" | "unknown" }
  | { kind: "array"; of: Shape }
  | { kind: "object"; fields: Map<string, Field>; hint: string }
  | { kind: "union"; types: Shape[] };

const pascal = (s: string) =>
  s
    .replace(/[^A-Za-z0-9]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ""))
    .replace(/^[a-z]/, (c) => c.toUpperCase())
    .replace(/^(\d)/, "T$1") || "Type";

// users → User, categories → Category, addresses → Address; short or irregular words stay as they are.
function singular(s: string): string {
  if (/ies$/i.test(s) && s.length > 4) return s.slice(0, -3) + "y";
  if (/(ss|us|is)$/i.test(s)) return s;
  if (/(ch|sh|x|z|ses)es$/i.test(s)) return s.slice(0, -2);
  if (/s$/i.test(s) && s.length > 3) return s.slice(0, -1);
  return s;
}

function infer(value: unknown, hint: string): Shape {
  if (value === null) return { kind: "null" };
  if (Array.isArray(value)) {
    const items = value.map((v) => infer(v, singular(hint)));
    return { kind: "array", of: items.length ? items.reduce(merge) : { kind: "unknown" } };
  }
  if (isPlainObject(value)) {
    const fields = new Map<string, Field>();
    for (const [k, v] of Object.entries(value)) fields.set(k, { type: infer(v, k), optional: false, example: v });
    return { kind: "object", fields, hint };
  }
  return { kind: typeof value as "string" | "number" | "boolean" };
}

const members = (s: Shape): Shape[] => (s.kind === "union" ? s.types : [s]);

// Combines two observed shapes into one that accepts both; keys missing on one side become optional.
function merge(a: Shape, b: Shape): Shape {
  if (a.kind === "unknown") return b;
  if (b.kind === "unknown") return a;
  if (a.kind === "object" && b.kind === "object") {
    const fields = new Map<string, Field>();
    for (const [k, f] of a.fields) {
      const other = b.fields.get(k);
      fields.set(k, other ? { type: merge(f.type, other.type), optional: f.optional || other.optional, example: f.example ?? other.example } : { ...f, optional: true });
    }
    for (const [k, f] of b.fields) if (!a.fields.has(k)) fields.set(k, { ...f, optional: true });
    return { kind: "object", fields, hint: a.hint };
  }
  if (a.kind === "array" && b.kind === "array") return { kind: "array", of: merge(a.of, b.of) };
  if (a.kind === b.kind && a.kind !== "union") return a;
  // Merge into an existing union member of the same kind (two objects, two arrays) or add a new member.
  const out = [...members(a)];
  for (const t of members(b)) {
    const i = out.findIndex((m) => m.kind === t.kind);
    if (i === -1) out.push(t);
    else out[i] = merge(out[i], t);
  }
  return out.length === 1 ? out[0] : { kind: "union", types: out };
}

const identifier = /^[A-Za-z_$][\w$]*$/;
const propName = (k: string) => (identifier.test(k) ? k : JSON.stringify(k));

function formatNote(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  if (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(v)) return "ISO 8601 date";
  if (/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(v)) return "UUID";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Email address";
  if (/^https?:\/\//.test(v)) return "URL";
  return undefined;
}

export type TypeMapRow = { type: string; property: string; tsType: string; optional: boolean };

export type TsResult = { code: string; typeMap: TypeMapRow[]; types: number; properties: number; optionalFields: number; unionTypes: number };

/** Generates TypeScript types that the given JSON value satisfies. */
export function jsonToTypeScript(value: unknown, options: TsOptions = defaultTsOptions): TsResult {
  const o = options;
  const rootName = pascal(o.rootName.trim() || "Root");
  const declared: { name: string; shape: Extract<Shape, { kind: "object" }>; signature: string }[] = [];
  const typeMap: TypeMapRow[] = [];
  let unionTypes = 0;

  const usedNames = new Set<string>();
  const uniqueName = (base: string) => {
    let name = base;
    for (let n = 2; usedNames.has(name); n++) name = `${base}${n}`;
    usedNames.add(name);
    return name;
  };

  const signatureOf = (s: Shape): string => {
    switch (s.kind) {
      case "array":
        return `${signatureOf(s.of)}[]`;
      case "union":
        return s.types.map(signatureOf).sort().join("|");
      case "object":
        return `{${[...s.fields].map(([k, f]) => `${k}${f.optional ? "?" : ""}:${signatureOf(f.type)}`).sort().join(",")}}`;
      default:
        return s.kind;
    }
  };

  const nullable = (s: Shape) => members(s).some((m) => m.kind === "null");
  const withoutNull = (s: Shape): Shape => {
    const rest = members(s).filter((m) => m.kind !== "null");
    return rest.length === 0 ? { kind: "null" } : rest.length === 1 ? rest[0] : { kind: "union", types: rest };
  };

  const arrayOf = (inner: string, compound: boolean) => (o.arrayStyle === "generic" ? `Array<${inner}>` : compound ? `(${inner})[]` : `${inner}[]`);

  // Returns the TypeScript for a shape, declaring named types for nested objects as it goes.
  const render = (s: Shape, indent: string, name?: string): string => {
    switch (s.kind) {
      case "unknown":
        return o.unknownType;
      case "array": {
        const inner = render(s.of, indent);
        return arrayOf(inner, s.of.kind === "union" && inner.includes("|"));
      }
      case "union": {
        unionTypes++;
        return s.types.map((t) => render(t, indent)).join(" | ");
      }
      case "object": {
        if (s.fields.size === 0) return `Record<string, ${o.unknownType}>`;
        if (o.nested === "inline" && name === undefined) return body(s, indent);
        const signature = signatureOf(s);
        const existing = declared.find((d) => d.signature === signature);
        if (existing) return existing.name;
        const declaredName = uniqueName(name ?? pascal(s.hint));
        const entry = { name: declaredName, shape: s, signature };
        declared.push(entry);
        return declaredName;
      }
      default:
        return s.kind;
    }
  };

  const body = (s: Extract<Shape, { kind: "object" }>, indent: string, typeName?: string): string => {
    const inner = `${indent}  `;
    let entries = [...s.fields];
    if (o.sortProperties) entries = entries.sort(([a], [b]) => a.localeCompare(b));
    const lines = entries.map(([k, f]) => {
      const dropNull = o.nulls === "optional" && nullable(f.type);
      const t = render(dropNull ? withoutNull(f.type) : f.type, inner);
      const optional = o.allOptional || f.optional || dropNull;
      if (typeName) typeMap.push({ type: typeName, property: k, tsType: t, optional });
      const note = o.comments && f.example !== undefined && typeof f.example !== "object" ? ` e.g. ${JSON.stringify(f.example).slice(0, 60)}${formatNote(f.example) ? ` (${formatNote(f.example)})` : ""}` : "";
      const doc = note ? `${inner}/**${note} */\n` : "";
      return `${doc}${inner}${o.readonly ? "readonly " : ""}${propName(k)}${optional ? "?" : ""}: ${t};`;
    });
    return `{\n${lines.join("\n")}\n${indent}}`;
  };

  const exp = o.exported ? "export " : "";
  const rootShape = infer(value, rootName);
  const blocks: string[] = [];

  // The root is always declared by name, whatever its shape.
  if (rootShape.kind === "object" && rootShape.fields.size > 0) {
    usedNames.add(rootName);
    declared.push({ name: rootName, shape: rootShape, signature: signatureOf(rootShape) });
  } else {
    usedNames.add(rootName);
    blocks.push(`${exp}type ${rootName} = ${render(rootShape, "", undefined)};`);
  }

  // Declare queued object types; rendering one can queue more, so loop until none are left.
  for (let i = 0; i < declared.length; i++) {
    const { name, shape } = declared[i];
    const text = body(shape, "", name);
    blocks.splice(i === 0 && rootShape.kind === "object" ? 0 : blocks.length, 0, o.declaration === "interface" ? `${exp}interface ${name} ${text}` : `${exp}type ${name} = ${text};`);
  }

  const optionalFields = typeMap.filter((r) => r.optional).length;
  return { code: blocks.join("\n\n"), typeMap, types: blocks.length, properties: typeMap.length, optionalFields, unionTypes };
}
