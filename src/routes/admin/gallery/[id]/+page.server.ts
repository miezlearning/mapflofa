import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { galleryRepo } from '$lib/server/repositories/gallery';
import {
	createPhotoSchema,
	updateAlbumSchema,
	updatePhotoSchema
} from '$lib/server/api/schemas/gallery';
import { saveUpload } from '$lib/server/storage';
import { audit } from '$lib/server/audit/log';

function parseId(value: string): number {
	const id = Number(value);
	if (!Number.isSafeInteger(id) || id <= 0) throw error(400, 'Invalid id');
	return id;
}

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const id = parseId(event.params.id);
	const album = await galleryRepo.findAlbumById(id);
	if (!album) throw error(404, 'Album tidak ditemukan');
	const photos = await galleryRepo.listPhotos(id);
	return {
		album,
		photos,
		justCreated: event.url.searchParams.get('created') === '1'
	};
};

export const actions: Actions = {
	// ---- Update album metadata (and optionally its cover) ----
	update: async (event) => {
		requireUser(event);
		const id = parseId(event.params.id);
		const form = await event.request.formData();

		let coverImage = (form.get('coverImage') as string | null)?.trim() || null;
		const coverFile = form.get('coverFile');
		if (coverFile instanceof File && coverFile.size > 0) {
			const result = await saveUpload(coverFile);
			if ('error' in result) return fail(400, { message: `Sampul: ${result.error}` });
			coverImage = result.url;
		}

		const raw = {
			title: String(form.get('title') ?? ''),
			description: form.get('description'),
			coverImage,
			eventDate: form.get('eventDate'),
			isPublished: form.get('isPublished') === 'on' || form.get('isPublished') === 'true',
			sortOrder: Number(form.get('sortOrder') ?? '0') || 0
		};

		const parsed = updateAlbumSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, {
				message: 'Periksa kembali isian album.',
				fieldErrors: parsed.error.flatten().fieldErrors
			});
		}

		await galleryRepo.updateAlbum(id, parsed.data);
		await audit(event, { action: 'resource.update', resource: 'gallery', resourceId: id });
		return { ok: true, message: 'Album diperbarui.' };
	},

	// ---- Add one or more photos (file upload and/or URL) ----
	addPhotos: async (event) => {
		requireUser(event);
		const id = parseId(event.params.id);
		const album = await galleryRepo.findAlbumById(id);
		if (!album) throw error(404, 'Album tidak ditemukan');

		try {
			const form = await event.request.formData();
			const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);
			const url = (form.get('photoUrl') as string | null)?.trim();
			const caption = (form.get('caption') as string | null)?.trim() || null;

			if (files.length === 0 && !url) {
				return fail(400, { message: 'Pilih minimal satu foto atau tempel URL gambar.' });
			}

			let order = await galleryRepo.nextPhotoSortOrder(id);
			let added = 0;
			const errors: string[] = [];

			for (const file of files) {
				const result = await saveUpload(file);
				if ('error' in result) {
					errors.push(`${file.name}: ${result.error}`);
					continue;
				}
				const parsed = createPhotoSchema.safeParse({
					albumId: id,
					image: result.url,
					caption,
					sortOrder: order
				});
				if (!parsed.success) {
					errors.push(`${file.name}: tidak valid.`);
					continue;
				}
				await galleryRepo.addPhoto(parsed.data);
				order += 1;
				added += 1;
			}

			if (url) {
				const parsed = createPhotoSchema.safeParse({ albumId: id, image: url, caption, sortOrder: order });
				if (parsed.success) {
					await galleryRepo.addPhoto(parsed.data);
					added += 1;
				} else {
					errors.push('URL gambar tidak valid.');
				}
			}

			// First photo becomes the cover if the album has none yet.
			if (added > 0 && !album.coverImage) {
				const photos = await galleryRepo.listPhotos(id);
				if (photos[0]) await galleryRepo.updateAlbum(id, { coverImage: photos[0].image });
			}

			await audit(event, {
				action: 'resource.update',
				resource: 'gallery',
				resourceId: id,
				details: { addedPhotos: added }
			});

			if (errors.length > 0) {
				return fail(added > 0 ? 207 : 400, {
					message: `${added} foto ditambahkan. Sebagian gagal: ${errors.join(' ')}`
				});
			}
			return { ok: true, message: `${added} foto ditambahkan.` };
		} catch (err) {
			console.error('[addPhotos error]', err);
			return fail(400, { message: `Gagal mengunggah foto: ${(err as Error).message}` });
		}
	},

	// ---- Update a photo caption ----
	updatePhoto: async (event) => {
		requireUser(event);
		parseId(event.params.id);
		const form = await event.request.formData();
		const photoId = Number(form.get('photoId'));
		if (!Number.isSafeInteger(photoId) || photoId <= 0) throw error(400, 'Invalid photo id');
		const parsed = updatePhotoSchema.safeParse({ caption: form.get('caption') });
		if (!parsed.success) return fail(400, { message: 'Caption tidak valid.' });
		await galleryRepo.updatePhoto(photoId, parsed.data);
		return { ok: true, message: 'Caption disimpan.' };
	},

	// ---- Delete a photo ----
	deletePhoto: async (event) => {
		requireUser(event);
		parseId(event.params.id);
		const form = await event.request.formData();
		const photoId = Number(form.get('photoId'));
		if (!Number.isSafeInteger(photoId) || photoId <= 0) throw error(400, 'Invalid photo id');
		await galleryRepo.removePhoto(photoId);
		return { ok: true, message: 'Foto dihapus.' };
	},

	// ---- Set a photo as the album cover ----
	setCover: async (event) => {
		requireUser(event);
		const id = parseId(event.params.id);
		const form = await event.request.formData();
		const photoId = Number(form.get('photoId'));
		const photo = await galleryRepo.findPhotoById(photoId);
		if (!photo || photo.albumId !== id) throw error(400, 'Foto tidak valid');
		await galleryRepo.updateAlbum(id, { coverImage: photo.image });
		return { ok: true, message: 'Sampul diperbarui.' };
	},

	// ---- Reorder a photo up/down ----
	movePhoto: async (event) => {
		requireUser(event);
		const id = parseId(event.params.id);
		const form = await event.request.formData();
		const photoId = Number(form.get('photoId'));
		const dir = form.get('dir') === 'up' ? -1 : 1;

		const photos = await galleryRepo.listPhotos(id);
		const index = photos.findIndex((p) => p.id === photoId);
		const target = index + dir;
		if (index === -1 || target < 0 || target >= photos.length) {
			return { ok: true };
		}

		// Swap positions, then write sequential sort orders so it sticks.
		const reordered = [...photos];
		[reordered[index], reordered[target]] = [reordered[target], reordered[index]];
		await Promise.all(
			reordered.map((p, i) =>
				p.sortOrder === i ? null : galleryRepo.updatePhoto(p.id, { sortOrder: i })
			)
		);
		return { ok: true };
	}
};
