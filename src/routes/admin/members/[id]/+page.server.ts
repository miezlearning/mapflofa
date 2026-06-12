import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { profileRepo } from '$lib/server/repositories/profile';
import { updateMemberSchema } from '$lib/server/api/schemas/profile';
import { saveUpload } from '$lib/server/storage';
import { audit } from '$lib/server/audit/log';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const id = Number(event.params.id);
	if (!Number.isSafeInteger(id) || id <= 0) throw error(400, 'Invalid id');
	const item = await profileRepo.findMemberById(id);
	if (!item) throw error(404, 'Pengurus tidak ditemukan');
	return { item };
};

export const actions: Actions = {
	default: async (event) => {
		requireUser(event);
		const id = Number(event.params.id);
		if (!Number.isSafeInteger(id) || id <= 0) throw error(400, 'Invalid id');

		const form = await event.request.formData();

		let photo = (form.get('photo') as string | null)?.trim() || null;
		const photoFile = form.get('photoFile');
		if (photoFile instanceof File && photoFile.size > 0) {
			const result = await saveUpload(photoFile);
			if ('error' in result) {
				return fail(400, { values: rawValues(form), message: `Foto: ${result.error}` });
			}
			photo = result.url;
		}

		const raw = {
			name: String(form.get('name') ?? ''),
			position: String(form.get('position') ?? ''),
			nim: form.get('nim'),
			group: String(form.get('group') ?? 'pengurus'),
			description: form.get('description'),
			photo,
			tupoksi: form.get('tupoksi'),
			period: form.get('period'),
			division: form.get('division'),
			isFeatured: form.get('isFeatured') === 'on' || form.get('isFeatured') === 'true',
			isActive: form.get('isActive') === 'on' || form.get('isActive') === 'true',
			sortOrder: Number(form.get('sortOrder') ?? '0') || 0
		};

		const parsed = updateMemberSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, {
				values: rawValues(form, photo),
				message: 'Periksa kembali isian formulir.',
				fieldErrors: parsed.error.flatten().fieldErrors
			});
		}

		try {
			await profileRepo.updateMember(id, parsed.data);
			await audit(event, {
				action: 'resource.update',
				resource: 'members',
				resourceId: id,
				details: { name: parsed.data.name }
			});
			return { ok: true, message: 'Perubahan disimpan.' };
		} catch (err) {
			console.error('[admin/members/[id]]', err);
			return fail(500, { values: rawValues(form, photo), message: 'Gagal menyimpan ke database.' });
		}
	}
};

function rawValues(form: FormData, photo: string | null = null) {
	return {
		name: form.get('name'),
		position: form.get('position'),
		nim: form.get('nim'),
		group: form.get('group') ?? 'pengurus',
		description: form.get('description'),
		photo: photo ?? form.get('photo'),
		tupoksi: form.get('tupoksi'),
		period: form.get('period'),
		division: form.get('division'),
		isFeatured: form.get('isFeatured') === 'on' || form.get('isFeatured') === 'true',
		isActive: form.get('isActive') === 'on' || form.get('isActive') === 'true',
		sortOrder: form.get('sortOrder')
	};
}
