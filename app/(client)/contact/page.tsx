import { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
    title: 'Liên hệ',
    description: 'Liên hệ với DigitalMart - Đội ngũ hỗ trợ 24/7 sẵn sàng giải đáp mọi thắc mắc của bạn',
    openGraph: {
        title: 'Liên hệ | DigitalMart',
        description: 'Liên hệ với DigitalMart - Đội ngũ hỗ trợ 24/7 sẵn sàng giải đáp mọi thắc mắc của bạn',
    }
};

export default function ContactPage() {
    return <ContactContent />;
}
