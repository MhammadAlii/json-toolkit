import { SectionTitle } from "@/components/ui/section-title";

export function LegalSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-24 flex-col gap-5">
      <SectionTitle id={`${id}-title`}>{title}</SectionTitle>
      {children}
    </section>
  );
}
