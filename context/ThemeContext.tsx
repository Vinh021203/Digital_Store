'use client';

import React, { createContext, useContext, useState, useEffect, memo } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    resolvedTheme: 'light',
    setTheme: () => { },
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'shopwebre_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme] = useState<Theme>('light');
    const [resolvedTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Apply class to document
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add('light');

        // Also set color-scheme for native form elements
        root.style.colorScheme = 'light';
    }, [mounted]);

    const setTheme = () => {};
    const toggleTheme = () => {};

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Simple Toggle Button - disabled and returning null
export const ThemeToggle = memo(() => {
    return null;
});
ThemeToggle.displayName = 'ThemeToggle';

// Dropdown Selector - disabled and returning null
export const ThemeSelector = memo(() => {
    return null;
});
ThemeSelector.displayName = 'ThemeSelector';

export default ThemeProvider;
