import type { Metadata } from 'next';
import PolicyContent from './PolicyContent';
import { seoKeywords } from '@/lib/seo';

const policyMeta: Record<string, { title: string; description: string; keywords: string[] }> = {
    privacy: {
        title: 'Chính sách bảo mật',
        description: 'Cách Shop Web rẻ thu thập, sử dụng và bảo vệ thông tin cá nhân của người dùng.',
        keywords: ['chính sách bảo mật', 'bảo vệ thông tin khách hàng', 'dữ liệu cá nhân', ...seoKeywords.policy],
    },
    terms: {
        title: 'Điều khoản sử dụng',
        description: 'Quy định áp dụng khi truy cập, tạo tài khoản và mua sản phẩm số tại Shop Web rẻ.',
        keywords: ['điều khoản sử dụng', 'điều khoản mua template', 'quy định sản phẩm số', ...seoKeywords.policy],
    },
    refund: {
        title: 'Chính sách hoàn tiền',
        description: 'Điều kiện và quy trình yêu cầu hoàn tiền đối với sản phẩm số tại Shop Web rẻ.',
        keywords: ['chính sách hoàn tiền', 'hoàn tiền template website', 'sản phẩm số', ...seoKeywords.policy],
    },
    license: {
        title: 'Điều khoản giấy phép',
        description: 'Phạm vi sử dụng và giới hạn giấy phép của sản phẩm số được mua tại Shop Web rẻ.',
        keywords: ['license template website', 'giấy phép giao diện website', 'bản quyền template', ...seoKeywords.policy],
    },
};

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
    const { type } = await params;
    const meta = policyMeta[type] || {
        title: 'Chính sách',
        description: 'Các chính sách và điều khoản áp dụng tại Shop Web rẻ.',
        keywords: seoKeywords.policy,
    };

    return {
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        alternates: { canonical: `/policy/${type}` },
        openGraph: {
            title: `${meta.title} | Shop Web rẻ`,
            description: meta.description,
            images: ['/thumbnail.jpg'],
        },
    };
}

export default async function PolicyPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;
    return <PolicyContent type={type} />;
}
