import { isPlainObject } from "@/core/json/path";

export type JsonStats = { keys: number; depth: number; arrays: number; objects: number };

/** Counts keys, objects and arrays, and how many container levels deep the value goes. */
export function jsonStats(value: unknown): JsonStats {
  const stats: JsonStats = { keys: 0, depth: 0, arrays: 0, objects: 0 };
  const stack: [unknown, number][] = [[value, 1]];
  while (stack.length) {
    const [v, level] = stack.pop()!;
    if (Array.isArray(v)) {
      stats.arrays++;
      stats.depth = Math.max(stats.depth, level);
      for (const item of v) stack.push([item, level + 1]);
    } else if (isPlainObject(v)) {
      stats.objects++;
      stats.depth = Math.max(stats.depth, level);
      const keys = Object.keys(v);
      stats.keys += keys.length;
      for (const k of keys) stack.push([v[k], level + 1]);
    }
  }
  return stats;
}
