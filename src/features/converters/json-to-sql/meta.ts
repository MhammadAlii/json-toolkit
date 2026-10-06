import type { ToolMeta } from "@/core/tool/types";

export const jsonToSqlTool: ToolMeta = {
  slug: "json-to-sql",
  name: "JSON to SQL",
  h1: "JSON to SQL Converter",
  title: "JSON to SQL – Generate INSERT Statements Online",
  description:
    "Convert a JSON array to SQL INSERT statements, with an optional CREATE TABLE. Supports MySQL, PostgreSQL and SQLite quoting. Free and runs in your browser.",
  keywords: ["json to sql", "json to sql insert", "convert json to sql", "json to mysql", "json to postgresql"],
  category: "converters",
  tagline: "Generate INSERT statements",
  icon: "code",
  tint: "amber",
  intro:
    "Turn an array of JSON objects into ready-to-run SQL. Column names come from the object keys, values are escaped safely, and a CREATE TABLE statement can be generated too.",
  steps: ["Paste a JSON array of objects.", "Choose the table name and SQL dialect.", "Copy the generated SQL."],
  faqs: [
    {
      q: "Which databases are supported?",
      a: "MySQL, PostgreSQL and SQLite. The dialect controls identifier quoting and boolean values.",
    },
    {
      q: "Are values escaped?",
      a: "Yes. Strings are quoted and single quotes are escaped. Nested objects and arrays are stored as JSON text.",
    },
  ],
  related: ["json-to-csv", "json-to-excel", "json-formatter"],
};
