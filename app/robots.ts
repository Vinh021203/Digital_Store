import { MetadataRoute } from 'next';

// Use environment variable or fallback to production URL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://martdigitalhub.vercel.app';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/checkout/',
                    '/profile/',
                    '/cart/',
                    '/wishlist/',
                    '/auth/',
                    '/private/',
                    '/login/',
                    '/register/',
                    '/forgot-password/',
                    '/reset-password/',
                    '/verify-email/',
                    '/order-success/',
                    '/seller/register/',
                    '/affiliate/dashboard/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/checkout/',
                    '/profile/',
                    '/cart/',
                    '/wishlist/',
                    '/login/',
                    '/register/',
                    '/forgot-password/',
                    '/reset-password/',
                    '/verify-email/',
                    '/order-success/',
                    '/seller/register/',
                    '/affiliate/dashboard/',
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
