'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProductEditor from '@/components/admin/ProductEditor';

export default function EditProductPage() {
    const params = useParams();
    const productId = params.id as string;

    return <ProductEditor mode="edit" productId={productId} />;
}
