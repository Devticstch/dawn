# Design System — reference: xo-futurer

Measured design rules of the reference storefront https://xo-futurer.myshopify.com/ (Shopify theme
"Futurer" 3.0.0, store name shown as "UNIQCASE"), for rebuilding its look in the Tech2C theme.

- **Audited:** 2026-10-15, in headless Chrome (desktop and mobile emulation), by reading computed
  styles, bounding boxes and the theme's CSS custom properties on the live pages, plus screenshots.
- **Units:** CSS pixels. `1rem = 10px` on the reference (`html { font-size: 62.5% }`).
- **Viewports measured:** 1920, 1440, 1400, 1200, 1199, 1141, 1140, 1024, 992, 991, 768, 767, 576,
  390 (see the [audit coverage](#audit-coverage-and-limitations) for which page used which width).

**Evidence tags** — every value carries one:

| Tag | Meaning |
| --- | --- |
| **[M]** | Measured: read from computed styles or element boxes on the live page. |
| **[T]** | Theme token: the value of a CSS custom property defined by the reference theme. |
| **[S]** | Seen: confirmed on a screenshot, but not read from computed styles. |
| **[E]** | Estimate: derived or approximate. Re-measure before relying on it. |

Values without a tag in a table inherit the tag of the table heading.

The reference's product photos, logos, copy and product claims belong to that store. Use this file
for **layout, type, color, spacing and behavior** only (see `CLAUDE.md`).

---

## 1. Global tokens

### 1.1 Colors [T]

Defined as RGB triplets (`--color-*: r,g,b`) and used as `rgb(var(--color-…))` or with an alpha.

| Role | Value | Token / usage |
| --- | --- | --- |
| Text (foreground) | `#1E1E1E` (30,30,30) | `--color-foreground`; headings, body, prices |
| Text, secondary | `rgba(30,30,30,0.75)` [M] | card labels, product-card category titles |
| Text, muted | `rgba(30,30,30,0.65)` / `0.6` / `0.5` [M] | spec labels, search label, table text |
| Background | `#FFFFFF` | `--color-background` |
| Layer / panel | `#F6F6F6` (246,246,246) | `--color-background-2`, `--color-layer`; cards, panels, service cards |
| Accent / primary button | `#0F61FF` (15,97,255) | `--color-accent`, `--color-button`; buttons, badges, links, announcement bar, footer |
| Button text | `#FFFFFF` | `--color-button-text` |
| Secondary button | bg `#FFFFFF`, text `#0F61FF`, border `rgba(15,97,255,0.4)` [M] | `--color-secondary-button*` |
| Tertiary button | bg `#4BA8EB`, text `#FFFFFF` | `--color-tertiary-button*` (not seen in use) |
| Gray button | bg `#EEEEEE`, text `#1E1E1E` | `--color-gray-button*` |
| Dark button | bg `#1E1E1E`, text `#FFFFFF` | `--color-dark-button*` |
| Border | `#E5E5E5` (229,229,229) | `--color-border`; usually with alpha 0.2–0.5 [M] |
| Sale badge | bg `#DA1E28`, text `#FFFFFF` | `--color-badge-sale-*`, `--color-error` |
| New badge / success | `#10A71F` | `--color-badge-new-background`, `--color-success` |
| Sold-out badge | bg `#EEEEEE`, text `#4D4D4D` | `--color-badge-sold-out-*` |
| Overlay | `#000000` | `--color-overlay` (drawer backdrop opacity 0.4, modal 0.5) |
| Glow / blur tint | `#135AB2` (19,90,178) | `--color-blur` |
| Accent tint (pills) | `rgba(15,97,255,0.1)` [M] | search tag pills |

Most used backgrounds across all audited pages [M]: white, `#0F61FF`, `#F6F6F6`, `#DA1E28` (sale
badges), `rgba(30,30,30,0.1)` (image loading placeholder), `#1E1E1E` (dark sections).

### 1.2 Typography [T][M]

| Token | Value |
| --- | --- |
| Body family | `Inter, sans-serif`, weight **500** (`--font-body-weight`), bold weight 500 |
| Heading family | `"Instrument Sans", sans-serif`, weight **600** |
| Body size | 16px desktop (≥768px), 15px mobile (≤767px) [M] |
| Heading line heights | h1 1.1; h2–h6 1.3 (tokens). Measured section titles use 1.2 [M] |
| Fonts loaded [M] | Inter 500, Inter 700, Instrument Sans 600, GTStandard-M 500 (also declared: Inter italics, GTStandard-M 450/600) |

Instrument Sans and Inter are in Shopify's font library (`instrument_sans_n6`, `inter_n5`). GTStandard-M
is a commercial font loaded by the theme's builder app; where it is used could not be traced (see
limitations). Do not use it.

**Type scale in use** [M] (most frequent first, all pages):

| Style | Family | Size / line height | Weight | Letter spacing | Used for |
| --- | --- | --- | --- | --- | --- |
| Nav / label | Inter | 14 / 19.88 | 500 | normal | menu items, card labels, tags |
| Body | Inter | 16 / 22.4 | 500 | −0.16px (−0.01em) | announcement text, body |
| Body small | Inter | 15 / 21.3 | 400 | normal | mega-menu links, descriptions |
| Body medium | Inter | 15 / 21.3 | 500 | normal | buttons, captions |
| Product title | Instrument Sans | 16 / 20 | 500 | −0.16px | product cards |
| Price | Inter | 14 / 19.88 | 500 | normal | cards; 18 / 25.56 in featured product |
| Badge | Inter | 14 / 19.88 | 400 | normal | "Sale 15%" |
| Eyebrow | Inter | 14 / 19.6 or 16 / 22.4 | 500 | normal / −0.16px | uppercase labels (case written in text) |
| Article body | Inter | 16 / 25.92 | 400 | −0.16px | blog content |
| Footnote | Inter | 13 / 15.99 | 500 | normal | footer bottom bar (mobile) |
| Card heading | Inter | 20 / 21 | 500 | −0.2px | mega-menu intro, article card titles |
| Section title | Instrument Sans | 42 / 50.4 | 600 | normal | "Best Sellers", most sections |
| Section title, large | Instrument Sans | 50 / 60 | 600 | normal | "Extreme…", "Shop the feed" |
| Panel title | Instrument Sans | 31 / 37.2 | 600 | normal (−0.93px in drawers) | category panels, cart drawer |
| Feature title | Instrument Sans | 60 / 72 | 600 | normal | "Spice up your…" |
| Page title | Instrument Sans | 75 / 97.5 | 600 | −3.75px (−0.05em) | Cart, Contact, 404, product title |
| Display | Instrument Sans | 100 / 104–110 | 600 | −6px (−0.06em) | product tabs, "Blog", stats |
| Hero display | Instrument Sans | 140 / 145.6 | 600 | −2px | hero "Air Tech" |
| Overlay display | Instrument Sans | 150 / 151.5 | 600 | −1.05px | "Slim" image overlay |

**Responsive type** [M] (homepage sections):

| Role | 1920 | 1440 | 1024 | 768 | 390 |
| --- | --- | --- | --- | --- | --- |
| Section title | 42 | 42 | 31 | 24 | 24 |
| Section title, large | 50 | 50 | 42 | 25 | 25 |
| Feature title (60) | 60 | 60 | 50 | 32 | 32 |
| Display (product tabs) | 120 | 100 | 54 | 54 | 54 |
| Spec display | 100 | 100 | 75 | 44 | 44 |
| Page title | — | 75 | — | — | 36 |
| Hero subtitle / display | 20 / 140 | 20 / 140 | 20 / — | 72 [M] | 72 [M] |

Large headings are split into per-character spans that animate in (see 7.3).

### 1.3 Radii [T][M]

| Token | Value | Used for |
| --- | --- | --- |
| `--button-radius` | 100px (10rem) | all pill buttons |
| `--product-card-radius` | 28px | product cards |
| `--collection-card-radius`, `--gallery-radius`, `--mega-menu-radius`, `--modal-corner-radius` | 20px | category panels, image cards, email field |
| `--badge-radius` | 16px | sale badges, cart count |
| `--header-radius-1` / `-2` | 14px / 23.5px | featured-product box / mobile header pill |
| `--image-radius`, `--general-radius-1` | 10px | images, service cards, article hero |
| small cards [M] | 8px | mega-menu image cards, search suggestion cards |
| dropdown [M] | 7px | simple dropdown panel |
| icon button boxed [T] | 6px | 40px square icon buttons |
| side actions [M] | 25px | floating scroll-top / dark-mode pill |
| shoppable feed card [M] | 24px | |
| circles | 50% | round icon buttons, swatches, avatars, dots |

### 1.4 Shadows [M]

The design is almost flat. Only these shadows appear:

| Element | Shadow |
| --- | --- |
| Mobile header pill | `0 34px 104px rgba(0,0,0,0.1)` |
| Floating side actions | `0 4px 20px rgba(0,0,0,0.1)` |
| Shoppable-feed tags | `0 4px 16px rgba(0,0,0,0.08)` |
| Simple dropdown | `0 1px 1px rgba(0,0,0,0.1)` |
| Sticky add-to-cart bar | `0 4px 29px rgba(0,0,0,0.15)` |

Cards, panels, mega menus and the sticky header have **no** shadow.

### 1.5 Borders [M]

| Use | Border |
| --- | --- |
| Primary button | 1px solid `#0F61FF` |
| Secondary button | 1px solid `rgba(15,97,255,0.4)` |
| Header bottom (transparent state) | 1px solid `rgba(229,229,229,0.5)` |
| Spec / accordion rows | 1px solid `rgba(229,229,229,0.2)` |
| Swatch ring | 1px solid `rgba(184,184,184,0.15)` |
| Inputs | 1px solid `rgba(229,229,229,0.4)` |
| Dividers (menus) | 1px solid `rgba(30,30,30,0.1)` |
| Side actions | 1px solid `rgba(229,229,229,0.5)` |

### 1.6 Motion [T][M]

| Use | Transition |
| --- | --- |
| Default UI | `all 0.3s ease` (most common) |
| Buttons (fill slide) | `0.5s cubic-bezier(0.25,0.74,0.22,0.99)` |
| Header show/hide, header colors | `0.5s cubic-bezier(0.31,0.41,0.38,0.96)` |
| Icon buttons, card add buttons | `0.3s cubic-bezier(0.31,0.41,0.38,0.96)` |
| Heading characters | `transform 0.5s ease-in-out` |
| Scroll reveal | animation `0.5s cubic-bezier(0,0,0.3,1) both`, from opacity 0 |
| Link underline | `background-size 0.4s cubic-bezier(0,0,0.3,1)` |
| Images (hover zoom) | `0.5s` |
| Small icons | `all 0.2s ease` |

Named easing tokens [T]: `--out-soft: cubic-bezier(0,0,.3,1)`, `--out-cubic: cubic-bezier(.215,.61,.355,1)`,
`--in-out-cubic: cubic-bezier(.645,.045,.355,1)`, `--out-quart: cubic-bezier(.165,.84,.44,1)`,
`--spring: cubic-bezier(.27,.79,.45,1.24)` (plus in/out quad, quart and sine variants).

---

## 2. Layout and spacing

### 2.1 Container [T][M]

- Content containers (`xo-container`) have `max-width: 1920px` (`--page-width: 192rem`) and
  horizontal padding `--container-gap`.
- `--container-gap` scales **linearly with the viewport**: 22px at ≤800px wide, 164px at ≥1900px:

  ```css
  /* reference formula, simplified (rem = 10px) */
  --container-gap: clamp(2.2rem, calc(12.909vw - 8.127rem), 16.4rem);
  ```

  Tokens: `--page-gap: 16.4`, `--page-gap-mobile: 2.2`, `--container-min-viewport: 80`,
  `--container-max-viewport: 190` (rem).

| Viewport | Side gutter [M] | Content width |
| --- | --- | --- |
| 1920 | 164 | 1592 |
| 1893 | 164 [S] | ≈1565 |
| 1440 | 104.6 | 1230.8 |
| 1400 | 99.5 | 1201 |
| 1200 | 73.6 | 1052.8 |
| 1024 | 50.9 | 922.2 |
| 992 | 46.8 | 898.4 |
| 768 | 22 | 724 |
| 390 | 22 | 346 |

- Full-bleed sections (hero, image banners, gallery strips, collection banner) span 100% of the
  viewport with no gutter [M].
- The **header** uses its own gutter: logo at x=51 at 1440px [M] (≈50px), x=22 on mobile [M].
- Hero text sits 38px from the left edge at 1440 [M].

### 2.2 Grid [T][M]

| Token | Value |
| --- | --- |
| Grid gaps, desktop | 28px horizontal and vertical (`--grid-desktop-*-spacing`) |
| Grid gaps, mobile | 14px |
| Two-column sections | 2 × 601.4px with 28px gap at 1440 [M] |
| Product-card rows | 20px gap at 1440 (4 per view) [M]; 10px gap at 390 (2 per view) [M] |

### 2.3 Section spacing [M]

There is **no global section-spacing token** (`--spacing-sections: 0px` [T]); every section sets its
own vertical padding. Observed top/bottom padding (container edge to section edge):

| Viewport | Most common | Range |
| --- | --- | --- |
| 1440 | 50px; then 55–56, 63, 70, 80, 100 | 0–121 |
| 390 | 50px; then 63, 32, 40 | 0–150 |

Measured examples at 1440: Best Sellers + feature area 55 / 107; category panels 72 / 63;
multi-column 83 / 88; cart page heading 120 / 24; breadcrumb 100 / 0.

Recurring small gaps (flex/grid `gap`) [M]: 4, 5, 7, 10, 12, 18, 28px (desktop) and 14px (mobile grid).

### 2.4 Breakpoints [M]

From the theme stylesheets (number of rules) and confirmed by resizing:

| Breakpoint | What changes (verified) |
| --- | --- |
| **≥ 1141px** | Desktop header: horizontal menu, 74px tall. **≤ 1140px**: hamburger + white icon pill, 68px tall |
| **≥ 992px** | Logo 140px wide; product rows show 4 cards. **≤ 991px**: logo 90px, product rows 2 cards |
| **≥ 768px** | Body text 16px. **≤ 767px**: body text 15px, single-column stacking |
| 1200, 1400, 1600, 1800, 1920 | Further desktop refinements (e.g. product-tab titles 100px → 120px at 1920) |
| 576, 740 | Minor mobile rules (few) |

Media-query counts in the main stylesheet: min-width 768 (240), min-width 992 (205), min-width 1400
(79), max-width 767 (72), min-width 1200 (47), 1140/1141 (65), min-width 1600 (25). Two builder
stylesheets could not be read (see limitations).

---

## 3. Header

### 3.1 Announcement bar [M]

| Property | Value |
| --- | --- |
| Height | 48.4px (all viewports) |
| Background | `#0F61FF` |
| Text | Inter 16 / 22.4, weight 500, −0.16px, white |
| Separator | 6px white circle, 18px gap on each side |
| Motion | continuous marquee, CSS animation `xo-marquee 3.99s linear infinite`; ≈71px/s at 1440, ≈70px/s at 390 |

### 3.2 Desktop header (≥ 1141px) [M]

| Property | Value |
| --- | --- |
| Height | 74px (72.8px when sticky) |
| Top of homepage | transparent over the hero, white text and logo, bottom border 1px `rgba(229,229,229,0.5)` |
| Other pages / sticky | background `#FFFFFF`, text `#1E1E1E`, no shadow, no blur |
| Logo | 140 × 24.5px |
| Layout | logo left · menu centred · icons right |
| Menu items | Inter 14 / 19.88, weight 500; 18px between items; caret 16px box, 4px gap |
| Active / open item | text turns `#0F61FF`, caret rotates |
| Menu badge ("50% OFF") | Inter 12 / 16.8, weight 500; padding 3px 8px; radius 14px; bg `#0F61FF`, white text; after the caret |
| Icons | 16px glyphs in 36px boxes, pitch 36px (search, account, cart) |
| Cart count | 16px circle, `#0F61FF`, Inter 10px weight 500 |
| Sticky behavior | hides when scrolling down (moves to y = −73), reappears when scrolling up; `0.5s cubic-bezier(.31,.41,.38,.96)` |
| Menus open on | mouse hover; the header **stays transparent** while a mega menu is open |

### 3.3 Mobile and tablet header (≤ 1140px) [M]

| Property | Value |
| --- | --- |
| Height | 68px |
| Logo | 90px wide at ≤991px (140px at 992–1140px), left, white on the homepage hero |
| Icon pill | white, radius 23.5px, padding 5px 18px 5px 8px, shadow `0 34px 104px rgba(0,0,0,0.1)`; holds search, account, cart, hamburger; icons `rgba(30,30,30,0.75)`, hamburger 15px |
| Pill size at 390 | 182 × 46px, 22px from the announcement bar |
| Sticky (revealed on scroll up) | no full-width band: the row becomes one white bar 22px from the top and sides, 46px tall, radius 14px, padding 0 22px, shadow `0 34px 104px rgba(0,0,0,0.1)`; the icon pill loses its own background and shadow inside it; same at 390, 768 and 1024, `0.5s cubic-bezier(.31,.41,.38,.96)` [M, measured 2026-10-28] |

### 3.4 Mega menu (desktop) [M]

Full-width white panel directly under the header (top at 120px on the homepage), no radius on the
outer edge, panel height 311–540px depending on content.

| Part | Value |
| --- | --- |
| Intro column | 250px wide, 1px right border, left padding 52px, top padding 33px |
| Intro heading | Inter 20 / 21, weight 500, `#1E1E1E`; 20px to the content below |
| Intro text | Inter 15, weight 400 |
| Image cards (list) | 146 × 64px, bg `#F6F6F6`, radius 8px, padding 7px, 14px apart; image 48 × 48 (cover); label Inter 14 weight 500 `rgba(30,30,30,0.75)` |
| Columns | start 29px after the intro border; 40–48px apart |
| Column heading | Inter 16 / 22.4, weight 500, `#1E1E1E`; 16px to the first link |
| Links | Inter 15 / 21.3, weight 400, `#1E1E1E`, 32px rhythm; hover `#0F61FF`, no underline; long lists wrap after 9 rows |
| "View all" | Inter 15, weight 500, `#0F61FF`, chevron |
| Image tiles (cards-only panels) | ≈100px images, 160px pitch, label below [S] |
| Promo card | 313px wide, right margin 52px, top 32px; image radius ≈8px [E]; title Inter 17 / 22.1 weight 500 white at 24px/15px inset; button 144 × 50 pill `#0F61FF` Inter 15 weight 500; caption Inter 17 / 25.84 weight 500 `#1E1E1E`, 10px below |

### 3.5 Simple dropdown [M]

| Property | Value |
| --- | --- |
| Panel | 200px wide, white, radius 7px, padding 10px 0, shadow `0 1px 1px rgba(0,0,0,0.1)`, `0.3s` transition, small arrow tip [S] |
| Items | Inter 14 / 19.88, weight 500, `#1E1E1E`, 32px rhythm; nested items show a "→" and open a flyout to the right |

### 3.6 Mobile menu drawer [M]

Full-screen white panel. Logo, search, cart and close at the top; search field; rows of top-level
items.

| Part | Value |
| --- | --- |
| Row | Inter 17, weight 500, `rgba(30,30,30,0.9)`; 55px tall (padding 15px 0); divider lines between rows [S] |
| Submenu | slides in with "Back"; image cards as grey rounded rows; groups as accordions; promo card at the end [S] |
| Badges | not shown in the drawer [S] |

### 3.7 Search and cart [M]

| Component | Values |
| --- | --- |
| Search panel | full-width white sheet from the top, 334px tall at 1440, page dimmed behind [S]; input Inter **75px** weight 500, −3.75px, placeholder `rgba(30,30,30,0.4)`; blue underline [S]; "POPULAR SEARCHES" Inter 13 weight 500 uppercase `rgba(30,30,30,0.6)`; suggestion pills `rgba(15,97,255,0.1)` with `#0F61FF` text [S], radius 25px [M] |
| Cart drawer | from the right, **540px** wide, full height, white; title "Your cart" Instrument Sans 31 / 40.3 weight 600 −0.93px; divider under the header; empty state title 31px + 211 × 53 pill button; backdrop black at 0.4 [T] |

---

## 4. Buttons [M][T]

| Variant | Size | Style |
| --- | --- | --- |
| Primary, regular | height 50px (≈107px wide for "Shop all"); 42px on mobile | bg `#0F61FF`, white text, 1px `#0F61FF` border, radius 100px, Inter 15 weight 500 |
| Primary, large (hero, forms) | height 58px | Inter 16 weight 500 |
| Primary, full width (product, featured product) | 54px (372px wide in the 512px box) | Inter 15 weight 500 |
| Secondary | 58px | bg white, text `#0F61FF`, border `rgba(15,97,255,0.4)` |
| Icon, round | 32 × 32 | bg `#0F61FF`, white icon, radius 50% |
| Icon, square | 40 × 40 | bg `#0F61FF`, radius 6px |
| Tag pill | 28px tall | bg `rgba(15,97,255,0.1)`, text `#0F61FF`, radius 25px |

**Hover** [M, measured 2026-10-15]: a `::before` fill layer, as wide as the button with a dome top
(`border-radius: 50% 50% 0 0`), rises from below the button to cover it and squares off:
`top`/`height` over `0.5s cubic-bezier(.25,.74,.22,.99)` delay 0.05s, `border-radius` delay 0.22s; the
button clips it (`overflow: hidden`).

| Variant | Normal | Hovered |
| --- | --- | --- |
| Primary | bg `#0F61FF`, label white, border `#0F61FF` | fill white, label `#0F61FF`, border `#0F61FF` |
| Secondary | bg white, label `#0F61FF`, border `rgba(15,97,255,0.4)` | fill `#0F61FF`, label white, border `#0F61FF` |

The label swaps colour with a text-shadow slide: the label is transparent with shadows
`<label colour> 0 0 0, transparent 0 30px 0`, which become `transparent 0 -30px 0, <hover colour> 0 0 0`.
Sizes: small 15px / 21.3, padding 13.5px 16px (50px tall); medium 16px / 22.4, padding 17px 20px (58px).
Buttons carry a hidden loading spinner for add-to-cart.

---

## 5. Product and content cards

### 5.1 Product card [M]

| Part | Value |
| --- | --- |
| Card | bg `#F6F6F6`, radius 28px, overflow hidden, no border, no shadow, text centred |
| Size | 293 × 427px at 1440 (4 per view); ≈379 wide at 1893 [S]; 216 at 1024; 357 at 768; 168 × 296 at 390 (2 per view) |
| Image | square, full card width, `object-fit: cover`; product photos are cut-outs on the card grey |
| Hover | second image fades in (preloaded hidden); images sit at `scale(1.05)`, transition 0.5s; two round 32px action buttons appear top-right (quick add "+", quick view "eye"), 16px inset, 9px apart [S] |
| Sale badge | top-left 16px; bg `#DA1E28`; padding 4px 8px; radius 16px; Inter 14 weight 400 white; "Sale 15%" |
| Title | Instrument Sans 16 / 20, weight 500, −0.16px, `#1E1E1E`, 8px below the image |
| Price | Inter 14 / 19.88 weight 500; compare-at price first with line-through, 6px gap |
| Swatches | 22px circles, 8px apart, ring 1px `rgba(184,184,184,0.15)`, ≈23px below the price |
| Bottom padding | ≈33px |
| Carousel | progress bar under the row: 55px × 5px, `#0F61FF` thumb, radius 10px, light track; 38px below the cards |

### 5.2 Category panels [M]

Two panels side by side (stacked on mobile).

| Part | Desktop (1440) | Mobile (390) |
| --- | --- | --- |
| Panel | 601 × 499px; bg `#F6F6F6`; radius 20px; padding 34 45 42 48 | 346 × 421px; padding 24px 32px |
| Heading | Instrument Sans 31 / 37.2 weight 600 `#1E1E1E` | 18 / 21.6 |
| Button | "Shop all" 107 × 50 pill, 23px below the heading | 91 × 42, Inter 14 |
| Feature image | top-right, flush with the panel edges, 377 × 499 box, `object-fit: contain`, fades to the panel colour at the bottom | fills the panel behind the text |
| Category items | 4 per row; padding 18px; image 48 × 48 (cover); gap 7px; label Inter 14 weight 500 `rgba(30,30,30,0.75)`, centred | horizontal scroller, ≈131px per item |

### 5.3 Feature showcase (below Best Sellers) [M]

Two columns, 28px gap.

| Part | Value (1440) |
| --- | --- |
| Tall image card | 601 × 622px, image cover; eyebrow "SPECIAL FEATURES" Inter 15 weight 500 white, ≈32px inset; overlay Instrument Sans 31px (small line) and 150px (large line, −1.05px) white, bottom-left |
| Feature panel | 601 × 317px, bg `#F6F6F6`, radius 20px, padding 45px 50px 43px; title Instrument Sans 31 / 37.2 centred; three features with 36px icons and two-line Inter 17 / 22.1 weight 500 −0.34px labels, separated by vertical dividers |
| Wide image card | 601 × 277px, image cover, centred pill button "Shop now" 121 × 50 |
| Mobile | stacked: 346 × 346 image (25px / 80px overlay), panel 346 × 356 (padding 30px 25px, title 18px, features as rows: icon left, label right, 81px rows, dividers), 346 × 195 image |

### 5.4 Featured product tabs ("Extreme Case" slider) [M]

| Part | Value |
| --- | --- |
| Eyebrow | Inter 16 / 22.4 weight 500 uppercase, 21px above the titles |
| Title row | product names in Instrument Sans 100 / 104 weight 600, −6px; inactive titles opacity 0.17; 49px apart; active title aligned to the left gutter (centred on mobile); 54px on mobile, 120px at 1920 |
| Detail box | 512 × 445px, bg `#F6F6F6`, radius 14px, padding 33px 70px; price Inter 18 / 25.56 weight 500 (compare-at struck through); description Inter 15 / 21.3 weight 400, centred, clamped; spec rows 51px with 1px `rgba(229,229,229,0.2)` dividers, label Inter 15 weight 500 `rgba(30,30,30,0.65)`, value Inter 16 weight 500; button 372 × 54 pill |
| Product image | ≈725px square (contain), overlaps the title row by ≈90px, soft blue radial glow behind |
| Section height | 2810px at 1440 (scroll-driven scene, `position: sticky` inner) |
| Mobile | title 54px centred; image 346 × 346; box 346 × 437, padding 35px 24px 24px; button 298 × 53 |

### 5.5 Other cards [M]

| Card | Value |
| --- | --- |
| Collection list card | 601 × 401px (3:2), cover; 346 × 461 on mobile |
| Blog card | image 400 × 266 (3:2) at 1440, 346 × 231 at 390, cover; title Inter 20 / 21 weight 500 −0.2px |
| Article hero image | 1100 × 623, radius 10px |
| Multi-column feature | 392 × 441 (≈8:9), cover |
| Shoppable feed card | 392 × 522 (3:4), radius 24px |
| Testimonial avatars | circles 64, 82 and 123px |
| Service cards (above footer) | 392 × 283px, bg `#F6F6F6`, radius 10px; 49px icon; title Inter 16 / 23.2 weight 600; text Inter 16 / 23.2 weight 400 (15px on mobile) |

---

## 6. Page templates [M]

| Page | Desktop (1440) | Mobile (390) |
| --- | --- | --- |
| Home | 15 sections, 15,228px tall; hero = full viewport height (900 at 1440×900, 1080 at 1920×1080, 844 at 390×844) | 13,745px |
| Product | main block 1625px: title Instrument Sans 75 / 97.5 −3.75px; price Inter 20 weight 500; gallery images 377 × 377 (contain) in a row; add-to-cart 304 × 58; then specification, multi-column, gallery strip (1191 × 720 images) and recommendations (293px cards) | title 36 / 46.8; images 261 × 261; add-to-cart 346 × 50 |
| Collection list (`/collections`) | 560px banner, then cards 601 × 401 | 420px banner; cards 346 × 461 |
| Collection grid | page heading 75 / 90; 4 columns of 287px cards; category strip of 48px icons | heading 36 / 43.2; 2 columns of 166px cards |
| Cart | heading 75 / 97.5; empty state 31px + 211 × 53 button; product row below | heading 36; button 191 × 46 |
| Search | grey `#F6F6F6` band under the header: 102px below the header to the field, 98px under it; the search term as a 152px field, Inter 75 weight 500 −3.75px, 1px underline, search icon at the right; popular-search pills 28px tall, 31px below. Then "N results" Inter 15 weight 500 24px below the band, the collection toolbar (filters left, "Sort by" right) 48px lower, the grid 24px below that: 4 columns of 287px product cards (5.1), 28px gaps; products and blog posts only (no pages); article cards: square image radius 10px, title Instrument Sans 20 / 21 weight 500 −0.2px, author • date Inter 14 [measured 2026-10-27] | band 44px below the header, 32px under the field; field 100px, 42px −2.1px; 1 column of 346px cards, 14px gaps; article titles 16 / 16.8 |
| Blog | breadcrumb; title "Blog" 100 / 110 −6px; 3 columns of 400 × 266 cards | title 44 / 48.4; 1 column |
| Article | title 60 / 78 −3px; lead Inter 20 / 28 −0.4px; image 1100 × 623 radius 10; body Inter 16 / 25.92 weight 400; comment form with 158 × 58 button | title 32 / 41.6; body headings 24px |
| About | intro text 50 / 65 −2.5px with 100px stats; team, specs, testimonials (31px quotes), FAQ (50px title) | 25px intro, 44px stats |
| Contact | centred 540px column, 192px top / 160px bottom padding: title Instrument Sans 75 / 97.5 −3.75px; intro Inter 18 / 25.92 weight 500 at 70%, 10px below; 40px to the fields; fields 60px pills (radius 86px, padding 17px 24px, border 1px `rgba(229,229,229,0.4)`, Inter 16 / 22.4 weight 500 −0.16px, placeholder at 65%) 8px apart, first row two columns of 266px; message box 136px, radius 6px; full-width 540 × 58 "Send" 40px below [measured 2026-10-27] | title 36 / 46.8 −1.8px; intro 15 / 21.3; fields stacked, 346px wide; 346 × 50 button |
| Policy pages (privacy, terms) | Shopify's policy markup at the page width with the container gutter; title centred (Shopify's default), text left-aligned; 150px top and bottom padding under the overlaid header (title 86px below the header); title 60 / 60.6 −3px; h2 42 / 42.42 −2.1px with 20px below; h3 26 / 32 −0.52px; headings in the body font (Inter), rendered bold; body 16 / 25.92 weight 400 at 70%, paragraphs 10px apart; strong 18 / 27 at 100%; lists 25px indent, 4px gaps; links underlined in the text colour; tables 20px margin, no borders [measured 2026-10-27] | 115px padding (title 57px below the header); title 45 / 45.45 −1.8px; h2 24 / 31.92 −0.96px with 16px below; h3 18 / 31.86; strong 17px; heading sizes switch at 992px |
| 404 | "404" 75px, "Page not found" Instrument Sans 42 weight 500 −2.1px, button 138 × 50 | 36px / 24px, button 120 × 42 |

---

## 7. Interactions and effects

### 7.1 Sticky and fixed elements [M]

| Element | Behavior |
| --- | --- |
| Header | hide on scroll down, reveal on scroll up (see 3.2) |
| Footer group | `position: sticky; bottom: 0` (content scrolls over the footer) |
| Side actions | fixed bottom-right pill with scroll-to-top and dark-mode buttons; radius 25px, shadow `0 4px 20px rgba(0,0,0,0.1)` |
| Product page media / bundle box | `position: sticky; top: 10px` |
| Featured product tabs | sticky inner scene (scroll-driven) |
| Intro text | sticky parallax at `top: 84–90px` |
| Featured product background (`featured-product-style-1`) | image fixed to the viewport (`background-attachment: fixed`, `cover`) and drifting from +200px to −200px (`background-position-y`), linear over the section's pass (its top entering at the bottom of the screen to its bottom leaving at the top), eased toward the scroll position with a ≈200ms time constant (55% of a jump at 150ms, 98% at 820ms); the same ±200px at 390, 1440 and 1920 [M, measured 2026-10-27] |

### 7.2 Hover [M][S]

- Menu items and mega-menu links: color to `#0F61FF`, no underline.
- Buttons: rising fill layer and colour swap (section 4).
- Product cards: second image, action buttons (section 5.1).
- Text links with underline animate `background-size` over 0.4s.

### 7.3 Animation on scroll [M]

- Content blocks (`xo-animate`) start at opacity 0 and fade in with `0.5s cubic-bezier(0,0,.3,1)`.
- Large headings animate per character (`transform 0.5s ease-in-out`).
- One `prefers-reduced-motion: reduce` rule exists in the stylesheet [M]; its full effect was not
  tested.

### 7.4 Footer [M]

| Part | Desktop (1440) | Mobile (390) |
| --- | --- | --- |
| Band | bg `#0F61FF`, padding 66px top / 23px bottom, 538px tall | 745px tall |
| Logo | white, 140 × 24.5 at x=73 | |
| Intro | Inter 16 / 23.2 weight 400 white | 15 / 21.75 |
| Column headings | Inter 14 / 19.6 weight 500 uppercase, white (appear lighter on screen [S]) | |
| Links | Inter 16 / 22.4 weight 500 white | 15 / 21 |
| Email field | 1390 × 137px, bg `rgba(255,255,255,0.1)`, radius 20px; input Inter 50 / 52 weight 600 −2.5px; white circular arrow button [S] | 346 × 72px, radius 10px, input 20px |
| Bottom bar | Inter 15 weight 500 white; payment icons; language and currency selectors | 13px |

---

## 8. Images

| Rule | Value |
| --- | --- |
| Default fit | `object-fit: cover`, `object-position: 50% 50%` [M] |
| Product photos | cut-outs on the card colour, square, cover [M] |
| Feature / panel images | `contain` with transparent backgrounds [M] |
| Radius | usually on the wrapper (20px panels, 10px images, 28px cards), not on the `img` [M] |
| Loading placeholder | `rgba(30,30,30,0.1)` block until the image loads [M] |
| Common ratios | 1:1 (products, avatars, category icons), 3:2 (collection, blog), 8:9 (multi-column), 3:4 (feed), ≈16:9 (article hero, gallery), full-viewport cover (hero) [M] |

---

## Audit coverage and limitations

**Pages and widths audited (computed styles + screenshot):**

| Page | Widths |
| --- | --- |
| Home `/` | 1920, 1440, 1024, 768, 390 (+ breakpoint probes at 1400, 1200, 1199, 1141, 1140, 992, 991, 767, 576) |
| Product `/products/civilian` | 1440, 1024, 390 |
| Collection list `/collections`, collection `/collections/all`, cart, search, blog, article, About, Contact, 404 | 1440, 390 |
| Privacy policy | 1440 |

Interactions tested: mega menus (3 panels), simple dropdown, mobile drawer and submenu, search
panel, cart drawer (empty), sticky header (scroll down and up), product-card hover, button hover
(primary and secondary), marquee speed, scroll-reveal start state, footer.

**Not verified:**

- **Account pages:** login redirects to Shopify's hosted customer accounts (`/customer_authentication`),
  outside the theme.
- **Checkout:** hosted by Shopify, not part of the theme design.
- **Theme demo pages** (`/pages/home-2` … `home-5`, `gallery`, `image-banner`, `multi-columns`, etc.):
  not audited; they showcase alternative templates rather than the store.
- **Cart drawer with items**, quick-view modal, product variant switching, collection filters drawer,
  product page at 768px: not inspected.
- **Dark mode** toggle: not tested.
- **Product-card hover mechanism:** the swap and buttons were seen on screenshots; the exact CSS
  states were not isolated.
- **Two builder stylesheets** (`xo-builder.base.css` on cdn.shopify.com and
  `xo-builder-global.min.css` on cdn-builder.xotiny.com) block cross-origin reading; breakpoints and
  tokens defined only there are missing.
- **GTStandard-M** font: loaded, but which elements use it was not determined.
- **Mega-menu promo image radius** is estimated (≈8px).
- **`prefers-reduced-motion`** behavior: one rule exists; its effect was not tested.
- **Hover/focus states for keyboard users** were not audited.
