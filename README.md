# Raspberry Pi Guide

### Website designed, written and developed by **Mohammed Al-Quwaizani**

A complete, self-contained static website about the Raspberry Pi: what it is, which model to
buy, what everything costs, real photographs of the hardware, project ideas, and how to try
Raspberry Pi OS on your PC in a virtual machine.

No build step, no framework, no trackers, no cookies. It works offline and it can be published
on any host by copying the folder.

---

## How to open it

Double-click **`index.html`**.

To check everything exactly as it will behave when published (and to avoid any local-file
restrictions on image loading and storage):

```bash
python -m http.server 8000
```

then visit <http://localhost:8000>.

---

## Files

| File | What it is |
|---|---|
| `index.html` | Home: photographic hero, what a Pi is, its history, the model line-up with photos, a hardware photo gallery, six ways it helps, the VM teaser, kit budgets, FAQ and the author credit |
| `models.html` | Full model line-up — Pi 5, Pi 4, Zero, Pico, Pi 400/500, Compute Modules — with photos, specs, prices, comparison tables and what is *not* in the box |
| `uses.html` | Twelve deep-dive uses with the hardware needed, complete cost, difficulty and first steps, plus honest limits |
| `projects.html` | Twenty buildable projects with filter buttons, part lists and totals, plus a 90-day learning path |
| `vm.html` | Virtual machine lab: VirtualBox + Raspberry Pi Desktop, full QEMU ARM emulation, VMware/Parallels, Docker, borrowed boards, a first-boot checklist and a troubleshooting table |
| `pricing.html` | Board prices, kits, accessories, a live **build calculator**, an **electricity calculator**, and Pi versus cloud hosting |
| `faq.html` | Thirty-five beginner questions answered honestly, plus a plain-English glossary |
| `about.html` | About the project and its author, methodology, editorial standards, changelog, **photo credits**, colophon, credits and licensing |
| `404.html` | Friendly not-found page |
| `styles.css` | The whole design system: tokens, dark/light themes, typography, components including photo frames and the lightbox, responsive rules, print stylesheet |
| `script.js` | Theme, navigation drawer, reading progress, section navigator, photo lightbox, currency converter, copy buttons, accordions, filters, calculators |
| `img/` | 17 real photographs (4.7 MB total), web-optimised, plus `CREDITS.md` |
| `robots.txt` / `sitemap.xml` | Crawler rules and sitemap — replace the placeholder domain before publishing |

---

## Photography

Every photograph is a real picture of real hardware, downloaded from **Wikimedia Commons** and
used under the licence shown below. Nothing is a drawing or a render.

| On the site | Photographer | Licence |
|---|---|---|
| Board and accessory photos | SimonWaldherr, Laserlicht, Suyash Dwivedi, RAIL.PHOTOGRAPHY, Profpcde, Maskaravivek, Les Pounder, Gareth Halfacree, Masahiko OHKUBO, Florian Knodt, the Raspberry Pi Foundation | CC BY 4.0, CC0, CC BY-SA 4.0, CC BY 2.0, CC BY-SA 2.0 |

- **Attribution is built in.** Click any photo (or press Enter on it) to open the lightbox, which
  shows the caption, the photographer, the licence and a link back to the Commons page. Arrow
  keys move between photos, Escape closes.
- The complete list is on **`about.html` → Photo credits** and in **`img/CREDITS.md`**.
- Images are served at 1280–1920 px, lazy-loaded, and each one declares its width and height so
  the page never jumps while loading.
- Share-alike licences allow reuse with attribution; only resizing was applied, and the same
  licence terms are kept.

---

## What is new in version 1.7 (the real card bug)

The board cards looked squeezed, doubled and "hanging" on the models page. The cause was a
markup bug, not styling: the photo step had injected a **second `<article class="card">` opening
tag** in front of each photo, so every card was nested inside the previous one (31 `<article>`
opens against 27 closes). Each level added its own padding and border, which is why the content
was cramped and the card looked like a frame inside a frame.

- Removed the 4 duplicated tags — all nine pages now pass a tag-balance check
  (div, section, article, figure, span, table, list and heading tags all match).
- Added `overflow: hidden` to the card so the photo is clipped exactly to the rounded corners.
- Fixed one unclosed `<span>` in the PowerShell command block on `vm.html`.
- Verified at 1936 px (4 cards in one row, 289 px each), 1000 px (2 columns), and phone widths
  (1 column): no nesting anywhere, no overflow, no console errors.

## What is new in version 1.6 (cleaner home page)

- **The four board cards were removed from the home page** and now live at the top of
  `models.html`, under "The four boards most people should look at". The home page keeps a single
  clean line linking to the comparison instead of a wall of cards.
- The duplicate photo bands for those same boards were removed from `models.html`, so no photo
  appears twice on one page.
- Card photos no longer carry a caption overlay (the card already names the board); the lightbox
  reads the caption from `data-caption` instead.
- The photo "zoom" icon is now drawn with CSS, so it can no longer show up as a stray character
  when someone copies text from the page.

## What is new in version 1.5 (logo + card layout)

- **The raspberry mark is now the site logo** — in the header, in the footer, and as the browser
  favicon (`img/raspberry-pi-mark.svg` + `img/favicon.svg`). The official artwork file is not
  freely licensed, so the mark is a faithful redrawing made for this project; the trademark notice
  on `about.html` explains this.
- **Fixed the cramped model cards.** The four board cards only lay out four-across when each card
  can be at least ~285 px wide; below 1300 px they become two wide cards instead of four squeezed
  columns, so titles and specifications no longer wrap to pieces.
- Specification values on the home cards were shortened (`A76 ×4 @ 2.4 GHz`) so they stay on one
  line at every width.

## What is new in version 1.4 (dark by default + responsive fixes)

- **Dark is the default theme again** (deep navy with sky-blue accents). The ☀️ button switches to
  the light theme and the choice is remembered.
- **Fixed the layout bugs that made prices look broken on narrow windows and phones.** The page
  used to become 774 px wide inside a 390 px screen, which pushed content off-screen so prices
  looked shifted, stacked and "hanging":
  - the closed navigation drawer was parked off-screen and silently widened the whole document —
    it is now `display: none` while closed and animates in when opened;
  - grid tracks used `1fr` (= `minmax(auto, 1fr)`), so the long QEMU command inside the VM card
    forced a 631 px-wide card. All 26 grid tracks are now `minmax(0, …)` and cards/code blocks may
    shrink (`min-width: 0`);
  - the header tools overflowed a phone screen — the currency selector is now compact, the brand
    text hides under 680 px and buttons may wrap instead of overflowing;
  - the dimming overlay was clipped to the header by `backdrop-filter`; it now covers the screen;
  - the "Your total" panel no longer sticks on phones, so it cannot cover the price rows.
- **Price tables are now readable on phones:** below 720 px every wide table turns into stacked
  cards showing `LABEL: value` pairs, so the price is always visible instead of being off-screen
  behind a horizontal swipe. Grouped rows (the board price list) keep their model heading.
- Prices are forced `direction: ltr` with `unicode-bidi: isolate`, and the currency menu uses short
  Latin labels (`USD $`, `SAR`, `AED`) so no right-to-left currency symbol can reorder a price.
- Verified at 360 px, 390 px, 760 px, 800 px, 1000 px, 1100 px, 1280 px and desktop: no horizontal
  overflow anywhere, no console errors, calculators and lightbox unchanged.

## What is new in version 1.3 (colour + accuracy pass)

- **New palette: navy and sky blue**, light theme by default (white surfaces, navy headings,
  sky-blue buttons and links). The neon raspberry pink is gone everywhere, including the favicon.
- **Dark theme kept**, rebuilt as a calm deep-navy scheme — switch it with the ☀️/🌙 button in the
  header; the choice is remembered.
- **Price bugs fixed.** The "Learn & tinker" starter kit said $55 while its five items added up to
  $46, and the "Serious home lab" kit said $300 while summing to $301. Both are now exact, and
  every price on the site was audited: all 20 project part-lists, all kit cards and the
  calculator default now reconcile to the cent.
- Fixed a stale wording bug on the prices page ("$120 per month-year" → "per year") and repaired
  two CSS custom properties (`--glow`, `--blue`) that were no longer defined.

## What is new in version 1.2 (photography pass)

- 33 photographs placed across seven pages: a photographic hero, a photo header on every model
  card, a six-image hardware gallery, photo bands between sections, and camera/GPIO close-ups.
- A full **lightbox** with caption, photographer credit, licence link and keyboard navigation.
- A **Photo credits** section on `about.html`, plus `img/CREDITS.md`.
- Caption typography and gradient scrims tuned for readability over photographs.
- Images are credited under CC BY / CC0 / CC BY-SA licences — see the credits for details.

Previous passes:

- **1.1** — professional redesign: top bar, reading progress, section navigator, accessible
  navigation drawer, author credit, About page, 404 page, meta/SEO tags and structured data.
- **1.0** — first release with the currency converter, build calculator and electricity calculator.

---

## Features worth knowing

- **Currency switcher** (top bar of every page). Prices are stored in USD as `data-usd="80"` and
  converted live to EUR, GBP, SAR, AED, MAD, EGP, JOD, QAR, KWD, TRY or INR; the choice is
  remembered in `localStorage`. Edit the `CURRENCIES` object in `script.js` to change rates.
- **Light theme by default** (navy + sky blue) with an optional dark navy theme, remembered per
  browser. Change the default in `script.js` (`applyTheme(savedTheme || "light")`).
- **Photo lightbox** on every photograph, with credits.
- **Build calculator** on `pricing.html` — tick items, set quantities, get a live total.
- **Electricity calculator** on `pricing.html` — watts × hours × your kWh price, per month and year.
- **Section navigator** — appears on any page with three or more `h2` sections.
- **Copy buttons** on every command block.
- Keyboard navigable, `prefers-reduced-motion` aware, printable, and readable with JavaScript
  disabled.

---

## Customising it

- **Change a price:** edit the `data-usd` attribute of the element, e.g. `<span data-usd="80"></span>`.
- **Add a photo:** drop the file in `img/`, then copy an existing `<figure class="photo" …>` block
  and change the `src`, the caption and the `data-credit` / `data-license` / `data-source`
  attributes so the lightbox can credit it.
- **Swap the hero photo:** replace the file `img/hero-pi5-board.jpg` (keep the same name) or edit
  the `src` in `index.html`.
- **Add a currency:** add one line to `CURRENCIES` in `script.js`.
- **Change the accent colour:** everything derives from the tokens at the top of `styles.css` —
  the light theme in `:root` (`--brand`, `--sky`, `--leaf`, `--amber`, `--violet`) and the dark
  theme in `[data-theme="dark"]`. Both blocks use identical token names, so one edit recolours
  both themes.
- **Publish:** upload everything to any static host, then replace `REPLACE-WITH-YOUR-DOMAIN` in
  `robots.txt` and `sitemap.xml`.

---

## Accuracy, licensing and disclaimers

- Prices are typical official-reseller list prices in **USD**, converted with approximate exchange
  rates so readers in other countries can judge the cost. They are indicative, not offers, and
  they change — always confirm with an approved reseller in your country.
- Specifications reflect the current generation of hardware (Pi 5, Pi 4 Model B, Zero 2 W, Pico 2,
  Pi 400/500, CM4/CM5).
- Commands are standard, widely used recipes (QEMU on `raspi3b`, VirtualBox settings,
  `qemu-img resize`, SSH port forwarding). Where a platform differs — for example line
  continuation in PowerShell — the difference is stated explicitly.
- **Photographs:** see the table above, `about.html → Photo credits`, and `img/CREDITS.md`.
- **Content licence:** the text may be reused for teaching and non-commercial documentation
  **with attribution to Mohammed Al-Quwaizani**.
- **Trademarks:** Raspberry Pi is a trademark of Raspberry Pi Ltd. This is an independent
  educational project and is not affiliated with, sponsored by or endorsed by Raspberry Pi Ltd.
