'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface SafeHTMLProps {
    html: string;
    className?: string;
    fallback?: string;
}

/**
 * SafeHTML Component
 * Sanitizes HTML content using DOMPurify to prevent XSS attacks.
 * Use this instead of dangerouslySetInnerHTML for user-generated content.
 */
export default function SafeHTML({ html, className = '', fallback = '<p>Không có nội dung</p>' }: SafeHTMLProps) {
    const [sanitizedHtml, setSanitizedHtml] = useState<string>('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // DOMPurify only works in browser
        if (typeof window !== 'undefined') {
            const clean = DOMPurify.sanitize(html || fallback, {
                ALLOWED_TAGS: [
                    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'ul', 'ol', 'li',
                    'a', 'img', 'video',
                    'blockquote', 'code', 'pre',
                    'table', 'thead', 'tbody', 'tr', 'th', 'td',
                    'div', 'span', 'hr',
                ],
                ALLOWED_ATTR: [
                    'href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height',
                    'class',
                ],
                ALLOW_DATA_ATTR: false,
                ADD_ATTR: ['target', 'rel'],
            });

            const template = document.createElement('template');
            template.innerHTML = clean;
            template.content.querySelectorAll('a[target="_blank"]').forEach((link) => {
                link.setAttribute('rel', 'noopener noreferrer');
            });

            setSanitizedHtml(template.innerHTML);
        }
    }, [html, fallback]);

    // SSR fallback
    if (!mounted) {
        return <div className={className}><p>Đang tải nội dung...</p></div>;
    }

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
}
