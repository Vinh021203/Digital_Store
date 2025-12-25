import { Metadata } from 'next';

// Dynamic metadata for policy pages
const policyMeta: Record<string, { title: string; description: string }> = {
    privacy: {
        title: 'Chính sách Bảo mật | DigitalMart',
        description: 'Cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn tại DigitalMart'
    },
    terms: {
        title: 'Điều khoản Sử dụng | DigitalMart',
        description: 'Quy định và điều kiện sử dụng dịch vụ của DigitalMart'
    },
    refund: {
        title: 'Chính sách Hoàn tiền | DigitalMart',
        description: 'Quy định về hoàn tiền và đổi trả sản phẩm số tại DigitalMart'
    },
    license: {
        title: 'Điều khoản License | DigitalMart',
        description: 'Chi tiết về các loại license và quyền sử dụng sản phẩm tại DigitalMart'
    }
};

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
    const { type } = await params;
    const meta = policyMeta[type];

    if (!meta) {
        return {
            title: 'Chính sách | DigitalMart',
            description: 'Các chính sách và điều khoản của DigitalMart'
        };
    }

    return {
        title: meta.title,
        description: meta.description,
        openGraph: {
            title: meta.title,
            description: meta.description,
        }
    };
}
