import { fromParse, type TransformResult } from "@/core/json/parse";
import { isPlainObject } from "@/core/json/path";

export type SqlDialect = "mysql" | "postgresql" | "sqlite";

export type SqlOptions = { table: string; dialect: SqlDialect; createTable: boolean };

const defaults: SqlOptions = { table: "my_table", dialect: "postgresql", createTable: true };

function ident(name: string, dialect: SqlDialect): string {
  return dialect === "mysql" ? `\`${name.replace(/`/g, "``")}\`` : `"${name.replace(/"/g, '""')}"`;
}

function literal(value: unknown, dialect: SqlDialect): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return dialect === "sqlite" ? (value ? "1" : "0") : value ? "TRUE" : "FALSE";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `'${text.replace(/'/g, "''")}'`;
}

function columnType(values: unknown[], dialect: SqlDialect): string {
  const present = values.filter((v) => v !== null && v !== undefined);
  if (present.length === 0) return "TEXT";
  if (present.every((v) => typeof v === "boolean")) return dialect === "sqlite" ? "INTEGER" : "BOOLEAN";
  if (present.every((v) => Number.isInteger(v))) return dialect === "sqlite" ? "INTEGER" : "BIGINT";
  if (present.every((v) => typeof v === "number")) return dialect === "postgresql" ? "DOUBLE PRECISION" : dialect === "mysql" ? "DOUBLE" : "REAL";
  if (present.every((v) => typeof v === "object")) return dialect === "postgresql" ? "JSONB" : dialect === "mysql" ? "JSON" : "TEXT";
  return "TEXT";
}

export function jsonToSql(input: string, options: Partial<SqlOptions> = {}): TransformResult {
  const { table, dialect, createTable } = { ...defaults, ...options };
  return fromParse(input, (value) => {
    const rows = Array.isArray(value) ? value : [value];
    if (!rows.length || !rows.every(isPlainObject)) {
      return { ok: false, error: "Expected an object or an array of objects." };
    }
    const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))];
    if (!columns.length) return { ok: false, error: "The objects have no keys to use as columns." };

    const t = ident(table || "my_table", dialect);
    const statements: string[] = [];
    if (createTable) {
      const defs = columns.map((c) => `  ${ident(c, dialect)} ${columnType(rows.map((r) => r[c]), dialect)}`);
      statements.push(`CREATE TABLE ${t} (\n${defs.join(",\n")}\n);`);
    }
    const values = rows.map((r) => `  (${columns.map((c) => literal(r[c], dialect)).join(", ")})`);
    statements.push(`INSERT INTO ${t} (${columns.map((c) => ident(c, dialect)).join(", ")}) VALUES\n${values.join(",\n")};`);
    return { ok: true, output: statements.join("\n\n"), note: `${rows.length} row(s), ${columns.length} column(s).` };
  });
}
