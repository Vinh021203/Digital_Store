'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import OrderDetail from '@/components/admin/OrderDetail';

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;

    return <OrderDetail orderId={orderId} />;
}
