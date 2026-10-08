export type PathSegment = string | number;

export function formatPath(segments: PathSegment[], root = "$"): string {
  return segments.reduce<string>((path, s) => {
    if (typeof s === "number") return `${path}[${s}]`;
    return /^[A-Za-z_$][\w$]*$/.test(s) ? `${path}.${s}` : `${path}[${JSON.stringify(s)}]`;
  }, root);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function valueAtPath(value: unknown, segments: PathSegment[]): unknown {
  let current = value;
  for (const s of segments) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string | number, unknown>)[s];
  }
  return current;
}

export function samePath(a: PathSegment[], b: PathSegment[]): boolean {
  return a.length === b.length && a.every((s, i) => s === b[i]);
}
