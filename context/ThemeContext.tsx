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

const STORAGE_KEY = 'digitalmart_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    // Load theme from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
            setThemeState(stored);
        }
        setMounted(true);
    }, []);

    // Apply theme to document
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        let resolved: 'light' | 'dark' = 'light';

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            resolved = mediaQuery.matches ? 'dark' : 'light';

            // Listen for system theme changes
            const handler = (e: MediaQueryListEvent) => {
                setResolvedTheme(e.matches ? 'dark' : 'light');
            };
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        } else {
            resolved = theme;
        }

        setResolvedTheme(resolved);
    }, [theme, mounted]);

    // Apply class to document
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);

        // Also set color-scheme for native form elements
        root.style.colorScheme = resolvedTheme;
    }, [resolvedTheme, mounted]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    };

    const toggleTheme = () => {
        const nextTheme = resolvedTheme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
    };

    // Prevent flash
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Simple Toggle Button
export const ThemeToggle = memo(({ className = '' }: { className?: string }) => {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${className}`}
            aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <Sun
                size={20}
                className={`absolute inset-0 m-auto transition-all ${resolvedTheme === 'dark'
                        ? 'opacity-0 rotate-90 scale-0'
                        : 'opacity-100 rotate-0 scale-100 text-amber-500'
                    }`}
            />
            <Moon
                size={20}
                className={`transition-all ${resolvedTheme === 'dark'
                        ? 'opacity-100 rotate-0 scale-100 text-indigo-400'
                        : 'opacity-0 -rotate-90 scale-0'
                    }`}
            />
        </button>
    );
});
ThemeToggle.displayName = 'ThemeToggle';

// Dropdown Selector
export const ThemeSelector = memo(({ className = '' }: { className?: string }) => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const options = [
        { value: 'light', label: 'Sáng', icon: Sun },
        { value: 'dark', label: 'Tối', icon: Moon },
        { value: 'system', label: 'Hệ thống', icon: Monitor },
    ] as const;

    const currentOption = options.find(o => o.value === theme) || options[2];
    const CurrentIcon = currentOption.icon;

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            >
                <CurrentIcon size={16} />
                <span>{currentOption.label}</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 min-w-[140px]">
                        {options.map(option => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setTheme(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${theme === option.value ? 'text-orange-600 font-bold' : 'text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    <Icon size={14} />
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
});
ThemeSelector.displayName = 'ThemeSelector';

export default ThemeProvider;
