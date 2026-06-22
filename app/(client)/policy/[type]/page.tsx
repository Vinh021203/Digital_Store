import type { Metadata } from 'next';
import PolicyContent from './PolicyContent';

const policyMeta: Record<string, { title: string; description: string }> = {
    privacy: {
        title: 'Chính sách bảo mật',
        description: 'Cách Shop Web rẻ thu thập, sử dụng và bảo vệ thông tin cá nhân của người dùng.',
    },
    terms: {
        title: 'Điều khoản sử dụng',
        description: 'Quy định áp dụng khi truy cập, tạo tài khoản và mua sản phẩm số tại Shop Web rẻ.',
    },
    refund: {
        title: 'Chính sách hoàn tiền',
        description: 'Điều kiện và quy trình yêu cầu hoàn tiền đối với sản phẩm số tại Shop Web rẻ.',
    },
    license: {
        title: 'Điều khoản giấy phép',
        description: 'Phạm vi sử dụng và giới hạn giấy phép của sản phẩm số được mua tại Shop Web rẻ.',
    },
};

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
    const { type } = await params;
    const meta = policyMeta[type] || {
        title: 'Chính sách',
        description: 'Các chính sách và điều khoản áp dụng tại Shop Web rẻ.',
    };

    return {
        title: meta.title,
        description: meta.description,
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
