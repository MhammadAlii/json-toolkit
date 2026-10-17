import { Card } from "@/components/ui/card";

// A short reason to use the site, with its icon beside the title.
export function HomeHighlight({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="flex flex-col gap-2 p-6">
      <h3 className="flex items-center gap-3 text-base leading-6 font-bold text-heading">
        {icon}
        {title}
      </h3>
      <p className="text-sm leading-[22px] text-muted">{children}</p>
    </Card>
  );
}
