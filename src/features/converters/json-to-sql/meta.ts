import type { ToolMeta } from "@/core/tool/types";

export const jsonToSqlTool: ToolMeta = {
  slug: "json-to-sql",
  name: "JSON ⇄ SQL",
  h1: "JSON to SQL & SQL to JSON Converter",
  title: "JSON to SQL & SQL to JSON – INSERT Statements and Dumps Online",
  description:
    "Convert a JSON array to SQL INSERT statements with an optional CREATE TABLE, or read INSERT statements and database dumps back into JSON. PostgreSQL, MySQL, SQLite and SQL Server. Free and private.",
  keywords: ["json to sql", "sql to json", "json to sql insert", "sql insert to json", "convert json to sql", "convert sql to json", "json to mysql", "json to postgresql", "sql dump to json"],
  category: "converters",
  tagline: "Generate INSERT statements, or read them as JSON",
  summary: "Generate INSERT, upsert or UPDATE statements, or turn SQL inserts and dumps back into JSON.",
  icon: "database",
  tint: "blue",
  intro:
    "Turn an array of JSON objects into ready-to-run SQL, or swap direction to read the rows in INSERT statements or a pg_dump or mysqldump file as JSON. Column names come from the object keys, values are escaped safely, and a CREATE TABLE statement can be generated too.",
  steps: [
    "Paste a JSON array of objects to generate SQL, or press Swap and paste INSERT statements or a dump to read them as JSON.",
    "The result appears as you type; rename columns in the Columns table if needed. Swap moves the result into the input so you can convert it back.",
    "Use Options for the dialect, table, operation, batching and CREATE TABLE (or, for SQL to JSON, tables and string escapes), then copy or download the file.",
  ],
  faqs: [
    {
      q: "Which databases are supported?",
      a: "PostgreSQL, MySQL, SQLite and SQL Server. The dialect controls identifier quoting, string escaping, column types and upsert syntax.",
    },
    {
      q: "Are values escaped?",
      a: "Yes. Strings are quoted and single quotes are escaped. By default nested objects and arrays are stored as JSON text; Options can flatten or skip them instead.",
    },
    {
      q: "What can SQL to JSON read?",
      a: "INSERT and REPLACE statements (including multi-row, IGNORE and upsert forms), UPDATE … SET … WHERE, SQL Server MERGE with VALUES, and the COPY blocks in pg_dump files. A CREATE TABLE in the same SQL supplies column names and types, so 1/0 in boolean columns become true and false and JSON columns become JSON. Other statements are skipped, and nothing is ever run.",
    },
  ],
  related: ["json-to-csv", "json-to-excel", "json-formatter"],
};
