# Architecture

JSON Toolkit is a Next.js App Router site. Pages are rendered on the server (statically at build
time) so search engines get complete HTML; interactive parts hydrate on the client and all JSON is
processed in the browser.

## Layers

Dependencies point inward only. Outer layers may import inner ones, never the reverse. ESLint
(`no-restricted-imports` in `eslint.config.mjs`) enforces these boundaries.

```
app/                      routes: URLs, metadata, wiring only
  └─▶ components/layout/  app shell: header, search, footer, logo
        └─▶ features/      home · tools · converters · legal · company · ads
              └─▶ components/ui, icons, seo, tool  +  hooks/   (shared, feature-agnostic)
                    └─▶ config/   site, ads and legal settings from env
                          └─▶ core/    pure domain: JSON primitives, tool model
```

| Layer | Path | Contains | May import |
| --- | --- | --- | --- |
| Core | `src/core/` | Framework-free domain code: JSON parsing with line/column errors, `TransformResult`, path formatting (`core/json`), the tool model `ToolMeta` / `ToolSlug` / categories (`core/tool`), and text matching (`core/text/matches-query.ts`). | nothing internal |
| Config | `src/config/` | Site, ads and legal settings, read from env vars with defaults. | core |
| Hooks | `src/hooks/` | Reusable client hooks (`useClipboard`, `useUrlHash`, `useShortcutLabel`). | core, config |
| Shared UI | `src/components/ui`, `icons`, `seo`, `tool` | Design-system components, icons, structured data and the tool page shell. Know nothing about features. | core, config, hooks |
| Features | `src/features/<feature>/` | Everything one product area needs: its pages' content, data, logic and feature-specific components. | all of the above |
| Layout | `src/components/layout/` | App shell that composes features: header (with search), footer (with ad slot), logo. | all of the above |
| Routes | `src/app/` | `page.tsx` files that export metadata and render a feature page. | everything |

## Features

| Feature | Path | Owns |
| --- | --- | --- |
| Home | `features/home/` | Home page (placeholder until the design is implemented). |
| Tools | `features/tools/` | Sub-features: formatter (Code, Tree, Table views), validator, repair, minifier, deep-search, diff, schema-validator, query-selector. `registry.ts` lists them. |
| Converters | `features/converters/` | Sub-features: json-to-yaml, json-to-csv, json-to-typescript, json-to-excel, json-to-xml, json-to-sql. `registry.ts` lists them. |
| Legal | `features/legal/` | `privacy/`, `terms/`, `licenses/` pages and the shared `components/` (legal section and paragraph). |
| Company | `features/company/` | `about/` and `contact/` pages, the contact form and request types. |
| Ads | `features/ads/` | AdSense slot with reserved height. |

`features/catalog.ts` combines the tools and converters registries into one index (`catalog`,
`catalogBySlug`, `categoryLabels`, `relatedTools`). It's used by the routes, sitemap, search and
home, so neither feature has to import the other.

### Tool and converter sub-features

Each tool or converter has the same shape:

```
features/<tools|converters>/<name>/
├── meta.ts           # ToolMeta: slug, SEO title/description/keywords, copy, FAQ, category, icon
├── <name>.ts         # helper: pure logic (input → result). No React or Next.js (lint-enforced)
└── <name>-tool.tsx   # client UI, built on the shared ToolWorkbench
```

and its own route that only wires them together:

```tsx
// app/(tools)/json-repair/page.tsx
export const metadata = toolMetadata(repairTool);
export default function Page() {
  return <ToolPage tool={repairTool} related={relatedTools(repairTool)} />;
}
```

| Sub-feature | Route | Helper |
| --- | --- | --- |
| tools/formatter | `/json-formatter` | `formatJson` |
| tools/validator | `/json-validator` | `validateJson` |
| tools/repair | `/json-repair` | `repairJson` |
| tools/minifier | `/json-minifier` | `minifyJson` |
| tools/deep-search | `/json-deep-search` | `searchJson` |
| tools/diff | `/json-diff` | `diffJson` |
| tools/schema-validator | `/json-schema-validator` | `validateAgainstSchema` (stub, needs Ajv) |
| tools/query-selector | `/json-query` | `queryJson` (stub, needs a JSONPath library) |
| converters/json-to-yaml | `/json-to-yaml` | `jsonToYaml` |
| converters/json-to-csv | `/json-to-csv` | `jsonToCsv` |
| converters/json-to-typescript | `/json-to-typescript` | `jsonToTypeScript` |
| converters/json-to-excel | `/json-to-excel` | `jsonToExcel` (stub, needs an .xlsx writer) |
| converters/json-to-xml | `/json-to-xml` | `jsonToXml` |
| converters/json-to-sql | `/json-to-sql` | `jsonToSql` |

**Adding one:** create the folder with `meta.ts` and the helper (plus `<name>-tool.tsx` when its
design exists), add the slug to `ToolSlug` in `core/tool/types.ts`, add the meta to the feature's
`registry.ts`, and add `app/(tools|converters)/<slug>/page.tsx`. Search, footer, home links,
sitemap and structured data pick it up automatically.

## Components

**Every component lives in its own file**, named after it in kebab-case (`FeatureCard` →
`feature-card.tsx`). Shared components go in `src/components/`; components used by a single feature
stay inside that feature, also one per file.

| Folder | Contents |
| --- | --- |
| `components/ui/` — typography | `PageTitle` (sizes lg, md, display; weight bold or extrabold), `Lead` (lg, md, sm), `SectionTitle` (lg, md, sm; renders h2 or h3), `SectionHeader` (title + description, start or center), `Text` (body, small, caption), `Overline`, `Eyebrow` |
| `components/ui/` — actions | `Button`, `ButtonLink` (internal, external and `mailto:` links) sharing `button-styles.ts`: variants primary, secondary, outline, subtle, chip; sizes xs, compact, sm, md, lg. `CopyButton` |
| `components/ui/` — surfaces | `Card` (tones surface, raised, inset, base, faint; radius lg, xl, 2xl), `HeroBand`, `FeatureCard`, `StatCard`, `Callout`, `ComingSoon` |
| `components/ui/` — content | `Badge` (brand, success), `IconTile` (sm, md, lg; round), `BulletList` (dot, bullet, arrow), `FaqList`, `Kbd` (muted, solid), `SectionNav` |
| `components/ui/` — forms | `FormField`, `TextInput`, `Textarea`, `Select`, all sharing `input-styles.ts` |
| `components/icons/` | One file per icon (`search.tsx`, `wand.tsx`, …) using `currentColor`; shared `IconProps` in `icon-props.ts` |
| `components/seo/` | `JsonLd`, `BreadcrumbJsonLd`, `pageMetadata()` (title, description, canonical, Open Graph, Twitter) |
| `components/tool/` | `ToolPage`, `ToolStructuredData`, `toolMetadata()` (built on `pageMetadata`), `ToolWorkbench`, `WorkbenchOptionControl`, `ToolGlyph`, `workbench-types.ts` |
| `components/layout/` | `SiteHeader`, `SiteFooter`, `Logo`, `search/` (`SearchPalette`, `SearchResult`, `SearchHints`, `search-item.ts`) |
| `hooks/` | `useClipboard`, `useUrlHash`, `useShortcutLabel` |

### Reuse rules

Before writing new UI or logic:

1. **Search first.** Look in `components/` and `hooks/` (and `core/` for logic) for something that
   already does it.
2. **Extend, don't copy.** If it's close, add a prop, variant or size to the existing component
   instead of creating a near-duplicate.
3. **Extract on the second use.** Markup or logic that appears in two places becomes a shared
   component, hook or helper. Feature-only pieces live in the feature; anything two features need
   moves to `components/`, `hooks/` or `core/`.
4. **Use tokens, not values.** Colours come from the theme (below), never hex codes in components.
   Plain layout utilities (`flex`, `grid`, `gap-*`) are fine inline.
5. **Every page uses `pageMetadata()`** (or `toolMetadata()` for tools) instead of hand-written
   metadata objects.

## Design tokens

Defined once in `app/globals.css` and used as Tailwind utilities (`bg-surface`, `text-muted`, …).
The values come from the Figma file.

| Token | Use |
| --- | --- |
| `background`, `surface`, `surface-2`, `surface-3`, `footer`, `code-bg` | Page and panel backgrounds |
| `foreground`, `heading`, `emphasis` | Primary text, headings, emphasised inline text |
| `muted`, `secondary`, `subtle` | Body text, legal-page text, captions and metadata |
| `border` | All borders and dividers |
| `brand`, `brand-foreground` | Accent colour and text on it |
| `success`, `danger`, `code-green` | Status colours |
| `tint-purple`, `tint-green`, `tint-amber`, `tint-blue`, `tint-indigo`, `tint-red`, `tint-yellow`, `tint-violet`, `tint-lime` | Icon tiles and accents |

## Folder structure

```
src/
├── app/                        # routing only
│   ├── (company)/about, contact
│   ├── (converters)/json-to-yaml, json-to-csv, …
│   ├── (legal)/privacy, terms, licenses
│   ├── (tools)/json-formatter, json-validator, …
│   ├── ads.txt/route.ts, sitemap.ts, robots.ts, manifest.ts
│   ├── layout.tsx, page.tsx, not-found.tsx, globals.css
│   └── icon.png, apple-icon.png, opengraph-image.png, twitter-image.png
├── components/
│   ├── icons/   layout/   seo/   tool/   ui/
├── config/                     # site.ts, legal.ts
├── core/
│   ├── json/                   # parse.ts, path.ts
│   ├── text/                   # matches-query.ts
│   └── tool/                   # types.ts
├── features/
│   ├── ads/   company/   converters/   home/   legal/   tools/
│   └── catalog.ts
└── hooks/                      # use-clipboard, use-url-hash, use-shortcut-label
```

Folders in parentheses under `app/` are route groups: they organise files without appearing in the
URL (`/privacy`, not `/legal/privacy`).

## Conventions

- **Server components by default.** Add `"use client"` only to components that need state, effects
  or browser APIs, and pass them the minimum data (the header sends search only name, tagline,
  keywords and icon per tool).
- **Pages are thin.** `app/**/page.tsx` exports `metadata` and renders a feature page component;
  content and layout live in the feature.
- **Helpers are pure.** Tool and converter helpers and `meta.ts` import only `core/`, so they can be
  tested in plain Node.
- **Styling.** Tailwind CSS v4 with the design tokens above. Style through the shared components
  and their variants rather than repeating class lists.
- **Imports** use the `@/` alias across layers; relative imports only within one folder.
- **Comments** only where the code can't explain itself (a non-obvious reason or constraint).

## Rendering & SEO

- All pages are statically prerendered. Cache Components (`cacheComponents: true`) is on, so
  request-specific APIs such as `useSearchParams` must sit inside a `<Suspense>` boundary.
- Every page has a unique title, description and canonical URL; `metadataBase` comes from
  `NEXT_PUBLIC_SITE_URL`.
- Structured data: `WebSite` (home), `WebApplication` (tools and converters), `AboutPage`,
  `ContactPage`, and `BreadcrumbList` on every inner page.
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest` and social images come from Next.js file
  conventions in `app/`.

## Ads

`features/ads/ad-slot.tsx` renders an AdSense unit with a reserved minimum height so ads never shift
the layout. Without `NEXT_PUBLIC_ADSENSE_CLIENT` and a slot ID it renders nothing in production and
a labelled placeholder in development. The AdSense script loads once from the root layout, and
`/ads.txt` is generated from the same publisher ID.

## Configuration

All deployment-specific values are env vars; see `.env.example`. Legal placeholders (entity name,
jurisdiction, emails) live in `config/legal.ts` and must be filled before launch.
