import type { Metadata } from 'next';
import { getPostBySlug } from '@/lib/blog';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Await params in Next.js 15+
    const { id } = await params;

    // Get blog post by slug
    const post = await getPostBySlug(id);

    if (!post) {
      return {
        title: 'Bài viết không tìm thấy',
      };
    }

    const title = `${post.title} | Blog DigitalMart`;
    const description = post.excerpt || post.content?.substring(0, 160).replace(/<[^>]*>/g, '') || 'Đọc bài viết trên DigitalMart Blog';

    // Create keywords from tags and category
    const keywords = [
      ...post.tags,
      post.category,
      'blog',
      'tutorial',
      'tips',
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

// Export the page component
export { default } from './BlogDetailPage';
