'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Check, Plus, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useSiteMode } from '@/hooks/useSiteSettings';

interface FrequentlyBoughtTogetherProps {
    currentProduct: Product;
    recommendedProducts?: Product[]; // Accept from parent
}

export default function FrequentlyBoughtTogether({ currentProduct, recommendedProducts = [] }: FrequentlyBoughtTogetherProps) {
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const { isCatalogMode } = useSiteMode();
    const [selectedProducts, setSelectedProducts] = React.useState<number[]>([currentProduct.id]);

    // Use provided recommendedProducts or empty array
    const bundleProducts = recommendedProducts.slice(0, 2);
    const allProducts = [currentProduct, ...bundleProducts];

    const totalPrice = React.useMemo(() => {
        return allProducts
            .filter(p => selectedProducts.includes(p.id))
            .reduce((sum, p) => sum + p.price, 0);
    }, [selectedProducts, allProducts]);

    const originalTotal = React.useMemo(() => {
        return allProducts
            .filter(p => selectedProducts.includes(p.id))
            .reduce((sum, p) => sum + (p.originalPrice || p.price), 0);
    }, [selectedProducts, allProducts]);

    const savings = originalTotal - totalPrice;
    const bundleDiscount = Math.round((savings / originalTotal) * 100) || 0;

    const toggleProduct = (productId: number) => {
        if (productId === currentProduct.id) return; // Can't deselect current product
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleAddBundle = () => {
        if (isCatalogMode) {
            window.location.href = `/contact?product=${encodeURIComponent(String((currentProduct as any).slug || currentProduct.id))}`;
            return;
        }
        const productsToAdd = allProducts.filter(p => selectedProducts.includes(p.id));
        productsToAdd.forEach(p => addToCart(p));
        addToast(`Đã thêm ${productsToAdd.length} mẫu demo vào danh sách quan tâm!`, 'success');
    };

    if (recommendedProducts.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="text-orange-500" size={20} />
                Bộ mẫu thường xem cùng nhau
            </h3>

            <div className="flex flex-wrap items-center gap-3 mb-6">
                {allProducts.map((product, idx) => (
                    <React.Fragment key={product.id}>
                        <div
                            onClick={() => toggleProduct(product.id)}
                            className={`relative cursor-pointer transition-all ${selectedProducts.includes(product.id)
                                ? 'ring-2 ring-orange-500 ring-offset-2'
                                : 'opacity-50 hover:opacity-75'
                                } ${product.id === currentProduct.id ? 'cursor-default' : ''}`}
                        >
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white">
                                <Image src={product.image} alt={product.name} fill className="object-cover" />
                            </div>
                            {selectedProducts.includes(product.id) && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                    <Check size={14} className="text-white" />
                                </div>
                            )}
                            <p className="text-xs font-bold text-slate-700 mt-2 text-center truncate w-20">
                                {isCatalogMode ? 'Liên hệ tư vấn' : product.price.toLocaleString('vi-VN') + ' VND'}
                            </p>
                        </div>
                        {idx < allProducts.length - 1 && (
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Plus size={16} className="text-orange-500" />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Total & Add Bundle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-orange-200">
                <div>
                    <p className="text-sm text-slate-600 mb-1">
                        Tổng cho {selectedProducts.length} mẫu demo:
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-orange-600">
                            {isCatalogMode ? 'Liên hệ tư vấn' : totalPrice.toLocaleString('vi-VN') + ' VND'}
                        </span>
                        {!isCatalogMode && savings > 0 && (
                            <span className="text-sm text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded">
                                Tiết kiệm {bundleDiscount}%
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleAddBundle}
                    disabled={selectedProducts.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
                >
                    <MessageCircle size={18} />
                    {isCatalogMode ? 'Nhan tu van' : `Them ${selectedProducts.length} mau demo vao danh sach`}
                </button>
            </div>

            {/* Product Names */}
            <div className="mt-4 space-y-1">
                {allProducts.map(product => (
                    <div
                        key={product.id}
                        className={`flex items-center gap-2 text-sm ${selectedProducts.includes(product.id) ? 'text-slate-700' : 'text-slate-400 line-through'
                            }`}
                    >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedProducts.includes(product.id) ? 'border-orange-500 bg-orange-500' : 'border-slate-300'
                            }`}>
                            {selectedProducts.includes(product.id) && <Check size={10} className="text-white" />}
                        </div>
                        <span className="flex-1 truncate">{product.name}</span>
                        <span className="font-bold">{isCatalogMode ? 'Tu van' : product.price.toLocaleString('vi-VN') + ' VND'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
