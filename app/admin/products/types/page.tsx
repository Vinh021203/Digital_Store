'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Layers, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { createProductType, deleteProductType, fetchProductTypes, updateProductType, type DbProductType } from '@/lib/productTypes';
import { useToast } from '@/context/ToastContext';

const emptyForm = { name: '', label: '', slug: '', icon: 'package', color: 'indigo', sort_order: 0, is_active: true };

export default function ProductTypesPage() {
  const toast = useToast();
  const [types, setTypes] = useState<DbProductType[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => { setLoading(true); setTypes(await fetchProductTypes()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const save = async () => {
    if (!form.name.trim() || !form.label.trim()) return toast.error('Vui lòng nhập mã loại và tên hiển thị');
    try {
      const payload = { ...form, name: form.name.trim(), label: form.label.trim(), slug: form.slug || slugify(form.name) };
      if (editingId) await updateProductType(editingId, payload); else await createProductType(payload);
      toast.success(editingId ? 'Đã cập nhật loại sản phẩm' : 'Đã thêm loại sản phẩm');
      setEditingId(null); setForm(emptyForm); load();
    } catch (error: any) { toast.error(error.message || 'Không thể lưu loại sản phẩm'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  return <div className="space-y-5 sm:space-y-6">
    <div><h1 className="flex items-center gap-2 text-xl font-black text-slate-900 sm:text-2xl"><Layers className="text-indigo-600" /> Loại sản phẩm</h1><p className="mt-1 text-sm leading-6 text-slate-500">Thêm, sửa, sắp xếp hoặc ẩn loại sản phẩm trên toàn website.</p></div>
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-4 rounded-2xl border bg-white p-5">
        <h2 className="font-bold">{editingId ? 'Sửa loại sản phẩm' : 'Thêm loại mới'}</h2>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })} placeholder="Mã loại, ví dụ: Plugin" className="w-full rounded-xl border px-4 py-3" />
        <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Tên hiển thị" className="w-full rounded-xl border px-4 py-3" />
        <input value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="slug" className="w-full rounded-xl border px-4 py-3" />
        <div className="grid grid-cols-2 gap-3"><input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="Icon" className="rounded-xl border px-3 py-3" /><input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} placeholder="Thứ tự" className="rounded-xl border px-3 py-3" /></div>
        <button onClick={save} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white"><Save size={18} /> Lưu loại</button>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-white">
        {types.map(type => <div key={type.id} className="flex flex-wrap items-center gap-3 border-b p-4 last:border-0 sm:flex-nowrap sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Layers size={19} /></div>
          <div className="min-w-0 flex-1"><p className="truncate font-bold text-slate-900">{type.label}</p><p className="truncate text-xs leading-5 text-slate-500">{type.name} · /{type.slug} · {type.product_count || 0} sản phẩm</p></div>
          <div className="ml-[52px] flex w-full items-center justify-end gap-2 sm:ml-0 sm:w-auto">
          <button onClick={async () => { await updateProductType(type.id, { is_active: !type.is_active }); load(); }} className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-500" title={type.is_active ? 'Ẩn loại' : 'Hiện loại'}>{type.is_active ? <Eye size={18} /> : <EyeOff size={18} />}</button>
          <button onClick={() => { setEditingId(type.id); setForm({ name: type.name, label: type.label, slug: type.slug, icon: type.icon || '', color: type.color, sort_order: type.sort_order, is_active: type.is_active }); }} className="h-11 rounded-xl bg-slate-100 px-4 text-sm font-bold">Sửa</button>
          <button onClick={async () => { if (!confirm(`Xóa loại ${type.label}?`)) return; try { await deleteProductType(type.id); load(); } catch (error: any) { toast.error(error.message); } }} className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500"><Trash2 size={18} /></button>
          </div>
        </div>)}
        {!types.length && <div className="p-12 text-center text-slate-500"><Plus className="mx-auto mb-2" /> Chưa có loại sản phẩm</div>}
      </div>
    </div>
  </div>;
}
