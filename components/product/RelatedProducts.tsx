'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface RelatedProductsProps {
    currentProduct: Product;
    relatedProducts?: Product[]; // Accept from parent
    title?: string;
}

export default function RelatedProducts({ currentProduct, relatedProducts = [], title = "Sản phẩm liên quan" }: RelatedProductsProps) {
    const { addToCart, addToWishlist } = useCart();
    const { addToast } = useToast();

    // Use provided relatedProducts or empty array
    const products = relatedProducts.slice(0, 4);

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        addToast(`Đã thêm "${product.name}" vào giỏ`, 'success');
    };

    const handleAddToWishlist = (product: Product, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToWishlist(product);
        addToast('Đã thêm vào yêu thích', 'success');
    };

    if (products.length === 0) return null;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">{title}</h3>
                <Link
                    href={`/products?category=${typeof currentProduct.category === 'string' ? currentProduct.category : (currentProduct.category as any)?.slug || ''}`}
                    className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700"
                >
                    Xem tất cả <ArrowRight size={14} />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map(product => {
                    const discount = product.originalPrice
                        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                        : 0;

                    return (
                        <Link
                            key={product.id}
                            href={`/product/${(product as any).slug || product.id}`}
                            className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />

                                {/* Badges */}
                                <div className="absolute top-2 left-2 flex gap-1">
                                    {product.format && (
                                        <span className={`text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase ${product.format === 'Theme' ? 'bg-orange-600' :
                                            product.format === 'Template' ? 'bg-amber-600' :
                                                product.format === 'Landing' ? 'bg-red-600' : 'bg-rose-600'
                                            }`}>
                                            {product.format}
                                        </span>
                                    )}
                                </div>

                                {discount > 0 && (
                                    <span className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                                        -{discount}%
                                    </span>
                                )}

                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={(e) => handleAddToCart(product, e)}
                                        className="p-2.5 bg-white rounded-xl text-slate-700 hover:bg-orange-500 hover:text-white transition-colors shadow-lg"
                                    >
                                        <ShoppingCart size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => handleAddToWishlist(product, e)}
                                        className="p-2.5 bg-white rounded-xl text-slate-700 hover:bg-rose-500 hover:text-white transition-colors shadow-lg"
                                    >
                                        <Heart size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <div className="flex items-center gap-1 mb-1">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                                    {product.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-orange-600">{product.price.toLocaleString('vi-VN')}₫</span>
                                    {product.originalPrice && (
                                        <span className="text-xs text-slate-400 line-through">{product.originalPrice.toLocaleString('vi-VN')}₫</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
