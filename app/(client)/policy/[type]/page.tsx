import type { Metadata } from 'next';
import PolicyContent from './PolicyContent';
import { seoKeywords } from '@/lib/seo';

const policyMeta: Record<string, { title: string; description: string; keywords: string[] }> = {
    privacy: {
        title: 'Chính sách bảo mật',
        description: 'Cách Web Giá Rẻ - Portfolio thu thập, sử dụng và bảo vệ thông tin cá nhân của người dùng.',
        keywords: ['chính sách bảo mật', 'bảo vệ thông tin khách hàng', 'dữ liệu cá nhân', ...seoKeywords.policy],
    },
    terms: {
        title: 'Điều khoản sử dụng',
        description: 'Quy định áp dụng khi truy cập, tạo tài khoản và chọn mẫu demo số tại Web Giá Rẻ - Portfolio.',
        keywords: ['điều khoản sử dụng', 'điều khoản tư vấn template', 'quy định mẫu demo số', ...seoKeywords.policy],
    },
    refund: {
        title: 'Chính sách xử lý yêu cầu',
        description: 'Điều kiện và quy trình yêu cầu xử lý yêu cầu đối với mẫu demo số tại Web Giá Rẻ - Portfolio.',
        keywords: ['chính sách xử lý yêu cầu', 'xử lý yêu cầu template website', 'mẫu demo số', ...seoKeywords.policy],
    },
    license: {
        title: 'Điều khoản quyền truy cập',
        description: 'Phạm vi sử dụng và giới hạn quyền truy cập của mẫu demo số tại Web Giá Rẻ - Portfolio.',
        keywords: ['quyền truy cập template website', 'quyền truy cập giao diện website', 'bản quyền template', ...seoKeywords.policy],
    },
};

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
    const { type } = await params;
    const meta = policyMeta[type] || {
        title: 'Chính sách',
        description: 'Các chính sách và điều khoản áp dụng tại Web Giá Rẻ - Portfolio.',
        keywords: seoKeywords.policy,
    };

    return {
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        alternates: { canonical: `/policy/${type}` },
        openGraph: {
            title: `${meta.title} | Web Giá Rẻ - Portfolio`,
            description: meta.description,
            images: ['/thumbnail.jpg'],
        },
    };
}

export default async function PolicyPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;
    return <PolicyContent type={type} />;
}
