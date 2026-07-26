import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { newsRepo } from '$lib/server/repositories/news';
import { createNewsSchema, slugify } from '$lib/server/api/schemas/news';
import { sanitizeForStorage } from '$lib/server/markdown';
import { audit } from '$lib/server/audit/log';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const todayStr = new Date().toLocaleDateString('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
	return {
		initial: {
			date: todayStr,
			category: 'Berita'
		}
	};
};

export const actions: Actions = {
	default: async (event) => {
		requireUser(event);
		const form = await event.request.formData();
		const rawContent = form.get('content');
		const content =
			typeof rawContent === 'string' && rawContent.trim().length > 0
				? sanitizeForStorage(rawContent)
				: null;

		const raw = {
			category: form.get('category'),
			date: form.get('date'),
			title: form.get('title'),
			slug: form.get('slug') || slugify(String(form.get('title') ?? '')),
			excerpt: form.get('excerpt'),
			image: form.get('image'),
			content
		};
		const parsed = createNewsSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, {
				values: raw,
				message: 'Periksa kembali isian formulir.',
				fieldErrors: parsed.error.flatten().fieldErrors
			});
		}

		// Slug must be unique
		const existing = await newsRepo.findBySlug(parsed.data.slug);
		if (existing) {
			return fail(409, {
				values: raw,
				message: `Slug "${parsed.data.slug}" sudah dipakai berita lain.`
			});
		}

		try {
			const created = await newsRepo.create(parsed.data);
			await audit(event, {
				action: 'resource.create',
				resource: 'news',
				resourceId: created.id,
				details: { slug: created.slug }
			});
			// Move the user to the edit URL so subsequent saves go to the same
			// resource (and the URL is bookmarkable). The editor handles the
			// transition gracefully — no full reload; it shows a "saved" banner.
			throw redirect(303, `/admin/news/${created.id}?created=1`);
		} catch (err) {
			// `redirect()` throws — re-throw to let SvelteKit handle it.
			if (err && typeof err === 'object' && 'status' in err && 'location' in err) throw err;
			console.error('[admin/news/new]', err);
			return fail(500, { values: raw, message: 'Gagal menyimpan ke database.' });
		}
	}
};
