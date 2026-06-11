import type { RequestEvent } from '@sveltejs/kit';
import { ApiError } from './response';

/**
 * Tiny in-memory token-bucket / fixed-window rate limiter.
 *
 * Good enough for a single-instance deployment. For multi-instance setups
 * swap the `buckets` map with Redis or Upstash and keep the same API.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Periodic cleanup so the map doesn't grow unbounded.
const CLEANUP_EVERY_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function maybeCleanup(now: number) {
	if (now - lastCleanup < CLEANUP_EVERY_MS) return;
	lastCleanup = now;
	for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}

export type RateLimitOptions = {
	/** Unique label per route+method, e.g. "programs:write". */
	key: string;
	/** Max requests allowed within the window. */
	limit: number;
	/** Window length in milliseconds. */
	windowMs: number;
};

/**
 * Returns null when the request is allowed, or a 429 Response when it isn't.
 * Always sets `X-RateLimit-*` informational headers on the event.
 */
export function rateLimit(event: RequestEvent, opts: RateLimitOptions): Response | null {
	const ip = clientIp(event);
	const id = `${opts.key}:${ip}`;
	const now = Date.now();
	maybeCleanup(now);

	let bucket = buckets.get(id);
	if (!bucket || bucket.resetAt <= now) {
		bucket = { count: 0, resetAt: now + opts.windowMs };
		buckets.set(id, bucket);
	}

	bucket.count += 1;
	const remaining = Math.max(0, opts.limit - bucket.count);
	const resetSec = Math.ceil((bucket.resetAt - now) / 1000);

	event.setHeaders({
		'X-RateLimit-Limit': String(opts.limit),
		'X-RateLimit-Remaining': String(remaining),
		'X-RateLimit-Reset': String(resetSec)
	});

	if (bucket.count > opts.limit) {
		return ApiError.tooManyRequests(
			`Too many requests. Try again in ${resetSec}s.`,
			resetSec
		);
	}

	return null;
}

function clientIp(event: RequestEvent): string {
	// Trust event.getClientAddress() — SvelteKit derives this from the platform
	// adapter (or X-Forwarded-For when configured). Fall back to a constant so
	// behind-proxy misconfig doesn't silently disable the limiter.
	try {
		return event.getClientAddress() || 'unknown';
	} catch {
		return 'unknown';
	}
}
