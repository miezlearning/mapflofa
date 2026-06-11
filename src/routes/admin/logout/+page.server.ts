import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { clearSessionCookie, destroySession } from '$lib/server/auth/session';
import { audit } from '$lib/server/audit/log';

// Direct GET to /admin/logout shouldn't show anything — redirect.
export const load: PageServerLoad = async () => {
	throw redirect(303, '/admin/login');
};

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.sessionId) await destroySession(event.locals.sessionId);
		clearSessionCookie(event.cookies);
		if (event.locals.user) {
			await audit(event, {
				action: 'logout',
				resource: 'auth',
				actor: {
					id: event.locals.user.id,
					email: event.locals.user.email,
					role: event.locals.user.role
				}
			});
		}
		throw redirect(303, '/admin/login');
	}
};
