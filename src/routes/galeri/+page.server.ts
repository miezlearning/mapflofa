import type { PageServerLoad } from './$types';
import { galleryRepo } from '$lib/server/repositories/gallery';
import { recordPageView } from '$lib/server/analytics/track';

export const load: PageServerLoad = async (event) => {
	recordPageView(event, '/galeri').catch((err) => console.error('[analytics]', err));

	const { rows, total } = await galleryRepo.listAlbums({
		limit: 48,
		offset: 0,
		publishedOnly: true
	});

	return {
		albums: rows.map((a) => {
			// If coverImage exists and is not the firstPhoto, it will be prepended
			// in the detail page, so bump the displayed count by 1.
			const coverAddsOne = a.coverImage && a.firstPhoto && a.coverImage !== a.firstPhoto;
			return {
				title: a.title,
				slug: a.slug,
				description: a.description,
				cover: a.effectiveCover,
				eventDate: a.eventDate,
				photoCount: a.photoCount + (coverAddsOne ? 1 : 0)
			};
		}),
		total
	};
};
