import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { User } from '$lib/db/schema';

/**
 * Throws a redirect to /admin/login if no session.
 * Returns the typed user otherwise.
 *
 * Use in `load` and `actions` of every protected admin route.
 */
export function requireUser(event: RequestEvent): User {
	if (!event.locals.user) {
		const next = encodeURIComponent(event.url.pathname + event.url.search);
		throw redirect(303, `/admin/login?next=${next}`);
	}
	return event.locals.user;
}

/** Same as requireUser but also enforces a role (or set of roles). */
export function requireRole(event: RequestEvent, roles: string | string[]): User {
	const user = requireUser(event);
	const allowed = Array.isArray(roles) ? roles : [roles];
	if (!allowed.includes(user.role)) {
		throw redirect(303, '/admin');
	}
	return user;
}
