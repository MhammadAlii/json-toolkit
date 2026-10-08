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
| Core | `src/core/` | Framework-free domain code: JSON parsing with line/column errors, `TransformResult`, path formatting (`core/json`), the tool model `ToolMeta` / `ToolSlug` / categories (`core/tool`), JSON syntax tokenizing (`core/json/tokenize.ts`), value description (`core/json/describe.ts`), path lookup (`valueAtPath` in `core/json/path.ts`), table building, filtering and projection (`core/json/table.ts`), CSV writing (`toCsv` in `core/json/csv.ts`), deep key sorting (`sortDeep` in `core/json/sort.ts`), and text helpers (`core/text`: `matchesQuery`, `formatBytes`, the Myers sequence diff `diffSequences`). | nothing internal |
| Config | `src/config/` | Site, ads and legal settings, read from env vars with defaults. | core |
| Hooks | `src/hooks/` | Reusable client hooks (`useClipboard`, `useUrlHash`, `useShortcutLabel`). | core, config |
| Shared UI | `src/components/ui`, `icons`, `seo`, `tool` | Design-system components, icons, structured data and the tool page shell. Know nothing about features. | core, config, hooks |
| Features | `src/features/<feature>/` | Everything one product area needs: its pages' content, data, logic and feature-specific components. | all of the above |
| Layout | `src/components/layout/` | App shell that composes features: header (with search), footer (with ad slot), logo. | all of the above |
| Routes | `src/app/` | `page.tsx` files that export metadata and render a feature page. | everything |

## Features

| Feature | Path | Owns |
| --- | --- | --- |
| Home | `features/home/` | Home page: hero, the Formatter workspace, stats and ad slots. |
| Tools | `features/tools/` | The `/tools` directory page (`directory/`) and the tool sub-features: formatter (`formatter-workspace.tsx` with Code, Tree and Table views, Format/Minify and Sort keys, used on the home page and the Formatter, Tree Viewer and Table Viewer pages), validator, repair, minifier, tree-viewer, table-viewer, deep-search, diff, schema-validator, query-selector, and the developer utilities jwt-decoder, url-encoder, base64-converter, epoch-converter. `registry.ts` lists them. |
| Converters | `features/converters/` | Sub-features: json-to-yaml, json-to-csv, json-to-typescript, json-to-excel, json-to-xml, json-to-sql, json-to-string, string-to-json. `registry.ts` lists them. |
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
| tools/tree-viewer | `/json-tree-viewer` | `FormatterWorkspace` opening on `JsonTreeExplorer` |
| tools/table-viewer | `/json-table-viewer` | `FormatterWorkspace` opening on `JsonTableExplorer` |
| tools/deep-search | `/json-deep-search` | `searchJson` (substring, exact or regex) |
| tools/diff | `/json-diff` | `diffJson` (structural changes and counts), `diffJsonLines` (sorted, line-by-line `+` / `-` / `~` rows), `foldUnchanged`, `diffToText`; UI in `DiffToolPage` / `DiffWorkspace` / `DiffResult` |
| tools/schema-validator | `/json-schema-validator` | `validateAgainstSchema` (stub, needs Ajv) |
| tools/query-selector | `/json-query` | `queryJson` (stub, needs a JSONPath library) |
| converters/json-to-yaml | `/json-to-yaml` | `jsonToYaml` |
| converters/json-to-csv | `/json-to-csv` | `jsonToCsv` (built on `core/json/csv`) |
| converters/json-to-typescript | `/json-to-typescript` | `jsonToTypeScript` |
| converters/json-to-excel | `/json-to-excel` | `jsonToExcel` (stub, needs an .xlsx writer) |
| converters/json-to-xml | `/json-to-xml` | `jsonToXml` |
| converters/json-to-sql | `/json-to-sql` | `jsonToSql` |
| converters/json-to-string | `/json-to-string` | `jsonToString` |
| converters/string-to-json | `/string-to-json` | `stringToJson` (unwraps double-stringified input) |
| tools/jwt-decoder | `/jwt-decoder` | `decodeJwt` |
| tools/url-encoder | `/url-encoder` | `encodeUrl`, `decodeUrl` |
| tools/base64-converter | `/base64-converter` | `encodeBase64`, `decodeBase64` (UTF-8, URL-safe) |
| tools/epoch-converter | `/epoch-converter` | `fromTimestamp`, `fromDate` |

Tools are grouped into five categories (`ToolCategory`), shown on `/tools` and in search: JSON Core (`core`), Explore JSON (`explore`), Compare & Query (`query`), Converter Hub (`converters`) and Developer Utilities (`utilities`). Labels and order live in `features/catalog.ts`; each category's heading icon and accent colour in `components/tool/tool-category-style.ts`.

**Implemented tool pages** render their own page component (for example `FormatterToolPage`, `DiffToolPage`) that wraps the tool's workspace in `features/tools/shared/tool-layout.tsx` (`ToolHeader` with the hero ad, the bottom ad, `ToolSeoContent` and structured data). Tools without a design yet still use the placeholder `ToolPage`. The Formatter, Tree Viewer and Table Viewer share `FormatterToolPage` and the home page's `FormatterWorkspace`; only the opening view differs.

**Adding one:** create the folder with `meta.ts` (including `summary`, `icon` and `category`) and the helper (plus `<name>-tool.tsx` when its
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
| `components/ui/` — actions | `Button`, `ButtonLink` (internal, external and `mailto:` links) sharing `button-styles.ts`: variants primary, secondary, outline, subtle, chip, soft, accent; sizes tiny, xs, compact, sm, md, lg. `CopyButton`, `SegmentedControl`, `Popover`, `Checkbox` |
| `components/ui/` — surfaces | `Card` (tones surface, raised, inset, base, faint; radius lg, xl, 2xl), `Panel` + `PanelTitle` (editor panel with toolbar), `HeroBand`, `FeatureCard`, `StatCard` (plain, or with an icon), `Callout`, `ComingSoon` |
| `components/ui/` — content | `Badge` (brand, success; pill or note), `IconTile` (sm, md, lg; round), `BulletList` (dot, bullet, arrow), `FaqList`, `Kbd` (muted, solid), `SectionNav` |
| `components/ui/` — forms | `FormField`, `TextInput`, `Textarea`, `Select` (sizes sm, md; sharing `input-styles.ts`), `Checkbox`, `CodeEditor` (monospace input with line numbers), `LineGutter` |
| `components/json/` | `JsonCodeView` (syntax highlighting and line numbers), `JsonTreeView` + `JsonTreeNode` (collapsible, optionally selectable), `JsonExplorerLayout` (output beside `JsonNodeInspector` + `InspectorField`, stacking on narrow containers), `JsonTreeExplorer` (selectable tree), `JsonTableExplorer` (row filter, `JsonTableColumnsMenu`, CSV export, selectable cells, rows revealed 200 at a time) over `JsonTableView` + `JsonTableCell`, `JsonPrimitive`, `JsonColorPicker` (user-chosen output colours), shared `json-token-classes.ts` |
| `components/icons/` | One file per icon (`search.tsx`, `wand.tsx`, …) using `currentColor`; shared `IconProps` in `icon-props.ts` |
| `components/seo/` | `JsonLd`, `BreadcrumbJsonLd`, `pageMetadata()` (title, description, canonical, Open Graph, Twitter) |
| `components/tool/` | `ToolPage`, `ToolStructuredData`, `toolMetadata()` (built on `pageMetadata`), `ToolWorkbench`, `WorkbenchOptionControl`, `ToolHeader` (icon, title, summary and an aside slot), `ToolSeoContent` (how-to, FAQ and related tools below each implemented tool), `ToolCard`, `CategoryHeading`, `ToolGlyph`, `tool-icons.ts` (icon and tint maps), `tool-category-style.ts`, `workbench-types.ts` |
| `components/layout/` | `SiteHeader`, `SiteFooter`, `Logo`, `search/` (`SearchPalette`, `SearchResult`, `SearchHints`, `search-item.ts`) |
| `hooks/` | `useClipboard`, `useDownload`, `useUrlHash`, `useShortcutLabel`, `useStoredState` (localStorage-backed state), `useJsonColors` |

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
| `success`, `danger` | Status colours |
| `code-green`, `code-literal` | Syntax highlighting base colours |
| `json-key`, `json-string`, `json-number`, `json-boolean`, `json-null`, `json-punct` | Output colours used by the JSON views; default to the tokens above and can be overridden per user with `JsonColorPicker` (saved in localStorage) |
| `tint-purple`, `tint-green`, `tint-amber`, `tint-blue`, `tint-indigo`, `tint-red`, `tint-yellow`, `tint-violet`, `tint-lime`, `tint-orange` | Icon tiles and accents |

## Folder structure

```
src/
├── app/                        # routing only
│   ├── (company)/about, contact
│   ├── (converters)/json-to-yaml, json-to-csv, …
│   ├── (legal)/privacy, terms, licenses
│   ├── (tools)/tools (directory), json-formatter, json-validator, …
│   ├── ads.txt/route.ts, sitemap.ts, robots.ts, manifest.ts
│   ├── layout.tsx, page.tsx, not-found.tsx, globals.css
│   └── icon.png, apple-icon.png, opengraph-image.png, twitter-image.png
├── components/
│   ├── icons/   json/   layout/   seo/   tool/   ui/
├── config/                     # site.ts, legal.ts
├── core/
│   ├── json/                   # parse.ts, path.ts, tokenize.ts
│   ├── text/                   # matches-query.ts, format-bytes.ts
│   └── tool/                   # types.ts
├── features/
│   ├── ads/   company/   converters/   home/   legal/   tools/
│   └── catalog.ts
└── hooks/                      # use-clipboard, use-download, use-url-hash, use-shortcut-label, use-stored-state, use-json-colors
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
- Structured data: `WebSite` (home), `ItemList` (`/tools`), `WebApplication` (tools and converters), `AboutPage`,
  `ContactPage`, and `BreadcrumbList` on every inner page.
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest` and social images come from Next.js file
  conventions in `app/`.

## Ads

`features/ads/ad-slot.tsx` renders an AdSense unit with a reserved minimum height so ads never shift
the layout. Without `NEXT_PUBLIC_ADSENSE_CLIENT` and a slot ID it renders nothing in production and
a labelled placeholder in development. The AdSense script loads once from the root layout as a plain async `<script>` in `<head>` (AdSense rejects the `data-nscript` attribute that `next/script` adds), and
`/ads.txt` is generated from the same publisher ID.

## Configuration

All deployment-specific values are environment variables. Locally they go in a git-ignored `.env`
file in the project root; in production, set them in the hosting provider's settings. Every
variable is `NEXT_PUBLIC_`, meaning it is inlined into the browser bundle, so none of them may hold
a secret.

| Variable | Default when empty | Used for | Where to get it |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `metadataBase`, canonical URLs, sitemap, robots.txt, structured data, social tags (`config/site.ts`) | Your production domain, e.g. `https://getjsontoolkit.com`, no trailing slash |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | empty: no ads, no AdSense script | AdSense script, `google-adsense-account` meta tag, `/ads.txt` (`config/site.ts`) | AdSense → Account → Account information (`ca-pub-…`) |
| `NEXT_PUBLIC_ADSENSE_SLOT_TOOL_BELOW` | empty: slot hidden (placeholder in dev) | Ad below a tool's workbench | AdSense → Ads → By ad unit → Display ad (`data-ad-slot`) |
| `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR` | same | Sticky sidebar ad on wide screens | same |
| `NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT` | same | Ad inside page content | same |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | same | Ad in the footer bar | same |
| `NEXT_PUBLIC_ADSENSE_SLOT_HERO` | same | Small ad beside the home page heading on wide screens | same |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | empty: no tag | `google-site-verification` meta tag (`app/layout.tsx`) | Search Console → Add property → URL prefix → HTML tag (the `content` value only). Not needed with DNS verification |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `hello@getjsontoolkit.com` | Contact page email, contact form recipient, About page buttons (`config/legal.ts`) | An inbox you control |
| `NEXT_PUBLIC_PRIVACY_EMAIL` | `privacy@getjsontoolkit.com` | "Contact Privacy Officer" on the Privacy page | An inbox you control |
| `NEXT_PUBLIC_LEGAL_EMAIL` | `legal@getjsontoolkit.com` | Contact section of the Terms page | An inbox you control |
| `NEXT_PUBLIC_LEGAL_ENTITY_NAME` | `[LEGAL ENTITY NAME]` | Terms of Service | Your company name, or your full legal name |
| `NEXT_PUBLIC_LEGAL_JURISDICTION` | `[GOVERNING JURISDICTION]` | Terms of Service | The country or state whose law governs the terms |

The bracketed defaults are design placeholders and must be replaced before launch. The email
defaults use the site's domain, so set up forwarding for `hello@`, `privacy@` and `legal@`
`getjsontoolkit.com` (or override them with the variables).
