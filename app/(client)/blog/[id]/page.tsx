import type { Metadata } from 'next';
import { getPostBySlug } from '@/lib/blog';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const post = await getPostBySlug(id);

    if (!post) {
      return {
        title: 'Bài viết không tìm thấy',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = `${post.title} | Blog Shop Web rẻ`;
    const plainContent = post.content?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const description = post.excerpt || plainContent?.substring(0, 160) || 'Đọc bài viết trên Shop Web rẻ Blog';
    const keywords = [
      ...(post.tags || []),
      post.category,
      'blog',
      'template website',
      'giao diện website',
    ].filter(Boolean);

    return {
      title,
      description,
      keywords: keywords.join(', '),
      authors: post.author ? [{ name: post.author.name }] : undefined,
      openGraph: {
        type: 'article',
        title,
        description,
        images: post.cover_image ? [
          {
            url: post.cover_image,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ] : undefined,
        publishedTime: post.created_at,
        modifiedTime: post.updated_at,
        authors: post.author ? [post.author.name] : undefined,
        section: post.category || undefined,
        tags: post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: post.cover_image ? [post.cover_image] : undefined,
      },
      alternates: {
        canonical: `/blog/${post.slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating blog metadata:', error);
    return {
      title: 'Blog',
    };
  }
}

export { default } from './BlogDetailPage';
