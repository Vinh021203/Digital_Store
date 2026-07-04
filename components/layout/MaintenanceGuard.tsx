// components/MaintenanceGuard.tsx
// Wraps the app to check maintenance mode and hide storefront for non-admins
// Auto-updates when maintenance mode changes

'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
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
    const pathname = usePathname();
    const [checked, setChecked] = useState(false);
    const [blocked, setBlocked] = useState(false);

    const checkMaintenance = useCallback(async () => {
        // Keep admin/auth/api available while the public storefront is hidden.
        const isAllowed = ALLOWED_PATHS.some(path => pathname?.startsWith(path));

        // Wait for auth to load
        if (isLoading) return;

        try {
            const maintenanceMode = await getSetting('maintenance_mode');
            setBlocked(maintenanceMode === true && !isAdmin && !isAllowed);
        } catch (error) {
            // If error (table doesn't exist), continue normally
            console.error('Maintenance check error:', error);
            setBlocked(false);
        }

        setChecked(true);
    }, [pathname, isAdmin, isLoading]);

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

    // Show nothing while checking or when the storefront is locked.
    if (!checked || isLoading || blocked) {
        return null;
    }

    return <>{children}</>;
}
