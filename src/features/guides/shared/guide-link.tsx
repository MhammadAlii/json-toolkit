import Link from "next/link";

// An inline link inside article text, usually to one of the tools.
export function GuideLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand">
      {children}
    </Link>
  );
}
