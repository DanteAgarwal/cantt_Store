# Software Requirements Specification (SRS)
## Military / Tactical E-Commerce Platform

| Field | Value |
|---|---|
| Document | SRS |
| Version | 1.0 |
| Status | Draft — pending client sign-off |
| Reference site | https://onlinearmystore.in/ |
| Related docs | prd.md, implementation.md, task.md |

---

## 1. Introduction

### 1.1 Purpose
This SRS defines **what the system must do** — every functional and non-functional requirement the platform must satisfy before it can be called complete. It is the technical contract between the dev team and the client. Anything not in this document is out of scope unless a change request updates it.

### 1.2 Scope
The system is a full e-commerce platform for a military / tactical / army-themed products store, built so that:
- The **frontend experience** (layout, browsing flow, catalogue structure, cart/checkout flow) closely mirrors the reference site (`onlinearmystore.in`) in structure and usability — not in code, images, or copy.
- The **catalogue, branding, pricing, and business rules** are 100% the client's own.
- The **admin panel** lets non-technical staff run the entire catalogue and store operations without a developer touching code.

Two applications ship:
1. **Customer storefront** — public website, mobile-responsive.
2. **Admin panel** — internal tool for catalogue, orders, customers, CMS, marketing.

### 1.3 Definitions & Acronyms

| Term | Meaning |
|---|---|
| SRS | Software Requirements Specification (this document) |
| PRD | Product Requirements Document |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| SKU | Stock Keeping Unit — unique code per variant |
| RLS | Row Level Security (Postgres/Supabase feature) |
| COD | Cash on Delivery |
| CMS | Content Management System (admin-editable homepage/pages) |
| PDP | Product Detail Page |
| PLP | Product Listing Page |
| OTP | One-Time Password |

### 1.4 Intended Audience
Developers, QA, the client (for UAT sign-off), and any future maintainer of the codebase.

### 1.5 References
- Reference site: https://onlinearmystore.in/ (structure/UX reference only)
- prd.md — product goals, personas, prioritization
- implementation.md — architecture, schema, API contracts
- task.md — execution backlog

---

## 2. Overall Description

### 2.1 Product Perspective
A new, independently built system. It does not integrate with or depend on the reference site in any way. It is composed of:

```
Customer Storefront (Next.js) ──┐
                                 ├──► Backend API (NestJS) ──► PostgreSQL (Supabase)
Admin Panel (Next.js)     ──────┘            │
                                              ├──► Auth (Supabase Auth)
                                              ├──► Storage (Supabase Storage)
                                              └──► Cache/Queue (Upstash Redis — conditional, see NFR-4)
```

### 2.2 Product Functions (Summary)
- Customer: browse, search, filter, cart, wishlist, checkout, track orders, review products, request bulk/custom orders.
- Admin: manage categories/products/variants/inventory/orders/customers/coupons/reviews/CMS/media, without developer involvement.
- System: keep storefront in sync with admin changes in real time (or near-real-time), enforce business rules (pricing, stock, coupons, shipping), and record every state change.

### 2.3 User Classes

| Class | Description | Access |
|---|---|---|
| Guest | Unauthenticated visitor | Browse, search, guest cart, guest checkout (optional) |
| Registered Customer | Signed up via email/password, email OTP, or phone OTP | Above + saved addresses, order history, wishlist, reviews |
| Staff | Limited admin | Orders, inventory, customer support views |
| Admin | Full catalogue + operations | Everything except system-level settings |
| Super Admin | Full system access | Everything incl. role management, integrations, settings |

### 2.4 Operating Environment
- Storefront: modern evergreen browsers (Chrome, Safari, Edge, Firefox), iOS Safari and Android Chrome for mobile.
- Admin panel: desktop-first, but usable on tablet.
- Backend: Node.js runtime, containerized, deployed independent of frontend.
- Database/Auth/Storage: Supabase (managed Postgres + Auth + Storage).

### 2.5 Design & Implementation Constraints
- Auth, primary Postgres database, and file/object storage **must** run on Supabase (client-mandated).
- Redis (via Upstash) is **conditional** — only introduced when a concrete need (rate limiting, caching, background queues) is confirmed. Not a hard MVP dependency (see NFR-4).
- Payment gateway is pluggable; MVP ships with COD + a mocked/test-mode online payment, real gateway (e.g. Razorpay/Cashfree) wired in Phase 2 pending client's merchant account.
- No source code, images, copy, or proprietary assets are to be copied from the reference site — structural/UX patterns only.
- All prices in INR (₹). Shipping initially India-only.

### 2.6 Assumptions & Dependencies
- Client will supply: brand logo, product photography, category list, initial catalogue data, legal policy text (Terms, Privacy, Shipping, Refund, and a **Purchase & Usage Guidelines for military-styled goods** — the reference site carries exactly this kind of policy page, and it matters for a store selling regimental insignia/badges/replica items), and support contact details.
- Client will create/own the Supabase project (or grant the dev team an org seat) so credentials and billing stay in the client's control.
- A payment gateway merchant account (Razorpay/Cashfree/PayU or similar) will be arranged by the client before Phase-2 (real online payments) begins.

---

## 3. Reference Website Analysis

This section documents what was actually observed on `onlinearmystore.in`, used purely to size and structure our own requirements. Nothing here is to be copied verbatim (no logos, photos, copy, or code) — only the *pattern* is reused.

### 3.1 Global layout
- Top announcement/marquee bar (rotating offers, delivery/COD note, support number).
- Header: logo, "select category" dropdown, search bar, login/register, wishlist icon+count, cart icon+count+running total.
- Sticky **mobile bottom navigation**: Home, Shop, My Orders, Wishlist, (App download), My Account, Contact Us, Bulk & Custom Orders.
- Footer: address + WhatsApp/phone + email, "Useful Links" (About, Contact, My Account, Terms & Conditions, Privacy Policy, Shipping & Delivery Policy, Refund & Cancellation Policy, **Purchase & Usage Terms for Military Goods**), delivery-zone estimates, payment method icons, support hours.

### 3.2 Category structure
Two-level (occasionally could support three-level) category tree, e.g.:
```
Army Winter Wear
 ├── Military & Tactical Jackets
 ├── Sweaters and Jerseys
 ├── Sweatshirts
 └── Thermal & Inner Wear

Military Caps and Headwear
 ├── Army Beret Cap
 ├── Army Caps
 ├── Regimental Caps
 ├── Regimental Retiree Caps
 └── Regimental Winter Caps
```
Some top-level categories have **no children** (e.g. Army Belts, Gloves, Sleeping Bags) — the model must support both leaf-level and branch-level categories at the top.

There is also a **cross-cutting taxonomy**: "Shop by Force & Regiment" (PARA, BSF, CRPF, Signals, EME, AMC, NCC, ADC...). A product can belong to one category (e.g. "Regimental T-Shirts") **and** one or more regiment tags (e.g. "PARA"). This must NOT be modelled as a second category tree — it is a tag/attribute, so a product isn't forced into an artificial category just to be filterable by regiment. → see SRS §4.4 and implementation.md `Tag` model.

### 3.3 Homepage sections observed
```
Hero banner carousel
Shop-by-Category icon strip
New Arrivals (product grid, sale badges, "select options" vs "add to cart")
Seasonal collection block (e.g. Winter Collection — category tiles)
Seasonal collection block (e.g. Summer Collection — category tiles)
Themed product carousels (e.g. "Tactical & Trekking Pants", "Tactical Collectible Patches", "Caps Collection", "Diaries & Decor")
"Survival Ops Collection" themed block
"Shop by Force & Regiment" chip strip
Customer testimonials / reviews carousel
Footer
```
Every one of these is admin-editable content, not hardcoded markup — this is the single most important structural requirement carried into FR-14 (CMS).

### 3.4 Product card behaviour
- Primary + hover-swap secondary image.
- Discount badge (e.g. `-29%`), strikethrough MRP + sale price, unit note ("Per piece").
- **Simple product** → "Add to Cart" button directly on the card.
- **Variable product** (has size/colour options) → "Select Options" button, which routes to PDP for variant selection (no cart add without a chosen variant).
- Quick View action, Add-to-Wishlist heart icon, stock status text ("In stock").
- Star rating shown when reviews exist.

### 3.5 Search, filter, cart, checkout, account
- Predictive/instant search-as-you-type overlay.
- PLP filters driven by the attributes relevant to the active category (size/colour/regiment/price range) plus sort (Newest, Price ↑/↓, Popularity, Rating).
- Slide-out mini-cart with running item count and total.
- Account area: Login/Register modal supports **password login** and **OTP login**; registration collects phone (verified via OTP) in addition to email.
- "My Orders" as a first-class nav item (not buried inside account settings) — mobile users track orders often.
- Dedicated **"Bulk and Custom Orders"** page/nav entry — a B2B/bulk-enquiry path distinct from the normal cart flow.
- COD available above a minimum order value; stated return/replacement window; delivery estimates bucketed by shipping zone (e.g. nearby / others / north-south) rather than a single fixed promise.

### 3.6 What we explicitly will NOT copy
```
Reference logo, brand name, brand colours
Reference product photography
Reference product copy / descriptions
Reference proprietary source code, theme, or plugin assets
Reference customer reviews/testimonials
```

---

## 4. Functional Requirements

Each requirement has an ID, priority (P0 = must-have MVP, P1 = MVP-important, P2 = Phase 2+), and a description. Priorities are elaborated further in prd.md §8.

### 4.1 FR-01 — Authentication & Account (P0)
The system shall allow, via **Supabase Auth**:
- Registration with email + password.
- Login with email + password.
- Login via OTP (email or phone).
- Phone number verification via OTP at signup.
- Logout (session/token invalidation).
- Password reset via emailed link.
- Session persistence across page reloads (JWT-based, httpOnly refresh cookie on web).
- Guest checkout without forced registration (P1).

Business rules:
- A `profiles` row is auto-created in Postgres the moment a Supabase `auth.users` row is created (DB trigger — see implementation.md §10).
- Every authenticated API call is authorized against role stored on the profile (`CUSTOMER`, `STAFF`, `ADMIN`, `SUPER_ADMIN`).

### 4.2 FR-02 — Category Management (P0)
Admin shall be able to: create, read, update, delete, activate/deactivate, and reorder categories.
- Categories support parent → child → grandchild nesting (self-referencing tree), and a top-level category may have zero children (leaf).
- Each category has: name, slug (auto-generated, editable), description, image, parent, sort order, active flag, featured flag, SEO title/description.
- Deleting a category with products/children requires explicit confirmation and a policy choice (reassign products to "Uncategorised" or block deletion) — deletion must never silently orphan products.
- Frontend category pages, and the header mega-menu, are generated **entirely from this data** — no hardcoded nav.

### 4.3 FR-03 — Product Management (P0)
Admin shall be able to: create, edit, delete, publish, unpublish, and duplicate products.
- Product fields: name, slug, description, short description, brand (optional), base price, compare-at price (MRP for strikethrough), status (draft/published/archived), featured flag, SEO title/description, images (ordered, one marked primary), category assignment (one or more), tag assignment (regiment/season/collection).
- **Acceptance criterion (critical):** the moment admin publishes a product and assigns a category, it must appear in that category's listing, in search, and on its own PDP — with zero frontend code changes.

### 4.4 FR-04 — Variants & Attributes (P0)
- A product may define one or more attributes (Size, Colour, Material, or custom) and generate variant combinations (e.g. M/Black, M/Olive, L/Black...).
- Each variant has its own SKU, optional price/compare-at-price override, weight, active flag, and its own inventory record.
- If a product has variants, the customer **must** select a valid combination before add-to-cart is enabled (mirrors reference site's "Select Options" behaviour).
- Cross-cutting "Force/Regiment" and "Season/Collection" labels are **Tags**, not variant attributes — a product can carry multiple tags without generating extra SKUs for them.

### 4.5 FR-05 — Inventory Management (P0)
- Stock is tracked per variant: quantity on hand, quantity reserved (held during an in-progress checkout), and a low-stock threshold.
- Out-of-stock variants are shown but not purchasable (disabled option, "Out of stock" label) rather than hidden, unless admin explicitly unpublishes the product.
- Stock decrements on order confirmation; a reservation is created at checkout-start and released if payment/COD confirmation fails or times out (prevents overselling on concurrent checkouts).

### 4.6 FR-06 — Product Browsing / Search / Filter / Sort (P0)
- Customer can browse by category (with sub-category drill-down), free-text search (name/description/SKU/tag), filter by dynamically-relevant attributes + price range + regiment tag, and sort by Newest / Price ↑ / Price ↓ / Popularity / Rating.
- Pagination (or infinite scroll) on all listing surfaces; filters must combine (AND logic) and be shareable via URL query params (so a filtered link is bookmarkable/shareable).
- Search must tolerate common misspellings/partial matches for at least product name and category name (P1: fuzzy/trigram search).

### 4.7 FR-07 — Cart (P0)
- Add / remove / change quantity, view subtotal, shipping estimate, tax (if applicable), coupon discount, and grand total.
- Works for both **guest** (identified by a signed httpOnly cookie token) and **logged-in** customers; a guest cart merges into the account cart on login/registration.
- Cart persists across sessions/devices for logged-in customers (stored server-side, not just localStorage).

### 4.8 FR-08 — Wishlist (P1)
- Add/remove product (or specific variant) to wishlist; requires login (mirrors reference site's login-gated wishlist).
- Wishlist page listing saved items with quick "move to cart".

### 4.9 FR-09 — Checkout (P0)
Sequential flow: Customer info → Address (select saved or add new) → Shipping method/estimate → Payment method → Review & Place Order → Confirmation.
- Payment methods: COD (with a configurable minimum order value to enable it, mirroring reference site's "COD above ₹X" rule) and Online Payment (mocked/test-mode for MVP demo, real gateway in Phase 2).
- Coupon code entry with real-time validation (min order value, expiry, usage limit, per-user limit, product/category restriction).
- On successful placement: stock is decremented, an order record + order-status-history entry are created, and a confirmation email/SMS is (attempted to be) sent.

### 4.10 FR-10 — Order Management (P0)
Customer: view order list, view order detail (items, status, timeline, shipment tracking if available), cancel where the current status still allows it.
Admin: view/filter all orders, update status (with a controlled status transition graph — see below), initiate refund/return, add internal notes.

Status graph:
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
   │                                                                 │
   └────────────► CANCELLED                          RETURNED ◄─────┘
                                                          │
                                                          ▼
                                                       REFUNDED
```
Every transition is recorded in `OrderStatusHistory` with actor + timestamp (audit trail), and the customer sees status changes reflected without any deploy (acceptance criterion mirrors FR-03's).

### 4.11 FR-11 — Coupons & Discounts (P1)
Admin CRUD on coupons: percentage or fixed discount, minimum order value, max discount cap, total usage limit, per-customer usage limit, start/expiry dates, and optional restriction to specific products/categories.

### 4.12 FR-12 — Reviews & Ratings (P1)
- Customer can submit a rating (1–5) + title + body on a product they purchased.
- Reviews go into a moderation queue (`isApproved`) before showing publicly; "Verified Purchase" badge derived from order history.
- Product average rating and count are computed/denormalized for listing pages.

### 4.13 FR-13 — Shipping & Delivery Estimates (P1)
- Configurable shipping zones with different estimated delivery windows (mirrors reference site's "Nearby / Others / North-South" bucketing) shown on PDP and at checkout.
- Shipping fee can be flat, free-above-threshold, or zone-based (admin-configurable).

### 4.14 FR-14 — CMS / Homepage & Content Management (P0)
This is what makes the storefront a **real product**, not a hardcoded clone.
- Admin can manage an ordered list of homepage **sections**, each of a type: Hero Carousel, Category Grid, Product Carousel (manual pick or rule-based e.g. "featured", "new arrivals"), Promotional Banner, Testimonials, Force/Regiment Strip.
- Each section: title/subtitle, an active flag, sort order, and a flexible JSON config (e.g. which category IDs or product IDs to show).
- Admin can also manage static content pages (About Us, Contact Us, Terms & Conditions, Privacy Policy, Shipping & Delivery Policy, Refund & Cancellation Policy, and the **Purchase & Usage Guidelines for military-styled goods** page) as CMS pages with editable HTML/rich-text body — this is a legal-content requirement given the product category (see NFR-8 Compliance).
- **Acceptance criterion:** reordering/enabling/disabling a section, or editing a static page, reflects on the live site immediately (or on next revalidation cycle, see NFR-1) with no code change.

### 4.15 FR-15 — Media / Asset Management (P0)
- Centralized media library backed by Supabase Storage: product images, category images, banner images, CMS images, avatars.
- Admin uploads go through the backend (signed-upload flow — implementation.md §11), get a `Media` record, and can be reused across products/sections without re-uploading.
- Images are served via CDN URL, responsive-sized on the frontend (`next/image`), lazy-loaded off-viewport.

### 4.16 FR-16 — Admin Dashboard & Reporting (P1)
- At-a-glance metrics: orders today/this week, revenue, low-stock alerts, pending reviews, recent orders needing action.
- Basic reports (Phase 2): sales by category, top products, coupon usage.

### 4.17 FR-17 — Notifications (P1)
- Transactional: order confirmation, order status change, password reset, OTP delivery (the last handled by Supabase Auth's configured provider).
- Channels: email (P1) and SMS (P2, tied to a configured provider); admin-facing low-stock alert (P2).

### 4.18 FR-18 — Bulk & Custom Orders Enquiry (P1)
Mirroring the reference site's dedicated nav entry: a form (name, phone/email, organisation, product/requirement description, quantity, optional file attachment) that creates a lead record visible to admin — a separate funnel from the normal cart checkout, for corporate/regimental bulk buyers.

### 4.19 FR-19 — Static / Legal Content Pages (P0)
About Us, Contact Us, Terms & Conditions, Privacy Policy, Shipping & Delivery Policy, Refund & Cancellation Policy, and Purchase & Usage Guidelines for military-styled goods — all editable via FR-14's CMS page mechanism, all linked from the footer.

### 4.20 FR-20 — SEO (P1)
Per-page meta title/description (category, product, CMS page), clean slugs, sitemap.xml, robots.txt, structured data (Product, BreadcrumbList) on PDP.

---

## 5. Data Requirements

Full entity list (see implementation.md §8 for the exact Prisma schema — this is the requirements-level view):

```
Profile (extends Supabase auth.users 1:1)
Address
Category (self-referencing tree)
Brand
Tag (general / force-regiment / season / collection)
Attribute, AttributeValue
Product, ProductImage, ProductVariant, VariantAttributeValue
Inventory
Cart, CartItem
Wishlist, WishlistItem
Coupon
Order, OrderItem, OrderStatusHistory, Payment, Shipment
Review
CmsPage, CmsSection, Banner
Media
AuditLog
BulkOrderEnquiry
```

Key relationships:
- Category is self-referencing (`parentId`) — arbitrary depth, but UI/UX targets 2–3 levels.
- Product ↔ Category is many-to-many (a product can live in more than one category, matching the reference site where e.g. a t-shirt can appear under both a type category and a regiment-flavoured sub-category).
- Product ↔ Tag is many-to-many (regiment/force, season, collection — cross-cutting, non-hierarchical).
- Product → ProductVariant is one-to-many; ProductVariant ↔ AttributeValue is many-to-many (via a join table) to represent arbitrary attribute combinations.
- Inventory is one-to-one with ProductVariant (every purchasable unit has exactly one stock record).
- Order snapshots product name + variant description + unit price at time of purchase (OrderItem carries its own copy) so later catalogue edits never rewrite order history.

---

## 6. External Interface Requirements

### 6.1 User Interfaces
- Responsive storefront (mobile-first — reference site data suggests a large share of mobile traffic given the bottom tab bar and app-download prompt).
- Admin panel — desktop-first, data-table + form heavy, usable on tablet.

### 6.2 Software Interfaces

| Interface | Purpose | Notes |
|---|---|---|
| Supabase Auth API | Signup/login/OTP/session/password reset | Client SDK on frontend for auth flows; backend verifies JWT |
| Supabase Postgres | System of record | Accessed via Prisma from the NestJS backend only |
| Supabase Storage | Media storage | Signed upload URLs issued by backend |
| Payment Gateway | Online payments | Mocked in MVP; real gateway (Razorpay/Cashfree/PayU — client to confirm) in Phase 2 |
| Email provider (e.g. Resend/SendGrid) | Transactional email | Order confirmations, password reset |
| SMS/OTP provider (via Supabase Auth) | Phone OTP | Configured inside Supabase Auth (e.g. Twilio/MSG91) |
| Upstash Redis (conditional) | Cache / rate limit / queue | Added only when NFR-4's trigger conditions are met |

### 6.3 Communication Interfaces
HTTPS only (TLS everywhere), REST/JSON between frontend and backend, webhooks from payment gateway to backend for async payment confirmation.

---

## 7. Non-Functional Requirements

### NFR-1 — Performance
- PLP/PDP/homepage should be server-rendered or statically-generated with on-demand revalidation, so time-to-first-byte and Largest Contentful Paint stay low even on 3G/4G mobile connections (a realistic condition for the target audience).
- Target: PLP/PDP first meaningful content < 2.5s on a throttled mobile profile; API list endpoints paginate (default 20–24 items) and never return unbounded result sets.
- Images lazy-loaded below the fold, served at responsive breakpoints.

### NFR-2 — Security
- All traffic over HTTPS. Auth tokens are short-lived JWTs; refresh tokens stored in httpOnly, secure, sameSite cookies (never in localStorage).
- Role-based authorization enforced **server-side** on every admin endpoint (never trust a frontend role check alone).
- Input validation (DTO-level) on every API endpoint; parameterized queries only (Prisma prevents raw SQL injection by default — any raw query must be reviewed).
- Rate limiting on auth endpoints (login, OTP request, password reset) to blunt brute-force/OTP-spam abuse.
- Supabase service-role key is a backend-only secret, never shipped to any frontend bundle.
- Row Level Security (RLS) is enabled on Supabase tables as **defense in depth**, even though the primary trust boundary is the backend API (see implementation.md ADR-4) — this matters because Supabase Postgres is reachable directly, not only through our API.

### NFR-3 — Scalability & Availability
- Stateless backend (NestJS) so it can scale horizontally behind a load balancer without sticky sessions.
- Database schema designed so new products/categories/orders/customers never require frontend code changes (already an acceptance criterion in FR-03/FR-10).
- Target uptime: 99.5%+ for MVP (single-region managed infra is acceptable at this stage).

### NFR-4 — Caching / Redis Policy (Upstash — conditional)
Redis is **not** a day-1 requirement. Introduce Upstash Redis only when one of these is actually true:
1. Rate limiting must be enforced consistently across more than one backend instance (in-memory rate limiting no longer suffices).
2. Catalogue/homepage read traffic measurably strains Postgres and a cache layer (category tree, homepage CMS payload, hot product lists) is the cheaper fix vs. scaling the DB.
3. A background job queue is needed (e.g. BullMQ for sending emails/invoices asynchronously) — BullMQ needs a Redis-compatible backend, which Upstash provides over TCP.
If none of the above is true at launch, ship without Redis — one less moving part, one less secret to rotate.

### NFR-5 — Usability & Accessibility
- Keyboard-navigable forms, sufficient colour contrast, alt text on all product/category images (`altText` field is mandatory, not optional, in the data model), semantic HTML landmarks.
- Empty/loading/error states designed for every list/detail view (not just the happy path).

### NFR-6 — Compatibility
- Latest two versions of Chrome, Safari, Edge, Firefox; iOS 15+/Android 10+ for mobile browsers. No IE support.

### NFR-7 — Maintainability
- Strict TypeScript across frontend and backend; documented API contract (implementation.md §9); Prisma migrations checked into version control; no direct hand-edits to the production schema.

### NFR-8 — Compliance / Legal
- Because the catalogue includes regimental insignia/badge/replica-styled items, the storefront **must** carry a clearly linked "Purchase & Usage Guidelines" policy page (disclaiming that items are inspired/replica merchandise unless explicitly stated as officially licensed, and stating any purchase restrictions the client wants to declare) — modelled as a CMS page (FR-19), content owned by the client/legal, not hardcoded by developers.
- Standard e-commerce legal pages (Terms, Privacy, Shipping, Refund/Cancellation) required before go-live.

### NFR-9 — Localization
- MVP: India-only shipping, INR currency, English UI. Multi-language/multi-currency is explicitly Later-phase (prd.md §8).

---

## 8. Traceability Snapshot

| FR | Reference-site pattern it mirrors | Primary module (implementation.md) |
|---|---|---|
| FR-02 | Multi-level nav / category dropdown | `categories` |
| FR-03/04 | Product card variants, "Select Options" | `products`, `variants` |
| FR-06 | Filters + sort on PLP | `catalogue-search` |
| FR-07/09 | Mini-cart, checkout | `cart`, `checkout` |
| FR-10 | "My Orders" nav item | `orders` |
| FR-14 | Homepage sections (hero/carousels/banners) | `cms` |
| FR-18 | "Bulk and Custom Orders" nav item | `bulk-enquiry` |
| FR-19 | Footer policy links | `cms` (static pages) |

---

## 9. Open Questions / Risks (to resolve before/at PRD sign-off)

1. Which payment gateway will the client's merchant account use (Razorpay/Cashfree/PayU)? Affects Phase-2 integration scope.
2. Will the client run a native mobile app (reference site links a Play Store app)? Out of scope for MVP unless confirmed.
3. Exact wording/legal content for the "Purchase & Usage Guidelines" page — needs client/legal input, not a developer decision.
4. SMS/OTP provider choice inside Supabase Auth (Twilio vs MSG91 vs others) — affects per-message cost and India deliverability.
5. Expected initial catalogue size (SKU count) — informs whether NFR-4's caching trigger is likely to fire early.

---

## 10. Appendix — Glossary
See §1.3. Additional business terms (regiment, force, tactical series, etc.) are catalogue taxonomy values, not system-level terms, and therefore live in seed data / admin-entered `Tag` records rather than in code.