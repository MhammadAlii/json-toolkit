# JSON Toolkit

Free online JSON tools built with Next.js (App Router). Pages are statically rendered on the server
for SEO; tools run entirely in the browser, so user data never leaves the device.

## Develop

```bash
add .env
npm install
npm run dev
```

Scripts: `npm run dev`, `npm run build`, `npm start`, `npm run lint`.

## Environment variables

All are optional locally; set them in your hosting provider for production. They are public
(`NEXT_PUBLIC_`), so never put secrets in them.

```bash
# Public production URL, no trailing slash (canonical URLs, sitemap, social tags)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google AdSense publisher ID and ad unit IDs (empty = no ads; dev shows placeholders)
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_SLOT_TOOL_BELOW=
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=
NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT=
NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=
NEXT_PUBLIC_ADSENSE_SLOT_HERO=

# Google Search Console HTML-tag verification token (the content="..." value only)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=

# Contact and legal details (defaults in src/config/legal.ts)
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_PRIVACY_EMAIL=
NEXT_PUBLIC_LEGAL_EMAIL=
NEXT_PUBLIC_LEGAL_ENTITY_NAME=
NEXT_PUBLIC_LEGAL_JURISDICTION=
```
