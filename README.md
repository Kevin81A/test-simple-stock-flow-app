# Simple Stock Flow · Frontend (React Single Page Application)

> **Spec-Driven Development (SDD) Technical Benchmark · Class 3413974**  
> Web client implementation for inventory management and point of sale.

---

## 1. What is this repository and what role does it play in Simple Stock Flow?

This repository contains the **Single Page Application (SPA)** built with **React 18 + TypeScript + Vite**, bundled and served through **Nginx** inside a Docker container.

Key features:
- **JWT Authentication:** Sign-in for administrators and sellers, expiration handling, and secure sign-out.
- **Product Catalog:** Real-time search, category filters, pagination, creation/editing (admin only), image uploads to `/api/products/{id}/image` (max 5 MB, JPEG/PNG/WebP), and soft delete.
- **Point of Sale / Cart:** Product selection, live stock validation, and atomic sale confirmation.
- **Sales History:** Filter by date range (`from` and exclusive `to`), pagination, and receipt voucher modal.
- **Consolidated Sales Report:** Key metrics (total revenue in COP, sales count, units sold) and product performance table with frozen historical names (PD-01).
- **Seller Management:** Creation of new sellers by administrators enforcing PD-04 (no role selector).

---

## 2. How to run the project locally?

### With Docker Compose (Recommended)
From `test-simple-stock-flow-infra` or root monorepo:

```bash
docker compose up -d --build
```
The application will be accessible at: `http://localhost:8080`.  
Nginx serves the static SPA build and proxies `/api/` and `/media/` requests to `api:8000`.

### Without Docker (Local Development)
Requires Node.js 20+:

```bash
# 1. Install dependencies
npm install

# 2. Run Vite development server with proxy
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 3. Required Environment Variables

When running in container mode, reverse proxy configurations are managed in `nginx.conf`:
- API Proxy: `http://api:8000/api/`
- Media Proxy: `http://api:8000/media/` with `client_max_body_size 6m`

In local development, `vite.config.ts` handles reverse proxying to `http://localhost:8000`.

---

## 4. How are tests and type-checks executed?

```bash
# Strict TypeScript validation and production build
npm run build
```

---

## 5. Key Technical Decisions Made During Implementation

1. **Clean Layered Architecture in Frontend:**
   - `application/`: Global state via `AuthContext` (JWT tokens, shopping cart in `localStorage`).
   - `infrastructure/`: Typed HTTP client (`apiClient.ts`) and Data Transfer Objects (`api.dto.ts`) matching OpenAPI/RFC 7807 specs.
   - `presentation/`: Modular components and views decoupled from network logic.
2. **Empty Error Body & RFC 7807 Handling:**
   - The infrastructure layer differentiates empty responses (401, 403, 404 with `Content-Length: 0`) and validation errors formatted as `application/problem+json` (400 with `detail` and `errors`).
3. **Exclusive Date Range Invariant (H-3):**
   - The date picker automatically advances the `to` date by one day (`T00:00:00Z`) so backend condition `from <= sold_at < to` includes the entire selected end day.
4. **Security Policy Enforcement (PD-04):**
   - The new seller view (`/vendedores/nuevo`) does not expose any role selector; role is fixed to `seller`.