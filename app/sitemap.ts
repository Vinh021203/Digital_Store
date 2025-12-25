import { MetadataRoute } from 'next';
import { fetchActiveProducts } from '@/lib/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://edubook.vn';

    // Static pages
    const staticPages = [
        '',
        '/products',
        '/blog',
        '/about',
        '/contact',
        '/faq',
        '/affiliate',
        '/community',
        '/leaderboard',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Product pages - fetch from Supabase
    const products = await fetchActiveProducts();
    const productPages = products.map((product: any) => ({
        url: `${baseUrl}/product/${product.slug || product.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    return [...staticPages, ...productPages];
}
