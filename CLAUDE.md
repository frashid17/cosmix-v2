# Cosmix — Spa Salon Booking Platform

## Workspace

Two repos, always open together:
- **`cosmix-v2`** — Expo (React Native) mobile app — customer-facing + WebView shell for provider/admin
- **`cosmix-admin`** — Next.js 14 app — REST API backend + provider/admin web dashboard

---

## Architecture

### High-Level

```
[Expo App]
  ├── Native screens   → customer flow (browse, checkout, bookings)
  ├── Stripe SDK       → payment sheet (native)
  ├── WebView (map)    → inline Mapbox GL JS HTML
  └── WebView (admin)  → full Next.js /dashboard or /admin

[Next.js]
  ├── /api/*           → REST API (34 endpoints)
  ├── /dashboard/*     → provider web UI (served into WebView)
  ├── /admin/*         → admin web UI (served into WebView)
  └── Prisma + Postgres
```

### Auth Flow

- **Expo → API:** `Authorization: Bearer EXPO_PUBLIC_ADMIN_API_KEY` (shared secret) + optional `X-User-Token: <clerk_token>`
- **WebView auth:** Clerk token injected into WebView localStorage + `x-user-token-session` cookie, refreshed every 30s
- **Middleware** (`cosmix-admin/middleware.ts`): validates JWT format, converts header → cookie
- **Role check** (`cosmix-admin/lib/admin-access.ts` → `checkAdminAccess()`): verifies Clerk token signature, returns `{ isAdmin, user }`
- **Roles:** `User.isAdmin = false` → Provider | `User.isAdmin = true` → Admin | no account → Customer (anonymous checkout)

### Payment Flow

```
POST /api/checkout  → stripe.paymentIntents.create()  → returns clientSecret
confirmPayment(clientSecret)  [Stripe native SDK in Expo]
PATCH /api/checkout → booking status: pending → confirmed + send emails
```

Stripe Connect (Express accounts, country FI) for providers — `GET /api/stripe/connect` creates account + onboarding link.

---

## Key Files

### cosmix-v2 (Expo)
| File | Purpose |
|------|---------|
| `src/app/admin-webview.tsx` | WebView wrapper for entire provider/admin dashboard |
| `src/app/(tabs)/map.tsx` | Mapbox map via inline HTML WebView |
| `src/app/checkout.tsx` | Native Stripe payment sheet |
| `src/app/actions/checkout.ts` | POST/PATCH to `/api/checkout` |
| `src/app/actions/get-bookings.ts` | GET `/api/bookings` |
| `lib/webview-bridge.ts` | RN ↔ WebView postMessage protocol |
| `config/constants.ts` | API endpoints + env config |

### cosmix-admin (Next.js)
| File | Purpose |
|------|---------|
| `middleware.ts` | JWT format validation + CORS |
| `lib/admin-access.ts` | Role enforcement (`checkAdminAccess()`) |
| `lib/service-auth.ts` | Bearer token validation |
| `lib/salon-access.ts` | Salon owner access check |
| `lib/stripe.ts` | Stripe client (API version `2025-11-17.clover`) |
| `app/api/checkout/route.ts` | Payment intent creation + booking confirmation + emails |
| `app/api/stripe/connect/route.ts` | Stripe Express onboarding |
| `app/api/webhooks/user/route.ts` | Clerk webhook — **DISABLED** |
| `prisma/schema.prisma` | Database schema |

---

## API Routes (34 endpoints)

### Public (no auth)
- `GET /api/public/categories`
- `GET /api/public/services`, `/api/public/services/[serviceId]`
- `GET /api/public/saloons`, `/[saloonId]`, `/[saloonId]/services`, `/[saloonId]/available-slots`

### Customer (Bearer or X-User-Token)
- `GET|POST /api/bookings`
- `GET|PUT|DELETE /api/bookings/[bookingId]`
- `POST|PATCH /api/checkout`
- `POST /api/reviews`
- `GET /api/saloons/map`
- `GET|PUT|DELETE /api/saloons/[id]`
- `GET|POST /api/saloons/[id]/services`
- `PUT|DELETE /api/saloons/[id]/services/[serviceId]`
- `GET /api/saloons/[id]/time-slots`
- `GET|DELETE /api/stripe/connect`
- `GET /api/users/[userId]/bookings`

### Admin only
- `GET /api/admin/check`
- `GET|POST /api/admin/categories`, `PUT|DELETE /api/admin/categories/[id]`
- `GET|POST /api/admin/services`, `PUT|DELETE /api/admin/services/[id]`
- `GET /api/admin/saloons`, `/users`, `/stats`, `/revenue`

---

## Native vs WebView Feature Map

| Feature | Native | WebView Only |
|---------|--------|-------------|
| Browse salons/categories | ✅ | — |
| Checkout + Stripe payment | ✅ | — |
| View customer bookings | ✅ | — |
| Map (Mapbox) | WebView (inline HTML) | — |
| Manage salon profile | ❌ | ✅ `/dashboard/saloons` |
| Edit services + pricing | ❌ | ✅ `/dashboard/saloons/[id]` |
| View/manage bookings (provider) | ❌ | ✅ `/dashboard/bookings` |
| Stripe Connect setup | ❌ | ✅ `/dashboard/integration` |
| Analytics / revenue | ❌ | ✅ `/dashboard` |
| Category management | ❌ | ✅ `/dashboard/categories` |
| Time slot configuration | ❌ | ✅ `/dashboard/saloons/[id]` |
| Image uploads (Cloudinary) | ❌ | ✅ embedded in WebView |
| Admin: users, saloons, global CRUD | ❌ | ✅ `/admin` |

---

## Known Issues & Gaps

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | **Clerk webhook disabled** — user creation is on-demand via `checkAdminAccess()`; re-enabling will cause duplicate users | 🔴 | `app/api/webhooks/user/route.ts` |
| 2 | **No Stripe fund routing to providers** — Express accounts created but no `transfer_data` or `application_fee_amount` on payment intents | 🔴 | `app/api/checkout/route.ts` |
| 3 | **`EXPO_PUBLIC_ADMIN_API_KEY` in compiled JS** — shared bearer secret visible in decompiled app bundle | 🔴 | `config/constants.ts` |
| 4 | **Available-slots route never called** — `GET /api/public/saloons/[id]/available-slots` exists but Expo never calls it; no availability shown before booking | 🟡 | `app/api/public/saloons/[saloonId]/available-slots/` |
| 5 | **Review system incomplete** — `POST /api/reviews` called from Expo but endpoint wiring unclear | 🟡 | `src/app/bookings.tsx` |
| 6 | **Email delivery unverified** — confirmation emails called but no visible email provider config; silent failures possible | 🟡 | `app/api/checkout/route.ts` |
| 7 | **Booking status incomplete** — only `pending`/`confirmed`; missing `cancelled`, `completed`, `no-show` | 🟡 | `prisma/schema.prisma` |
| 8 | **Duplicate endpoint paths** — `/api/categories` vs `/api/public/categories` both exist | 🟡 | multiple |
| 9 | **Mapbox token hardcoded in source** | 🟠 | `src/app/(tabs)/map.tsx` |
| 10 | **Provider revenue inaccessible** — only `/api/admin/revenue` exists; no per-provider earnings endpoint | 🟢 | `app/api/admin/` |
| 11 | **`SaloonService.durationMinutes` unused** — in schema but never shown to customers | 🟢 | `prisma/schema.prisma` |

---

## Database (Prisma)

Schema at `cosmix-admin/prisma/schema.prisma`. Key models:
- `User` — `clerkId`, `isAdmin`, `stripeId` (Express account)
- `Saloon` — owned by User, has services and bookings
- `SaloonService` — price, durationMinutes, linked to global Service
- `Booking` — status (`pending`/`confirmed`), customerName/email/phone, paymentMethod
- `SaloonReview` — created on checkout, filled on review submission

---

## Environment Variables

### cosmix-v2 (Expo)
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_ADMIN_API_KEY` — shared bearer secret for API calls
- `EXPO_PUBLIC_ADMIN_DASHBOARD_URL` — URL of cosmix-admin deployment (injected into WebView)
- `EXPO_PUBLIC_API_URL` — base URL for Next.js API

### cosmix-admin (Next.js)
- `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `ADMIN_API_KEY` — must match `EXPO_PUBLIC_ADMIN_API_KEY`
- `ADMIN_EXTERNAL_ID` — synthetic service user ID (default: `"service-admin"`)
- `DATABASE_URL` — Postgres connection string
- `NEXT_PUBLIC_APP_URL` — deployment base URL (for Stripe callback URLs)
