import { Metadata } from 'next';
import CommunityPage from './CommunityContent';

export const metadata: Metadata = {
    title: 'Cộng đồng | DigitalMart',
    description: 'Tham gia cộng đồng DigitalMart - Kết nối, chia sẻ và học hỏi cùng nhau',
    openGraph: {
        title: 'Cộng đồng | DigitalMart',
        description: 'Tham gia cộng đồng DigitalMart - Kết nối, chia sẻ và học hỏi cùng nhau',
    }
};

export default function Page() {
    return <CommunityPage />;
}
