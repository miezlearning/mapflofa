import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { findAdminResource } from '$lib/server/admin/resources';
import { audit } from '$lib/server/audit/log';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const resource = findAdminResource(event.params.resource);
	if (!resource) throw error(404, 'Unknown resource');

	const limit = Math.min(100, Math.max(1, Number(event.url.searchParams.get('limit') ?? '50')));
	const offset = Math.max(0, Number(event.url.searchParams.get('offset') ?? '0'));

	const { rows, total } = await resource.repo.list({ limit, offset });

	return {
		resource: {
			slug: resource.slug,
			label: resource.label,
			plural: resource.plural,
			fields: resource.fields
		},
		items: rows as Record<string, unknown>[],
		pagination: { total, limit, offset }
	};
};

export const actions: Actions = {
	delete: async (event) => {
		requireUser(event);
		const resource = findAdminResource(event.params.resource);
		if (!resource) throw error(404, 'Unknown resource');

		const form = await event.request.formData();
		const idRaw = form.get('id');
		const id = Number(idRaw);
		if (!Number.isSafeInteger(id) || id <= 0) {
			throw error(400, 'Invalid id');
		}

		await resource.repo.remove(id);
		await audit(event, {
			action: 'resource.delete',
			resource: resource.slug,
			resourceId: id
		});
		return { ok: true };
	}
};
