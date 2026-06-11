import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiText } from '@/lib/gemini';
import { fetchAIProducts, type AIRecommendationFilters } from '@/lib/products';
import { checkRateLimit, getClientIp, getRetryAfterSeconds } from '@/lib/rateLimit';

const LABELS = {
    goal: {
        business: 'website doanh nghiệp / landing page',
        ecommerce: 'cửa hàng online / e-commerce',
        portfolio: 'portfolio / blog cá nhân',
        app: 'ứng dụng mobile / dashboard',
    },
    tech: {
        react: 'React / Next.js',
        wordpress: 'WordPress',
        html: 'HTML/CSS thuần',
        any: 'linh hoạt, không bắt buộc nền tảng',
    },
    style: {
        minimal: 'tối giản',
        modern: 'hiện đại',
        creative: 'sáng tạo',
        corporate: 'chuyên nghiệp',
    },
    budget: {
        low: 'dưới 500.000đ',
        medium: '500.000đ - 1.000.000đ',
        high: 'trên 1.000.000đ',
    },
} as const;

function labelOf<T extends keyof typeof LABELS>(group: T, value?: string) {
    if (!value) return 'chưa chọn';
    return (LABELS[group] as Record<string, string>)[value] || value;
}

function fallbackReasoning(answers: AIRecommendationFilters, hasProducts: boolean) {
    if (!hasProducts) {
        return `Mình chưa tìm thấy sản phẩm khớp đủ các tiêu chí: ${labelOf('goal', answers.goal)}, nền tảng ${labelOf('tech', answers.tech)}, phong cách ${labelOf('style', answers.style)} và ngân sách ${labelOf('budget', answers.budget)}. Bạn có thể nới ngân sách hoặc chọn nền tảng linh hoạt hơn để có thêm lựa chọn phù hợp.`;
    }

    return `Dựa trên mục tiêu ${labelOf('goal', answers.goal)}, nền tảng ${labelOf('tech', answers.tech)}, phong cách ${labelOf('style', answers.style)} và ngân sách ${labelOf('budget', answers.budget)}, mình đã lọc các sản phẩm phù hợp nhất từ kho DigitalMart. Ưu tiên là sản phẩm đúng nhu cầu triển khai, dễ tùy biến và có mức giá nằm trong phạm vi bạn chọn.`;
}

function buildPrompt(answers: AIRecommendationFilters, products: Awaited<ReturnType<typeof fetchAIProducts>>) {
    const productText = products.length
        ? products.map((product, index) => (
            `${index + 1}. ${product.name} | ${product.format} | ${product.category} | ${product.price.toLocaleString('vi-VN')}đ | rating ${product.rating} | /product/${product.slug || product.id}`
        )).join('\n')
        : 'Không có sản phẩm nào khớp đủ điều kiện.';

    return `
Bạn là AI tư vấn sản phẩm số cho DigitalMart.

Tiêu chí khách chọn:
- Mục tiêu: ${labelOf('goal', answers.goal)}
- Nền tảng: ${labelOf('tech', answers.tech)}
- Phong cách: ${labelOf('style', answers.style)}
- Ngân sách: ${labelOf('budget', answers.budget)}

Sản phẩm khớp từ Supabase:
${productText}

Yêu cầu trả lời:
- Viết bằng tiếng Việt, 70-110 từ.
- Tư vấn rõ vì sao bộ sản phẩm phù hợp với tiêu chí.
- Nếu không có sản phẩm khớp, nói thẳng là chưa có sản phẩm phù hợp và gợi ý cách nới tiêu chí.
- Không bịa sản phẩm, không nói sản phẩm ngoài danh sách.
- Không nhắc Gemini hay mô hình AI.
`.trim();
}

function pickAllowed<T extends readonly string[]>(value: unknown, allowed: T): T[number] | undefined {
    return typeof value === 'string' && allowed.includes(value) ? value : undefined;
}

function sanitizeAnswers(body: unknown): AIRecommendationFilters {
    const value = body && typeof body === 'object' ? body as Record<string, unknown> : {};

    return {
        goal: pickAllowed(value.goal, ['business', 'ecommerce', 'portfolio', 'app'] as const),
        tech: pickAllowed(value.tech, ['react', 'wordpress', 'html', 'any'] as const),
        style: pickAllowed(value.style, ['minimal', 'modern', 'creative', 'corporate'] as const),
        budget: pickAllowed(value.budget, ['low', 'medium', 'high'] as const),
    };
}

export async function POST(request: NextRequest) {
    try {
        const clientIp = getClientIp(request);
        const rateLimit = checkRateLimit(`ai-recommendation:${clientIp}`, {
            windowMs: 10 * 60 * 1000,
            max: 15,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Ban thao tac hoi nhanh. Vui long thu lai sau it phut.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(getRetryAfterSeconds(rateLimit.resetAt)),
                    },
                }
            );
        }

        const answers = sanitizeAnswers(await request.json());
        const products = await fetchAIProducts(answers, { fallback: false });

        let reasoning = fallbackReasoning(answers, products.length > 0);
        let poweredByAi = false;

        try {
            const aiText = await generateGeminiText(buildPrompt(answers, products), 260);
            if (aiText) {
                reasoning = aiText;
                poweredByAi = true;
            }
        } catch (error) {
            console.warn('AI recommendation Gemini fallback:', error);
        }

        return NextResponse.json({
            products,
            reasoning,
            poweredByAi,
            hasMatches: products.length > 0,
        });
    } catch (error) {
        console.error('AI recommendation API error:', error);
        return NextResponse.json(
            { error: 'Không thể tạo gợi ý lúc này.' },
            { status: 500 }
        );
    }
}
