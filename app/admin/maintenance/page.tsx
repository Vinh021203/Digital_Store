'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  EyeOff,
  Globe2,
  Loader2,
  Lock,
  MessageSquareText,
  Power,
  RefreshCw,
  ShieldAlert,
  ShoppingCart,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { getSiteSettings, updateSettings, type SiteMode } from '@/lib/siteSettings';

export default function AdminMaintenancePage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [siteMode, setSiteMode] = useState<SiteMode>('sales');
  const [message, setMessage] = useState('Website đang tạm bảo trì.');

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await getSiteSettings();
      setEnabled(Boolean(settings.maintenance_mode));
      setSiteMode(settings.site_mode === 'catalog' ? 'catalog' : 'sales');
      setMessage(settings.maintenance_message || 'Website đang tạm bảo trì.');
    } catch {
      addToast('Không thể tải trạng thái website', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const updateMaintenance = async (nextEnabled: boolean) => {
    setSaving(true);
    try {
      const success = await updateSettings({
        maintenance_mode: nextEnabled,
        maintenance_message: message,
      });

      if (!success) {
        addToast('Không thể cập nhật bảo trì. Hãy kiểm tra quyền site_settings.', 'error');
        return;
      }

      setEnabled(nextEnabled);
      addToast(
        nextEnabled
          ? 'Đã bật bảo trì. Storefront sẽ hiển thị màn thông báo với khách.'
          : 'Đã tắt bảo trì. Website đã mở lại.',
        nextEnabled ? 'warning' : 'success',
      );
    } catch {
      addToast('Có lỗi khi cập nhật bảo trì', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSiteMode = async (nextMode: SiteMode) => {
    setSaving(true);
    try {
      const success = await updateSettings({ site_mode: nextMode });

      if (!success) {
        addToast('Không thể cập nhật chế độ website. Hãy kiểm tra site_settings.', 'error');
        return;
      }

      setSiteMode(nextMode);
      addToast(
        nextMode === 'catalog'
          ? 'Đã chuyển sang Catalog/Tư vấn. Các luồng mua bán trực tiếp sẽ tạm tắt.'
          : 'Đã chuyển sang Sales. Giỏ hàng, checkout và tải file có thể hoạt động lại.',
        nextMode === 'catalog' ? 'warning' : 'success',
      );
    } catch {
      addToast('Có lỗi khi cập nhật chế độ website', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="animate-spin text-orange-600" size={22} />
          <span className="font-bold">Đang kiểm tra trạng thái website...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-indigo-600">
              <ShieldAlert size={16} /> Điều khiển vận hành website
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Bảo trì và chế độ bán hàng</h1>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 sm:text-base">
              Quản lý khả năng truy cập storefront và chuyển đổi nhanh giữa Catalog tư vấn với Sales bán hàng.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[430px]">
            <div className={`flex items-center gap-3 rounded-2xl border p-4 ${enabled ? 'border-orange-200 bg-orange-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${enabled ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {enabled ? <EyeOff size={21} /> : <Globe2 size={21} />}
              </div>
              <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Bảo trì</p><p className={`mt-0.5 text-base font-black ${enabled ? 'text-orange-700' : 'text-emerald-700'}`}>{enabled ? 'Đang bật' : 'Website hoạt động'}</p></div>
            </div>
            <div className={`flex items-center gap-3 rounded-2xl border p-4 ${siteMode === 'catalog' ? 'border-blue-200 bg-blue-50' : 'border-indigo-200 bg-indigo-50'}`}>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${siteMode === 'catalog' ? 'bg-blue-600' : 'bg-indigo-600'} text-white`}>
                {siteMode === 'catalog' ? <MessageSquareText size={21} /> : <ShoppingCart size={21} />}
              </div>
              <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Chế độ hiện tại</p><p className="mt-0.5 text-base font-black text-slate-900">{siteMode === 'catalog' ? 'Catalog / Tư vấn' : 'Sales / Bán hàng'}</p></div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${enabled ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {enabled ? <Lock size={23} /> : <CheckCircle2 size={23} />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">Bảo trì toàn site</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                Dùng khi bạn muốn tạm ẩn toàn bộ storefront. Admin, đăng nhập và API vẫn được giữ để quản trị.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <label className="text-sm font-black text-slate-800">Thông báo bảo trì</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-2 min-h-[116px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              placeholder="Website đang được nâng cấp. Vui lòng quay lại sau..."
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => updateMaintenance(true)}
              disabled={saving || enabled}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              {saving && !enabled ? <Loader2 className="animate-spin" size={18} /> : <Power size={18} />}
              Bật bảo trì
            </button>
            <button
              type="button"
              onClick={() => updateMaintenance(false)}
              disabled={saving || !enabled}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              {saving && enabled ? <Loader2 className="animate-spin" size={18} /> : <Globe2 size={18} />}
              Mở lại website
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50/70 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 shrink-0 text-orange-600" size={22} />
              <div>
                <h3 className="text-lg font-black text-slate-950">Catalog sẽ tạm tắt gì?</h3>
                <ul className="mt-3 grid gap-2.5 text-sm font-semibold leading-6 text-slate-600 sm:grid-cols-2">
                  <li className="flex gap-2"><span className="text-orange-500">•</span>Ẩn giỏ hàng trên header.</li>
                  <li className="flex gap-2"><span className="text-orange-500">•</span>Chặn trang cart/checkout.</li>
                  <li className="flex gap-2"><span className="text-orange-500">•</span>Đổi nút mua thành CTA tư vấn.</li>
                  <li className="flex gap-2"><span className="text-orange-500">•</span>Chặn API tải file trực tiếp.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><ShoppingCart size={20} /></div><h3 className="text-lg font-black text-slate-950">Chế độ bán hàng</h3></div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Chọn Catalog nếu chỉ muốn kéo khách về tư vấn, xem demo và nhận báo giá. Chọn Sales khi đã sẵn sàng mở giỏ hàng, thanh toán và giao file.
            </p>
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => updateSiteMode('catalog')}
                disabled={saving || siteMode === 'catalog'}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black transition ${siteMode === 'catalog' ? 'cursor-default border border-blue-200 bg-blue-50 text-blue-700' : 'bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700'}`}
              >
                <MessageSquareText size={18} />
                {siteMode === 'catalog' ? 'Catalog đang được bật' : 'Bật Catalog / Tư vấn'}
              </button>
              <button
                type="button"
                onClick={() => updateSiteMode('sales')}
                disabled={saving || siteMode === 'sales'}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black transition ${siteMode === 'sales' ? 'cursor-default border border-indigo-200 bg-indigo-50 text-indigo-700' : 'border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'}`}
              >
                <ShoppingCart size={18} />
                {siteMode === 'sales' ? 'Sales đang được bật' : 'Bật Sales / Bán hàng'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-slate-950">Kiểm tra nhanh</h3>
            <div className="mt-4 grid gap-3">
              <Link href="/" target="_blank" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700">
                <Globe2 size={17} />
                Mở trang chủ
              </Link>
              <button type="button" onClick={loadStatus} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                <RefreshCw size={17} />
                Tải lại trạng thái
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
