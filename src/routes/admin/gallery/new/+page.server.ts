import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { galleryRepo } from '$lib/server/repositories/gallery';
import { createAlbumSchema, slugify } from '$lib/server/api/schemas/gallery';
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

		// Cover can come from an uploaded file or a pasted URL.
		let coverImage = (form.get('coverImage') as string | null)?.trim() || null;
		const coverFile = form.get('coverFile');
		if (coverFile instanceof File && coverFile.size > 0) {
			const result = await saveUpload(coverFile);
			if ('error' in result) {
				return fail(400, {
					values: rawValues(form),
					fieldErrors: undefined,
					message: `Sampul: ${result.error}`
				});
			}
			coverImage = result.url;
		}

		const title = String(form.get('title') ?? '');
		const raw = {
			title,
			slug: String(form.get('slug') || '').trim() || slugify(title),
			description: form.get('description'),
			coverImage,
			eventDate: form.get('eventDate'),
			isPublished: form.get('isPublished') === 'on' || form.get('isPublished') === 'true',
			sortOrder: Number(form.get('sortOrder') ?? '0') || 0
		};

		const parsed = createAlbumSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, {
				values: rawValues(form, coverImage),
				message: 'Periksa kembali isian formulir.',
				fieldErrors: parsed.error.flatten().fieldErrors
			});
		}

		const existing = await galleryRepo.findAlbumBySlug(parsed.data.slug);
		if (existing) {
			return fail(409, {
				values: rawValues(form, coverImage),
				fieldErrors: undefined,
				message: `Slug "${parsed.data.slug}" sudah dipakai album lain.`
			});
		}

		try {
			const created = await galleryRepo.createAlbum(parsed.data);
			await audit(event, {
				action: 'resource.create',
				resource: 'gallery',
				resourceId: created.id,
				details: { slug: created.slug }
			});
			throw redirect(303, `/admin/gallery/${created.id}?created=1`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && 'location' in err) throw err;
			console.error('[admin/gallery/new]', err);
			return fail(500, {
				values: rawValues(form, coverImage),
				fieldErrors: undefined,
				message: 'Gagal menyimpan ke database.'
			});
		}
	}
};

function rawValues(form: FormData, coverImage: string | null = null) {
	return {
		title: form.get('title'),
		slug: form.get('slug'),
		description: form.get('description'),
		coverImage: coverImage ?? form.get('coverImage'),
		eventDate: form.get('eventDate'),
		isPublished: form.get('isPublished') === 'on' || form.get('isPublished') === 'true'
	};
}
