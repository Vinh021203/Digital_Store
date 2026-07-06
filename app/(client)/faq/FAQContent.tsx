'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight, BadgeCheck, BookOpen, CheckCircle2, ChevronDown,
    ChevronRight, HelpCircle, CreditCard, Download, FileArchive,
    Headphones, Home, KeyRound, Mail, MessageCircle, PackageCheck,
    Search, ShieldCheck, Sparkles, X,
} from 'lucide-react';

type CategoryId = 'all' | 'product' | 'payment' | 'download' | 'license' | 'support';

type FAQItem = {
    category: Exclude<CategoryId, 'all'>;
    question: string;
    answer: string;
    link?: { label: string; href: string };
    featured?: boolean;
};

const categories: { id: CategoryId; name: string; icon: LucideIcon }[] = [
    { id: 'all', name: 'Tất cả', icon: Sparkles },
    { id: 'product', name: 'Sản phẩm', icon: PackageCheck },
    { id: 'payment', name: 'Tư vấn', icon: CreditCard },
    { id: 'download', name: 'Quyền truy cập', icon: Download },
    { id: 'license', name: 'Giấy phép', icon: KeyRound },
    { id: 'support', name: 'Hỗ trợ', icon: Headphones },
];

const faqs: FAQItem[] = [
    {
        category: 'product',
        question: 'Tôi có thể xem demo trước khi quyết định không?',
        answer: 'Nếu sản phẩm có bản demo, nút xem demo sẽ xuất hiện tại trang chi tiết. Bạn nên kiểm tra giao diện, tính năng, công nghệ và khả năng responsive trước khi gửi nhu cầu tư vấn.',
        featured: true,
    },
    {
        category: 'product',
        question: 'Một sản phẩm thường gồm những nội dung gì?',
        answer: 'Nội dung phụ thuộc từng sản phẩm, có thể gồm HTML, CSS, JavaScript, React, Next.js, Figma hoặc tài nguyên liên quan. Hãy xem mục định dạng file và thông tin kỹ thuật trên trang sản phẩm.',
    },
    {
        category: 'product',
        question: 'Sản phẩm có tài liệu hướng dẫn không?',
        answer: 'Tài liệu và mức độ hướng dẫn tùy từng sản phẩm. Thông tin này được ghi tại trang chi tiết hoặc trong phần mô tả kỹ thuật. Bạn có thể liên hệ trước nếu cần xác nhận.',
    },
    {
        category: 'product',
        question: 'Sản phẩm có được cập nhật miễn phí không?',
        answer: 'Quyền nhận bản cập nhật phụ thuộc vào từng sản phẩm và loại giấy phép. Nếu có bản mới được mở cho tài khoản của bạn, thông tin sẽ hiển thị trong khu vực hồ sơ.',
    },
    {
        category: 'payment',
        question: 'Shop Web rẻ tư vấn theo quy trình nào?',
        answer: 'Bạn có thể xem demo, gửi tên sản phẩm quan tâm, công nghệ mong muốn và ngân sách dự kiến. Mình sẽ kiểm tra mẫu phù hợp rồi phản hồi hướng triển khai rõ ràng trước khi mở bước mua bán trực tiếp.',
        featured: true,
    },
    {
        category: 'payment',
        question: 'Tôi nên gửi thông tin gì để được tư vấn nhanh?',
        answer: 'Hãy gửi tên sản phẩm, link demo nếu có, loại công nghệ cần dùng, ngân sách dự kiến và thời gian mong muốn. Nếu bạn đã có mã đơn cũ, có thể gửi kèm để kiểm tra lịch sử hỗ trợ.',
        link: { label: 'Gửi yêu cầu tư vấn', href: '/contact' },
    },
    {
        category: 'payment',
        question: 'Khi nào chính sách hoàn tiền được áp dụng?',
        answer: 'Chính sách hoàn tiền chỉ áp dụng khi website mở luồng mua bán trực tiếp và đơn hàng đủ điều kiện theo quy định. Với chế độ tư vấn/catalog, bạn nên xem demo và xác nhận nhu cầu trước.',
        link: { label: 'Xem chính sách hoàn tiền', href: '/policy/refund' },
    },
    {
        category: 'download',
        question: 'Khi nào tài khoản có quyền truy cập file?',
        answer: 'Quyền truy cập file chỉ được mở khi sản phẩm hoặc đơn hàng đủ điều kiện. Khi có quyền, bạn đăng nhập đúng tài khoản và mở khu vực hồ sơ để xem thông tin liên quan.',
        featured: true,
    },
    {
        category: 'download',
        question: 'Tại sao tôi chưa thấy file trong hồ sơ?',
        answer: 'Có thể tài khoản chưa được mở quyền, sản phẩm chưa gắn file hoặc website đang ở chế độ catalog/tư vấn. Hãy gửi tên sản phẩm hoặc mã đơn cũ để mình kiểm tra quyền truy cập.',
    },
    {
        category: 'download',
        question: 'Nếu file tải xuống bị lỗi thì làm gì?',
        answer: 'Không chỉnh sửa file lỗi. Hãy chụp thông báo, ghi lại tên sản phẩm và mã đơn nếu có rồi gửi qua trang liên hệ. File sẽ được kiểm tra và thay thế nếu lỗi nằm ở gói bàn giao.',
        link: { label: 'Gửi yêu cầu hỗ trợ', href: '/contact' },
    },
    {
        category: 'license',
        question: 'Regular License được dùng cho bao nhiêu dự án?',
        answer: 'Regular License thường áp dụng cho một sản phẩm cuối hoặc một dự án cụ thể. Phạm vi chính xác vẫn ưu tiên theo thông tin tại trang sản phẩm và giấy phép đi kèm đơn hàng.',
        featured: true,
    },
    {
        category: 'license',
        question: 'Giấy phép mở rộng có dùng không giới hạn không?',
        answer: 'Không mặc định. Phạm vi của giấy phép mở rộng phải được ghi rõ tại sản phẩm hoặc xác nhận trước khi sử dụng, đặc biệt với SaaS, nhiều khách hàng hoặc sản phẩm bán lại.',
        link: { label: 'Xem điều khoản giấy phép', href: '/policy/license' },
    },
    {
        category: 'license',
        question: 'Tôi có được chia sẻ hoặc bán lại file nguồn không?',
        answer: 'Không. Việc mua sản phẩm cho phép sử dụng trong phạm vi giấy phép, không chuyển giao quyền phân phối file gốc. Bạn không được đăng công khai, chia sẻ hoặc bán lại gói nguồn.',
    },
    {
        category: 'support',
        question: 'Tôi có thể liên hệ hỗ trợ bằng cách nào?',
        answer: 'Bạn có thể gửi email tới veutong961@gmail.com, gọi 0971 386 588 hoặc dùng trang Liên hệ. Hãy gửi kèm mã đơn, tên sản phẩm và ảnh lỗi để được kiểm tra nhanh hơn.',
        link: { label: 'Mở trang liên hệ', href: '/contact' },
        featured: true,
    },
    {
        category: 'support',
        question: 'Thời gian phản hồi hỗ trợ là bao lâu?',
        answer: 'Yêu cầu thường được tiếp nhận trong ngày làm việc. Thời gian xử lý cụ thể phụ thuộc mức độ của vấn đề và thông tin bạn cung cấp. Đây là dự án cá nhân nên không vận hành như tổng đài 24/7.',
    },
];

const reveal = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

export default function FAQContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
    const [openQuestion, setOpenQuestion] = useState<string>(faqs[0].question);

    const counts = useMemo(() => {
        return Object.fromEntries(categories.map((category) => [
            category.id,
            category.id === 'all' ? faqs.length : faqs.filter((faq) => faq.category === category.id).length,
        ]));
    }, []);

    const filteredFaqs = useMemo(() => {
        const query = searchTerm.trim().toLocaleLowerCase('vi');
        return faqs.filter((faq) => {
            const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
            const matchesSearch = !query
                || faq.question.toLocaleLowerCase('vi').includes(query)
                || faq.answer.toLocaleLowerCase('vi').includes(query);
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchTerm]);

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
    };

    const clearFilters = () => {
        setSearchTerm('');
        setActiveCategory('all');
    };

    return (
        <main className="min-h-screen bg-[#f8fafc] text-slate-950">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <section className="relative overflow-hidden border-b border-orange-100 bg-[#fffaf6]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(234,88,12,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(234,88,12,0.055)_1px,transparent_1px)] bg-[size:48px_48px]" />
                <div className="relative mx-auto max-w-7xl px-4 pb-11 pt-6 sm:px-6 sm:pb-14 lg:px-8">
                    <nav className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500" aria-label="Breadcrumb">
                        <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-orange-600">
                            <Home size={15} /> Trang chủ
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-900">Câu hỏi thường gặp</span>
                    </nav>

                    <div className="grid items-end gap-9 lg:grid-cols-[1fr_390px] lg:gap-14">
                        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.45 }}>
                            <div className="mb-5 flex w-fit items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-orange-400">
                                    <HelpCircle size={21} />
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold">Trung tâm trợ giúp</p>
                                    <p className="mt-0.5 text-xs font-medium text-slate-500">Câu trả lời rõ ràng trước khi chọn mẫu</p>
                                </div>
                            </div>

                            <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                                Tìm câu trả lời <span className="text-orange-600">nhanh hơn.</span>
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base sm:leading-8">
                                Tra cứu thông tin về sản phẩm, demo, quyền truy cập, giấy phép và quy trình hỗ trợ tại Shop Web rẻ.
                            </p>

                            <label className="relative mt-7 block max-w-2xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Nhập từ khóa: demo, license, hỗ trợ..."
                                    className="h-14 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-12 text-sm font-semibold shadow-[0_14px_35px_rgba(15,23,42,0.08)] outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                                />
                                {searchTerm && (
                                    <button type="button" onClick={() => setSearchTerm('')} aria-label="Xóa từ khóa" className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                                        <X size={17} />
                                    </button>
                                )}
                            </label>
                        </motion.div>

                        <motion.aside
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.45, delay: 0.08 }}
                            className="rounded-lg border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_20px_45px_rgba(15,23,42,0.16)] sm:p-6"
                        >
                            <p className="text-xs font-bold uppercase text-orange-300">Thông tin nhanh</p>
                            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md bg-white/10">
                                <div className="bg-slate-950 p-4">
                                    <p className="text-2xl font-black">{faqs.length}</p>
                                    <p className="mt-1 text-xs text-slate-400">Câu trả lời</p>
                                </div>
                                <div className="bg-slate-950 p-4">
                                    <p className="text-2xl font-black">{categories.length - 1}</p>
                                    <p className="mt-1 text-xs text-slate-400">Nhóm chủ đề</p>
                                </div>
                            </div>
                            <div className="mt-5 flex items-start gap-3 border-t border-white/10 pt-4">
                                <BadgeCheck size={19} className="mt-0.5 shrink-0 text-emerald-400" />
                                <p className="text-xs font-medium leading-5 text-slate-300">Nội dung được đồng bộ với chính sách và quy trình hiện tại của website.</p>
                            </div>
                        </motion.aside>
                    </div>
                </div>
            </section>

            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
                    {categories.map((category) => {
                        const CategoryIcon = category.icon;
                        const active = activeCategory === category.id;
                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setActiveCategory(category.id)}
                                className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3.5 py-2.5 text-xs font-bold transition sm:text-sm ${active ? 'bg-orange-600 text-white shadow-md shadow-orange-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
                            >
                                <CategoryIcon size={16} />
                                {category.name}
                                <span className={`rounded px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-white text-slate-400'}`}>{counts[category.id]}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl items-start gap-7 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
                <div>
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-500">
                            Tìm thấy <strong className="text-slate-950">{filteredFaqs.length}</strong> câu hỏi
                            {searchTerm && <> cho “<strong className="text-orange-600">{searchTerm}</strong>”</>}
                        </p>
                        {(searchTerm || activeCategory !== 'all') && (
                            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700">
                                <X size={14} /> Xóa bộ lọc
                            </button>
                        )}
                    </div>

                    <motion.div initial="hidden" animate="visible" className="space-y-3">
                        {filteredFaqs.map((faq, index) => {
                            const category = categories.find((item) => item.id === faq.category)!;
                            const CategoryIcon = category.icon;
                            const isOpen = openQuestion === faq.question;

                            return (
                                <motion.article
                                    key={faq.question}
                                    variants={reveal}
                                    transition={{ duration: 0.3, delay: Math.min(index * 0.035, 0.2) }}
                                    className={`overflow-hidden rounded-lg border bg-white transition ${isOpen ? 'border-orange-300 shadow-[0_14px_35px_rgba(15,23,42,0.08)]' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <button
                                        type="button"
                                        aria-expanded={isOpen}
                                        onClick={() => setOpenQuestion(isOpen ? '' : faq.question)}
                                        className="flex w-full items-start gap-3 p-4 text-left sm:gap-4 sm:p-5"
                                    >
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition ${isOpen ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-600'}`}>
                                            <CategoryIcon size={19} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase text-slate-400">{category.name}</span>
                                                {faq.featured && <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">Phổ biến</span>}
                                            </div>
                                            <h2 className="mt-1.5 text-sm font-black leading-6 text-slate-950 sm:text-base">{faq.question}</h2>
                                        </div>
                                        <ChevronDown size={19} className={`mt-2 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-600' : ''}`} />
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.24, ease: 'easeOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="border-t border-slate-100 px-4 pb-5 pt-4 sm:ml-14 sm:px-5">
                                                    <p className="text-sm font-medium leading-7 text-slate-600">{faq.answer}</p>
                                                    {faq.link && (
                                                        <Link href={faq.link.href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700">
                                                            {faq.link.label} <ArrowRight size={15} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.article>
                            );
                        })}
                    </motion.div>

                    {filteredFaqs.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><Search size={22} /></div>
                            <h2 className="mt-4 text-lg font-black">Chưa có câu trả lời phù hợp</h2>
                            <p className="mt-2 text-sm text-slate-500">Thử từ khóa ngắn hơn hoặc gửi yêu cầu để được kiểm tra trực tiếp.</p>
                            <button type="button" onClick={clearFilters} className="mt-5 rounded-md bg-orange-600 px-4 py-2.5 text-sm font-bold text-white">Xóa bộ lọc</button>
                        </div>
                    )}
                </div>

                <aside className="space-y-5 lg:sticky lg:top-20">
                    <div className="rounded-lg bg-slate-950 p-5 text-white sm:p-6">
                        <MessageCircle size={22} className="text-orange-400" />
                        <h2 className="mt-4 text-xl font-black">Vẫn chưa tìm thấy?</h2>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-400">Gửi tên sản phẩm, mã đơn và ảnh lỗi để mình kiểm tra trực tiếp.</p>
                        <Link href="/contact" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-bold text-white transition hover:bg-orange-500">
                            Liên hệ hỗ trợ <ArrowRight size={16} />
                        </Link>
                        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                            <Mail size={14} /> veutong961@gmail.com
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <BookOpen size={21} className="text-orange-600" />
                        <h2 className="mt-4 text-lg font-black">Thông tin quan trọng</h2>
                        <div className="mt-4 space-y-3">
                            {[
                                ['Điều khoản sử dụng', '/policy/terms'],
                                ['Chính sách hoàn tiền', '/policy/refund'],
                                ['Điều khoản giấy phép', '/policy/license'],
                            ].map(([label, href]) => (
                                <Link key={href} href={href} className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm font-bold text-slate-600 transition last:border-0 last:pb-0 hover:text-orange-600">
                                    {label} <ChevronRight size={15} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                        <div className="flex items-start gap-3">
                            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                            <div>
                                <p className="text-sm font-black">Mua đúng nhu cầu</p>
                                <p className="mt-1 text-xs font-medium leading-5 text-slate-600">Nên kiểm tra demo, định dạng file và công nghệ trước khi gửi nhu cầu.</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </section>
        </main>
    );
}
