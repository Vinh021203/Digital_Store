'use client';

import { useEffect, useId, useState } from 'react';
import DOMPurify from 'dompurify';

interface SafeHTMLProps {
  html: string;
  className?: string;
  fallback?: string;
}

const extractStyleBlocks = (value: string) => {
  const styles: string[] = [];
  const htmlWithoutStyles = value.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
    styles.push(css);
    return '';
  });

  return {
    htmlWithoutStyles,
    css: styles.join('\n'),
  };
};

const sanitizeCss = (css: string) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@import[^;]+;/gi, '')
    .replace(/@charset[^;]+;/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/behavior\s*:/gi, '')
    .replace(/-moz-binding\s*:/gi, '')
    .trim();

const scopeCss = (css: string, scopeClass: string) => {
  const cleanCss = sanitizeCss(css);
  if (!cleanCss) return '';

  return cleanCss.replace(/(^|})\s*([^@{}][^{]+)\{/g, (match, brace, selectorGroup) => {
    const scopedSelectors = selectorGroup
      .split(',')
      .map((selector: string) => selector.trim())
      .filter(Boolean)
      .map((selector: string) => {
        if (selector.startsWith(`.${scopeClass}`)) return selector;
        if (selector.startsWith(':root') || selector === 'html' || selector === 'body') {
          return `.${scopeClass}`;
        }
        return `.${scopeClass} ${selector}`;
      })
      .join(', ');

    return `${brace} ${scopedSelectors} {`;
  });
};

export default function SafeHTML({
  html,
  className = '',
  fallback = '<p>Không có nội dung</p>',
}: SafeHTMLProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState('');
  const [scopedCss, setScopedCss] = useState('');
  const [mounted, setMounted] = useState(false);
  const scopeClass = `safe-html-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    setMounted(true);

    if (typeof window === 'undefined') return;

    const source = html || fallback;
    const { htmlWithoutStyles, css } = extractStyleBlocks(source);
    const clean = DOMPurify.sanitize(htmlWithoutStyles || fallback, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span', 'hr',
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height',
        'class', 'style',
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
    setScopedCss(scopeCss(css, scopeClass));
  }, [html, fallback, scopeClass]);

  if (!mounted) {
    return <div className={className}><p>Đang tải nội dung...</p></div>;
  }

  return (
    <>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      <div className={`${scopeClass} ${className}`} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </>
  );
}
