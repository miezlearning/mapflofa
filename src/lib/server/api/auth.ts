import { timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import { ApiError } from './response';

/**
 * Auth for write endpoints. Two acceptable credentials:
 *
 *   1. A logged-in admin session (cookie → event.locals.user.role === 'admin').
 *   2. A bearer token in Authorization header that matches API_ADMIN_TOKEN.
 *
 * Either is enough. The session path is what the dashboard uses;
 * the bearer-token path is for scripts and the docs "Try it out" flow.
 *
 * Returns null on success, or a Response on failure (caller should return it).
 */
export function requireAdmin(event: RequestEvent): Response | null {
	// 1) Session-based — preferred for browser clients.
	const sessionUser = event.locals.user;
	if (sessionUser && sessionUser.role === 'admin') return null;

	// 2) Bearer-token — for scripts.
	const expected = env.API_ADMIN_TOKEN;
	if (!expected || expected.length < 16) {
		// Refuse to authenticate against a weak/missing token rather than fail open.
		return ApiError.internal('API auth is misconfigured.');
	}

	const header = event.request.headers.get('authorization') ?? '';
	const match = header.match(/^Bearer\s+(.+)$/i);
	if (!match) return ApiError.unauthorized();

	const provided = match[1].trim();
	if (!constantTimeEqual(provided, expected)) return ApiError.unauthorized();

	return null;
}

function constantTimeEqual(a: string, b: string): boolean {
	const ab = Buffer.from(a, 'utf8');
	const bb = Buffer.from(b, 'utf8');
	const len = Math.max(ab.length, bb.length);
	const pa = Buffer.alloc(len);
	const pb = Buffer.alloc(len);
	ab.copy(pa);
	bb.copy(pb);
	const eq = timingSafeEqual(pa, pb);
	return eq && ab.length === bb.length;
}
