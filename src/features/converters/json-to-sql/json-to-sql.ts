import { isPlainObject } from "@/core/json/path";

export type SqlDialect = "postgres" | "mysql" | "sqlite" | "sqlserver";

export type SqlOptions = {
  dialect: SqlDialect;
  operation: "insert" | "upsert" | "update";
  table: string;
  /** Column used to match rows for upsert and update, and the primary key in CREATE TABLE. */
  primaryKey: string;
  /** Rows per INSERT statement; 1 writes one statement per row. */
  batchSize: number;
  transaction: boolean;
  createTable: boolean;
  /** Skip rows whose primary key already exists (INSERT only). */
  ignoreDuplicates: boolean;
  /** Nested objects: stored as a JSON column, flattened into `parent_child` columns, or left out. */
  nested: "json" | "flatten" | "ignore";
  /** Arrays: stored as a JSON column or left out. */
  arrays: "json" | "ignore";
  /** `auto` quotes identifiers only when needed; `always` quotes every one. */
  quoting: "auto" | "always";
  booleans: "keywords" | "numbers";
};

export const defaultSqlOptions: SqlOptions = {
  dialect: "postgres",
  operation: "insert",
  table: "users",
  primaryKey: "id",
  batchSize: 100,
  transaction: false,
  createTable: false,
  ignoreDuplicates: false,
  nested: "json",
  arrays: "json",
  quoting: "auto",
  booleans: "keywords",
};

export const dialects: { value: SqlDialect; label: string }[] = [
  { value: "postgres", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "sqlserver", label: "SQL Server" },
];

type Kind = "integer" | "bigint" | "real" | "boolean" | "date" | "timestamp" | "text" | "json";

export type SqlColumn = { key: string; name: string; kind: Kind; sqlType: string; nullable: boolean; maxLength: number };

export type SqlResult =
  | { ok: true; sql: string; columns: SqlColumn[]; rows: number; statements: number; notes: string[]; suggestions: { key: string; rows: number }[] }
  | { ok: false; error: string; suggestions: { key: string; rows: number }[] };

const reserved = new Set(
  "add all alter and as asc between by case check column constraint create cross current date default delete desc distinct drop else end exists false fetch for foreign from full grant group having in index inner insert into is join key left like limit not null offset on or order outer primary references right row select set table then to top true union unique update user using values view when where with".split(" "),
);

const isRecords = (v: unknown): v is Record<string, unknown>[] => Array.isArray(v) && v.length > 0 && v.every(isPlainObject);

function quoteIdent(name: string, o: SqlOptions): string {
  const simple = /^[a-z_][a-z0-9_]*$/.test(name) && !reserved.has(name);
  if (o.quoting === "auto" && simple) return name;
  if (o.dialect === "mysql") return `\`${name.replace(/`/g, "``")}\``;
  if (o.dialect === "sqlserver") return `[${name.replace(/]/g, "]]")}]`;
  return `"${name.replace(/"/g, '""')}"`;
}

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const isoTimestamp = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/;

function kindOf(v: unknown): Kind | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "boolean") return "boolean";
  if (typeof v === "number") return Number.isInteger(v) ? (Math.abs(v) > 2147483647 ? "bigint" : "integer") : "real";
  if (typeof v === "string") return isoDate.test(v) ? "date" : isoTimestamp.test(v) ? "timestamp" : "text";
  return "json";
}

// Picks one column type that can hold every value seen in the column.
function widen(a: Kind | null, b: Kind | null): Kind | null {
  if (!a) return b;
  if (!b || a === b) return a;
  const numeric: Kind[] = ["integer", "bigint", "real"];
  if (numeric.includes(a) && numeric.includes(b)) return numeric[Math.max(numeric.indexOf(a), numeric.indexOf(b))];
  if ((a === "date" && b === "timestamp") || (a === "timestamp" && b === "date")) return "timestamp";
  return a === "json" || b === "json" ? "json" : "text";
}

function sqlType(kind: Kind, maxLength: number, d: SqlDialect): string {
  const text = maxLength <= 255;
  const types: Record<SqlDialect, Record<Kind, string>> = {
    postgres: { integer: "INTEGER", bigint: "BIGINT", real: "DOUBLE PRECISION", boolean: "BOOLEAN", date: "DATE", timestamp: "TIMESTAMP", text: text ? "VARCHAR(255)" : "TEXT", json: "JSONB" },
    mysql: { integer: "INT", bigint: "BIGINT", real: "DOUBLE", boolean: "BOOLEAN", date: "DATE", timestamp: "DATETIME", text: text ? "VARCHAR(255)" : "TEXT", json: "JSON" },
    sqlite: { integer: "INTEGER", bigint: "INTEGER", real: "REAL", boolean: "INTEGER", date: "TEXT", timestamp: "TEXT", text: "TEXT", json: "TEXT" },
    sqlserver: { integer: "INT", bigint: "BIGINT", real: "FLOAT", boolean: "BIT", date: "DATE", timestamp: "DATETIME2", text: text ? "NVARCHAR(255)" : "NVARCHAR(MAX)", json: "NVARCHAR(MAX)" },
  };
  return types[d][kind];
}

/** Turns a JSON key into a column name: letters, digits and underscores, starting with a letter or underscore. */
export function columnName(key: string): string {
  const name = key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  return /^[a-z_]/.test(name) ? name : `c_${name}`;
}

function flattenRow(row: Record<string, unknown>, o: SqlOptions, prefix = "", out: Record<string, unknown> = {}): Record<string, unknown> {
  for (const [k, v] of Object.entries(row)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) {
      if (o.nested === "flatten") flattenRow(v, o, key, out);
      else if (o.nested === "json") out[key] = v;
    } else if (Array.isArray(v)) {
      if (o.arrays === "json") out[key] = v;
    } else out[key] = v;
  }
  return out;
}

function literal(v: unknown, kind: Kind, o: SqlOptions): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return o.booleans === "numbers" || o.dialect === "sqlserver" || o.dialect === "sqlite" ? (v ? "1" : "0") : v ? "TRUE" : "FALSE";
  if (typeof v === "number" && kind !== "text" && kind !== "json") return String(v);
  let s = typeof v === "string" ? v : JSON.stringify(v);
  s = s.replace(/'/g, "''");
  // MySQL treats backslashes in strings as escapes by default.
  if (o.dialect === "mysql") s = s.replace(/\\/g, "\\\\");
  return o.dialect === "sqlserver" ? `N'${s}'` : `'${s}'`;
}

/** Generates SQL statements that store the JSON rows in a table. */
export function jsonToSql(value: unknown, options: SqlOptions, columnNames: Record<string, string> = {}, rootKey?: string): SqlResult {
  const o = options;
  const suggestions = isPlainObject(value)
    ? Object.entries(value)
        .filter(([, v]) => isRecords(v))
        .map(([key, v]) => ({ key, rows: (v as unknown[]).length }))
    : [];
  const source = rootKey && isPlainObject(value) && Array.isArray(value[rootKey]) ? value[rootKey] : value;
  const items = Array.isArray(source) ? source : [source];
  if (!items.length) return { ok: false, error: "The array is empty, so there are no rows to insert.", suggestions };
  if (!items.every(isPlainObject)) return { ok: false, error: "SQL rows need JSON objects. Use an array of objects, or an object with one row's fields.", suggestions };

  const rows = items.map((r) => flattenRow(r as Record<string, unknown>, o));
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  if (!keys.length) return { ok: false, error: "The objects have no fields to turn into columns.", suggestions };

  const used = new Set<string>();
  const columns: SqlColumn[] = keys.map((key) => {
    let name = columnNames[key]?.trim() ? columnName(columnNames[key]) : columnName(key);
    for (let i = 2; used.has(name); i++) name = `${columnName(key)}_${i}`;
    used.add(name);
    let kind: Kind | null = null;
    let nullable = false;
    let maxLength = 0;
    for (const r of rows) {
      const v = r[key];
      if (v === null || v === undefined) nullable = true;
      kind = widen(kind, kindOf(v));
      if (typeof v === "string") maxLength = Math.max(maxLength, [...v].length);
    }
    const k = kind ?? "text";
    return { key, name, kind: k, sqlType: sqlType(k, maxLength, o.dialect), nullable, maxLength };
  });

  const table = quoteIdent(columnName(o.table || "data"), o);
  const pk = columns.find((c) => c.key === o.primaryKey);
  const notes: string[] = [];
  const statements: string[] = [];
  const colList = columns.map((c) => quoteIdent(c.name, o)).join(", ");
  const tuple = (r: Record<string, unknown>) => `(${columns.map((c) => literal(r[c.key], c.kind, o)).join(", ")})`;

  if (o.createTable) {
    const defs = columns.map((c) => `  ${quoteIdent(c.name, o)} ${c.sqlType}${c === pk ? " PRIMARY KEY" : c.nullable ? "" : " NOT NULL"}`);
    const ifNotExists = o.dialect === "sqlserver" ? "" : "IF NOT EXISTS ";
    statements.push(`CREATE TABLE ${ifNotExists}${table} (\n${defs.join(",\n")}\n);`);
  }

  let operation = o.operation;
  if (operation !== "insert" && !pk) {
    notes.push(`${operation === "upsert" ? "Upsert" : "Update"} needs a primary key column that exists in the data, so plain INSERT statements were written instead.`);
    operation = "insert";
  }
  const others = columns.filter((c) => c !== pk);

  if (operation === "update" && pk) {
    for (const r of rows) {
      if (!others.length) break;
      const set = others.map((c) => `${quoteIdent(c.name, o)} = ${literal(r[c.key], c.kind, o)}`).join(", ");
      statements.push(`UPDATE ${table} SET ${set} WHERE ${quoteIdent(pk.name, o)} = ${literal(r[pk.key], pk.kind, o)};`);
    }
    if (!others.length) notes.push("There are no columns besides the primary key to update.");
  } else if (operation === "upsert" && pk && o.dialect === "sqlserver") {
    // SQL Server has no ON CONFLICT clause; MERGE matches each batch on the primary key.
    const names = columns.map((c) => quoteIdent(c.name, o));
    for (let i = 0; i < rows.length; i += Math.max(1, o.batchSize)) {
      const values = rows.slice(i, i + Math.max(1, o.batchSize)).map(tuple).join(",\n  ");
      const update = others.length ? `\nWHEN MATCHED THEN UPDATE SET ${others.map((c) => `target.${quoteIdent(c.name, o)} = source.${quoteIdent(c.name, o)}`).join(", ")}` : "";
      statements.push(
        `MERGE INTO ${table} AS target\nUSING (VALUES\n  ${values}\n) AS source (${names.join(", ")})\nON target.${quoteIdent(pk.name, o)} = source.${quoteIdent(pk.name, o)}${update}\nWHEN NOT MATCHED THEN INSERT (${names.join(", ")}) VALUES (${names.map((n) => `source.${n}`).join(", ")});`,
      );
    }
  } else {
    const size = Math.max(1, o.batchSize);
    const ignore = o.ignoreDuplicates && operation === "insert";
    if (ignore && o.dialect === "sqlserver") notes.push("SQL Server has no INSERT … IGNORE; use Upsert with a primary key to skip existing rows.");
    const verb = ignore && o.dialect === "mysql" ? "INSERT IGNORE INTO" : ignore && o.dialect === "sqlite" ? "INSERT OR IGNORE INTO" : "INSERT INTO";
    let suffix = "";
    if (ignore && o.dialect === "postgres") suffix = " ON CONFLICT DO NOTHING";
    if (operation === "upsert" && pk) {
      if (o.dialect === "mysql") suffix = others.length ? ` ON DUPLICATE KEY UPDATE ${others.map((c) => `${quoteIdent(c.name, o)} = VALUES(${quoteIdent(c.name, o)})`).join(", ")}` : "";
      else suffix = ` ON CONFLICT (${quoteIdent(pk.name, o)}) DO ${others.length ? `UPDATE SET ${others.map((c) => `${quoteIdent(c.name, o)} = excluded.${quoteIdent(c.name, o)}`).join(", ")}` : "NOTHING"}`;
    }
    for (let i = 0; i < rows.length; i += size) {
      const values = rows.slice(i, i + size).map(tuple).join(",\n  ");
      statements.push(`${verb} ${table} (${colList})\nVALUES\n  ${values}${suffix};`);
    }
  }

  const begin = o.dialect === "sqlserver" ? "BEGIN TRANSACTION;" : o.dialect === "mysql" ? "START TRANSACTION;" : "BEGIN;";
  const body = statements.join("\n\n");
  const sql = o.transaction ? `${begin}\n\n${body}\n\nCOMMIT;` : body;
  return { ok: true, sql, columns, rows: rows.length, statements: statements.length, notes, suggestions };
}
