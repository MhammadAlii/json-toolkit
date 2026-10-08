"use client";

import { FileCodeIcon } from "@/components/icons/file-code";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import { schemaTemplates, type SchemaTemplate } from "./schema-validator";

export function SchemaTemplateMenu({ onPick }: { onPick: (template: SchemaTemplate) => void }) {
  return (
    <Popover
      label="Schema templates"
      trigger={({ open, toggle, id }) => (
        <Button variant="soft" size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id} title="Load a schema template">
          <FileCodeIcon className="h-[11px] w-auto" /> Template
        </Button>
      )}
    >
      {({ close }) => (
        <ul className="flex flex-col gap-1">
          {schemaTemplates.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(t);
                  close();
                }}
                className="flex w-full flex-col items-start rounded-md px-2.5 py-2 text-left hover:bg-border/40"
              >
                <span className="text-xs font-semibold text-heading">{t.label}</span>
                <span className="text-[11px] text-muted">{t.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  );
}
