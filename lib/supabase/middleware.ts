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

    // IMPORTANT: Use getUser() instead of getSession() for better reliability
    // getUser() validates the session token on every request
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    // Protected routes - redirect to login if not authenticated
    const protectedPaths = ['/profile', '/checkout', '/admin'];
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    // If there's an error or no user on protected routes
    if (isProtectedPath && (!user || error)) {
        // Check for auth cookies to avoid premature redirects during session restoration
        const hasAuthCookie = request.cookies.getAll().some(
            cookie => cookie.name.includes('auth-token') || cookie.name.includes('sb-')
        );

        // If there's an auth cookie but no user, it might be a stale session
        // Let the client-side handle the redirect to avoid flash
        if (hasAuthCookie && error) {
            console.warn('Auth error with existing cookie:', error.message);
            // Return response without redirect - let client handle
            return supabaseResponse;
        }

        // No cookie and no user - definitely not logged in
        if (!hasAuthCookie) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(url);
        }
    }

    // ========================================
    // SECURITY: Admin routes - check if user has admin role
    // ========================================
    if (request.nextUrl.pathname.startsWith('/admin') && user) {
        // Query profiles table for role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.warn('Profile query error in middleware:', profileError.message);
            return NextResponse.redirect(new URL('/', request.url));
        }

        if (!['admin', 'super_admin'].includes(profile?.role || '')) {
            // Redirect non-admin users to homepage
            console.warn('Non-admin user attempted to access admin route');
            return NextResponse.redirect(new URL('/', request.url));
        }
    }
    // ========================================

    return supabaseResponse;
}
