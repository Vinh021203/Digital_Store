import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const LANGUAGE_STORAGE_KEY = 'digital-store-language';

function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  return value === 'vi' || value === 'en';
}

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'vi';

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isSupportedLanguage(storedLanguage)) return storedLanguage;

  const browserLanguage = window.navigator.language?.split('-')[0];
  return isSupportedLanguage(browserLanguage) ? browserLanguage : 'vi';
}

// Define resources for DigitalMart - Digital Products Marketplace
const resources = {
  vi: {
    translation: {
      nav: {
        home: "Trang Chủ",
        products: "Cửa Hàng",
        news: "Blog",
        about: "Về Chúng Tôi",
        contact: "Hỗ Trợ",
        admin: "Quản Trị",
        login: "Đăng Nhập",
        logout: "Đăng Xuất",
        profile: "Hồ Sơ",
        orders: "Downloads",
        wishlist: "Yêu Thích",
        wishlist_count: "Đã Lưu",
        menu: "Danh mục",
        affiliate: "Affiliate"
      },
      hero: {
        collection: "Digital Products 2024",
        title: "Sản Phẩm Số Chất Lượng",
        subtitle: "Themes, Templates, Landing Pages và Mini Apps chuyên nghiệp cho dự án của bạn.",
        cta: "Khám Phá Ngay",
        kitchen_title: "UI/UX Templates",
        kitchen_cta: "Xem ngay",
        clean_title: "Landing Pages",
        clean_cta: "Khám phá"
      },
      features: {
        shipping: "Download Ngay Lập Tức",
        shipping_desc: "Nhận file qua Email trong 1 phút",
        genuine: "100% Bản Quyền",
        genuine_desc: "License chính hãng, hỗ trợ 6 tháng",
        return: "Sở Hữu Trọn Đời",
        return_desc: "Mua 1 lần, dùng mãi mãi"
      },
      flash_sale: {
        title: "FLASH SALE",
        ends_in: "Kết thúc sau",
        view_all: "Xem Tất Cả",
        hours: "Giờ",
        minutes: "Phút",
        seconds: "Giây"
      },
      sections: {
        categories: "Danh Mục Sản Phẩm",
        new_arrivals: "Sản Phẩm Mới",
        new_arrivals_desc: "Themes và templates mới nhất",
        view_more: "Xem thêm",
        promo: "Ưu đãi đặc biệt",
        promo_title: "Gói PRO\nTruy Cập Không Giới Hạn",
        promo_cta: "Nâng Cấp Ngay",
        blog_title: "Blog Chia Sẻ",
        newsletter: "Nhận Ưu Đãi Độc Quyền",
        newsletter_desc: "Đăng ký email để nhận thông báo về sản phẩm mới và mã giảm giá 20%.",
        newsletter_placeholder: "Email của bạn",
        subscribe: "Đăng Ký"
      },
      footer: {
        desc: "Marketplace sản phẩm số chất lượng cao. Themes, Templates, Landing Pages và Mini Apps.",
        quick_links: "Liên Kết",
        policy: "Chính Sách",
        categories: "Danh Mục",
        contact: "Liên Hệ",
        rights: "DigitalMart. All rights reserved."
      },
      product: {
        price: "Giá",
        rating: "đánh giá",
        sold: "Downloads",
        add_to_cart: "Thêm vào giỏ",
        buy_now: "Mua Ngay",
        desc: "Mô Tả",
        specs: "Thông Tin",
        reviews: "Đánh Giá",
        related: "Sản Phẩm Liên Quan"
      },
      common: {
        search_placeholder: "Tìm themes, templates...",
        filter: "Bộ Lọc",
        sort: "Sắp xếp",
        popular: "Phổ biến nhất",
        price_asc: "Giá: Thấp → Cao",
        price_desc: "Giá: Cao → Thấp",
        name_asc: "Tên: A-Z"
      },
      affiliate: {
        title: "Chương Trình Affiliate",
        subtitle: "Kiếm tiền bằng cách giới thiệu sản phẩm",
        join_btn: "Tham Gia Ngay",
        login_to_join: "Đăng Nhập Để Tham Gia",
        dashboard_title: "Dashboard Affiliate",
        earnings: "Tổng Hoa Hồng",
        clicks: "Lượt Click",
        orders: "Đơn Giới Thiệu",
        conversion: "Tỉ Lệ Chuyển Đổi",
        your_link: "Link Giới Thiệu",
        copy: "Sao chép",
        history: "Lịch Sử",
        pending: "Chờ duyệt",
        approved: "Đã duyệt",
        paid: "Đã thanh toán"
      },
      checkout: {
        title: "Thanh Toán",
        step1: "Thông tin",
        step2: "Thanh toán",
        step3: "Hoàn tất",
        name: "Họ và tên",
        email: "Email nhận sản phẩm",
        email_note: "File và license key sẽ được gửi đến email này",
        payment_method: "Phương thức thanh toán",
        bank_transfer: "Chuyển khoản ngân hàng",
        card: "Thẻ tín dụng / MoMo",
        total: "Tổng cộng",
        pay_now: "Thanh Toán Ngay",
        instant_download: "Download ngay sau thanh toán",
        secure: "Thanh toán bảo mật SSL"
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: "Home",
        products: "Store",
        news: "Blog",
        about: "About Us",
        contact: "Support",
        admin: "Admin",
        login: "Login",
        logout: "Logout",
        profile: "Profile",
        orders: "Downloads",
        wishlist: "Wishlist",
        wishlist_count: "Saved",
        menu: "Categories",
        affiliate: "Affiliate"
      },
      hero: {
        collection: "Digital Products 2024",
        title: "Premium Digital Products",
        subtitle: "Professional Themes, Templates, Landing Pages and Mini Apps for your projects.",
        cta: "Explore Now",
        kitchen_title: "UI/UX Templates",
        kitchen_cta: "View now",
        clean_title: "Landing Pages",
        clean_cta: "Explore"
      },
      features: {
        shipping: "Instant Download",
        shipping_desc: "Get files via Email in 1 minute",
        genuine: "100% Licensed",
        genuine_desc: "Genuine license, 6 months support",
        return: "Lifetime Access",
        return_desc: "Buy once, use forever"
      },
      flash_sale: {
        title: "FLASH SALE",
        ends_in: "Ends in",
        view_all: "View All",
        hours: "Hours",
        minutes: "Minutes",
        seconds: "Seconds"
      },
      sections: {
        categories: "Product Categories",
        new_arrivals: "New Products",
        new_arrivals_desc: "Latest themes and templates",
        view_more: "View more",
        promo: "Special Offer",
        promo_title: "PRO Package\nUnlimited Access",
        promo_cta: "Upgrade Now",
        blog_title: "Blog",
        newsletter: "Get Exclusive Offers",
        newsletter_desc: "Subscribe to receive new product alerts and 20% discount code.",
        newsletter_placeholder: "Your email",
        subscribe: "Subscribe"
      },
      footer: {
        desc: "Premium digital products marketplace. Themes, Templates, Landing Pages and Mini Apps.",
        quick_links: "Quick Links",
        policy: "Policies",
        categories: "Categories",
        contact: "Contact",
        rights: "DigitalMart. All rights reserved."
      },
      product: {
        price: "Price",
        rating: "reviews",
        sold: "Downloads",
        add_to_cart: "Add to Cart",
        buy_now: "Buy Now",
        desc: "Description",
        specs: "Details",
        reviews: "Reviews",
        related: "Related Products"
      },
      common: {
        search_placeholder: "Search themes, templates...",
        filter: "Filter",
        sort: "Sort",
        popular: "Most Popular",
        price_asc: "Price: Low to High",
        price_desc: "Price: High to Low",
        name_asc: "Name: A-Z"
      },
      affiliate: {
        title: "Affiliate Program",
        subtitle: "Earn money by referring products",
        join_btn: "Join Now",
        login_to_join: "Login to Join",
        dashboard_title: "Affiliate Dashboard",
        earnings: "Total Earnings",
        clicks: "Clicks",
        orders: "Referral Orders",
        conversion: "Conversion Rate",
        your_link: "Referral Link",
        copy: "Copy",
        history: "History",
        pending: "Pending",
        approved: "Approved",
        paid: "Paid"
      },
      checkout: {
        title: "Checkout",
        step1: "Information",
        step2: "Payment",
        step3: "Complete",
        name: "Full Name",
        email: "Email for delivery",
        email_note: "Files and license keys will be sent to this email",
        payment_method: "Payment Method",
        bank_transfer: "Bank Transfer",
        card: "Credit Card / MoMo",
        total: "Total",
        pay_now: "Pay Now",
        instant_download: "Instant download after payment",
        secure: "Secure SSL payment"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: "vi",
    supportedLngs: SUPPORTED_LANGUAGES,
    cleanCode: true,
    returnEmptyString: false,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

i18n.on('languageChanged', (language) => {
  if (typeof window !== 'undefined' && isSupportedLanguage(language)) {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
}

export default i18n;
