# Fragrance Whisper — Full-Stack E-Commerce Platform
## Agent Memory / Source of Truth Document

> **Purpose of this file:** This is the single source of truth for the Antigravity agent building this project.
> Whenever the agent is unsure about a naming convention, folder location, schema field, flow, or feature
> boundary, it must re-read this file instead of guessing. Do not deviate from decisions made here unless
> the user explicitly instructs otherwise. If something genuinely isn't covered here, the agent should
> flag it and propose an addition to this file rather than silently inventing a pattern.

---

## 1. Project Identity

- **Store name:** `Fragrance Whisper`
- Use "Fragrance Whisper" in: site `<title>`, header/nav logo text, footer brand + copyright line
  (`© {year} Fragrance Whisper. All rights reserved.`), metadata (`og:title`, `og:site_name`), email
  templates (order confirmation, password reset), invoice/receipt PDFs, and the admin panel login screen
  (e.g. "Fragrance Whisper Admin").
- Tone: minimal, premium, boutique-perfume aesthetic (not a generic e-commerce template look). Neutral
  palette (ivory/cream, charcoal, one accent gold/amber), elegant serif or refined sans for headings.
- Currency: PKR (Pakistani Rupee) throughout — product prices, cart totals, order totals, admin dashboards.

---

## 2. Tech Stack (install latest stable versions of everything — use `@latest`)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | Already scaffolded by the user — do not re-scaffold. |
| Styling | Tailwind CSS | Already configured by the user — do not reconfigure. |
| UI Primitives | shadcn/ui | Install via CLI, use as the base for both storefront and admin components. |
| Language | TypeScript | Strict mode on. |
| Database | PostgreSQL | Assume a connection string will be provided via `DATABASE_URL`. |
| ORM | **Prisma** | Chosen over Drizzle for this project because: mature migration workflow (`prisma migrate dev`), Prisma Studio for quick admin-side DB inspection during dev, strong relation modeling for a catalog/orders schema, and easiest for a single-agent build to reason about. |
| Auth | **Auth.js (NextAuth v5)** | Credentials provider (email + password, hashed with `bcrypt`/`argon2`) for customers. Role field on `User` model (`CUSTOMER` / `ADMIN`) — no separate admin auth system, just role-gated middleware + route groups. |
| Client server-state cache | **TanStack Query (React Query)** | For client components that need refetching/mutations/optimistic UI (cart, admin tables). |
| Client UI/local state | **Zustand** | Cart drawer open/close, filter UI state, wizard/multistep checkout UI state. NOT used to store server truth — cart contents are persisted server-side (see §7). |
| Forms + validation | **React Hook Form + Zod** | Shared Zod schemas between client-side form validation and server-side action/API validation (single source of truth per feature, colocated in `schema.ts`). |
| Image hosting | **Cloudinary** | Product images, category images. Use `next-cloudinary` or direct upload API. Alternative noted: UploadThing — pick Cloudinary as default unless the user says otherwise. |
| Email | **Resend** (with `react-email` templates) | Order confirmation, password reset, admin new-order notification. |
| Payments | **PayFast (Pakistan — gopayfast.com / apps.net.pk)**, see §10 | NOT the South African PayFast (payfast.co.za) — different company, different API. Must not be confused. |
| Tables (admin) | **TanStack Table** | Product list, order list, customer list — sorting/filtering/pagination. |
| Charts (admin dashboard) | **Recharts** | Revenue, order volume, top products. |
| Rate limiting / basic protection | **Upstash Ratelimit** (optional stretch) | Protect auth routes and checkout endpoint. |

Package manager: match whatever the user's boilerplate already uses (check `package.json` / lockfile before
assuming npm vs pnpm vs yarn).

---

## 3. Architecture Principles

- **Feature-based, not layer-based.** Do not create global `components/`, `hooks/`, `actions/` dumping
  grounds for domain logic. Each business feature owns its own components, server actions, queries,
  Zod schemas, and types.
- **Server Actions are the default mutation mechanism** for anything invoked from a form or a user
  gesture inside the app (add to cart, place order, update product, etc.). Use **Route Handlers**
  (`app/api/...`) only for: (a) the PayFast ITN/webhook callback (must be a stateless HTTP endpoint,
  not a server action), (b) anything that must be called by an external service, (c) anything that
  needs to return non-HTML content (e.g. invoice PDF stream).
- **Server Components by default.** Only mark a component `"use client"` when it needs interactivity,
  browser APIs, or a hook like `useState`/Zustand/React Query. Data fetching for initial page render
  happens in Server Components directly via Prisma — do not round-trip through an API route just to
  fetch data you could query directly on the server.
- **Async vs sync (explicit rule the agent must follow):**
  - Anything touching the database, the filesystem, external APIs (PayFast, Cloudinary, Resend), or
    `cookies()`/`headers()` in Next.js → **async**, always `await`ed, always wrapped in `try/catch` with
    typed error returns (see §11).
  - Pure computation with no I/O — price formatting, cart subtotal/tax/shipping math, slug generation,
    Zod parsing, discount calculation, form validation — → **synchronous** functions. Do not wrap these
    in `Promise`/`async` just for consistency; it adds overhead and is a code-smell the agent should avoid.
  - Independent async operations that don't depend on each other's result (e.g. fetching product +
    fetching related reviews + fetching related products for a PDP) → run with `Promise.all`, not
    sequential `await`s.
  - Server Actions must never block on unrelated slow work before returning to the client; where an
    action triggers a "nice to have" side effect (e.g. sending a confirmation email after order placement),
    do the critical write first, return success to the client, and fire the non-critical email send
    without making the user wait on it failing (log failures, don't throw).

---

## 4. Folder Structure

```
src/
  app/
    (storefront)/
      layout.tsx                # storefront shell: header, footer, cart drawer mount
      page.tsx                  # homepage
      products/
        page.tsx                # product listing + filters
        [slug]/page.tsx         # product detail page
      categories/[slug]/page.tsx
      cart/page.tsx
      checkout/page.tsx
      checkout/success/page.tsx
      checkout/cancel/page.tsx
      account/
        layout.tsx              # requires customer auth
        page.tsx                # profile
        orders/page.tsx
        orders/[id]/page.tsx
        addresses/page.tsx
      login/page.tsx
      register/page.tsx
    (admin)/
      admin/
        layout.tsx               # requires ADMIN role, admin shell/sidebar
        page.tsx                 # dashboard (KPIs, charts)
        products/
          page.tsx                # product table
          new/page.tsx
          [id]/edit/page.tsx
        categories/page.tsx
        orders/
          page.tsx
          [id]/page.tsx
        customers/page.tsx
        login/page.tsx            # separate admin login screen
    api/
      auth/[...nextauth]/route.ts
      webhooks/payfast/route.ts   # ITN callback, see §10
      uploads/route.ts            # Cloudinary signed upload (if not using client-side widget)
    layout.tsx                    # root layout (fonts, providers)
    globals.css

  features/
    products/
      components/                # ProductCard, ProductGrid, ProductGallery, ProductFilters...
      actions.ts                 # createProduct, updateProduct, deleteProduct, publishProduct, ...
      queries.ts                 # getProducts, getProductBySlug, getFeaturedProducts, ...
      schema.ts                  # Zod: productSchema, productFilterSchema
      types.ts
    categories/
      components/ | actions.ts | queries.ts | schema.ts
    cart/
      components/                # CartDrawer, CartItemRow, CartSummary
      actions.ts                 # addToCart, updateCartItemQty, removeFromCart, clearCart
      queries.ts                 # getOrCreateCart, getCartTotals
      schema.ts
    checkout/
      components/                # AddressForm, CheckoutSummary, PaymentMethodStep
      actions.ts                 # createOrderFromCart, initiatePayfastPayment
      schema.ts
    orders/
      components/                # OrderTable (admin), OrderStatusBadge, OrderTimeline
      actions.ts                 # updateOrderStatus, cancelOrder, refundOrder
      queries.ts                 # getOrders, getOrderById, getCustomerOrders
      schema.ts
    payments/
      payfast/
        client.ts                # token fetch, signature/hash helpers, PostTransaction call
        types.ts
      actions.ts                 # markOrderPaid, markOrderFailed (called from webhook handler)
    auth/
      components/                # LoginForm, RegisterForm
      actions.ts                 # registerCustomer
      config.ts                  # NextAuth config (providers, callbacks, session shape)
      guards.ts                  # requireAdmin(), requireCustomer() helpers
    admin-dashboard/
      components/                # KpiCard, RevenueChart, TopProductsTable
      queries.ts                 # getDashboardStats
    reviews/                      # stretch feature, see §9
      components/ | actions.ts | queries.ts | schema.ts
    wishlist/                     # stretch feature, see §9
      components/ | actions.ts | queries.ts

  components/ui/                  # shadcn primitives ONLY (button, input, dialog, table, ...)
  components/shared/               # truly cross-feature pieces: SiteHeader, SiteFooter, Logo, Price, EmptyState

  lib/
    db.ts                         # Prisma client singleton
    auth.ts                       # NextAuth() export used across app
    cloudinary.ts
    resend.ts
    utils.ts                      # cn(), formatPrice(), slugify(), etc. (sync helpers)
    constants.ts                  # ORDER_STATUS enum values, SHIPPING_FEE, TAX_RATE, PAGE_SIZE, store name const

  store/
    cart-ui-store.ts              # Zustand: cart drawer open state only (NOT cart data)
    filters-ui-store.ts

  emails/
    OrderConfirmationEmail.tsx
    PasswordResetEmail.tsx
    AdminNewOrderEmail.tsx

  types/
    next-auth.d.ts                # module augmentation for session.user.role

prisma/
  schema.prisma
  seed.ts
```

**Rule:** Route files in `app/` stay thin — they import from `features/*` and compose. Business logic,
data access, and mutations live in `features/*`, never inline in `page.tsx`/`route.ts` beyond simple
composition and calling the feature's action/query.

---

## 5. Database Schema (Prisma)

Model list the agent must implement (fields are the minimum bar — extend types/enums as needed but do
not rename these core fields without updating this doc):

- **User** — id, name, email (unique), passwordHash, role (`CUSTOMER` | `ADMIN`), image, phone,
  createdAt, updatedAt. Relations: addresses[], orders[], cart, reviews[] (stretch), wishlist[] (stretch).
- **Address** — id, userId, fullName, phone, line1, line2?, city, province, postalCode, country
  (default `Pakistan`), isDefault.
- **Category** — id, name, slug (unique), description?, imageUrl?, createdAt.
- **Product** — id, name, slug (unique), description, brand?, price (Decimal), compareAtPrice (Decimal,
  optional — for "on sale" strike-through), sku (unique), stock (Int), fragranceNotes (top/middle/base —
  can be a Json field or a related `ProductNote` model), volumeMl (Int), gender (`MALE` | `FEMALE` |
  `UNISEX`), isPublished (Boolean, default false), isFeatured (Boolean), categoryId, createdAt, updatedAt.
  Relations: images[], reviews[] (stretch), orderItems[].
- **ProductImage** — id, productId, url, altText?, position (Int, for ordering), isPrimary (Boolean).
- **Cart** — id, userId (unique, one active cart per user) OR guest support via a `sessionToken`
  cookie-based cart (decide guest-cart approach — recommended: allow guest carts keyed by a signed
  cookie `cartId`, merge into user cart on login). createdAt, updatedAt.
- **CartItem** — id, cartId, productId, quantity, priceAtAdd (Decimal — snapshot price so cart total is
  stable even if admin changes price later, until checkout re-validates).
- **Order** — id, orderNumber (human-readable, unique, e.g. `FW-000123`), userId, status (`PENDING` |
  `PROCESSING` | `PAID` | `SHIPPED` | `DELIVERED` | `CANCELLED` | `FAILED`), subtotal, shippingFee,
  tax, total (all Decimal), currency (default `PKR`), shippingAddress (Json snapshot, not just a
  relation — orders must not change if the user later edits their saved address), phone, email,
  paymentMethod (`PAYFAST` | `COD` if you want cash-on-delivery as fallback), paymentStatus
  (`UNPAID` | `PAID` | `REFUNDED` | `FAILED`), payfastTransactionId?, createdAt, updatedAt.
- **OrderItem** — id, orderId, productId, productName (snapshot), productImage (snapshot), unitPrice
  (snapshot), quantity, lineTotal.
- **Payment** — id, orderId, provider (`PAYFAST`), amount, status, rawResponse (Json, store the full
  PayFast callback payload for audit/debugging), createdAt.
- *(Stretch)* **Review** — id, productId, userId, rating (1-5), comment, createdAt.
- *(Stretch)* **WishlistItem** — id, userId, productId, createdAt.
- *(Stretch)* **Coupon** — id, code (unique), type (`PERCENT`|`FIXED`), value, expiresAt, minOrderValue,
  usageLimit, timesUsed.

Indexing: index `Product.slug`, `Product.categoryId`, `Product.isPublished`, `Order.userId`,
`Order.status`, `Order.orderNumber`.

Money handling: use Prisma `Decimal` type end-to-end for all currency fields (never `Float`). Convert to
string/number only at the display layer via a shared `formatPrice()` helper in `lib/utils.ts`.

Seed script (`prisma/seed.ts`) should create: 1 admin user, 3-4 categories (e.g. "Eau de Parfum",
"Eau de Toilette", "Attar", "Gift Sets"), 12-20 sample fragrance products with realistic names/notes/
prices in PKR, at least a few marked `isPublished: false` (to prove the publish/unpublish flow works)
and a few marked `isFeatured: true`.

---

## 6. Customer-Facing Features (Storefront)

1. **Home page** — hero banner, featured products, category tiles, "new arrivals," store story/blurb
   mentioning Fragrance Whisper.
2. **Product listing** — grid with pagination (or infinite scroll), filters (category, gender, price
   range, in-stock only), sort (price asc/desc, newest, featured). Only `isPublished: true` products
   are ever visible to customers — this filter must be enforced at the query layer, not the UI layer.
3. **Product detail page** — image gallery, name, brand, price (+ compareAtPrice strike-through if on
   sale), fragrance notes, description, volume, stock status ("Only 3 left" / "Out of stock" disables
   add-to-cart), quantity selector, add to cart, related products.
4. **Cart** — view items, update quantity, remove item, subtotal/shipping/tax/total breakdown, persists
   across sessions for logged-in users (DB-backed) and across page reloads for guests (cookie-backed
   cart id). Server re-validates price and stock at every cart mutation and again at checkout — never
   trust the client's cached price.
5. **Auth** — register, login, logout, forgot/reset password (email link via Resend), session-based
   route protection for `/account/*`.
6. **Checkout** — shipping address form (or select saved address), order summary, payment method
   (PayFast), place order → redirect to PayFast → return to `/checkout/success` or `/checkout/cancel`.
   Stock is decremented atomically inside a DB transaction only once payment is confirmed (webhook),
   not optimistically at order creation — see §10 for why.
7. **Account area** — profile edit, address book (add/edit/delete/set default), order history list,
   order detail with status timeline and items.
8. **Search** (basic) — simple `ILIKE`/`contains` search on product name/description; full-text search
   is a stretch goal, not required for v1.
9. *(Stretch, only if time allows)* Wishlist, product reviews/ratings, discount coupon code field at
   checkout.

---

## 7. Admin Panel Features

Access: `/admin/*` route group protected by middleware that checks `session.user.role === "ADMIN"`;
redirect non-admins to `/admin/login` or a 403 page. Admin has its own layout/shell (sidebar nav:
Dashboard, Products, Categories, Orders, Customers) — visually distinct from the storefront, not just
the storefront with an extra badge.

1. **Dashboard** — KPI cards (total revenue, orders today/this month, total products, low-stock count),
   revenue-over-time chart, recent orders table, top-selling products.
2. **Product management**
   - List with search, filter by category/published-status, pagination (TanStack Table).
   - Create/Edit form: name, slug (auto-generated from name, editable), description, brand, price,
     compareAtPrice, sku, stock, category, gender, volume, fragrance notes, image upload
     (multi-image, drag-to-reorder, set primary image) via Cloudinary.
   - **Publish/unpublish toggle** — explicit action distinct from "save," so admin can build a draft
     product and only make it live when ready.
   - **Price update** — should be possible as a quick inline edit in the table, not only via the full
     edit form.
   - Delete product — soft constraint: block/warn if the product has existing order history (don't
     hard-delete rows referenced by past orders; consider a `deletedAt`/archive flag instead of a
     true DB delete, OR just disallow delete and only allow unpublish once an order exists — decide
     and document which approach was implemented).
3. **Category management** — CRUD, image, slug.
4. **Order management** — list with filters (status, date range, payment status), detail view (items,
   customer, shipping address, payment info, PayFast transaction id), manually update order status
   (e.g. mark shipped/delivered), view the raw stored PayFast callback payload for support/debugging.
5. **Customer management** — list customers, view a customer's order history, basic account
   enable/disable (optional).
6. **Admin auth** — separate login screen (`/admin/login`) still backed by the same `User`/NextAuth
   system, just gated by role — do not build a second parallel auth system.

---

## 8. Payment Gateway — PayFast (Pakistan)

**Critical distinction:** "PayFast Pakistan" (`gopayfast.com`, API host `*.apps.net.pk`) is a completely
different company/API from South Africa's `payfast.co.za`. This project uses **PayFast Pakistan**,
because it supports local Pakistani banks, JazzCash/Easypaisa-style wallets, and PSO/PSP licensing from
the State Bank of Pakistan. The agent must not implement the South African form-post/MD5 flow by mistake.

High-level flow (token-based API, not a simple form-post):

1. **Get Merchant credentials**: `MERCHANT_ID` and `SECURED_KEY`, issued after PayFast Pakistan merchant
   signup. Store as `PAYFAST_MERCHANT_ID` and `PAYFAST_SECURED_KEY` env vars. Use their **sandbox/UAT**
   credentials and sandbox host during development (do not go live until the user has real merchant
   credentials).
2. **Step 1 — Get Access Token.** Server calls PayFast's token endpoint with `MERCHANT_ID` +
   `SECURED_KEY` to obtain a short-lived access token. Implement this in
   `features/payments/payfast/client.ts` as an async function, e.g. `getAccessToken()`.
3. **Step 2 — Post Transaction.** Server posts the transaction to PayFast's `PostTransaction` endpoint
   with (at minimum) `MERCHANT_ID`, `TOKEN` (from step 1), `TXNAMT` (order total), `BASKET_ID` (our
   internal order id/order number), `CURRENCY_CODE` (`PKR`), `CUSTOMER_MOBILE_NO`, `CUSTOMER_EMAIL_ADDRESS`,
   `SUCCESS_URL`, `FAILURE_URL`, `TXNDESC`. This call returns a redirect/checkout URL or reference that
   the customer is sent to in order to complete payment (enter card/bank/wallet details on PayFast's
   hosted page).
4. **Step 3 — Customer completes payment** on PayFast's hosted checkout, then is redirected back to our
   `SUCCESS_URL` (`/checkout/success?order=...`) or `FAILURE_URL` (`/checkout/cancel?order=...`).
5. **Step 4 — Server-to-server callback (the source of truth).** PayFast will call our webhook —
   implement `app/api/webhooks/payfast/route.ts` as a `POST` Route Handler — with the final transaction
   result. **This webhook, not the browser redirect, is what actually marks the order as paid**, because
   the browser redirect can be spoofed or interrupted. On receiving the callback: verify the payload
   (validate against PayFast's documented integrity/signature mechanism — re-check the exact field name
   in current PayFast Pakistan docs before implementing, since the agent must not guess/hallucinate a
   signature scheme), then inside a single DB transaction: mark the `Order.paymentStatus = PAID`,
   `Order.status = PROCESSING`, create/update the `Payment` record with the raw payload, and decrement
   `Product.stock` for each order item. If verification fails, log and reject — do not mark paid.
6. **Idempotency**: the webhook may be called more than once for the same transaction — guard with a
   check on `Payment` / `Order.payfastTransactionId` so stock is never double-decremented and emails
   aren't sent twice.
7. **Order confirmation email** fires after the webhook successfully marks the order paid, not at
   order-creation time.
8. **Cash on Delivery (recommended fallback)**: implement `paymentMethod: COD` as a simple alternate
   checkout path so the store is functionally testable end-to-end even before real PayFast merchant
   credentials exist — order goes straight to `PENDING`/`UNPAID` and stock decrements at order creation
   for COD orders only.

**Explicit instruction to the agent:** exact PayFast Pakistan field names, the token endpoint URL, the
`PostTransaction` endpoint URL, and the signature/verification mechanism should be pulled from PayFast's
current official docs at implementation time (`https://gopayfast.com/docs/` and the merchant dashboard's
API reference) rather than assumed from training data, because payment provider APIs change and getting
a signature check wrong is a real security bug, not a cosmetic one. Build the integration behind the
`features/payments/payfast/client.ts` abstraction so the rest of the app (`checkout` feature) never talks
to PayFast directly — only through `initiatePayfastPayment()` / `verifyPayfastCallback()` — so that if
field names change, only one file needs updating.

Environment variables to add:
```
PAYFAST_MERCHANT_ID=
PAYFAST_SECURED_KEY=
PAYFAST_MODE=sandbox   # sandbox | production
PAYFAST_API_BASE_URL=  # sandbox host in dev, production host in prod
NEXT_PUBLIC_APP_URL=   # used to build SUCCESS_URL / FAILURE_URL / webhook notify URL
```

---

## 9. Cross-Cutting Concerns

- **Validation**: every server action and route handler validates its input with the feature's Zod
  schema before touching the DB. Never trust client-supplied price/total values — always recompute
  server-side from the DB.
- **Error handling**: server actions return a consistent shape, e.g. `{ success: true, data }` or
  `{ success: false, error: string }`, rather than throwing raw errors into the client — throw only for
  truly unexpected/programmer errors.
- **Authorization**: every admin action re-checks `role === "ADMIN"` server-side inside the action
  itself (via a `requireAdmin()` guard in `features/auth/guards.ts`) — do not rely on the UI/middleware
  alone to hide admin actions, since server actions are directly callable.
- **Optimistic UI**: acceptable for cart quantity changes (React Query optimistic update, reconciled
  against the server response) but order placement and payment must never be optimistic.
- **Loading/empty/error states**: every list view (product grid, order tables, admin tables) needs a
  loading skeleton, an empty state, and an error state — not just a happy path.
- **Accessibility**: forms use proper labels, buttons have accessible names, images have alt text
  (product `altText` field feeds this directly).
- **SEO**: product and category pages use dynamic `generateMetadata` (title includes "Fragrance
  Whisper", description from product description, OG image from primary product image).

---

## 10. Environment Variables (consolidated)

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_APP_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=
EMAIL_FROM=orders@fragrancewhisper.com

PAYFAST_MERCHANT_ID=
PAYFAST_SECURED_KEY=
PAYFAST_MODE=sandbox
PAYFAST_API_BASE_URL=
```

---

## 11. Suggested Build Order (milestones)

1. Prisma schema + migrations + seed script; verify DB connectivity.
2. Auth (register/login/logout, role field, middleware for `/account` and `/admin`).
3. Storefront read-only: home, product listing, product detail (query layer + basic UI) using seeded data.
4. Admin: product CRUD + publish toggle + image upload (so the catalog becomes admin-manageable, not
   just seed data).
5. Cart (guest + logged-in, add/update/remove, persistent).
6. Checkout flow up to order creation with `COD` payment method only (prove the order pipeline end-to-end
   without PayFast complexity first).
7. **PayFast Integration (Skipped for initial prototype)**: The PayFast payment gateway integration is deferred for the initial prototype. Cash on Delivery (COD) will be the primary/only enabled payment option during this phase, though the payment flow architecture will remain intact for later implementation.
8. **Admin Dashboard & Order Management**: Role-gated panel to manage products, categories, orders, and view stats.
9. **Emails**: Order notifications and confirmations.
10. **Polish & SEO**
11. **PayFast Integration (Deferred/Stretch)**: Complete the integration after the COD flow and admin prototype are stable.

---

## 12. Non-Goals / Explicit Boundaries

- **Customer Sign-in Requirement**: Users can browse, add to cart, and fully check out using Cash on Delivery (COD) without creating an account or logging in. Registration/login is optional or reserved for future phases. Auth is mandatory only for Admin role access at `/admin/*`.

- No multi-vendor/marketplace support — single store, single admin team.
- No multi-currency — PKR only.
- No native mobile app.
- Do not build a custom CMS for marketing pages — homepage content can be config-driven initially,
  not a full page-builder.
- Do not re-scaffold the Next.js project or reconfigure Tailwind — the user has already done this;
  the agent should assume `create-next-app@latest` + Tailwind defaults already exist and build on top.
