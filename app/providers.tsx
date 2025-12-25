'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SupabaseAuthProvider } from '@/context/SupabaseAuthContext';
import '@/i18n';

interface ProvidersProps {
    children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider>
            <SupabaseAuthProvider>
                <AuthProvider>
                    <CartProvider>
                        <ToastProvider>
                            {children}
                        </ToastProvider>
                    </CartProvider>
                </AuthProvider>
            </SupabaseAuthProvider>
        </ThemeProvider>
    );
}

