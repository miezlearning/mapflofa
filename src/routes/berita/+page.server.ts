import type { PageServerLoad } from './$types';
import { newsRepo } from '$lib/server/repositories/news';
import { recordPageView } from '$lib/server/analytics/track';
import { db } from '$lib/db';
import { news } from '$lib/db/schema';
import { sql } from 'drizzle-orm';

const PAGE_SIZE = 9;

export const load: PageServerLoad = async (event) => {
	recordPageView(event, '/berita').catch((err) => console.error('[analytics]', err));

	const params = event.url.searchParams;
	const page = Math.max(1, Number(params.get('page') ?? '1'));
	const category = params.get('kategori')?.trim() || undefined;
	const q = params.get('q')?.trim() || undefined;

	const offset = (page - 1) * PAGE_SIZE;
	const { rows, total } = await newsRepo.list({
		limit: PAGE_SIZE,
		offset,
		category,
		q
	});

	// Distinct categories for filter chips. Cap at 30; tiny query for tiny tables.
	const cats = await db
		.selectDistinct({ value: news.category })
		.from(news)
		.orderBy(news.category)
		.limit(30);

	const totalCount = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(news)
		.then((r) => r[0]?.count ?? 0);

	return {
		items: rows.map((n) => ({
			id: n.id,
			title: n.title,
			slug: n.slug,
			category: n.category,
			date: n.date,
			excerpt: n.excerpt,
			image: n.image
		})),
		pagination: {
			page,
			pageSize: PAGE_SIZE,
			total,
			pages: Math.max(1, Math.ceil(total / PAGE_SIZE))
		},
		categories: cats.map((c) => c.value),
		totalCount,
		filters: { category: category ?? '', q: q ?? '' }
	};
};
