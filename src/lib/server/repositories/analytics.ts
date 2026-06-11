import { desc, eq, gte, sql } from "drizzle-orm";
import { db } from "$lib/db";
import { pageViews, programs } from "$lib/db/schema";

export type OverviewAnalytics = {
  visitors: {
    week: number;
    month: number;
  };
  views: {
    week: number;
    month: number;
  };
  topPosts: {
    id: number;
    title: string;
    tag: string;
    image: string;
    views: number;
    visitors: number;
    lastViewedAt: string | null;
  }[];
};

function startOfDaysAgo(daysAgo: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

const programIdFromPath = sql<number>`nullif(regexp_replace(${pageViews.path}, '^/programs/(\\d+).*$', '\\1'), '')::int`;

export const analyticsRepo = {
  async getOverview(): Promise<OverviewAnalytics> {
    const weekStart = startOfDaysAgo(7);
    const monthStart = startOfDaysAgo(30);

    const [
      [weekVisitors],
      [monthVisitors],
      [weekViews],
      [monthViews],
      topPosts,
    ] = await Promise.all([
      db
        .select({
          count: sql<number>`count(distinct ${pageViews.visitorHash})::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, weekStart)),
      db
        .select({
          count: sql<number>`count(distinct ${pageViews.visitorHash})::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, monthStart)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(pageViews)
        .where(gte(pageViews.createdAt, weekStart)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(pageViews)
        .where(gte(pageViews.createdAt, monthStart)),
      db
        .select({
          id: programs.id,
          title: programs.title,
          tag: programs.tag,
          image: programs.image,
          views: sql<number>`count(${pageViews.id})::int`,
          visitors: sql<number>`count(distinct ${pageViews.visitorHash})::int`,
          lastViewedAt: sql<string | null>`max(${pageViews.createdAt})`,
        })
        .from(pageViews)
        .innerJoin(programs, eq(programs.id, programIdFromPath))
        .where(sql`${pageViews.path} like '/programs/%'`)
        .groupBy(programs.id)
        .orderBy(desc(sql`count(${pageViews.id})`))
        .limit(5),
    ]);

    return {
      visitors: { week: weekVisitors.count, month: monthVisitors.count },
      views: { week: weekViews.count, month: monthViews.count },
      topPosts: topPosts.map((row) => ({
        ...row,
        lastViewedAt: row.lastViewedAt
          ? new Date(row.lastViewedAt).toISOString()
          : null,
      })),
    };
  },
};
