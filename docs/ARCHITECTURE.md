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
        └─▶ features/      home · tools · converters · utilities · guides · legal · company · ads
              └─▶ components/ui, icons, seo, tool  +  hooks/   (shared, feature-agnostic)
                    └─▶ config/   site, ads and legal settings from env
                          └─▶ core/    pure domain: JSON primitives, tool model
```

| Layer | Path | Contains | May import |
| --- | --- | --- | --- |
| Core | `src/core/` | Framework-free domain code: JSON parsing with line/column errors, `TransformResult`, path formatting (`core/json`), the tool model `ToolMeta` / `ToolSlug` / categories (`core/tool`), JSON syntax tokenizing (`core/json/tokenize.ts`), value description (`core/json/describe.ts`), path lookup (`valueAtPath` in `core/json/path.ts`), table building, filtering and projection (`core/json/table.ts`), CSV writing (`toCsv` in `core/json/csv.ts`, RFC 4180 with `CsvOptions` for delimiter, quoting, headers, flattening, arrays, nulls and column order, on `tabulate`, which flattens rows into headers and raw values), an uncompressed ZIP writer (`zip` in `core/file/zip.ts`), deep key sorting (`sortDeep` in `core/json/sort.ts`), forgiving indentation of invalid JSON that locates an offset in the result (`looseFormat` in `core/json/loose-format.ts`, identical to `JSON.stringify(value, null, 2)` for valid input), a strict RFC 8259 syntax checker (`lintJson` in `core/json/lint.ts`, which names the first error with a code such as `MISSING_COMMA` and its exact location), structure counts (`jsonStats` in `core/json/stats.ts`), a JSON Schema validator (`validateSchema` in `core/json/schema.ts`, core keywords of drafts 2020-12 / 2019-09 / 07 with local `$ref`), schema inference (`inferSchema` in `core/json/infer-schema.ts`), path-to-line lookup (`locateLines` in `core/json/locate.ts`), a safe JSONPath evaluator (`core/json/jsonpath.ts`: `queryJsonPath` for RFC 9535-style queries, `compileCondition` for WHERE conditions where bare names refer to the current item, `compileField` for field references; filters support the RFC 9535 functions `length`, `count`, `match`, `search` and `value`), and text helpers (`core/text`: `matchesQuery`, `formatBytes`, `relativeTime`, `formatUtc`, `formatDay`, the linear-space Myers sequence diff `diffSequences` with an optional deadline). | nothing internal |
| Config | `src/config/` | Site, ads and legal settings, read from env vars with defaults. | core |
| Hooks | `src/hooks/` | Reusable client hooks (`useClipboard`, `useUrlHash`, `useShortcutLabel`, `useWorkerTask`). | core, config |
| Shared UI | `src/components/ui`, `icons`, `seo`, `tool` | Design-system components, icons, structured data and the tool page shell. Know nothing about features. | core, config, hooks |
| Features | `src/features/<feature>/` | Everything one product area needs: its pages' content, data, logic and feature-specific components. | all of the above |
| Layout | `src/components/layout/` | App shell that composes features: header (with search), footer (with ad slot), logo. | all of the above |
| Routes | `src/app/` | `page.tsx` files that export metadata and render a feature page. | everything |

## Features

| Feature | Path | Owns |
| --- | --- | --- |
| Home | `features/home/` | Home page: hero, the Formatter workspace, ad slots and the popular tools (`popular-tools.ts`: six tools, each with a description written for the home page, shown as `PopularToolCard`s). |
| Tools | `features/tools/` | The `/tools` directory page (`directory/`, every category except converters and utilities), `shared/` (`ToolLayout` for tool pages, `DirectoryLayout` for the `/tools`, `/converters` and `/utilities` listings) and the tool sub-features: formatter (`formatter-workspace.tsx` with Code, Tree and Table views, Format/Minify and Sort keys; invalid input is shown indented anyway by `FormatterErrorView`, with the failing line and character highlighted and scrolled into view; the input's Format button and the error's Fix in input button indent the input itself (valid or not) so long one-line JSON can be edited, the latter also selecting the failing character, used on the home page and the Formatter, Tree Viewer and Table Viewer pages), validator, repair, minifier, tree-viewer, table-viewer, deep-search, diff, schema-validator, query-selector. `registry.ts` lists them. |
| Converters | `features/converters/` | The `/converters` listing page (`directory/`, each converter as a `ToolCard`). Sub-features: json-to-yaml, json-to-csv, json-to-typescript, json-to-excel, json-to-xml, json-to-sql, json-to-string (both directions). `registry.ts` lists them. |
| Utilities | `features/utilities/` | The `/utilities` listing page (`directory/`, each utility as a `ToolCard`). Sub-features: jwt-decoder, url-encoder, base64-converter, epoch-converter. `registry.ts` lists them. |
| Guides | `features/guides/` | The `/guides` listing (`directory/`) and one folder per guide: `meta.ts` (`GuideMeta`: SEO title, description, keywords, summary, dates, reading time, the tools it uses and an FAQ) and `<slug>-guide.tsx` (the article). `shared/` holds `GuideLayout` (header with the hero ad, article, ad, FAQ, tool cards and more guides), `GuideStructuredData` (TechArticle, breadcrumb and FAQ), `GuideCode` (code samples, JSON coloured like the tools), `GuideSection`, `GuideLink`, `InlineCode`, `GuideCard` and `guideMetadata`. Guides are linked from the header. `registry.ts` lists them; each guide has its own route under `app/(guides)/guides/<slug>/`. |
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
├── meta.ts                # ToolMeta: slug, SEO title/description/keywords, copy, FAQ, category, icon
├── <name>.ts              # helper: pure logic (input → result). No React or Next.js (lint-enforced)
├── <name>-tool-page.tsx   # the page: the workspace inside the shared ToolLayout
└── <name>-workspace.tsx   # client UI, laid out like the home formatter (panels with header actions)
```

Each route only wires things together:

```tsx
// app/(tools)/json-repair/page.tsx
export const metadata = toolMetadata(repairTool);
export default function Page() {
  return <RepairToolPage tool={repairTool} related={relatedTools(repairTool)} />;
}
```

| Sub-feature | Route | Helper |
| --- | --- | --- |
| tools/formatter | `/json-formatter` | `FormatterWorkspace` (Code, Tree and Table views, Format / Minify / Sort) |
| tools/validator | `/json-validator` | `validateJsonText` (built on `lintJson` and `jsonStats`), `explain` (headline, what happened and tips per error code), `excerpt`; UI in `ValidatorToolPage` / `ValidatorWorkspace` / `ValidatorResultCard` (Jump to Error, Auto-Repair via `repairJson`) / `ValidatorExplanationCard` / `ValidatorStructureCard` |
| tools/repair | `/json-repair` | `repair` (lenient parser that records every change with its rule, input line and output line, honouring per-rule `RepairOptions`) and `repairJson` (all rules, used by the Validator's Auto-Repair); UI in `RepairToolPage` / `RepairWorkspace` / `RepairOutputView` (changed characters highlighted) / `RepairAuditLog` + `RepairChangeItem` / `RepairFixMenu` (rule checkboxes in a Fix options menu; Repair, colours, copy and download sit in the output header) |
| tools/minifier | `/json-minifier` | `minify` (checks with `lintJson`, then strips whitespace from the source text so numbers and escapes stay byte-for-byte, with byte counts and content/whitespace bins) and `gzipSize`; UI in `MinifierToolPage` / `MinifierWorkspace` / `MinifierStatCard` / `MinifierReductionCard` / `MinifierDistributionChart` |
| tools/tree-viewer | `/json-tree-viewer` | `FormatterWorkspace` opening on `JsonTreeExplorer` |
| tools/table-viewer | `/json-table-viewer` | `FormatterWorkspace` opening on `JsonTableExplorer` |
| tools/deep-search | `/json-deep-search` | `deepSearch` (keys, values and paths with case, exact and regex matching, value-type, depth and result filters; match ranges for highlighting), `matchRows` for export; UI in `DeepSearchToolPage` / `DeepSearchWorkspace` / `DeepSearchBar` + `DeepSearchFiltersMenu` / `DeepSearchResultCard` (copy, go to match, expand context) / `DeepSearchNoResults` / `DeepSearchStats` |
| tools/diff | `/json-diff` | `diff.ts`: `compareJson` (parses once, applies `DiffOptions` via `normalize`), `structuralChanges` (array items matched by content, then paired by similarity) and `toJsonPatch` (RFC 6902). `diff-lines.ts`: `buildLineDiff` (`+` / `-` / `~` rows with paths and inline character or item highlights). `diff-view.ts`: `foldUnchanged`, `hunks`, `splitRows`, `diffToText`. Runs in `diff.worker.ts` through `useWorkerTask`; UI in `DiffWorkspace`, `DiffResult` (unified / split, change navigation, row paging) and their row components |
| tools/schema-validator | `/json-schema-validator` | `checkAgainstSchema` (violations with category, path and line), `schemaTemplates` (infer from data, blank); UI in `SchemaToolPage` / `SchemaWorkspace` / `SchemaResultCard` / `SchemaViolationItem` / `SchemaTemplateMenu` |
| tools/query-selector | `/json-query` | `runPipeline` with PATH, WHERE, SELECT, SORT, LIMIT and GROUP stages (`stageInfo`); UI in `QueryToolPage` / `QueryWorkspace` / `QueryPipeline` (stage chips + `QueryStageMenu`) / `QueryResultPanel` (code, table or tree) |
| converters/json-to-csv | `/json-to-csv` | `convertToCsv` (on `core/json/csv`; warns when the input isn't an array of objects and suggests top-level arrays to use instead), `withBom`; UI in `JsonToCsvToolPage` / `JsonToCsvWorkspace` (CSV / Preview tabs) / `CsvOptionsMenu`, preview in the shared `ConverterPreviewTable` |
| converters/json-to-excel | `/json-to-excel` | `jsonToExcel` (on `tabulate`; typed number, boolean and date cells, ISO dates as Excel dates, Excel's row, column and cell-text limits with notes, one sheet per top-level array), `excelFile`, `sheetTsv`, `cellLabel`; `buildXlsx` / `sheetNames` / `columnLetter` in `xlsx.ts` write the workbook (inline strings so text never runs as a formula, bold frozen header, filters, column widths) on `core/file/zip`; UI in `JsonToExcelToolPage` / `JsonToExcelWorkspace` / `ExcelOptionsMenu` |
| converters/json-to-typescript | `/json-to-typescript` | `jsonToTypeScript` (infers and merges shapes, optional keys from array items, unions, nullable fields, named and deduplicated nested types, `TsOptions` for declaration, arrays, nulls, nesting, export, readonly, sorting and example comments; returns the code plus a type map); UI in `JsonToTypeScriptToolPage` / `JsonToTypeScriptWorkspace` (Code / Type Map tabs) / `TsCodeView` / `TsTypeMap` / `TsOptionsMenu` |
| converters/json-to-xml | `/json-to-xml` | `jsonToXml` (escaping, valid and unique element and attribute names with a list of renames, `XmlOptions` for root, indent, attributes or `@`/`#text` keys, arrays, nulls including `xsi:nil`, booleans, sorting, declaration and leaving out the root), `xmlName`; UI in `JsonToXmlToolPage` / `JsonToXmlWorkspace` / `XmlCodeView` / `XmlOptionsMenu` / `XmlRenamesMenu` |
| converters/json-to-sql | `/json-to-sql` | `jsonToSql` (PostgreSQL, MySQL, SQLite and SQL Server quoting, escaping and column types; insert, upsert and update with batching, transactions, CREATE TABLE and ignoring duplicates; nested objects and arrays as JSON, flattened or ignored; renamed columns; records suggestions), `columnName`; UI in `JsonToSqlToolPage` / `JsonToSqlWorkspace` / `SqlCodeView` / `SqlOptionsMenu` / `SqlColumnsCard` |
| converters/json-to-string | `/json-to-string` (`/string-to-json` redirects here) | Both directions on one page with a Swap button. `jsonToString` (minified, pretty or as-typed JSON; double, single or no quotes; optional \uXXXX escapes for non-ASCII; counts escapes); `stringToJson` (quoted, unquoted or single-quoted input, `\'` and `\xHH` escapes, unwraps repeated stringification) and `formatJson`; UI in `JsonToStringToolPage` / `JsonToStringWorkspace` / `StringCodeView` / `StringOptionsMenu` / `JsonOutputOptionsMenu` |
| converters/json-to-yaml | `/json-to-yaml` | `toYaml` (block or flow style, 2 or 4 spaces, sorted keys, quoting anything YAML would misread, literal blocks for multi-line text); UI in `JsonToYamlToolPage` / `JsonToYamlWorkspace` / `YamlCodeView` / `YamlOptionsMenu`, built on `features/converters/shared` (`ConverterOutputPanel`, `ConverterCodeView`, `ConverterPreviewTable`, `ConverterStats`, `parseInput`) |
| utilities/jwt-decoder | `/jwt-decoder` | `decodeJwt` (JWS compact tokens, a leading "Bearer " ignored, clear errors for JWE and malformed parts), `jwtStatus`, `jwtClaims` (registered claims first, time claims as dates), `verifyJwt` (Web Crypto: HS* with a secret, RS*, PS* and ES* with a PEM or JWK public key), `keyKind`, `base64UrlBytes`; UI in `JwtDecoderToolPage` / `JwtDecoderWorkspace` (Payload / Header tabs) / `JwtVerifyMenu` / `JwtClaimsCard` / `JwtTokenParts`, on the converters' shared panels |
| utilities/url-encoder | `/url-encoder` | Encode and decode on one page with a Swap button. `encodeUrl` (query value, full URL or form encoding, optionally line by line), `decodeUrl` (optional + as space; errors name the position of the first bad % or invalid UTF-8), `escapeCount`, `urlParts` (a full URL's parts and decoded query parameters); UI in `UrlEncoderToolPage` / `UrlEncoderWorkspace` / `UrlOptionsMenu` / `UrlCodeView` / `UrlPartsCard` |
| utilities/base64-converter | `/base64-converter` | Encode and decode on one page with a Swap button. `encodeBase64` (text or file bytes; URL-safe, padding, 76-character lines, data URI), `decodeBase64` (standard or URL-safe, any padding, line breaks and data: URIs, with clear errors), `describeBytes` (JSON, text, image, known file types or binary by signature), `hexDump`; UI in `Base64ConverterToolPage` / `Base64ConverterWorkspace` / `Base64OptionsMenu` / `Base64FileCard` / `Base64DecodedView`. `JsonInputPanel` takes `onFile` and `content` so a dropped or chosen file shows as a card instead of text |
| utilities/epoch-converter | `/epoch-converter` | `parseTime` (Unix seconds, milliseconds, microseconds or nanoseconds detected by length or chosen, keeping nanosecond precision; ISO 8601, RFC 2822 and other dates, zone-less ISO dates read as local or UTC), `timeFormats` (Unix, ISO 8601, UTC, your time zone, HTTP date, relative, day of year, ISO week), `formatZoned`; UI in `EpochConverterToolPage` / `EpochConverterWorkspace` (one value per line; a format list with copy buttons for one, a table for several; live current time in the stats) / `EpochOptionsMenu` / `EpochFormatsList` / `EpochResultsTable` |


Tools are grouped into five categories (`ToolCategory`), shown in search and on `/tools`, except converters and utilities, which have their own pages (`/converters`, `/utilities`): JSON Core (`core`), Explore JSON (`explore`), Compare & Query (`query`), Converter Hub (`converters`) and Developer Utilities (`utilities`). Labels and order live in `features/catalog.ts`; each category's heading icon and accent colour in `components/tool/tool-category-style.ts`.

**Tool inputs start empty.** No tool ships example JSON, and none pre-fills, restores or persists what the user pastes; placeholders only describe what to enter. Tools also show no "waiting" UI: result cards, stats and charts appear only once there is input, and actions live in panel headers like the home formatter (no separate top bars).

**Tool pages** render their own page component (for example `FormatterToolPage`, `DiffToolPage`) that wraps the tool's workspace in `features/tools/shared/tool-layout.tsx` (`ToolHeader` with the hero ad, the bottom ad, `ToolSeoContent` and structured data). The Formatter, Tree Viewer and Table Viewer share `FormatterToolPage` and the home page's `FormatterWorkspace`; the viewers pass `lockedView` to show only their view, without the Code / Tree / Table switcher.

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
| `components/ui/` — actions | `Button`, `ButtonLink` (internal, external and `mailto:` links) sharing `button-styles.ts`: variants primary, secondary, outline, subtle, chip, soft, accent; sizes tiny, xs, compact, sm, md, lg. `CopyButton`, `CopyIconButton` (icon-only with a "Copied!" bubble), `SegmentedControl`, `Popover` (portalled to the body so panels can't clip it, flips upwards and scrolls when space is short; a function child receives `close`), `Checkbox`, `DropZone` (reads a dropped file as text) |
| `components/ui/` — surfaces | `Card` (tones surface, raised, inset, base, faint; radius lg, xl, 2xl), `Panel` + `PanelTitle` (editor panel with toolbar), `HeroBand`, `FeatureCard`, `StatCard` (plain, or with an icon), `Callout` |
| `components/ui/` — content | `Badge` (brand, success; pill or note), `IconTile` (sm, md, lg; round), `BulletList` (dot, bullet, arrow), `FaqList`, `Kbd` (muted, solid), `SectionNav` |
| `components/ui/` — forms | `FormField`, `TextInput`, `Textarea`, `Select` (sharing `input-styles.ts`), `Checkbox`, `CodeEditor` (monospace input with line numbers, an optional `highlightLine` in danger or brand tone, and a `ref`), `LineGutter` (optional highlighted line) |
| `components/json/` | `JsonCodeView` (syntax highlighting and line numbers), `JsonTreeView` + `JsonTreeNode` (collapsible, optionally selectable), `JsonExplorerLayout` (output beside `JsonNodeInspector` + `InspectorField`, stacking on narrow containers), `JsonTreeExplorer` (selectable tree), `JsonTableExplorer` (row filter, `JsonTableColumnsMenu`, CSV export, selectable cells, rows revealed 200 at a time) over `JsonTableView` + `JsonTableCell`, `JsonPrimitive`, `JsonColorPicker` (theme presets from `json-color-themes.ts` plus per-token colours), shared `json-token-classes.ts` |
| `components/icons/` | One file per icon (`search.tsx`, `wand.tsx`, …) using `currentColor`; shared `IconProps` in `icon-props.ts` |
| `components/seo/` | `JsonLd`, `BreadcrumbJsonLd`, `FaqJsonLd` (used by guides), `pageMetadata()` (title, description, canonical, Open Graph, Twitter) |
| `components/tool/` | `ToolStructuredData`, `toolMetadata()` (built on `pageMetadata`), `ToolHeader` (icon, title, summary and an aside slot), `JsonInputPanel` + `toolPanelHeight` (the home formatter's input panel: title, `extraActions`, Clear, drag-and-drop; optional placeholder, soft wrap, `onFile` for binary files and `content` to replace the editor), `ToolSeoContent` (how-to, FAQ and related tools below each implemented tool), `ToolCard`, `CategoryHeading`, `ToolGlyph`, `tool-icons.ts` (icon and tint maps), `tool-category-style.ts` |
| `components/layout/` | `SiteHeader`, `SiteFooter`, `Logo`, `search/` (`SearchPalette`, `SearchResult`, `SearchHints`, `search-item.ts`) |
| `hooks/` | `useClipboard`, `useDownload`, `useUrlHash`, `useShortcutLabel`, `useStoredState` (localStorage-backed state), `useNow` (the current Unix time, ticking every second, null on the server), `useWorkerTask` (runs a task in a Web Worker, cancelling the previous run, with a main-thread fallback), `useJsonColors` |

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
│   ├── (converters)/converters (directory), json-to-yaml, json-to-csv, …
│   ├── (guides)/guides (directory), guides/<slug>
│   ├── (utilities)/utilities (directory), jwt-decoder, url-encoder, base64-converter, epoch-converter
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
│   ├── ads/   company/   converters/   guides/   home/   legal/   tools/   utilities/
│   └── catalog.ts
└── hooks/                      # use-clipboard, use-download, use-url-hash, use-shortcut-label, use-stored-state, use-worker-task, use-json-colors, use-now
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
- Structured data: `WebSite` (home), `ItemList` (`/tools`), `WebApplication` (tools, converters and utilities),
  `TechArticle` and `FAQPage` (guides), `AboutPage`, `ContactPage`, and `BreadcrumbList` on every inner page.
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest` and social images come from Next.js file
  conventions in `app/`.
- IndexNow: the key lives in `config/indexnow.json` and is served at `/<key>.txt`. After each successful
  production deploy, `.github/workflows/indexnow.yml` runs `scripts/indexnow.mjs`, which submits every sitemap URL
  to IndexNow (Bing, Yandex and the engines that share it). Run it by hand with `npm run indexnow`, or
  `npm run indexnow -- --dry-run` to list the URLs without submitting.

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
| `NEXT_PUBLIC_ADSENSE_SLOT_TOOL_BELOW` | empty: slot hidden (placeholder in dev) | Ad below a tool | AdSense → Ads → By ad unit → Display ad (`data-ad-slot`) |
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
