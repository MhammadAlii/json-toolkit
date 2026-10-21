import { setKey } from "@/core/json/path";
import { defaultJsonOutputOptions, formatJson, type JsonOutputOptions } from "@/features/converters/shared/json-output";

export type SqlToJsonOptions = JsonOutputOptions & {
  /** `auto` reads backslashes in strings as escapes when the SQL looks like MySQL (backtick names, \' escapes). */
  backslashes: "auto" | "escape" | "literal";
  /** Text values holding a JSON array or object (as JSON to SQL writes nested data) become JSON again. */
  jsonStrings: boolean;
  /** `auto` gives the rows of a single table as an array, and an object keyed by table name for several. */
  tables: "auto" | "object";
};

export const defaultSqlToJsonOptions: SqlToJsonOptions = { ...defaultJsonOutputOptions, backslashes: "auto", jsonStrings: true, tables: "auto" };

export type SqlToJsonResult =
  | { ok: true; value: unknown; json: string; tables: { name: string; rows: number }[]; rows: number; statements: number; notes: string[] }
  | { ok: false; error: string; line: number; column: number };

class SqlError extends Error {
  readonly at: number;
  constructor(message: string, at: number) {
    super(message);
    this.at = at;
  }
}

type Token = { kind: "word" | "ident" | "string" | "number" | "punct"; text: string; at: number };

const lineColumn = (text: string, at: number) => {
  let line = 1;
  let last = -1;
  for (let i = text.indexOf("\n"); i !== -1 && i < at; i = text.indexOf("\n", i + 1)) {
    line++;
    last = i;
  }
  return { line, column: at - last };
};

const backslashEscapes: Record<string, string> = { "0": "\0", b: "\b", n: "\n", r: "\r", t: "\t", Z: "\x1a" };

function tokenize(s: string, escapes: boolean): Token[] {
  const tokens: Token[] = [];
  const fail = (message: string, at: number): never => {
    throw new SqlError(message, at);
  };
  let i = 0;
  const quoted = (start: number, quote: string, backslash: boolean) => {
    let out = "";
    let j = start + 1;
    for (;;) {
      const q = s.indexOf(quote, j);
      const b = backslash ? s.indexOf("\\", j) : -1;
      if (q === -1) fail(quote === "'" ? "This string is never closed with a quote ( ' )." : `This name is never closed with ${quote}.`, start);
      if (b !== -1 && b < q) {
        out += s.slice(j, b);
        const e = s[b + 1];
        out += backslashEscapes[e] ?? e ?? "";
        j = b + 2;
        continue;
      }
      out += s.slice(j, q);
      if (s[q + 1] === quote) {
        out += quote;
        j = q + 2;
        continue;
      }
      i = q + 1;
      return out;
    }
  };
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === "-" && s[i + 1] === "-") {
      const end = s.indexOf("\n", i);
      i = end === -1 ? s.length : end;
      continue;
    }
    if (c === "#" && (i === 0 || s[i - 1] === "\n")) {
      const end = s.indexOf("\n", i);
      i = end === -1 ? s.length : end;
      continue;
    }
    if (c === "/" && s[i + 1] === "*") {
      // MySQL's /*!40101 … */ version comments only set session options in dumps, so they're skipped too.
      const end = s.indexOf("*/", i + 2);
      if (end === -1) fail("This comment is never closed with */.", i);
      i = end + 2;
      continue;
    }
    const at = i;
    if (c === "'") {
      tokens.push({ kind: "string", text: quoted(i, "'", escapes), at });
    } else if (/[NnEeXxBb]/.test(c) && s[i + 1] === "'") {
      const prefix = c.toUpperCase();
      i++;
      const text = quoted(i, "'", escapes || prefix === "E");
      tokens.push({ kind: "string", text: prefix === "X" ? `0x${text}` : prefix === "B" ? `0b${text}` : text, at });
    } else if (c === '"') {
      tokens.push({ kind: "ident", text: quoted(i, '"', false), at });
    } else if (c === "`") {
      tokens.push({ kind: "ident", text: quoted(i, "`", false), at });
    } else if (c === "[" && tokens[tokens.length - 1]?.text.toUpperCase() !== "ARRAY" && /^\[[^\]\n]+\]/.test(s.slice(i, i + 130))) {
      tokens.push({ kind: "ident", text: quoted(i, "]", false), at });
    } else if (c === "$" && /^\$(\w*)\$/.test(s.slice(i, i + 64))) {
      const tag = /^\$(\w*)\$/.exec(s.slice(i, i + 64))![0];
      const end = s.indexOf(tag, i + tag.length);
      if (end === -1) fail(`This ${tag} string is never closed with ${tag}.`, i);
      tokens.push({ kind: "string", text: s.slice(i + tag.length, end), at });
      i = end + tag.length;
    } else if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(s[i + 1] ?? ""))) {
      const m = /^(?:0x[0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/.exec(s.slice(i, i + 400))!;
      tokens.push({ kind: "number", text: m[0], at });
      i += m[0].length;
    } else if (/[A-Za-z_À-￿]/.test(c)) {
      const m = /^[A-Za-z_À-￿][\w$À-￿]*/.exec(s.slice(i, i + 400))!;
      tokens.push({ kind: "word", text: m[0], at });
      i += m[0].length;
    } else {
      const two = s.slice(i, i + 2);
      const text = two === "::" || two === "<>" || two === "<=" || two === ">=" || two === "!=" || two === "||" ? two : c;
      tokens.push({ kind: "punct", text, at });
      i += text.length;
    }
  }
  return tokens;
}

type Column = { name: string; type: string };

/** Reads the data rows in SQL INSERT, UPDATE, MERGE and COPY statements into JSON, one array per table. */
export function sqlToJson(input: string, options: SqlToJsonOptions = defaultSqlToJsonOptions): SqlToJsonResult {
  const o = options;
  const notes = new Set<string>();
  const tables = new Map<string, unknown[]>();
  const schemas = new Map<string, Column[]>();
  let statements = 0;
  let skipped = 0;
  let text = input.replace(/^﻿/, "").replace(/\r\n?/g, "\n");

  const rowsOf = (table: string) => {
    let rows = tables.get(table);
    if (!rows) tables.set(table, (rows = []));
    return rows;
  };

  const kindOf = (type: string | undefined) => {
    const t = (type ?? "").toLowerCase();
    if (/^(bool|boolean|bit|tinyint\(1\))$/.test(t)) return "boolean";
    if (/^jsonb?$/.test(t)) return "json";
    if (/^(tinyint|smallint|mediumint|int|integer|bigint|serial|bigserial|smallserial|int2|int4|int8)\b/.test(t)) return "integer";
    if (/^(real|float|double|decimal|numeric|money|float4|float8)/.test(t)) return "number";
    return "text";
  };

  // A value read from SQL, adjusted to its column's declared type.
  const typed = (v: unknown, column: Column | undefined): unknown => {
    const kind = kindOf(column?.type);
    if (kind === "boolean" && (v === 1 || v === 0 || v === "1" || v === "0" || v === "t" || v === "f")) return v === 1 || v === "1" || v === "t";
    if (typeof v === "string" && (kind === "json" || (o.jsonStrings && /^[[{]/.test(v)))) {
      try {
        return JSON.parse(v) as unknown;
      } catch {
        if (kind === "json") notes.add("Some values in JSON columns aren't valid JSON; they were kept as text.");
      }
    }
    return v;
  };

  const number = (t: string): unknown => {
    if (/^0x/i.test(t)) return t;
    const n = Number(t);
    if (Number.isInteger(n) && !Number.isSafeInteger(n)) {
      notes.add("Integers too large for JSON numbers to hold exactly were kept as strings.");
      return t;
    }
    return n;
  };

  // pg_dump writes table data as COPY … FROM stdin followed by tab-separated lines and a "\." line.
  const copy = /^COPY\s+([^\s(]+)\s*\(([^)]*)\)\s+FROM\s+stdin;\n([\s\S]*?)^\\\.$/gim;
  const copies: { table: string; columns: string[]; lines: string[] }[] = [];
  text = text.replace(copy, (all, table: string, cols: string, data: string) => {
    copies.push({ table: unquote(table), columns: cols.split(",").map((c) => unquote(c.trim())), lines: data.split("\n").filter((l) => l !== "") });
    // Blanked rather than removed, so positions in errors still point at the right line.
    return all.replace(/[^\n]/g, " ");
  });

  // MySQL is the one dialect where backslashes escape by default; its own syntax, or doubled backslashes, give it away.
  const escapes = o.backslashes === "escape" || (o.backslashes === "auto" && /`|\\'|\\\\|ENGINE\s*=|AUTO_INCREMENT|LOCK TABLES|START TRANSACTION|ON DUPLICATE KEY|INSERT\s+IGNORE|REPLACE\s+INTO/i.test(text));

  try {
    const tokens = tokenize(text, escapes);
    let p = 0;
    const peek = (k = 0) => tokens[p + k];
    const word = (t: Token | undefined, w: string) => !!t && t.kind === "word" && t.text.toUpperCase() === w;
    const fail = (message: string, t: Token | undefined = peek()): never => {
      throw new SqlError(message, t ? t.at : text.length);
    };
    const expect = (punct: string) => {
      if (peek()?.text !== punct || peek()?.kind !== "punct") fail(`Expected “${punct}” here.`);
      p++;
    };
    const name = (t: Token) => (t.kind === "word" || t.kind === "ident" ? t.text : fail("Expected a table or column name here.", t));
    // schema.table names keep only the table.
    const qualifiedName = () => {
      let n = name(tokens[p++]);
      while (peek()?.text === "." && peek()?.kind === "punct") {
        p++;
        n = name(tokens[p++]);
      }
      return n;
    };
    const skipStatement = () => {
      let depth = 0;
      while (p < tokens.length) {
        const t = tokens[p];
        if (t.kind === "punct") {
          if (t.text === "(") depth++;
          else if (t.text === ")") depth--;
          else if (t.text === ";" && depth <= 0) return;
        }
        p++;
      }
    };
    // Raw SQL for an expression that isn't a plain value, up to the next top-level "," or ")".
    const expression = () => {
      const start = peek();
      let depth = 0;
      let end = start.at;
      while (p < tokens.length) {
        const t = tokens[p];
        if (t.kind === "punct") {
          if (t.text === "(" || t.text === "[") depth++;
          else if ((t.text === ")" || t.text === "]") && depth === 0) break;
          else if (t.text === ")" || t.text === "]") depth--;
          else if ((t.text === "," || t.text === ";") && depth === 0) break;
        }
        p++;
        const next = tokens[p];
        end = next ? next.at : text.length;
      }
      notes.add("Expressions such as NOW() can't be evaluated here, so they were kept as SQL text.");
      return text.slice(start.at, end).trim();
    };

    const castTo = (v: unknown, type: string): unknown => {
      const t = type.toLowerCase();
      if (/^jsonb?$/.test(t) && typeof v === "string") {
        try {
          return JSON.parse(v) as unknown;
        } catch {
          return v;
        }
      }
      if (/^(int|integer|bigint|smallint|numeric|decimal|real|float|double)/.test(t) && typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return number(v.trim());
      if (/^bool/.test(t) && typeof v === "string") return /^(t|true|1|yes|on)$/i.test(v);
      return v;
    };

    const value = (): unknown => {
      const t = peek();
      if (!t) fail("Expected a value here.");
      const start = p;
      let v: unknown;
      if (t.kind === "string") {
        v = t.text;
        p++;
      } else if (t.kind === "number") {
        v = number(t.text);
        p++;
      } else if (t.kind === "punct" && (t.text === "-" || t.text === "+") && peek(1)?.kind === "number") {
        v = number(`${t.text === "-" ? "-" : ""}${peek(1).text}`);
        p += 2;
      } else if (word(t, "NULL")) {
        v = null;
        p++;
      } else if (word(t, "TRUE") || word(t, "FALSE")) {
        v = word(t, "TRUE");
        p++;
      } else if (word(t, "DEFAULT")) {
        p++;
        return undefined;
      } else if (word(t, "CAST") && peek(1)?.text === "(") {
        p += 2;
        const inner = value();
        if (!word(peek(), "AS")) return rewind(start);
        p++;
        const type = name(tokens[p++]);
        while (peek() && peek().text !== ")") p++;
        expect(")");
        v = castTo(inner, type);
      } else if (word(t, "ARRAY") && peek(1)?.text === "[") {
        p += 2;
        const items: unknown[] = [];
        while (peek() && peek().text !== "]") {
          items.push(value());
          if (peek()?.text === ",") p++;
        }
        expect("]");
        v = items;
      } else if (t.kind === "ident" && escapes) {
        // MySQL also allows double-quoted strings.
        v = t.text;
        p++;
      } else return rewind(start);
      while (peek()?.text === "::") {
        p++;
        const type = name(tokens[p++]);
        if (peek()?.text === "(") while (peek() && tokens[p++].text !== ")");
        if (peek()?.text === "[" && peek(1)?.text === "]") p += 2;
        v = castTo(v, type);
      }
      const next = peek();
      if (next && !(next.kind === "punct" && (next.text === "," || next.text === ")" || next.text === "]" || next.text === ";")) && !word(next, "AND") && !word(next, "WHERE") && !word(next, "AS")) return rewind(start);
      return v;
    };
    function rewind(start: number) {
      p = start;
      return expression();
    }

    const tuple = (): unknown[] => {
      expect("(");
      const values: unknown[] = [];
      if (peek()?.text === ")") {
        p++;
        return values;
      }
      for (;;) {
        values.push(value());
        if (peek()?.text === ",") {
          p++;
          continue;
        }
        expect(")");
        return values;
      }
    };

    const columnList = (): string[] => {
      expect("(");
      const cols: string[] = [];
      for (;;) {
        cols.push(name(tokens[p++]));
        if (peek()?.text === ",") {
          p++;
          continue;
        }
        expect(")");
        return cols;
      }
    };

    const addRows = (table: string, columns: string[] | undefined, tuples: { values: unknown[]; at: Token }[]) => {
      const schema = schemas.get(table);
      const cols = columns ?? schema?.map((c) => c.name);
      if (!cols) notes.add("Some INSERT statements don't list their columns and no CREATE TABLE names them, so they're named column_1, column_2, …");
      const rows = rowsOf(table);
      for (const { values, at } of tuples) {
        if (cols && values.length !== cols.length) fail(`This row has ${values.length} values, but ${cols.length} columns are listed.`, at);
        const row: Record<string, unknown> = {};
        values.forEach((v, i) => {
          if (v === undefined) return;
          const col = cols?.[i] ?? `column_${i + 1}`;
          setKey(row, col, typed(v, schema?.find((c) => c.name === col)));
        });
        rows.push(row);
      }
    };

    const tuples = () => {
      const list: { values: unknown[]; at: Token }[] = [];
      for (;;) {
        const at = peek();
        list.push({ values: tuple(), at });
        if (peek()?.text === ",") {
          p++;
          continue;
        }
        return list;
      }
    };

    const insert = () => {
      // INSERT [IGNORE | OR REPLACE …] INTO name, or REPLACE INTO name
      p++;
      while (peek() && peek().kind === "word" && !word(peek(), "INTO") && ["IGNORE", "OR", "REPLACE", "ABORT", "FAIL", "ROLLBACK", "LOW_PRIORITY", "DELAYED", "HIGH_PRIORITY"].includes(peek().text.toUpperCase())) p++;
      if (word(peek(), "INTO")) p++;
      const table = qualifiedName();
      const columns = peek()?.text === "(" ? columnList() : undefined;
      if (word(peek(), "VALUES") || word(peek(), "VALUE")) {
        p++;
        addRows(table, columns, tuples());
      } else {
        notes.add("INSERT … SELECT and DEFAULT VALUES statements have no literal rows, so they were skipped.");
        skipped++;
        rowsOf(table);
      }
      skipStatement();
    };

    const update = () => {
      p++;
      const table = qualifiedName();
      while (peek() && !word(peek(), "SET")) p++;
      p++;
      const set: [string, unknown][] = [];
      const schema = schemas.get(table);
      for (;;) {
        let col = name(tokens[p++]);
        while (peek()?.text === ".") {
          p++;
          col = name(tokens[p++]);
        }
        expect("=");
        set.push([col, value()]);
        if (peek()?.text === ",") {
          p++;
          continue;
        }
        break;
      }
      // WHERE a = 1 AND b = 'x' identifies the row; those columns come first, like a primary key.
      const where: [string, unknown][] = [];
      if (word(peek(), "WHERE")) {
        p++;
        for (;;) {
          const t = peek();
          if (!t || (t.kind !== "word" && t.kind !== "ident") || peek(1)?.text !== "=") break;
          p += 2;
          where.push([t.text, value()]);
          if (!word(peek(), "AND")) break;
          p++;
        }
      }
      const row: Record<string, unknown> = {};
      for (const [k, v] of [...where, ...set]) if (v !== undefined) setKey(row, k, typed(v, schema?.find((c) => c.name === k)));
      rowsOf(table).push(row);
      notes.add("UPDATE statements were read as rows: the WHERE columns, then the columns they set.");
      skipStatement();
    };

    const merge = () => {
      // MERGE INTO name [AS target] USING (VALUES (…), …) AS source (columns) …
      p++;
      if (word(peek(), "INTO")) p++;
      const table = qualifiedName();
      while (peek() && !word(peek(), "USING")) p++;
      p++;
      if (peek()?.text === "(" && word(peek(1), "VALUES")) {
        p += 2;
        const list = tuples();
        expect(")");
        if (word(peek(), "AS")) p++;
        if (peek()?.kind === "word" || peek()?.kind === "ident") p++;
        const columns = peek()?.text === "(" ? columnList() : undefined;
        addRows(table, columns, list);
      } else {
        notes.add("MERGE statements that read from another table have no literal rows, so they were skipped.");
        skipped++;
      }
      skipStatement();
    };

    const createTable = () => {
      p += 2;
      if (word(peek(), "IF")) p += 3;
      const table = qualifiedName();
      if (peek()?.text !== "(") return skipStatement();
      p++;
      const columns: Column[] = [];
      const constraint = /^(PRIMARY|CONSTRAINT|UNIQUE|KEY|INDEX|FOREIGN|CHECK|FULLTEXT|SPATIAL|EXCLUDE|PERIOD)$/i;
      for (;;) {
        const t = peek();
        if (!t) fail("This CREATE TABLE is never closed with “)”.");
        if (!(t.kind === "word" && constraint.test(t.text))) {
          const col = name(t);
          p++;
          let type = peek()?.kind === "word" ? peek().text : "";
          if (type) p++;
          if (peek()?.text === "(" && /^tinyint$/i.test(type) && peek(1)?.text === "1" && peek(2)?.text === ")") type = "tinyint(1)";
          columns.push({ name: col, type });
        }
        // Skip the rest of the definition, up to the next top-level comma.
        let depth = 0;
        while (peek() && !(depth === 0 && (peek().text === "," || peek().text === ")"))) {
          if (peek().text === "(") depth++;
          else if (peek().text === ")") depth--;
          p++;
        }
        if (peek()?.text === ",") {
          p++;
          continue;
        }
        p++;
        break;
      }
      schemas.set(table, columns);
      rowsOf(table);
      skipStatement();
    };

    while (p < tokens.length) {
      const t = peek();
      if (t.text === ";" && t.kind === "punct") {
        p++;
        continue;
      }
      statements++;
      if (word(t, "INSERT") || word(t, "REPLACE")) insert();
      else if (word(t, "UPDATE")) update();
      else if (word(t, "MERGE")) merge();
      else if (word(t, "CREATE") && word(peek(1), "TABLE")) createTable();
      else if (word(t, "CREATE") && (word(peek(1), "TEMPORARY") || word(peek(1), "TEMP") || word(peek(1), "UNLOGGED")) && word(peek(2), "TABLE")) {
        p++;
        createTable();
      } else {
        skipped++;
        skipStatement();
      }
    }

    for (const c of copies) {
      statements++;
      const schema = schemas.get(c.table);
      const rows = rowsOf(c.table);
      for (const line of c.lines) {
        const row: Record<string, unknown> = {};
        line.split("\t").forEach((raw, i) => {
          const col = c.columns[i] ?? `column_${i + 1}`;
          const cell = raw === "\\N" ? null : raw.replace(/\\(.)/g, (_, e: string) => backslashEscapes[e] ?? e);
          const kind = kindOf(schema?.find((x) => x.name === col)?.type);
          const v = cell === null ? null : kind === "integer" || kind === "number" ? number(cell) : cell;
          setKey(row, col, typed(v, schema?.find((x) => x.name === col)));
        });
        rows.push(row);
      }
    }
  } catch (e) {
    if (!(e instanceof SqlError)) throw e;
    return { ok: false, error: e.message, ...lineColumn(text, Math.min(e.at, text.length)) };
  }

  if (skipped) notes.add(`${skipped.toLocaleString("en-US")} ${skipped === 1 ? "statement holds" : "statements hold"} no rows (such as SET, BEGIN or DROP) and ${skipped === 1 ? "was" : "were"} skipped.`);
  const list = [...tables].map(([name, rows]) => ({ name, rows: rows.length }));
  if (!list.length) return { ok: false, error: "There are no INSERT, UPDATE, MERGE, COPY or CREATE TABLE statements with rows to read.", line: 1, column: 1 };
  let result: unknown;
  if (list.length === 1 && o.tables === "auto") result = tables.get(list[0].name);
  else {
    const all: Record<string, unknown> = {};
    for (const [name, rows] of tables) setKey(all, name, rows);
    result = all;
    if (o.tables === "auto") notes.add("The SQL fills several tables, so the JSON has one key per table.");
  }
  const rows = list.reduce((n, t) => n + t.rows, 0);
  return { ok: true, value: result, json: formatJson(result, o), tables: list, rows, statements, notes: [...notes] };
}

function unquote(name: string): string {
  const last = name.split(".").pop() ?? name;
  return /^["`[]/.test(last) ? last.slice(1, -1) : last;
}
