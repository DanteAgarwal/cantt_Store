# Task Backlog
## Military / Tactical E-Commerce Platform

| Field | Value |
|---|---|
| Document | Implementation Backlog |
| Version | 1.0 |
| Related docs | srs.md, prd.md, implementation.md |
| Priority key | P0 = MVP blocker · P1 = MVP-important · P2 = Phase 2+ |
| Estimate unit | Story points (rough sizing, not hours) |

Task IDs are prefixed by epic (`INF-`, `DB-`, `AUTH-`, `CAT-`, `PROD-`, `ADM-`, `FE-`, `CART-`, `WISH-`, `CHK-`, `ORD-`, `CMS-`, `MKT-`, `REV-`, `BULK-`, `LEGAL-`, `TST-`, `DEP-`).

---

## EPIC 1 — Infrastructure (Supabase + Upstash aware)

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| INF-001 | Create Git monorepo (apps/web, apps/admin, apps/api, packages/*) | P0 | — | 1 | Repo builds locally with placeholder apps |
| INF-002 | Create Supabase project | P0 | — | 1 | Project reachable; client has org access |
| INF-003 | Enable Supabase Auth providers: email/password + phone OTP | P0 | INF-002 | 1 | Test OTP round-trip succeeds in Supabase dashboard |
| INF-004 | Create Supabase Storage buckets: product-images, banners, cms-media, avatars | P0 | INF-002 | 1 | Buckets visible, correct public/private flags set |
| INF-005 | Initialize Next.js app — storefront (apps/web) | P0 | INF-001 | 1 | Runs locally on dev server |
| INF-006 | Initialize Next.js app — admin (apps/admin) | P0 | INF-001 | 1 | Runs locally, separate port |
| INF-007 | Initialize NestJS app (apps/api) | P0 | INF-001 | 1 | Boots with a health-check route |
| INF-008 | Configure Prisma with pooled `DATABASE_URL` + direct `DIRECT_URL` against Supabase | P0 | INF-002 | 2 | `prisma db pull`/`migrate dev` both succeed |
| INF-009 | Env var management (.env.example per app, secrets never committed) | P0 | INF-005..008 | 1 | CI fails if a secret pattern is detected in a diff |
| INF-010 | ESLint/Prettier/shared tsconfig across monorepo | P1 | INF-001 | 1 | `lint` script passes on all apps |
| INF-011 | GitHub Actions CI: lint + typecheck + build on PR | P0 | INF-010 | 2 | PR blocked on red CI |
| INF-012 | Choose + connect backend host (Railway/Render/Fly.io) | P0 | INF-007 | 1 | `apps/api` deploys a "hello" build |
| INF-013 | Connect Vercel projects for apps/web and apps/admin | P0 | INF-005,006 | 1 | Preview deploy works on a PR |
| INF-014 | (Conditional) Create Upstash Redis instance — only once an NFR-4 trigger fires | P2 | — | 1 | Skip entirely unless implementation.md §11 trigger is confirmed |

---

## EPIC 2 — Database (Prisma schema against Supabase Postgres)

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| DB-001 | Author enums (Role, ProductStatus, OrderStatus, PaymentMethod, PaymentStatus, DiscountType, AddressType, TagType, CmsSectionType) | P0 | INF-008 | 1 | Schema compiles |
| DB-002 | Profile model + link strategy to `auth.users` | P0 | DB-001 | 2 | `profiles.id` type/shape matches `auth.users.id` |
| DB-003 | Address model | P0 | DB-002 | 1 | CRUD via Prisma Studio works |
| DB-004 | Category model (self-relation) | P0 | DB-001 | 2 | 3-level nesting query returns correct tree |
| DB-005 | Brand model | P1 | DB-001 | 1 | — |
| DB-006 | Tag model (+ TagType) | P0 | DB-001 | 1 | Can create FORCE_REGIMENT-typed tags |
| DB-007 | Attribute + AttributeValue models | P0 | DB-001 | 2 | Unique constraint on (attributeId, value) holds |
| DB-008 | Product model | P0 | DB-004,005 | 2 | — |
| DB-009 | ProductCategory join (M:N) | P0 | DB-008,004 | 1 | A product can hold 2+ categories |
| DB-010 | ProductTag join (M:N) | P0 | DB-008,006 | 1 | — |
| DB-011 | ProductImage model | P0 | DB-008 | 1 | Ordered by sortOrder, one isPrimary enforced at app layer |
| DB-012 | ProductVariant + VariantAttributeValue models | P0 | DB-008,007 | 3 | Unique SKU enforced |
| DB-013 | Inventory model (1:1 variant) | P0 | DB-012 | 1 | quantity/reserved never negative (app-level guard + check) |
| DB-014 | Cart + CartItem models (guest + account) | P0 | DB-002,012 | 2 | Unique (cartId, variantId) enforced |
| DB-015 | Wishlist + WishlistItem models | P1 | DB-002,012 | 1 | — |
| DB-016 | Coupon model | P1 | DB-001 | 1 | — |
| DB-017 | Order + OrderItem models (with snapshot fields) | P0 | DB-002,003,012 | 3 | OrderItem stores name/variant snapshot independent of later catalogue edits |
| DB-018 | OrderStatusHistory model | P0 | DB-017 | 1 | Every status write also inserts a history row (enforced in service layer) |
| DB-019 | Payment model | P0 | DB-017 | 1 | — |
| DB-020 | Shipment model | P1 | DB-017 | 1 | — |
| DB-021 | Review model | P1 | DB-002,008 | 1 | — |
| DB-022 | CmsPage + CmsSection + Banner models | P0 | DB-001 | 2 | `config` Json accepts arbitrary section payloads |
| DB-023 | Media model | P0 | DB-001 | 1 | — |
| DB-024 | BulkOrderEnquiry model | P1 | DB-001 | 1 | — |
| DB-025 | AuditLog model | P1 | DB-002 | 1 | — |
| DB-026 | Write + run initial migration (`prisma migrate dev`, direct URL) | P0 | DB-001..025 | 2 | Migration applies clean on a fresh Supabase project |
| DB-027 | Seed script — categories (2–3 levels), regiment tags, sample products/variants/inventory | P0 | DB-026 | 3 | `prisma db seed` produces a browsable catalogue |
| DB-028 | Indexes review pass (slugs, status, parentId, FKs) | P1 | DB-026 | 1 | `EXPLAIN` on hot queries uses indexes |

---

## EPIC 3 — Authentication (Supabase Auth-based — lighter than a hand-rolled auth epic)

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| AUTH-001 | Integrate Supabase client SDK in apps/web + apps/admin | P0 | INF-003 | 1 | SDK initializes with anon key |
| AUTH-002 | Sign-up UI (email + password + phone) | P0 | AUTH-001 | 2 | New user lands with a verified/pending session |
| AUTH-003 | Sign-in UI (password) | P0 | AUTH-001 | 1 | — |
| AUTH-004 | OTP sign-in UI (email or phone) | P0 | AUTH-001,INF-003 | 2 | OTP round-trip succeeds end to end |
| AUTH-005 | Password reset flow UI | P1 | AUTH-001 | 1 | Reset email received and link works |
| AUTH-006 | Postgres trigger: `auth.users` → `public.profiles` on insert | P0 | DB-002 | 2 | New signup produces exactly one profile row, role=CUSTOMER |
| AUTH-007 | NestJS `SupabaseAuthGuard` (JWT verify) | P0 | INF-007 | 2 | Invalid/expired token → 401 |
| AUTH-008 | NestJS `RolesGuard` + `@Roles()` decorator | P0 | AUTH-007 | 1 | Non-admin hitting an admin route → 403 |
| AUTH-009 | Session persistence + silent refresh (web) | P0 | AUTH-001 | 1 | Reload keeps user logged in until token actually expires |
| AUTH-010 | Guest→account cart/wishlist merge on login | P1 | AUTH-003,CART-* | 2 | See CHK acceptance criteria; no item duplication |
| AUTH-011 | Admin role assignment endpoint (`SUPER_ADMIN`-only, audited) | P1 | AUTH-008,DB-025 | 2 | Role change appears in AuditLog |
| AUTH-012 | Rate limiting on OTP request / login / password reset | P1 | AUTH-004,005 | 2 | Repeated rapid requests get throttled with a clear error |

---

## EPIC 4 — Category API & Admin UI

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| CAT-001 | `GET /categories` (tree) | P0 | DB-004,027 | 2 | Returns nested tree matching seed data |
| CAT-002 | `GET /categories/:slug` (+ paginated products) | P0 | CAT-001 | 2 | — |
| CAT-003 | `POST/PATCH/DELETE /admin/categories` | P0 | AUTH-008,DB-004 | 3 | Delete blocks or reassigns per configured policy, never silently orphans |
| CAT-004 | `PATCH /admin/categories/reorder` | P1 | CAT-003 | 1 | Bulk sort persists |
| CAT-005 | Admin UI — category list/tree editor | P0 | CAT-003 | 3 | Non-technical tester can create a 2-level category unaided |
| CAT-006 | On-demand ISR revalidation hook on category write | P0 | CAT-003,FE-002 | 2 | Storefront menu updates without redeploy |

---

## EPIC 5 — Product, Variant & Inventory API + Admin UI

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| PROD-001 | `GET /products` with category/tag/price/sort/pagination filters | P0 | DB-008..013,027 | 3 | Matches SRS FR-06 filter/sort matrix |
| PROD-002 | `GET /products/:slug` full detail | P0 | PROD-001 | 2 | Includes resolved variant/attribute combos + inStock per variant |
| PROD-003 | `GET /products/:slug/related`, `/products/featured` | P1 | PROD-002 | 2 | — |
| PROD-004 | `POST/PATCH/DELETE /admin/products` | P0 | AUTH-008,DB-008 | 3 | — |
| PROD-005 | `POST /admin/products/:id/publish` \| `/unpublish` \| `/duplicate` | P0 | PROD-004 | 2 | Publish triggers revalidation (see PROD-011) |
| PROD-006 | Variant CRUD (`/admin/products/:id/variants`, `/admin/variants/:id`) | P0 | DB-012 | 3 | SKU uniqueness enforced with a clear error |
| PROD-007 | Inventory set/update (`PATCH /admin/variants/:id/inventory`) | P0 | DB-013 | 2 | Quantity/threshold update reflected in stock status immediately |
| PROD-008 | Image attach/reorder/set-primary (`/admin/products/:id/images*`) | P0 | MED-* (Epic media, see §Media below), DB-011 | 2 | — |
| PROD-009 | Admin UI — product list + create/edit form | P0 | PROD-004..008 | 5 | Non-technical tester can create a full product w/ 2 variants unaided |
| PROD-010 | Admin UI — variant/attribute manager, inventory manager | P0 | PROD-006,007 | 3 | — |
| PROD-011 | On-demand ISR revalidation hook on product publish/update | P0 | PROD-005,FE-003 | 2 | **Critical acceptance criterion:** published product appears in category, search, and its own PDP with zero code change |
| PROD-012 | Reservation logic on checkout-start; release on failure/timeout | P0 | DB-013,CHK-* | 3 | Concurrent checkouts on last unit never both succeed |

**Media (supporting sub-epic, referenced by PROD-008 / CMS / marketing):**

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| MED-001 | `POST /admin/media/sign-upload` (Supabase Storage signed URL) | P0 | INF-004,AUTH-008 | 2 | Signed URL accepts a direct client PUT |
| MED-002 | `POST /admin/media/confirm` → persists `Media` row | P0 | MED-001,DB-023 | 1 | — |
| MED-003 | Admin UI — media library (browse/search/reuse) | P1 | MED-002 | 3 | Existing image reusable across products without re-upload |

---

## EPIC 6 — Search & Filters

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| SRCH-001 | `GET /search?q=` across name/description/SKU/tag | P0 | PROD-001 | 3 | Relevant results for exact + partial matches |
| SRCH-002 | `GET /search/filters?category=` dynamic facets | P1 | SRCH-001 | 2 | Facets reflect only attributes present in that category's live products |
| SRCH-003 | Storefront search UI (instant/predictive) | P0 | SRCH-001 | 3 | — |
| SRCH-004 | (Later) Fuzzy/trigram search upgrade | P2 | SRCH-001 | 3 | Only pursued if MVP search recall proves insufficient |

---

## EPIC 7 — Frontend Storefront (reference-pattern recreation)

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| FE-001 | Global layout, announcement bar, header, mega-menu, footer | P0 | CAT-001 | 3 | Menu is 100% data-driven |
| FE-002 | Homepage renderer (`CmsSectionRenderer` switching on section type) | P0 | CMS-002 | 3 | New section type addable without touching unrelated sections |
| FE-003 | Category page (PLP) with filters/sort/pagination | P0 | PROD-001,SRCH-002 | 3 | — |
| FE-004 | Product page (PDP) — gallery, variant selector, price, add-to-cart, reviews | P0 | PROD-002 | 5 | Add-to-cart disabled until valid variant chosen (SRS FR-04) |
| FE-005 | Shop (all products) page | P0 | PROD-001 | 1 | — |
| FE-006 | Search results page | P0 | SRCH-003 | 2 | — |
| FE-007 | `<ProductCard />` incl. sale badge/strike price/"Select Options" vs "Add to cart" logic | P0 | FE-004 | 2 | Matches reference-pattern behaviour from srs.md §3.4 |
| FE-008 | `<ForceRegimentStrip />` component + homepage section | P1 | DB-006 | 2 | — |
| FE-009 | Mobile bottom nav (Home/Shop/Orders/Wishlist/Account/Contact/Bulk Orders) | P0 | FE-001 | 2 | — |
| FE-010 | Responsive pass (mobile/tablet/desktop) | P0 | FE-001..009 | 3 | Manual device matrix check-off |

---

## EPIC 8 — Cart

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| CART-001 | `GET/POST/PATCH/DELETE /cart*` (guest + account) | P0 | DB-014 | 3 | Guest identified via signed httpOnly cookie |
| CART-002 | `POST /cart/merge` on login | P1 | CART-001,AUTH-010 | 2 | No duplicate line items post-merge |
| CART-003 | Mini-cart UI (slide-out, running total) | P0 | CART-001 | 2 | — |
| CART-004 | Full cart page UI | P0 | CART-001 | 2 | — |
| CART-005 | Stock-aware cart (blocks add/checkout on 0 available) | P0 | CART-001,PROD-012 | 2 | Matches PRD §9.3 |

---

## EPIC 9 — Wishlist

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| WISH-001 | `GET/POST/DELETE /wishlist*` | P1 | DB-015 | 2 | Login-gated, matches reference pattern |
| WISH-002 | Wishlist page UI + "move to cart" | P1 | WISH-001 | 2 | — |
| WISH-003 | Wishlist heart icon on ProductCard/PDP | P1 | WISH-001,FE-007 | 1 | — |

---

## EPIC 10 — Checkout

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| CHK-001 | `POST /coupons/validate` | P1 | DB-016 | 2 | Rejects expired/below-minimum/limit-reached with specific messages |
| CHK-002 | `POST /checkout/quote` (subtotal/shipping/tax/discount/total) | P0 | CART-001 | 3 | — |
| CHK-003 | `POST /checkout/place-order` (reserve stock, create Order+Payment) | P0 | CHK-002,PROD-012,DB-017..019 | 5 | Idempotent against double-submit |
| CHK-004 | Checkout UI — address step (select saved / add new) | P0 | DB-003 | 2 | — |
| CHK-005 | Checkout UI — shipping/delivery estimate step | P1 | implementation.md shipping zones | 2 | — |
| CHK-006 | Checkout UI — payment step (COD + mocked online) | P0 | CHK-003 | 3 | COD gated by configurable minimum order value |
| CHK-007 | Order confirmation page + email | P0 | CHK-003 | 2 | Confirmation email attempted, failure doesn't roll back the order |
| CHK-008 | (Phase 2) Real payment gateway integration + webhook handler | P2 | CHK-003 | 5 | Signature-verified webhook updates PaymentStatus correctly |

---

## EPIC 11 — Orders

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| ORD-001 | `GET /me/orders`, `/me/orders/:id` | P0 | DB-017 | 2 | — |
| ORD-002 | `POST /me/orders/:id/cancel` (status-graph aware) | P1 | ORD-001 | 2 | Blocked once status has progressed past allowed point |
| ORD-003 | `GET /admin/orders`, `/admin/orders/:id` (filters) | P0 | DB-017 | 3 | — |
| ORD-004 | `PATCH /admin/orders/:id/status` (validated transitions + history write) | P0 | DB-018 | 3 | Invalid transition (e.g. DELIVERED→PENDING) rejected |
| ORD-005 | `POST /admin/orders/:id/refund` | P2 | ORD-004,DB-019 | 3 | — |
| ORD-006 | Customer order list/detail/timeline UI | P0 | ORD-001 | 3 | Status change visible on next page load, no deploy needed |
| ORD-007 | Admin order management UI | P0 | ORD-003,004 | 4 | — |

---

## EPIC 12 — CMS (Homepage + Static Pages)

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| CMS-001 | `CRUD /admin/cms/sections` + reorder | P0 | DB-022 | 3 | — |
| CMS-002 | `GET /cms/homepage` (resolved payload) | P0 | CMS-001 | 2 | Matches implementation.md §8.12 shape |
| CMS-003 | `PUT /admin/cms/pages/:slug` + `GET /cms/pages/:slug` | P0 | DB-022 | 2 | — |
| CMS-004 | Admin UI — section builder (type picker, config editor, drag-reorder, active toggle) | P0 | CMS-001 | 4 | Non-technical tester can add/reorder/disable a section unaided |
| CMS-005 | Admin UI — static page rich-text editor | P0 | CMS-003 | 2 | — |
| CMS-006 | Banner CRUD (API + admin UI) | P1 | DB-022 | 2 | — |

---

## EPIC 13 — Marketing (Coupons)

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| MKT-001 | Coupon CRUD (API + admin UI) | P1 | DB-016 | 3 | — |
| MKT-002 | Percentage / fixed discount calc | P1 | MKT-001 | 1 | — |
| MKT-003 | Product/category restriction logic | P1 | MKT-001 | 2 | — |
| MKT-004 | Expiry + usage-limit + per-user-limit enforcement | P1 | MKT-001 | 2 | Covered by CHK-001's acceptance criteria |

---

## EPIC 14 — Reviews

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| REV-001 | `POST /products/:slug/reviews`, `GET .../reviews` | P1 | DB-021 | 2 | — |
| REV-002 | Moderation queue (`GET/PATCH /admin/reviews*`) | P1 | REV-001 | 2 | Unapproved reviews never show publicly |
| REV-003 | Verified-purchase badge derivation | P1 | REV-001,DB-017 | 1 | — |
| REV-004 | Rating aggregate (avg/count) on product | P1 | REV-002 | 2 | — |

---

## EPIC 15 — Bulk & Custom Orders (new epic — reference-site pattern)

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| BULK-001 | `POST /bulk-enquiry` | P1 | DB-024 | 1 | — |
| BULK-002 | `GET /admin/bulk-enquiry`, `PATCH .../status` | P1 | BULK-001 | 2 | — |
| BULK-003 | Storefront "Bulk & Custom Orders" page + form | P1 | BULK-001 | 2 | Matches PRD §9.8 acceptance criterion |
| BULK-004 | Admin inbox UI for leads | P1 | BULK-002 | 2 | — |

---

## EPIC 16 — Static / Legal Content (new epic — compliance-driven)

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| LEGAL-001 | CMS pages seeded: About Us, Contact Us, Terms & Conditions, Privacy Policy, Shipping & Delivery Policy, Refund & Cancellation Policy | P0 | CMS-003 | 2 | All linked from footer |
| LEGAL-002 | **Purchase & Usage Guidelines for military-styled goods** page | P0 | CMS-003 | 1 | Content sourced from client/legal, not developer-authored; linked from footer + (if client wants) checkout |
| LEGAL-003 | Footer "Useful Links" wired to all of the above | P0 | LEGAL-001,002,FE-001 | 1 | — |

---

## EPIC 17 — Testing

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| TST-001 | Unit tests — pricing, stock reservation, coupon validation | P0 | PROD-012,CHK-001 | 3 | — |
| TST-002 | API/integration tests per §8 contract (implementation.md) | P0 | all API epics | 5 | — |
| TST-003 | Auth/role-enforcement tests (guard denies correctly) | P0 | AUTH-007,008 | 2 | — |
| TST-004 | Frontend component tests (ProductCard, VariantSelector, CmsSectionRenderer) | P1 | FE-004,007,002 | 3 | — |
| TST-005 | **Critical E2E test** (Playwright) — full loop below | P0 | all MVP epics | 5 | See flow in §"Critical End-to-End Test" |
| TST-006 | Responsive/device matrix pass | P1 | FE-010 | 2 | — |
| TST-007 | Light load test on PLP/PDP pre-launch | P2 | DEP-* | 2 | — |

---

## EPIC 18 — Deployment

| ID | Task | Priority | Depends on | Est. | Acceptance criteria |
|---|---|---|---|---|---|
| DEP-001 | Production Supabase project finalized (client-owned) | P0 | INF-002 | 1 | — |
| DEP-002 | Production env vars set on Vercel + backend host | P0 | INF-009 | 1 | — |
| DEP-003 | Backend deploy pipeline (§17 implementation.md) | P0 | INF-011,012 | 2 | — |
| DEP-004 | Frontend deploys (web + admin) | P0 | INF-013 | 1 | — |
| DEP-005 | Domain + Cloudflare DNS + SSL | P0 | — | 1 | — |
| DEP-006 | `prisma migrate deploy` run against production (reviewed, not auto) | P0 | DB-026 | 1 | — |
| DEP-007 | Error monitoring (Sentry) wired on web/admin/api | P1 | — | 1 | — |
| DEP-008 | Production smoke test (critical E2E flow run against prod) | P0 | TST-005,DEP-001..007 | 2 | — |

---

## Critical End-to-End Test (must pass before UAT)

```
ADMIN
  Create Category
       ↓
  Create Product → Assign Category → Add Variant(s) → Set Price → Set Stock
       ↓
  Publish

              ↓↓↓  (no code change, no deploy)

CUSTOMER
  Refresh Website
       ↓
  Category appears in Menu → Category page shows product → Product page works
       ↓
  Select variant → Add to Cart → Checkout → Place Order (COD or mocked online)

              ↓↓↓

ADMIN
  Order appears → Change status to "Shipped"

              ↓↓↓

CUSTOMER
  Order status shows "Shipped" on next page load
```
If this flawlessly works, the client can see real product-management capability, not a static demo.

---

## UAT Test Cases (client sign-off)

| Test | Expected result |
|---|---|
| Create category | Category appears in menu and shop |
| Create product | Product appears in category, search, and PDP |
| Change price | New price reflected everywhere immediately |
| Disable/unpublish product | Product disappears from all customer-facing surfaces |
| Add variant | Variant becomes selectable on PDP |
| Change stock to 0 | Variant shows out-of-stock, blocks add-to-cart |
| Search a known product | Correct product appears in results |
| Add to cart | Cart updates count/total correctly |
| Apply valid coupon | Discount applied correctly at checkout |
| Apply expired/invalid coupon | Clear rejection message, no discount applied |
| Complete checkout (COD) | Order created, confirmation shown/emailed |
| Admin updates order status | Customer sees updated status without delay |
| Reorder homepage sections | Homepage reflects new order without a deploy |
| Submit bulk-order enquiry | Lead appears in admin inbox |
| Open footer legal links | All policy pages (incl. Purchase & Usage Guidelines) load correctly |

Client signs off once every row passes.