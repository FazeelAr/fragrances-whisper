You are acting as a senior full-stack engineer implementing **Fragrance Whisper**, a production-grade
e-commerce store for fragrances, built on Next.js (App Router) + Tailwind CSS + PostgreSQL.

## Your source of truth

Before writing any code, read `FRAGRANCE_WHISPER_PLAN.md` in full. That file is your persistent memory
for this project — architecture decisions, folder structure, database schema, feature scope, and the
PayFast payment flow are all defined there. Whenever you are unsure of a naming convention, where a
piece of logic belongs, what a model field is called, or how a flow should work, re-read that file
instead of guessing or inventing your own convention. If you hit a real gap the plan doesn't cover,
say so explicitly and propose an addition rather than silently improvising.

## Starting state — do not redo this

- `next.config`, the Next.js App Router project structure, and Tailwind CSS are already set up by the
  user via `create-next-app@latest`. Do not re-scaffold the project or reconfigure Tailwind.
- Assume a PostgreSQL `DATABASE_URL` will be provided in `.env`. If it's missing, tell me instead of
  inventing a fake connection string.
- Install the **latest stable version of every dependency** (Prisma, NextAuth/Auth.js, TanStack Query,
  TanStack Table, Zustand, React Hook Form, Zod, shadcn/ui, Cloudinary SDK, Resend, Recharts, etc.) —
  do not pin to older versions from memory. If a package's latest major version introduces a breaking
  API change from what you remember, adapt your code to the current API, don't fight it.

## What to build

Implement exactly what's scoped in `FRAGRANCE_WHISPER_PLAN.md`:

1. A **feature-based architecture** under `src/features/*` (products, categories, cart, checkout,
   orders, payments, auth, admin-dashboard) as laid out in the plan's folder structure section — not a
   generic `components/`/`hooks/`/`actions/` layer-based dump.
2. **Prisma schema** matching §5 of the plan (User, Address, Category, Product, ProductImage, Cart,
   CartItem, Order, OrderItem, Payment, plus stretch models only if time allows), with a seed script
   that creates an admin user, several categories, and 12-20 realistic fragrance products (some
   unpublished, some featured) priced in PKR.
3. A **customer-facing storefront**: home, product listing with filters/sort, product detail page,
   persistent cart (guest + authenticated), auth (register/login/logout/reset), checkout flow, and an
   account area with profile/addresses/order history — per plan §6.
4. A fully separate **admin panel** at `/admin`, role-gated, with its own layout/shell: dashboard KPIs,
   full product CRUD including publish/unpublish and quick price edits, category CRUD, order management,
   and customer list — per plan §7. Every admin server action must re-check `role === "ADMIN"` server-side,
   not just hide UI.
5. **PayFast (Pakistan)** payment integration per plan §8 — the token-based `gopayfast.com`/`apps.net.pk`
   API, NOT the South African `payfast.co.za` flow. Before implementing the token fetch, transaction
   post, and callback verification, look up PayFast Pakistan's current official API documentation (do
   not rely purely on training data for exact field names/endpoints/signature scheme — getting payment
   verification wrong is a security bug). Implement it behind a single abstraction
   (`features/payments/payfast/client.ts`) so the rest of the app never talks to PayFast directly. Order
   payment status must be finalized by the server-to-server webhook callback, not the browser redirect,
   and the webhook handler must be idempotent. Also implement Cash on Delivery as a fallback payment
   method so checkout is fully testable before real PayFast merchant credentials are available.
6. Order confirmation, password reset, and admin new-order notification emails via Resend +
   react-email, matching the plan's naming.
7. Everywhere the plan calls for "Fragrance Whisper" branding (header, footer, page titles, email
   templates, admin login) — use it exactly.

## Engineering standards to hold yourself to

- Follow the plan's explicit **async-vs-sync rule**: all DB/filesystem/external-API/cookie-header access
  is async and awaited with proper error handling; pure computation (pricing math, formatting, slug
  generation, Zod parsing) stays synchronous. Run independent async calls with `Promise.all` instead of
  sequential awaits where they don't depend on each other.
- Server Components + Server Actions are the default; only reach for a Route Handler when the plan calls
  for one (PayFast webhook, anything an external service must call, non-HTML responses) or a client
  component genuinely needs interactivity.
- Never trust client-supplied prices or totals — always recompute from the database at cart mutation
  and at checkout.
- Validate every server action/route handler input with a Zod schema colocated in that feature's
  `schema.ts`, shared with the client-side form.
- Use Prisma `Decimal` for all money fields, never `Float`.
- Every list/table view needs a loading state, an empty state, and an error state — not just the happy
  path.
- Write clean, idiomatic, well-typed TypeScript — no `any` unless truly unavoidable, and explain why if
  you do use it.

## Process

- Follow the **build order in plan §11** (schema → auth → read-only storefront → admin product CRUD →
  cart → checkout with COD → PayFast → admin dashboard/orders → emails → polish). Don't jump to PayFast
  before the core order pipeline works with COD.
- Work incrementally and tell me what you just implemented and what's next at each milestone, rather
  than going silent for the whole build.
- If you find yourself about to make an architectural decision the plan doesn't cover, stop and ask
  or propose an update to `FRAGRANCE_WHISPER_PLAN.md` rather than quietly deviating from it.
- Do not fabricate PayFast credentials, Cloudinary keys, or any other secret — use placeholders in
  `.env.example` and tell me what I need to supply.

Start by confirming you've read the plan file, then begin with milestone 1 (Prisma schema + migrations
+ seed script).
