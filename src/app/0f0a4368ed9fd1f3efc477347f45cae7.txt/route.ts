import indexNow from "@/config/indexnow.json";

// IndexNow checks this file to confirm the site owns the key used to submit URLs.
export function GET() {
  return new Response(indexNow.key, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
