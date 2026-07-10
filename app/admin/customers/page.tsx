'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Mail,
  Phone,
  MoreHorizontal,
  Shield,
  BookOpen,
  UserPlus,
  Send,
  Eye,
  Ban,
  Star,
  Loader2,
  Users,
  Crown,
  RefreshCw,
} from 'lucide-react';
import { fetchAllProfiles, getUserStats, type DbProfile } from '@/lib/profiles';
import { useToast } from '@/context/ToastContext';

type RoleFilter = 'all' | 'user' | 'admin';

const PAGE_SIZE = 8;

const CustomersManager: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    users: number;
    admins: number;
    affiliates: number;
    newToday: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesData, statsData] = await Promise.all([
        fetchAllProfiles({
          role: roleFilter === 'all' ? undefined : roleFilter,
          search: searchTerm || undefined,
        }),
        getUserStats(),
      ]);
      setProfiles(profilesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading customers:', error);
      addToast('Không thể tải danh sách khách hàng', 'error');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchTerm, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearch !== undefined) {
      loadData();
    }
  }, [debouncedSearch]);

  const totalItems = profiles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return profiles.slice(start, start + PAGE_SIZE);
  }, [profiles, currentPage]);

  const toggleActionMenu = (id: string) => {
    setActiveActionId(prev => (prev === id ? null : id));
  };

  const handleChangeRole = (role: RoleFilter) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div
      className="space-y-6 animate-fade-in"
      onClick={() => setActiveActionId(null)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Quản Lý Khách Hàng
          </h2>
          <p className="text-sm text-slate-500">
            Quản lý tài khoản, phân quyền và theo dõi giá trị khách hàng.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            <UserPlus size={18} /> Thêm Mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-5 text-white shadow-lg shadow-blue-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Tổng người dùng</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats?.total || 0}</p>
              <p className="mt-3 text-sm font-medium text-white/75">+{stats?.newToday || 0} mới hôm nay</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Users size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white shadow-lg shadow-amber-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Cộng tác viên</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats?.affiliates || 0}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Tài khoản Affiliate</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Crown size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 p-5 text-white shadow-lg shadow-indigo-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Quản trị viên</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats?.admins || 0}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Tài khoản quản trị</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><Shield size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
        <div className="group relative min-h-[156px] overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-5 text-white shadow-lg shadow-emerald-200/60">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex h-full items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Khách hàng</p>
              <p className="mt-2 text-4xl font-black leading-none">{stats?.users || 0}</p>
              <p className="mt-3 text-sm font-medium text-white/75">Tài khoản khách hàng</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15"><BookOpen size={28} strokeWidth={2.2} /></div>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="flex gap-2 p-1 bg-slate-200/50 rounded-lg w-fit">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'user', label: 'User' },
              { key: 'admin', label: 'Admin' },
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => handleChangeRole(filter.key as RoleFilter)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${roleFilter === filter.key
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm tên, email..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4 pl-8">Hồ sơ</th>
                    <th className="px-6 py-4">Vai trò</th>
                    <th className="px-6 py-4">Liên hệ</th>
                    <th className="px-6 py-4">Ngày tham gia</th>
                    <th className="px-6 py-4 text-right pr-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pageItems.map(user => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                {user.name?.charAt(0) || 'U'}
                              </div>
                            )}
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-emerald-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              ID: {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${user.role === 'admin'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                          >
                            {user.role === 'admin' && <Shield size={10} />}
                            {user.role}
                          </span>
                          {user.is_affiliate && (
                            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                              <Star size={10} fill="currentColor" />
                              Affiliate
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <Mail size={12} /> {user.email}
                          </span>
                          {user.phone && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone size={12} /> {user.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {formatDate(user.created_at)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right pr-8 relative">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleActionMenu(user.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${activeActionId === user.id
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          <MoreHorizontal size={20} />
                        </button>

                        {activeActionId === user.id && (
                          <div className="absolute right-8 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-10 overflow-hidden animate-fade-in">
                            <div className="p-1">
                              <button
                                onClick={() =>
                                  router.push(`/admin/customers/${user.id}`)
                                }
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Eye size={16} className="text-slate-400" />
                                Xem chi tiết
                              </button>
                              <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Send size={16} className="text-slate-400" />
                                Gửi Email
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium">
                                <Ban size={16} /> Khóa tài khoản
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {profiles.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <Users size={48} className="mx-auto mb-4 text-slate-200" />
                <p>Không tìm thấy khách hàng phù hợp.</p>
              </div>
            )}

            {/* Pagination */}
            {profiles.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40 text-xs text-slate-500">
                <span>
                  Hiển thị{' '}
                  {totalItems === 0
                    ? 0
                    : (currentPage - 1) * PAGE_SIZE + 1}{' '}
                  - {Math.min(currentPage * PAGE_SIZE, totalItems)} /{' '}
                  {totalItems} khách hàng
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 border border-slate-200 rounded-lg font-bold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage(p => Math.min(totalPages, p + 1))
                    }
                    className="px-3 py-1 border border-slate-200 rounded-lg font-bold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomersManager;
