import { SectionTitle } from "@/components/ui/section-title";

// One h2 section of an article; the id makes it linkable.
export function GuideSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex scroll-mt-24 flex-col gap-4">
      <SectionTitle id={id}>{title}</SectionTitle>
      {children}
    </section>
  );
}
