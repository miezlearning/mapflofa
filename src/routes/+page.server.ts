import type { PageServerLoad } from './$types';
import { programsRepo } from '$lib/server/repositories/programs';
import { newsRepo } from '$lib/server/repositories/news';
import { eventsRepo } from '$lib/server/repositories/events';
import { recordPageView } from '$lib/server/analytics/track';

/**
 * Loads homepage data directly from the repositories.
 *
 * We call the repos rather than fetching our own /api/* endpoints because
 * SvelteKit runs both on the same process during SSR, so an internal HTTP
 * round-trip would just add latency and bypass the rate limiter for ourselves.
 * Public consumers (browser fetch, mobile app, etc.) still go through /api/*.
 */
export const load: PageServerLoad = async (event) => {
	// Fire-and-forget — never block render on analytics.
	recordPageView(event, '/').catch((err) => console.error('[analytics]', err));

	const [programsResult, newsResult, eventsResult] = await Promise.all([
		programsRepo.list({ limit: 12, offset: 0 }),
		newsRepo.list({ limit: 8, offset: 0 }),
		eventsRepo.list({ limit: 12, offset: 0 })
	]);

	// Shape the rows to match what the existing components expect.
	// (DB columns use snake_case + dateDay/dateMonth/location;
	// some components want shorter names like dateD/dateM/loc.)
	return {
		programs: programsResult.rows.map((p) => ({
			id: p.id,
			tag: p.tag,
			title: p.title,
			excerpt: p.excerpt,
			image: p.image,
			audience: p.audience,
			schedule: p.schedule,
			location: p.location
		})),
		news: newsResult.rows.map((n) => ({
			category: n.category,
			date: n.date,
			title: n.title,
			slug: n.slug,
			excerpt: n.excerpt,
			image: n.image
		})),
		events: eventsResult.rows.map((e) => ({
			// The component still wants a "category" — events table doesn't have
			// one yet, so derive a sensible label from the title's first word
			// or leave it as a generic tag. We expose `dateMonth` here as the
			// category fallback (e.g. "Jun") so the UI doesn't break.
			category: 'Acara',
			date: e.date,
			dateD: e.dateDay,
			dateM: e.dateMonth,
			title: e.title,
			excerpt: e.excerpt,
			image: e.image,
			time: e.time,
			loc: e.location
		}))
	};
};
