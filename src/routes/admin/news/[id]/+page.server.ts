import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { newsRepo } from '$lib/server/repositories/news';
import { updateNewsSchema } from '$lib/server/api/schemas/news';
import { sanitizeForStorage } from '$lib/server/markdown';
import { audit } from '$lib/server/audit/log';

function parseId(s: string | undefined): number {
	if (!s || !/^\d+$/.test(s)) throw error(400, 'Invalid id');
	const n = Number(s);
	if (!Number.isSafeInteger(n) || n <= 0) throw error(400, 'Invalid id');
	return n;
}

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const id = parseId(event.params.id);
	const item = await newsRepo.findById(id);
	if (!item) throw error(404, 'News not found');
	return { item };
};

export const actions: Actions = {
	default: async (event) => {
		requireUser(event);
		const id = parseId(event.params.id);
		const form = await event.request.formData();
		const rawContent = form.get('content');
		const content =
			typeof rawContent === 'string' && rawContent.trim().length > 0
				? sanitizeForStorage(rawContent)
				: null;

		const raw: Record<string, unknown> = {
			category: form.get('category'),
			date: form.get('date'),
			title: form.get('title'),
			slug: form.get('slug'),
			excerpt: form.get('excerpt'),
			image: form.get('image'),
			content
		};
		const parsed = updateNewsSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, {
				values: raw,
				message: 'Periksa kembali isian formulir.',
				fieldErrors: parsed.error.flatten().fieldErrors
			});
		}

		// If the slug changed, ensure the new one is free.
		if (parsed.data.slug) {
			const existing = await newsRepo.findBySlug(parsed.data.slug);
			if (existing && existing.id !== id) {
				return fail(409, {
					values: raw,
					message: `Slug "${parsed.data.slug}" sudah dipakai berita lain.`
				});
			}
		}

		try {
			const updated = await newsRepo.update(id, parsed.data);
			if (!updated) throw error(404, 'News not found');
			await audit(event, {
				action: 'resource.update',
				resource: 'news',
				resourceId: id,
				details: { fields: Object.keys(parsed.data as object) }
			});
			// Stay on the edit page; surface the freshly-saved record so the
			// editor can refresh its values, dismiss the autosave-restore banner,
			// and show a "saved" toast.
			return { ok: true, savedAt: new Date().toISOString(), item: updated };
		} catch (err) {
			console.error(`[admin/news/${id}]`, err);
			return fail(500, { values: raw, message: 'Gagal menyimpan perubahan.' });
		}
	}
};
