'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import SellerProductForm from '@/components/seller/SellerProductForm';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { getSellerByUserId, type DbSeller } from '@/lib/sellers';

export default function EditMarketplaceProductPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { user } = useSupabaseAuth();
    const [seller, setSeller] = useState<DbSeller | null>(null);
    const [loading, setLoading] = useState(true);

    const productId = Number.parseInt(params.id, 10);

    useEffect(() => {
        if (!user?.id) return;

        getSellerByUserId(user.id)
            .then(setSeller)
            .finally(() => setLoading(false));
    }, [user?.id]);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-orange-600" size={28} />
            </div>
        );
    }

    if (!seller || !Number.isInteger(productId) || productId <= 0) {
        return (
            <div className="mx-auto max-w-lg px-4 py-16 text-center">
                <h1 className="text-2xl font-black text-slate-950">Không thể chỉnh sửa sản phẩm</h1>
                <p className="mt-2 text-sm text-slate-500">Tài khoản hoặc mã sản phẩm không hợp lệ.</p>
                <button onClick={() => router.push('/profile/marketplace')} className="mt-6 rounded-lg bg-orange-600 px-5 py-3 text-sm font-bold text-white">
                    Quay lại marketplace
                </button>
            </div>
        );
    }

    return (
        <SellerProductForm
            sellerId={seller.id}
            productId={productId}
            onSuccess={() => router.push('/profile/marketplace')}
            onCancel={() => router.push('/profile/marketplace')}
        />
    );
}
