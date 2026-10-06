# JSON Toolkit

Free online JSON tools built with Next.js (App Router). Pages are statically rendered on the server
for SEO; tools run entirely in the browser, so user data never leaves the device.

## Develop

```bash
cp .env.example .env.local
npm install
npm run dev
```

Scripts: `npm run dev`, `npm run build`, `npm start`, `npm run lint`.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the layers, folder structure, conventions and
how to add a tool.

## Launch checklist

- Set `NEXT_PUBLIC_SITE_URL` to the production domain (canonical URLs and sitemap depend on it).
- Fill the legal placeholders in `src/config/legal.ts` (or the matching env vars) and have the
  Privacy Policy and Terms reviewed.
- Verify the domain in Google Search Console and submit `/sitemap.xml`.
- Apply for AdSense, then set `NEXT_PUBLIC_ADSENSE_CLIENT` and the slot IDs. `/ads.txt` is
  generated automatically.
- In AdSense → Privacy & messaging, enable the consent message (required for EEA/UK traffic).
- Check Core Web Vitals with PageSpeed Insights once ads are live.
