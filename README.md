# Arch Design — Client, Server, Admin

Monorepo with three applications:

| App     | Port | Description                    |
|---------|------|--------------------------------|
| **client** | 3000 | Storefront (React + Vite)      |
| **server** | 4000 | API (Express)                 |
| **admin**  | 3001 | Admin dashboard (React + Vite)|

## Run everything

From the repo root:

```bash
npm install
npm run dev
```

Then open:

- **Store:** http://localhost:3000  
- **Admin:** http://localhost:3001 (login: `admin@example.com` / `admin123`)  
- **API:** http://localhost:4000 (e.g. `GET /api/products`)

## Run a single app

```bash
npm run dev:client   # storefront only
npm run dev:server   # API only
npm run dev:admin    # admin only
```

Or from the app folder:

```bash
cd client && npm run dev
cd server && npm run dev
cd admin  && npm run dev
```

## Build

```bash
npm run build
```

Or per app: `npm run build:client`, `npm run build:server`, `npm run build:admin`.

## Layout

```
arch_design/
├── client/       # Storefront SPA
├── server/       # Express API (products, orders, auth)
├── admin/        # Admin dashboard SPA
└── package.json  # Workspaces root
```
