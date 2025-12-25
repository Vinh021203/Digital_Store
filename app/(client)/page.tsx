import { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';

export const metadata: Metadata = {
  title: 'DigitalMart - Marketplace Sản Phẩm Số #1 Việt Nam',
  description: 'Khám phá kho sản phẩm số chất lượng cao - Templates, UI Kits, Source Code, Themes và nhiều hơn nữa tại DigitalMart',
  openGraph: {
    title: 'DigitalMart - Marketplace Sản Phẩm Số #1 Việt Nam',
    description: 'Khám phá kho sản phẩm số chất lượng cao - Templates, UI Kits, Source Code, Themes và nhiều hơn nữa',
  }
};

export default function Page() {
  return <HomePage />;
}
