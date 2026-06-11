import type { LayoutServerLoad } from './$types';

/**
 * Expose the current user to all admin pages.
 * Redirect logic for unauthenticated visitors is handled per-page so we can
 * still render /admin/login without a redirect loop.
 */
export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user
			? {
					id: locals.user.id,
					email: locals.user.email,
					name: locals.user.name,
					role: locals.user.role
				}
			: null
	};
};
