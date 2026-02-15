/**
 * Rate limiter simples (in-memory). Para escalar, usar Redis.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const PLAN_LIMITS: Record<string, number> = {
    free: 10,     // 10 gerações/mês
    pro: 999999,  // ilimitado
    escola: 999999,
};

const WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

export function checkRateLimit(userId: string, plan: string = "free"): { allowed: boolean; remaining: number } {
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    const now = Date.now();
    const key = `rl:${userId}`;

    let entry = store.get(key);
    if (!entry || now > entry.resetAt) {
        entry = { count: 0, resetAt: now + WINDOW_MS };
        store.set(key, entry);
    }

    if (entry.count >= limit) {
        return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: limit - entry.count };
}
