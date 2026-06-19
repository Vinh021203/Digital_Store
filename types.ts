export interface Product {
  id: number;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  gallery?: string[]; // Product gallery images
  rating: number;
  reviews: number;
  reviews_count?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  author: string; // Creator/Designer name
  format: 'Theme' | 'Landing' | 'Template' | 'MiniApp' | 'Bundle';
  duration?: string; // Repurposed for "Last Updated" or version info
  students?: number; // Repurposed for "Downloads" count
  downloads_count?: number; // Actual downloads count
  lessons?: number; // Repurposed for "Files Included" count
  publisher?: string;
  publishDate?: string;
  language?: string;
  pages?: number; // Repurposed for file size or page count
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  tags?: string[];
  // Digital Product Specific Fields
  demoUrl?: string;
  downloadLink?: string;
  fileFormat?: string; // e.g., "HTML, CSS, JS" or "Figma, Sketch"
  compatibility?: string; // e.g., "React 18+, Next.js 15+, Node.js 20+"
  version?: string;
  features?: string[];
  techStack?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  licenseType?: 'Regular' | 'Extended' | 'Unlimited';
  dbId?: number; // Database row ID for sync
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'instructor';
  avatar?: string;
  phone?: string;
  address?: string;
  isAffiliate?: boolean;
  affiliateCode?: string;
  joinDate?: string;
  totalSpent?: number;
  totalOrders?: number;
}

export interface OrderItem {
  productId?: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
  format?: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Shipped' | 'Cancelled' | 'Refunded';
  customer: string;
  customerId?: number;
  customerEmail?: string;
  customerPhone?: string;
  items: OrderItem[];
  // Payment Information
  paymentMethod: 'VNPay' | 'Momo' | 'Bank Transfer' | 'COD' | 'Credit Card' | 'Zalopay';
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  transactionId?: string;
  paidAt?: string;
  // Shipping Information
  shippingAddress?: string;
  shippingMethod?: 'Standard' | 'Express' | 'Digital';
  shippingFee?: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  // Discount & Tax
  discountCode?: string;
  discountAmount?: number;
  taxAmount?: number;
  subtotal?: number;
  // Affiliate
  affiliateCode?: string;
  commission?: number;
  // Notes
  note?: string;
  cancelReason?: string;
  refundReason?: string;
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface AffiliateTransaction {
  id: string;
  date: string;
  orderId: string;
  amount: number; // Commission amount
  orderValue: number; // Total order value
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  productName: string;
  customerName?: string;
  paymentDate?: string;
}

export interface AffiliateStats {
  totalEarnings: number;
  pendingBalance: number;
  paidBalance: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  transactions: AffiliateTransaction[];
  thisMonthEarnings?: number;
  lastMonthEarnings?: number;
}

// Admin CMS Types
export interface InventoryItem {
  id: string;
  productId: number;
  productName: string;
  sku: string;
  category: 'course' | 'ebook' | 'book' | 'audiobook' | 'combo';
  stock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  supplier: string;
  lastUpdated: string;
  reorderLevel?: number;
  warehouseLocation?: string;
  cost?: number;
}

export interface Review {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  userId?: number;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  helpful?: number;
  isVerifiedPurchase?: boolean;
  images?: string[];
  reply?: {
    author: string;
    content: string;
    date: string;
  };
}

export interface Post {
  id: number;
  author: string;
  authorId?: number;
  avatar: string;
  time: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  tags: string[];
  image?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isPinned?: boolean;
  category?: string;
  views?: number;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  readTime: string;
  views: number;
  featured: boolean;
  likes?: number;
  comments?: number;
  slug?: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'payment' | 'shipping' | 'review' | 'system' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  icon?: string;
  userId?: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  status: 'active' | 'inactive' | 'expired';
  applicableProducts?: number[];
  applicableCategories?: string[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'VNPay' | 'Momo' | 'Bank Transfer' | 'COD' | 'Credit Card' | 'Zalopay';
  icon: string;
  isActive: boolean;
  description?: string;
  fee?: number;
  processingTime?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  provider: string;
  estimatedDays: string;
  cost: number;
  isActive: boolean;
  description?: string;
  trackingSupport: boolean;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
  pendingOrders: number;
  lowStockItems: number;
  pendingReviews: number;
  activeAffiliates: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface TopProduct {
  productId: number;
  name: string;
  image: string;
  sales: number;
  revenue: number;
  growth: number;
}

export interface TopCustomer {
  userId: number;
  name: string;
  avatar?: string;
  totalSpent: number;
  totalOrders: number;
  lastOrderDate: string;
}

// Course Learning Types
export type LessonType = 'video' | 'doc' | 'quiz' | 'assignment' | 'live';

export interface Lesson {
  id: number;
  title: string;
  type: LessonType;
  duration: string;
  isCompleted: boolean;
  isFree: boolean;
  description?: string;
  videoUrl?: string;
  docUrl?: string;
}

export interface CourseSection {
  id: number;
  title: string;
  duration: string;
  lessons: Lesson[];
  isExpanded?: boolean;
}

export interface CourseProgress {
  userId: number;
  courseId: number;
  completedLessons: number[];
  totalLessons: number;
  progressPercentage: number;
  lastAccessedLesson?: number;
  enrolledDate: string;
  lastStudiedDate?: string;
  certificateIssued?: boolean;
}

// Wishlist
export interface WishlistItem {
  userId: number;
  productId: number;
  addedDate: string;
}

// Address Book
export interface Address {
  id: string;
  userId: number;
  fullName: string;
  phone: string;
  address: string;
  ward?: string;
  district?: string;
  city: string;
  country: string;
  isDefault: boolean;
  type?: 'home' | 'office' | 'other';
}

// Analytics
export interface AnalyticsEvent {
  id: string;
  userId?: number;
  sessionId: string;
  event: 'page_view' | 'add_to_cart' | 'purchase' | 'search' | 'click';
  page?: string;
  productId?: number;
  query?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ============================================
// DATABASE TYPES (Consolidated from types/database.ts)
// ============================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  parent_id: number | null;
  created_at: string;
}

export interface ProductFile {
  id: number;
  product_id: number;
  version: string;
  file_url: string;
  file_size: number;
  changelog: string;
  created_at: string;
}

export interface License {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  order_item_id: number;
  license_key: string;
  type: 'Regular' | 'Extended' | 'Unlimited';
  status: 'active' | 'expired' | 'revoked';
  activations_used: number;
  activations_limit: number;
  domain?: string;
  activated_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface Download {
  id: number;
  user_id: number;
  product_id: number;
  license_id: number;
  file_version: string;
  ip_address?: string;
  downloaded_at: string;
}

export interface PurchasedProduct {
  id: number;
  user_id: number;
  product_id: number;
  name: string;
  image: string;
  format: string;
  purchase_date: string;
  version: string;
  license_key: string;
  download_count: number;
  last_download?: string;
  has_update: boolean;
}

export interface FAQ {
  id: number;
  product_id: number | null;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Ticket {
  id: string;
  user_id: number;
  product_id?: number;
  product_name?: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages_count: number;
  last_reply: string;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: string;
  sender_id: number;
  sender_name: string;
  sender_avatar?: string;
  is_staff: boolean;
  message: string;
  attachments?: string[];
  created_at: string;
}

export interface Seller {
  id: number;
  user_id: number;
  store_name: string;
  store_slug: string;
  description: string;
  logo: string;
  banner?: string;
  rating: number;
  total_sales: number;
  total_products: number;
  total_earnings: number;
  balance: number;
  status: 'active' | 'pending' | 'suspended';
  is_verified: boolean;
  joined_at: string;
  created_at: string;
}

export interface SellerPayout {
  id: number;
  seller_id: number;
  amount: number;
  fee: number;
  net_amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  notes?: string;
  created_at: string;
  processed_at?: string;
}

export interface Transaction {
  id: number;
  order_id: number;
  seller_id: number;
  buyer_id: number;
  buyer_name: string;
  product_id: number;
  product_name: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: 'pending' | 'completed' | 'refunded' | 'withdrawn';
  created_at: string;
}

export interface AffiliateReferral {
  id: number;
  referrer_id: number;
  referred_id: number;
  referred_name: string;
  order_id: number | null;
  commission: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  created_at: string;
}

export interface AffiliateWithdrawal {
  id: number;
  user_id: number;
  amount: number;
  method: string;
  account_info: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  notes?: string;
  created_at: string;
  processed_at?: string;
}

export interface CommunityPost {
  id: number;
  author_id: number;
  author_name: string;
  author_avatar: string;
  title: string;
  content: string;
  image?: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: number;
  post_id: number;
  author_id: number;
  author_name: string;
  author_avatar: string;
  content: string;
  likes_count: number;
  parent_id: number | null;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user_name: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'download' | 'login' | 'logout' | 'export' | 'settings';
  entity: 'product' | 'order' | 'user' | 'coupon' | 'settings' | 'system';
  entity_id?: string;
  entity_name?: string;
  details?: string;
  ip_address?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
}

export interface PendingProduct {
  id: number;
  seller_id: number;
  seller_name: string;
  name: string;
  category: string;
  format: string;
  price: number;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by?: number;
  reviewed_at?: string;
}

// ============================================
// LEGACY TYPES (For backward compatibility)
// ============================================

export interface LegacyLicense {
  id: number;
  productName: string;
  licenseKey: string;
  type: 'Regular' | 'Extended' | 'Unlimited';
  status: 'Active' | 'Expired' | 'Revoked';
  activatedOn: string;
  expiresOn?: string;
  domain?: string;
  activationsUsed: number;
  activationsLimit: number;
}

export interface LegacyPurchasedProduct {
  id: number;
  name: string;
  image: string;
  format: string;
  purchaseDate: string;
  version: string;
  licenseKey: string;
  downloadCount: number;
  lastDownload?: string;
  hasUpdate?: boolean;
}

export interface LegacyTicket {
  id: string;
  subject: string;
  product: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastReply: string;
  messages: number;
}
