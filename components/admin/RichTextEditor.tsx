'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo,
  Type,
  Underline,
  Undo,
  Upload,
  X,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  uploadType?: string;
  imageAlt?: string;
}

type EditorMode = 'visual' | 'html';

const keepSafeDesignClasses = (_match: string, classValue: string) => {
  const safeClasses = classValue
    .split(/\s+/)
    .map((className) => className.trim())
    .filter((className) => /^(seo|blog)-[a-z0-9_-]+$/i.test(className));

  return safeClasses.length ? ` class="${safeClasses.join(' ')}"` : '';
};

const cleanPastedHtml = (html: string) =>
  html
    .replace(/<o:p[^>]*>.*?<\/o:p>/gi, '')
    .replace(/<\/?o:[^>]*>/gi, '')
    .replace(/<\/?v:[^>]*>/gi, '')
    .replace(/<\/?w:[^>]*>/gi, '')
    .replace(/\s*mso-[^:]+:[^;"']+;?/gi, '')
    .replace(/\s*class="([^"]*)"/gi, keepSafeDesignClasses)
    .replace(/\s*style="[^"]*"/gi, '')
    .replace(/^[\s\S]*<body[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*$/i, '')
    .trim();

const textToHtml = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  minHeight = 300,
  uploadType = 'product-image',
  imageAlt = 'Ảnh minh họa',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<EditorMode>('visual');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (mode === 'visual' && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [mode, value]);

  const syncContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, cmdValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, cmdValue);
    syncContent();
  };

  const formatBlock = (tag: string) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, `<${tag}>`);
    syncContent();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const html = event.clipboardData.getData('text/html');
    const text = event.clipboardData.getData('text/plain');

    document.execCommand('insertHTML', false, html ? cleanPastedHtml(html) : textToHtml(text));
    syncContent();
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;

    editorRef.current?.focus();
    const safeUrl = linkUrl.trim();
    const safeText = linkText.trim() || safeUrl;
    document.execCommand(
      'insertHTML',
      false,
      `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeText}</a>`
    );
    syncContent();
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`/api/upload/${uploadType}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload ảnh thất bại');
      setImageUrl(data.url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const insertImage = () => {
    if (!imageUrl.trim()) return;

    editorRef.current?.focus();
    document.execCommand(
      'insertHTML',
      false,
      `<img src="${imageUrl.trim()}" alt="${imageAlt}" />`
    );
    syncContent();
    setImageUrl('');
    setShowImageModal(false);
  };

  const toolbarRows = [
    [
      { icon: Undo, label: 'Hoàn tác', action: () => execCommand('undo') },
      { icon: Redo, label: 'Làm lại', action: () => execCommand('redo') },
      'separator',
      { icon: Bold, label: 'In đậm', action: () => execCommand('bold') },
      { icon: Italic, label: 'In nghiêng', action: () => execCommand('italic') },
      { icon: Underline, label: 'Gạch chân', action: () => execCommand('underline') },
      'separator',
      { icon: Heading1, label: 'Tiêu đề 1', action: () => formatBlock('h1') },
      { icon: Heading2, label: 'Tiêu đề 2', action: () => formatBlock('h2') },
      { icon: Heading3, label: 'Tiêu đề 3', action: () => formatBlock('h3') },
      'separator',
      { icon: AlignLeft, label: 'Căn trái', action: () => execCommand('justifyLeft') },
      { icon: AlignCenter, label: 'Căn giữa', action: () => execCommand('justifyCenter') },
      { icon: AlignRight, label: 'Căn phải', action: () => execCommand('justifyRight') },
      { icon: AlignJustify, label: 'Căn đều', action: () => execCommand('justifyFull') },
    ],
    [
      { icon: List, label: 'Danh sách', action: () => execCommand('insertUnorderedList') },
      { icon: ListOrdered, label: 'Danh sách số', action: () => execCommand('insertOrderedList') },
      { icon: Quote, label: 'Trích dẫn', action: () => formatBlock('blockquote') },
      { icon: Minus, label: 'Đường kẻ', action: () => execCommand('insertHorizontalRule') },
      'separator',
      { icon: Link, label: 'Chèn link', action: () => setShowLinkModal(true) },
      { icon: ImageIcon, label: 'Chèn ảnh', action: () => setShowImageModal(true) },
    ],
  ];

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/80">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setMode('visual')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${mode === 'visual' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Type size={14} />
                Soạn thảo
              </button>
              <button
                type="button"
                onClick={() => setMode('html')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${mode === 'html' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Code2 size={14} />
                HTML
              </button>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Eye size={14} />
              Nội dung HTML sẽ được render an toàn ở trang client.
            </div>
          </div>

          {mode === 'visual' && (
            <div className="space-y-1 p-2">
              {toolbarRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-wrap gap-1">
                  {row.map((item, itemIndex) => {
                    if (item === 'separator') {
                      return <div key={itemIndex} className="mx-1 h-7 w-px self-center bg-slate-300" />;
                    }

                    const button = item as {
                      icon: React.ElementType;
                      label: string;
                      action: () => void;
                    };

                    return (
                      <button
                        key={`${button.label}-${itemIndex}`}
                        type="button"
                        onClick={button.action}
                        title={button.label}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
                      >
                        <button.icon size={16} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {mode === 'visual' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={syncContent}
            onPaste={handlePaste}
            onBlur={syncContent}
            className="rich-editor-content max-w-none p-5 font-sans text-base font-normal leading-8 text-slate-800 outline-none"
            style={{ minHeight }}
            data-placeholder={placeholder}
            suppressContentEditableWarning
          />
        ) : (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
            className="min-h-[260px] w-full resize-y border-0 bg-slate-950 p-5 font-mono text-sm leading-7 text-slate-100 outline-none"
            style={{ minHeight }}
            placeholder={'Dán HTML vào đây, ví dụ: <h2>Tính năng nổi bật</h2><ul><li>Responsive</li></ul>'}
          />
        )}
      </div>

      <style jsx global>{`
        .rich-editor-content:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        .rich-editor-content h1 {
          margin: 1.25rem 0 0.75rem;
          font-size: 1.875rem;
          line-height: 1.2;
          font-weight: 800;
          color: #0f172a;
        }
        .rich-editor-content h2 {
          margin: 1.25rem 0 0.625rem;
          border-left: 4px solid #f97316;
          padding-left: 1rem;
          font-size: 1.5rem;
          line-height: 1.3;
          font-weight: 800;
          color: #0f172a;
        }
        .rich-editor-content h3 {
          margin: 0.875rem 0 0.5rem;
          font-size: 1.25rem;
          line-height: 1.35;
          font-weight: 700;
          color: #0f172a;
        }
        .rich-editor-content p {
          margin: 0 0 0.875rem;
          line-height: 1.8;
        }
        .rich-editor-content ul,
        .rich-editor-content ol {
          margin: 0.75rem 0 1rem;
          padding-left: 1.5rem;
        }
        .rich-editor-content ul {
          list-style: disc;
        }
        .rich-editor-content ol {
          list-style: decimal;
        }
        .rich-editor-content li {
          margin: 0.375rem 0;
        }
        .rich-editor-content blockquote {
          margin: 1rem 0;
          border-left: 4px solid #f97316;
          background: #fff7ed;
          padding: 0.75rem 1rem;
          color: #475569;
          font-style: italic;
        }
        .rich-editor-content a {
          color: #ea580c;
          font-weight: 700;
          text-decoration: underline;
        }
        .rich-editor-content img {
          margin: 1rem 0;
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
        }
        .rich-editor-content hr {
          margin: 1.25rem 0;
          border: 0;
          border-top: 1px solid #e2e8f0;
        }
      `}</style>

      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowLinkModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-950">Chèn đường dẫn</h3>
              <button type="button" onClick={() => setShowLinkModal(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Text hiển thị</span>
                <input
                  type="text"
                  value={linkText}
                  onChange={(event) => setLinkText(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ví dụ: Xem demo"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">URL</span>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://..."
                />
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLinkModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-600 hover:bg-slate-50">
                  Hủy
                </button>
                <button type="button" onClick={insertLink} disabled={!linkUrl.trim()} className="flex-1 rounded-xl bg-orange-600 py-2.5 font-bold text-white hover:bg-orange-700 disabled:opacity-50">
                  Chèn link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowImageModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-950">Chèn hình ảnh</h3>
              <button type="button" onClick={() => setShowImageModal(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-6 text-slate-600 transition hover:border-orange-400 hover:bg-orange-50 disabled:opacity-60"
              >
                {uploading ? <Loader2 size={32} className="animate-spin text-orange-600" /> : <Upload size={32} className="text-slate-400" />}
                <span className="text-sm font-bold">{uploading ? 'Đang tải ảnh...' : 'Upload ảnh từ máy'}</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold text-slate-400">hoặc</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <input
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://example.com/image.jpg"
              />
              {imageUrl && (
                <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <Image src={imageUrl} alt="Xem trước ảnh" fill className="object-contain" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowImageModal(false); setImageUrl(''); }} className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-600 hover:bg-slate-50">
                  Hủy
                </button>
                <button type="button" onClick={insertImage} disabled={!imageUrl.trim()} className="flex-1 rounded-xl bg-orange-600 py-2.5 font-bold text-white hover:bg-orange-700 disabled:opacity-50">
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
