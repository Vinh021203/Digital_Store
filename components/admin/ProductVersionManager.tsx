'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Upload, Package, History, Trash2, Check, X, FileCode,
    Loader2, Clock, HardDrive, FileText, Plus, AlertCircle, Sparkles, File
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import {
    getProductVersions, uploadNewVersion, deleteVersion, setCurrentVersion,
    type DbProductFile
} from '@/lib/productFiles';

interface ProductVersionManagerProps {
    productId: number;
    productName: string;
    onClose?: () => void;
}

export default function ProductVersionManager({
    productId,
    productName,
    onClose
}: ProductVersionManagerProps) {
    const { addToast, confirm } = useToast();
    const [versions, setVersions] = useState<DbProductFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [newVersion, setNewVersion] = useState({
        version: '',
        file_url: '',
        file_size: 0,
        changelog: '',
        fileName: '',
    });

    const loadVersions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProductVersions(productId);
            setVersions(data);
        } catch (error) {
            console.error('Error loading versions:', error);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        loadVersions();
    }, [loadVersions]);

    // Handle file upload to Cloudinary
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            'application/zip',
            'application/x-zip-compressed',
            'application/x-rar-compressed',
            'application/octet-stream',
            'application/pdf',
            'application/x-7z-compressed',
        ];
        const allowedExtensions = ['.zip', '.rar', '.7z', '.pdf', '.tar', '.gz'];
        const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!allowedTypes.includes(file.type) && !hasValidExtension) {
            addToast('Chỉ hỗ trợ file: ZIP, RAR, 7Z, PDF', 'error');
            return;
        }

        // Max 500MB
        if (file.size > 500 * 1024 * 1024) {
            addToast('File quá lớn! Tối đa 500MB', 'error');
            return;
        }

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload/product-file', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Upload failed');
            }

            const data = await res.json();

            setNewVersion(prev => ({
                ...prev,
                file_url: data.url,
                file_size: file.size,
                fileName: file.name,
            }));

            addToast(`Đã upload: ${file.name}`, 'success');
        } catch (error: any) {
            console.error('Upload error:', error);
            addToast(error.message || 'Lỗi upload file', 'error');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newVersion.version.trim()) {
            addToast('Vui lòng nhập số version (VD: 2.0.0)', 'error');
            return;
        }

        if (!newVersion.file_url.trim()) {
            addToast('Vui lòng upload file hoặc nhập URL', 'error');
            return;
        }

        // Check if version already exists
        if (versions.some(v => v.version === newVersion.version)) {
            addToast('Version này đã tồn tại!', 'error');
            return;
        }

        setUploading(true);
        try {
            await uploadNewVersion({
                product_id: productId,
                version: newVersion.version.trim(),
                file_url: newVersion.file_url.trim(),
                file_size: newVersion.file_size,
                changelog: newVersion.changelog.trim(),
                is_current: true,
            });

            addToast(`Đã upload v${newVersion.version}! Thông báo đã được gửi đến khách hàng.`, 'success');

            // Reset form
            setNewVersion({ version: '', file_url: '', file_size: 0, changelog: '', fileName: '' });
            setShowUploadForm(false);
            loadVersions();
        } catch (error: any) {
            addToast(error.message || 'Lỗi upload version', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileId: number, version: string) => {
        if (!(await confirm(`Bạn có chắc muốn xóa v${version}?`))) return;

        setDeleting(fileId);
        try {
            await deleteVersion(fileId);
            addToast(`Đã xóa v${version}`, 'success');
            loadVersions();
        } catch (error: any) {
            addToast(error.message || 'Không thể xóa version hiện tại', 'error');
        } finally {
            setDeleting(null);
        }
    };

    const handleSetCurrent = async (fileId: number, version: string) => {
        try {
            await setCurrentVersion(productId, fileId);
            addToast(`Đã đặt v${version} làm phiên bản hiện tại`, 'success');
            loadVersions();
        } catch (error: any) {
            addToast(error.message || 'Lỗi', 'error');
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-white sm:px-5">
                <div className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <Package size={20} className="shrink-0" />
                        <div className="min-w-0">
                            <h2 className="text-base font-bold sm:text-lg">Quản lý phiên bản</h2>
                            <p className="truncate text-xs text-orange-100 sm:text-sm">{productName}</p>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-white/20">
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 sm:p-5">
                {/* Upload Button / Form */}
                {!showUploadForm ? (
                    <button
                        onClick={() => setShowUploadForm(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-orange-300 py-3 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-50 sm:text-base"
                    >
                        <Plus size={18} />
                        Upload phiên bản mới
                    </button>
                ) : (
                    <form onSubmit={handleUpload} data-no-navigation-progress="true" className="mb-3 rounded-xl bg-orange-50 p-3">
                        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                            <Upload size={17} className="text-orange-600" />
                            Upload phiên bản mới
                        </h3>

                        {/* File Upload */}
                        <div className="mb-3">
                            <label className="mb-1 block text-xs font-bold text-slate-700">File sản phẩm *</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".zip,.rar,.7z,.pdf,.tar,.gz"
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            {newVersion.file_url ? (
                                <div className="flex min-w-0 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-2.5 py-2">
                                    <File size={17} className="shrink-0 text-green-700" />
                                    <div className="flex min-w-0 flex-1 items-center gap-1.5 text-green-700">
                                        <span className="min-w-0 truncate text-sm font-semibold">{newVersion.fileName || 'File uploaded'}</span>
                                        <span className="shrink-0 text-xs text-green-600">({formatFileSize(newVersion.file_size)})</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewVersion(prev => ({ ...prev, file_url: '', file_size: 0, fileName: '' }));
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="shrink-0 rounded-md p-1 text-red-500 hover:bg-red-100 hover:text-red-700"
                                    >
                                        <X size={17} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingFile}
                                    className="w-full cursor-pointer rounded-lg border border-dashed border-slate-300 p-3 text-center transition-all hover:border-orange-300 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    {uploadingFile ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 size={26} className="animate-spin text-orange-600" />
                                            <span className="text-slate-600 font-medium">Đang upload...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload size={22} className="text-slate-400" />
                                            <span className="text-slate-600 font-medium">Click để chọn file</span>
                                            <span className="text-xs text-slate-400">ZIP, RAR, 7Z, PDF • Tối đa 500MB</span>
                                        </div>
                                    )}
                                </button>
                            )}

                            <p className="mt-1 text-xs text-slate-500">
                                Hoặc nhập URL trực tiếp:
                            </p>
                            <input
                                type="url"
                                value={newVersion.file_url}
                                onChange={(e) => setNewVersion({ ...newVersion, file_url: e.target.value })}
                                placeholder="https://storage.example.com/product-v2.zip"
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700">Version *</label>
                                <input
                                    type="text"
                                    value={newVersion.version}
                                    onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
                                    placeholder="VD: 2.0.0"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700">File Size (bytes)</label>
                                <input
                                    type="number"
                                    value={newVersion.file_size}
                                    onChange={(e) => setNewVersion({ ...newVersion, file_size: parseInt(e.target.value) || 0 })}
                                    placeholder="Tự động điền khi upload"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                    readOnly={!!newVersion.fileName}
                                />
                            </div>
                        </div>

                        <div className="mt-2">
                            <label className="mb-1 block text-xs font-bold text-slate-700">Changelog</label>
                            <textarea
                                value={newVersion.changelog}
                                onChange={(e) => setNewVersion({ ...newVersion, changelog: e.target.value })}
                                placeholder="Mô tả những thay đổi trong phiên bản này..."
                                rows={2}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2">
                            <Sparkles size={16} className="shrink-0 text-green-600" />
                            <p className="text-xs leading-4 text-green-700">
                                Khách hàng đã mua sẽ tự động nhận thông báo về bản cập nhật này!
                            </p>
                        </div>

                        <div className="mt-2 flex gap-2">
                            <button
                                type="submit"
                                disabled={uploading || uploadingFile}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                            >
                                {uploading ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
                                {uploading ? 'Đang lưu...' : 'Lưu phiên bản'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUploadForm(false);
                                    setNewVersion({ version: '', file_url: '', file_size: 0, changelog: '', fileName: '' });
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                )}

                {/* Versions List */}
                <div className="mt-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base">
                        <History size={18} className="text-orange-600" />
                        Lịch sử phiên bản ({versions.length})
                    </h3>

                    {loading ? (
                        <div className="py-5 text-center">
                            <Loader2 size={24} className="mx-auto animate-spin text-orange-600" />
                        </div>
                    ) : versions.length > 0 ? (
                        <div className="space-y-2">
                            {versions.map((v) => (
                                <div
                                    key={v.id}
                                    className={`rounded-xl border p-3 ${v.is_current
                                        ? 'bg-orange-50 border-orange-200'
                                        : 'bg-white border-slate-100'
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <FileCode size={18} className="text-orange-600" />
                                                <span className="font-bold text-slate-900">v{v.version}</span>
                                                {v.is_current && (
                                                    <span className="px-2 py-0.5 text-xs font-bold bg-green-500 text-white rounded-full">
                                                        Hiện tại
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {formatDate(v.created_at)}
                                                </span>
                                                {v.file_size > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <HardDrive size={14} />
                                                        {formatFileSize(v.file_size)}
                                                    </span>
                                                )}
                                            </div>
                                            {v.changelog && (
                                                <p className="text-sm text-slate-600 mt-2 flex items-start gap-2">
                                                    <FileText size={14} className="mt-0.5 flex-shrink-0" />
                                                    {v.changelog}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {!v.is_current && (
                                                <>
                                                    <button
                                                        onClick={() => handleSetCurrent(v.id, v.version)}
                                                        className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors"
                                                    >
                                                        <Check size={14} />
                                                        Đặt hiện tại
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(v.id, v.version)}
                                                        disabled={deleting === v.id}
                                                        className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                                    >
                                                        {deleting === v.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={14} />
                                                        )}
                                                        Xóa
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-slate-500">
                            <AlertCircle size={28} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm font-semibold">Chưa có phiên bản nào</p>
                            <p className="mt-1 text-xs">Upload phiên bản đầu tiên để khách hàng có thể download</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
