'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Store, Star, Package, CheckCircle, ArrowLeft,
    Loader2, Users, Share2
} from 'lucide-react';
import { getSellerBySlug, DbSeller } from '@/lib/sellers';
import { fetchActiveProducts } from '@/lib/products';
import { ProductCard } from '@/components/product';
import type { Product } from '@/types';

export default function SellerShopPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [seller, setSeller] = useState<DbSeller | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const loadData = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const sellerData = await getSellerBySlug(slug);
            if (!sellerData) {
                setNotFound(true);
                return;
            }
            setSeller(sellerData);

            // Fetch seller's products
            const productsData = await fetchActiveProducts({ seller_id: sellerData.id });
            setProducts(productsData as any);
        } catch (error) {
            console.error('Error loading seller:', error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (notFound || !seller) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Store size={64} className="text-slate-200 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Cửa hàng không tồn tại</h2>
                <p className="text-slate-500 mb-6">Cửa hàng này có thể đã bị xóa hoặc không khả dụng.</p>
                <Link href="/products" className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700">
                    Khám phá sản phẩm
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Back Button */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <Link href="/products" className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600">
                        <ArrowLeft size={18} /> Quay lại
                    </Link>
                </div>
            </div>

            {/* Seller Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white/20 flex-shrink-0">
                            {seller.logo ? (
                                <Image src={seller.logo} alt={seller.store_name} width={128} height={128} className="object-cover w-full h-full" />
                            ) : (
                                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                                    <Store size={40} className="text-white/60" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-2xl md:text-3xl font-black">{seller.store_name}</h1>
                                {seller.is_verified && (
                                    <CheckCircle size={24} className="text-green-300" />
                                )}
                            </div>
                            <p className="text-orange-100 mb-4 line-clamp-2">{seller.description || 'Chưa có mô tả'}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                    <Package size={16} /> {products.length} sản phẩm
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star size={16} className="text-yellow-300" /> {seller.rating?.toFixed(1) || '5.0'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users size={16} /> {seller.total_sales || 0} lượt bán
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6">Sản phẩm ({products.length})</h2>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border">
                        <Package size={48} className="mx-auto text-slate-200 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có sản phẩm</h3>
                        <p className="text-slate-500">Cửa hàng này chưa có sản phẩm nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
