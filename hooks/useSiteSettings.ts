// hooks/useSiteSettings.ts
// React hook to fetch and cache site settings for client components

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPublicSettings, getPaymentSettings, isMaintenanceMode } from '@/lib/siteSettings';

export interface PublicSiteSettings {
    siteName: string;
    tagline: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    logo: string;
    favicon: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    social: {
        facebook: string;
        youtube: string;
        tiktok: string;
        instagram: string;
        zalo: string;
    };
}

export interface PaymentSettings {
    vnpay: { enabled: boolean };
    momo: { enabled: boolean };
    bankTransfer: {
        enabled: boolean;
        bankName: string;
        accountNumber: string;
        accountName: string;
        branch: string;
        qrImage: string;
    };
}

// Default settings before data loads
const defaultPublicSettings: PublicSiteSettings = {
    siteName: 'Shop Web rẻ',
    tagline: 'Kho giao diện website đẹp, dễ dùng, giá hợp lý',
    description: 'Mua giao diện website, template, landing page, UI kit, dashboard và source code chất lượng cao.',
    email: '',
    phone: '',
    address: '',
    logo: '',
    favicon: '',
    maintenanceMode: false,
    maintenanceMessage: '',
    social: {
        facebook: '',
        youtube: '',
        tiktok: '',
        instagram: '',
        zalo: '',
    },
};

/**
 * Hook to get public site settings
 * Use this in Header, Footer, etc. for site name, logo, contact info
 */
export function useSiteSettings() {
    const [settings, setSettings] = useState<PublicSiteSettings>(defaultPublicSettings);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const data = await getPublicSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error loading site settings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { settings, loading, refresh };
}

/**
 * Hook to get payment settings for checkout
 */
export function usePaymentSettings() {
    const [settings, setSettings] = useState<PaymentSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getPaymentSettings();
                setSettings(data);
            } catch (error) {
                console.error('Error loading payment settings:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return { settings, loading };
}

/**
 * Hook to check maintenance mode
 * Use this in layout to redirect to maintenance page
 */
export function useMaintenanceMode() {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function check() {
            try {
                const result = await isMaintenanceMode();
                setIsMaintenance(result);
            } catch (error) {
                console.error('Error checking maintenance mode:', error);
            } finally {
                setLoading(false);
            }
        }
        check();
    }, []);

    return { isMaintenance, loading };
}
