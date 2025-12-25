import { Metadata } from 'next';
import ProductsPage from './ProductsContent';

export const metadata: Metadata = {
    title: 'Sản phẩm | DigitalMart',
    description: 'Khám phá kho sản phẩm số chất lượng cao - Templates, UI Kits, Source Code và nhiều hơn nữa',
    openGraph: {
        title: 'Sản phẩm | DigitalMart',
        description: 'Khám phá kho sản phẩm số chất lượng cao - Templates, UI Kits, Source Code và nhiều hơn nữa',
    }
};

export default function Page() {
    return <ProductsPage />;
}
