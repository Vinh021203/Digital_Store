import 'server-only';

import OpenAI from 'openai';
import { fetchActiveProducts } from './products';
import { getConfiguredAIModel } from './ai-config';
import { createAdminClient } from './supabase/server';

export interface ChatResponse {
  message: string;
  products?: Array<{ id: number; name: string; slug: string; price: number; image: string; rating: number; format?: string }>;
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

const QUICK_REPLIES = {
  greeting: ['Tìm Landing Page', 'Xem Theme phổ biến', 'Tư vấn theo ngân sách', 'Liên hệ chuyên viên'],
  product: ['Xem thêm mẫu demo', 'Hỏi về license', 'Nhận báo giá', 'So sánh các mẫu'],
  support: ['Tư vấn mẫu demo', 'Hỏi về license', 'Liên hệ hotline', 'Gửi yêu cầu hỗ trợ'],
};

const DEFAULT_WEBSITE_FACTS = {
  siteName: 'Web Giá Rẻ - Portfolio',
  owner: 'Lương Thế Vinh',
  email: 'contact@webgiare.id.vn',
  phone: '0971 386 588',
  address: 'Hạ Long, Quảng Ninh, Việt Nam',
  hours: 'Thứ 2 - Thứ 7, 8:00 - 18:00',
  url: 'https://webgiare.id.vn',
};

async function getWebsiteContext() {
  const facts = { ...DEFAULT_WEBSITE_FACTS };
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('site_settings')
      .select('key, value')
      .in('key', ['site_name', 'contact_email', 'contact_phone', 'contact_address']);
    for (const row of data || []) {
      if (row.key === 'site_name' && row.value) facts.siteName = row.value;
      if (row.key === 'contact_email' && row.value) facts.email = row.value;
      if (row.key === 'contact_phone' && row.value) facts.phone = row.value;
      if (row.key === 'contact_address' && row.value) facts.address = row.value;
    }
  } catch (error) {
    console.warn('Unable to load website facts:', error);
  }

  return `Thông tin chính thức của website:
- Tên: ${facts.siteName}
- Người sáng lập/đại diện hiển thị: ${facts.owner}
- Website: ${facts.url}
- Email: ${facts.email}
- Hotline/Zalo: ${facts.phone}
- Địa chỉ: ${facts.address}
- Giờ hỗ trợ: ${facts.hours}
- Lĩnh vực: starter kit, theme, template, landing page, UI kit, dashboard và tài nguyên số cho website.
- Hỗ trợ: xem demo, tư vấn công nghệ, license, tùy biến giao diện và triển khai website.`;
}

function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/\bchaof\b/g, 'chao').replace(/\s+/g, ' ').trim();
}

function parseBudget(message: string) {
  const normalized = normalizeText(message).replace(/\s+/g, ' ');
  const match = normalized.match(/(?:duoi|toi da|max|<=|nho hon|khong qua)\s*(\d+(?:[.,]\d+)?)\s*(k|nghin|ngan|trieu|m|000)?/);
  if (!match) return null;
  const amount = Number(match[1].replace(',', '.'));
  const unit = match[2] || '';
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
  if (normalized.includes('react') || normalized.includes('next')) keywords.push('react', 'next');
  if (normalized.includes('portfolio') || normalized.includes('cv')) keywords.push('portfolio', 'cv');
  return { maxPrice: parseBudget(message), keywords };
}

function productHaystack(product: any) {
  return normalizeText([product.name, product.description, product.format, product.category, product.author, ...(product.tags || [])].join(' '));
}

function getIntent(message: string) {
  const lower = normalizeText(message);
  if (/(thong tin( ve)? website|website nay|website.*(cung cap|giai phap|la gi)|giai phap|gioi thieu|chu so huu|so huu|ai thanh lap|lien he|contact|hotline|email|dia chi|gio ho tro|gio lam viec|support)/i.test(lower)) return 'website';
  if (/(so sanh|doi thu|nha cung cap khac|ben khac|themeforest|envato|template monster|freepik|canva marketplace)/i.test(lower)) return 'competitor';
  if (/(theme|template|landing|dashboard|admin|shop|store|ecommerce|ban hang|figma|html|css|javascript|react|next|vue|laravel|portfolio|mau demo|giao dien|bookle|barab|boimela|analytics dashboard)/i.test(lower)) return 'product';
  if (/(gia|bao nhieu|thanh toan|chuyen khoan|license|ban quyen|mua)/i.test(lower)) return 'support';
  if (/(^|\s)(chao|hello|hi|hey|alo)(\s|$)/i.test(lower) || lower === 'xin chao') return 'greeting';
  return 'default';
}

async function getRelevantProducts(message: string): Promise<ProductSearchResult> {
  const filters = parseProductFilters(message);
  const products = await fetchActiveProducts({ limit: 40 });
  const filtered = products.filter((product) => {
    if (filters.maxPrice !== null && Number(product.price || 0) > filters.maxPrice) return false;
    return filters.keywords.length === 0 || filters.keywords.some((keyword) => productHaystack(product).includes(keyword));
  });
  const hardFilters = filters.maxPrice !== null || filters.keywords.length > 0;
  const source = filtered.length > 0 || hardFilters ? filtered : products;
  const mapped = source.map((product) => {
    const haystack = productHaystack(product);
    const score = Number(product.rating || 0) + filters.keywords.reduce((sum, keyword) => sum + (haystack.includes(keyword) ? 8 : 0), 0) + (product.isFeatured ? 2 : 0);
    return { product, score };
  }).sort((a, b) => b.score - a.score).slice(0, 4).map(({ product }) => ({
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
  return { products: mapped, hasHardFilters: hardFilters, hasExactMatches: mapped.length > 0, maxPrice: filters.maxPrice, keywords: filters.keywords };
}

function toProductCards(products: ChatProduct[]) {
  return products.slice(0, 3).map(({ id, name, slug, price, image, rating, format }) => ({ id, name, slug, price, image, rating, format }));
}

function buildSystemPrompt() {
  return `Bạn là trợ lý tư vấn chính thức của Web Giá Rẻ - Portfolio.
Chỉ được tư vấn về starter kit, theme, template, landing page, UI kit, dashboard, công nghệ, demo, license, giá và hỗ trợ của website.
Chỉ dùng thông tin website và sản phẩm được cung cấp trong context. Không bịa sản phẩm, giá, chính sách, chủ sở hữu hoặc thông tin liên hệ.
Nếu không có dữ liệu, nói rõ chưa có thông tin và hướng khách liên hệ chuyên viên.
Nếu khách hỏi ngoài chủ đề website, từ chối ngắn gọn và đưa cuộc trò chuyện về nhu cầu làm website.
Trả lời tiếng Việt tự nhiên, chuyên nghiệp, ngắn gọn; không nhắc tên nhà cung cấp API hay quá trình suy luận.
Khi tư vấn sản phẩm, trả lời theo 3 ý ngắn: xác nhận nhu cầu, nói đã lọc mẫu phù hợp, rồi hướng khách bấm card để xem demo hoặc liên hệ.
Không tự tạo danh sách sản phẩm, giá hoặc link trong phần trả lời vì giao diện sẽ hiển thị card riêng bên dưới. Không dùng Markdown đậm, tiêu đề dài hoặc bảng.`;
}

export async function generateAIText(prompt: string, maxOutputTokens = 420) {
  const apiKey = process.env.ORCAROUTER_API_KEY;
  if (!apiKey) return null;
  const client = new OpenAI({ baseURL: 'https://api.orcarouter.ai/v1', apiKey });
  const response = await client.chat.completions.create({
    model: await getConfiguredAIModel(),
    messages: [{ role: 'system', content: buildSystemPrompt() }, { role: 'user', content: prompt }],
    max_tokens: maxOutputTokens,
    temperature: 0.35,
  });
  return response.choices[0]?.message?.content?.trim() || null;
}

function fallbackResponse(intent: string, result: ProductSearchResult): ChatResponse {
  if (intent === 'product' && result.products.length) return { message: 'Mình tìm thấy một số mẫu phù hợp với nhu cầu của bạn. Bạn xem nhanh các lựa chọn này nhé:', products: toProductCards(result.products), quickReplies: QUICK_REPLIES.product };
  if (intent === 'product' && result.hasHardFilters && !result.hasExactMatches) return { message: 'Hiện mình chưa thấy mẫu demo khớp đúng điều kiện trong kho Web Giá Rẻ. Bạn có thể nới ngân sách hoặc đổi loại mẫu để mình tìm tiếp nhé.', quickReplies: QUICK_REPLIES.product };
  return { message: 'Mình có thể giúp bạn tìm theme, template, landing page, dashboard, xem demo hoặc tư vấn license. Bạn đang cần mẫu website kiểu nào?', quickReplies: intent === 'support' ? QUICK_REPLIES.support : QUICK_REPLIES.greeting };
}

function websiteFallback() {
  return `Web Giá Rẻ - Portfolio là thư viện starter kit và giao diện website do Lương Thế Vinh xây dựng/đại diện. Website cung cấp theme, template, landing page, UI kit và dashboard; có hỗ trợ xem demo, tư vấn license, tùy biến và triển khai.\n\nLiên hệ: ${DEFAULT_WEBSITE_FACTS.email} · ${DEFAULT_WEBSITE_FACTS.phone}. Địa chỉ: ${DEFAULT_WEBSITE_FACTS.address}.`;
}

function competitorFallback() {
  return 'Mình có thể giúp bạn so sánh theo nhu cầu thực tế, nhưng không nên đưa ra nhận xét thiếu kiểm chứng về nhà cung cấp khác. Web Giá Rẻ tập trung vào mẫu demo chọn lọc, tư vấn công nghệ, license, tùy biến giao diện và hỗ trợ triển khai tại Việt Nam. Bạn có thể gửi ngân sách, công nghệ và mục tiêu dự án để mình lập bảng tiêu chí so sánh rõ ràng.';
}

export async function chatWithAI(userMessage: string, history: ChatHistoryMessage[] = []): Promise<ChatResponse> {
  const intent = getIntent(userMessage);
  if (intent === 'greeting') {
    return {
      message: 'Xin chào! Mình là trợ lý tư vấn của Web Giá Rẻ. Bạn đang cần tìm mẫu website, landing page, dashboard hay muốn được tư vấn theo ngân sách?',
      quickReplies: QUICK_REPLIES.greeting,
    };
  }
  if (intent === 'website') {
    return { message: websiteFallback(), quickReplies: QUICK_REPLIES.support };
  }
  if (intent === 'competitor') {
    return { message: competitorFallback(), quickReplies: ['Tư vấn theo ngân sách', 'Hỏi về license', 'Gặp chuyên viên', 'Xem mẫu demo'] };
  }
  userMessage = `${userMessage}\n\nResponse rules: reply in 2-3 short Vietnamese sentences. Follow this order: acknowledge the need, explain that suitable products were filtered, then guide the visitor to click the product cards or contact support. Do not repeat product names, prices, or URLs because the UI renders them as compact cards. Do not use Markdown lists or tables.`;
  let result: ProductSearchResult = { products: [], hasHardFilters: false, hasExactMatches: false, maxPrice: null, keywords: [] };
  try {
    if (intent === 'product') result = await getRelevantProducts(userMessage);
  } catch (error) { console.error('AI product context error:', error); }
  const productText = result.products.map((product, index) => `${index + 1}. ${product.name} | ${product.format || 'Template'} | ${product.price.toLocaleString('vi-VN')}đ | /product/${product.slug}`).join('\n') || 'Không có mẫu demo phù hợp.';
  const historyText = history.slice(-6).map((item) => `${item.sender === 'user' ? 'Khách' : 'Trợ lý'}: ${item.text}`).join('\n');
  const websiteContext = await getWebsiteContext();
  try {
    const message = await generateAIText(`Hồ sơ website:\n${websiteContext}\n\nLịch sử gần nhất:\n${historyText || 'Chưa có'}\n\nMẫu demo liên quan từ website:\n${productText}\n\nCâu hỏi của khách:\n${userMessage}\n\nHãy trả lời đúng dữ liệu trong hồ sơ website. Nếu là câu hỏi thông tin/liên hệ, trả lời trực tiếp bằng thông tin chính thức. Nếu là tư vấn sản phẩm, chỉ đề xuất mẫu có trong danh sách; tên, giá và link sẽ được giao diện hiển thị bằng card.`);
    if (message) return { message, products: intent === 'product' ? toProductCards(result.products) : undefined, quickReplies: intent === 'product' ? QUICK_REPLIES.product : QUICK_REPLIES.greeting };
  } catch (error) { console.error('OrcaRouter AI fallback:', error); }
  return fallbackResponse(intent, result);
}
