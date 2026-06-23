import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

const SITE_URL = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin',
                    '/api',
                    '/checkout',
                    '/profile',
                    '/cart',
                    '/wishlist',
                    '/auth',
                    '/private',
                    '/login',
                    '/register',
                    '/forgot-password',
                    '/reset-password',
                    '/verify-email',
                    '/order-success',
                    '/seller/register',
                    '/affiliate/dashboard',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/admin',
                    '/api',
                    '/checkout',
                    '/profile',
                    '/cart',
                    '/wishlist',
                    '/login',
                    '/register',
                    '/forgot-password',
                    '/reset-password',
                    '/verify-email',
                    '/order-success',
                    '/seller/register',
                    '/affiliate/dashboard',
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
