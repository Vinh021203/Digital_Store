// components/MaintenanceGuard.tsx
// Wraps the app to check maintenance mode and redirect non-admins
// Auto-updates when maintenance mode changes

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSetting } from '@/lib/siteSettings';

interface MaintenanceGuardProps {
    children: React.ReactNode;
}

// Pages that should always be accessible (even in maintenance)
const ALLOWED_PATHS = [
    '/maintenance',
    '/login',
    '/register',
    '/admin',
    '/api',
];

// Polling interval in milliseconds
const POLL_INTERVAL = 5000;

export default function MaintenanceGuard({ children }: MaintenanceGuardProps) {
    const { isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [checked, setChecked] = useState(false);

    const checkMaintenance = useCallback(async () => {
        // Skip check for allowed paths (except maintenance page - we check that for auto-redirect back)
        const isAllowed = ALLOWED_PATHS.some(path => pathname?.startsWith(path));
        const isOnMaintenancePage = pathname === '/maintenance';

        // Wait for auth to load
        if (isLoading) return;

        try {
            const maintenanceMode = await getSetting('maintenance_mode');

            if (maintenanceMode === true) {
                // Maintenance is ON
                if (!isAdmin && !isAllowed) {
                    // Not admin and not on allowed page → redirect to maintenance
                    router.replace('/maintenance');
                    return;
                }
            } else {
                // Maintenance is OFF
                if (isOnMaintenancePage) {
                    // User is on maintenance page but maintenance is off → go home
                    router.replace('/');
                    return;
                }
            }
        } catch (error) {
            // If error (table doesn't exist), continue normally
            console.error('Maintenance check error:', error);
        }

        setChecked(true);
    }, [pathname, isAdmin, isLoading, router]);

    // Initial check
    useEffect(() => {
        checkMaintenance();
    }, [checkMaintenance]);

    // Polling for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            checkMaintenance();
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [checkMaintenance]);

    // Show nothing while initial check
    if (!checked && isLoading) {
        return null;
    }

    return <>{children}</>;
}
