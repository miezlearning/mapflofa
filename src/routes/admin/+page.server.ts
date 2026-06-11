import { sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { db } from '$lib/db';
import { events, galleryAlbums, news, programs } from '$lib/db/schema';
import { dailyViews, topPaths, viewSummary } from '$lib/server/analytics/queries';
import { newsRepo } from '$lib/server/repositories/news';

export const load: PageServerLoad = async (event) => {
	requireUser(event);

	const [[p], [n], [e], [g], summary, daily30, top30, allNews] = await Promise.all([
		db.select({ count: sql<number>`count(*)::int` }).from(programs),
		db.select({ count: sql<number>`count(*)::int` }).from(news),
		db.select({ count: sql<number>`count(*)::int` }).from(events),
		db.select({ count: sql<number>`count(*)::int` }).from(galleryAlbums),
		viewSummary(),
		dailyViews(30),
		topPaths(30, 5),
		// We need news titles to label `/berita/<slug>` rows in top posts.
		newsRepo.list({ limit: 100, offset: 0 })
	]);

	const slugToTitle = new Map(allNews.rows.map((n) => [n.slug, n.title]));

	const topPosts = top30
		.filter((row) => row.path.startsWith('/berita/'))
		.slice(0, 5)
		.map((row) => {
			const slug = row.path.replace(/^\/berita\//, '');
			return { slug, title: slugToTitle.get(slug) ?? slug, ...row };
		});

	return {
		stats: {
			programs: p.count,
			news: n.count,
			events: e.count,
			gallery: g.count
		},
		analytics: {
			summary,
			daily30,
			topAll: top30,
			topPosts
		}
	};
};
