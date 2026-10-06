import { ads } from "@/config/site";

export function GET() {
  const publisherId = ads.client.replace(/^ca-/, "");
  const body = publisherId ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n` : "";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
