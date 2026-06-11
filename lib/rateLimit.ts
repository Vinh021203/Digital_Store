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

export function getRetryAfterSeconds(resetAt: number) {
    return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}
