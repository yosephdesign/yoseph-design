# Yoseph Design

> **Architectural furniture e-commerce & 3D design studio** — A production-ready full-stack monorepo with a public storefront, admin dashboard, and REST API.

**Live:**
[Storefront](https://yosephdesign.vercel.app) ·

---

## Client — Storefront Features

### Home & Product Catalog

- Full-viewport animated hero with CTA scroll to product collection
- Product grid with loading skeletons and empty states
- Category filtering (Living, Bedroom, Dining, Office, Outdoor, 3D Models)
- Deep-linkable products via `?product=<id>` for sharing
- Philosophy/brand section with founder profile

### Product Details

- Modal-based product viewer with image gallery (main + up to 4 images)
- Quantity selector and add-to-cart
- Social sharing (Facebook, LinkedIn, Telegram, TikTok, Email) with Open Graph meta tags
- Desktop hover-follow image zoom effect
- Featured product ribbon badges

### 3D Model Support

- Dedicated 3D model filter in the catalog
- Format selector (RVT, FBX, OBJ, SKP, 3DS, DWG) with descriptions
- Download links per format
- Add 3D models to cart

### Studio Portfolio

- Separate studio page with its own category system (Logo Design, Branding, Architectural, Product)
- Studio model grid with detail modals
- Inline PDF viewer for project documents (Google Docs viewer for remote PDFs)
- PDF download and open-in-tab options

### Shopping Cart & Checkout

- Slide-over cart drawer with quantity controls and item removal
- Cart badge count in header
- Checkout modal with shipping form (name, email, address, city, zip)
- Order submission to API with cart auto-clear on success

### Contact Page

- Contact form with name, email, phone (optional), category selector, and message
- Client-side email validation mirroring provider rules (Gmail, Yahoo, Outlook)
- Contact information display with icons
- Toast notifications for success/error states

### Search

- Global search across products (on home) and studio models (on studio page)
- Price-based search hints ("under N", "above N")
- 3D keyword filtering
- Responsive dropdown results with mobile support

### UI & Design

- Fully responsive (mobile, tablet, desktop)
- Animated background canvas (light waves)
- Framer Motion page transitions and scroll animations
- Newsletter subscription in footer
- Social media links (TikTok, Instagram, YouTube)
- Smooth scroll-to-top on navigation

---

## Admin — Dashboard Features

### Overview Dashboard

- Total revenue, order count, product count, newsletter subscribers
- Month-over-month percentage comparisons
- Recent sales list (last 5 orders)
- Store insights: fulfillment rate, pending percentage, top category, auto-generated summary

### Product Management

- Full CRUD: create, read, update, delete products
- Image upload to Cloudinary (drag-and-drop or URL)
- Up to 4 additional gallery images per product
- Category assignment and featured flag
- Search and table view with thumbnails

### 3D Model Management

- Manage 3D file formats per product (RVT, FBX, OBJ, SKP, 3DS, DWG)
- Add download URLs per format
- Badge indicators for available formats
- Bulk clear all 3D files

### Studio Management

- Full CRUD for studio portfolio items
- Image upload (file or URL) to Cloudinary
- PDF upload for project documents (up to 25 MB)
- Category filter pills with counts
- Featured flag

### Order Management

- Order list with search (order ID, customer email)
- Status filter chips (Pending, Processed, Shipped, Delivered)
- Status updates via dropdown
- Detail dialog with customer info, items, and totals

### Message Inbox

- Contact form submissions from the storefront
- Search across name, email, phone, category, message
- Status management (New, Read, Archived)
- Detail view dialog with reply-to links
- Delete messages

### Settings

- Change admin login email (triggers re-authentication)
- Change password with current password verification (min 6 characters)
- Connected services status monitor (MongoDB, Cloudinary, AbstractAPI)

### Authentication

- Secure login with database-backed credentials (hashed passwords with scrypt + salt)
- Token-based session management
- Auto-logout on token expiry
- Protected routes

---

## Server — API Features

### Authentication & Security

- Admin credentials stored in MongoDB with scrypt password hashing
- HMAC token generation and validation
- `requireAdmin` middleware for protected endpoints
- Auto-bootstrap default admin on first run

### Media Uploads

- Image upload to Cloudinary with auto-resize, quality optimization, and format detection (10 MB limit)
- PDF upload to Cloudinary raw storage (25 MB limit)
- Memory-based multer storage (no temp files)

### Email Verification (3-layer)

- Regex format validation
- Provider-specific username rules (Gmail requires 6+ chars, Yahoo 4+, Outlook 3+)
- DNS MX record lookup to verify domain exists
- AbstractAPI Email Reputation check (disposable, undeliverable, low quality score)

### API Endpoints

- `POST /api/auth/login` — Admin authentication
- `GET/POST/PUT/DELETE /api/products` — Product catalog CRUD
- `GET/POST/PUT/DELETE /api/studio-models` — Studio portfolio CRUD
- `POST /api/orders` — Public order creation
- `GET /api/orders` / `PUT /api/orders/:id/status` — Admin order management
- `POST /api/contact` — Public contact form with email verification
- `GET/PATCH/DELETE /api/contact-messages` — Admin message management
- `POST /api/newsletter` — Public newsletter subscription
- `GET /api/newsletter` — Admin subscriber list
- `GET/PUT /api/settings/profile` — Admin email management
- `PUT /api/settings/password` — Admin password change
- `GET /api/settings/services` — Service health check
- `GET /api/dashboard-stats` — Aggregated dashboard analytics
- `POST /api/upload` / `POST /api/upload-pdf` — Media uploads

---

## Tech Stack

| Layer          | Technologies                                                                     |
| -------------- | -------------------------------------------------------------------------------- |
| **Frontend**   | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Radix UI, Lucide Icons  |
| **Backend**    | Node.js, Express, TypeScript, Mongoose                                           |
| **Database**   | MongoDB Atlas                                                                    |
| **Storage**    | Cloudinary (images & PDFs)                                                       |
| **Auth**       | HMAC tokens, scrypt password hashing                                             |
| **Email**      | AbstractAPI Email Reputation, DNS MX verification                                |
| **Deployment** | Vercel (client + admin), Render (server)                                         |
| **Tooling**    | npm workspaces, ESLint, date-fns, Sonner toasts, Zod validation, React Hook Form |

---

## Project Structure

```
arch_design/
├── client/          # Storefront SPA (React + Vite + Tailwind)
├── server/          # Express REST API (MongoDB + Cloudinary)
├── admin/           # Admin dashboard SPA (React + Vite)
└── package.json     # npm workspaces root
```

---

## Quick Start

```bash
npm install
npm run dev
```

| App        | URL                   |
| ---------- | --------------------- |
| Storefront | http://localhost:3000 |
| Admin      | http://localhost:3001 |
| API        | http://localhost:4000 |

### Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Run all apps in parallel |
| `npm run dev:client` | Storefront only          |
| `npm run dev:server` | API only                 |
| `npm run dev:admin`  | Admin dashboard only     |
| `npm run build`      | Build all apps           |

---

## Environment Variables

### Server (`server/.env`)

| Variable                | Description                                 |
| ----------------------- | ------------------------------------------- |
| `MONGODB_URI`           | MongoDB Atlas connection string             |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                       |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                          |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                       |
| `ABSTRACTAPI_EMAIL_KEY` | AbstractAPI email validation key (optional) |

### Client & Admin (Vercel / build-time)

| Variable       | Description         |
| -------------- | ------------------- |
| `VITE_API_URL` | Server API base URL |
