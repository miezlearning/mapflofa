import { and, desc, eq, like, or, sql } from 'drizzle-orm';
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
				? or(like(news.title, `%${opts.q}%`), like(news.excerpt, `%${opts.q}%`))
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
			db.select({ count: sql<number>`count(*)` }).from(news).where(where)
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
		const [result] = await db.insert(news).values(input);
		return db
			.select()
			.from(news)
			.where(eq(news.id, result.insertId))
			.limit(1)
			.then((rows) => rows[0]);
	},

	async update(id: number, input: UpdateNewsInput) {
		await db
			.update(news)
			.set({ ...input, updatedAt: new Date() })
			.where(eq(news.id, id));
		return db
			.select()
			.from(news)
			.where(eq(news.id, id))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	async remove(id: number) {
		await db
			.delete(news)
			.where(eq(news.id, id));
		return { id };
	}
};
