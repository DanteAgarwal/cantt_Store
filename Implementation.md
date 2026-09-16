# Implementation Plan
## Military / Tactical E-Commerce Platform

| Field | Value |
|---|---|
| Document | Implementation Plan |
| Version | 1.0 |
| Related docs | srs.md, prd.md, task.md |

---

## 1. Guiding Principle

```
Requirement → Data Model → API Contract → Reusable Frontend → Integration → Testing
```

Never build UI against imaginary data. Every screen in this plan is built **after** the API it depends on exists and returns real data from the real schema. This is the same rule the client's own planning notes emphasized, and it's the difference between "an actual ecommerce application" and "a reference-site-looking demo."

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend (storefront + admin) | Next.js (App Router), TypeScript, Tailwind CSS | SSR/ISR for fast, SEO-friendly catalogue pages; one framework for both apps |
| Backend API | NestJS, TypeScript | Structured modules map 1:1 to domains (products, orders, cms...); DI makes testing straightforward |
| ORM | Prisma | Type-safe queries, migration tooling, plays well with Postgres |
| Database | PostgreSQL — **hosted on Supabase** | Client-mandated; managed Postgres with pooling built in |
| Auth | **Supabase Auth** | Client-mandated; handles password, OTP (email/phone), session/JWT issuance, so we don't hand-roll auth security |
| File/object storage | **Supabase Storage** | Client-mandated; buckets for product images, banners, CMS media, avatars |
| Cache / Queue | **Upstash Redis** — conditional, added only per NFR-4 trigger | Serverless-friendly (REST + TCP), pay-per-use, no idle server to manage |
| Payments | Mocked for MVP; Razorpay/Cashfree/PayU for Phase 2 (client to confirm merchant account) | India-focused gateways with COD + UPI + card support |
| Email | Resend or SendGrid (either fits; pick at Phase 0) | Transactional email for orders/password reset |
| Hosting — frontend | Vercel | Native Next.js ISR/edge support |
| Hosting — backend | Railway / Render / Fly.io (pick one at Phase 0) | Simple container deploy for a Node/NestJS API |
| DNS / CDN | Cloudflare | DNS management, extra caching/WAF layer in front of Vercel/backend |
| CI/CD | GitHub Actions | Lint/test/build gates before deploy |
| Monitoring | Sentry (errors), provider dashboards (uptime/logs) | Minimum viable observability for MVP |

---

## 3. High-Level Architecture

```
                         ┌────────────────────┐
                         │   Customers (web)   │
                         └──────────┬──────────┘
                                    │ HTTPS
                                    ▼
                         ┌────────────────────┐
                         │  Next.js Storefront │  (Vercel, ISR + on-demand revalidate)
                         └──────────┬──────────┘
                                    │ REST/JSON
                                    ▼
                         ┌────────────────────┐        ┌───────────────────┐
                         │   NestJS API        │◄──────►│  Upstash Redis     │  (conditional — cache/
                         │  (Railway/Render)   │        │  (cache/queue/rl)  │   rate-limit/queue only)
                         └──────────┬──────────┘        └───────────────────┘
                                    │ Prisma (pooled + direct)
                                    ▼
                         ┌────────────────────┐
                         │  Supabase Postgres  │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼                                ▼
          ┌───────────────────┐          ┌────────────────────┐
          │  Supabase Auth     │          │  Supabase Storage   │
          │  (JWT issuance)    │          │  (media buckets)    │
          └────────────────────┘          └────────────────────┘

                         ┌────────────────────┐
                         │     Admins (web)    │
                         └──────────┬──────────┘
                                    │ HTTPS
                                    ▼
                         ┌────────────────────┐
                         │  Next.js Admin App  │──────► same NestJS API, admin-scoped endpoints
                         └────────────────────┘
```

**Key architectural rule (ADR-4 below):** the frontend never queries Supabase Postgres directly for catalogue/order data. All business data flows through the NestJS API. Direct-to-Supabase client calls are limited to (a) Auth (sign-in/up/OTP/session) and (b) Storage (uploading to a pre-signed URL). This keeps business logic, validation, and audit logging in one place.

---

## 4. Architecture Decision Records

**ADR-1 — Postgres on Supabase, accessed via Prisma with split URLs.**
Prisma needs two connection strings against Supabase: a pooled connection (PgBouncer, port 6543, `pgbouncer=true`) for normal runtime queries from the backend, and a direct connection (port 5432) for running migrations (`prisma migrate deploy`), because migrations use session-level features PgBouncer's transaction pooling doesn't support.

**ADR-2 — Auth via Supabase Auth, not hand-rolled JWT.**
Supabase Auth owns password hashing, OTP delivery/verification, session/refresh-token issuance, and email verification flows. The NestJS backend's job is only to **verify** incoming Supabase JWTs (via the project's JWT secret / JWKS) and enforce role-based authorization on top. This removes an entire class of custom security code the team would otherwise have to build and maintain.

**ADR-3 — Storage via Supabase Storage, bucket-per-purpose.**
Buckets: `product-images`, `banners`, `cms-media`, `avatars`. Product/category/banner images are public-read; avatars are private, served via short-lived signed URLs.

**ADR-4 — All catalogue/order data mutations go through the NestJS API.**
Row Level Security (RLS) is still enabled on every table as defense-in-depth (someone with a leaked anon key shouldn't be able to read/write arbitrary rows), but the **primary** authorization boundary is the NestJS API's guards/DTOs, because that's where business rules (stock checks, coupon validation, price snapshotting) actually live. RLS policies are intentionally simple: default-deny, with narrow allowances only where the frontend genuinely talks to Supabase directly (none, for data tables, under this ADR).

**ADR-5 — Redis is opt-in, not default.**
Upstash Redis is wired in only when one of NFR-4's three trigger conditions (srs.md §NFR-4) is actually hit. Until then, Next.js's own ISR/cache layer plus Postgres indexes are the caching strategy. This avoids a dependency, a secret, and an operational surface nobody yet needs.

---

## 5. Environment & Configuration

```bash
# --- Database (Supabase Postgres) ---
DATABASE_URL="postgresql://postgres:<password>@<project>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres"

# --- Supabase Auth / Storage ---
SUPABASE_URL="https://<project>.supabase.co"
SUPABASE_ANON_KEY="<public-anon-key>"          # safe for frontend
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" # backend-only, NEVER in frontend bundle
SUPABASE_JWT_SECRET="<jwt-secret>"             # backend verifies incoming Supabase JWTs with this

# --- Storage buckets ---
SUPABASE_BUCKET_PRODUCT_IMAGES="product-images"
SUPABASE_BUCKET_BANNERS="banners"
SUPABASE_BUCKET_CMS="cms-media"
SUPABASE_BUCKET_AVATARS="avatars"

# --- Upstash Redis (only once NFR-4 trigger fires) ---
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# --- Payments (Phase 2) ---
PAYMENT_GATEWAY_KEY_ID=""
PAYMENT_GATEWAY_KEY_SECRET=""
PAYMENT_WEBHOOK_SECRET=""

# --- Email ---
EMAIL_PROVIDER_API_KEY=""
EMAIL_FROM="orders@clientdomain.com"

# --- App ---
NEXT_PUBLIC_API_BASE_URL="https://api.clientdomain.com"
NEXT_PUBLIC_SUPABASE_URL="${SUPABASE_URL}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}"
```

---

## 6. Repository Structure

```
repo/
├── apps/
│   ├── web/                # Next.js storefront (customer-facing)
│   ├── admin/               # Next.js admin panel (separate bundle, same design system)
│   └── api/                 # NestJS backend
│       └── src/
│           ├── auth/
│           ├── profiles/
│           ├── addresses/
│           ├── categories/
│           ├── brands/
│           ├── tags/
│           ├── attributes/
│           ├── products/
│           ├── variants/
│           ├── inventory/
│           ├── media/
│           ├── cart/
│           ├── wishlist/
│           ├── coupons/
│           ├── checkout/
│           ├── orders/
│           ├── payments/
│           ├── shipping/
│           ├── reviews/
│           ├── cms/
│           ├── bulk-enquiry/
│           ├── admin-dashboard/
│           ├── notifications/
│           ├── common/          # guards, interceptors, decorators, filters
│           └── prisma/          # PrismaService, schema.prisma
├── packages/
│   ├── ui/                  # shared React components (ProductCard, MegaMenu, etc.)
│   ├── types/                # shared TS types/DTOs between web/admin/api
│   └── config/                # eslint/tsconfig/tailwind shared config
└── .github/workflows/         # CI
```

Admin as a **separate Next.js app** (not `/admin` routes bolted onto the storefront) keeps the customer bundle small and lets the admin app have a completely different layout/auth-gate without conditionals sprinkled through shared code.

---

## 7. Database Design — Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pooled (PgBouncer, 6543) — runtime queries
  directUrl = env("DIRECT_URL")     // direct (5432) — migrations only
}

// ================= ENUMS =================

enum Role {
  CUSTOMER
  STAFF
  ADMIN
  SUPER_ADMIN
}

enum ProductStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  RETURNED
  REFUNDED
}

enum PaymentMethod {
  COD
  ONLINE
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

enum AddressType {
  SHIPPING
  BILLING
}

enum TagType {
  GENERAL
  FORCE_REGIMENT
  SEASON
  COLLECTION
}

enum CmsSectionType {
  HERO_CAROUSEL
  CATEGORY_GRID
  PRODUCT_CAROUSEL
  BANNER
  TESTIMONIALS
  FORCE_REGIMENT_STRIP
}

// ================= AUTH / PROFILE =================
// Supabase owns `auth.users` (in the `auth` schema). This table mirrors/extends
// it 1:1 in `public`, populated by a DB trigger on auth.users insert (see §10).

model Profile {
  id         String   @id @db.Uuid // == auth.users.id
  fullName   String?
  phone      String?  @unique
  role       Role     @default(CUSTOMER)
  avatarUrl  String?
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  addresses  Address[]
  cart       Cart?
  wishlist   Wishlist?
  orders     Order[]
  reviews    Review[]
  auditLogs  AuditLog[]

  @@map("profiles")
}

model Address {
  id        String      @id @default(uuid()) @db.Uuid
  profileId String      @db.Uuid
  profile   Profile     @relation(fields: [profileId], references: [id], onDelete: Cascade)
  type      AddressType @default(SHIPPING)
  fullName  String
  phone     String
  line1     String
  line2     String?
  city      String
  state     String
  pincode   String
  country   String      @default("India")
  isDefault Boolean     @default(false)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  shippingOrders Order[] @relation("ShippingAddress")
  billingOrders  Order[] @relation("BillingAddress")

  @@index([profileId])
}

// ================= CATALOGUE =================

model Category {
  id             String     @id @default(uuid()) @db.Uuid
  name           String
  slug           String     @unique
  description    String?
  imageUrl       String?
  parentId       String?    @db.Uuid
  parent         Category?  @relation("CategoryTree", fields: [parentId], references: [id], onDelete: SetNull)
  children       Category[] @relation("CategoryTree")
  sortOrder      Int        @default(0)
  isActive       Boolean    @default(true)
  isFeatured     Boolean    @default(false)
  seoTitle       String?
  seoDescription String?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  products ProductCategory[]

  @@index([parentId])
  @@index([slug])
}

model Brand {
  id      String    @id @default(uuid()) @db.Uuid
  name    String
  slug    String    @unique
  logoUrl String?
  products Product[]
}

// Cross-cutting taxonomy: Force/Regiment, Season, Collection — see srs.md §3.2 / §4.4
model Tag {
  id       String       @id @default(uuid()) @db.Uuid
  name     String
  slug     String       @unique
  type     TagType      @default(GENERAL)
  products ProductTag[]
}

model Attribute {
  id     String            @id @default(uuid()) @db.Uuid
  name   String            @unique // Size, Colour, Material...
  values AttributeValue[]
}

model AttributeValue {
  id            String                   @id @default(uuid()) @db.Uuid
  attributeId   String                   @db.Uuid
  attribute     Attribute                @relation(fields: [attributeId], references: [id], onDelete: Cascade)
  value         String                   // "M", "Olive Green"...
  variantLinks  VariantAttributeValue[]

  @@unique([attributeId, value])
}

model Product {
  id               String            @id @default(uuid()) @db.Uuid
  name             String
  slug             String            @unique
  description      String?
  shortDescription String?
  brandId          String?           @db.Uuid
  brand            Brand?            @relation(fields: [brandId], references: [id])
  basePrice        Decimal           @db.Decimal(10, 2)
  compareAtPrice   Decimal?          @db.Decimal(10, 2)
  status           ProductStatus     @default(DRAFT)
  isFeatured       Boolean           @default(false)
  seoTitle         String?
  seoDescription   String?
  publishedAt      DateTime?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  categories    ProductCategory[]
  tags          ProductTag[]
  images        ProductImage[]
  variants      ProductVariant[]
  reviews       Review[]
  cartItems     CartItem[]
  wishlistItems WishlistItem[]
  orderItems    OrderItem[]

  @@index([status])
  @@index([slug])
}

model ProductCategory {
  productId  String   @db.Uuid
  categoryId String   @db.Uuid
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([productId, categoryId])
}

model ProductTag {
  productId String  @db.Uuid
  tagId     String  @db.Uuid
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([productId, tagId])
}

model ProductImage {
  id        String  @id @default(uuid()) @db.Uuid
  productId String  @db.Uuid
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String  // Supabase Storage URL
  altText   String?
  sortOrder Int     @default(0)
  isPrimary Boolean @default(false)
}

model ProductVariant {
  id              String   @id @default(uuid()) @db.Uuid
  productId       String   @db.Uuid
  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku             String   @unique
  price           Decimal? @db.Decimal(10, 2) // overrides Product.basePrice if set
  compareAtPrice  Decimal? @db.Decimal(10, 2)
  weightGrams     Int?
  isActive        Boolean  @default(true)

  attributeValues VariantAttributeValue[]
  inventory       Inventory?
  cartItems       CartItem[]
  wishlistItems   WishlistItem[]
  orderItems      OrderItem[]
}

model VariantAttributeValue {
  variantId        String         @db.Uuid
  attributeValueId String         @db.Uuid
  variant          ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  attributeValue   AttributeValue @relation(fields: [attributeValueId], references: [id], onDelete: Cascade)

  @@id([variantId, attributeValueId])
}

model Inventory {
  id         String         @id @default(uuid()) @db.Uuid
  variantId  String         @unique @db.Uuid
  variant    ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  quantity   Int            @default(0)
  reserved   Int            @default(0) // held during in-flight checkout
  lowStockAt Int            @default(5)
  updatedAt  DateTime       @updatedAt
}

// ================= CART / WISHLIST =================

model Cart {
  id         String     @id @default(uuid()) @db.Uuid
  profileId  String?    @unique @db.Uuid
  profile    Profile?   @relation(fields: [profileId], references: [id], onDelete: Cascade)
  guestToken String?    @unique // signed httpOnly cookie value for guest carts
  items      CartItem[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

model CartItem {
  id        String         @id @default(uuid()) @db.Uuid
  cartId    String         @db.Uuid
  cart      Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String         @db.Uuid
  product   Product        @relation(fields: [productId], references: [id])
  variantId String         @db.Uuid
  variant   ProductVariant @relation(fields: [variantId], references: [id])
  quantity  Int            @default(1)
  addedAt   DateTime       @default(now())

  @@unique([cartId, variantId])
}

model Wishlist {
  id        String         @id @default(uuid()) @db.Uuid
  profileId String         @unique @db.Uuid
  profile   Profile        @relation(fields: [profileId], references: [id], onDelete: Cascade)
  items     WishlistItem[]
}

model WishlistItem {
  id         String          @id @default(uuid()) @db.Uuid
  wishlistId String          @db.Uuid
  wishlist   Wishlist        @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  productId  String          @db.Uuid
  product    Product         @relation(fields: [productId], references: [id])
  variantId  String?         @db.Uuid
  variant    ProductVariant? @relation(fields: [variantId], references: [id])
  addedAt    DateTime        @default(now())

  @@unique([wishlistId, productId, variantId])
}

// ================= MARKETING =================

model Coupon {
  id                     String       @id @default(uuid()) @db.Uuid
  code                   String       @unique
  discountType           DiscountType
  discountValue          Decimal      @db.Decimal(10, 2)
  minOrderValue          Decimal?     @db.Decimal(10, 2)
  maxDiscount            Decimal?     @db.Decimal(10, 2)
  usageLimit             Int?
  usageCount             Int          @default(0)
  perUserLimit           Int?
  startsAt               DateTime?
  expiresAt              DateTime?
  isActive               Boolean      @default(true)
  applicableCategoryIds  String[]     @default([])
  applicableProductIds   String[]     @default([])

  orders Order[]
}

// ================= ORDERS =================

model Order {
  id                String        @id @default(uuid()) @db.Uuid
  orderNumber       String        @unique // e.g. OAS-100234
  profileId         String        @db.Uuid
  profile           Profile       @relation(fields: [profileId], references: [id])
  status            OrderStatus   @default(PENDING)
  shippingAddressId String        @db.Uuid
  shippingAddress   Address       @relation("ShippingAddress", fields: [shippingAddressId], references: [id])
  billingAddressId  String?       @db.Uuid
  billingAddress    Address?      @relation("BillingAddress", fields: [billingAddressId], references: [id])
  subtotal          Decimal       @db.Decimal(10, 2)
  shippingFee       Decimal       @db.Decimal(10, 2) @default(0)
  discountAmount    Decimal       @db.Decimal(10, 2) @default(0)
  taxAmount         Decimal       @db.Decimal(10, 2) @default(0)
  total             Decimal       @db.Decimal(10, 2)
  couponId          String?       @db.Uuid
  coupon            Coupon?       @relation(fields: [couponId], references: [id])
  paymentMethod     PaymentMethod
  paymentStatus     PaymentStatus @default(PENDING)
  placedAt          DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  items         OrderItem[]
  statusHistory OrderStatusHistory[]
  payment       Payment?
  shipment      Shipment?
}

model OrderItem {
  id                  String         @id @default(uuid()) @db.Uuid
  orderId             String         @db.Uuid
  order               Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId           String         @db.Uuid
  product             Product        @relation(fields: [productId], references: [id])
  variantId           String         @db.Uuid
  variant             ProductVariant @relation(fields: [variantId], references: [id])
  productNameSnapshot String
  variantSnapshot     String?        // frozen "M / Olive Green" at order time
  unitPrice           Decimal        @db.Decimal(10, 2)
  quantity            Int
  lineTotal           Decimal        @db.Decimal(10, 2)
}

model OrderStatusHistory {
  id        String      @id @default(uuid()) @db.Uuid
  orderId   String      @db.Uuid
  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status    OrderStatus
  note      String?
  changedBy String?     @db.Uuid // admin profile id, null = system
  changedAt DateTime    @default(now())
}

model Payment {
  id                String        @id @default(uuid()) @db.Uuid
  orderId           String        @unique @db.Uuid
  order             Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  gateway           String?       // "razorpay" | "cod" | "mock"
  gatewayOrderId    String?
  gatewayPaymentId  String?
  amount            Decimal       @db.Decimal(10, 2)
  status            PaymentStatus @default(PENDING)
  rawResponse       Json?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

model Shipment {
  id             String    @id @default(uuid()) @db.Uuid
  orderId        String    @unique @db.Uuid
  order          Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  carrier        String?
  trackingNumber String?
  trackingUrl    String?
  shippedAt      DateTime?
  deliveredAt    DateTime?
}

// ================= REVIEWS =================

model Review {
  id                 String   @id @default(uuid()) @db.Uuid
  productId          String   @db.Uuid
  product            Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  profileId          String   @db.Uuid
  profile            Profile  @relation(fields: [profileId], references: [id])
  rating             Int
  title              String?
  body               String?
  isVerifiedPurchase Boolean  @default(false)
  isApproved         Boolean  @default(false)
  createdAt          DateTime @default(now())
}

// ================= CMS =================

model CmsPage {
  id          String   @id @default(uuid()) @db.Uuid
  slug        String   @unique // about-us | terms-conditions | privacy-policy |
                                // shipping-policy | refund-policy |
                                // military-goods-usage-policy
  title       String
  bodyHtml    String
  isPublished Boolean  @default(true)
  updatedAt   DateTime @updatedAt
}

model CmsSection {
  id        String         @id @default(uuid()) @db.Uuid
  page      String         @default("home")
  type      CmsSectionType
  title     String?
  subtitle  String?
  config    Json           // e.g. { "categoryIds": [...] } / { "productIds": [...] }
  sortOrder Int            @default(0)
  isActive  Boolean        @default(true)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
}

model Banner {
  id             String    @id @default(uuid()) @db.Uuid
  imageUrl       String
  mobileImageUrl String?
  linkUrl        String?
  title          String?
  sortOrder      Int       @default(0)
  isActive       Boolean   @default(true)
  startsAt       DateTime?
  endsAt         DateTime?
}

model Media {
  id         String   @id @default(uuid()) @db.Uuid
  bucket     String   // product-images | banners | cms-media | avatars
  path       String
  url        String
  mimeType   String?
  sizeBytes  Int?
  uploadedBy String?  @db.Uuid
  createdAt  DateTime @default(now())
}

// ================= BULK ENQUIRY =================

model BulkOrderEnquiry {
  id           String   @id @default(uuid()) @db.Uuid
  fullName     String
  phone        String
  email        String?
  organisation String?
  requirement  String
  quantity     Int?
  attachmentUrl String?
  status       String   @default("NEW") // NEW | CONTACTED | CLOSED
  createdAt    DateTime @default(now())
}

// ================= AUDIT =================

model AuditLog {
  id         String   @id @default(uuid()) @db.Uuid
  profileId  String?  @db.Uuid
  profile    Profile? @relation(fields: [profileId], references: [id])
  action     String   // PRODUCT_PUBLISHED | ORDER_STATUS_CHANGED | ...
  entityType String
  entityId   String
  metadata   Json?
  createdAt  DateTime @default(now())
}
```

---

## 8. API Design

Base URL: `/api/v1`. Auth header: `Authorization: Bearer <supabase_jwt>` where required.

### 8.1 Auth & Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/sync-profile` | Bearer | Called once post-signup to confirm profile row exists (safety net alongside the DB trigger) |
| GET | `/me` | Bearer | Current profile |
| PATCH | `/me` | Bearer | Update name/avatar |
| GET | `/me/addresses` | Bearer | List saved addresses |
| POST | `/me/addresses` | Bearer | Add address |
| PATCH | `/me/addresses/:id` | Bearer | Edit address |
| DELETE | `/me/addresses/:id` | Bearer | Remove address |

> Sign-up, sign-in, OTP request/verify, password reset, and session refresh are handled **client-side via the Supabase Auth SDK directly** — the NestJS API doesn't proxy these (see §10).

### 8.2 Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/categories` | Public | Full active tree (for mega-menu) |
| GET | `/categories/:slug` | Public | Category detail + its products (paginated) |
| POST | `/admin/categories` | Admin | Create |
| PATCH | `/admin/categories/:id` | Admin | Update |
| DELETE | `/admin/categories/:id` | Admin | Delete (with reassign/block policy) |
| PATCH | `/admin/categories/reorder` | Admin | Bulk sort-order update |

### 8.3 Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | Public | List with `?category=&tag=&q=&minPrice=&maxPrice=&sort=&page=` |
| GET | `/products/:slug` | Public | Full detail incl. variants, images, attributes, reviews summary |
| GET | `/products/:slug/related` | Public | Related products |
| GET | `/products/featured` | Public | Featured list (homepage use) |
| POST | `/admin/products` | Admin | Create (draft) |
| PATCH | `/admin/products/:id` | Admin | Update |
| POST | `/admin/products/:id/publish` | Admin | Publish |
| POST | `/admin/products/:id/unpublish` | Admin | Unpublish |
| POST | `/admin/products/:id/duplicate` | Admin | Duplicate |
| DELETE | `/admin/products/:id` | Admin | Delete |
| POST | `/admin/products/:id/images` | Admin | Attach image (after Storage upload) |
| PATCH | `/admin/products/:id/images/reorder` | Admin | Reorder / set primary |
| POST | `/admin/products/:id/variants` | Admin | Add variant |
| PATCH | `/admin/variants/:id` | Admin | Update variant |
| DELETE | `/admin/variants/:id` | Admin | Remove variant |
| PATCH | `/admin/variants/:id/inventory` | Admin | Set stock/threshold |

### 8.4 Search

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/search?q=` | Public | Product/category search |
| GET | `/search/filters?category=` | Public | Available filter facets for a category |

### 8.5 Cart & Wishlist

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/cart` | Bearer or guest cookie | Current cart |
| POST | `/cart/items` | Bearer or guest cookie | Add item |
| PATCH | `/cart/items/:id` | Bearer or guest cookie | Change quantity |
| DELETE | `/cart/items/:id` | Bearer or guest cookie | Remove item |
| POST | `/cart/merge` | Bearer | Merge guest cart into account cart post-login |
| GET | `/wishlist` | Bearer | List |
| POST | `/wishlist/items` | Bearer | Add |
| DELETE | `/wishlist/items/:id` | Bearer | Remove |

### 8.6 Checkout & Coupons

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/coupons/validate` | Bearer or guest | Validate a code against current cart |
| POST | `/checkout/quote` | Bearer or guest | Compute subtotal/shipping/tax/discount/total for review step |
| POST | `/checkout/place-order` | Bearer or guest | Places order, reserves stock, creates Payment record |
| POST | `/payments/webhook` | Gateway signature | Async payment confirmation (Phase 2) |

### 8.7 Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/me/orders` | Bearer | Customer order list |
| GET | `/me/orders/:id` | Bearer | Customer order detail + timeline |
| POST | `/me/orders/:id/cancel` | Bearer | Cancel (if status allows) |
| GET | `/admin/orders` | Admin/Staff | List/filter all orders |
| GET | `/admin/orders/:id` | Admin/Staff | Detail |
| PATCH | `/admin/orders/:id/status` | Admin/Staff | Transition status (validated against status graph) |
| POST | `/admin/orders/:id/refund` | Admin | Initiate refund |

### 8.8 Reviews

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products/:slug/reviews` | Public | Approved reviews |
| POST | `/products/:slug/reviews` | Bearer | Submit (goes to moderation) |
| GET | `/admin/reviews` | Admin | Moderation queue |
| PATCH | `/admin/reviews/:id/approve` | Admin | Approve/reject |

### 8.9 CMS

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/cms/homepage` | Public | Ordered, active sections with resolved content |
| GET | `/cms/pages/:slug` | Public | Static page (Terms, Privacy, Purchase & Usage Guidelines, etc.) |
| GET | `/admin/cms/sections` | Admin | All sections (incl. inactive) |
| POST | `/admin/cms/sections` | Admin | Create |
| PATCH | `/admin/cms/sections/:id` | Admin | Update / toggle active |
| PATCH | `/admin/cms/sections/reorder` | Admin | Bulk reorder |
| PUT | `/admin/cms/pages/:slug` | Admin | Create/update static page body |
| GET/POST/PATCH/DELETE | `/admin/banners` | Admin | Banner CRUD |

### 8.10 Media

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/admin/media/sign-upload` | Admin | Returns a Supabase Storage signed upload URL + path |
| POST | `/admin/media/confirm` | Admin | Persists a `Media` row once the client-side upload succeeds |
| GET | `/admin/media` | Admin | Library listing (searchable/filterable) |

### 8.11 Bulk Enquiry & Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/bulk-enquiry` | Public | Submit enquiry |
| GET | `/admin/bulk-enquiry` | Admin | List leads |
| PATCH | `/admin/bulk-enquiry/:id/status` | Admin | Update lead status |
| GET | `/admin/dashboard/summary` | Admin | Orders/revenue/low-stock/pending-review counts |

### 8.12 Example payloads

**GET `/products/us-camo-tactical-combat-t-shirt-olive-green` (abridged)**
```json
{
  "id": "uuid",
  "name": "US Camo Tactical Combat T-Shirt - Olive Green",
  "slug": "us-camo-tactical-combat-t-shirt-olive-green",
  "basePrice": 1345.00,
  "compareAtPrice": 1345.00,
  "salePrice": 875.00,
  "status": "PUBLISHED",
  "categories": [{ "slug": "premium-tactical-series", "name": "Premium Tactical Series" }],
  "tags": [{ "type": "FORCE_REGIMENT", "name": "PARA" }],
  "images": [{ "url": "https://.../img1.webp", "isPrimary": true }],
  "variants": [
    { "id": "v1", "sku": "OAS-TCTS-OG-M", "price": 875.00, "attributes": { "Size": "M" }, "inStock": true },
    { "id": "v2", "sku": "OAS-TCTS-OG-L", "price": 875.00, "attributes": { "Size": "L" }, "inStock": false }
  ],
  "ratingAverage": 4.6,
  "ratingCount": 18
}
```

**GET `/cms/homepage` (abridged, shape only)**
```json
{
  "sections": [
    { "type": "HERO_CAROUSEL", "config": { "slides": [ { "imageUrl": "...", "linkUrl": "/shop" } ] } },
    { "type": "CATEGORY_GRID", "title": "Shop by Category", "config": { "categorySlugs": ["tactical-t-shirt", "caps", "bags"] } },
    { "type": "PRODUCT_CAROUSEL", "title": "New Arrivals", "config": { "rule": "newest", "limit": 12 } },
    { "type": "PRODUCT_CAROUSEL", "title": "Winter Collection", "config": { "tagSlug": "winter" } },
    { "type": "FORCE_REGIMENT_STRIP", "config": { "tagSlugs": ["para", "bsf", "crpf", "signals"] } },
    { "type": "TESTIMONIALS", "config": { "source": "manual", "items": [] } }
  ]
}
```

---

## 9. Auth Flow (Supabase)

### 9.1 Sign-up / sign-in (frontend, direct to Supabase Auth SDK)
```
Frontend Supabase client
   → supabase.auth.signUp({ email, password, phone })   (or signInWithOtp / signInWithPassword)
   → Supabase issues session (access token + refresh token)
   → Frontend stores session (SDK handles httpOnly-safe storage patterns per platform)
   → DB trigger (below) creates matching public.profiles row
   → Frontend calls NestJS with `Authorization: Bearer <access_token>` from now on
```

### 9.2 Postgres trigger — keep `profiles` in sync with `auth.users`
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.phone,
    'CUSTOMER'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 9.3 NestJS JWT verification guard
- Every protected route runs a `SupabaseAuthGuard` that verifies the incoming JWT's signature against `SUPABASE_JWT_SECRET` (or JWKS if the project uses asymmetric keys), extracts `sub` (= `profiles.id`), and loads the profile (cached per-request) to check `role`.
- A `RolesGuard` decorator (`@Roles('ADMIN', 'SUPER_ADMIN')`) sits on top for admin-only routes.
- Promoting a user to `STAFF`/`ADMIN` is an explicit, audited admin action (`PATCH /admin/users/:id/role`, `SUPER_ADMIN` only) — never self-service.

---

## 10. Storage Flow (Supabase)

```
Admin picks a file in the browser
   → POST /admin/media/sign-upload  { bucket, filename, contentType }
   → NestJS asks Supabase Storage for a signed upload URL (using service-role key)
   → Frontend PUTs the file directly to that signed URL (bypasses NestJS for the bytes)
   → Frontend calls POST /admin/media/confirm  { bucket, path, mimeType, sizeBytes }
   → NestJS creates the Media row and returns the public/CDN URL
   → That URL is attached to a Product/Category/Banner/CmsSection record
```

Bucket layout: `product-images/{productId}/{filename}`, `banners/{filename}`, `cms-media/{sectionId}/{filename}`, `avatars/{profileId}/{filename}`. Public buckets serve directly via Supabase's CDN URL; `avatars` is private and served via short-lived signed URLs generated on demand.

---

## 11. Caching Strategy (activated only per NFR-4)

If/when Upstash Redis is introduced:
- **Cache keys:** `cat:tree` (category tree), `cms:home` (resolved homepage payload), `product:{slug}` (hot PDP data) — TTL 60–300s, invalidated explicitly on the relevant admin write (publish/update/reorder) rather than relying on TTL alone, so the "no code change, appears immediately" acceptance criteria still hold.
- **Rate limiting:** sliding-window counters per IP+route for `/auth/*`-adjacent and `/checkout/place-order`, backed by Upstash's REST API (works fine from serverless/edge too).
- **Queues (if needed):** BullMQ backed by Upstash Redis (TCP) for order-confirmation emails/invoice generation, so checkout doesn't block on email delivery.

If none of NFR-4's triggers has fired, skip this section entirely for MVP — Next.js ISR + Postgres indexes carry the load.

---

## 12. Frontend Architecture (Storefront)

```
apps/web/app/
├── page.tsx                     # Home — renders /cms/homepage sections
├── shop/page.tsx                # All-products listing
├── category/[slug]/page.tsx     # ISR, revalidated on category/product admin writes
├── product/[slug]/page.tsx      # ISR, revalidated on product publish/update
├── search/page.tsx
├── cart/page.tsx
├── checkout/page.tsx
├── wishlist/page.tsx
├── bulk-orders/page.tsx
├── account/
│   ├── page.tsx
│   ├── orders/page.tsx
│   └── addresses/page.tsx
└── (legal)/[slug]/page.tsx      # renders CmsPage by slug: terms, privacy, shipping-policy, etc.
```

Reusable components (in `packages/ui`): `<ProductGrid />`, `<ProductCard />`, `<CategoryGrid />`, `<MegaMenu />`, `<ProductGallery />`, `<Price />` (handles compare-at strikethrough), `<VariantSelector />`, `<ForceRegimentStrip />`, `<CmsSectionRenderer />` (switches on `CmsSectionType`).

**Revalidation:** admin write endpoints (`product publish`, `category update`, `cms section save`) call Next.js's on-demand revalidation API for the affected paths right after the DB write succeeds — this is what makes FR-03/FR-10/FR-14's "no code change, appears immediately" acceptance criteria true in an ISR setup rather than only in constant server-rendering.

## 13. Admin App Architecture

```
apps/admin/app/
├── dashboard/page.tsx
├── products/ (list, [id]/edit, new)
├── categories/
├── inventory/
├── orders/ (list, [id])
├── customers/
├── coupons/
├── reviews/
├── cms/ (sections, pages, banners)
├── media/
└── bulk-enquiry/
```
Every route wrapped in a layout that checks the Supabase session client-side for a fast redirect, **and** every API call is re-checked server-side by the `RolesGuard` — the frontend check is UX only, never the security boundary.

---

## 14. Implementation Phases

### Phase 0 — Project Setup
```
Git repo, monorepo scaffolding (apps/web, apps/admin, apps/api, packages/*)
Create Supabase project; enable email + phone auth providers; create storage buckets
Configure Prisma with DATABASE_URL (pooled) + DIRECT_URL (direct)
ESLint/Prettier, shared tsconfig
GitHub Actions CI skeleton (lint + build)
Choose backend host (Railway/Render/Fly.io) + connect Vercel for apps/web & apps/admin
```

### Phase 1 — Database
```
Author full Prisma schema (§7)
prisma migrate dev against Supabase (direct URL)
Auth trigger (§10) applied via a SQL migration
Seed script: sample categories (2–3 levels), sample regiment tags, a handful of products/variants
```

### Phase 2 — Backend Foundation
```
PrismaService module
SupabaseAuthGuard + RolesGuard
Global validation pipe (class-validator DTOs), exception filter, response interceptor (consistent envelope)
Structured logging
```

### Phase 3 — Catalogue Read API
```
GET categories, category/:slug, products, product/:slug, featured, related, search, filters
This is the API the entire storefront depends on — build and contract-test before any storefront UI work starts
```

### Phase 4 — Admin Catalogue Write API + Minimal Admin UI
```
Category CRUD, Product CRUD, Variant CRUD, Image attach, Inventory set
Prove the loop: Admin creates category → API → (temporary) storefront menu reflects it
Prove the loop: Admin creates product → API → category listing → search → PDP
This is the point the core architecture is proven end to end — do not proceed to full UI polish before this passes.
```

### Phase 5 — Storefront UI (reference-pattern recreation)
```
Header, mega-menu, footer, homepage renderer, category grid, product card/grid, shop page, PLP filters, PDP
```

### Phase 6 — Commerce Engine
```
Cart (guest + account, merge-on-login), Wishlist, Checkout (address/shipping/payment), Coupon validation, Order placement, mocked Payment
```

### Phase 7 — Customer Account
```
Login/register/OTP UI (Supabase SDK), profile, addresses, order list/detail/tracking, wishlist page
```

### Phase 8 — CMS
```
Admin section builder (create/reorder/toggle), static page editor, banner CRUD
Frontend: GET /cms/homepage → CmsSectionRenderer
```

### Phase 9 — Admin Operations
```
Dashboard summary, order management (status transitions, refunds), customer list, coupon UI, review moderation, media library, bulk-enquiry inbox
```

### Phase 10 — Polish
```
Loading/skeleton/empty/error states, 404, toasts, mobile responsiveness pass, accessibility pass, SEO (sitemap/meta/structured data), image optimization pass, micro-animations
```

---

## 15. Testing Strategy

| Layer | Tool | Covers |
|---|---|---|
| Unit | Jest (NestJS) | Services — pricing calc, coupon validation, stock reservation logic |
| API/integration | Jest + Supertest, or Postman/Newman | Full request/response contract per §8, auth/role enforcement |
| E2E | Playwright | The critical end-to-end flow (task.md §"Critical E2E test"): admin publish → storefront reflects → customer purchases → admin updates status → customer sees it |
| Frontend component | React Testing Library | ProductCard, VariantSelector, CmsSectionRenderer |
| Load/perf (light) | k6 or similar, pre-launch only | PLP/PDP under realistic concurrency before go-live |

---

## 16. Security Checklist

```
[ ] HTTPS enforced everywhere (Vercel + backend host + Cloudflare)
[ ] Supabase service-role key only in backend env, never in a frontend bundle
[ ] RLS enabled on every Supabase table (default-deny; ADR-4)
[ ] class-validator DTO validation on every endpoint
[ ] Helmet + CORS allow-list (only apps/web + apps/admin origins) on NestJS
[ ] Rate limiting on auth-adjacent + checkout endpoints (in-memory OK pre-Redis, per NFR-4)
[ ] Admin role changes are themselves audited (AuditLog) and SUPER_ADMIN-only
[ ] Payment webhook signature verification (Phase 2)
[ ] Secrets rotated on any suspected leak; no secrets committed to git (checked in CI)
```

---

## 17. Deployment Pipeline

```
git push → GitHub Actions: lint → typecheck → unit tests → build
   → on main branch: 
        apps/web, apps/admin → Vercel deploy (preview on PR, production on merge)
        apps/api → build container → deploy to Railway/Render/Fly.io
        prisma migrate deploy (direct URL) run as a pre-deploy step, gated — never auto-run against prod without review on schema-changing PRs
```

Environments: `local` (docker-compose optional Postgres for offline dev, or a Supabase dev branch), `staging` (separate Supabase project), `production` (client-owned Supabase project).

---

## 18. Monitoring

```
Sentry — frontend (web/admin) + backend error tracking
Backend host's built-in logs/metrics (Railway/Render/Fly.io dashboard)
Supabase dashboard — DB performance, Auth logs, Storage usage
Uptime check (e.g. a simple external pinger) on the storefront and the API health endpoint
```

---

## 19. Appendix — Reference-Site Structural Notes Carried Into This Plan
See srs.md §3 for the full reference-site breakdown this implementation plan is built to satisfy structurally (category depth, homepage section types, product card behaviour, cross-cutting regiment taxonomy, bulk-order path, footer policy links).