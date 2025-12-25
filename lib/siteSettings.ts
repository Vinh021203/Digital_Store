// lib/siteSettings.ts
// Functions to manage site settings from database

import { createClient } from './supabase/client';

export interface SiteSetting {
    id: number;
    key: string;
    value: string | null;
    type: 'string' | 'boolean' | 'json' | 'number';
    group_name: string;
    description: string | null;
}

export interface SiteSettings {
    // General
    site_name: string;
    site_tagline: string;
    site_description: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    site_logo: string;
    site_favicon: string;
    maintenance_mode: boolean;
    maintenance_message: string;

    // Payment
    payment_vnpay_enabled: boolean;
    payment_momo_enabled: boolean;
    payment_bank_transfer_enabled: boolean;
    payment_bank_name: string;
    payment_bank_account_number: string;
    payment_bank_account_name: string;
    payment_bank_branch: string;
    payment_qr_image: string;

    // Social
    social_facebook: string;
    social_youtube: string;
    social_tiktok: string;
    social_instagram: string;
    social_zalo: string;

    // Security
    security_strong_password: boolean;
    security_2fa_enabled: boolean;
    security_recaptcha_enabled: boolean;
    security_session_timeout: number;
}

// Default settings when not in database
const defaultSettings: SiteSettings = {
    site_name: 'DigitalMart',
    site_tagline: 'Nền tảng mua bán sản phẩm số hàng đầu',
    site_description: 'Nền tảng mua bán sản phẩm số: Template, Plugin, Ebook, Course chất lượng cao',
    contact_email: 'veutong961@gmail.com',
    contact_phone: '0971 386 588',
    contact_address: 'Hạ Long, Quảng Ninh, Việt Nam',
    site_logo: '',
    site_favicon: '',
    maintenance_mode: false,
    maintenance_message: 'Website đang được nâng cấp. Vui lòng quay lại sau!',
    payment_vnpay_enabled: true,
    payment_momo_enabled: true,
    payment_bank_transfer_enabled: true,
    payment_bank_name: 'Vietcombank',
    payment_bank_account_number: '',
    payment_bank_account_name: '',
    payment_bank_branch: '',
    payment_qr_image: '',
    social_facebook: '',
    social_youtube: '',
    social_tiktok: '',
    social_instagram: '',
    social_zalo: '',
    security_strong_password: true,
    security_2fa_enabled: false,
    security_recaptcha_enabled: false,
    security_session_timeout: 60,
};

/**
 * Parse setting value based on type
 */
function parseValue(value: string | null, type: string): any {
    if (value === null || value === '') return getDefaultForType(type);

    switch (type) {
        case 'boolean':
            return value === 'true' || value === '1';
        case 'number':
            return Number(value) || 0;
        case 'json':
            try { return JSON.parse(value); } catch { return {}; }
        default:
            return value;
    }
}

function getDefaultForType(type: string): any {
    switch (type) {
        case 'boolean': return false;
        case 'number': return 0;
        case 'json': return {};
        default: return '';
    }
}

/**
 * Get all site settings
 */
export async function getSiteSettings(): Promise<SiteSettings> {
    const supabase = createClient();
    if (!supabase) return defaultSettings;

    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('key, value, type');

        if (error) {
            // Table might not exist yet
            return defaultSettings;
        }

        // Convert array to object
        const settings = { ...defaultSettings };
        (data || []).forEach((row: any) => {
            const key = row.key as keyof SiteSettings;
            if (key in settings) {
                (settings as any)[key] = parseValue(row.value, row.type);
            }
        });

        return settings;
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return defaultSettings;
    }
}

/**
 * Get settings by group
 */
export async function getSettingsByGroup(groupName: string): Promise<SiteSetting[]> {
    const supabase = createClient();
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('group_name', groupName)
            .order('id');

        if (error) {
            console.error('Error fetching settings by group:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getSettingsByGroup:', error);
        return [];
    }
}

/**
 * Get single setting value
 */
export async function getSetting(key: string): Promise<any> {
    const supabase = createClient();
    if (!supabase) return (defaultSettings as any)[key] ?? null;

    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value, type')
            .eq('key', key)
            .maybeSingle();

        if (error || !data) {
            return (defaultSettings as any)[key] ?? null;
        }

        return parseValue(data.value, data.type);
    } catch (error) {
        return (defaultSettings as any)[key] ?? null;
    }
}

/**
 * Update a setting value
 */
export async function updateSetting(key: string, value: any): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    try {
        // Convert value to string
        let stringValue: string;
        if (typeof value === 'boolean') {
            stringValue = value ? 'true' : 'false';
        } else if (typeof value === 'object') {
            stringValue = JSON.stringify(value);
        } else {
            stringValue = String(value);
        }

        const { error } = await supabase
            .from('site_settings')
            .update({ value: stringValue })
            .eq('key', key);

        if (error) {
            console.error('Error updating setting:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error in updateSetting:', error);
        return false;
    }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(updates: Record<string, any>): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    try {
        const promises = Object.entries(updates).map(([key, value]) => {
            let stringValue: string;
            if (typeof value === 'boolean') {
                stringValue = value ? 'true' : 'false';
            } else if (typeof value === 'object') {
                stringValue = JSON.stringify(value);
            } else {
                stringValue = String(value);
            }

            return supabase
                .from('site_settings')
                .update({ value: stringValue })
                .eq('key', key);
        });

        const results = await Promise.all(promises);
        return results.every(r => !r.error);
    } catch (error) {
        console.error('Error in updateSettings:', error);
        return false;
    }
}

/**
 * Check if maintenance mode is enabled
 */
export async function isMaintenanceMode(): Promise<boolean> {
    return await getSetting('maintenance_mode') === true;
}

/**
 * Get payment settings for checkout
 */
export async function getPaymentSettings() {
    const settings = await getSiteSettings();
    return {
        vnpay: {
            enabled: settings.payment_vnpay_enabled,
        },
        momo: {
            enabled: settings.payment_momo_enabled,
        },
        bankTransfer: {
            enabled: settings.payment_bank_transfer_enabled,
            bankName: settings.payment_bank_name,
            accountNumber: settings.payment_bank_account_number,
            accountName: settings.payment_bank_account_name,
            branch: settings.payment_bank_branch,
            qrImage: settings.payment_qr_image,
        },
    };
}

/**
 * Get public settings for client (non-sensitive)
 */
export async function getPublicSettings() {
    const settings = await getSiteSettings();
    return {
        siteName: settings.site_name,
        tagline: settings.site_tagline,
        description: settings.site_description,
        email: settings.contact_email,
        phone: settings.contact_phone,
        address: settings.contact_address,
        logo: settings.site_logo,
        favicon: settings.site_favicon,
        maintenanceMode: settings.maintenance_mode,
        maintenanceMessage: settings.maintenance_message,
        social: {
            facebook: settings.social_facebook,
            youtube: settings.social_youtube,
            tiktok: settings.social_tiktok,
            instagram: settings.social_instagram,
            zalo: settings.social_zalo,
        },
    };
}
