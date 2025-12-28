// lib/gemini.ts - Smart Rule-based Chatbot
import { fetchActiveProducts } from './products';
import type { Product } from '@/types';

export interface ChatResponse {
    message: string;
    products?: Array<{
        id: number;
        name: string;
        slug: string;
        price: number;
        image: string;
        rating: number;
    }>;
    quickReplies?: string[];
}

// Intent patterns for better matching
const INTENTS = {
    greeting: ['chào', 'hello', 'hi', 'xin chào', 'hey', 'alo'],
    thanks: ['cảm ơn', 'thank', 'thanks', 'tks'],
    payment: ['thanh toán', 'payment', 'trả tiền', 'mua', 'giá', 'price', 'momo', 'chuyển khoản', 'bank'],
    download: ['download', 'tải', 'tải xuống', 'lấy file', 'nhận file'],
    refund: ['hoàn tiền', 'refund', 'trả lại', 'đổi trả'],
    license: ['license', 'bản quyền', 'giấy phép', 'key'],
    support: ['hỗ trợ', 'support', 'liên hệ', 'contact', 'giúp', 'help'],
    productSearch: ['theme', 'template', 'landing', 'tìm', 'sản phẩm', 'product', 'mẫu', 'giao diện'],
    landing: ['landing', 'landing page', 'trang đích'],
    dashboard: ['dashboard', 'admin', 'quản trị', 'backend'],
    ecommerce: ['shop', 'bán hàng', 'ecommerce', 'store', 'cửa hàng'],
    wordpress: ['wordpress', 'wp'],
    react: ['react', 'nextjs', 'next.js', 'vue'],
    portfolio: ['portfolio', 'cv', 'resume', 'giới thiệu'],
};

// Response templates with personality
const RESPONSE_TEMPLATES = {
    greeting: [
        'Xin chào bạn! 👋 Mình là trợ lý của DigitalMart. Bạn đang tìm kiếm themes, templates nào? Mình sẽ giúp bạn tìm sản phẩm phù hợp nhất!',
        'Chào bạn! Rất vui được hỗ trợ bạn hôm nay. Bạn cần tìm gì: Landing Page, Dashboard, hay Theme WordPress?',
    ],
    thanks: [
        'Không có gì đâu! 😊 Rất vui được hỗ trợ bạn. Nếu cần thêm gì cứ hỏi mình nhé!',
        'Cảm ơn bạn đã tin tưởng DigitalMart! Chúc bạn có sản phẩm ưng ý! 🎉',
    ],
    payment: `💳 **Phương thức thanh toán:**

• **Chuyển khoản ngân hàng** - Nhanh nhất, có QR code
• **MoMo / ZaloPay** - Tiện lợi, xác nhận tự động
• **Thẻ quốc tế** - Visa, Mastercard

✅ Sau thanh toán, bạn nhận link download ngay qua email (trong 1-5 phút)!

Bạn muốn thanh toán sản phẩm nào?`,
    download: `📥 **Hướng dẫn Download:**

1. Đăng nhập tài khoản
2. Vào **Menu → Downloads** hoặc **Profile → My Downloads**
3. Click nút Download bên cạnh sản phẩm

💡 **Mẹo:** Kiểm tra email - Link download cũng được gửi tự động sau thanh toán!

Bạn gặp vấn đề gì với việc download không?`,
    refund: `💰 **Chính sách hoàn tiền:**

• Hoàn tiền trong **7 ngày** nếu sản phẩm không đúng mô tả
• Chưa download file → Hoàn 100%
• Đã download → Xem xét từng trường hợp

📧 Gửi yêu cầu đến: **veutong961@gmail.com**
Kèm theo: Mã đơn hàng + Lý do

Mình có thể hỗ trợ bạn gửi yêu cầu hoàn tiền không?`,
    license: `📄 **Thông tin License:**

• **Regular License** - 1 website thương mại
• **Extended License** - Không giới hạn dự án

✅ Tất cả license đều bao gồm:
• Lifetime updates miễn phí
• Hỗ trợ kỹ thuật 6 tháng
• Source code đầy đủ

Bạn muốn biết thêm về loại license nào?`,
    support: `🆘 **Kênh hỗ trợ:**

📧 Email: **veutong961@gmail.com** (phản hồi trong 24h)
📞 Hotline: **0971 386 588** (8h-22h hàng ngày)
💬 Chat này - Mình sẵn sàng hỗ trợ!

Bạn cần hỗ trợ vấn đề gì?`,
    productNotFound: 'Hmm, mình chưa tìm thấy sản phẩm phù hợp. Bạn có thể mô tả chi tiết hơn không? Ví dụ: "Landing page cho startup công nghệ" hoặc "Theme shop bán quần áo".',
    default: `Cảm ơn bạn đã liên hệ! 😊

Mình có thể giúp bạn:
• 🔍 Tìm themes, templates, landing pages
• 💳 Hướng dẫn thanh toán
• 📥 Hỗ trợ download
• 📄 Giải đáp về license

Bạn muốn tìm hiểu về vấn đề nào?`,
};

// Quick reply suggestions
const QUICK_REPLIES = {
    greeting: ['Tìm Landing Page', 'Xem Theme phổ biến', 'Hỏi về thanh toán'],
    product: ['Xem thêm sản phẩm', 'Hỏi về license', 'Cách thanh toán'],
    support: ['Hỗ trợ download', 'Chính sách hoàn tiền', 'Liên hệ hotline'],
};

// Check which intent matches
function matchIntent(message: string): string | null {
    const lower = message.toLowerCase();
    for (const [intent, keywords] of Object.entries(INTENTS)) {
        if (keywords.some(kw => lower.includes(kw))) {
            return intent;
        }
    }
    return null;
}

// Get random response from array
function getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export async function chatWithGemini(userMessage: string): Promise<ChatResponse> {
    const intent = matchIntent(userMessage);
    const lowerMsg = userMessage.toLowerCase();

    // Greeting
    if (intent === 'greeting') {
        return {
            message: getRandom(RESPONSE_TEMPLATES.greeting),
            quickReplies: QUICK_REPLIES.greeting,
        };
    }

    // Thanks
    if (intent === 'thanks') {
        return {
            message: getRandom(RESPONSE_TEMPLATES.thanks),
        };
    }

    // Payment
    if (intent === 'payment') {
        return {
            message: RESPONSE_TEMPLATES.payment,
            quickReplies: ['Xem sản phẩm', 'Hỗ trợ thanh toán'],
        };
    }

    // Download
    if (intent === 'download') {
        return {
            message: RESPONSE_TEMPLATES.download,
            quickReplies: ['Không thấy file', 'Liên hệ hỗ trợ'],
        };
    }

    // Refund
    if (intent === 'refund') {
        return {
            message: RESPONSE_TEMPLATES.refund,
        };
    }

    // License
    if (intent === 'license') {
        return {
            message: RESPONSE_TEMPLATES.license,
        };
    }

    // Support
    if (intent === 'support') {
        return {
            message: RESPONSE_TEMPLATES.support,
            quickReplies: QUICK_REPLIES.support,
        };
    }

    // Product search intents
    if (intent === 'productSearch' || intent === 'landing' || intent === 'dashboard' ||
        intent === 'ecommerce' || intent === 'wordpress' || intent === 'react' || intent === 'portfolio') {
        try {
            const products = await fetchActiveProducts({ limit: 30 });
            let filtered = [...products];
            let categoryName = 'phù hợp';

            // Smart filtering based on intent
            if (intent === 'landing' || lowerMsg.includes('landing')) {
                filtered = products.filter(p =>
                    p.format === 'Landing' ||
                    p.name.toLowerCase().includes('landing') ||
                    p.category?.toLowerCase().includes('landing')
                );
                categoryName = 'Landing Page';
            } else if (intent === 'dashboard' || lowerMsg.includes('admin')) {
                filtered = products.filter(p =>
                    p.name.toLowerCase().includes('dashboard') ||
                    p.name.toLowerCase().includes('admin') ||
                    p.category?.toLowerCase().includes('admin')
                );
                categoryName = 'Dashboard/Admin';
            } else if (intent === 'ecommerce') {
                filtered = products.filter(p =>
                    p.category?.toLowerCase().includes('ecommerce') ||
                    p.name.toLowerCase().includes('shop') ||
                    p.name.toLowerCase().includes('store')
                );
                categoryName = 'E-commerce';
            } else if (intent === 'wordpress') {
                filtered = products.filter(p =>
                    p.name.toLowerCase().includes('wordpress') ||
                    p.format === 'Theme'
                );
                categoryName = 'WordPress';
            } else if (intent === 'react') {
                filtered = products.filter(p =>
                    p.name.toLowerCase().includes('react') ||
                    p.name.toLowerCase().includes('next')
                );
                categoryName = 'React/Next.js';
            } else if (intent === 'portfolio') {
                filtered = products.filter(p =>
                    p.name.toLowerCase().includes('portfolio') ||
                    p.name.toLowerCase().includes('cv')
                );
                categoryName = 'Portfolio';
            }

            // Fallback to top rated if no match
            if (filtered.length === 0) {
                filtered = products.slice(0, 10);
                categoryName = 'phổ biến';
            }

            // Get top 3 by rating
            const topProducts = filtered
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 3)
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug || String(p.id),
                    price: p.price,
                    image: p.image || '',
                    rating: p.rating || 5,
                }));

            if (topProducts.length > 0) {
                return {
                    message: `🎯 Đây là **${topProducts.length} ${categoryName}** được đánh giá cao nhất:`,
                    products: topProducts,
                    quickReplies: QUICK_REPLIES.product,
                };
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }

        return {
            message: RESPONSE_TEMPLATES.productNotFound,
            quickReplies: ['Landing Page', 'Dashboard', 'WordPress Theme'],
        };
    }

    // Default response
    return {
        message: RESPONSE_TEMPLATES.default,
        quickReplies: QUICK_REPLIES.greeting,
    };
}
