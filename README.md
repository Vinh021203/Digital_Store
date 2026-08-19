# Shop Web rẻ / Shop Web rẻ

Shop Web Rẻ là website giới thiệu và bán giao diện website như template, theme, UI kit, landing page, dashboard, mini app và bundle. Dự án được xây bằng Next.js, Supabase và Tailwind CSS, có đầy đủ luồng client, admin, affiliate, thanh toán, download/license và chatbot AI.

## Tính năng chính

### Client

- Trang chủ catalog với hero, danh mục, sản phẩm nổi bật, sản phẩm bán chạy, blog và CTA.
- Danh sách sản phẩm, tìm kiếm, lọc, so sánh và wishlist.
- Trang chi tiết sản phẩm với gallery, mô tả, FAQ, review, sản phẩm liên quan và mua nhanh.
- Giỏ hàng, checkout, trang thành công đơn hàng.
- Profile người dùng: tổng quan, đơn hàng, download, license, community, support, cài đặt.
- Mobile bottom navigation toàn site client.
- Widget chat AI nổi, scroll-to-top, recently viewed và các widget marketing.
- Trang AI Recommendation dùng OrcaRouter/DeepSeek + Supabase để tư vấn sản phẩm theo nhu cầu.

### Auth

- Đăng nhập, đăng ký, quên mật khẩu, reset password.
- OAuth Google/GitHub qua Supabase Auth.
- Verify email.
- Profile đồng bộ với Supabase.

### Admin

- Dashboard quản trị.
- Quản lý sản phẩm, danh mục, license, đơn hàng, khách hàng.
- Quản lý marketing: coupon, blog, affiliate.
- Quản lý notification, community, activity logs, settings, finance.

### Affiliate

- Trang giới thiệu chương trình affiliate.
- Dashboard affiliate.
- Quản lý referral, campaign, withdrawal và công cụ chia sẻ.

### Thanh toán, license và download

- Checkout hỗ trợ SePay/VietQR.
- Webhook thanh toán.
- Tạo license sau khi thanh toán.
- Download sản phẩm đã mua.
- Theo dõi lượt download và license trong profile.

### AI

- Chatbot AI dùng OrcaRouter qua OpenAI-compatible API.
- Chatbot lấy context sản phẩm thật từ Supabase.
- Lọc sản phẩm theo nhu cầu, loại sản phẩm và ngân sách.
- Fallback thông minh khi AI quá tải.
- Trang AI Recommendation dùng AI để viết phân tích/lộ trình sản phẩm.

## Công nghệ sử dụng

| Nhóm | Công nghệ |
| --- | --- |
| Framework | Next.js 16, React 19 |
| Ngôn ngữ | TypeScript |
| UI | Tailwind CSS, Lucide React |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Upload | Cloudinary |
| Email | Resend |
| AI | OrcaRouter / DeepSeek V4 |
| Payment | SePay / VietQR |
| Animation | Framer Motion, Canvas Confetti |

## Cấu trúc thư mục

```txt
app/
  (auth)/                 Trang đăng nhập, đăng ký, reset password
  (client)/               Toàn bộ giao diện client
  admin/                  Giao diện quản trị
  api/                    API routes, webhook, upload và AI
components/
  admin/                  Component admin
  affiliate/              Component affiliate
  blog/                   Component blog
  community/              Component community
  layout/                 Navbar, Footer, Mobile nav
  marketing/              Widget marketing
  pages/                  Trang chủ
  product/                Product card, review, quick view
  ui/                     UI base, toast, modal, notification
  widgets/                Floating widgets, chatbot
context/
  AuthContext.tsx
  SupabaseAuthContext.tsx
  CartContext.tsx
  ThemeContext.tsx
  ToastContext.tsx
lib/
  supabase/               Supabase client/server/middleware
  products.ts             Product queries
  orders.ts               Orders
  licenses.ts             Licenses
  notifications.ts        Notification
  ai.ts                   OrcaRouter AI helper
  sepay.ts                Payment helper
public/
  assets/images
```

## Yêu cầu môi trường

- Node.js 20 trở lên.
- npm.
- Supabase project.
- Cloudinary account nếu dùng upload ảnh/file.
- Resend account nếu gửi email.
- OrcaRouter API key nếu dùng AI.
- SePay/VietQR nếu dùng thanh toán thật.

## Cài đặt

```bash
npm install
```

Tạo file `.env.local` ở thư mục gốc:

```env
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SePay / VietQR
SEPAY_BANK_CODE=your_bank_code
SEPAY_BANK_NAME=your_bank_name
SEPAY_ACCOUNT_NUMBER=your_account_number
SEPAY_ACCOUNT_NAME=your_account_name
SEPAY_API_KEY=your_sepay_api_key
SEPAY_WEBHOOK_SECRET=your_webhook_secret

# Public SePay config nếu cần hiển thị QR phía client
NEXT_PUBLIC_SEPAY_BANK_CODE=your_bank_code
NEXT_PUBLIC_SEPAY_BANK_NAME=your_bank_name
NEXT_PUBLIC_SEPAY_ACCOUNT_NUMBER=your_account_number
NEXT_PUBLIC_SEPAY_ACCOUNT_NAME=your_account_name

# Resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_verified_sender
RESEND_WEBHOOK_SECRET=your_resend_webhook_signing_secret
RESEND_INBOUND_ADDRESS=contact@webgiare.id.vn
RESEND_INBOUND_FORWARD_TO=your_private_inbox@example.com

# OrcaRouter / DeepSeek
ORCAROUTER_API_KEY=your_orcarouter_api_key
# Tuỳ chọn: nếu đặt sẽ ưu tiên hơn lựa chọn model trong CMS
ORCAROUTER_MODEL=deepseek/deepseek-v4-flash-free
```

Không commit `.env.local` lên GitHub.

## Chạy dự án

Chạy dev server:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Start production build:

```bash
npm run start
```

TypeScript check:

```bash
npx tsc --noEmit
```

## Supabase

Database chính dùng các nhóm bảng:

- `profiles`
- `products`
- `categories`
- `orders`
- `order_items`
- `licenses`
- `downloads`
- `reviews`
- `tickets`
- `notifications`
- `transactions`
- `affiliate_referrals`
- `affiliate_withdrawals`
- `blog_posts`
- `community_posts`
- `carts`
- `wishlists`
- `payments`
- `site_settings`

RLS cần bật cho các bảng public. Một số chính sách cần đặc biệt chú ý:

- User chỉ được đọc/sửa dữ liệu của chính mình.
- Admin mới được quản lý sản phẩm, đơn hàng, coupon, notification và affiliate toàn hệ thống.
- Service role chỉ dùng trong API server, tuyệt đối không đưa ra client.

## Bảo mật đã lưu ý

- Đã khóa việc user tự đổi `profiles.role` bằng trigger Supabase.
- OrcaRouter API key chỉ dùng server-side.
- Upload API cần kiểm tra role/type/size trước khi public thật.
- Webhook thanh toán cần xác thực `SEPAY_WEBHOOK_SECRET`.
- Không render HTML thô nếu chưa sanitize.
- Không commit secret key.

## Các route quan trọng

### Client

- `/`
- `/products`
- `/product/[id]`
- `/cart`
- `/checkout`
- `/wishlist`
- `/compare`
- `/ai-recommendation`
- `/community`
- `/blog`
- `/about`
- `/contact`
- `/faq`

### Auth

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`

### Profile

- `/profile`
- `/profile/orders`
- `/profile/downloads`
- `/profile/licenses`
- `/profile/settings`
- `/profile/support`
- `/profile/community`
- `/profile/affiliate`

### Admin

- `/admin`
- `/admin/products`
- `/admin/products/categories`
- `/admin/orders`
- `/admin/customers`
- `/admin/marketing`
- `/admin/notifications`
- `/admin/settings`
- `/admin/reports`

## AI chatbot

Chatbot dùng route:

```txt
POST /api/chat
```

Luồng xử lý:

1. Client gửi message và history.
2. Server lấy sản phẩm liên quan từ Supabase.
3. Server gửi prompt + context sản phẩm sang OrcaRouter.
4. Nếu AI quá tải, fallback vẫn trả lời dựa trên dữ liệu Supabase.
5. Không gợi ý sản phẩm ngoài điều kiện nếu bộ lọc rõ ràng.

## AI Recommendation

Trang:

```txt
/ai-recommendation
```

API:

```txt
POST /api/ai-recommendation
```

Luồng xử lý:

1. Người dùng trả lời các câu hỏi về mục tiêu, nền tảng, phong cách, ngân sách.
2. Server lọc sản phẩm thật từ Supabase.
3. AI viết phần tư vấn/lộ trình.
4. Nếu không có sản phẩm khớp, hệ thống nói rõ là chưa có, không bịa sản phẩm.

## Thanh toán

Webhook SePay:

```txt
POST /api/webhooks/sepay
```

Sau thanh toán thành công, hệ thống có thể:

- Cập nhật trạng thái đơn hàng.
- Tạo license.
- Cho phép download.
- Gửi email nếu cấu hình Resend.

## Upload

Upload route:

```txt
POST /api/upload/[type]
```

Các type nhạy cảm nên yêu cầu admin đúng quyền.

## Deployment

Khuyến nghị deploy trên Vercel.

Checklist trước khi deploy:

- Đặt đầy đủ environment variables.
- Không deploy `.env.local`.
- Chạy `npm run build`.
- Kiểm tra Supabase RLS.
- Kiểm tra webhook URL production.
- Cập nhật `NEXT_PUBLIC_SITE_URL`.
- Kiểm tra OAuth redirect URL trong Supabase.
- Kiểm tra CORS/domain cho Cloudinary/ảnh remote nếu cần.

## Những việc nên rà tiếp

- Siết lại RLS cho các policy còn rộng.
- Thêm rate limit cho chatbot, login, contact, comment, upload.
- Rà `npm run lint` vì Next.js mới có thể cần cấu hình lint khác.
- Viết test cho checkout, license, download và affiliate.
- Tạo seed/demo data sạch cho public repo.
- Xóa hoặc thay asset không có bản quyền rõ ràng.
- Thêm license thương mại cho theme/source code nếu bán.

## License

Dự án này là marketplace/theme Shop Web rẻ. Nếu dùng để bán theme/source code, nên bổ sung file `LICENSE` và điều khoản rõ ràng cho:

- Regular License
- Extended License
- Developer/Agency License
- Chính sách không resale/re-upload/chia sẻ source trái phép

## Tác giả

Shop Web rẻ / Shop Web rẻ.

Built with Next.js, Supabase, Tailwind CSS và OrcaRouter/DeepSeek API.
