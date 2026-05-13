'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, AlertCircle, User, Package, Eye, EyeOff, Sparkles, Chrome, Github, Check, X } from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';

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
        <div className="h-screen flex overflow-hidden font-sans text-slate-800">
            {/* Left Column - Image + Testimonial */}
            <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">
                <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80"
                    alt="Digital Workspace"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 via-slate-900/70 to-slate-900/40 flex flex-col justify-end p-16">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 mb-12">
                        <div className="text-center">
                            <p className="text-3xl font-black text-white">1000+</p>
                            <p className="text-orange-200 text-sm font-medium">Sản Phẩm</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-white">50K+</p>
                            <p className="text-orange-200 text-sm font-medium">Members</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-white">4.9</p>
                            <p className="text-orange-200 text-sm font-medium">Rating</p>
                        </div>
                    </div>
                    <blockquote className="space-y-4">
                        <p className="text-2xl font-bold text-white leading-relaxed">
                            &ldquo;Nền tảng tuyệt vời để tìm themes và templates chất lượng cao. Tiết kiệm rất nhiều thời gian!&rdquo;
                        </p>
                        <footer className="flex items-center gap-4">
                            <img
                                src="https://res.cloudinary.com/dsdwhh7eu/image/upload/v1764469468/avatars/ddifmxn36ltzom9istep.jpg"
                                alt="Lương Thế Vinh"
                                className="w-12 h-12 rounded-full border-2 border-white"
                            />
                            <div>
                                <p className="text-white font-bold">Lương Thế Vinh</p>
                                <p className="text-orange-200 text-sm">Frontend Developer</p>
                            </div>
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center pt-16 pb-4 px-8 sm:px-10 lg:px-14 relative animate-fade-in bg-white overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="max-w-lg w-full mx-auto">
                    {/* Header */}
                    <div className="mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-2">
                            <Sparkles size={14} /> Tạo tài khoản mới
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mb-1">Đăng Ký</h1>
                        <p className="text-slate-500 text-sm">Tham gia cộng đồng 50,000+ developers</p>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-orange-200 transition-all shadow-sm disabled:opacity-50"
                        >
                            <Chrome size={18} className="text-blue-500" /> Google
                        </button>
                        <button
                            type="button"
                            onClick={handleGithubLogin}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-orange-200 transition-all shadow-sm disabled:opacity-50"
                        >
                            <Github size={18} /> GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-3">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-slate-400 font-medium">hoặc với Email</span>
                        </div>
                    </div>

                    <form className="space-y-2.5" onSubmit={handleRegister}>
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
                        <div className="grid grid-cols-2 gap-3">
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
                        <div className="grid grid-cols-2 gap-3">
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
    );
};

export default RegisterPage;
