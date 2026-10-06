import Link from "next/link";

const sizes = {
  md: { glyph: "text-2xl leading-8", word: "text-xl leading-7" }, // header
  sm: { glyph: "text-xl leading-7", word: "text-lg leading-7" }, // footer
};

export function Logo({ size = "md" }: { size?: keyof typeof sizes }) {
  const s = sizes[size];
  return (
    <Link href="/" aria-label="JSON Toolkit home" className="flex items-center gap-2 font-bold tracking-[-0.5px] whitespace-nowrap">
      <span aria-hidden className={`text-brand ${s.glyph}`}>
        {"{ }"}
      </span>
      <span className={`text-foreground ${s.word}`}>JSON TOOLKIT</span>
    </Link>
  );
}
