'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, CartItem } from '@/types';
import { createClient } from '@/lib/supabase/client';
import {
  fetchWishlist,
  addToWishlist as addToWishlistDB,
  removeProductFromWishlist,
  type DbWishlistItem
} from '@/lib/wishlist';

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  compareList: Product[];
  addToCart: (product: Product, licenseType?: 'Regular' | 'Extended' | 'Unlimited') => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  toggleCart: () => void;
  isLoading: boolean;

  // Wishlist functionality
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;

  // Compare functionality
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: number) => void;
  isInCompare: (productId: number) => boolean;
  clearCompare: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// License price multipliers
const LICENSE_MULTIPLIERS = {
  Regular: 1,
  Extended: 2.5,
  Unlimited: 5,
};

export const CartProvider = ({ children }: { children?: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load cart from DB or localStorage
  const loadCart = useCallback(async () => {
    setIsHydrated(true);

    if (userId) {
      // User logged in - load from database
      setIsLoading(true);
      try {
        const supabase = createClient();
        if (!supabase) {
          console.error('[Cart] Supabase client is null');
          return;
        }

        const { data, error } = await supabase
          .from('carts')
          .select(`
            id,
            product_id,
            license_type,
            created_at,
            product:product_id (id, name, slug, price, original_price, image, author)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Cart] Error loading from DB:', error);
          throw error;
        }
        // Convert DB data to CartItem format
        const cartItems: CartItem[] = (data || []).map((item: any) => ({
          id: item.product?.id || item.product_id,
          name: item.product?.name || 'Unknown',
          slug: item.product?.slug || '',
          price: item.product?.price || 0,
          originalPrice: item.product?.original_price || undefined,
          image: item.product?.image || '',
          author: item.product?.author || '',
          quantity: 1, // Digital products = quantity 1
          licenseType: item.license_type || 'Regular',
          dbId: item.id, // Store DB row id for updates/deletes
          // Required Product fields with defaults
          description: '',
          category: '',
          rating: 0,
          reviews: 0,
          format: 'Template' as const,
        }));

        // Merge with localStorage cart (for items added before login)
        const localCart = localStorage.getItem('homelife_cart');
        if (localCart) {
          const localItems = JSON.parse(localCart) as CartItem[];

          // Add local items to DB if not already there
          for (const localItem of localItems) {
            const exists = cartItems.some(dbItem => dbItem.id === localItem.id);
            if (!exists) {
              // Add to database
              const { error: insertError } = await supabase.from('carts').insert({
                user_id: userId,
                product_id: localItem.id,
                license_type: localItem.licenseType || 'Regular',
              });
              if (insertError) {
                console.error('[Cart] Error inserting to DB:', insertError);
              }
              cartItems.push(localItem);
            }
          }

          // Clear localStorage after merge
          localStorage.removeItem('homelife_cart');
        }

        setCart(cartItems);

        // ====== LOAD WISHLIST FROM DB ======
        const wishlistData = await fetchWishlist(userId);

        const wishlistItems: Product[] = wishlistData.map((item: DbWishlistItem) => ({
          id: item.product?.id || item.product_id,
          name: item.product?.name || 'Unknown',
          slug: item.product?.slug || '',
          price: item.product?.price || 0,
          originalPrice: item.product?.original_price || undefined,
          image: item.product?.image || '',
          author: item.product?.author || '',
          rating: item.product?.rating || 0,
          description: '',
          category: '',
          reviews: 0,
          format: 'Template' as const,
        }));

        // Merge with localStorage wishlist
        const localWishlist = localStorage.getItem('homelife_wishlist');
        if (localWishlist) {
          const localItems = JSON.parse(localWishlist) as Product[];

          for (const localItem of localItems) {
            const exists = wishlistItems.some(dbItem => dbItem.id === localItem.id);
            if (!exists) {
              await addToWishlistDB(userId, localItem.id);
              wishlistItems.push(localItem);
            }
          }
          localStorage.removeItem('homelife_wishlist');
        }

        setWishlist(wishlistItems);
      } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback to localStorage
        const localCart = localStorage.getItem('homelife_cart');
        const localWishlist = localStorage.getItem('homelife_wishlist');
        if (localCart) setCart(JSON.parse(localCart));
        if (localWishlist) setWishlist(JSON.parse(localWishlist));
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest - load from localStorage
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('homelife_cart');
        const savedWishlist = localStorage.getItem('homelife_wishlist');
        const savedCompare = localStorage.getItem('homelife_compare');
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
        if (savedCompare) setCompareList(JSON.parse(savedCompare));
      }
    }
  }, [userId]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined' && !userId) {
      localStorage.setItem('homelife_cart', JSON.stringify(cart));
    }
  }, [cart, isHydrated, userId]);

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('homelife_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isHydrated]);

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('homelife_compare', JSON.stringify(compareList));
    }
  }, [compareList, isHydrated]);

  // Cart Logic - with DB sync
  const addToCart = async (product: Product, licenseType: 'Regular' | 'Extended' | 'Unlimited' = 'Regular') => {
    // Check if already in cart
    const existing = cart.find(item => item.id === product.id);
    if (existing) return; // Digital products - no duplicates

    const newItem: CartItem = {
      ...product,
      quantity: 1,
      licenseType,
    };

    // Optimistic update
    setCart(prev => [...prev, newItem]);

    if (userId) {
      // Sync to database
      try {
        const supabase = createClient();
        if (!supabase) return;

        const { data, error } = await supabase
          .from('carts')
          .insert({
            user_id: userId,
            product_id: product.id,
            license_type: licenseType,
          })
          .select('id')
          .single();

        if (error) throw error;

        // Update with DB id
        setCart(prev =>
          prev.map(item =>
            item.id === product.id ? { ...item, dbId: data.id } : item
          )
        );
      } catch (error) {
        console.error('Error adding to cart:', error);
        // Rollback on error
        setCart(prev => prev.filter(item => item.id !== product.id));
      }
    }
  };

  const removeFromCart = async (productId: number) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    // Optimistic update
    setCart(prev => prev.filter(i => i.id !== productId));

    if (userId && item.dbId) {
      try {
        const supabase = createClient();
        if (!supabase) return;

        const { error } = await supabase
          .from('carts')
          .delete()
          .eq('id', item.dbId);

        if (error) throw error;
      } catch (error) {
        console.error('Error removing from cart:', error);
        // Rollback on error
        setCart(prev => [...prev, item]);
      }
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    // Digital products typically don't have quantity > 1, but keep for compatibility
    setCart(prev =>
      prev.map(item => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = async () => {
    const oldCart = [...cart];
    setCart([]);

    if (userId) {
      try {
        const supabase = createClient();
        if (!supabase) return;

        const { error } = await supabase
          .from('carts')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      } catch (error) {
        console.error('Error clearing cart:', error);
        setCart(oldCart);
      }
    } else {
      localStorage.removeItem('homelife_cart');
    }
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // Wishlist Logic - with DB sync
  const addToWishlist = async (product: Product) => {
    // Check if already in wishlist
    if (wishlist.some(p => p.id === product.id)) return;

    // Optimistic update
    setWishlist(prev => [...prev, product]);

    if (userId) {
      try {
        await addToWishlistDB(userId, product.id);
      } catch (error) {
        console.error('[Wishlist] Error adding to DB:', error);
        // Rollback on error
        setWishlist(prev => prev.filter(p => p.id !== product.id));
      }
    }
  };

  const removeFromWishlist = async (productId: number) => {
    const item = wishlist.find(p => p.id === productId);
    if (!item) return;

    // Optimistic update
    setWishlist(prev => prev.filter(p => p.id !== productId));

    if (userId) {
      try {
        await removeProductFromWishlist(userId, productId);
      } catch (error) {
        console.error('[Wishlist] Error removing from DB:', error);
        // Rollback on error
        setWishlist(prev => [...prev, item]);
      }
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(p => p.id === productId);
  };

  // Compare Logic
  const addToCompare = (product: Product) => {
    setCompareList(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      if (prev.length >= 3) return prev;
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: number) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
  };

  const isInCompare = (productId: number) => {
    return compareList.some(p => p.id === productId);
  };

  const clearCompare = () => setCompareList([]);

  // Calculate totals with license multipliers
  const totalItems = cart.length;
  const totalPrice = cart.reduce((sum, item) => {
    const multiplier = LICENSE_MULTIPLIERS[item.licenseType as keyof typeof LICENSE_MULTIPLIERS] || 1;
    return sum + item.price * multiplier * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        toggleCart,
        isLoading,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
