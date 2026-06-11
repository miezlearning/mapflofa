import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { news } from '$lib/db/schema';
import type {
	CreateNewsInput,
	ListNewsQuery,
	UpdateNewsInput
} from '$lib/server/api/schemas/news';

export const newsRepo = {
	async list(opts: ListNewsQuery) {
		const where = and(
			opts.category ? eq(news.category, opts.category) : undefined,
			opts.q
				? or(ilike(news.title, `%${opts.q}%`), ilike(news.excerpt, `%${opts.q}%`))
				: undefined
		);

		const [rows, [{ count }]] = await Promise.all([
			db
				.select()
				.from(news)
				.where(where)
				.orderBy(desc(news.createdAt))
				.limit(opts.limit)
				.offset(opts.offset),
			db.select({ count: sql<number>`count(*)::int` }).from(news).where(where)
		]);

		return { rows, total: count };
	},

	findById(id: number) {
		return db
			.select()
			.from(news)
			.where(eq(news.id, id))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	findBySlug(slug: string) {
		return db
			.select()
			.from(news)
			.where(eq(news.slug, slug))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	async create(input: CreateNewsInput) {
		const [row] = await db.insert(news).values(input).returning();
		return row;
	},

	async update(id: number, input: UpdateNewsInput) {
		const [row] = await db
			.update(news)
			.set({ ...input, updatedAt: new Date() })
			.where(eq(news.id, id))
			.returning();
		return row ?? null;
	},

	async remove(id: number) {
		const [row] = await db
			.delete(news)
			.where(eq(news.id, id))
			.returning({ id: news.id });
		return row ?? null;
	}
};
