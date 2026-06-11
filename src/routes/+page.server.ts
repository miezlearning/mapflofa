import type { PageServerLoad } from './$types';
import { newsRepo } from '$lib/server/repositories/news';
import { recordPageView } from '$lib/server/analytics/track';

/**
 * Loads homepage data directly from the repositories.
 *
 * The homepage now only needs the latest news for the Berita carousel —
 * the "Tentang", "Galeri preview", and "Dampak" sections are static, and
 * the Profil/Galeri detail pages have their own data sources.
 */
export const load: PageServerLoad = async (event) => {
	// Fire-and-forget — never block render on analytics.
	recordPageView(event, '/').catch((err) => console.error('[analytics]', err));

	const newsResult = await newsRepo.list({ limit: 8, offset: 0 });

	return {
		news: newsResult.rows.map((n) => ({
			category: n.category,
			date: n.date,
			title: n.title,
			slug: n.slug,
			excerpt: n.excerpt,
			image: n.image
		}))
	};
};
