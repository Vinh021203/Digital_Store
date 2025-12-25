'use client';

import React, { memo, useState, useCallback } from 'react';
import Image from 'next/image';
import { Heart, MessageSquare, Share2, MoreHorizontal, Globe } from 'lucide-react';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = memo(({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = useCallback(() => {
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  }, [liked]);

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src={post.avatar}
              alt={post.author}
              fill
              sizes="40px"
              className="rounded-full border border-slate-200 object-cover"
            />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{post.author}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{post.time}</span>
              <span className="text-slate-300">•</span>
              <Globe size={10} className="text-slate-400" />
            </div>
          </div>
        </div>
        <button
          className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <h3 className="font-bold text-lg text-slate-900 mb-2 cursor-pointer hover:text-orange-600 transition-colors">
        {post.title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-4 whitespace-pre-line line-clamp-4">
        {post.content}
      </p>

      {/* Image */}
      {post.image && (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative aspect-video">
          <Image
            src={post.image}
            alt="Post content"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg hover:bg-orange-100 cursor-pointer transition-colors"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-slate-500 text-sm font-semibold">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors group px-2 py-1 rounded-lg ${liked
              ? 'text-rose-500 bg-rose-50'
              : 'hover:text-rose-500 hover:bg-rose-50'
            }`}
        >
          <Heart
            size={18}
            className={`transition-all group-active:scale-125 ${liked ? 'fill-current' : ''}`}
          />
          <span>{likeCount}</span>
          <span className="hidden sm:inline">Thích</span>
        </button>

        <button className="flex items-center gap-2 hover:text-orange-600 transition-colors group px-2 py-1 rounded-lg hover:bg-orange-50">
          <MessageSquare size={18} />
          <span>{post.comments}</span>
          <span className="hidden sm:inline">Bình luận</span>
        </button>

        <button className="flex items-center gap-2 hover:text-orange-600 transition-colors group px-2 py-1 rounded-lg hover:bg-orange-50">
          <Share2 size={18} />
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>
      </div>
    </article>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;
