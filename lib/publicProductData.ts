import 'server-only';

import { cache } from 'react';
import type { DbProduct } from '@/lib/products';
import { createPublicServerClient } from '@/lib/supabase/public-server';

const PRODUCT_SELECT = `
  *,
  category:category_id (id, name, slug)
`;

export const getPublicProduct = cache(async (identifier: string): Promise<DbProduct | null> => {
  const supabase = createPublicServerClient();
  const isNumericId = /^\d+$/.test(identifier);

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'active');

  query = isNumericId
    ? query.eq('id', Number(identifier))
    : query.eq('slug', identifier);

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Unable to load public product: ${error.message}`);
  }

  return data as DbProduct | null;
});
