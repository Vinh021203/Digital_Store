'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CustomerDetail from '@/components/admin/CustomerDetail';

export default function CustomerDetailPage() {
    const params = useParams();
    const customerId = params.id as string;

    return <CustomerDetail customerId={customerId} />;
}
