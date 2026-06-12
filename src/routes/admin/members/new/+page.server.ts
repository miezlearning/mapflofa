import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { profileRepo } from '$lib/server/repositories/profile';
import { createMemberSchema } from '$lib/server/api/schemas/profile';
import { saveUpload } from '$lib/server/storage';
import { audit } from '$lib/server/audit/log';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		requireUser(event);
		const form = await event.request.formData();

		// Photo can come from an uploaded file or a pasted URL.
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
			description: form.get('description'),
			photo,
			tupoksi: form.get('tupoksi'),
			period: form.get('period'),
			division: form.get('division'),
			isActive: form.get('isActive') === 'on' || form.get('isActive') === 'true',
			sortOrder: Number(form.get('sortOrder') ?? '0') || 0
		};

		const parsed = createMemberSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, {
				values: rawValues(form, photo),
				message: 'Periksa kembali isian formulir.',
				fieldErrors: parsed.error.flatten().fieldErrors
			});
		}

		try {
			const created = await profileRepo.createMember(parsed.data);
			await audit(event, {
				action: 'resource.create',
				resource: 'members',
				resourceId: created.id,
				details: { name: created.name, position: created.position }
			});
			throw redirect(303, '/admin/members');
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && 'location' in err) throw err;
			console.error('[admin/members/new]', err);
			return fail(500, { values: rawValues(form, photo), message: 'Gagal menyimpan ke database.' });
		}
	}
};

function rawValues(form: FormData, photo: string | null = null) {
	return {
		name: form.get('name'),
		position: form.get('position'),
		description: form.get('description'),
		photo: photo ?? form.get('photo'),
		tupoksi: form.get('tupoksi'),
		period: form.get('period'),
		division: form.get('division'),
		isActive: form.get('isActive') === 'on' || form.get('isActive') === 'true',
		sortOrder: form.get('sortOrder')
	};
}
