# Project SOP for AI Coding Assistants

These rules apply to every prompt in this project for the whole session, automatically. A
prompt never needs to repeat them; a prompt that does not mention a rule has not switched it off.

- **Must / never:** not done until the rule holds. **Should:** default; explain any deviation in
  one line.
- Examples are illustrations; never copy an example value into the project.
- **Conflicts:** safety rules (section 2) win, then the current prompt and the Golden Rule
  (section 1), then the project's own instruction files and conventions (they override this
  file's defaults, never sections 1–2), then the rest of this file. Name any conflict in one
  line in the report. If a rule cannot be met, stop and ask.

## 1. Golden Rule: one prompt, one task

- **Do exactly what the current prompt asks, to the standards in this file. Verify only that.
  Report. Stop.**
- **Each prompt is a separate task.** Earlier prompts give context, never extra work.
- **Scope** = what the prompt asks, plus only what it cannot work without.
- **Finished work is closed.** Never re-read, re-check, re-test or rework it unless the prompt
  names it. If the change could affect earlier work, check only where the two meet.
- **Smallest correct diff:** fewest files and lines.
- **Never do unless asked:** audits; refactoring, renaming, reformatting or cleanup of code this
  prompt did not change; optimisation or redesign; dependency changes (except removing one this
  change left unused); unrelated fixes; missing infrastructure (token system, test setup);
  extra docs, summaries or report files.
- **Standards apply automatically** to what you create or change, never as a reason to change
  anything else.
- **Out-of-scope problems:** one line each under "Not fixed". Do not fix or investigate them.
  If one blocks the task, stop and ask.
- **Effort matches the request.** Small prompt, small change, short reply. If it needs large
  work, stop and say why first.
- **Save tokens and time:** search, then read only matched lines and the sections of this file
  the task needs; never re-read an unchanged file; run each check once, the narrowest that
  proves the change; delegate only when needed; no preambles, narration or "shall I proceed?"
  on a clear task; never paste large files or logs or quote these rules back.

## 2. Safety rules (always, even when the prompt is silent)

- **Git:** never commit, push, merge, rebase, reset, checkout, switch, restore, stash, clean,
  tag or `--force`, and never rewrite history, unless told. Suggest a commit message instead.
- **Deploy:** never deploy, release, publish, submit to a store or bump versions unless told.
  Before: clean tree, checks pass, rollback path known, and for websites the release check
  (section 11.11) passes. After: confirm the new version is live, then re-check what changed.
- **Others' work:** never discard, overwrite, revert or reformat changes you did not make.
- **Boundary:** work only inside the project; no global installs or system config unless told.
- **Production:** never touch production, live data or real users (emails, payments,
  notifications, bulk updates, deletes) unless told.
- **Secrets:** only in environment or secret storage; never in code, logs, screenshots, public
  files or replies. Never print a value. Read secret files only when the task needs it.
- **No invented facts:** never make up a domain, brand name, contact, phone, profile URL, date,
  rating, review, address, price, statistic, client or award. Never ship placeholder values
  (`example.com`, sample emails, lorem ipsum). If a value is missing, ask.
- **Never silence a problem:** no deleted, skipped or loosened tests, assertions, validations or
  limits; no type, lint or warning suppressions; no catch-all escape hatches, empty handlers or
  swallowed errors. If a check is truly wrong, prove it and fix the check narrowly.
- **Licences:** use third-party code, fonts, images and icons only under a licence that allows
  it.

## 3. Prompt types

| Type | Do | Do not |
| --- | --- | --- |
| Question | Answer, citing file and line | Edit anything |
| Investigate | Find the root cause; report evidence and the fix | Apply the fix unless asked |
| Plan | Scope, approach, risks, open questions, estimate | Implement |
| Change or fix | Follow section 4 | Touch anything outside the scope |
| Review or audit | Findings for the named code or area only, by severity | Edit |
| Continue | Resume the unfinished item of the agreed plan | Redo finished items |
| Undo | Restore exactly the named change | Rework it |

If the type is unclear, take the narrower one and ask once.

## 4. Workflow for changes and fixes

1. **Understand.** Restate the request in one sentence. Read only what it names or implies.
   For setup or audit tasks, first list which required items exist and which are missing.
2. **Ask only if truly unclear:** what changes and what stays; where; exact values and owner
   inputs (section 11.2); how it will be checked; approvals needed (section 5); anything with
   two meanings. Ask everything in one round, recommended option first. Never ask what the
   prompt, the code or this file already answers.
3. **Plan** in one short message: files and parts in scope (binding) and the checks you will
   run. One line for small tasks. Then start; wait for confirmation only on large or
   cross-cutting work.
4. **Change.**
   - Use text, values and designs from the prompt verbatim.
   - Reuse existing patterns, components, tokens and helpers; match the surrounding code.
   - Keep every usage of what you change working (call sites, variants, screens, consumers of
     the same data, API or token). Update only doc lines describing the change.
   - Keep all behaviour not part of the request.
   - State every assumption; label every stub; never present placeholders as working.
   - Never invent APIs, options, commands, paths or config keys; confirm them in the installed
     code, lockfile or official docs.
   - Edit with the editor; keep each file's line endings, encoding, indentation and final
     newline.
5. **Verify only this change, with evidence.** Run it on the real target (build, tests,
   browser, device, endpoint or CLI); a passing build is not proof. Check adjacent states
   (sizes; hover, focus, disabled; loading, empty, error; other users of the component). Review
   the diff for only planned files and lines. Fix any regression you caused. Never write
   "should work"; if something cannot be verified, write:
   `Not verified: <what>. Reason: <why>. To check, run: <command>.`
6. **Remove every leftover.** Delete everything this change made unused, in the same change:
   code (functions, components, variables, imports, types, styles, tokens, translations, config
   keys, flags, routes, and their tests), files (old versions, unused images, fonts, icons,
   stale generated files, empty folders) and unneeded dependencies (manifest and lockfile).
   Search the entire project (code, templates, styles, config, content, build files, names
   built from strings) and delete only what has zero uses; if unsure, keep it and list it.
   Delete for real: no commented-out code, backups, `.old` copies or stubs. Database tables
   and columns, uploaded media and cloud resources need approval. Leftovers from before this
   prompt are listed, not deleted, unless asked. Then stop any process you started and delete
   your scratch files (kept outside the project).
7. **Report** (section 13).

**When things go wrong:** if a fix fails twice, stop and report attempts, exact errors and two
hypotheses. If the approach is wrong, say so; never stack fixes on it. If tools, network or
credentials block you, report the exact error and what is needed.

## 5. Needs approval first

A prompt that states the exact decision or value is the approval; list what you applied.
Approval is needed for:
- scope changes; new dependencies, services or paid tools; new tokens, components or patterns;
- user-facing copy, including titles, descriptions, headings and `llms.txt` wording;
- schema changes, migrations and deleting data;
- adding, removing or renaming public URLs or routes, domain, host or redirect rules, and
  public API contracts;
- authentication, permissions, privacy and security settings, including the `security.txt`
  contact and policy;
- rules for AI crawlers or other named bots;
- infrastructure, environments, CI/CD and secrets;
- public site files not listed in section 11.3;
- anything irreversible or that costs money.

## 6. Engineering

- **One source of truth**, defined once and reused: design values (tokens); repeated UI (one
  shared component); the route, screen and endpoint list; SEO and page metadata; configuration
  (origin, domains, URLs, environments and secrets are never hardcoded); validation rules and
  option lists shared by client and server; user-facing strings where the platform supports
  it. What a page shows and the data published about it (meta tags, structured data, sitemap,
  feeds, `llms.txt`, API) come from the same data.
- **Generated files** are never hand-edited. Regenerate them with the project's own step and
  include them in the change that caused them.
- **Missing structure** (tokens, shared components, tests, type checks): follow the existing
  convention and list the gap. Never build it unasked.
- The build runs the type check and linter where the language has them.
- Stay within the project's supported versions. Handle errors where possible; surface the rest.
- No dead code, debug output or temporary flags. No speculative abstraction. Comments explain
  why, never narrate the change.
- Detect, don't assume: check versions, files and defaults before relying on them.
- **Know what ships:** the build includes every file read at runtime; ignore patterns are
  anchored; deploys remove stale files.

## 7. Tests and bugs

- A logic change gets at least one test that fails if the logic breaks, in the project's test
  framework. With no framework, verify by running the code and note the gap.
- Tests are deterministic and contain no real personal data or secrets.
- Run only relevant tests; the full suite only when shared code changed or the prompt asks.
- **Bug fixes:** reproduce; state the root cause with evidence; check every caller; make the
  smallest fix once, at the cause; add a regression test; confirm the reproduction passes.

## 8. Security and data

- Validate input on the trusted side, even when the client validates. Escape output for its
  context. Use parameterised queries only.
- Check authentication and authorisation on the trusted side for every protected action, in
  one place. Least privilege for keys and roles.
- Collect only needed personal data.
- Commit lockfiles. No dependency with a known critical vulnerability.
- **Repository:** `.env` files, keys and local config are in `.gitignore`; example env files
  hold names only. Never deploy `.git`, env files, backups, logs or database dumps.
- **Security headers** on every HTML response of a public site, unless the platform sets them:
  HTTPS only with `Strict-Transport-Security` (`max-age` ≥ one year);
  `Content-Security-Policy` allowing only sources the site uses, including `frame-ancestors`;
  `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin` or
  stricter; `Permissions-Policy` disabling unused features. Session cookies are `Secure`,
  `HttpOnly` and `SameSite`. A stricter policy that could break features needs approval.
- **Database:** schema changes only via migrations that are reversible, tested up and down on a
  copy and compatible with deployed code; back up before destructive changes; constraints
  enforce integrity; times in UTC (ISO 8601); money never as floating point.

## 9. UI and design (any visual interface)

Use the project's tokens and conventions; these defaults apply only where it has none. Pixel
values are for the web; native platforms use their own size classes and units.

- **Colour:** palette tokens by role only (text, surface, primary, border,
  success/warning/error/info). WCAG 2.2 AA contrast: 4.5:1 text; 3:1 large text, UI parts and
  focus indicators. Every theme defines every role.
- **Typography:** at most two families (display, body) or the system font, non-blocking. Each
  style (headings 1–6, body, lead, small, caption, label, button) has one definition (family,
  size per breakpoint, weight, line height, letter spacing, spacing) used everywhere. Headings
  follow the outline, never the look: one H1 per page or screen, no skipped levels. Weights:
  H1–H2 700; H3–H6 and card titles 600; body 400; labels, buttons, navigation 500. Body lines
  60–80 characters. One case rule for headings and buttons (default Title Case), written in the
  text, never faked with CSS.
- **Spacing:** 4/8-based scale only. Every section of a section-based layout uses one vertical
  padding token: 80px at ≥ 1024px, 60px at 768–1023px, 40px at ≤ 767px. Never override it or
  add margins between sections, except for a first section clearing a fixed header (bottom
  keeps the token) and two sections designed to read as one.
- **Layout:** one container and one grid. Breakpoints ≤ 767, 768–1023, ≥ 1024px, plus one large
  tier if used; no ad hoc ones. No horizontal scroll or clipping from 320px up. Respect device
  safe areas.
- **Buttons:** one shared component; never hand-style a button or dress a link as one. All
  share sizes, fonts, spacing, borders, radius, icons, transitions and focus; variants
  (primary, secondary, optional tertiary) differ only in colour. Pairs: primary + secondary,
  14px gap, full-width stack on small screens. Arrows only on actions that navigate;
  decorative icons hidden from assistive tech. States: hover, pressed, visible focus, disabled,
  loading (same size). Touch targets ≥ 44 × 44 (48dp on Android). Navigation is a link, an
  action a button. Labels start with a verb and are specific ("Get a Quote", not "Click Here").
- **Page header (hero):** one shared component (a distinct home hero is allowed), in order:
  breadcrumb or back link → optional eyebrow → title → intro → optional button pair → optional
  visual. Visuals stay in their box (no overlap, clipping or layout shift), with a static
  fallback for small screens and reduced motion.
- **Other elements:** one token set or shared component each: borders, radius, shadows,
  z-index, transitions (150–250 ms), icons (one set, one stroke), image ratios, cards, fields,
  dialogs, tabs, accordions, badges, toasts. Data views have empty, loading and error states.
- **Accessibility:** keyboard-only use with visible focus, moved correctly for dialogs and page
  changes; landmarks; native controls first. Images have alt text (empty if decorative) and
  set dimensions; fields have labels; errors are announced and say how to fix them. Colour is
  never the only signal. Works at 200% zoom, large system text and reduced motion. Video has
  captions; nothing flashes over three times a second.
- **Verify UI:** screenshots at each touched breakpoint (web: 320, 375, 768, 1024, 1440px);
  check states and other users of the component; shared UI shows no unintended before/after
  difference; no new console errors or warnings.

## 10. Content

- Use the exact text the prompt gives; otherwise propose copy for approval. List changed
  strings in the report.
- Brand name in one exact form everywhere; no unverifiable claims (section 2).
- Consistent terms and date, number and currency formats. Internal links point to final URLs.
- Error messages say what happened and what to do next.

## 11. Websites: SEO, security and AI files

### 11.1 When this applies
- Every public production website (reachable by search engines and visitors) must meet this
  section before release. Staging, preview and private sites follow section 11.11.
- Building a new site or page includes this section for what is built.
- Changing pages, routes, head tags, content or any file in section 11.3: apply it to what
  changes, verify those items, and list other gaps once under "Not fixed".
- Asked to set up, audit, launch or make a site compliant: bring the whole site to this
  section, in order: owner inputs → SEO data → head tags and structured data → status,
  redirects and 404 → `robots.txt` → sitemap → `security.txt` → security headers → `llms.txt`
  → checks (section 11.12).

### 11.2 Owner inputs (ask for all missing ones in one round)
1. Canonical origin: scheme, host, and whether `www` or the bare host is canonical.
2. Brand name in its exact form.
3. Language or languages (and regions).
4. Environment: public production, staging or preview, or private.
5. Security contact (a monitored email or HTTPS page, and who monitors it) and policy URL.
6. Real profile URLs owned by the brand (may be none).
7. Logo and default social image files.
8. Contact details the site shows, if they may go into structured data.
9. AI crawler policy for `robots.txt` (default: no special rules).

### 11.3 Required files on every public production site

| File | Location | Source |
| --- | --- | --- |
| SEO data | One file or module (default `seo.json` at the project root) | Generated from page data, or the single source |
| `robots.txt` | `/robots.txt` on every public host | Static or generated |
| XML sitemap | Path declared in `robots.txt`; an index if several | Generated from SEO data |
| `security.txt` | `/.well-known/security.txt` on every public host | Stored static file |
| `llms.txt` | `/llms.txt` on the canonical host | Generated from SEO data |
| Social image, icons | Linked from every page head | Design assets |
| Custom 404 page | Served for every unknown URL | Template |

Optional, with approval: `llms-full.txt`, legacy `/security.txt`, Markdown page copies. No other
speculative files (`ai.txt`, `humans.txt`, `ads.txt`, agent manifests) unless asked.

### 11.4 SEO data
- One place for all per-page SEO data; head tags, structured data, sitemap, `llms.txt` and
  checks read from it. Use the project's or framework's equivalent if it exists; never a second.
- Prefer generating it from the data pages render (checks fail when stale). With no generation
  step, it is the single source. JSON: valid UTF-8, public data only, stable key order, no
  per-build values.
- **Site fields:** brand name, canonical origin (no trailing slash), default language, default
  social image (path, width, height, type, alt), organisation (name, logo path, real profile
  URLs).
- **Route fields**, keyed by canonical path (lowercase, hyphenated, no query or fragment):
  schema.org page type, title, description, H1, indexable, hidden, breadcrumb (all but home),
  last-modified (`YYYY-MM-DD`, changed only when content or SEO data changes), and where they
  apply: page image, visible published/updated dates, language alternates.
- **Checks after regeneration:** required fields present; each path canonical and unique; no
  duplicate titles or descriptions among indexable routes; lengths within section 11.5; H1 and
  breadcrumb equal the rendered page; exactly the indexable, non-hidden routes are in the
  sitemap and `llms.txt`.

### 11.5 Every indexable page
- **URL and status:** the canonical URL answers 200 (HTTPS, one host, lowercase, hyphenated,
  stable, one trailing-slash convention). Every other form (HTTP, other host, case, extra
  slashes) gets one 301 to it, keeping the query; no chains. Removed or renamed URLs get one 301
  to the closest replacement, never a catch-all to home; update internal links. Unknown URLs
  return a real 404 (helpful page, `noindex`, no canonical, social tags or structured data),
  never a soft 404. Fallbacks never intercept system paths (`/.well-known/`,
  `robots.txt`, sitemaps, `llms.txt`, assets, API, auth, admin, health checks). Parse paths
  safely.
- **Canonical:** exactly one, absolute, self-referencing, equal to the 200 URL.
- **Title:** one, unique, accurate, topic first; brand once with one site-wide separator (home
  may lead with the brand); 30–60 characters (50–60 preferred); no stuffing, all-caps or
  generic titles.
- **Description:** one, unique, accurate; 120–160 characters (150–160 preferred); the offer plus
  a next step.
- **Robots:** one robots meta tag. Indexable pages never force `index` and declare
  `max-snippet:-1, max-image-preview:large, max-video-preview:-1`; never `nosnippet` or
  `max-snippet:0`. `noindex` on thank-you, search, filtered, utility, staging and 404 pages.
  Never combine `noindex` with a `robots.txt` block. Non-HTML files kept out of search use
  `X-Robots-Tag`. A host or CMS "discourage indexing" setting always wins.
- **Content:** `lang` on the root element; headings per section 9; real `<a href>` links to
  final canonical URLs; every indexable page linked from navigation or a hub page.
- **Social tags:** `og:type` (`article` for dated posts, else `website`),
  `og:site_name`, `og:locale`, `og:title`, `og:description`, `og:url` (= canonical),
  `og:image` with `:width`, `:height`, `:type`, `:alt`; `twitter:card` =
  `summary_large_image` with `twitter:title`, `twitter:description`, `twitter:image`,
  `twitter:image:alt`. Image: absolute HTTPS, 200, JPG or PNG, default 1200 × 630, minimum
  200 × 200, ≤ 5 MB, key content centred. Social copy = meta copy unless other is approved.
- **Icons:** square favicon, a multiple of 48px (≥ 48), `rel="icon"`; 180 × 180 PNG
  `rel="apple-touch-icon"`; 192 and 512px icons if there is a web app manifest; structured-data
  logo ≥ 112 × 112.
- **Multilingual:** each version has a self-referencing canonical and reciprocal `hreflang`
  links to all versions (absolute URLs, valid codes, optional `x-default`), one method
  throughout, and its own sitemap entry.
- Escape every head value.

### 11.6 Structured data (JSON-LD)
- One `<script type="application/ld+json">` per page with one `@graph`, generated in one place
  from the SEO data; none on 404 pages; no second block from components, plugins or tag
  managers. Escape `<` in the JSON.
- Nodes connect by `@id`; every reference resolves in the graph; all URLs absolute.
- Every page: `Organization` (name, url, logo, `sameAs` only for real profiles), `WebSite`
  (name, url, publisher), and `WebPage` or its subtype (name, description, url, `isPartOf`,
  `inLanguage`). All but home: `BreadcrumbList` equal to the visible breadcrumb. Listings:
  `ItemList`. Dated posts: `BlogPosting` or `Article`, `headline` = H1, dates = visible dates.
  Service pages: `Service`.
- **Only facts the page visibly shows.** Reviews, ratings, products, prices, offers, addresses,
  hours, authors, events, jobs, video and awards only if shown and approved. FAQ or how-to
  markup only mirrors visible content and is never added for rich results.
- Validate one URL per affected page type (Schema.org validator, Google's Rich Results Test):
  zero errors; warnings only for deliberately omitted fields, named. A check fails when data
  and page disagree.

### 11.7 Rendering
- Raw HTML, before JavaScript, contains the full content, H1, real links, all head tags and the
  JSON-LD. Public pages are server-rendered, statically generated or prerendered, with no
  hydration mismatches; tab and accordion content is in the HTML.
- Status codes and head tags never depend on a cache or prerender artefact.
- Content hidden for animation has the same start state on server and client and a
  `<noscript>` fallback.

### 11.8 robots.txt and sitemap
- **`robots.txt`:** on every public host, 200 directly (no redirect), UTF-8 plain text, under
  500 KiB. Production: `User-agent: *` blocking nothing, plus an absolute `Sitemap:` line per
  sitemap or index. Never `Disallow: /` on production; never block CSS, JS or images pages need;
  never list hidden URLs; never use it to deindex (use `noindex`). No AI-crawler or named-bot
  rules without an owner policy; name that decision in the report.
- **Sitemap:** generated from the SEO data, UTF-8, ≤ 50,000 URLs and 50 MB uncompressed per
  file (split and add an index beyond that). Lists exactly the canonical, indexable, non-hidden
  URLs that answer 200, each once, absolute, same host. Each entry has `<lastmod>`
  (`YYYY-MM-DD`) equal to the route's last-modified; no `<changefreq>` or `<priority>`.
  Declared in `robots.txt`. After route changes, submit the index in the search engines'
  webmaster tools (only when told to touch production accounts).

### 11.9 security.txt (RFC 9116)
- Stored in version control, served at `/.well-known/security.txt` on every public host it
  covers (not subdomains): HTTPS, 200 directly, `text/plain; charset=utf-8`, never HTML or an
  app fallback. UTF-8, one field per line, `#` comments, under 32 KiB.
- **Required:** `Contact:` at least once (`mailto:`, `tel:` or `https://`, preferred first);
  `Expires:` exactly once, RFC 3339, less than 12 months ahead. **Recommended:** `Canonical:`,
  `Policy:`, `Preferred-Languages:`. Optional: `Acknowledgments:`, `Hiring:`, `Encryption:` (a
  URI, never the key). All web URIs use `https://`.
- Values come only from the owner. An unmonitored contact or an expired file is worse than none.
  Renew at 60 days or fewer; whenever you touch or are asked about the file, report if
  `Expires` is within 60 days or past.
- A legacy `/security.txt` only redirects to or copies this file. No user, plugin or app route
  may create or overwrite the path.

```text
Contact: mailto:<monitored security address>
Expires: <YYYY-MM-DD>T23:59:59Z
Preferred-Languages: <language tags>
Canonical: https://<canonical host>/.well-known/security.txt
Policy: https://<canonical host>/<security policy path>
```

### 11.10 llms.txt and AI crawlers
- `llms.txt` (llmstxt.org) is a community proposal, not a standard; some search engines ignore
  it. Never claim it improves rankings, visibility or citations.
- `/llms.txt` on the canonical host, 200 directly, UTF-8 Markdown as `text/plain` or
  `text/markdown`, generated from the SEO data and regenerated when routes, titles or
  descriptions change.
- **Structure:** one H1 (brand name); a one- or two-sentence blockquote summary; optional plain
  paragraphs; H2 sections of links (`- [Title](absolute URL): short note`); a final
  `## Optional` section for secondary pages.
- **Content:** only canonical, indexable, non-hidden pages answering 200, each once, titles and
  notes from the SEO data; curated, not a sitemap copy; only facts the site shows; no
  superlatives, secrets, or instructions and hidden prompts aimed at AI systems.
- `llms-full.txt` only with approval, under the same rules. AI crawler access is set only in
  `robots.txt`; `llms.txt` never contradicts it.

### 11.11 Non-public pages, environments and releases
- **Hidden pages** (private, token-gated, campaign): `noindex, nofollow` as meta tag and
  `X-Robots-Tag` on every response, including redirects; out of the sitemap, `llms.txt` and
  navigation; never named in `robots.txt`.
- **Staging, preview, development:** behind authentication where possible, otherwise `noindex,
  nofollow` on every response; never rely on `robots.txt` alone. Never copy `robots.txt`,
  sitemaps or SEO data between environments.
- **Release check, before and after each production release:** all section 11.3 files pass;
  `robots.txt` allows crawling; no stray `noindex`; no non-production host in canonicals,
  sitemap or structured data; `security.txt` not expired. Compare a plain URL with `?cb=1`
  before calling a file missing or stale (caches).

### 11.12 Checks
Run only the checks that apply. Set `HOST` and `PAGE` (a changed path).

```sh
HOST="<canonical host>"; BASE="https://$HOST"; PAGE="/<changed path>"; TMP=/tmp/sop-check

# 1. Site files: 200, text or XML type, no redirect
for u in /robots.txt /sitemap.xml /llms.txt /.well-known/security.txt; do
  printf '%-28s ' "$u"
  curl -s -o /dev/null -w '%{http_code} %{content_type} %{redirect_url}\n' "$BASE$u"
done

# 2. robots.txt: Sitemap lines print; "Disallow: /" must not
curl -s "$BASE/robots.txt" | grep -iE '^(sitemap:|disallow:[[:space:]]*/[[:space:]]*$)'

# 3. security.txt: contact >= 1, expires = 1, html = 0; Expires in the future
curl -s "$BASE/.well-known/security.txt" -o "$TMP"
echo "contact $(grep -ci '^contact:' "$TMP") expires $(grep -ci '^expires:' "$TMP") html $(grep -ci '<html' "$TMP")"
grep -i '^expires:' "$TMP"

# 4. Raw HTML: head tags print; h1 = 1, json-ld = 1
curl -s "$BASE$PAGE" -o "$TMP"
grep -oiE '<title>[^<]*</title>|<link[^>]*rel="canonical"[^>]*>|<meta[^>]*name="(description|robots)"[^>]*>' "$TMP"
echo "h1 $(grep -oi '<h1[ >]' "$TMP" | wc -l) json-ld $(grep -oi 'application/ld+json' "$TMP" | wc -l)"

# 5. One 301 to HTTPS; unknown URL returns 404
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "http://$HOST/"
curl -s -o /dev/null -w '%{http_code}\n' "$BASE/no-such-page-$$"

# 6. Security headers (section 8)
curl -sI "$BASE/" | grep -iE '^(strict-transport-security|content-security-policy|x-content-type-options|referrer-policy|permissions-policy):'
rm -f "$TMP"
```

Also run the SEO data checks (11.4), structured-data validators (11.6) and an HTML validator on
changed templates. Check search engines' current docs before relying on an engine-specific rule.

## 12. Forms, APIs, performance, apps, languages

- **Forms:** validate on client and server from one rule set; spam protection on public forms;
  loading, success and error states; no data lost on error; no double submits; one real test
  submission.
- **APIs:** the contract (schema, spec or types) is the source of truth; no breaking change
  without versioning and approval; consistent naming, errors, status codes and pagination;
  errors never leak internals; outgoing calls have timeouts; retried operations are
  idempotent; every endpoint has authentication, a rate limit and bounded output.
- **Performance:** at the 75th percentile of real mobile visits, LCP ≤ 2.5 s, INP ≤ 200 ms,
  CLS ≤ 0.1. Images in modern formats, lazy-loaded below the fold; the largest above-the-fold
  image loads with priority, never lazily. Fonts subset and non-blocking; third-party scripts
  deferred; no N+1 queries. Back performance claims with before/after numbers.
- **Native apps:** guard APIs above the minimum OS; ask for permissions in context and work when
  denied; handle offline, backgrounding and interruptions; follow platform guidelines; no
  signing keys or store credentials in the repo.
- **Multiple languages:** all strings in string files; no sentences built by concatenation;
  locale formatting for dates, numbers and currency; layouts allow about 40% longer text and
  right-to-left scripts.
- **Logging:** structured, without secrets or unneeded personal data; no new tracking without
  approval.

## 13. AI files, delegation and reporting

- **AI instruction files:** keep this SOP as identical copies wherever the project's AI tools read
  instructions (for example `AGENTS.md`, `.claude/rules/project-sop.md`,
  `.github/copilot-instructions.md`). Update all copies together; no secrets in them.
- **Delegation:** give the agent exact scope, files, acceptance criteria and the Golden Rule;
  check its result.
- **Long tasks:** keep plan and progress in a task list so "continue" resumes exactly. Never
  report partial work as done.
- **Language:** reply in the user's language; code and commits in the project's language.
- **Done** = applicable checks passed with evidence, generated files included, diff limited to
  the scope, no leftovers, no placeholder values in production files.
- **Report** (skip empty items; two to four lines for small tasks):
  1. **Changed:** files with line references and why, including deleted leftovers.
  2. **Verified:** each check and its result (output and counts, not adjectives).
  3. **Not verified:** in the section 4 format.
  4. **Assumptions:** aim for none.
  5. **Not fixed:** out-of-scope issues and SOP gaps, one line each, naming the section.
  6. **Owner decisions needed:** from sections 5 and 11.2.
  7. **Suggested commit message.**

  Questions, investigations, plans and reviews get a direct answer instead.
- **Before every reply, confirm silently:** only this task done, to standard; nothing outside the
  plan or finished earlier touched; verified with evidence; nothing invented; out-of-scope
  issues listed, not fixed; no leftovers, running processes or temp files; reply as short as
  the task allows.
