import type { PageServerLoad } from './$types';
import { newsRepo } from '$lib/server/repositories/news';
import { galleryRepo } from '$lib/server/repositories/gallery';
import { recordPageView } from '$lib/server/analytics/track';

/**
 * Loads homepage data directly from the repositories.
 *
 * The homepage needs the latest news for the Berita carousel and a few
 * published gallery albums for the Galeri preview. The "Tentang" and
 * "Dampak" sections are static.
 */
export const load: PageServerLoad = async (event) => {
	// Fire-and-forget — never block render on analytics.
	recordPageView(event, '/').catch((err) => console.error('[analytics]', err));

	const [newsResult, galleryResult] = await Promise.all([
		newsRepo.list({ limit: 8, offset: 0 }),
		galleryRepo.listAlbums({ limit: 4, offset: 0, publishedOnly: true })
	]);

	return {
		news: newsResult.rows.map((n) => ({
			category: n.category,
			date: n.date,
			title: n.title,
			slug: n.slug,
			excerpt: n.excerpt,
			image: n.image
		})),
		albums: galleryResult.rows.map((a) => ({
			title: a.title,
			slug: a.slug,
			cover: a.effectiveCover,
			photoCount: a.photoCount,
			eventDate: a.eventDate
		}))
	};
};
