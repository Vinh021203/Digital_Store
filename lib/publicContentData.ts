import 'server-only';

import { unstable_cache } from 'next/cache';
import type { DbBlogPost } from '@/lib/blog';
import type { DbCommunityPost } from '@/lib/community';
import { createPublicServerClient } from '@/lib/supabase/public-server';

async function fetchBlogPagePosts(): Promise<DbBlogPost[]> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:author_id (id, name, avatar)
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) {
    throw new Error(`Unable to load public blog posts: ${error.message}`);
  }

  return (data || []) as DbBlogPost[];
}

async function fetchCommunityPagePosts(): Promise<DbCommunityPost[]> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      author:author_id (id, name, avatar, role)
    `)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Unable to load public community posts: ${error.message}`);
  }

  return (data || []) as DbCommunityPost[];
}

export const getBlogPagePosts = unstable_cache(
  fetchBlogPagePosts,
  ['blog-page-public-posts-v1'],
  { revalidate: 180, tags: ['blog'] },
);

export const getCommunityPagePosts = unstable_cache(
  fetchCommunityPagePosts,
  ['community-page-public-posts-v1'],
  { revalidate: 120, tags: ['community'] },
);
