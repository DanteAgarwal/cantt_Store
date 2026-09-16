# Product Requirements Document (PRD)
## Military / Tactical E-Commerce Platform

| Field | Value |
|---|---|
| Document | PRD |
| Version | 1.0 |
| Status | Draft — pending client sign-off |
| Reference site | https://onlinearmystore.in/ |
| Related docs | srs.md, implementation.md, task.md |

---

## 1. Executive Summary

Build an independently-owned e-commerce platform for a military/tactical/army-themed products business, giving the client's team a storefront that **feels as capable and browsable** as the reference site, backed by an admin panel that lets non-technical staff run the entire catalogue and operations — no developer needed for day-to-day changes.

Where the SRS answers "what must the system do," this PRD answers **why**, **for whom**, and **in what order we build it**.

---

## 2. Problem Statement

The client sells military-inspired clothing, tactical gear, regimental badges/patches, caps, bags, and related accessories. Today, running this as a serious online business needs:
- A storefront that doesn't feel like a generic template — buyers in this niche (forces personnel, veterans, enthusiasts, collectors) already have a mental model of what a good site in this category looks like (the reference site sets that bar).
- An operational backend where the client's own team can add a new regiment's badge, launch a seasonal collection, or run a homepage promotion **the same day**, without waiting on a developer.
- Enough structural flexibility (category depth, cross-cutting regiment tags, variants) to handle a catalogue that is naturally deep and fragmented (many regiments × many product types × many size/colour combinations).

---

## 3. Goals & Success Metrics

| Goal | Metric | MVP Target |
|---|---|---|
| Admin can self-serve catalogue changes | Time from "admin publishes product" to "live on site" | < 1 minute, zero code changes |
| Storefront feels fast on mobile | LCP on throttled mobile | < 2.5s |
| Checkout doesn't leak carts | Cart-to-order completion rate | Baseline established post-launch, then improve |
| Homepage stays fresh without dev help | # of homepage edits admin can make unassisted | 100% of section reordering/content swaps |
| Order status is trustworthy | Time from admin status update to customer visibility | Immediate |
| Zero overselling | Orders placed against out-of-stock variants | 0 |

---

## 4. Personas

### 4.1 Customer personas

**"The Serving/Retired Forces Buyer"** — wants regiment-accurate badges, caps, and merchandise tied to their specific unit; cares about authenticity of design and quick reorder for gifting.

**"The Tactical Enthusiast"** — buys tactical clothing/gear for outdoor/trekking/airsoft use; cares about material, fit, and functional features (pockets, straps), less about regiment specificity.

**"The Collector / Gift Buyer"** — buys badges, patches, diaries/decor items, often as one-off gifts; browses more than searches, responds to homepage curation ("Diaries & Decor", "Survival Ops Collection"-style groupings).

**"The Bulk/Corporate Buyer"** — orders in quantity for a unit, event, or reseller purpose; needs a path outside the normal single-item cart flow (→ FR-18 Bulk & Custom Orders).

### 4.2 Admin persona

**"The Store Operator"** — non-technical or semi-technical staff member who uploads new products daily/weekly, manages homepage banners around seasons/sales, processes orders, and answers stock questions. Success for this persona = never needing to file a dev ticket for routine catalogue/marketing work.

---

## 5. Reference Analysis — What We Emulate, What We Improve

We studied `onlinearmystore.in`'s structure (full breakdown in srs.md §3). Key structural patterns worth emulating:
- A **cross-cutting regiment/force taxonomy** layered on top of a conventional product-type category tree, so a buyer can shop "by product type" or "by their regiment."
- Homepage as a **sequence of curated, swappable sections** rather than one fixed hero + grid.
- A **separate bulk/custom-order path** distinct from the normal cart, recognizing that this niche has real B2B/bulk demand.
- Zone-based delivery estimates and a COD-above-threshold rule, which fits an audience that trusts COD more than prepaid for a new store.
- A visible "Purchase & Usage Guidelines" policy — this audience cares about the legitimacy/appropriateness of military-styled merchandise, and a clear policy builds trust (and covers the client legally).

Where we intend to do better, subject to client input:
- Cleaner, faster filter/sort UX (many WooCommerce-based sites like the reference are filter-light on mobile).
- A true CMS-driven homepage builder (admin picks section types and ordering) rather than developer-coded sections.
- A properly modelled variant/attribute system so "M/Olive" style combinations are structured data, not string parsing.

---

## 6. Scope

### 6.1 In scope (MVP + Phase 2, see §8)
Customer storefront, admin panel, catalogue/variant/inventory system, cart/wishlist/checkout, COD + mocked-then-real online payment, order lifecycle with status tracking, CMS-driven homepage + static legal pages, coupons, reviews, bulk/custom order enquiry, basic SEO.

### 6.2 Out of scope (explicitly, for now)
- Native mobile app (reference site has one; not committed here unless the client requests and funds it separately).
- Multi-vendor/marketplace functionality.
- International shipping / multi-currency / multi-language.
- Advanced recommendation engine, warehouse/ERP integration, shipping-aggregator integration (all listed as "Later" in §8).

---

## 7. User Journeys

### 7.1 Browse
```
Home → Category (or Force/Regiment strip) → Listing → Product Detail
```

### 7.2 Search
```
Search → Results → Filter/Sort → Product Detail
```

### 7.3 Purchase (registered or guest)
```
Product → Select Variant → Add to Cart → Cart Review
   → Checkout (Address → Shipping → Payment) → Order Confirmation
```

### 7.4 Admin — publish a product end to end
```
Login → Dashboard → Create Product → Assign Category (+ optional Regiment tag)
   → Upload Images → Add Variants (Size/Colour) → Set Price → Set Stock
   → Publish → [Verify: appears in category, search, PDP with no code change]
```

### 7.5 Bulk/Custom order enquiry
```
Bulk & Custom Orders page → Fill enquiry form (org, requirement, qty) → Submit
   → Lead appears in Admin → Admin follows up outside the normal order pipeline
```

### 7.6 Admin — homepage edit
```
Login → CMS → Reorder/toggle sections → Edit banner/product-carousel content
   → Save → [Verify: homepage reflects change without deploy]
```

---

## 8. Feature Prioritization

### MVP — first client demo / first production version (★★★★★)
```
Authentication (email+password, OTP)
Categories (multi-level) + Force/Regiment tags
Products + Variants + Inventory
Search + Filters + Sort
Homepage (CMS-driven) + Shop page + Category page + Product page
Cart + Wishlist
Checkout (Address, Shipping, COD + mocked online payment)
Orders (customer view + admin management + status history)
Admin panel (catalogue + orders + customers + CMS)
Static legal pages incl. Purchase & Usage Guidelines
Responsive UI (mobile-first)
```

### Phase 2 (★★★★☆)
```
Real online payment gateway integration
Coupons
Reviews & ratings
Returns/refund workflow
Email/SMS notifications
Bulk & Custom Order enquiry pipeline
Basic admin analytics/reporting
SEO tooling (sitemap, structured data)
Recently viewed / related products
```

### Later (★★★☆☆)
```
Upstash Redis-backed caching/rate limiting/queues (only if NFR-4 trigger fires)
Full-text/fuzzy search upgrade (e.g. Postgres trigram or a dedicated search service)
Recommendation engine
Warehouse/ERP integration
Shipping-aggregator integration
Multi-vendor
Multi-region / multi-currency
Native mobile app
```

---

## 9. Acceptance Criteria (feature-level, Given/When/Then)

### 9.1 Product publish → visible everywhere
**Given** a product has name, category, price, and at least one image
**When** admin publishes it
**Then** it appears in its category listing, in search results, and on its own product page — with no frontend code change.

### 9.2 Variant selection required before cart add
**Given** a product has size/colour variants
**When** a customer has not yet chosen a valid combination
**Then** "Add to Cart" stays disabled/hidden, matching the reference site's "Select Options" pattern.

### 9.3 Stock never oversold
**Given** a variant has 0 available (quantity − reserved)
**When** a customer attempts to add it to cart or checkout
**Then** the action is blocked with a clear out-of-stock message.

### 9.4 Guest cart merges on login
**Given** a guest has items in their cart
**When** they log in or register
**Then** those items appear in their account cart, deduplicated against anything already saved.

### 9.5 Coupon validation
**Given** a coupon code with a minimum order value, expiry date, and usage limit
**When** a customer applies it at checkout
**Then** the discount only applies if all conditions currently hold, with a specific error message if not (expired / below minimum / limit reached).

### 9.6 Order status visibility
**Given** admin changes an order's status (e.g. to "Shipped")
**When** the customer next views their order
**Then** the new status and a timeline entry are visible — no delay beyond normal page load.

### 9.7 Homepage section change
**Given** admin reorders or disables a homepage section
**When** a customer loads the homepage
**Then** the change is reflected (immediately, or on the next revalidation cycle per implementation.md's caching strategy) without a code deploy.

### 9.8 Bulk enquiry captured
**Given** a visitor submits the Bulk & Custom Orders form
**When** submission succeeds
**Then** a lead record is created and visible to admin, distinct from normal orders, with the visitor's contact and requirement details intact.

---

## 10. UX Principles

- **Mobile-first.** The reference site's own navigation choices (bottom tab bar, app-download prompt) signal a mobile-heavy audience; design flows for thumb reach and slow connections first, desktop second.
- **Trust signals up front.** COD availability, return window, and delivery-estimate language should appear near price/add-to-cart, not buried in policy pages — this audience weighs trust heavily for a niche/new store.
- **Curated, not just algorithmic, homepage.** Admin-picked carousels (by hand or by simple rule like "featured"/"new") outperform a single generic "all products" grid for a catalogue this taxonomy-rich.
- **Respect the regiment/force axis.** Many buyers think "I want my regiment's gear," not "I want a t-shirt." The force/regiment tag strip and filter must be a first-class, easy-to-find path, not an afterthought.
- **Never let the UI get ahead of stock.** Out-of-stock states are informative, not just disabled — show "notify me" potential for Phase 2 rather than making the item vanish.

---

## 11. Content & Catalogue Strategy

- Product-type category tree (Caps, T-Shirts, Jackets, Bags, Patches, Tactical Gear...) stays the primary navigational structure — this is how most buyers will enter (mirrors reference site's dropdown/mega-menu).
- Force/Regiment is a **tag**, applied on top of category, enabling "Shop by Force & Regiment" as a homepage section and a PLP filter, without duplicating the category tree per regiment (which would explode into an unmanageable number of near-empty categories).
- Seasonal/thematic groupings (Winter Collection, Summer Collection, Survival Ops Collection, etc.) are **CMS product-carousel sections** with either a manual product pick or a simple rule (e.g. "tag = winter"), so marketing pushes don't require a developer.

---

## 12. Business Rules Worth Client Confirmation

- COD availability threshold (reference pattern: enabled above a minimum order value) — client to confirm the number.
- Return/replacement window (reference pattern: a short fixed window, e.g. 5 days) — client to confirm policy.
- Shipping-zone buckets and their estimated delivery windows — client to confirm zones/carriers.
- Whether "Purchase & Usage Guidelines" imposes any actual purchase restriction (e.g. ID verification for certain items) or is purely an informational disclaimer — this affects whether checkout needs an extra compliance step at all, or just a linked policy page.

---

## 13. Risks & Open Questions

Same list as srs.md §9 from a product-decision angle:
1. Payment gateway choice (affects Phase-2 timeline and fee structure shown to customers).
2. Native app — confirm out-of-scope for MVP.
3. Legal copy for Purchase & Usage Guidelines — needs client/legal sign-off before launch, not a developer draft.
4. SMS/OTP provider inside Supabase Auth — affects OTP cost and deliverability in India.
5. Initial catalogue size — informs how soon caching (NFR-4) becomes necessary and how much seed-data effort Phase 0 needs.

---

## 14. Release Plan / Milestones

Mapped 1:1 onto implementation.md's phased plan and task.md's epics:

| Milestone | Contains | Gate to proceed |
|---|---|---|
| M0 — Foundations | Infra, DB schema, auth wiring | Migrations run clean against Supabase; login/signup works end-to-end |
| M1 — Catalogue proven | Category/Product/Variant/Inventory CRUD (admin) + read APIs | Critical E2E test (srs.md-adjacent, detailed in task.md) passes: admin publish → storefront reflects it |
| M2 — Storefront UI | Reference-pattern UI: header, homepage, PLP, PDP | Visual/UX review against reference-site structure (not pixel copy) |
| M3 — Commerce engine | Cart, Wishlist, Checkout, Orders | Full purchase journey completes with COD + mock payment |
| M4 — CMS + Admin ops | Homepage builder, static pages, dashboard | Admin can run a homepage promo unassisted |
| M5 — UAT | Client runs test cases (task.md UAT section) | Client sign-off |
| M6 — Launch | Production deploy, DNS/SSL, monitoring | Smoke test green, real payment gateway live (or COD-only launch, client's call) |

---

## 15. Appendix — Glossary
See srs.md §1.3 for shared technical terms.