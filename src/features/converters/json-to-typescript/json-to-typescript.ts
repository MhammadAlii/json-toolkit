import { fromParse, type TransformResult } from "@/core/json/parse";

function pascal(s: string): string {
  const cleaned = s.replace(/[^A-Za-z0-9]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ""));
  const name = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return /^[A-Za-z_]/.test(name) ? name : `T${name}`;
}

function tsKey(k: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
}

export function jsonToTypeScript(input: string, rootName = "Root"): TransformResult {
  return fromParse(input, (value) => {
    const interfaces: string[] = [];
    const used = new Set<string>();

    const uniqueName = (base: string) => {
      let name = pascal(base) || "Item";
      for (let i = 2; used.has(name); i++) name = `${pascal(base)}${i}`;
      used.add(name);
      return name;
    };

    const typeOf = (v: unknown, nameHint: string): string => {
      if (v === null) return "null";
      if (Array.isArray(v)) {
        if (v.length === 0) return "unknown[]";
        const objects = v.filter((x) => x && typeof x === "object" && !Array.isArray(x)) as Record<string, unknown>[];
        const types = new Set<string>();
        if (objects.length) types.add(objectType(mergeObjects(objects), singular(nameHint), objects));
        for (const x of v) if (!(x && typeof x === "object" && !Array.isArray(x))) types.add(typeOf(x, nameHint));
        const inner = [...types].join(" | ");
        return types.size > 1 ? `(${inner})[]` : `${inner}[]`;
      }
      if (typeof v === "object") return objectType(v as Record<string, unknown>, nameHint, [v as Record<string, unknown>]);
      return typeof v;
    };

    const objectType = (obj: Record<string, unknown>, nameHint: string, samples: Record<string, unknown>[]) => {
      const name = uniqueName(nameHint);
      const lines = Object.entries(obj).map(([k, v]) => {
        const optional = samples.some((s) => !(k in s)) ? "?" : "";
        return `  ${tsKey(k)}${optional}: ${typeOf(v, k)};`;
      });
      interfaces.push(`export interface ${name} {\n${lines.join("\n")}\n}`);
      return name;
    };

    const root = typeOf(value, rootName);
    const output = interfaces.reverse().join("\n\n");
    const isInterface = value && typeof value === "object" && !Array.isArray(value);
    return {
      ok: true,
      output: isInterface ? output : `${output ? `${output}\n\n` : ""}export type ${pascal(rootName)} = ${root};`,
    };
  });
}

function singular(name: string): string {
  if (/ies$/i.test(name)) return name.slice(0, -3) + "y";
  if (/s$/i.test(name) && !/ss$/i.test(name)) return name.slice(0, -1);
  return `${name}Item`;
}

function mergeObjects(objects: Record<string, unknown>[]): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const o of objects) for (const [k, v] of Object.entries(o)) if (!(k in merged) || merged[k] === null) merged[k] = v;
  return merged;
}
