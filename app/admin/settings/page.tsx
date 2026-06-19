'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Shield,
  Database,
  Mail,
  CreditCard,
  Save,
  RefreshCw,
  Download,
  Trash2,
  History,
  Server,
  Loader,
  AlertCircle,
  QrCode,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { getSiteSettings, updateSettings, type SiteSettings } from '@/lib/siteSettings';
import Image from 'next/image';

const SettingsManager = () => {
  const { addToast } = useToast();
  const [activeSection, setActiveSection] = useState<'general' | 'payment' | 'email' | 'security' | 'backup'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Form states for each section
  const [generalForm, setGeneralForm] = useState({
    site_name: '',
    site_tagline: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    site_logo: '',
    maintenance_mode: false,
    maintenance_message: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    payment_vnpay_enabled: true,
    payment_momo_enabled: true,
    payment_bank_transfer_enabled: true,
    payment_bank_name: '',
    payment_bank_account_number: '',
    payment_bank_account_name: '',
    payment_bank_branch: '',
    payment_qr_image: '',
  });

  const [socialForm, setSocialForm] = useState({
    social_facebook: '',
    social_youtube: '',
    social_tiktok: '',
    social_instagram: '',
    social_zalo: '',
  });

  const [securityForm, setSecurityForm] = useState({
    security_strong_password: true,
    security_2fa_enabled: false,
    security_recaptcha_enabled: false,
    security_session_timeout: 60,
  });

  // Load settings
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSiteSettings();
      setSettings(data);

      // Populate forms
      setGeneralForm({
        site_name: data.site_name,
        site_tagline: data.site_tagline,
        site_description: data.site_description,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        contact_address: data.contact_address,
        site_logo: data.site_logo,
        maintenance_mode: data.maintenance_mode,
        maintenance_message: data.maintenance_message,
      });

      setPaymentForm({
        payment_vnpay_enabled: data.payment_vnpay_enabled,
        payment_momo_enabled: data.payment_momo_enabled,
        payment_bank_transfer_enabled: data.payment_bank_transfer_enabled,
        payment_bank_name: data.payment_bank_name,
        payment_bank_account_number: data.payment_bank_account_number,
        payment_bank_account_name: data.payment_bank_account_name,
        payment_bank_branch: data.payment_bank_branch,
        payment_qr_image: data.payment_qr_image,
      });

      setSocialForm({
        social_facebook: data.social_facebook,
        social_youtube: data.social_youtube,
        social_tiktok: data.social_tiktok,
        social_instagram: data.social_instagram,
        social_zalo: data.social_zalo,
      });

      setSecurityForm({
        security_strong_password: data.security_strong_password,
        security_2fa_enabled: data.security_2fa_enabled,
        security_recaptcha_enabled: data.security_recaptcha_enabled,
        security_session_timeout: data.security_session_timeout,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      addToast('Không thể tải cài đặt', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save handlers
  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      const success = await updateSettings({
        ...generalForm,
        ...socialForm,
      });
      if (success) {
        addToast('Đã lưu thông tin website', 'success');
      } else {
        addToast('Không thể lưu. Hãy chạy SQL tạo bảng site_settings', 'error');
      }
    } catch (error) {
      addToast('Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async () => {
    setSaving(true);
    try {
      const success = await updateSettings(paymentForm);
      if (success) {
        addToast('Đã lưu cài đặt thanh toán', 'success');
      } else {
        addToast('Không thể lưu', 'error');
      }
    } catch (error) {
      addToast('Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    setSaving(true);
    try {
      const success = await updateSettings(securityForm);
      if (success) {
        addToast('Đã lưu cài đặt bảo mật', 'success');
      } else {
        addToast('Không thể lưu', 'error');
      }
    } catch (error) {
      addToast('Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  // QR Image upload
  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/product-gallery', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setPaymentForm(prev => ({ ...prev, payment_qr_image: data.url }));
        addToast('Đã upload QR code', 'success');
      }
    } catch (error) {
      addToast('Không thể upload ảnh', 'error');
    }
  };

  const sections = [
    { id: 'general' as const, label: 'Thông tin chung', icon: Globe, desc: 'Tên thương hiệu, SEO, thông tin liên hệ.' },
    { id: 'payment' as const, label: 'Thanh toán', icon: CreditCard, desc: 'QR code, tài khoản ngân hàng.' },
    { id: 'email' as const, label: 'Email & SMTP', icon: Mail, desc: 'Máy chủ gửi mail hệ thống.' },
    { id: 'security' as const, label: 'Bảo mật', icon: Shield, desc: 'Mật khẩu mạnh, 2FA, session.' },
    { id: 'backup' as const, label: 'Sao lưu dữ liệu', icon: Database, desc: 'Lịch sao lưu database.' },
  ];

  const Toggle = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string;
    description?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
  }) => (
    <label className="flex items-start justify-between gap-3 cursor-pointer group">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 transition-colors">
          {label}
        </p>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="relative inline-flex items-center cursor-pointer mt-0.5">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
      </div>
    </label>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            Cài Đặt Hệ Thống
            <button onClick={loadSettings} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <RefreshCw size={16} className="text-slate-400" />
            </button>
          </h2>
          <p className="text-sm text-slate-500">
            Quản lý cấu hình nền tảng. Thay đổi sẽ áp dụng ngay cho toàn website.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Đồng bộ trực tiếp với trang client
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Nhóm cài đặt
              </p>
            </div>
            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex flex-col items-start gap-1 px-5 py-3.5 text-sm text-left transition-all border-l-4 ${active
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-500'
                    : 'text-slate-600 hover:bg-slate-50 border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={18} className={active ? 'text-indigo-600' : 'text-slate-400'} />
                    <span className="font-semibold">{section.label}</span>
                  </div>
                  <span className="text-xs text-slate-400">{section.desc}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 space-y-6">
          {/* General */}
          {activeSection === 'general' && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Thông Tin Website</h3>
                <p className="text-xs text-slate-500 mt-1.5">
                  Dùng cho Header, Footer, SEO, và trang thanh toán.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Tên Website
                  </label>
                  <input
                    type="text"
                    value={generalForm.site_name}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, site_name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="VD: Shop Web rẻ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Tagline / Slogan
                  </label>
                  <input
                    type="text"
                    value={generalForm.site_tagline}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, site_tagline: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="VD: Nền tảng mua bán giao diện website"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Mô tả SEO
                  </label>
                  <textarea
                    rows={2}
                    value={generalForm.site_description}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, site_description: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Mô tả ngắn cho SEO..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Email liên hệ
                    </label>
                    <input
                      type="email"
                      value={generalForm.contact_email}
                      onChange={(e) => setGeneralForm(prev => ({ ...prev, contact_email: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Hotline
                    </label>
                    <input
                      type="text"
                      value={generalForm.contact_phone}
                      onChange={(e) => setGeneralForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-5 border-t border-slate-100">
                <h4 className="font-semibold text-slate-800 mb-4">Mạng xã hội</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={socialForm.social_facebook}
                    onChange={(e) => setSocialForm(prev => ({ ...prev, social_facebook: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Link Facebook"
                  />
                  <input
                    type="text"
                    value={socialForm.social_youtube}
                    onChange={(e) => setSocialForm(prev => ({ ...prev, social_youtube: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Link YouTube"
                  />
                  <input
                    type="text"
                    value={socialForm.social_zalo}
                    onChange={(e) => setSocialForm(prev => ({ ...prev, social_zalo: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="SĐT hoặc link Zalo"
                  />
                  <input
                    type="text"
                    value={socialForm.social_tiktok}
                    onChange={(e) => setSocialForm(prev => ({ ...prev, social_tiktok: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Link TikTok"
                  />
                </div>
              </div>

              {/* Maintenance Toggle */}
              <div className="pt-5 border-t border-slate-100 space-y-4">
                <Toggle
                  label="Chế độ bảo trì (Maintenance Mode)"
                  description="Tạm ẩn website với khách, chỉ admin được truy cập."
                  checked={generalForm.maintenance_mode}
                  onChange={(checked) => setGeneralForm(prev => ({ ...prev, maintenance_mode: checked }))}
                />
                {generalForm.maintenance_mode && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Thông báo bảo trì
                    </label>
                    <textarea
                      rows={2}
                      value={generalForm.maintenance_message}
                      onChange={(e) => setGeneralForm(prev => ({ ...prev, maintenance_message: e.target.value }))}
                      className="w-full border border-amber-200 bg-amber-50 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                      placeholder="Website đang được nâng cấp..."
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveGeneral}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md shadow-indigo-200 disabled:opacity-50"
                >
                  {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  Lưu thay đổi
                </button>
              </div>
            </section>
          )}

          {/* Payment */}
          {activeSection === 'payment' && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <CreditCard size={20} className="text-indigo-600" />
                  Cài Đặt Thanh Toán
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cấu hình phương thức thanh toán. Khách hàng sẽ thấy ngay trên trang checkout.
                </p>
              </div>

              {/* Payment Toggles */}
              <div className="space-y-4">
                <Toggle
                  label="Bật VNPAY"
                  description="Thanh toán qua cổng VNPAY (cần cấu hình API riêng)"
                  checked={paymentForm.payment_vnpay_enabled}
                  onChange={(checked) => setPaymentForm(prev => ({ ...prev, payment_vnpay_enabled: checked }))}
                />
                <div className="h-px bg-slate-100" />
                <Toggle
                  label="Bật MOMO"
                  description="Thanh toán qua ví MOMO (cần cấu hình API riêng)"
                  checked={paymentForm.payment_momo_enabled}
                  onChange={(checked) => setPaymentForm(prev => ({ ...prev, payment_momo_enabled: checked }))}
                />
                <div className="h-px bg-slate-100" />
                <Toggle
                  label="Bật Chuyển khoản ngân hàng"
                  description="Hiển thị thông tin chuyển khoản và mã QR"
                  checked={paymentForm.payment_bank_transfer_enabled}
                  onChange={(checked) => setPaymentForm(prev => ({ ...prev, payment_bank_transfer_enabled: checked }))}
                />
              </div>

              {/* Bank Transfer Details */}
              {paymentForm.payment_bank_transfer_enabled && (
                <div className="pt-5 border-t border-slate-100 space-y-5">
                  <h4 className="font-semibold text-slate-800">Thông tin chuyển khoản</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Tên ngân hàng
                      </label>
                      <input
                        type="text"
                        value={paymentForm.payment_bank_name}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_bank_name: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="VD: Vietcombank"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Chi nhánh
                      </label>
                      <input
                        type="text"
                        value={paymentForm.payment_bank_branch}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_bank_branch: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="VD: Hà Nội"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Số tài khoản
                      </label>
                      <input
                        type="text"
                        value={paymentForm.payment_bank_account_number}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_bank_account_number: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                        placeholder="VD: 1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Tên chủ tài khoản
                      </label>
                      <input
                        type="text"
                        value={paymentForm.payment_bank_account_name}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_bank_account_name: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                        placeholder="VD: NGUYEN VAN A"
                      />
                    </div>
                  </div>

                  {/* QR Code Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mã QR thanh toán
                    </label>
                    <div className="flex items-start gap-4">
                      {paymentForm.payment_qr_image ? (
                        <div className="relative">
                          <Image
                            src={paymentForm.payment_qr_image}
                            alt="QR Code"
                            width={150}
                            height={150}
                            className="rounded-xl border border-slate-200"
                          />
                          <button
                            onClick={() => setPaymentForm(prev => ({ ...prev, payment_qr_image: '' }))}
                            className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-colors">
                          <QrCode size={32} className="text-slate-400 mb-2" />
                          <span className="text-xs text-slate-500 font-medium">Upload QR</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQRUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                      <div className="text-xs text-slate-500 space-y-1">
                        <p>• Tải lên ảnh QR code từ ngân hàng</p>
                        <p>• Khách hàng sẽ thấy QR này tại checkout</p>
                        <p>• Hỗ trợ PNG, JPG (khuyến nghị 500x500px)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSavePayment}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md shadow-indigo-200 disabled:opacity-50"
                >
                  {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  Lưu cài đặt thanh toán
                </button>
              </div>
            </section>
          )}

          {/* Email / SMTP */}
          {activeSection === 'email' && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <AlertCircle size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Cấu hình SMTP</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    SMTP credentials nên được lưu trong ENV file thay vì database để bảo mật.
                    Cấu hình trong file <code className="bg-slate-100 px-1 rounded">.env.local</code>
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm font-mono text-slate-700">
                  SMTP_HOST=smtp.gmail.com<br />
                  SMTP_PORT=587<br />
                  SMTP_USER=your-email@gmail.com<br />
                  SMTP_PASS=your-app-password
                </p>
              </div>
            </section>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Shield size={20} className="text-emerald-600" />
                  Chính Sách Bảo Mật
                </h3>
                <p className="text-xs text-slate-500 mt-1.5">
                  Đề xuất: bật mật khẩu mạnh, 2FA cho admin.
                </p>
              </div>

              <div className="space-y-4">
                <Toggle
                  label="Yêu cầu mật khẩu mạnh"
                  description="Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
                  checked={securityForm.security_strong_password}
                  onChange={(checked) => setSecurityForm(prev => ({ ...prev, security_strong_password: checked }))}
                />
                <div className="h-px bg-slate-100" />
                <Toggle
                  label="Bật xác thực 2 yếu tố (2FA) cho Admin"
                  description="Xác thực qua ứng dụng Authenticator hoặc SMS."
                  checked={securityForm.security_2fa_enabled}
                  onChange={(checked) => setSecurityForm(prev => ({ ...prev, security_2fa_enabled: checked }))}
                />
                <div className="h-px bg-slate-100" />
                <Toggle
                  label="Kích hoạt Google reCAPTCHA"
                  description="Giảm spam và tấn công brute-force trên form đăng ký/đăng nhập."
                  checked={securityForm.security_recaptcha_enabled}
                  onChange={(checked) => setSecurityForm(prev => ({ ...prev, security_recaptcha_enabled: checked }))}
                />
                <div className="h-px bg-slate-100" />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Thời gian hết hạn phiên đăng nhập
                    </p>
                    <p className="text-xs text-slate-500">
                      Sau thời gian này, user phải đăng nhập lại.
                    </p>
                  </div>
                  <select
                    value={securityForm.security_session_timeout}
                    onChange={(e) => setSecurityForm(prev => ({ ...prev, security_session_timeout: Number(e.target.value) }))}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none bg-white"
                  >
                    <option value={30}>30 phút</option>
                    <option value={60}>1 giờ</option>
                    <option value={1440}>24 giờ</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveSecurity}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md shadow-indigo-200 disabled:opacity-50"
                >
                  {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  Lưu cài đặt
                </button>
              </div>
            </section>
          )}

          {/* Backup */}
          {activeSection === 'backup' && (
            <section className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-5">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-1 flex items-center gap-2">
                    <Database size={22} /> Sao Lưu Dữ Liệu
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    Supabase tự động backup hàng ngày. Bạn có thể export dữ liệu từ Dashboard.
                  </p>
                </div>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-xl flex items-center gap-2 whitespace-nowrap"
                >
                  Mở Supabase Dashboard
                </a>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsManager;
