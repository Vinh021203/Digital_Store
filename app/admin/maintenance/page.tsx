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
  Power,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { getSiteSettings, updateSettings } from '@/lib/siteSettings';

export default function AdminMaintenancePage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('Website đang tạm bảo trì.');

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await getSiteSettings();
      setEnabled(Boolean(settings.maintenance_mode));
      setMessage(settings.maintenance_message || 'Website đang tạm bảo trì.');
    } catch (error) {
      addToast('Không thể tải trạng thái bảo trì', 'error');
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
          ? 'Đã bật bảo trì. Storefront sẽ không hiển thị với khách.'
          : 'Đã tắt bảo trì. Website đã mở lại.',
        nextEnabled ? 'warning' : 'success'
      );
    } catch (error) {
      addToast('Có lỗi khi cập nhật bảo trì', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="animate-spin text-orange-600" size={22} />
          <span className="font-bold">Đang kiểm tra trạng thái bảo trì...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-200/70">
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(249,115,22,0.24),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.16),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-orange-200">
                <ShieldAlert size={15} />
                Chế độ bảo trì
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Tạm ẩn toàn bộ website client
              </h1>
              <p className="mt-4 max-w-xl text-base font-medium leading-7 text-slate-300">
                Khi bật, khách truy cập storefront sẽ thấy màn hình trống. Khu vực admin, đăng nhập và API vẫn được giữ để bạn quản trị và tắt bảo trì khi cần.
              </p>
            </div>

            <div className={`rounded-3xl border p-5 text-center ${
              enabled
                ? 'border-orange-400/40 bg-orange-500/15'
                : 'border-emerald-400/30 bg-emerald-500/10'
            }`}>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950">
                {enabled ? <EyeOff size={26} /> : <Globe2 size={26} />}
              </div>
              <p className="text-sm font-bold text-slate-300">Trạng thái hiện tại</p>
              <p className={`mt-1 text-2xl font-black ${enabled ? 'text-orange-200' : 'text-emerald-200'}`}>
                {enabled ? 'Đang bảo trì' : 'Đang mở site'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-7">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              enabled ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {enabled ? <Lock size={23} /> : <CheckCircle2 size={23} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-950">Điều khiển nhanh</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                Dùng khi bạn muốn tạm đóng mua bán, kiểm tra pháp lý, deploy hoặc bảo trì dữ liệu.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="text-sm font-black text-slate-800">Ghi chú nội bộ</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-2 min-h-[116px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              placeholder="Lý do bảo trì hoặc ghi chú cho lần đóng site này..."
            />
            <p className="mt-2 text-xs font-semibold text-slate-400">
              Ghi chú này được lưu trong site settings. Storefront vẫn không hiển thị nội dung khi đang bảo trì.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => updateMaintenance(true)}
              disabled={saving || enabled}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
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
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 shrink-0 text-orange-600" size={22} />
              <div>
                <h3 className="text-lg font-black text-slate-950">Khi bật sẽ xảy ra gì?</h3>
                <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-600">
                  <li>Storefront trả về màn hình trống cho khách.</li>
                  <li>Admin vẫn vào được để quản trị.</li>
                  <li>API vẫn mở để webhook hoặc tác vụ nền không bị ngắt.</li>
                  <li>Không xóa dữ liệu, không tắt database.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">Kiểm tra nhanh</h3>
            <div className="mt-4 grid gap-3">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
              >
                <Globe2 size={17} />
                Mở trang chủ
              </Link>
              <button
                type="button"
                onClick={loadStatus}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
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
