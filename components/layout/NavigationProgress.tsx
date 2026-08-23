'use client';

import { useEffect, useCallback, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Custom NProgress styles - overwrite defaults
const nprogressStyles = `
  #nprogress {
    pointer-events: none;
  }
  #nprogress .bar {
    background: linear-gradient(to right, #f97316, #ef4444);
    position: fixed;
    z-index: 99999;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
  }
  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px #f97316, 0 0 5px #f97316;
    opacity: 1;
    transform: rotate(3deg) translate(0px, -4px);
  }
`;

function NavigationProgressInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isNavigatingRef = useRef(false);

    // Configure NProgress
    useEffect(() => {
        NProgress.configure({
            showSpinner: false,
            trickleSpeed: 200,
            minimum: 0.1,
            easing: 'ease',
            speed: 300,
        });

        // Inject custom styles
        const style = document.createElement('style');
        style.textContent = nprogressStyles;
        document.head.appendChild(style);

        return () => {
            style.remove();
        };
    }, []);

    // Handle navigation complete
    useEffect(() => {
        if (isNavigatingRef.current) {
            NProgress.done();
            isNavigatingRef.current = false;
        }
    }, [pathname, searchParams]);

    // Intercept link clicks to start progress
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const anchor = target.closest('a');

            if (!anchor) return;

            const href = anchor.getAttribute('href');
            const target_attr = anchor.getAttribute('target');

            // Skip external links, hash links, and new tab links
            if (!href ||
                href.startsWith('http') ||
                href.startsWith('#') ||
                target_attr === '_blank' ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:')) {
                return;
            }

            // Skip if same page
            if (href === pathname) {
                return;
            }

            // Start progress bar
            isNavigatingRef.current = true;
            NProgress.start();
        };

        // Intercept form submissions
        const handleSubmit = (event: SubmitEvent) => {
            const form = event.target as HTMLFormElement | null;
            if (form?.dataset.noNavigationProgress === 'true') return;
            isNavigatingRef.current = true;
            NProgress.start();
        };

        document.addEventListener('click', handleClick);
        document.addEventListener('submit', handleSubmit);

        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('submit', handleSubmit);
        };
    }, [pathname]);

    // Handle browser back/forward
    useEffect(() => {
        const handlePopState = () => {
            isNavigatingRef.current = true;
            NProgress.start();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    return null;
}

// Wrapper with Suspense for Next.js 16 compatibility
export function NavigationProgress() {
    return (
        <Suspense fallback={null}>
            <NavigationProgressInner />
        </Suspense>
    );
}

