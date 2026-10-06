import { Card } from "@/components/ui/card";

export function CodeWindow({ flags }: { flags: string[] }) {
  return (
    <Card aria-hidden radius="2xl" className="flex w-fit flex-col gap-4 p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
      <div className="flex gap-2">
        <span className="size-3 rounded-full bg-tint-red" />
        <span className="size-3 rounded-full bg-tint-yellow" />
        <span className="size-3 rounded-full bg-tint-lime" />
      </div>
      <pre className="font-mono text-sm leading-5 text-heading">
        <span className="text-brand">{"{"}</span>
        {"\n"}
        {flags.map((k, i) => (
          <span key={k}>
            {"  "}
            <span className="text-code-green">&quot;{k}&quot;</span>: <span className="text-brand">true</span>
            {i < flags.length - 1 ? "," : ""}
            {"\n"}
          </span>
        ))}
        <span className="text-brand">{"}"}</span>
      </pre>
    </Card>
  );
}
