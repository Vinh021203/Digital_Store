import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

interface Props {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Supabase is not configured');
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
        const { data: seller } = await supabase
            .from('sellers')
            .select('store_name, store_slug, description, logo, banner')
            .eq('store_slug', slug)
            .eq('status', 'active')
            .maybeSingle();

        if (!seller) {
            return {
                title: 'Cửa hàng không tồn tại',
                robots: {
                    index: false,
                    follow: false,
                },
            };
        }

        const title = `${seller.store_name} - Cửa hàng giao diện website`;
        const description = seller.description?.trim()
            || `Khám phá giao diện website và template từ ${seller.store_name} trên Shop Web rẻ.`;
        const canonical = `/seller/${seller.store_slug}`;
        const image = seller.banner || seller.logo || '/thumbnail.webp';

        return {
            title,
            description: description.slice(0, 160),
            alternates: {
                canonical,
            },
            openGraph: {
                type: 'website',
                url: canonical,
                title,
                description,
                siteName: 'Shop Web rẻ',
                images: [
                    {
                        url: image,
                        alt: seller.store_name,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [image],
            },
        };
    } catch {
        return {
            title: 'Cửa hàng | Shop Web rẻ',
            robots: {
                index: false,
                follow: false,
            },
        };
    }
}

export default function SellerLayout({ children }: Props) {
    return children;
}
