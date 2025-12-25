'use client';

import { useParams } from 'next/navigation';
import CategoryEditor from '@/components/admin/CategoryEditor';

export default function EditCategoryPage() {
    const params = useParams();
    const categoryId = params.id as string;

    return <CategoryEditor mode="edit" categoryId={categoryId} />;
}
