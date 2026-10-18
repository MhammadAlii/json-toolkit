// Submits every URL in the live sitemap to IndexNow (Bing, Yandex and the engines that share it), so changes
// are picked up within hours. Runs after each production deploy (.github/workflows/indexnow.yml) or with
// `npm run indexnow` (add `-- --dry-run` to list the URLs without submitting). SITE_URL defaults to the production site.
import { readFileSync } from "node:fs";

const site = (process.env.SITE_URL ?? "https://getjsontoolkit.com").replace(/\/$/, "");
const { key } = JSON.parse(readFileSync(new URL("../src/config/indexnow.json", import.meta.url), "utf8"));
const keyLocation = `${site}/${key}.txt`;

const keyFile = await fetch(keyLocation);
if (!keyFile.ok || (await keyFile.text()).trim() !== key) {
  console.error(`The key file at ${keyLocation} is missing or wrong (HTTP ${keyFile.status}); deploy the site first.`);
  process.exit(1);
}

const sitemap = await (await fetch(`${site}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
if (urlList.length === 0) {
  console.error("The sitemap has no URLs.");
  process.exit(1);
}

if (process.argv.includes("--dry-run")) {
  console.log(`Would submit ${urlList.length} URLs for ${new URL(site).host}:\n${urlList.join("\n")}`);
  process.exit(0);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation, urlList }),
});

// 200 means accepted; 202 means accepted while the key is still being checked (normal on the first run).
console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs`);
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
