-- Run once in Supabase SQL Editor.
-- Adds the product-level technical metadata used by the Admin CMS.

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS file_format TEXT,
ADD COLUMN IF NOT EXISTS compatibility TEXT;

COMMENT ON COLUMN public.products.file_format IS
'Human-readable files or formats included, for example HTML, CSS, JS, Figma.';

COMMENT ON COLUMN public.products.compatibility IS
'Human-readable runtime or platform compatibility, for example React 18+, Node.js 20+.';
