'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Mail,
  User,
  Users,
  Lock,
  Loader,
  AlertCircle,
  RefreshCcw,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import {
  getStaffMembers,
  getRoleStats,
  updateStaffRole,
  removeStaffMember,
  addStaffMember,
  type StaffMember,
  type RoleInfo,
  type StaffRole,
} from '@/lib/adminRoles';

const RolesManager = () => {
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);

  // Real data state
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 20 | 50>(10);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<StaffRole>('support');

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffData, rolesData] = await Promise.all([
        getStaffMembers(),
        getRoleStats(),
      ]);
      setStaff(staffData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading data:', error);
      addToast('Không thể tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalActive = staff.filter((s) => s.status === 'active').length;
  const totalPages = Math.max(1, Math.ceil(staff.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedStaff = staff.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleEdit = (s: StaffMember) => {
    setEditingStaff(s);
    setFormName(s.name);
    setFormEmail(s.email);
    setFormRole(s.role);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setFormName('');
    setFormEmail('');
    setFormRole('support');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingStaff) {
        // Update existing staff role
        const success = await updateStaffRole(editingStaff.id, formRole);
        if (success) {
          addToast('Đã cập nhật thông tin nhân viên', 'success');
          await loadData();
        } else {
          addToast('Không thể cập nhật', 'error');
        }
      } else {
        // Add new staff by email
        const success = await addStaffMember(formEmail, formRole);
        if (success) {
          addToast('Đã thêm nhân viên mới', 'success');
          await loadData();
        } else {
          addToast('Không tìm thấy user với email này', 'error');
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirm = (s: StaffMember) => {
    setDeletingStaff(s);
  };

  const confirmDelete = async () => {
    if (!deletingStaff) return;

    setSaving(true);
    try {
      const success = await removeStaffMember(deletingStaff.id);
      if (success) {
        addToast('Đã xoá nhân viên khỏi hệ thống', 'success');
        await loadData();
      } else {
        addToast('Không thể xoá', 'error');
      }
    } catch (error) {
      addToast('Có lỗi xảy ra', 'error');
    } finally {
      setSaving(false);
      setDeletingStaff(null);
    }
  };

  const formatLastActive = (dateStr: string | null) => {
    if (!dateStr) return 'Chưa đăng nhập';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 5) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
    return `${Math.floor(diffMins / 1440)} ngày trước`;
  };

  const getRoleStyle = (role: StaffRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'editor':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'support':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getRoleLabel = (role: StaffRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'editor': return 'Editor';
      case 'support': return 'Support';
      default: return role;
    }
  };

  const getRoleAccent = (role: StaffRole) => ({
    super_admin: 'border-t-blue-500',
    admin: 'border-t-violet-500',
    editor: 'border-t-emerald-500',
    support: 'border-t-amber-500',
  }[role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 md:text-3xl">
            <Shield size={20} className="text-indigo-600" />
            Phân Quyền Nhân Viên
            <button
              onClick={loadData}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCcw size={16} className="text-slate-400" />
            </button>
          </h2>
          <p className="text-sm text-slate-500">
            Quản lý danh sách nhân sự, vai trò và trạng thái truy cập hệ thống.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Plus size={18} /> Thêm nhân viên
        </button>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex min-h-[130px] items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Users size={23} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">
              Tổng nhân sự
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {staff.length} tài khoản
            </p>
          </div>
        </div>
        <div className="flex min-h-[130px] items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Shield size={23} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
              Đang hoạt động
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {totalActive} hoạt động
            </p>
          </div>
        </div>
        <div className="flex min-h-[130px] items-center gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Lock size={23} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-violet-700">
              Nhóm quyền
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {roles.filter(r => r.count > 0).length} vai trò
            </p>
          </div>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => (
          <div
            key={role.name}
            className={`group cursor-pointer rounded-2xl border border-slate-200 border-t-4 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${getRoleAccent(role.name)}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div
                className={`p-2.5 rounded-xl border ${role.color} flex items-center justify-center`}
              >
                <Shield size={18} />
              </div>
              {role.count > 0 && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Đang dùng
                </span>
              )}
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              {role.label}
            </h3>
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{role.description}</p>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-400 flex items-center gap-1">
                <Users size={12} />
                {role.count} tài khoản
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Staff List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <h3 className="font-bold text-lg text-slate-900">
            Danh sách nhân sự
          </h3>
          <p className="text-xs text-slate-400">
            Quản lý tài khoản nội bộ và quyền truy cập dashboard.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold tracking-wide">
              <tr>
                <th className="px-6 py-4 pl-8">Nhân viên</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Hoạt động cuối</th>
                <th className="px-6 py-4 text-right pr-8">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedStaff.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-4 pl-8">
                    <div className="flex items-center gap-3">
                      {s.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {s.name}
                        </p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border uppercase tracking-wide ${getRoleStyle(s.role)}`}
                    >
                      {getRoleLabel(s.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {s.status === 'active' ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatLastActive(s.last_active)}
                  </td>
                  <td className="px-6 py-4 text-right pr-8">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Sửa thông tin"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(s)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Xoá nhân viên"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center"
                  >
                    <AlertCircle size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Chưa có nhân viên nào.</p>
                    <p className="text-xs text-slate-400 mt-1">Thêm user với role admin/editor/support để hiển thị ở đây.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {staff.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>Hiển thị <b>{(safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, staff.length)}</b> / {staff.length} nhân sự</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold">Mỗi trang</span>
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value) as 10 | 20 | 50); setCurrentPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-bold outline-none">
                <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
              </select>
              <button disabled={safeCurrentPage === 1} onClick={() => setCurrentPage(page => Math.max(1, page - 1))} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:cursor-not-allowed disabled:opacity-40">Trước</button>
              <span className="min-w-[72px] text-center font-bold">{safeCurrentPage}/{totalPages}</span>
              <button disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:cursor-not-allowed disabled:opacity-40">Sau</button>
            </div>
          </div>
        )}
      </div>

      {/* STAFF MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <h3 className="text-lg md:text-xl font-bold text-slate-900">
                {editingStaff ? 'Sửa thông tin' : 'Thêm nhân viên mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {editingStaff && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nhân viên
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {editingStaff.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{editingStaff.name}</p>
                      <p className="text-xs text-slate-500">{editingStaff.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {!editingStaff && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email đăng nhập
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    User phải đã đăng ký tài khoản trước đó.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Vai trò (Role)
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as StaffRole)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor (Quản lý nội dung)</option>
                  <option value="support">Support (CSKH)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 text-sm disabled:opacity-50"
                >
                  {saving ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-rose-50/60">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Xoá nhân viên khỏi hệ thống?
                </h3>
                <p className="text-xs text-slate-500">
                  Nhân viên sẽ trở thành user thường.
                </p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-slate-600">
                Bạn chắc chắn muốn xoá:{' '}
                <span className="font-semibold">{deletingStaff.name}</span> (
                {deletingStaff.email})?
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                  onClick={() => setDeletingStaff(null)}
                >
                  Hủy
                </button>
                <button
                  className="flex-1 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors text-sm flex items-center justify-center gap-2"
                  onClick={confirmDelete}
                  disabled={saving}
                >
                  {saving && <Loader size={14} className="animate-spin" />}
                  Xoá nhân viên
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesManager;
