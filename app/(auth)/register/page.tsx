'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, AlertCircle, User, Eye, EyeOff, Sparkles, ArrowLeft, Check, X } from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';

const GoogleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
);

const GitHubIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.48 0 12.25c0 5.42 3.44 10.02 8.2 11.65.6.11.82-.27.82-.59 0-.29-.01-1.06-.02-2.08-3.34.74-4.04-1.64-4.04-1.64-.55-1.42-1.34-1.8-1.34-1.8-1.09-.76.08-.74.08-.74 1.2.09 1.84 1.26 1.84 1.26 1.07 1.87 2.8 1.33 3.49 1.02.11-.79.42-1.33.76-1.64-2.66-.31-5.46-1.36-5.46-6.05 0-1.34.47-2.43 1.24-3.29-.12-.31-.54-1.56.12-3.24 0 0 1.01-.33 3.3 1.26A11.3 11.3 0 0 1 12 5.96c1.02.01 2.05.14 3.01.41 2.29-1.59 3.3-1.26 3.3-1.26.66 1.68.24 2.93.12 3.24.77.86 1.24 1.95 1.24 3.29 0 4.71-2.8 5.74-5.47 6.04.43.38.81 1.12.81 2.26 0 1.63-.02 2.95-.02 3.35 0 .33.22.71.83.59C20.57 22.26 24 17.67 24 12.25 24 5.48 18.63 0 12 0z" />
    </svg>
);

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, signInWithGoogle, signInWithGithub } = useSupabaseAuth();
    const { addToast } = useToast();
    const router = useRouter();

    // Password strength calculation
    const passwordStrength = useMemo(() => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }, [password]);

    const getStrengthLabel = () => {
        if (passwordStrength <= 1) return { text: 'Yếu', color: 'bg-red-500', textColor: 'text-red-600' };
        if (passwordStrength <= 2) return { text: 'Trung bình', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
        if (passwordStrength <= 3) return { text: 'Tốt', color: 'bg-blue-500', textColor: 'text-blue-600' };
        return { text: 'Mạnh', color: 'bg-green-500', textColor: 'text-green-600' };
    };

    const passwordRequirements = [
        { text: 'Ít nhất 8 ký tự', met: password.length >= 8 },
        { text: 'Chữ hoa (A-Z)', met: /[A-Z]/.test(password) },
        { text: 'Chữ thường (a-z)', met: /[a-z]/.test(password) },
        { text: 'Số (0-9)', met: /[0-9]/.test(password) },
        { text: 'Ký tự đặc biệt (!@#$...)', met: /[^A-Za-z0-9]/.test(password) },
    ];

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        if (passwordStrength < 3) {
            setError('Mật khẩu chưa đủ mạnh. Vui lòng đáp ứng các yêu cầu bên dưới.');
            setLoading(false);
            return;
        }

        if (!agreeTerms) {
            setError('Vui lòng đồng ý với Điều khoản dịch vụ');
            setLoading(false);
            return;
        }

        try {
            const { error: authError } = await signUp(email, password, name);
            if (authError) {
                if (authError.message.includes('already registered')) {
                    setError('Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.');
                } else {
                    setError(authError.message);
                }
                setLoading(false);
            } else {
                setLoading(false); // Stop loading immediately
                setSuccess('Đăng ký thành công! Đang chuyển đến trang xác nhận...');
                addToast('Kiểm tra email để lấy mã OTP!', 'success');
                // Redirect to verify email page
                setTimeout(() => {
                    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
                }, 1500);
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        setLoading(true);
        setError('');
        const { error } = await signInWithGithub();
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden bg-white">
            {/* Left Column - Image + Testimonial */}
            <div className="hidden lg:block lg:w-[54%] relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80"
                    alt="Digital Workspace"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to bottom, rgba(13,14,26,0.65) 0%, rgba(13,14,26,0.45) 40%, rgba(154,52,18,0.90) 100%)",
                    }}
                />
                <div className="absolute inset-0 flex flex-col justify-end px-14 pb-16 xl:px-20">
                    <div className="mb-8 grid max-w-lg grid-cols-3 gap-8">
                        <div>
                            <p className="text-4xl font-black text-white xl:text-5xl">1000+</p>
                            <p className="mt-1 text-sm font-semibold text-orange-200">Sản Phẩm</p>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-white xl:text-5xl">50K+</p>
                            <p className="mt-1 text-sm font-semibold text-orange-200">Downloads</p>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-white xl:text-5xl">4.9</p>
                            <p className="mt-1 text-sm font-semibold text-orange-200">Rating</p>
                        </div>
                    </div>
                    <blockquote className="mb-7 max-w-3xl">
                        <p className="text-2xl font-bold leading-snug text-white xl:text-3xl">
                            &ldquo;Nền tảng tuyệt vời để tìm themes và templates chất lượng cao. Tiết kiệm rất nhiều thời gian!&rdquo;
                        </p>
                    </blockquote>
                    <div className="flex items-center gap-3">
                        <img
                            src="https://res.cloudinary.com/dsdwhh7eu/image/upload/v1764469468/avatars/ddifmxn36ltzom9istep.jpg"
                            alt="Lương Thế Vinh"
                            className="h-12 w-12 rounded-full border-2 border-white/60 object-cover shadow-lg"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "https://ui-avatars.com/api/?name=Luong+The+Vinh&background=f97316&color=fff&size=48";
                            }}
                        />
                        <div>
                            <p className="text-sm font-bold text-white">Lương Thế Vinh</p>
                            <p className="text-xs font-medium text-orange-200">Frontend Developer</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full lg:w-[46%] flex flex-col h-full bg-white">
                <div className="flex items-center justify-between px-6 pt-6 sm:px-8 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2.5 group" prefetch={true}>
                        <Image
                            src="/favicon.png"
                            alt="DigitalMart logo"
                            width={36}
                            height={36}
                            className="rounded-xl shadow-sm"
                            priority
                        />
                        <div className="flex flex-col leading-none">
                            <span className="font-black text-[15px] text-slate-900 tracking-tight">
                                Digital<span className="text-orange-500">Mart</span>
                            </span>
                            <span className="mt-[2px] text-[8.5px] font-bold tracking-[0.15em] text-slate-400">
                                DIGITAL PRODUCTS
                            </span>
                        </div>
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-500"
                        prefetch={true}
                    >
                        <ArrowLeft size={15} />
                        <span>Trang chủ</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 sm:px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="mx-auto flex min-h-full w-full max-w-[430px] flex-col justify-center">
                    {/* Header */}
                    <div className="mb-4">
                        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                            <Sparkles size={11} /> Tạo tài khoản mới
                        </div>
                        <h1 className="mb-1 text-3xl font-black tracking-tight text-slate-900">Đăng Ký</h1>
                        <p className="text-sm text-slate-500">Tham gia cộng đồng 50,000+ developers</p>
                    </div>

                    {/* Social Login */}
                    <div className="mb-4 grid grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-orange-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                        >
                            <GoogleIcon /> Google
                        </button>
                        <button
                            type="button"
                            onClick={handleGithubLogin}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-orange-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                        >
                            <GitHubIcon /> GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-3 font-medium text-slate-400">hoặc với Email</span>
                        </div>
                    </div>

                    <form className="space-y-3" onSubmit={handleRegister}>
                        {error && (
                            <div className="bg-rose-50 border-l-4 border-rose-500 p-3 flex items-center gap-3 animate-fade-in rounded-r-xl">
                                <AlertCircle className="text-rose-500 flex-shrink-0" size={18} />
                                <p className="text-sm text-rose-700 font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-3 flex items-center gap-3 animate-fade-in rounded-r-xl">
                                <Check className="text-green-500 flex-shrink-0" size={18} />
                                <p className="text-sm text-green-700 font-medium">{success}</p>
                            </div>
                        )}

                        {/* Name + Email — 2 columns */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và tên</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password + Confirm — 2 columns */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-orange-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Xác nhận MK</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`block w-full pl-9 pr-9 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 focus:bg-white text-sm ${confirmPassword && confirmPassword !== password ? 'border-red-300' : 'border-slate-200'}`}
                                        placeholder="••••••••"
                                    />
                                    {confirmPassword && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            {confirmPassword === password ? (
                                                <Check size={15} className="text-green-500" />
                                            ) : (
                                                <X size={15} className="text-red-500" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Password Strength */}
                        {password && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getStrengthLabel().color} transition-all`}
                                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-bold ${getStrengthLabel().textColor}`}>{getStrengthLabel().text}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-xs">
                                    {passwordRequirements.map((req, idx) => (
                                        <div key={idx} className={`flex items-center gap-1 ${req.met ? 'text-green-600' : 'text-slate-400'}`}>
                                            {req.met ? <Check size={10} /> : <X size={10} />}
                                            <span className="truncate">{req.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Terms */}
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 flex-shrink-0"
                            />
                            <span className="text-sm text-slate-600">
                                Tôi đồng ý với{' '}
                                <Link href="/policy/terms" className="text-orange-600 hover:underline font-bold">Điều khoản dịch vụ</Link>
                                {' '}và{' '}
                                <Link href="/policy/privacy" className="text-orange-600 hover:underline font-bold">Chính sách bảo mật</Link>
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-200 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Đang xử lý...</>
                            ) : (
                                <>Tạo Tài Khoản <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-4 text-center text-sm text-slate-600">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="font-bold text-orange-600 hover:text-orange-500 hover:underline">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
            </div>
        </div>
    );
};

export default RegisterPage;
