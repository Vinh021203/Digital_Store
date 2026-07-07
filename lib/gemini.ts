// lib/gemini.ts - Gemini chatbot with Supabase product context
import { fetchActiveProducts } from './products';

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

export interface ChatHistoryMessage {
    sender: 'user' | 'bot';
    text: string;
}

interface ChatProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string;
    rating: number;
    format?: string;
    category?: string;
    description?: string;
}

interface ProductSearchResult {
    products: ChatProduct[];
    hasHardFilters: boolean;
    hasExactMatches: boolean;
    maxPrice: number | null;
    keywords: string[];
}

const GEMINI_MODELS = (process.env.GEMINI_MODEL || 'gemini-2.5-flash,gemini-2.5-flash-lite')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

const QUICK_REPLIES = {
    greeting: ['Tìm Landing Page', 'Xem Theme phổ biến', 'Nhận tư vấn'],
    product: ['Xem thêm mẫu demo', 'Hỏi về license', 'Nhận báo giá'],
    support: ['Tư vấn mẫu demo', 'Hỏi về license', 'Liên hệ hotline'],
};

const FALLBACK_MESSAGES = {
    default: `Mình có thể giúp bạn tìm themes, templates, landing pages, xem demo, hỏi license và nhận tư vấn theo nhu cầu. Bạn đang cần mẫu demo kiểu nào?`,
    payment: `Website đang ưu tiên chế độ portfolio/demo tư vấn. Bạn có thể gửi mẫu quan tâm, ngân sách và công nghệ mong muốn để mình hỗ trợ báo giá hoặc hướng dẫn bước tiếp theo.`,
    download: `Hiện website đang ở chế độ portfolio/demo tư vấn nên chưa mở tải file trực tiếp. Nếu bạn đã có đơn trước đó, hãy gửi mã đơn hoặc email để được kiểm tra quyền truy cập.`,
    refund: `Chính sách xử lý yêu cầu thường được xét theo từng yêu cầu, đặc biệt nếu mẫu demo chưa được tải xuống hoặc không đúng mô tả. Bạn nên gửi mã yêu cầu và lý do để được hỗ trợ nhanh hơn.`,
    license: `Regular License thường phù hợp cho một website/dự án. Extended License phù hợp khi cần dùng rộng hơn. Nếu bạn cho mình biết nhu cầu triển khai, mình sẽ gợi ý loại license hợp lý.`,
    support: `Bạn có thể liên hệ hỗ trợ qua email hoặc chat này. Hãy gửi rõ mã yêu cầu, email gửi yêu cầu và vấn đề đang gặp để được xử lý nhanh hơn.`,
};

function matchIntent(message: string) {
    const lower = message.toLowerCase();
    if (/(xác nhận tư vấn|payment|trả tiền|momo|bank|chuyển khoản|qr)/i.test(lower)) return 'payment';
    if (/(download|tải|file|nhận file)/i.test(lower)) return 'download';
    if (/(xử lý yêu cầu|refund|đổi trả)/i.test(lower)) return 'refund';
    if (/(license|bản quyền|giấy phép|key)/i.test(lower)) return 'license';
    if (/(hỗ trợ|support|liên hệ|contact|help)/i.test(lower)) return 'support';
    if (/(theme|template|landing|dashboard|admin|shop|store|figma|html|css|javascript|react|next|vue|laravel|django|dotnet|portfolio|mẫu demo|giao diện|mẫu)/i.test(lower)) return 'product';
    if (/(chào|hello|hi|xin chào|hey|alo)/i.test(lower)) return 'greeting';
    return 'default';
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

function normalizeText(value: string) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd');
}

function parseBudget(message: string) {
    const normalized = normalizeText(message).replace(/\s+/g, ' ');
    const budgetMatch = normalized.match(/(?:duoi|toi da|max|<=|nho hon|khong qua)\s*(\d+(?:[.,]\d+)?)\s*(k|nghin|ngan|trieu|m|000)?/);
    if (!budgetMatch) return null;

    const amount = Number(budgetMatch[1].replace(',', '.'));
    const unit = budgetMatch[2] || '';

    if (!Number.isFinite(amount)) return null;
    if (unit === 'trieu' || unit === 'm') return Math.round(amount * 1_000_000);
    if (unit === 'k' || unit === 'nghin' || unit === 'ngan') return Math.round(amount * 1_000);
    return amount < 10_000 ? Math.round(amount * 1_000) : Math.round(amount);
}

function parseProductFilters(message: string) {
    const normalized = normalizeText(message);
    const keywords: string[] = [];

    if (normalized.includes('landing') || normalized.includes('trang dich')) keywords.push('landing');
    if (normalized.includes('dashboard') || normalized.includes('admin') || normalized.includes('quan tri')) keywords.push('dashboard', 'admin');
    if (normalized.includes('shop') || normalized.includes('store') || normalized.includes('ecommerce') || normalized.includes('ban hang')) keywords.push('shop', 'store', 'ecommerce');
    if (normalized.includes('figma')) keywords.push('figma', 'ui kit');
    if (normalized.includes('vue')) keywords.push('vue', 'vue.js');
    if (normalized.includes('laravel')) keywords.push('laravel', 'php');
    if (normalized.includes('django')) keywords.push('django', 'python');
    if (normalized.includes('.net') || normalized.includes('dotnet')) keywords.push('.net', 'asp.net');
    if (normalized.includes('react') || normalized.includes('next')) keywords.push('react', 'next');
    if (normalized.includes('portfolio') || normalized.includes('cv')) keywords.push('portfolio', 'cv');
    if (normalized.includes('figma')) keywords.push('figma');

    return {
        maxPrice: parseBudget(message),
        keywords,
    };
}

function productHaystack(product: any) {
    return normalizeText([
        product.name,
        product.description,
        product.format,
        product.category,
        product.author,
        ...(product.tags || []),
    ].join(' '));
}

function matchesFilters(product: any, filters: ReturnType<typeof parseProductFilters>) {
    if (filters.maxPrice !== null && Number(product.price || 0) > filters.maxPrice) {
        return false;
    }

    if (filters.keywords.length === 0) return true;

    const haystack = productHaystack(product);
    return filters.keywords.some((keyword) => haystack.includes(keyword));
}

function scoreProduct(product: any, message: string, filters: ReturnType<typeof parseProductFilters>) {
    const haystack = productHaystack(product);
    const words = message
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length >= 3);

    let score = Number(product.rating || 0);
    words.forEach((word) => {
        if (haystack.includes(word)) score += 3;
    });
    filters.keywords.forEach((keyword) => {
        if (haystack.includes(keyword)) score += 8;
    });
    if (filters.maxPrice !== null && Number(product.price || 0) <= filters.maxPrice) score += 6;
    if (product.is_featured) score += 2;
    if (product.is_bestseller) score += 2;
    return score;
}

async function getRelevantProducts(message: string) {
    try {
        const filters = parseProductFilters(message);
        const products = await fetchActiveProducts({ limit: 40 });
        const filteredProducts = products.filter((product) => matchesFilters(product, filters));
        const hasHardFilters = filters.maxPrice !== null || filters.keywords.length > 0;
        const sourceProducts = filteredProducts.length > 0 || hasHardFilters ? filteredProducts : products;

        const mappedProducts = sourceProducts
            .map((product) => ({ product, score: scoreProduct(product, message, filters) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map(({ product }) => ({
                id: product.id,
                name: product.name,
                slug: product.slug || String(product.id),
                price: product.price,
                image: product.image || '',
                rating: product.rating || 5,
                format: product.format,
                category: product.category,
                description: product.description,
            }));

        return {
            products: mappedProducts,
            hasHardFilters,
            hasExactMatches: mappedProducts.length > 0,
            maxPrice: filters.maxPrice,
            keywords: filters.keywords,
        };
    } catch (error) {
        console.error('Error fetching chatbot products:', error);
        return {
            products: [],
            hasHardFilters: false,
            hasExactMatches: false,
            maxPrice: null,
            keywords: [],
        };
    }
}

function buildPrompt(userMessage: string, history: ChatHistoryMessage[], searchResult: ProductSearchResult) {
    const historyText = history
        .slice(-6)
        .map((item) => `${item.sender === 'user' ? 'Khách' : 'Trợ lý'}: ${item.text}`)
        .join('\n');

    const productText = searchResult.products.length
        ? searchResult.products
            .map((product, index) => (
                `${index + 1}. ${product.name} | ${product.format || 'Template'} | ${formatPrice(product.price)} | rating ${product.rating} | /product/${product.slug}`
            ))
            .join('\n')
        : 'Không có mẫu demo nào khớp đúng điều kiện lọc của khách.';

    const filterText = [
        searchResult.maxPrice !== null ? `Giá tối đa: ${formatPrice(searchResult.maxPrice)}` : null,
        searchResult.keywords.length > 0 ? `Từ khóa/loại mẫu demo: ${searchResult.keywords.join(', ')}` : null,
    ].filter(Boolean).join('\n') || 'Không có bộ lọc rõ ràng.';

    return `
Bạn là trợ lý AI của Web Giá Rẻ - Portfolio, một website portfolio/demo giao diện website như theme, template, landing page, dashboard và UI kit.

Yêu cầu:
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn, tự nhiên.
- Chỉ tư vấn dựa trên thông tin website và danh sách mẫu demo bên dưới.
- Nếu khách hỏi chọn mẫu demo, hãy gợi ý 1-3 mẫu phù hợp và nói lý do ngắn.
- Nếu danh sách mẫu demo bên dưới rỗng, phải nói rõ hiện chưa có mẫu demo khớp điều kiện. Không gợi ý mẫu demo ngoài điều kiện.
- Không bịa chính sách. Nếu không chắc, hướng dẫn khách liên hệ hỗ trợ hoặc vào trang tài khoản.
- Không nhắc rằng bạn là Gemini hay mô hình AI.
- Không dùng markdown phức tạp, chỉ dùng đoạn văn ngắn hoặc bullet đơn giản.

Lịch sử gần nhất:
${historyText || 'Chưa có.'}

Bộ lọc hiểu được từ câu hỏi:
${filterText}

Mẫu demo liên quan từ Supabase:
${productText}

Câu hỏi của khách:
${userMessage}
`.trim();
}

export async function generateGeminiText(prompt: string, maxOutputTokens = 420) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) return null;

    let lastError: unknown = null;

    for (const model of GEMINI_MODELS) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.45,
                    topP: 0.9,
                    maxOutputTokens,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            lastError = new Error(data?.error?.message || `Gemini API error on ${model}`);
            if ([429, 500, 502, 503, 504].includes(response.status)) {
                console.warn(`Gemini model ${model} unavailable, trying fallback if available.`);
                continue;
            }

            console.error('Gemini API error:', data);
            throw lastError;
        }

        return data?.candidates?.[0]?.content?.parts
            ?.map((part: { text?: string }) => part.text || '')
            .join('')
            .trim() || null;
    }

    throw lastError instanceof Error ? lastError : new Error('Gemini API unavailable');
}

function filterSummary(searchResult: ProductSearchResult) {
    const parts = [];
    if (searchResult.keywords.length > 0) parts.push(searchResult.keywords[0]);
    if (searchResult.maxPrice !== null) parts.push(`dưới ${formatPrice(searchResult.maxPrice)}`);
    return parts.length > 0 ? parts.join(' ') : 'điều kiện bạn đưa ra';
}

function toProductCards(products: ChatProduct[]) {
    return products.slice(0, 3).map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        rating: product.rating,
    }));
}

function fallbackResponse(intent: string, searchResult: ProductSearchResult): ChatResponse {
    if (intent === 'product' && searchResult.products.length > 0) {
        return {
            message: `Mình tìm thấy vài mẫu demo khá hợp với nhu cầu của bạn. Bạn xem nhanh các lựa chọn này nhé:`,
            products: toProductCards(searchResult.products),
            quickReplies: QUICK_REPLIES.product,
        };
    }

    if (intent === 'product' && searchResult.hasHardFilters && !searchResult.hasExactMatches) {
        return {
            message: `Hiện mình chưa thấy mẫu demo nào khớp đúng ${filterSummary(searchResult)} trong kho Web Giá Rẻ - Portfolio. Bạn có thể nới ngân sách hoặc đổi loại mẫu demo để mình tìm tiếp nhé.`,
            quickReplies: ['Nới ngân sách', 'Tìm loại khác', 'Xem mẫu demo phổ biến'],
        };
    }

    return {
        message: FALLBACK_MESSAGES[intent as keyof typeof FALLBACK_MESSAGES] || FALLBACK_MESSAGES.default,
        products: toProductCards(searchResult.products),
        quickReplies: intent === 'support' ? QUICK_REPLIES.support : QUICK_REPLIES.greeting,
    };
}

export async function chatWithGemini(
    userMessage: string,
    history: ChatHistoryMessage[] = []
): Promise<ChatResponse> {
    const intent = matchIntent(userMessage);
    const searchResult = await getRelevantProducts(userMessage);
    const productCards = toProductCards(searchResult.products);

    try {
        const prompt = buildPrompt(userMessage, history, searchResult);
        const message = await generateGeminiText(prompt);

        if (message) {
            return {
                message,
                products: intent === 'product' ? productCards : undefined,
                quickReplies: intent === 'product' ? QUICK_REPLIES.product : QUICK_REPLIES.greeting,
            };
        }
    } catch (error) {
        console.error('Gemini chatbot fallback:', error);
    }

    return fallbackResponse(intent, searchResult);
}
