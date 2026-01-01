'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Link,
    Image as ImageIcon,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Minus,
    Undo,
    Redo,
    X,
    Upload,
    Loader2,
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Nhập nội dung...',
    minHeight = 300,
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isInitialMount = useRef(true);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    // Only set initial value once on mount
    useEffect(() => {
        if (isInitialMount.current && editorRef.current && value) {
            editorRef.current.innerHTML = value;
            isInitialMount.current = false;
        }
    }, [value]);

    const syncContent = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, cmdValue?: string) => {
        // Focus editor first to ensure selection is in the editor
        editorRef.current?.focus();
        document.execCommand(command, false, cmdValue);
        syncContent();
    };

    const handleHeading = (level: string) => {
        editorRef.current?.focus();
        document.execCommand('formatBlock', false, `<${level}>`);
        syncContent();
    };

    const handleList = (ordered: boolean) => {
        editorRef.current?.focus();
        const command = ordered ? 'insertOrderedList' : 'insertUnorderedList';
        document.execCommand(command, false);
        syncContent();
    };

    // Link Modal
    const handleLinkClick = () => {
        const selection = window.getSelection();
        if (selection && selection.toString()) {
            setLinkText(selection.toString());
        }
        setShowLinkModal(true);
    };

    const insertLink = () => {
        if (linkUrl) {
            editorRef.current?.focus();
            if (linkText) {
                document.execCommand('insertHTML', false, `<a href="${linkUrl}" target="_blank">${linkText}</a>`);
            } else {
                document.execCommand('createLink', false, linkUrl);
            }
            syncContent();
        }
        setLinkUrl('');
        setLinkText('');
        setShowLinkModal(false);
    };

    // Image Modal
    const handleImageClick = () => {
        setShowImageModal(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload/product-image', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setImageUrl(data.url);
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const insertImage = () => {
        if (imageUrl) {
            editorRef.current?.focus();
            document.execCommand('insertHTML', false, `<img src="${imageUrl}" alt="image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />`);
            syncContent();
        }
        setImageUrl('');
        setShowImageModal(false);
    };

    const handleInput = () => {
        syncContent();
    };

    // Handle paste - preserve formatting from Word/rich text
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();

        // Try to get HTML first (from Word, other rich editors)
        const html = e.clipboardData.getData('text/html');
        const plainText = e.clipboardData.getData('text/plain');

        if (html) {
            // Clean up Word HTML but keep basic formatting
            let cleanHtml = html
                // Remove Word-specific tags
                .replace(/<o:p[^>]*>.*?<\/o:p>/gi, '')
                .replace(/<\/?o:[^>]*>/gi, '')
                .replace(/<\/?v:[^>]*>/gi, '')
                .replace(/<\/?w:[^>]*>/gi, '')
                // Remove style attributes (Word adds tons)
                .replace(/\s*style="[^"]*"/gi, '')
                .replace(/\s*class="[^"]*"/gi, '')
                // Keep only content between body tags if present
                .replace(/^[\s\S]*<body[^>]*>/i, '')
                .replace(/<\/body>[\s\S]*$/i, '')
                // Clean up extra whitespace
                .replace(/\s+/g, ' ')
                .trim();

            // Insert cleaned HTML
            document.execCommand('insertHTML', false, cleanHtml);
        } else if (plainText) {
            // Convert plain text to HTML with line breaks preserved
            const htmlContent = plainText
                .split('\n\n')
                .map(para => para.trim())
                .filter(para => para)
                .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
                .join('');

            document.execCommand('insertHTML', false, htmlContent || plainText);
        }

        syncContent();
    };

    const toolbarButtons = [
        // Row 1
        [
            { icon: Undo, action: () => execCommand('undo'), title: 'Hoàn tác' },
            { icon: Redo, action: () => execCommand('redo'), title: 'Làm lại' },
            'separator',
            { icon: Bold, action: () => execCommand('bold'), title: 'In đậm' },
            { icon: Italic, action: () => execCommand('italic'), title: 'In nghiêng' },
            { icon: Underline, action: () => execCommand('underline'), title: 'Gạch chân' },
            'separator',
            { icon: Heading1, action: () => handleHeading('h1'), title: 'Tiêu đề 1' },
            { icon: Heading2, action: () => handleHeading('h2'), title: 'Tiêu đề 2' },
            { icon: Heading3, action: () => handleHeading('h3'), title: 'Tiêu đề 3' },
            'separator',
            { icon: AlignLeft, action: () => execCommand('justifyLeft'), title: 'Căn trái' },
            { icon: AlignCenter, action: () => execCommand('justifyCenter'), title: 'Căn giữa' },
            { icon: AlignRight, action: () => execCommand('justifyRight'), title: 'Căn phải' },
            { icon: AlignJustify, action: () => execCommand('justifyFull'), title: 'Căn đều' },
            'separator',
            { icon: List, action: () => handleList(false), title: 'Danh sách' },
            { icon: ListOrdered, action: () => handleList(true), title: 'Danh sách số' },
        ],
        // Row 2
        [
            { icon: Link, action: handleLinkClick, title: 'Chèn link' },
            { icon: ImageIcon, action: handleImageClick, title: 'Chèn ảnh' },
            { icon: Quote, action: () => handleHeading('blockquote'), title: 'Trích dẫn' },
            { icon: Minus, action: () => execCommand('insertHorizontalRule'), title: 'Đường kẻ' },
        ],
    ];

    return (
        <>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                {/* Toolbar */}
                <div className="bg-slate-50 border-b border-slate-200 p-2 space-y-1">
                    {toolbarButtons.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex flex-wrap gap-0.5">
                            {row.map((item, itemIndex) => {
                                if (item === 'separator') {
                                    return <div key={itemIndex} className="w-px h-6 bg-slate-300 mx-1 self-center" />;
                                }
                                const btn = item as { icon: React.ElementType; action: () => void; title: string };
                                return (
                                    <button
                                        key={itemIndex}
                                        type="button"
                                        onClick={btn.action}
                                        title={btn.title}
                                        className="p-2 hover:bg-slate-200 rounded transition-colors text-slate-600 hover:text-slate-900"
                                    >
                                        <btn.icon size={16} />
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Editor */}
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onPaste={handlePaste}
                    onBlur={syncContent}
                    className="p-4 outline-none prose prose-sm max-w-none text-slate-900 min-h-[200px]"
                    style={{ minHeight }}
                    data-placeholder={placeholder}
                    suppressContentEditableWarning
                />

                {/* Styles */}
                <style jsx>{`
                    [contenteditable]:empty:before {
                        content: attr(data-placeholder);
                        color: #9ca3af;
                        pointer-events: none;
                    }
                    [contenteditable] h1 {
                        font-size: 1.75rem;
                        font-weight: 700;
                        margin: 1rem 0 0.5rem;
                    }
                    [contenteditable] h2 {
                        font-size: 1.5rem;
                        font-weight: 600;
                        margin: 1rem 0 0.5rem;
                    }
                    [contenteditable] h3 {
                        font-size: 1.25rem;
                        font-weight: 600;
                        margin: 0.75rem 0 0.5rem;
                    }
                    [contenteditable] p {
                        margin: 0 0 0.75rem;
                    }
                    [contenteditable] ul,
                    [contenteditable] ol {
                        padding-left: 1.5rem;
                        margin: 0.5rem 0;
                    }
                    [contenteditable] ul {
                        list-style-type: disc;
                    }
                    [contenteditable] ol {
                        list-style-type: decimal;
                    }
                    [contenteditable] li {
                        margin: 0.25rem 0;
                    }
                    [contenteditable] blockquote {
                        border-left: 3px solid #f97316;
                        padding-left: 1rem;
                        margin: 0.5rem 0;
                        color: #64748b;
                        font-style: italic;
                    }
                    [contenteditable] a {
                        color: #f97316;
                        text-decoration: underline;
                    }
                    [contenteditable] img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 0.5rem;
                    }
                    [contenteditable] hr {
                        border: none;
                        border-top: 1px solid #e2e8f0;
                        margin: 1rem 0;
                    }
                    [contenteditable] strong, [contenteditable] b {
                        font-weight: 700;
                    }
                    [contenteditable] em, [contenteditable] i {
                        font-style: italic;
                    }
                `}</style>
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLinkModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-slate-900">Chèn đường link</h3>
                            <button onClick={() => setShowLinkModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Text hiển thị</label>
                                <input
                                    type="text"
                                    value={linkText}
                                    onChange={e => setLinkText(e.target.value)}
                                    placeholder="Nhập text..."
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                                <input
                                    type="url"
                                    value={linkUrl}
                                    onChange={e => setLinkUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowLinkModal(false)}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={insertLink}
                                    disabled={!linkUrl}
                                    className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50"
                                >
                                    Chèn link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-slate-900">Chèn hình ảnh</h3>
                            <button onClick={() => setShowImageModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {/* Upload Option */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Upload từ máy</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-orange-400 hover:bg-orange-50 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? (
                                        <Loader2 size={32} className="animate-spin text-orange-600" />
                                    ) : (
                                        <Upload size={32} className="text-slate-400" />
                                    )}
                                    <span className="text-sm text-slate-600 font-medium">
                                        {uploading ? 'Đang tải...' : 'Click để chọn ảnh'}
                                    </span>
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-slate-200" />
                                <span className="text-xs text-slate-400">hoặc</span>
                                <div className="flex-1 h-px bg-slate-200" />
                            </div>

                            {/* URL Option */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nhập URL ảnh</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={e => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* Preview */}
                            {imageUrl && (
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                    <Image src={imageUrl} alt="Preview" fill className="object-contain" />
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => { setShowImageModal(false); setImageUrl(''); }}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={insertImage}
                                    disabled={!imageUrl}
                                    className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50"
                                >
                                    Chèn ảnh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
