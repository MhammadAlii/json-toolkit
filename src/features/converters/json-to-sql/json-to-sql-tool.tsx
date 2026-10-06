"use client";

import { ToolWorkbench } from "@/components/tool/tool-workbench";
import { jsonAccept, type WorkbenchConfig } from "@/components/tool/workbench-types";
import { jsonToSql, type SqlDialect } from "./json-to-sql";

const config: WorkbenchConfig = {
  inputLabel: "JSON array",
  outputLabel: "SQL",
  options: [
    { kind: "text", key: "table", label: "Table", initial: "users" },
    {
      kind: "select",
      key: "dialect",
      label: "Dialect",
      initial: "postgresql",
      choices: [
        { value: "postgresql", label: "PostgreSQL" },
        { value: "mysql", label: "MySQL" },
        { value: "sqlite", label: "SQLite" },
      ],
    },
    { kind: "checkbox", key: "createTable", label: "CREATE TABLE", initial: true },
  ],
  run: (input, o) => jsonToSql(input, { table: o.table as string, dialect: o.dialect as SqlDialect, createTable: o.createTable as boolean }),
  sample: '[{"id":1,"name":"Ada","address":{"city":"London"},"active":true},{"id":2,"name":"Grace","address":{"city":"New York"},"active":false},{"id":3,"name":"Linus","address":{"city":"Helsinki"}}]',
  download: { filename: "output.sql", mime: "application/sql" },
  accept: jsonAccept,
};

export function JsonToSqlTool() {
  return <ToolWorkbench config={config} />;
}
