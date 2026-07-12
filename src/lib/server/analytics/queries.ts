/**
 * Analytics aggregation queries used by the admin dashboard.
 */
import { and, gte, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { pageViews } from '$lib/db/schema';

function daysAgo(days: number): Date {
	return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function countViewsAndUniques(since: Date) {
	const [r] = await db
		.select({
			views: sql<number>`cast(count(*) as signed)`,
			uniques: sql<number>`cast(count(DISTINCT ${pageViews.visitorHash}) as signed)`
		})
		.from(pageViews)
		.where(gte(pageViews.createdAt, since));
	return r ?? { views: 0, uniques: 0 };
}

export async function viewSummary(): Promise<{
	views7: number;
	views30: number;
	uniques7: number;
	uniques30: number;
	viewsToday: number;
}> {
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);

	const [w7, w30, todayStats] = await Promise.all([
		countViewsAndUniques(daysAgo(7)),
		countViewsAndUniques(daysAgo(30)),
		countViewsAndUniques(today)
	]);

	return {
		views7: w7.views,
		uniques7: w7.uniques,
		views30: w30.views,
		uniques30: w30.uniques,
		viewsToday: todayStats.views
	};
}

/**
 * Daily counts for the last N days, in chronological order.
 * Missing days are filled with zeros so the chart doesn't have gaps.
 */
export async function dailyViews(
	days = 30
): Promise<{ date: string; views: number; uniques: number }[]> {
	const since = daysAgo(days);
	const rows = await db
		.select({
			date: sql<string>`DATE_FORMAT(${pageViews.createdAt}, '%Y-%m-%d')`,
			views: sql<number>`cast(count(*) as signed)`,
			uniques: sql<number>`cast(count(DISTINCT ${pageViews.visitorHash}) as signed)`
		})
		.from(pageViews)
		.where(gte(pageViews.createdAt, since))
		.groupBy(sql`DATE(${pageViews.createdAt})`)
		.orderBy(sql`DATE(${pageViews.createdAt}) asc`);

	const byDate = new Map(rows.map((r) => [r.date, r]));
	const out: { date: string; views: number; uniques: number }[] = [];
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
		const key = d.toISOString().slice(0, 10);
		const hit = byDate.get(key);
		out.push({ date: key, views: hit?.views ?? 0, uniques: hit?.uniques ?? 0 });
	}
	return out;
}

/**
 * Top public paths by view count in the last N days.
 */
export async function topPaths(
	days = 30,
	limit = 10
): Promise<{ path: string; views: number; uniques: number }[]> {
	const since = daysAgo(days);
	return db
		.select({
			path: pageViews.path,
			views: sql<number>`cast(count(*) as signed)`,
			uniques: sql<number>`cast(count(DISTINCT ${pageViews.visitorHash}) as signed)`
		})
		.from(pageViews)
		.where(and(gte(pageViews.createdAt, since)))
		.groupBy(pageViews.path)
		.orderBy(sql`count(*) desc`)
		.limit(limit);
}
