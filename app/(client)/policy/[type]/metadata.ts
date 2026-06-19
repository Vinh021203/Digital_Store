import { Metadata } from 'next';

// Dynamic metadata for policy pages
const policyMeta: Record<string, { title: string; description: string }> = {
    privacy: {
        title: 'Chính sách Bảo mật',
        description: 'Cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn tại Shop Web rẻ'
    },
    terms: {
        title: 'Điều khoản Sử dụng',
        description: 'Quy định và điều kiện sử dụng dịch vụ của Shop Web rẻ'
    },
    refund: {
        title: 'Chính sách Hoàn tiền',
        description: 'Quy định về hoàn tiền và đổi trả giao diện website tại Shop Web rẻ'
    },
    license: {
        title: 'Điều khoản License',
        description: 'Chi tiết về các loại license và quyền sử dụng sản phẩm tại Shop Web rẻ'
    }
};

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
    const { type } = await params;
    const meta = policyMeta[type];

    if (!meta) {
        return {
            title: 'Chính sách',
            description: 'Các chính sách và điều khoản của Shop Web rẻ'
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
