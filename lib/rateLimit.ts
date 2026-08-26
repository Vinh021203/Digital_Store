import { createHash } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/server';

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

type RateLimitOptions = {
    windowMs: number;
    max: number;
};

type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
    __digitalMartRateLimitStore?: Map<string, RateLimitEntry>;
    __digitalMartDistributedRateLimitRetryAt?: number;
};

const store = globalForRateLimit.__digitalMartRateLimitStore ?? new Map<string, RateLimitEntry>();
globalForRateLimit.__digitalMartRateLimitStore = store;

export function getClientIp(request: Request) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    return forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
    const now = Date.now();
    const current = store.get(key);

    if (!current || current.resetAt <= now) {
        const resetAt = now + options.windowMs;
        store.set(key, { count: 1, resetAt });

        return {
            allowed: true,
            remaining: Math.max(options.max - 1, 0),
            resetAt,
        };
    }

    if (current.count >= options.max) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: current.resetAt,
        };
    }

    current.count += 1;
    store.set(key, current);

    return {
        allowed: true,
        remaining: Math.max(options.max - current.count, 0),
        resetAt: current.resetAt,
    };
}

export async function checkDistributedRateLimit(
    key: string,
    options: RateLimitOptions,
): Promise<RateLimitResult> {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return checkRateLimit(key, options);
    }

    if ((globalForRateLimit.__digitalMartDistributedRateLimitRetryAt || 0) > Date.now()) {
        return checkRateLimit(key, options);
    }

    try {
        const keyHash = createHash('sha256').update(key).digest('hex');
        const supabase = createAdminClient();
        const { data, error } = await supabase.rpc('check_api_rate_limit', {
            p_key: keyHash,
            p_window_seconds: Math.max(1, Math.ceil(options.windowMs / 1000)),
            p_max_requests: Math.max(1, options.max),
        });

        if (error) throw error;
        const result = Array.isArray(data) ? data[0] : data;
        if (!result) throw new Error('Rate limit RPC returned no result.');

        return {
            allowed: Boolean(result.allowed),
            remaining: Number(result.remaining) || 0,
            resetAt: new Date(result.reset_at).getTime(),
        };
    } catch (error) {
        globalForRateLimit.__digitalMartDistributedRateLimitRetryAt = Date.now() + 5 * 60 * 1000;
        console.error('Distributed rate limit unavailable; using process-local fallback.', error);
        return checkRateLimit(key, options);
    }
}

export function getRetryAfterSeconds(resetAt: number) {
    return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}
