import type { ToolMeta } from "@/core/tool/types";

export const jsonToSqlTool: ToolMeta = {
  slug: "json-to-sql",
  name: "JSON to SQL",
  h1: "JSON to SQL Converter",
  title: "JSON to SQL – Generate INSERT Statements Online",
  description:
    "Convert a JSON array to SQL INSERT statements, with an optional CREATE TABLE. Supports PostgreSQL, MySQL, SQLite and SQL Server. Free and runs in your browser.",
  keywords: ["json to sql", "json to sql insert", "convert json to sql", "json to mysql", "json to postgresql"],
  category: "converters",
  tagline: "Generate INSERT statements",
  summary: "Generate INSERT, upsert or UPDATE statements for PostgreSQL, MySQL, SQLite or SQL Server.",
  icon: "database",
  tint: "blue",
  intro:
    "Turn an array of JSON objects into ready-to-run SQL. Column names come from the object keys, values are escaped safely, and a CREATE TABLE statement can be generated too.",
  steps: [
    "Paste a JSON array of objects or drop a file into the input.",
    "The SQL appears as you type; rename columns in the Columns table if needed.",
    "Use Options for the dialect, table, operation, batching and CREATE TABLE, then copy or download the .sql file.",
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
  ],
  related: ["json-to-csv", "json-to-excel", "json-formatter"],
};
