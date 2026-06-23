'use client';

import React, { useState, useRef, memo, useCallback } from 'react';
import Image from 'next/image';
import {
  X, Send, Globe, ChevronDown, ImageIcon, User, Smile,
  MapPin, BarChart2, Hash
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import confetti from 'canvas-confetti';
import type { DbCommunityPost } from '@/lib/community';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (post: any) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = memo(({ isOpen, onClose, onPost }) => {
  const { user, profile } = useSupabaseAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(newTag) && tags.length < 5) {
        setTags(prev => [...prev, newTag]);
      }
      setTagInput('');
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    // Simulate async operation for effect (real mutation happens in parent)
    setTimeout(() => {
      // Construct payload for Create
      const postData = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : ['Thảo luận'],
        image: selectedImage
      };

      onPost(postData);

      // Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      });

      // Reset
      setTitle('');
      setContent('');
      setTags([]);
      setSelectedImage(null);
      setIsSubmitting(false);
      onClose();
    }, 800);
  }, [title, content, tags, selectedImage, isSubmitting, onPost, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-lg font-black text-slate-900">Tạo bài viết</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 flex-1 custom-scrollbar">
          {/* User Info */}
          <div className="flex gap-3 mb-5 items-center">
            {profile?.avatar ? (
              <div className="relative w-12 h-12">
                <Image
                  src={profile.avatar}
                  alt={profile.name || 'User'}
                  fill
                  sizes="48px"
                  className="rounded-full border border-slate-200 object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                <User size={24} className="text-slate-400" />
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900 text-sm">{profile?.name || user?.email}</p>
              <button
                type="button"
                disabled
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 transition-colors"
                title="Bài viết hiện được đăng công khai"
              >
                <Globe size={12} /> Công khai <ChevronDown size={12} />
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Tiêu đề bài viết..."
              className="w-full text-lg font-bold placeholder-slate-300 border-none outline-none focus:ring-0 px-0 text-slate-900 bg-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
              autoFocus
            />

            <textarea
              rows={4}
              placeholder={`${profile?.name || 'Bạn'} ơi, bạn đang nghĩ gì thế?`}
              className="w-full text-sm placeholder-slate-400 border-none outline-none focus:ring-0 px-0 resize-none text-slate-600 leading-relaxed bg-transparent min-h-[120px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              required
            />

            {/* Image Preview */}
            {selectedImage && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-auto max-h-80 object-contain bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-sm backdrop-blur-sm transition-all"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Add to post */}
            <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Thêm vào bài viết</span>
              <div className="flex gap-1">
                <ActionButton
                  onClick={() => fileInputRef.current?.click()}
                  icon={ImageIcon}
                  color="orange"
                  label="Ảnh/Video"
                />
                <ActionButton icon={User} color="blue" label="Gắn thẻ" />
                <ActionButton icon={Smile} color="amber" label="Cảm xúc" />
                <ActionButton icon={MapPin} color="rose" label="Check-in" />
                <ActionButton icon={BarChart2} color="orange2" label="Thăm dò" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 items-center min-h-[40px]">
              {tags.map((tag) => (
                <TagBadge key={tag} tag={tag} onRemove={removeTag} />
              ))}
              <div className="flex items-center gap-1 text-slate-400 focus-within:text-orange-600 bg-slate-50 px-3 py-1.5 rounded-full border border-transparent focus-within:border-orange-200 transition-colors">
                <Hash size={12} />
                <input
                  type="text"
                  placeholder="Thêm thẻ (Enter)..."
                  className="text-xs outline-none bg-transparent w-24 placeholder-slate-400 text-slate-700 font-medium"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang đăng...
              </span>
            ) : (
              <>
                <Send size={16} /> Đăng Bài Viết
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
});

CreatePostModal.displayName = 'CreatePostModal';

// ========== SUB-COMPONENTS ==========

const ActionButton = memo(({
  onClick,
  icon: Icon,
  color,
  label
}: {
  onClick?: () => void;
  icon: any;
  color: string;
  label: string;
}) => {
  // Fixed color keys logic
  const colorClasses: { [key: string]: string } = {
    orange: 'text-orange-500 hover:bg-orange-50',
    blue: 'text-blue-500 hover:bg-blue-50',
    amber: 'text-amber-500 hover:bg-amber-50',
    rose: 'text-rose-500 hover:bg-rose-50',
    orange2: 'text-orange-500 hover:bg-orange-50' // added to avoid key conflict
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-full transition-colors ${colorClasses[color] || 'text-slate-500'}`}
      title={label}
      aria-label={label}
    >
      <Icon size={18} />
    </button>
  );
});
ActionButton.displayName = 'ActionButton';

const TagBadge = memo(({ tag, onRemove }: { tag: string; onRemove: (tag: string) => void }) => (
  <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-orange-100 animate-fade-in">
    #{tag}
    <button
      type="button"
      onClick={() => onRemove(tag)}
      className="hover:text-orange-900 transition-colors"
      aria-label={`Remove tag ${tag}`}
    >
      <X size={12} />
    </button>
  </span>
));
TagBadge.displayName = 'TagBadge';

export default CreatePostModal;
