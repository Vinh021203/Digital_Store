// hooks/useSiteSettings.ts
// React hooks to fetch and cache site settings for client components.

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    getPaymentSettings,
    getPublicSettings,
    getSiteMode,
    isMaintenanceMode,
    type SiteMode,
} from '@/lib/siteSettings';

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
    siteMode: SiteMode;
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
    siteMode: 'sales',
    social: {
        facebook: '',
        youtube: '',
        tiktok: '',
        instagram: '',
        zalo: '',
    },
};

export function useSiteSettings() {
    const [settings, setSettings] = useState<PublicSiteSettings>(defaultPublicSettings);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const data = await getPublicSettings();
            setSettings({
                ...defaultPublicSettings,
                ...data,
                siteMode: data.siteMode === 'catalog' ? 'catalog' : 'sales',
            });
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

export function useSiteMode() {
    const [siteMode, setSiteMode] = useState<SiteMode>('sales');
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setSiteMode(await getSiteMode());
        } catch (error) {
            console.error('Error loading site mode:', error);
            setSiteMode('sales');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        siteMode,
        isCatalogMode: siteMode === 'catalog',
        isSalesMode: siteMode === 'sales',
        loading,
        refresh,
    };
}
