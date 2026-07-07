"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { useToast } from "@/context/ToastContext";

// ── Google SVG icon ──
const GoogleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="flex-shrink-0"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// ── GitHub SVG icon ──
const GitHubIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className="flex-shrink-0 text-slate-700"
  >
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/");

  const { signIn, signInWithGoogle, signInWithGithub } = useSupabaseAuth();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("redirect");
    if (p) setRedirectTo(p);
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const { error: authError } = await signIn(email, password);
        if (authError) {
          const lower = (authError.message || "").toLowerCase();
          if (lower.includes("invalid login credentials"))
            setError("Email hoặc mật khẩu không đúng");
          else if (lower.includes("email not confirmed")) {
            addToast(
              "Email chưa xác nhận. Kiểm tra email để lấy mã OTP.",
              "warning",
            );
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          } else setError(authError.message || "Đăng nhập thất bại");
        } else {
          addToast("Đăng nhập thành công!", "success");
          router.push(redirectTo);
        }
      } catch {
        setError("Đã có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    },
    [email, password, signIn, addToast, router, redirectTo],
  );

  const handleGoogleLogin = useCallback(async () => {
    setLoading(true);
    setError("");
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }, [signInWithGoogle]);

  const handleGithubLogin = useCallback(async () => {
    setLoading(true);
    setError("");
    const { error } = await signInWithGithub();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }, [signInWithGithub]);

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* ════════════════════════════════
          LEFT — Form Panel
      ════════════════════════════════ */}
      <div className="w-full lg:w-[46%] flex flex-col h-full bg-white">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 flex-shrink-0">
          {/* Logo — chỉ 1 ảnh, không có pseudo-element chồng */}
          <Link
            href="/"
            className="group relative h-11 w-[180px]"
            prefetch={true}
            aria-label="Web Giá Rẻ - Portfolio - Trang chủ"
          >
            <img
              src="/logo_webgiare_display.webp"
              alt="Web Giá Rẻ - Portfolio logo"
              className="h-full w-full object-contain object-left transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Back home */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors"
            prefetch={true}
          >
            <ArrowLeft size={15} />
            <span>Trang chủ</span>
          </Link>
        </div>

        {/* ── Form content ── */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-4">
          <div className="w-full max-w-[360px]">
            {/* Welcome badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-xs font-bold mb-4">
              <Sparkles size={11} />
              Chào mừng trở lại!
            </div>

            {/* Heading */}
            <div className="mb-5">
              <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">
                Đăng Nhập
              </h1>
              <p className="text-sm text-slate-500">
                Truy cập thư viện giao diện website của bạn
              </p>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-orange-200 transition-all shadow-sm disabled:opacity-50 active:scale-95"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                onClick={handleGithubLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-orange-200 transition-all shadow-sm disabled:opacity-50 active:scale-95"
              >
                <GitHubIcon />
                GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-slate-400 font-medium">
                  hoặc với Email
                </span>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-3.5" onSubmit={handleLogin}>
              {error && (
                <div className="flex items-center gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <AlertCircle
                    size={15}
                    className="text-rose-500 flex-shrink-0"
                  />
                  <p className="text-xs text-rose-700 font-medium">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail
                      size={15}
                      className="text-slate-400 group-focus-within:text-orange-500 transition-colors"
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Mật khẩu
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock
                      size={15}
                      className="text-slate-400 group-focus-within:text-orange-500 transition-colors"
                    />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-orange-500 transition-colors"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 focus:ring-offset-0 accent-orange-500"
                />
                <span className="text-sm text-slate-600">
                  Ghi nhớ đăng nhập
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                style={{
                  background:
                    "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
                  boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
                }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Đăng Nhập <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="font-bold text-orange-500 hover:text-orange-600 transition-colors"
              >
                Đăng ký miễn phí
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          RIGHT — Visual Panel (desktop only)
      ════════════════════════════════ */}
      <div className="hidden lg:block lg:w-[54%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,14,26,0.65) 0%, rgba(13,14,26,0.45) 40%, rgba(154,52,18,0.90) 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end p-12 xl:p-16">
          {/* Stats */}
          <div className="flex items-end gap-10 mb-8">
            {[
              { value: "1000+", label: "Sản Phẩm" },
              { value: "50K+", label: "Downloads" },
              { value: "4.9", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl xl:text-4xl font-black text-white leading-none">
                  {stat.value}
                </p>
                <p className="text-orange-200 text-sm font-medium mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Quote */}
          <blockquote className="mb-7">
            <p className="text-2xl xl:text-3xl font-bold text-white leading-snug">
              "Nền tảng tuyệt vời để tìm themes và templates chất lượng cao.
              Tiết kiệm rất nhiều thời gian!"
            </p>
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dsdwhh7eu/image/upload/v1764469468/avatars/ddifmxn36ltzom9istep.jpg"
              alt="Lương Thế Vinh"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/60 shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://ui-avatars.com/api/?name=Luong+The+Vinh&background=f97316&color=fff&size=48";
              }}
            />
            <div>
              <p className="text-white font-bold text-sm">Lương Thế Vinh</p>
              <p className="text-orange-200 text-xs font-medium">
                Frontend Developer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
