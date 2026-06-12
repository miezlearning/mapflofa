import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { profileRepo } from '$lib/server/repositories/profile';
import { updateContentSchema } from '$lib/server/api/schemas/profile';
import { audit } from '$lib/server/audit/log';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const content = await profileRepo.getContentMap();

	// Parse list-style blocks into structured arrays for the friendly UI.
	const misi = (content['profile.misi'] ?? '')
		.split('\n')
		.map((s) => s.trim())
		.filter(Boolean);

	const sejarah = (content['profile.sejarah'] ?? '')
		.split('\n')
		.map((s) => s.trim())
		.filter(Boolean);

	const nilai = (content['profile.nilai'] ?? '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [icon, title, desc] = line.split('|').map((s) => s.trim());
			return { icon: icon || 'sprout', title: title || '', desc: desc || '' };
		});

	return {
		header: {
			label: content['profile.header_label'] ?? '',
			title: content['profile.header_title'] ?? '',
			desc: content['profile.header_desc'] ?? ''
		},
		visi: content['profile.visi'] ?? '',
		misi,
		sejarah,
		nilai,
		contact: {
			address: content['contact.address'] ?? '',
			whatsapp: content['contact.whatsapp'] ?? '',
			instagram: content['contact.instagram'] ?? '',
			email: content['contact.email'] ?? '',
			extra: content['contact.extra'] ?? '',
			socials: content['contact.socials'] ?? ''
		}
	};
};

export const actions: Actions = {
	save: async (event) => {
		requireUser(event);
		const form = await event.request.formData();

		// Each block is submitted as content__<key> = value (serialized client-side).
		const updates: { key: string; value: string }[] = [];
		for (const [field, raw] of form.entries()) {
			if (!field.startsWith('content__')) continue;
			const key = field.slice('content__'.length);
			const parsed = updateContentSchema.safeParse({ key, value: String(raw) });
			if (!parsed.success) {
				return fail(400, { message: `Validasi gagal untuk "${key}".`, ok: false });
			}
			updates.push(parsed.data);
		}

		for (const u of updates) {
			await profileRepo.setContent(u.key, u.value);
		}

		await audit(event, {
			action: 'resource.update',
			resource: 'profile_content',
			details: { keys: updates.map((u) => u.key) }
		});

		return { ok: true, message: 'Konten profil berhasil disimpan.' };
	}
};
