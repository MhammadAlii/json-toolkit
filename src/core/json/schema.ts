import { jsonKind } from "@/core/json/describe";
import { isPlainObject, type PathSegment } from "@/core/json/path";

// JSON Schema validator for the core keywords of drafts 2020-12, 2019-09 and 07. Local $ref,
// $anchor and $id references are supported; remote references are reported as schema errors.

export type SchemaErrorCategory = "Type Mismatch" | "Required" | "Additional Property" | "Format" | "Value" | "Composition" | "Constraint";

export type SchemaError = { path: PathSegment[]; keyword: string; category: SchemaErrorCategory; message: string };

export class SchemaDefinitionError extends Error {}

type Schema = boolean | Record<string, unknown>;

type Evaluated = { props: Set<string>; allProps: boolean; items: Set<number>; allItems: boolean };

type Outcome = { errors: SchemaError[]; evaluated: Evaluated };

const empty = (): Evaluated => ({ props: new Set(), allProps: false, items: new Set(), allItems: false });

function merge(into: Evaluated, from: Evaluated) {
  from.props.forEach((p) => into.props.add(p));
  from.items.forEach((i) => into.items.add(i));
  into.allProps ||= from.allProps;
  into.allItems ||= from.allItems;
}

const categories: Record<string, SchemaErrorCategory> = {
  type: "Type Mismatch",
  required: "Required",
  dependentRequired: "Required",
  dependencies: "Required",
  additionalProperties: "Additional Property",
  unevaluatedProperties: "Additional Property",
  additionalItems: "Additional Property",
  unevaluatedItems: "Additional Property",
  format: "Format",
  enum: "Value",
  const: "Value",
  anyOf: "Composition",
  oneOf: "Composition",
  not: "Composition",
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const show = (v: unknown) => {
  const s = JSON.stringify(v);
  return s.length > 40 ? `${s.slice(0, 37)}…` : s;
};

function typeOf(v: unknown): string {
  const kind = jsonKind(v);
  return kind === "number" && Number.isInteger(v) ? "integer" : kind;
}

function matchesType(v: unknown, type: string) {
  const actual = typeOf(v);
  return actual === type || (type === "number" && actual === "integer") || (type === "integer" && typeof v === "number" && Number.isInteger(v));
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  if (isPlainObject(a) && isPlainObject(b)) {
    const ka = Object.keys(a);
    return ka.length === Object.keys(b).length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
  }
  return false;
}

const formats: Record<string, (s: string) => boolean> = {
  email: (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
  "idn-email": (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
  date: (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s),
  time: (s) => /^([01]\d|2[0-3]):[0-5]\d:([0-5]\d|60)(\.\d+)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/i.test(s),
  "date-time": (s) =>
    /^\d{4}-\d{2}-\d{2}[Tt ]([01]\d|2[0-3]):[0-5]\d:([0-5]\d|60)(\.\d+)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/i.test(s) && !Number.isNaN(Date.parse(s)),
  uri: (s) => /^[a-z][a-z\d+.-]*:[^\s]*$/i.test(s),
  "uri-reference": (s) => !/\s/.test(s),
  ipv4: (s) => /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/.test(s),
  ipv6: (s) => {
    if (!/^[\da-f:.]+$/i.test(s) || !s.includes(":")) return false;
    try {
      new URL(`http://[${s}]`);
      return true;
    } catch {
      return false;
    }
  },
  uuid: (s) => /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(s),
  hostname: (s) => s.length <= 253 && /^(?=.{1,253}$)([a-z\d]([a-z\d-]{0,61}[a-z\d])?)(\.[a-z\d]([a-z\d-]{0,61}[a-z\d])?)*$/i.test(s),
  regex: (s) => {
    try {
      new RegExp(s, "u");
      return true;
    } catch {
      return false;
    }
  },
};

function regex(pattern: string): RegExp {
  try {
    return new RegExp(pattern, "u");
  } catch {
    throw new SchemaDefinitionError(`Invalid pattern ${show(pattern)}`);
  }
}

function pointer(root: unknown, fragment: string): unknown {
  let node = root;
  for (const raw of fragment.split("/").slice(1)) {
    const key = decodeURIComponent(raw).replace(/~1/g, "/").replace(/~0/g, "~");
    if (Array.isArray(node)) node = node[Number(key)];
    else if (isPlainObject(node) && Object.prototype.hasOwnProperty.call(node, key)) node = node[key];
    else return undefined;
  }
  return node;
}

export type SchemaValidation = { errors: SchemaError[]; truncated: boolean };

/** Validates `data` against `schema`; throws SchemaDefinitionError for schemas that can't be used. */
export function validateSchema(schema: unknown, data: unknown, maxErrors = 200): SchemaValidation {
  if (typeof schema !== "boolean" && !isPlainObject(schema)) throw new SchemaDefinitionError("A schema must be an object or a boolean");

  const ids = new Map<string, Schema>();
  const anchors = new Map<string, Schema>();
  const collect = (node: unknown) => {
    if (Array.isArray(node)) node.forEach(collect);
    else if (isPlainObject(node)) {
      if (typeof node.$id === "string") {
        if (node.$id.startsWith("#")) anchors.set(node.$id.slice(1), node);
        else ids.set(node.$id.split("#")[0], node);
      }
      if (typeof node.$anchor === "string") anchors.set(node.$anchor, node);
      if (typeof node.$dynamicAnchor === "string") anchors.set(node.$dynamicAnchor, node);
      Object.values(node).forEach(collect);
    }
  };
  collect(schema);

  const resolve = (ref: string): Schema => {
    const [uri, fragment = ""] = ref.split("#");
    let base: unknown = schema;
    if (uri) {
      const match = ids.get(uri) ?? [...ids.entries()].find(([id]) => id.endsWith(`/${uri}`) || id === uri)?.[1];
      if (!match) throw new SchemaDefinitionError(`Can't resolve $ref ${show(ref)}: remote schemas aren't supported`);
      base = match;
    }
    const target = fragment === "" ? base : fragment.startsWith("/") ? pointer(base, fragment) : anchors.get(fragment);
    if (typeof target !== "boolean" && !isPlainObject(target)) throw new SchemaDefinitionError(`Can't resolve $ref ${show(ref)}`);
    return target;
  };

  const active = new Set<string>();

  const run = (s: Schema, v: unknown, path: PathSegment[]): Outcome => {
    const errors: SchemaError[] = [];
    const evaluated = empty();
    const fail = (keyword: string, message: string, at: PathSegment[] = path) => {
      errors.push({ path: at, keyword, category: categories[keyword] ?? "Constraint", message });
    };
    if (s === true) return { errors, evaluated };
    if (s === false) {
      fail("false", "No value is allowed here.");
      return { errors, evaluated };
    }

    const sub = (schemaAt: unknown, value: unknown, at: PathSegment[]): Outcome => {
      if (typeof schemaAt !== "boolean" && !isPlainObject(schemaAt)) throw new SchemaDefinitionError(`Expected a schema at ${show(schemaAt)}`);
      return run(schemaAt, value, at);
    };
    const absorb = (o: Outcome) => {
      errors.push(...o.errors);
      if (o.errors.length === 0) merge(evaluated, o.evaluated);
    };

    for (const refKey of ["$ref", "$dynamicRef", "$recursiveRef"] as const) {
      const ref = s[refKey];
      if (typeof ref !== "string") continue;
      const target = resolve(refKey === "$recursiveRef" ? "#" : ref);
      const guard = `${ref}@${JSON.stringify(path)}`;
      if (active.has(guard)) throw new SchemaDefinitionError(`Circular $ref ${show(ref)} never reaches a value`);
      active.add(guard);
      try {
        absorb(run(target, v, path));
      } finally {
        active.delete(guard);
      }
    }

    if (s.type !== undefined) {
      const types = (Array.isArray(s.type) ? s.type : [s.type]) as string[];
      if (!types.some((t) => matchesType(v, t))) fail("type", `Expected ${types.join(" or ")}, but received ${typeOf(v)}.`);
    }
    if (Array.isArray(s.enum) && !s.enum.some((e) => deepEqual(e, v))) {
      fail("enum", `Should be one of ${s.enum.slice(0, 6).map(show).join(", ")}${s.enum.length > 6 ? ", …" : ""}.`);
    }
    if ("const" in s && !deepEqual(s.const, v)) fail("const", `Should be exactly ${show(s.const)}.`);

    if (typeof v === "number") {
      const n = (k: string) => (typeof s[k] === "number" ? (s[k] as number) : undefined);
      const min = n("minimum");
      const max = n("maximum");
      if (min !== undefined && (s.exclusiveMinimum === true ? v <= min : v < min)) fail("minimum", `Should be ${s.exclusiveMinimum === true ? "greater than" : "at least"} ${min}, but is ${v}.`);
      if (max !== undefined && (s.exclusiveMaximum === true ? v >= max : v > max)) fail("maximum", `Should be ${s.exclusiveMaximum === true ? "less than" : "at most"} ${max}, but is ${v}.`);
      const xmin = n("exclusiveMinimum");
      const xmax = n("exclusiveMaximum");
      if (xmin !== undefined && v <= xmin) fail("exclusiveMinimum", `Should be greater than ${xmin}, but is ${v}.`);
      if (xmax !== undefined && v >= xmax) fail("exclusiveMaximum", `Should be less than ${xmax}, but is ${v}.`);
      const step = n("multipleOf");
      if (step !== undefined && step > 0) {
        const q = v / step;
        if (Math.abs(q - Math.round(q)) > 1e-9) fail("multipleOf", `Should be a multiple of ${step}.`);
      }
    }

    if (typeof v === "string") {
      const length = [...v].length;
      if (typeof s.minLength === "number" && length < s.minLength) fail("minLength", `Should have at least ${plural(s.minLength, "character")}, but has ${length}.`);
      if (typeof s.maxLength === "number" && length > s.maxLength) fail("maxLength", `Should have at most ${plural(s.maxLength, "character")}, but has ${length}.`);
      if (typeof s.pattern === "string" && !regex(s.pattern).test(v)) fail("pattern", `Should match the pattern /${s.pattern}/.`);
      if (typeof s.format === "string" && formats[s.format] && !formats[s.format](v)) fail("format", `Should be a valid ${s.format}.`);
    }

    if (Array.isArray(v)) {
      if (typeof s.minItems === "number" && v.length < s.minItems) fail("minItems", `Should have at least ${plural(s.minItems, "item")}, but found ${v.length}.`);
      if (typeof s.maxItems === "number" && v.length > s.maxItems) fail("maxItems", `Should have at most ${plural(s.maxItems, "item")}, but found ${v.length}.`);
      if (s.uniqueItems === true) {
        outer: for (let i = 0; i < v.length; i++) {
          for (let j = i + 1; j < v.length; j++) {
            if (deepEqual(v[i], v[j])) {
              fail("uniqueItems", `Items ${i} and ${j} are identical; all items should be unique.`);
              break outer;
            }
          }
        }
      }
      // Draft-07 tuples use an items array; 2020-12 uses prefixItems with items for the rest.
      const prefix = Array.isArray(s.prefixItems) ? s.prefixItems : Array.isArray(s.items) ? s.items : [];
      const rest = Array.isArray(s.items) ? s.additionalItems : s.items;
      const restKeyword = Array.isArray(s.items) ? "additionalItems" : "items";
      prefix.forEach((p, i) => {
        if (i < v.length) {
          absorb(sub(p, v[i], [...path, i]));
          evaluated.items.add(i);
        }
      });
      if (rest !== undefined) {
        for (let i = prefix.length; i < v.length; i++) {
          if (rest === false) fail(restKeyword, `The array should have at most ${plural(prefix.length, "item")}.`, [...path, i]);
          else absorb(sub(rest, v[i], [...path, i]));
        }
        evaluated.allItems = true;
      }
      if (s.contains !== undefined) {
        const matches = v.map((item, i) => [i, sub(s.contains, item, [...path, i]).errors.length === 0] as const).filter(([, ok]) => ok);
        matches.forEach(([i]) => evaluated.items.add(i));
        const min = typeof s.minContains === "number" ? s.minContains : 1;
        if (matches.length < min) fail("contains", `Should contain at least ${plural(min, "matching item")}, but found ${matches.length}.`);
        if (typeof s.maxContains === "number" && matches.length > s.maxContains) fail("maxContains", `Should contain at most ${plural(s.maxContains, "matching item")}, but found ${matches.length}.`);
      }
    }

    if (isPlainObject(v)) {
      const keys = Object.keys(v);
      if (typeof s.minProperties === "number" && keys.length < s.minProperties) fail("minProperties", `Should have at least ${plural(s.minProperties, "property")}, but has ${keys.length}.`);
      if (typeof s.maxProperties === "number" && keys.length > s.maxProperties) fail("maxProperties", `Should have at most ${plural(s.maxProperties, "property")}, but has ${keys.length}.`);
      if (Array.isArray(s.required)) for (const k of s.required as string[]) if (!(k in v)) fail("required", "Required property is missing.", [...path, k]);

      const props = isPlainObject(s.properties) ? s.properties : {};
      const patterns = isPlainObject(s.patternProperties) ? Object.entries(s.patternProperties).map(([p, ps]) => [regex(p), ps] as const) : [];
      for (const k of keys) {
        let matched = false;
        if (Object.prototype.hasOwnProperty.call(props, k)) {
          absorb(sub(props[k], v[k], [...path, k]));
          matched = true;
        }
        for (const [re, ps] of patterns) {
          if (re.test(k)) {
            absorb(sub(ps, v[k], [...path, k]));
            matched = true;
          }
        }
        if (matched) evaluated.props.add(k);
        else if (s.additionalProperties !== undefined) {
          if (s.additionalProperties === false) fail("additionalProperties", "This property isn't allowed by the schema.", [...path, k]);
          else absorb(sub(s.additionalProperties, v[k], [...path, k]));
          evaluated.props.add(k);
        }
      }
      if (s.propertyNames !== undefined) {
        for (const k of keys) if (sub(s.propertyNames, k, [...path, k]).errors.length) fail("propertyNames", `Property name ${show(k)} isn't allowed.`, [...path, k]);
      }
      const depRequired = isPlainObject(s.dependentRequired) ? s.dependentRequired : {};
      const depSchemas = isPlainObject(s.dependentSchemas) ? s.dependentSchemas : {};
      if (isPlainObject(s.dependencies)) {
        for (const [k, d] of Object.entries(s.dependencies)) (Array.isArray(d) ? depRequired : depSchemas)[k] = d;
      }
      for (const [k, needed] of Object.entries(depRequired)) {
        if (k in v && Array.isArray(needed)) for (const n of needed as string[]) if (!(n in v)) fail("dependentRequired", `Required when ${show(k)} is present.`, [...path, n]);
      }
      for (const [k, ds] of Object.entries(depSchemas)) if (k in v) absorb(sub(ds, v, path));
    }

    if (Array.isArray(s.allOf)) s.allOf.forEach((a) => absorb(sub(a, v, path)));
    for (const keyword of ["anyOf", "oneOf"] as const) {
      const branches = s[keyword];
      if (!Array.isArray(branches)) continue;
      const outcomes = branches.map((b) => sub(b, v, path));
      const passing = outcomes.filter((o) => o.errors.length === 0);
      passing.forEach((o) => merge(evaluated, o.evaluated));
      if (passing.length === 0) {
        fail(keyword, keyword === "anyOf" ? "Should match at least one of the allowed schemas." : "Should match exactly one of the allowed schemas, but matches none.");
        // The closest branch usually explains what's wrong.
        errors.push(...outcomes.reduce((best, o) => (o.errors.length < best.errors.length ? o : best)).errors);
      } else if (keyword === "oneOf" && passing.length > 1) {
        fail("oneOf", `Should match exactly one of the allowed schemas, but matches ${passing.length}.`);
      }
    }
    if (s.not !== undefined && sub(s.not, v, path).errors.length === 0) fail("not", "Should not match the disallowed schema.");
    if (s.if !== undefined) {
      const condition = sub(s.if, v, path);
      if (condition.errors.length === 0) {
        merge(evaluated, condition.evaluated);
        if (s.then !== undefined) absorb(sub(s.then, v, path));
      } else if (s.else !== undefined) absorb(sub(s.else, v, path));
    }

    if (isPlainObject(v) && s.unevaluatedProperties !== undefined && !evaluated.allProps) {
      for (const k of Object.keys(v)) {
        if (evaluated.props.has(k)) continue;
        if (s.unevaluatedProperties === false) fail("unevaluatedProperties", "This property isn't allowed by the schema.", [...path, k]);
        else absorb(sub(s.unevaluatedProperties, v[k], [...path, k]));
      }
      evaluated.allProps = true;
    }
    if (Array.isArray(v) && s.unevaluatedItems !== undefined && !evaluated.allItems) {
      v.forEach((item, i) => {
        if (evaluated.items.has(i)) return;
        if (s.unevaluatedItems === false) fail("unevaluatedItems", "This item isn't allowed by the schema.", [...path, i]);
        else absorb(sub(s.unevaluatedItems, item, [...path, i]));
      });
      evaluated.allItems = true;
    }

    return { errors, evaluated };
  };

  const { errors } = run(schema as Schema, data, []);
  return { errors: errors.slice(0, maxErrors), truncated: errors.length > maxErrors };
}
