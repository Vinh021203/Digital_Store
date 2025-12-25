<div align="center">

# 🛒 DigitalMart

### Modern Digital Products Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

**A full-featured digital marketplace for selling templates, themes, UI kits, and digital assets.**

[Demo](#) • [Documentation](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## ✨ Features

### 🛍️ Marketplace
- **Product Catalog** - Browse templates, themes, landing pages, mini apps, and bundles
- **Advanced Filtering** - Search by category, price, tags, and more
- **Product Reviews** - Customer ratings and verified purchase reviews
- **Wishlist & Compare** - Save favorites and compare products

### 💳 E-Commerce
- **Secure Checkout** - Multiple payment methods (SePay, MoMo, Bank Transfer)
- **License System** - Regular, Extended, and Unlimited license types
- **Download Management** - Secure downloads with monthly limits
- **Coupon System** - Discount codes with usage tracking

### 👤 User Features
- **Authentication** - Email/password with OTP verification
- **User Dashboard** - Order history, downloads, licenses, and profile
- **Affiliate Program** - Earn commissions by referring customers
- **Support Tickets** - Built-in customer support system

### 🎛️ Admin Panel
- **Dashboard Analytics** - Sales, revenue, and user statistics
- **Product Management** - CRUD operations with version control
- **Order Management** - Kanban and list views
- **User Management** - Roles, permissions, and activity logs
- **Marketing Tools** - Blog, coupons, and notifications

### 🔒 Security
- **Row Level Security** - Supabase RLS policies
- **XSS Protection** - HTML sanitization with DOMPurify
- **Webhook Verification** - Secure payment callbacks
- **Rate Limiting Ready** - API protection infrastructure

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **pnpm**
- **Supabase** account (free tier works)
- **Resend** account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/digital-mart.git
   cd digital-mart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` file:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Email (Resend)
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=onboarding@resend.dev
   
   # Site
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   
   # Payment (SePay)
   SEPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

---

## 📁 Project Structure

```
digital-mart/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (client)/          # Public pages
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── admin/            # Admin components
│   ├── layout/           # Layout components
│   ├── product/          # Product components
│   └── ui/               # UI primitives
├── lib/                   # Utilities & services
│   ├── supabase/         # Supabase clients
│   └── *.ts              # Data fetching functions
├── context/              # React contexts
├── types.ts              # TypeScript definitions
└── public/               # Static assets
```

---

## 🗄️ Database Schema

The app uses **Supabase** (PostgreSQL) with the following main tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with roles |
| `products` | Product catalog |
| `product_files` | Version management |
| `orders` | Purchase orders |
| `order_items` | Order line items |
| `licenses` | License keys & limits |
| `downloads` | Download logs |
| `reviews` | Product reviews |
| `coupons` | Discount codes |
| `tickets` | Support tickets |

---

## 🔧 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Email** | Resend |
| **Payments** | SePay / MoMo / Bank Transfer |
| **File Storage** | Cloudinary |
| **Deployment** | Vercel |

---

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=your@verified-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
SEPAY_WEBHOOK_SECRET=
```

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

---

<div align="center">

**Built with ❤️ using Next.js & Supabase**

</div>
