import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";

export function InfoPanel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card as="section" radius="2xl" className="flex flex-col gap-[23px] p-8">
      <div className="flex items-center gap-3">
        {icon}
        <SectionTitle size="md">{title}</SectionTitle>
      </div>
      {children}
    </Card>
  );
}
