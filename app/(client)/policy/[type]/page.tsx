import { Metadata } from 'next';
import PolicyContent from './PolicyContent';

// Dynamic metadata for policy pages
const policyMeta: Record<string, { title: string; description: string }> = {
  privacy: {
    title: 'Chính sách Bảo mật',
    description: 'Cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn tại DigitalMart'
  },
  terms: {
    title: 'Điều khoản Sử dụng',
    description: 'Quy định và điều kiện sử dụng dịch vụ của DigitalMart'
  },
  refund: {
    title: 'Chính sách Hoàn tiền',
    description: 'Quy định về hoàn tiền và đổi trả sản phẩm số tại DigitalMart'
  },
  license: {
    title: 'Điều khoản License',
    description: 'Chi tiết về các loại license và quyền sử dụng sản phẩm tại DigitalMart'
  }
};

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const meta = policyMeta[type];

  if (!meta) {
    return {
      title: 'Chính sách',
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

export default async function PolicyPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return <PolicyContent type={type} />;
}
