import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getSiteUrl } from '@/lib/site-url';

const SITE_URL = getSiteUrl();

export const revalidate = 3600;

function createSitemapClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

function toDate(value?: string | null) {
    return value ? new Date(value) : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${SITE_URL}/community`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${SITE_URL}/ai-recommendation`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${SITE_URL}/affiliate`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${SITE_URL}/policy/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${SITE_URL}/policy/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${SITE_URL}/policy/refund`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${SITE_URL}/policy/license`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];

    const supabase = createSitemapClient();
    if (!supabase) return staticPages;

    try {
        const [productsResult, blogResult, sellersResult] = await Promise.all([
            supabase
                .from('products')
                .select('id, slug, updated_at, created_at')
                .eq('status', 'active')
                .order('updated_at', { ascending: false })
                .limit(5000),
            supabase
                .from('blog_posts')
                .select('slug, updated_at, published_at, created_at')
                .eq('is_published', true)
                .order('published_at', { ascending: false })
                .limit(2000),
            supabase
                .from('sellers')
                .select('store_slug, updated_at, created_at')
                .eq('status', 'active')
                .order('updated_at', { ascending: false })
                .limit(2000),
        ]);

        if (productsResult.error) {
            console.error('Sitemap products error:', productsResult.error.message);
        }
        if (blogResult.error) {
            console.error('Sitemap blog error:', blogResult.error.message);
        }
        if (sellersResult.error) {
            console.error('Sitemap sellers error:', sellersResult.error.message);
        }

        const productPages: MetadataRoute.Sitemap = (productsResult.data || []).map((product) => ({
            url: `${SITE_URL}/product/${product.slug || product.id}`,
            lastModified: toDate(product.updated_at || product.created_at),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        const blogPages: MetadataRoute.Sitemap = (blogResult.data || []).map((post) => ({
            url: `${SITE_URL}/blog/${post.slug}`,
            lastModified: toDate(post.updated_at || post.published_at || post.created_at),
            changeFrequency: 'monthly',
            priority: 0.65,
        }));

        const sellerPages: MetadataRoute.Sitemap = (sellersResult.data || []).map((seller) => ({
            url: `${SITE_URL}/seller/${seller.store_slug}`,
            lastModified: toDate(seller.updated_at || seller.created_at),
            changeFrequency: 'weekly',
            priority: 0.55,
        }));

        return [...staticPages, ...productPages, ...blogPages, ...sellerPages];
    } catch (error) {
        console.error('Sitemap generation error:', error);
        return staticPages;
    }
}
