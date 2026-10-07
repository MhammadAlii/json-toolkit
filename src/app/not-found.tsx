import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-muted">That tool doesn&apos;t exist (yet).</p>
      <Link href="/" className="mt-6 inline-block text-brand underline">
        Browse all JSON tools
      </Link>
    </div>
  );
}
