'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    ArrowRight, BookOpen, Check, ChevronRight, Code2, ExternalLink,
    Facebook, Home, Mail, MessageCircle, Phone, Search, ShieldCheck,
    Sparkles, UserRound,
} from 'lucide-react';

const reveal = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const principles = [
    {
        icon: Search,
        title: 'Chọn lọc thực tế',
        description: 'Ưu tiên giao diện có bố cục rõ ràng, dễ kiểm tra demo và phù hợp với nhu cầu triển khai thật.',
    },
    {
        icon: Code2,
        title: 'Thông tin minh bạch',
        description: 'Công nghệ, định dạng file và khả năng tương thích được trình bày rõ ràng trước khi khách hàng mua.',
    },
    {
        icon: ShieldCheck,
        title: 'Hỗ trợ có trách nhiệm',
        description: 'Mọi trao đổi đều do mình trực tiếp tiếp nhận, theo dõi và phản hồi trong phạm vi hỗ trợ của sản phẩm.',
    },
];

const productGroups = [
    {
        title: 'Figma và UI Kit',
        icons: [['Figma', 'figma/figma-original.svg']],
    },
    {
        title: 'HTML, CSS, JavaScript',
        icons: [
            ['HTML5', 'html5/html5-original.svg'],
            ['CSS3', 'css3/css3-original.svg'],
            ['JavaScript', 'javascript/javascript-original.svg'],
        ],
    },
    {
        title: 'React và Next.js',
        icons: [
            ['React', 'react/react-original.svg'],
            ['Next.js', 'nextjs/nextjs-original.svg'],
        ],
    },
    {
        title: 'Vue, Laravel, Django và .NET',
        icons: [
            ['Vue.js', 'vuejs/vuejs-original.svg'],
            ['Laravel', 'laravel/laravel-original.svg'],
            ['Django', 'django/django-plain.svg'],
            ['.NET', 'dot-net/dot-net-original.svg'],
        ],
    },
];

const deviconBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

const milestones = [
    {
        year: '2025',
        title: 'Đặt những viên gạch đầu tiên',
        description: 'Bắt đầu nghiên cứu thị trường giao diện website, xây nền tảng kỹ thuật và định hình cách chọn lọc sản phẩm.',
    },
    {
        year: '2026',
        title: 'Hoàn thiện Shop Web rẻ',
        description: 'Phát triển kho giao diện, quy trình mua hàng, tải file, quản lý phiên bản và nội dung tư vấn dành cho người Việt.',
    },
    {
        year: 'Tiếp theo',
        title: 'Phát triển bền vững',
        description: 'Tiếp tục bổ sung sản phẩm phù hợp, chia sẻ kiến thức qua blog và cải thiện dựa trên phản hồi thực tế.',
    },
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white text-slate-950">
            <section className="relative overflow-hidden border-b border-orange-100 bg-[#fffaf6]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(234,88,12,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(234,88,12,0.055)_1px,transparent_1px)] bg-[size:48px_48px]" />
                <div className="relative mx-auto max-w-7xl px-4 pb-11 pt-6 sm:px-6 sm:pb-14 md:pb-16 md:pt-9 lg:px-8">
                    <nav className="mb-7 flex items-center gap-2 text-sm font-semibold text-slate-500 sm:mb-9" aria-label="Breadcrumb">
                        <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-orange-600">
                            <Home size={15} /> Trang chủ
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-900">Giới thiệu</span>
                    </nav>

                    <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
                        <motion.div initial="hidden" animate="visible" variants={stagger}>
                            <motion.div variants={reveal} className="mb-5 flex w-fit items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-950 text-orange-400">
                                    <UserRound size={21} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-extrabold text-slate-950">Dự án cá nhân độc lập</p>
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                                    </div>
                                    <p className="mt-0.5 text-xs font-medium text-slate-500">Trực tiếp xây dựng và hỗ trợ khách hàng</p>
                                </div>
                            </motion.div>
                            <motion.div variants={reveal} className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-[10px] font-bold uppercase text-orange-700 shadow-sm sm:text-xs">
                                <Sparkles size={15} /> Thương hiệu cá nhân từ năm 2025
                            </motion.div>
                            <motion.h1 variants={reveal} className="max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl md:text-5xl lg:text-6xl">
                                Mình xây Shop Web rẻ để việc chọn giao diện website
                                <span className="text-orange-600"> đơn giản hơn.</span>
                            </motion.h1>
                            <motion.p variants={reveal} className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base sm:leading-8 md:mt-6 md:text-lg">
                                Shop Web rẻ là dự án cá nhân do <strong className="text-slate-900">Lương Thế Vinh</strong> xây dựng.
                                Mình tập trung chọn lọc giao diện, template và mã nguồn phù hợp với người dùng Việt Nam,
                                trình bày thông tin rõ ràng và hỗ trợ trực tiếp khi khách hàng cần.
                            </motion.p>
                            <motion.div variants={reveal} className="mt-7 grid grid-cols-2 gap-2 sm:mt-8 sm:flex sm:gap-3">
                                <Link href="/products" className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-2.5 py-3 text-center text-[11px] font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 sm:px-6 sm:py-3.5 sm:text-sm">
                                    <span className="truncate">Khám phá sản phẩm</span> <ArrowRight size={15} className="shrink-0 sm:h-[17px] sm:w-[17px]" />
                                </Link>
                                <a href="https://blog.webgiare.id.vn/" target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-3 text-center text-[11px] font-bold text-slate-700 transition hover:border-orange-200 hover:text-orange-700 sm:px-6 sm:py-3.5 sm:text-sm">
                                    <span className="truncate">Đọc blog chia sẻ</span> <ExternalLink size={14} className="shrink-0 sm:h-4 sm:w-4" />
                                </a>
                            </motion.div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 24, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.55, delay: 0.12 }}>
                            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_28px_70px_rgba(15,23,42,0.18)] sm:p-6 md:p-8">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-5 sm:gap-5 sm:pb-6">
                                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-white/15 bg-white/5 shadow-lg sm:h-24 sm:w-24">
                                        <Image
                                            src="/luongvinh.jpg"
                                            alt="Lương Thế Vinh"
                                            fill
                                            sizes="(min-width: 640px) 96px, 80px"
                                            priority
                                            className="object-cover object-[center_30%]"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-lg font-extrabold leading-tight sm:text-xl">Lương Thế Vinh</p>
                                        <p className="mt-1 text-xs font-semibold leading-5 text-orange-300 sm:text-sm">Người xây dựng Shop Web rẻ</p>
                                    </div>
                                </div>
                                <p className="mt-5 text-sm font-medium leading-7 text-slate-300 sm:mt-6">
                                    Mình trực tiếp phát triển website, quản lý nội dung sản phẩm và hỗ trợ khách hàng.
                                    Không phải một đội ngũ lớn, nhưng mỗi phần của dự án đều được làm với sự chỉn chu và trách nhiệm.
                                </p>
                                <div className="mt-5 space-y-3 sm:mt-6">
                                    <a href="mailto:veutong961@gmail.com" className="flex min-w-0 items-center gap-3 text-xs font-semibold text-slate-200 transition hover:text-orange-300 sm:text-sm">
                                        <Mail size={17} className="text-orange-400" /> veutong961@gmail.com
                                    </a>
                                    <a href="tel:0971386588" className="flex items-center gap-3 text-xs font-semibold text-slate-200 transition hover:text-orange-300 sm:text-sm">
                                        <Phone size={17} className="text-orange-400" /> 0971 386 588
                                    </a>
                                    <a href="https://www.facebook.com/Ltvinh212" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-semibold text-slate-200 transition hover:text-orange-300 sm:text-sm">
                                        <Facebook size={17} className="text-orange-400" /> Facebook: Lương Vinh
                                    </a>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="border-b border-slate-100 bg-white">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.35 }}
                    variants={stagger}
                    className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 md:grid-cols-4 lg:px-8"
                >
                    {[
                        ['2025', 'Bắt đầu xây nền móng'],
                        ['01', 'Người trực tiếp vận hành'],
                        ['04', 'Nhóm sản phẩm trọng tâm'],
                        ['Việt Nam', 'Thị trường phục vụ'],
                    ].map(([value, label]) => (
                        <motion.div key={label} variants={reveal} className="border-b border-r border-slate-100 px-2 py-6 text-center even:border-r-0 md:border-b-0 md:border-r md:px-3 md:py-9 md:last:border-r-0">
                            <p className="text-2xl font-black text-orange-600 md:text-3xl">{value}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500 md:text-sm">{label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-11 sm:px-6 sm:py-14 md:py-16 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                    <div>
                        <p className="text-xs font-extrabold uppercase text-orange-600">Câu chuyện bắt đầu</p>
                        <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">Từ một nhu cầu rất thực tế</h2>
                        <p className="mt-5 text-base font-medium leading-8 text-slate-600">
                            Khi tìm một giao diện phù hợp, người mua thường phải xem qua nhiều nguồn, khó biết file gồm những gì,
                            dùng công nghệ nào và có phù hợp với dự án hay không. Từ năm 2025, mình bắt đầu dựng nền móng cho một
                            nơi tập trung các sản phẩm số với thông tin dễ đọc và quy trình mua hàng rõ ràng hơn.
                        </p>
                        <p className="mt-4 text-base font-medium leading-8 text-slate-600">
                            Shop Web rẻ không đặt mục tiêu trở thành một kho khổng lồ bằng mọi giá. Mình ưu tiên sản phẩm có tính
                            ứng dụng, mức giá hợp lý và đủ thông tin để khách hàng đưa ra quyết định phù hợp.
                        </p>
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={stagger}
                        className="grid grid-cols-2 gap-2.5 sm:gap-4"
                    >
                        {productGroups.map((group, index) => (
                            <motion.article
                                key={group.title}
                                variants={reveal}
                                whileHover={{ y: -4 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                                className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.045)] sm:p-5"
                            >
                                <div className="flex min-h-9 flex-wrap items-center gap-1.5 sm:min-h-11 sm:gap-2">
                                    {group.icons.map(([name, path], iconIndex) => (
                                        <motion.div
                                            key={name}
                                            initial={{ opacity: 0, scale: 0.75 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.08 + iconIndex * 0.06 }}
                                            whileHover={{ scale: 1.12, rotate: iconIndex % 2 === 0 ? -3 : 3 }}
                                            title={name}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 p-1.5 ring-1 ring-slate-100 sm:h-10 sm:w-10 sm:p-2"
                                        >
                                            <img
                                                src={`${deviconBase}/${path}`}
                                                alt={`${name} logo`}
                                                className="h-full w-full object-contain"
                                                loading="lazy"
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                                <p className="mt-3 text-[9px] font-bold uppercase text-orange-600 sm:mt-4 sm:text-[10px]">Nhóm {index + 1}</p>
                                <h3 className="mt-1 break-words text-xs font-bold leading-5 text-slate-900 sm:text-base sm:leading-6">{group.title}</h3>
                            </motion.article>
                        ))}
                    </motion.div>
                </div>
            </section>

            <section className="bg-slate-50 py-11 sm:py-14 md:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <p className="text-xs font-extrabold uppercase text-orange-600">Cách mình làm việc</p>
                        <h2 className="mt-3 text-3xl font-black md:text-4xl">Ba nguyên tắc luôn được giữ lại</h2>
                    </div>
                    <div className="mt-7 grid gap-4 sm:mt-9 md:grid-cols-3 md:gap-6">
                        {principles.map((item, index) => (
                            <motion.article key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal} transition={{ duration: 0.35, delay: index * 0.08 }} className="border-t-2 border-orange-500 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
                                <item.icon size={26} className="text-orange-600" />
                                <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
                                <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{item.description}</p>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-11 sm:px-6 sm:py-14 md:py-16 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
                    <div>
                        <p className="text-xs font-extrabold uppercase text-orange-600">Hành trình</p>
                        <h2 className="mt-3 text-3xl font-black md:text-4xl">Xây chậm, làm chắc</h2>
                        <p className="mt-5 text-base font-medium leading-8 text-slate-600">
                            Mốc 2025 là thời điểm dự án được dựng móng. Mỗi giai đoạn sau đó tập trung hoàn thiện một phần cụ thể,
                            từ nền tảng kỹ thuật đến trải nghiệm mua và sử dụng sản phẩm.
                        </p>
                    </div>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="border-l border-orange-200">
                        {milestones.map((item) => (
                            <motion.div key={item.year} variants={reveal} className="relative pb-10 pl-7 sm:pl-8 last:pb-0">
                                <motion.span
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: 'spring', stiffness: 340, damping: 20 }}
                                    className="absolute -left-2 top-1.5 h-4 w-4 rounded-full border-4 border-white bg-orange-600 shadow"
                                />
                                <p className="text-sm font-black text-orange-600">{item.year}</p>
                                <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
                                <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-slate-600">{item.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <section className="border-y border-orange-100 bg-[#fff7ed]">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.45 }}
                    className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-9 sm:px-6 sm:py-11 md:grid-cols-[1fr_auto] md:gap-8 lg:px-8"
                >
                    <div className="flex items-start gap-4">
                        <BookOpen size={28} className="mt-1 shrink-0 text-orange-600" />
                        <div>
                            <h2 className="text-2xl font-black md:text-3xl">Blog Web Giá Rẻ</h2>
                            <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-slate-600">
                                Nơi mình chia sẻ kinh nghiệm về giao diện website, SEO, hiệu năng và quá trình xây dựng sản phẩm số.
                            </p>
                        </div>
                    </div>
                    <a href="https://blog.webgiare.id.vn/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600">
                        Truy cập blog <ExternalLink size={16} />
                    </a>
                </motion.div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-11 sm:px-6 sm:py-14 md:py-16 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.985 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5 }}
                    className="overflow-hidden rounded-lg bg-slate-950 px-5 py-9 text-white sm:px-6 sm:py-10 md:px-10 md:py-12"
                >
                    <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
                        <div>
                            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-orange-300"><MessageCircle size={16} /> Trao đổi trực tiếp</div>
                            <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">Bạn đang cần tìm một giao diện phù hợp?</h2>
                            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-300">
                                Gửi cho mình nhu cầu, công nghệ và mức ngân sách dự kiến. Mình sẽ phản hồi dựa trên những sản phẩm thực sự có trong kho.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3 md:flex-col">
                            <a href="mailto:veutong961@gmail.com" className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-2.5 py-3 text-xs font-bold text-white transition hover:bg-orange-700 sm:px-6 sm:py-3.5 sm:text-sm"><Mail size={15} className="shrink-0" /> <span className="truncate">Gửi email</span></a>
                            <a href="tel:0971386588" className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg border border-white/20 px-2.5 py-3 text-xs font-bold text-white transition hover:bg-white/10 sm:px-6 sm:py-3.5 sm:text-sm"><Phone size={15} className="shrink-0" /> <span className="truncate">0971 386 588</span></a>
                        </div>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-xs font-semibold text-slate-400">
                        <span className="inline-flex items-center gap-1.5"><UserRound size={14} /> Lương Thế Vinh</span>
                        <a href="https://www.facebook.com/Ltvinh212" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-orange-300"><Facebook size={14} /> Lương Vinh</a>
                        <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Hỗ trợ trực tiếp</span>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
