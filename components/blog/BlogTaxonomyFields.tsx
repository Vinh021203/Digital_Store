'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Folder, FolderPlus, Plus, Tags, X } from 'lucide-react';
import { BLOG_CATEGORIES, BLOG_TAGS, collectBlogTaxonomy, fetchAllPosts } from '@/lib/blog';

interface BlogTaxonomyFieldsProps {
  category: string;
  tags: string[];
  onCategoryChange: (category: string) => void;
  onTagsChange: (tags: string[]) => void;
}

export default function BlogTaxonomyFields({ category, tags, onCategoryChange, onTagsChange }: BlogTaxonomyFieldsProps) {
  const [tagInput, setTagInput] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState(BLOG_CATEGORIES.map(item => item.name));
  const [suggestedTags, setSuggestedTags] = useState(BLOG_TAGS);

  useEffect(() => {
    fetchAllPosts().then(posts => {
      const taxonomy = collectBlogTaxonomy(posts);
      setSuggestedCategories(taxonomy.categories);
      setSuggestedTags(taxonomy.tags);
    }).catch(() => undefined);
  }, []);

  const normalizedTags = useMemo(() => new Set(tags.map(tag => tag.toLocaleLowerCase('vi'))), [tags]);
  const availableTags = suggestedTags.filter(tag => !normalizedTags.has(tag.toLocaleLowerCase('vi'))).slice(0, 12);
  const filteredCategories = suggestedCategories.filter(item =>
    item.toLocaleLowerCase('vi').includes(category.trim().toLocaleLowerCase('vi'))
  );

  const addTag = (rawTag = tagInput) => {
    const nextTag = rawTag.trim().replace(/^#/, '');
    if (!nextTag || normalizedTags.has(nextTag.toLocaleLowerCase('vi'))) return;
    onTagsChange([...tags, nextTag]);
    setTagInput('');
  };

  return (
    <>
      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6">
        <h3 className="flex items-center gap-2 border-b pb-3 font-bold text-slate-900">
          <FolderPlus size={18} className="text-indigo-600" /> Danh mục
        </h3>
        <div className="relative">
          <input
            type="text"
            value={category}
            onFocus={() => setCategoryOpen(true)}
            onBlur={() => window.setTimeout(() => setCategoryOpen(false), 120)}
            onChange={event => { onCategoryChange(event.target.value); setCategoryOpen(true); }}
            placeholder="Chọn hoặc nhập danh mục mới"
            className="w-full rounded-xl border border-slate-200 py-3 pl-4 pr-11 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
          <button type="button" onClick={() => setCategoryOpen(open => !open)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400" aria-label="Mở danh sách danh mục">
            <ChevronDown size={18} className={`transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
          </button>
          {categoryOpen && filteredCategories.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/70">
              {filteredCategories.map(item => (
                <button
                  type="button"
                  key={item}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => { onCategoryChange(item); setCategoryOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${category === item ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Folder size={16} /></span>
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs leading-5 text-slate-500">Có thể nhập danh mục mới. Danh mục sẽ tự xuất hiện trên CMS và trang Blog sau khi lưu bài.</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6">
        <h3 className="flex items-center gap-2 border-b pb-3 font-bold text-slate-900">
          <Tags size={18} className="text-indigo-600" /> Thẻ
        </h3>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={event => setTagInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault();
                addTag();
              }
            }}
            placeholder="Nhập thẻ rồi nhấn Enter"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="button" onClick={() => addTag()} className="rounded-xl bg-indigo-600 px-3 text-white hover:bg-indigo-700" aria-label="Thêm thẻ">
            <Plus size={18} />
          </button>
        </div>
        {tags.length > 0 && <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <Tags size={12} /> {tag}
              <button type="button" onClick={() => onTagsChange(tags.filter(item => item !== tag))} aria-label={`Xóa thẻ ${tag}`}><X size={13} /></button>
            </span>
          ))}
        </div>}
        {availableTags.length > 0 && <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button type="button" key={tag} onClick={() => addTag(tag)} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200">
              <Plus size={12} /> {tag}
            </button>
          ))}
        </div>}
      </div>
    </>
  );
}
