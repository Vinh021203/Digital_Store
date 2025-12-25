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
    const { addToast } = useToast();
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
        if (!confirm(`Bạn có chắc muốn xóa v${version}?`)) return;

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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Package size={24} />
                        <div>
                            <h2 className="font-bold text-lg">Quản lý phiên bản</h2>
                            <p className="text-orange-100 text-sm">{productName}</p>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6">
                {/* Upload Button / Form */}
                {!showUploadForm ? (
                    <button
                        onClick={() => setShowUploadForm(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 font-bold hover:bg-orange-50 transition-colors"
                    >
                        <Plus size={20} />
                        Upload phiên bản mới
                    </button>
                ) : (
                    <form onSubmit={handleUpload} className="bg-orange-50 rounded-xl p-5 mb-4">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Upload size={18} className="text-orange-600" />
                            Upload phiên bản mới
                        </h3>

                        {/* File Upload */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">File sản phẩm *</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".zip,.rar,.7z,.pdf,.tar,.gz"
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            {newVersion.file_url ? (
                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <File size={18} />
                                        <span className="font-medium">{newVersion.fileName || 'File uploaded'}</span>
                                        <span className="text-sm text-green-600">({formatFileSize(newVersion.file_size)})</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewVersion(prev => ({ ...prev, file_url: '', file_size: 0, fileName: '' }));
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingFile}
                                    className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 hover:border-orange-300 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {uploadingFile ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 size={32} className="animate-spin text-orange-600" />
                                            <span className="text-slate-600 font-medium">Đang upload...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload size={32} className="text-slate-400" />
                                            <span className="text-slate-600 font-medium">Click để chọn file</span>
                                            <span className="text-xs text-slate-400">ZIP, RAR, 7Z, PDF • Tối đa 500MB</span>
                                        </div>
                                    )}
                                </button>
                            )}

                            <p className="text-xs text-slate-500 mt-2">
                                Hoặc nhập URL trực tiếp:
                            </p>
                            <input
                                type="url"
                                value={newVersion.file_url}
                                onChange={(e) => setNewVersion({ ...newVersion, file_url: e.target.value })}
                                placeholder="https://storage.example.com/product-v2.zip"
                                className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Version *</label>
                                <input
                                    type="text"
                                    value={newVersion.version}
                                    onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
                                    placeholder="VD: 2.0.0"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">File Size (bytes)</label>
                                <input
                                    type="number"
                                    value={newVersion.file_size}
                                    onChange={(e) => setNewVersion({ ...newVersion, file_size: parseInt(e.target.value) || 0 })}
                                    placeholder="Tự động điền khi upload"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50"
                                    readOnly={!!newVersion.fileName}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Changelog</label>
                            <textarea
                                value={newVersion.changelog}
                                onChange={(e) => setNewVersion({ ...newVersion, changelog: e.target.value })}
                                placeholder="Mô tả những thay đổi trong phiên bản này..."
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
                            <Sparkles size={18} className="text-green-600" />
                            <p className="text-sm text-green-700">
                                Khách hàng đã mua sẽ tự động nhận thông báo về bản cập nhật này!
                            </p>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                type="submit"
                                disabled={uploading || uploadingFile}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                            >
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                Lưu phiên bản
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUploadForm(false);
                                    setNewVersion({ version: '', file_url: '', file_size: 0, changelog: '', fileName: '' });
                                }}
                                className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                )}

                {/* Versions List */}
                <div className="mt-6">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <History size={18} className="text-orange-600" />
                        Lịch sử phiên bản ({versions.length})
                    </h3>

                    {loading ? (
                        <div className="text-center py-8">
                            <Loader2 size={24} className="mx-auto animate-spin text-orange-600" />
                        </div>
                    ) : versions.length > 0 ? (
                        <div className="space-y-3">
                            {versions.map((v) => (
                                <div
                                    key={v.id}
                                    className={`p-4 rounded-xl border ${v.is_current
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
                        <div className="text-center py-8 text-slate-500">
                            <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
                            <p>Chưa có phiên bản nào</p>
                            <p className="text-sm">Upload phiên bản đầu tiên để khách hàng có thể download</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
