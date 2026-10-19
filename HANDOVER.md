# Helping Hands Craft: AI handover

Written for: an AI assistant (Claude Code) picking this project up in a fresh chat. Written 19 October 2026. Owner and only human: Chris Barnard, info@evakos.io (Evakos). Everything below is true as of that date. Where something is unknown it says so. Do not guess; ask Chris.

## 1. Rules Chris has set (apply to all work)

- British English. No dashes in client facing copy. (Chris has said this is "a basic".)
- Lucide icons only.
- Confirm with Chris before anything outward facing or hard to reverse (sending email, DNS changes, deleting, paying, publishing).
- Never invent facts, figures, reviews or customer claims. Say what actually ran and what did not.
- Secrets are never printed in chat. Chris passes keys through `~/Desktop/keys.rtf`, which he then deletes. That file currently still holds a live Stripe key and he has been reminded repeatedly.
- Auto mode classifier denials are final: do not work around them. State what you were trying to do and let Chris decide.
- Use they/them for people whose pronouns are unknown.
- Git commits end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Deploy with `git push` then `vercel --prod --yes` from the repo folder. Chris asks you to deploy and then check it himself; do not re-fetch pages with curl as proof.
- Chris writes tersely with typos. When a request is ambiguous, pick the sensible reading, say which you picked, and keep it easy to change. One genuinely ambiguous request ("do it across so its two rows") turned out to belong to another chat.

## 2. The business

- Helping Hands Craft, helpinghandscraft.co.uk, a UK craft supplies shop. It was run by Selman Ugurlu of Mekazen Ltd (trading as Helping Hands Craft).
- 15 Dec 2025: Selman said they were closing the business (remaining stock sold in bulk). Chris offered on 21 and 29 Dec to keep the site online and refresh it. Chris has since told me Selman has handed the shop over to him. Keep Selman's message as the record. It is not in writing in anything I could see.
- The old shop was WooCommerce on SiteGround (Chris was added as a collaborator there on 4 Jan 2026), and a Cloudways app existed in May 2026. Chris no longer has Cloudways access. Domain moved to Papaki on 5 Mar 2026.
- The goods were mostly third party brands (Gemini, Peak Dale, Polychromos, Armour Etch and similar), around 1,500 products. Restoring that catalogue means selling things nobody currently supplies. Supplier or dropshipping arrangements are an open business question.

## 3. Where everything lives

| Thing | Detail |
|---|---|
| Repo | `~/Local Development/helping-hands-craft`, GitHub `Evakos/helpinghandscraft`, branch `main` |
| Vercel project | `helping-hands-craft` (prj_u11KGuuVBEUM6wS5hBvtAbmzZBLM, team evakos-projects). I always deployed manually with `vercel --prod --yes`; I never checked whether git is linked |
| Domain | Papaki. Renewed 19 Oct 2026, expires 5 Oct 2027 (it had lapsed into quarantine on 5 Oct). Registrar lock is on. Nameservers are Vercel DNS (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`) |
| DNS records I added | `api` A `138.201.254.101`; `_acme-challenge.api` CNAME `_acme-challenge.hhc-api.evakos.io` (lets Evakos Cloud get a certificate while DNS stays at Vercel). There are no MX records, so the domain cannot receive email |
| Backend | WordPress + WooCommerce on Evakos Cloud, host `138.201.254.101`, Docker service `eu-helpinghandscraft_wordpress`, public at `https://api.helpinghandscraft.co.uk`. Database `helping_hands_craft`, table prefix `wp_`. Currency set to GBP. It has no products, orders or customers |
| SSH | `ssh -i ~/.ssh/hetzner_evakos_main root@138.201.254.101`. See the Evakos Cloud notes in Claude's memory (`reference_evakos_cloud_infra`) |
| Backend fixes I made | Traefik router label `traefik.http.routers.eu-helpinghandscraft.tls.certresolver=cloudflare` (the old `le` resolver never issued a certificate); `/var/www/html/.htaccess` with the standard WordPress rewrites; `wp-content/mu-plugins/hhc-cors.php` (source in `wordpress-plugin/`) allowing browser requests from the shop's own origins only. `wordpress-plugin/hhc-menu-api.php` is the active menu endpoint plugin |
| Store API | Public `wc/store/v1`, no keys. The storefront never holds WooCommerce secrets |
| Resend | Account has these verified domains: tamp.gr, alortanapi.com, mindfulcoherence.com, stevehattfishmongers.co.uk, evakos.io, digibrix.io, logos.ninja. `helpinghandscraft.co.uk` is NOT verified. Segment "Helping Hands Craft past customers" exists (id `6f583d36-e4f5-430d-b285-5c5ab31173c8`) and is empty |
| Google | Merchant Center customer ID `526503943` (product list is empty now). Search Console property for the domain. Chris may still have access to both as `info@evakos.io`; unconfirmed |
| Evakos dashboard | The shop is listed in Sites for Sale (status Building) and Project Build (kind client, uses CMS). Source is `~/Local Development/evakos/src/lib/sites-for-sale.ts` |

## 4. The storefront as built

Vite + React 19, `react-router-dom` 7, `axios`, `lucide-react`. Dev server `npm run dev` on port 5175 (strict). Build `npm run build`. Lint `npx eslint .` (clean at handover).

**Environment**: `.env` (git ignored) has `VITE_WC_DOMAIN=https://api.helpinghandscraft.co.uk`. The Vercel project also still has three stale variables from the old shop (`VITE_WP_URL`, `VITE_WC_CONSUMER_KEY`, `VITE_WC_CONSUMER_SECRET`); they point at a store that no longer exists and can be removed with Chris's OK. **`RESEND_API_KEY` is not set**, so the newsletter form currently shows "Sign-ups are not available right now." The key must be a Resend key that can manage contacts. The existing Evakos key is stored as sensitive and cannot be copied. Optional `RESEND_SEGMENT_ID`.

**Public gate**: everyone sees the Coming Soon page. `?preview=hhc` (stored in localStorage as `hhc-preview`) switches the real shop on in that browser; `?preview=off` switches it off. This hides the shop, it is not security. Logic is in `src/App.jsx`.

**Routes**: `/` Home, `/shop`, `/product/:slug` (slug, like the old shop, so existing Google listings keep working; a number still works), `/cart`, `/about`, `/delivery`, `/contact`, `/account`, `/coming-soon`. `vercel.json` rewrites everything to the SPA and temporarily redirects `/product-category/*` to `/shop` (non permanent, until real categories exist).

**Pages written with only true copy**: About reuses the existing "made with care" text. Delivery says only "free UK delivery on orders over £30". Contact has no email or form because the domain cannot receive mail; it points to the newsletter. Account is a "coming soon" placeholder (no sign in exists).

**Newsletter**: `api/subscribe.js` (Vercel function) adds a Resend contact. The sign-up form is the top row of the footer on every page (`src/components/Newsletter.jsx` rendered by `Footer.jsx`), in the footer navy. The nav's Newsletter link goes to `/#newsletter`.

**Design system** (all in `src/pages/Home.css`, `Shop.css`, `Info.css`, `Navbar.css`, `Footer.css`, `Newsletter.css`):
- Colours from the logo: navy `#3b3c6a` (ink), teal `#90c4cf`, accent pink `#d0468a` (buttons), soft pink `#f6a6c8`, page `#f8fbfc`, hero/nav wash `#e4f0f3`, pastel tints blush `#fbe0ec`, sky `#d6ebf0`, sage `#dcefe6`, butter `#fdf0c2`, lilac `#e3e2f4`.
- Fonts: Cormorant Garamond (headings, 600) and Lato.
- Chunky look: 2px navy outlines, hard 5px offset shadow, 14px radius, pastel tops. Digibrix was the reference.
- Nav (`Navbar.jsx`): logo far left; six links (Home, Shop, About us, Delivery, Contact, Newsletter) grouped right with account and bag icons; same teal as the hero with no line between them; shrinks on scroll. Under 960px: menu button, logo centre, icons right, links in a drawer. Menu items come from the WordPress menu API if it returns any, otherwise the defaults in the file.
- Hero (`Home.jsx` `Hero`): full viewport height. Left: pill, headline "Craft supplies for every maker.", two buttons. Right: a procedurally drawn sunburst in the logo's style (`SUN_RAYS`), rotating once every 140 seconds, driven by `requestAnimationFrame` (not CSS). Seven pastel craft icon tiles float on its ring; each tile eases toward a richer shade when one of the longest rays (`LONG_RAYS`) passes through it. In the centre disc: the hands and heart mark (`src/assets/heart-hands.png`), recoloured to `#d0468a`. A torn paper edge (two SVG noise filters, `TearFilters`) sits under the hero. Everything honours `prefers-reduced-motion`.
- Cart, product detail and checkout pages still have the old recoloured styling and have not been redesigned or looked at. No product existed to view them with.

**Assets**: `src/assets/logo.svg` and `public/logo.svg`, `public/favicon.svg` come from `~/Desktop/HHC.svg` (vector hand and sun, no lettering). The EPS stock sheet is `~/Desktop/hand-made-logo-set/32.eps` (four marks by another designer, made in Illustrator in 2017). The hero heart mark is a raster crop of one of them, because no tool here could vectorise an EPS. **Licence for this stock set is unconfirmed; Chris must check before it goes on a live shop.**

**Known leftovers**: the footer "Connect" column still has a link labelled "WordPress Store" that just points at the site itself; footer links use plain `<a>` not router links; the old `/product-category/` URLs are not mapped to real categories.

## 5. Data: what exists and what does not

**There is no backup of the shop's products, product photos or orders anywhere I could reach.** Do not repeat these searches:
- The Mac, the Desktop, Downloads, Documents, Mail downloads, Google Drive (including the Local cloud backup folder, which belongs to the Evakos Local site), the whole G-DRIVE ArmorATD (large archive and SQL search over Dec 2025 to Mar 2026, plus a text search of an older 517,000 file recovery run).
- All eight Local by Flywheel databases (searched for the domain string): none contain the shop. The Local site named Helping Hands Craft, and its copies on the Desktop and G-DRIVE, are just the 12 core WordPress tables of the headless dev build.
- Files that looked relevant and were not: `Desktop Dec` SQL dumps (Hormozi), `ARCHIVE/ohlots` (an Icelandic theatre and a Steve Hatt `Orders-Export` CSV, payment method Pay360).
- The internal Mac drive is APFS on an SSD with TRIM: deleted files are not recoverable. The G-DRIVE is a 5TB spinning HFS+ disk where recovery is possible; Chris was running Disk Drill on it. If he reports a result, search the recovered files by content (the domain, `wp_posts`, `wc_orders`) not by filename.

**What does exist**:
- The customer summary CSV is on the G-DRIVE at `June 2026/Helping Hands Craft/helping-hands-craft-customers-2026-05-24.csv` (plus a copy with " (1)"). 187 real customers (UK) plus one placeholder account with an `@site.invalid` address holding 2,061 orders and £84,842 (probably imported or bulk orders, unconfirmed). The real customers total about £4,765 over 191 orders, average £25, 4 repeat buyers, last orders 2023 to 2025. It has no order lines, no products. It came from the old export script run against the Cloudways site on 24 May 2026.
- Search Console emails: about 400 to 470 web clicks a month in Sep and Oct 2025 (46K to 71K impressions); peak 1,100 clicks in Nov 2023. Merchant Center emails: about 1,300 to 1,700 approved products, 270 to 410 clicks a month in 2025. These are in Chris's Apple Mail.
- `catalogue/`: `product-urls.json` (2,138 archived product page URLs from the Wayback Machine), `products-wayback.json` (475 parsed so far: name, price, description, image link, categories, snapshot date; 183 have an image link) and `wayback.py`. The scrape only ever fetches public archived pages. It is slow because the archive rate limits (HTTP 429 with back off), and it **crashed with "No space left on device"** (see section 7). It resumes from `products-wayback.json`. Photos are the weak point: old image addresses now return the new site's page, and Wayback copies of images were not verified. Snapshots from late 2025 are SiteGround bot challenge pages ("One moment, please...") and are skipped.
- Socials: nothing found. The old homepage footer linked to an Instagram account `gydangilydd` that does not look like the shop's, and carried a Facebook pixel. No Google reviews found.

**Customer data and consent**: do not email the customers and do not put any customer data in the repo. The data belongs to Mekazen's old business. Chris says Selman handed the shop over; get that in writing, then send one "we're back" email with an unsubscribe link, only once the shop is actually live. The auto mode classifier blocked me three times from reading or copying the customer CSV (a cleaned copy, extracting emails, and the import). Chris was given manual steps: delete the `@site.invalid` row, then Resend, Contacts, Import CSV, map `Email` and `First Name`, choose the segment. Never import phone or address columns.

## 6. Priorities and open tasks

1. Get the real data. Chris has a draft message for Selman (exports, backup, Merchant Center feed, payment provider history including a Stripe, PayPal or WooPayments transaction export). Other routes: SiteGround Site Tools backups, Dropbox on the web (Local had two Dropbox accounts saved), a password reset or support ticket at Cloudways, a Search Console Pages export to prioritise the most visited products.
2. Free disk space on the Mac (section 7), then resume `python3 wayback.py` from `catalogue/`. Once Chris exports Search Console top pages, reorder the scrape to fetch those first.
3. Set `RESEND_API_KEY` in the Vercel project (Chris supplies a key via `keys.rtf`), then verify `helpinghandscraft.co.uk` in Resend if you want branded email.
4. Decide with Chris where stock and supply come from. Without it, a restored catalogue is a catalogue nobody can fulfil.
5. When products exist: import them into the Evakos Cloud WooCommerce (check `$table_prefix` is `wp_`), restyle product, cart and checkout pages, map old category URLs, remove the temporary category redirect, build real accounts and checkout payments (none configured: no Stripe, no PayPal), set shipping to match "free UK delivery over £30".
6. Mail: the domain cannot receive email. Add forwarding or a mailbox, then put an address on the Contact page.
7. Fix the footer "Connect" column and use router links.
8. Go live: remove the Coming Soon gate in `App.jsx` (or keep it until the shop is stocked), confirm the logo licence, delete stale Vercel env vars.
9. Chris's housekeeping: delete `~/Desktop/keys.rtf`; Logos Ninja domain expires 24 Oct 2026 (separate project).

## 7. Gotchas and current problems

- **The Mac's data volume was 100% full at about 12:00 on 19 Oct 2026 (552MB free of 228GB).** That is what stopped the scrape. Biggest users: `~/Library` 66GB (Local 23GB, VS Code 8GB, Google 4GB, Herd 4GB), `~/Local Development` 37GB, and about 1.7GB of logs in the home folder from a Google Drive organising script (`~/gdrive_organize_*.log`, `~/gdrive_dryrun*.log`) that was moving files on the G-DRIVE into `ARCHIVE/Other` that morning. That script is not part of this project and was not running when I looked. Disk Drill was also running. Do not delete anything without asking Chris. Do not let recovered files land on the G-DRIVE being scanned.
- Production reads and writes: the classifier allows plain `ssh` to the Evakos box but blocked a PHP script that read `wp-config.php` and queried the live database. Chris ran that script himself once and pasted the output. Expect the same for any database work; ask him to run it or add a rule.
- Do not paste customer emails, names or addresses into tool calls or files.
- Headless Chrome screenshots: Chrome is at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; use `--headless=new --window-size=W,H --virtual-time-budget=4000 --screenshot=file URL`. It will not go narrower than about 500px, virtual time does not advance animations, and hash scrolling does not work. To see a part of the page below the fold, add a temporary route and revert it.
- The sun rotation and tile glow are verified only by simulation and single frames, not by watching them move live.
- Archive.org rate limits hard (429). Keep requests slow and sequential.
- Stripe and Vercel connectors in Claude may need authorising in the Claude app; the Vercel CLI and Resend connector are what I used.
- Related Evakos dashboard context lives in `~/Local Development/evakos` and in Claude's memory file `project_helping_hands_craft.md`.

## 8. Quick commands

```
cd ~/Local\ Development/helping-hands-craft
npm run dev                      # http://localhost:5175/?preview=hhc
npx eslint . && npm run build
git add -A src && git commit && git push
vercel --prod --yes              # deploy; Chris checks it himself
cd catalogue && python3 wayback.py   # resumable, needs free disk space
```
