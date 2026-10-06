import { Card } from "./card";
import { Text } from "./text";

export type FaqItem = { q: string; a: string };

export function FaqList({ items, className = "" }: { items: FaqItem[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {items.map((f) => (
        <Card key={f.q} className="flex flex-col gap-[7px] p-6">
          <h3 className="text-sm leading-5 font-bold text-heading">{f.q}</h3>
          <Text variant="small">{f.a}</Text>
        </Card>
      ))}
    </div>
  );
}
