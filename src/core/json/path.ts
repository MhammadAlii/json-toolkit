export type PathSegment = string | number;

export function formatPath(segments: PathSegment[]): string {
  return segments.reduce<string>((path, s) => {
    if (typeof s === "number") return `${path}[${s}]`;
    return /^[A-Za-z_$][\w$]*$/.test(s) ? `${path}.${s}` : `${path}[${JSON.stringify(s)}]`;
  }, "$");
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
