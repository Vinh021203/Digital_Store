import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    // Guard: Skip if Supabase env vars are not configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase env vars not configured. Skipping auth middleware.');
        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Use getSession() for faster check - doesn't make network call if session exists in cookies
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    // If there's an auth error, don't redirect - let client handle it
    if (error) {
        console.warn('Auth session error:', error.message);
        // Don't redirect on error - let the page load and client will handle auth state
        return supabaseResponse;
    }

    // Protected routes - redirect to login if not authenticated
    const protectedPaths = ['/profile', '/checkout', '/admin'];
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    // Only redirect if explicitly no session (not on error or loading)
    if (isProtectedPath && !session) {
        // Check for auth cookies to avoid premature redirects
        const hasAuthCookie = request.cookies.getAll().some(
            cookie => cookie.name.includes('auth-token') || cookie.name.includes('sb-')
        );

        // If there's an auth cookie, let the page load - session might be restoring
        if (hasAuthCookie) {
            return supabaseResponse;
        }

        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // ========================================
    // SECURITY: Admin routes - check if user has admin role
    // ========================================
    if (request.nextUrl.pathname.startsWith('/admin') && session) {
        // Query profiles table for role (role is stored in profiles, not user_metadata)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profileError || profile?.role !== 'admin') {
            // Redirect non-admin users to homepage
            console.warn('Non-admin user attempted to access admin route:', session.user.email);
            return NextResponse.redirect(new URL('/', request.url));
        }
    }
    // ========================================

    return supabaseResponse;
}

