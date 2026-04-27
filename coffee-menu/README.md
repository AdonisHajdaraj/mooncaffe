# ☕ Brew & Co — Digital QR Menu

A clean, production-ready coffee shop QR menu system built with **React (Vite)** + **Supabase**.

| Route | Who | What |
|-------|-----|------|
| `/menu` | Customers | Browse the full menu — no login needed |
| `/login` | Admin | Sign in with email + password |
| `/admin` | Admin only | Full CRUD for products & categories |

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd coffee-menu
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New Query** and paste the contents of `supabase-setup.sql`, then run it
3. Go to **Authentication → Users → Add User** and create your admin email/password

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values from **Project Settings → API**:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run

```bash
npm run dev
```

Visit `http://localhost:5173/menu` 🎉

---

## 🗄️ Database Schema

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | text | Unique |

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | text | |
| description | text | |
| price | numeric(10,2) | |
| image_url | text | URL or Supabase Storage path |
| category_id | uuid | FK → categories.id |
| created_at | timestamptz | Auto-set |

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── Menu.jsx          # Public customer menu
│   ├── Login.jsx         # Admin login
│   └── Admin.jsx         # Admin dashboard
├── components/
│   ├── ProductCard.jsx   # Customer-facing card
│   ├── ProductForm.jsx   # Add/edit modal
│   ├── Sidebar.jsx       # Admin navigation
│   ├── Toast.jsx         # Notifications
│   └── ProtectedRoute.jsx# Auth guard
├── services/
│   ├── supabaseClient.js # Supabase init
│   └── productService.js # All API functions
├── index.css             # Global styles & design tokens
└── main.jsx              # App entry + routing
```

---

## 🖼️ Image Upload (Bonus)

To enable image uploads:

1. In Supabase → **Storage → New Bucket**
2. Name it `product-images`, enable **Public**
3. In your bucket's **Policies**, allow authenticated users to insert/select

The `uploadProductImage()` function in `productService.js` handles the rest.

---

## 📱 QR Code

Generate a QR code pointing to `https://your-domain.com/menu` using any QR generator. Print and place on tables!

---

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to **Vercel**, **Netlify**, or any static host.

---

## Tech Stack

- ⚛️ React 18 + Vite
- 🎨 Bootstrap 5 + Bootstrap Icons
- 🗄️ Supabase (Auth + Database + Storage)
- 🔀 React Router v6
- 🔤 Playfair Display + DM Sans (Google Fonts)
