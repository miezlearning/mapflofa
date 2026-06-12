import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { profileRepo } from '$lib/server/repositories/profile';
import { audit } from '$lib/server/audit/log';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const items = await profileRepo.listMembers();
	return { items };
};

export const actions: Actions = {
	delete: async (event) => {
		requireUser(event);
		const form = await event.request.formData();
		const id = Number(form.get('id'));
		if (!Number.isSafeInteger(id) || id <= 0) throw error(400, 'Invalid id');
		await profileRepo.removeMember(id);
		await audit(event, { action: 'resource.delete', resource: 'members', resourceId: id });
		return { ok: true };
	}
};
