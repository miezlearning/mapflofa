import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { galleryRepo } from '$lib/server/repositories/gallery';
import { recordPageView } from '$lib/server/analytics/track';

export const load: PageServerLoad = async (event) => {
	const result = await galleryRepo.findPublishedWithPhotos(event.params.slug);
	if (!result) throw error(404, 'Album tidak ditemukan');

	recordPageView(event, `/galeri/${result.album.slug}`).catch((err) =>
		console.error('[analytics]', err)
	);

	// A few other albums for "lihat juga".
	const { rows } = await galleryRepo.listAlbums({ limit: 7, offset: 0, publishedOnly: true });
	const related = rows
		.filter((a) => a.slug !== result.album.slug)
		.slice(0, 3)
		.map((a) => ({
			title: a.title,
			slug: a.slug,
			cover: a.effectiveCover,
			photoCount: a.photoCount
		}));

	// Build photo list — ensure cover image is always the first photo shown.
	const photoList = result.photos.map((p) => ({ id: p.id, image: p.image, caption: p.caption }));
	const cover = result.album.coverImage;

	if (cover) {
		const existingIdx = photoList.findIndex((p) => p.image === cover);
		if (existingIdx > 0) {
			// Cover matches a photo that's not first — move it to front.
			const [moved] = photoList.splice(existingIdx, 1);
			photoList.unshift(moved);
		} else if (existingIdx === -1) {
			// Cover is a standalone image not in the photos table — prepend it.
			photoList.unshift({ id: -1, image: cover, caption: null });
		}
		// existingIdx === 0 means cover is already the first photo, no action needed.
	}

	return {
		album: {
			title: result.album.title,
			slug: result.album.slug,
			description: result.album.description,
			eventDate: result.album.eventDate
		},
		photos: photoList,
		related
	};
};
