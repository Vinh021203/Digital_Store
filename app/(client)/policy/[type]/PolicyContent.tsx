'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, BookOpen,
    CheckCircle2, ChevronRight, Clock3, CreditCard, Database,
    Download, Eye, FileCheck2, FileText, Fingerprint, Headphones,
    Home, KeyRound, LockKeyhole, Mail, RefreshCcw, Scale,
    ShieldCheck, UserRound, UsersRound, XCircle,
} from 'lucide-react';

type PolicySection = {
    title: string;
    icon: LucideIcon;
    paragraphs: string[];
    bullets?: string[];
    note?: string;
};

type Policy = {
    title: string;
    shortTitle: string;
    description: string;
    eyebrow: string;
    icon: LucideIcon;
    summary: string;
    sections: PolicySection[];
};

const UPDATED_AT = '22/06/2026';

const POLICIES: Record<string, Policy> = {
    privacy: {
        title: 'Chính sách bảo mật',
        shortTitle: 'Bảo mật',
        eyebrow: 'Quyền riêng tư và dữ liệu',
        icon: ShieldCheck,
        description: 'Cách Web Giá Rẻ - Portfolio thu thập, sử dụng và bảo vệ thông tin trong quá trình bạn sử dụng website.',
        summary: 'Web Giá Rẻ - Portfolio chỉ thu thập dữ liệu cần thiết để vận hành tài khoản, xử lý yêu cầu và hỗ trợ khách hàng.',
        sections: [
            {
                title: 'Thông tin được thu thập',
                icon: Database,
                paragraphs: [
                    'Khi bạn đăng ký tài khoản, gửi yêu cầu tư vấn hoặc yêu cầu hỗ trợ, Web Giá Rẻ - Portfolio có thể tiếp nhận một số thông tin cần thiết để cung cấp dịch vụ.',
                ],
                bullets: [
                    'Họ tên, địa chỉ email và số điện thoại do bạn cung cấp.',
                    'Thông tin yêu cầu, mẫu demo, quyền truy cập và lịch sử truy cập tài nguyên.',
                    'Dữ liệu kỹ thuật cơ bản như thiết bị, trình duyệt và nhật ký truy cập phục vụ bảo mật.',
                ],
            },
            {
                title: 'Mục đích sử dụng dữ liệu',
                icon: Eye,
                paragraphs: [
                    'Thông tin được sử dụng đúng với mục đích vận hành dịch vụ và hỗ trợ giao dịch của bạn.',
                ],
                bullets: [
                    'Xác thực tài khoản và quản lý quyền truy cập.',
                    'Xử lý xác nhận tư vấn, cấp quyền truy cập tài nguyên tham khảo và quyền truy cập mẫu demo.',
                    'Gửi thông báo quan trọng liên quan đến yêu cầu hoặc bảo mật.',
                    'Tiếp nhận yêu cầu hỗ trợ và cải thiện trải nghiệm website.',
                ],
            },
            {
                title: 'Lưu trữ và bảo vệ',
                icon: LockKeyhole,
                paragraphs: [
                    'Web Giá Rẻ - Portfolio sử dụng các dịch vụ hạ tầng và xác nhận tư vấn phù hợp để lưu trữ, xử lý dữ liệu. Quyền truy cập quản trị được giới hạn theo vai trò và mục đích sử dụng.',
                    'Không có hệ thống trực tuyến nào bảo đảm an toàn tuyệt đối. Khi phát hiện dấu hiệu bất thường, bạn nên đổi mật khẩu và liên hệ ngay để được kiểm tra.',
                ],
            },
            {
                title: 'Chia sẻ với bên cung cấp dịch vụ',
                icon: UsersRound,
                paragraphs: [
                    'Dữ liệu có thể được xử lý bởi các nhà cung cấp hạ tầng, xác thực, lưu trữ file, email hoặc xác nhận tư vấn khi cần thiết để hoàn thành dịch vụ.',
                    'Web Giá Rẻ - Portfolio không chia sẻ thông tin cá nhân cho mục đích thương mại. Thông tin chỉ được cung cấp khi có căn cứ hợp pháp, yêu cầu từ cơ quan có thẩm quyền hoặc để bảo vệ quyền lợi chính đáng.',
                ],
            },
            {
                title: 'Quyền của bạn',
                icon: Fingerprint,
                paragraphs: [
                    'Bạn có thể yêu cầu kiểm tra, cập nhật hoặc đề nghị xóa thông tin cá nhân trong phạm vi pháp luật và nghĩa vụ lưu trữ giao dịch cho phép.',
                ],
                note: 'Gửi yêu cầu qua email contact@webgiare.id.vn và cung cấp email tài khoản để xác minh.',
            },
        ],
    },
    terms: {
        title: 'Điều khoản sử dụng',
        shortTitle: 'Điều khoản',
        eyebrow: 'Quy định sử dụng dịch vụ',
        icon: Scale,
        description: 'Các nguyên tắc áp dụng khi truy cập website, tạo tài khoản và chọn mẫu demo số tại Web Giá Rẻ - Portfolio.',
        summary: 'Việc sử dụng website đồng nghĩa với việc bạn đồng ý tuân thủ các quy định được công bố tại đây.',
        sections: [
            {
                title: 'Phạm vi áp dụng',
                icon: FileCheck2,
                paragraphs: [
                    'Điều khoản này áp dụng cho người truy cập, thành viên và khách hàng sử dụng các chức năng, nội dung hoặc mẫu demo được cung cấp trên Web Giá Rẻ - Portfolio.',
                    'Nếu không đồng ý với một nội dung trong điều khoản, bạn nên ngừng sử dụng phần dịch vụ có liên quan và liên hệ để được giải thích.',
                ],
            },
            {
                title: 'Tài khoản người dùng',
                icon: UserRound,
                paragraphs: [
                    'Bạn chịu trách nhiệm cung cấp thông tin chính xác, giữ bí mật thông tin đăng nhập và kiểm soát hoạt động phát sinh từ tài khoản của mình.',
                ],
                bullets: [
                    'Không chia sẻ tài khoản hoặc quyền truy cập tài nguyên tham khảo cho người không có quyền.',
                    'Không giả mạo danh tính hoặc sử dụng thông tin xác nhận tư vấn trái phép.',
                    'Thông báo ngay khi nghi ngờ tài khoản bị truy cập ngoài ý muốn.',
                ],
            },
            {
                title: 'Đặt hàng và xác nhận tư vấn',
                icon: CreditCard,
                paragraphs: [
                    'Yêu cầu chỉ được xác nhận sau khi hệ thống ghi nhận thông tin hợp lệ. Giá tham khảo, ưu đãi và phạm vi quyền truy cập được hiển thị tại thời điểm gửi yêu cầu.',
                    'Trong trường hợp giao dịch bị chậm đối soát, khách hàng nên giữ lại biên nhận và mã đơn để được kiểm tra.',
                ],
            },
            {
                title: 'Sử dụng mẫu demo số',
                icon: Download,
                paragraphs: [
                    'Mẫu demo được sử dụng theo loại quyền truy cập đi kèm yêu cầu. Việc chọn mẫu demo không đồng nghĩa với việc chuyển giao quyền tác giả hoặc quyền phân phối tài nguyên gốc.',
                ],
                bullets: [
                    'Không đăng tải công khai, chia sẻ hoặc phân phối lại tài nguyên gốc.',
                    'Không sử dụng mẫu demo vào hoạt động vi phạm pháp luật.',
                    'Không can thiệp trái phép vào hệ thống truy cập tài nguyên tham khảo, xác nhận tư vấn hoặc cấp quyền truy cập.',
                ],
            },
            {
                title: 'Tạm ngừng quyền truy cập',
                icon: AlertTriangle,
                paragraphs: [
                    'Web Giá Rẻ - Portfolio có thể tạm khóa tài khoản, quyền tải hoặc quyền truy cập khi có dấu hiệu gian lận, chia sẻ trái phép, tấn công hệ thống hoặc vi phạm nghiêm trọng điều khoản.',
                ],
                note: 'Trước khi áp dụng biện pháp lâu dài, thông tin liên quan sẽ được kiểm tra trên dữ liệu giao dịch hiện có.',
            },
        ],
    },
    refund: {
        title: 'Chính sách xử lý yêu cầu',
        shortTitle: 'Xử lý yêu cầu',
        eyebrow: 'Xử lý giao dịch mẫu demo số',
        icon: RefreshCcw,
        description: 'Điều kiện và quy trình tiếp nhận yêu cầu xử lý yêu cầu đối với giao diện, template và mã nguồn số.',
        summary: 'Do mẫu demo có thể được truy cập tài nguyên ngay, yêu cầu xử lý yêu cầu được xem xét dựa trên lỗi thực tế và lịch sử truy cập tài nguyên tham khảo.',
        sections: [
            {
                title: 'Trường hợp được xem xét',
                icon: CheckCircle2,
                paragraphs: [
                    'Bạn có thể gửi yêu cầu trong vòng 7 ngày kể từ thời điểm xác nhận tư vấn khi mẫu demo có vấn đề nghiêm trọng thuộc trách nhiệm của bên cung cấp.',
                ],
                bullets: [
                    'File không thể truy cập tài nguyên hoặc bị hỏng và không thể thay thế.',
                    'Mẫu demo khác đáng kể so với nội dung mô tả tại thời điểm được tư vấn.',
                    'Lỗi kỹ thuật cốt lõi đã được xác minh nhưng không có phương án khắc phục hợp lý.',
                    'Giao dịch bị ghi nhận trùng do lỗi hệ thống.',
                ],
            },
            {
                title: 'Trường hợp không áp dụng',
                icon: XCircle,
                paragraphs: [
                    'Yêu cầu có thể bị từ chối khi mẫu demo vẫn hoạt động đúng mô tả hoặc vấn đề phát sinh ngoài phạm vi của mẫu demo.',
                ],
                bullets: [
                    'Thay đổi ý định, chọn nhầm hoặc không còn nhu cầu sử dụng.',
                    'Thiếu kiến thức, phần mềm hoặc môi trường cần thiết để chỉnh sửa mẫu demo.',
                    'Mẫu demo đã được sử dụng, sao chép hoặc triển khai nhưng không có lỗi được xác minh.',
                    'Yêu cầu được gửi sau thời hạn hoặc tài khoản vi phạm điều khoản sử dụng.',
                ],
            },
            {
                title: 'Cách gửi yêu cầu',
                icon: Mail,
                paragraphs: [
                    'Gửi email tới contact@webgiare.id.vn với tiêu đề “Yêu cầu xử lý yêu cầu” để việc kiểm tra được nhanh và chính xác.',
                ],
                bullets: [
                    'Mã yêu cầu và email dùng khi gửi nhu cầu.',
                    'Tên mẫu demo và mô tả cụ thể vấn đề.',
                    'Ảnh chụp, video hoặc thông báo lỗi nếu có.',
                    'Các bước bạn đã thử để xử lý vấn đề.',
                ],
            },
            {
                title: 'Thời gian xử lý',
                icon: Clock3,
                paragraphs: [
                    'Yêu cầu hợp lệ thường được phản hồi ban đầu trong 1-2 ngày làm việc. Nếu được chấp thuận, thời gian tiền về phụ thuộc vào ngân hàng hoặc phương thức xác nhận tư vấn ban đầu.',
                    'Quyền truy cập tài nguyên tham khảo và quyền truy cập của yêu cầu được xử lý yêu cầu có thể bị thu hồi sau khi yêu cầu hoàn tất.',
                ],
            },
        ],
    },
    license: {
        title: 'Điều khoản quyền truy cập',
        shortTitle: 'Quyền truy cập',
        eyebrow: 'Quyền sử dụng mẫu demo',
        icon: KeyRound,
        description: 'Phạm vi sử dụng, chỉnh sửa và các giới hạn áp dụng cho mẫu demo số tại Web Giá Rẻ - Portfolio.',
        summary: 'Quyền truy cập cho phép bạn sử dụng mẫu demo theo phạm vi yêu cầu, nhưng không chuyển giao quyền sở hữu tài nguyên gốc.',
        sections: [
            {
                title: 'Quyền truy cập Regular',
                icon: KeyRound,
                paragraphs: [
                    'Quyền truy cập cơ bản áp dụng cho một mẫu demo cuối hoặc một dự án của người được cấp quyền hay một khách hàng cụ thể, trừ khi trang mẫu demo có quy định khác.',
                ],
                bullets: [
                    'Được chỉnh sửa giao diện và mã nguồn cho dự án được cấp phép.',
                    'Được sử dụng trong dự án cá nhân hoặc thương mại phù hợp.',
                    'Được bàn giao mẫu demo cuối cho khách hàng của dự án đó.',
                ],
            },
            {
                title: 'Quyền truy cập mở rộng',
                icon: BadgeCheck,
                paragraphs: [
                    'Nếu một mẫu demo có tùy chọn quyền truy cập mở rộng, phạm vi cụ thể sẽ được ghi tại trang mẫu demo hoặc yêu cầu. Không mặc định mọi quyền truy cập mở rộng đều cho phép sử dụng không giới hạn.',
                ],
                note: 'Hãy liên hệ trước khi sử dụng nếu bạn cần dùng cho SaaS hoặc nhiều khách hàng.',
            },
            {
                title: 'Quyền chỉnh sửa',
                icon: FileText,
                paragraphs: [
                    'Bạn có thể chỉnh sửa nội dung, màu sắc, bố cục và mã nguồn để phù hợp với dự án trong phạm vi quyền truy cập.',
                    'Các phần mềm, thư viện, font hoặc tài nguyên bên thứ ba đi kèm có thể chịu điều khoản riêng của nhà cung cấp tương ứng.',
                ],
            },
            {
                title: 'Hành vi không được phép',
                icon: AlertTriangle,
                paragraphs: [
                    'Dù đã chỉnh sửa một phần hay toàn bộ, bạn vẫn không được thực hiện các hành vi làm lộ hoặc cạnh tranh trực tiếp bằng tài nguyên nguồn của mẫu demo.',
                ],
                bullets: [
                    'Chia sẻ hoặc phân phối lại tài nguyên nguồn dưới mọi hình thức.',
                    'Đưa file lên kho tải công khai, nhóm chia sẻ hoặc dịch vụ lưu trữ dùng chung.',
                    'Chuyển nhượng quyền truy cập độc lập với dự án được cấp phép.',
                    'Tuyên bố người gửi là tác giả hoặc chủ thể có quyền hợp pháp đối với toàn bộ mẫu demo gốc.',
                ],
            },
            {
                title: 'Thu hồi quyền truy cập',
                icon: LockKeyhole,
                paragraphs: [
                    'Quyền truy cập có thể bị tạm ngừng hoặc thu hồi nếu yêu cầu được xử lý yêu cầu, giao dịch bị hủy hoặc phát hiện hành vi vi phạm phạm vi sử dụng.',
                ],
            },
        ],
    },
};

const policyOrder = ['privacy', 'terms', 'refund', 'license'];

const reveal = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

export default function PolicyContent({ type }: { type: string }) {
    const policy = POLICIES[type];

    if (!policy) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-[#f8fafc] px-4">
                <div className="max-w-md text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-slate-950 text-orange-400">
                        <FileText size={26} />
                    </div>
                    <h1 className="mt-5 text-2xl font-black">Không tìm thấy chính sách</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Đường dẫn này không thuộc hệ thống chính sách hiện có.</p>
                    <Link href="/policy/terms" className="mt-6 inline-flex items-center gap-2 rounded-md bg-orange-600 px-5 py-3 text-sm font-bold text-white">
                        Xem điều khoản <ArrowRight size={16} />
                    </Link>
                </div>
            </main>
        );
    }

    const Icon = policy.icon;
    const currentIndex = policyOrder.indexOf(type);
    const previous = currentIndex > 0 ? policyOrder[currentIndex - 1] : null;
    const next = currentIndex < policyOrder.length - 1 ? policyOrder[currentIndex + 1] : null;

    return (
        <main className="min-h-screen bg-[#f8fafc] text-slate-950">
            <section className="relative overflow-hidden border-b border-orange-100 bg-[#fffaf6]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(234,88,12,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(234,88,12,0.055)_1px,transparent_1px)] bg-[size:48px_48px]" />
                <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 lg:px-8">
                    <nav className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500" aria-label="Breadcrumb">
                        <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-orange-600">
                            <Home size={15} /> Trang chủ
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-900">{policy.shortTitle}</span>
                    </nav>

                    <div className="grid items-end gap-8 lg:grid-cols-[1fr_390px] lg:gap-14">
                        <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.45 }}>
                            <div className="mb-5 flex w-fit items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-orange-400">
                                    <Icon size={21} />
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold">Trung tâm chính sách</p>
                                    <p className="mt-0.5 text-xs font-medium text-slate-500">{policy.eyebrow}</p>
                                </div>
                            </div>
                            <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-4xl md:text-5xl">{policy.title}</h1>
                            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base sm:leading-8">{policy.description}</p>
                        </motion.div>

                        <motion.aside
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.45, delay: 0.08 }}
                            className="rounded-lg border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_20px_45px_rgba(15,23,42,0.16)]"
                        >
                            <p className="text-xs font-bold uppercase text-orange-300">Tóm tắt nhanh</p>
                            <p className="mt-3 text-sm font-semibold leading-6 text-slate-200">{policy.summary}</p>
                            <div className="mt-5 grid grid-cols-2 border-t border-white/10 pt-4 text-xs">
                                <div className="border-r border-white/10">
                                    <p className="text-slate-500">Cập nhật</p>
                                    <p className="mt-1 font-bold text-white">{UPDATED_AT}</p>
                                </div>
                                <div className="pl-4">
                                    <p className="text-slate-500">Nội dung</p>
                                    <p className="mt-1 font-bold text-white">{policy.sections.length} mục chính</p>
                                </div>
                            </div>
                        </motion.aside>
                    </div>
                </div>
            </section>

            <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
                <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden" aria-label="Các chính sách">
                    {policyOrder.map((key) => {
                        const item = POLICIES[key];
                        const ItemIcon = item.icon;
                        const active = key === type;
                        return (
                            <Link
                                key={key}
                                href={`/policy/${key}`}
                                className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3.5 py-2.5 text-xs font-bold transition sm:text-sm ${active ? 'bg-orange-600 text-white shadow-md shadow-orange-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
                            >
                                <ItemIcon size={16} /> {item.shortTitle}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <section className="mx-auto grid max-w-7xl items-start gap-7 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8">
                <aside className="hidden space-y-4 lg:sticky lg:top-20 lg:block">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <BookOpen size={17} className="text-orange-600" />
                            <p className="text-sm font-black">Trong tài liệu này</p>
                        </div>
                        <ol className="mt-2">
                            {policy.sections.map((section, index) => (
                                <li key={section.title}>
                                    <a href={`#section-${index + 1}`} className="flex gap-2 border-l-2 border-slate-100 px-3 py-2.5 text-xs font-semibold leading-5 text-slate-500 transition hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700">
                                        <span className="text-slate-300">{String(index + 1).padStart(2, '0')}</span>
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="rounded-lg bg-slate-950 p-5 text-white">
                        <Headphones size={20} className="text-orange-400" />
                        <p className="mt-4 text-sm font-black">Cần làm rõ nội dung?</p>
                        <p className="mt-2 text-xs font-medium leading-5 text-slate-400">Trao đổi trực tiếp trước khi chọn hoặc sử dụng mẫu demo.</p>
                        <Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-orange-300 hover:text-orange-200">
                            Liên hệ hỗ trợ <ArrowRight size={14} />
                        </Link>
                    </div>
                </aside>

                <motion.article
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.05 }}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                >
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-8">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                            <span className="inline-flex items-center gap-1.5"><FileText size={14} /> Tài liệu chính thức</span>
                            <span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> Cập nhật {UPDATED_AT}</span>
                            <span className="inline-flex items-center gap-1.5"><BadgeCheck size={14} /> Áp dụng tại Web Giá Rẻ - Portfolio</span>
                        </div>
                    </div>

                    <div className="px-5 sm:px-8">
                        {policy.sections.map((section, index) => {
                            const SectionIcon = section.icon;
                            return (
                                <motion.section
                                    id={`section-${index + 1}`}
                                    key={section.title}
                                    variants={reveal}
                                    transition={{ duration: 0.35, delay: index * 0.04 }}
                                    className="scroll-mt-28 border-b border-slate-200 py-7 last:border-b-0 sm:py-9"
                                >
                                    <div className="grid gap-4 sm:grid-cols-[48px_1fr] sm:gap-5">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                                            <SectionIcon size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-xs font-black text-orange-600">{String(index + 1).padStart(2, '0')}</span>
                                                <h2 className="text-xl font-black leading-tight sm:text-2xl">{section.title}</h2>
                                            </div>

                                            <div className="mt-4 space-y-3 text-sm font-medium leading-7 text-slate-600 sm:text-base sm:leading-8">
                                                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                                            </div>

                                            {section.bullets && (
                                                <ul className="mt-5 grid gap-3">
                                                    {section.bullets.map((bullet) => (
                                                        <li key={bullet} className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700">
                                                            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />
                                                            {bullet}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {section.note && (
                                                <div className="mt-5 flex items-start gap-3 rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700">
                                                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-orange-600" />
                                                    {section.note}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.section>
                            );
                        })}
                    </div>

                    <footer className="border-t border-slate-200 bg-slate-950 p-5 text-white sm:p-7">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-black">Có câu hỏi về chính sách này?</p>
                                <p className="mt-1 text-xs font-medium text-slate-400">Email hỗ trợ: contact@webgiare.id.vn</p>
                            </div>
                            <a href="mailto:contact@webgiare.id.vn" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-orange-600 px-5 text-sm font-bold text-white transition hover:bg-orange-500">
                                <Mail size={16} /> Gửi email
                            </a>
                        </div>
                    </footer>
                </motion.article>

                <div className="lg:col-start-2">
                    <div className="grid grid-cols-2 gap-3">
                        {previous ? (
                            <Link href={`/policy/${previous}`} className="group flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-orange-200 hover:shadow-md">
                                <ArrowLeft size={17} className="shrink-0 text-slate-400 group-hover:text-orange-600" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Trước đó</p>
                                    <p className="mt-1 truncate text-xs font-black sm:text-sm">{POLICIES[previous].shortTitle}</p>
                                </div>
                            </Link>
                        ) : <div />}
                        {next && (
                            <Link href={`/policy/${next}`} className="group flex min-w-0 items-center justify-end gap-3 rounded-lg border border-slate-200 bg-white p-4 text-right transition hover:border-orange-200 hover:shadow-md">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Tiếp theo</p>
                                    <p className="mt-1 truncate text-xs font-black sm:text-sm">{POLICIES[next].shortTitle}</p>
                                </div>
                                <ArrowRight size={17} className="shrink-0 text-slate-400 group-hover:text-orange-600" />
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
