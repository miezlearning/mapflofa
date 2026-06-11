import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { galleryRepo } from '$lib/server/repositories/gallery';
import { audit } from '$lib/server/audit/log';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const limit = Math.min(100, Math.max(1, Number(event.url.searchParams.get('limit') ?? '50')));
	const offset = Math.max(0, Number(event.url.searchParams.get('offset') ?? '0'));
	const { rows, total } = await galleryRepo.listAlbums({ limit, offset });
	return {
		items: rows,
		pagination: { total, limit, offset }
	};
};

export const actions: Actions = {
	delete: async (event) => {
		requireUser(event);
		const form = await event.request.formData();
		const id = Number(form.get('id'));
		if (!Number.isSafeInteger(id) || id <= 0) throw error(400, 'Invalid id');
		await galleryRepo.removeAlbum(id);
		await audit(event, { action: 'resource.delete', resource: 'gallery', resourceId: id });
		return { ok: true };
	}
};
