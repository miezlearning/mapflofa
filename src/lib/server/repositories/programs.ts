import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { programs } from '$lib/db/schema';
import type {
	CreateProgramInput,
	ListProgramsQuery,
	UpdateProgramInput
} from '$lib/server/api/schemas/programs';

/**
 * Repository: thin wrapper around Drizzle queries for the `programs` table.
 * Routes should depend on this rather than touching the ORM directly,
 * which keeps query concerns out of the HTTP layer.
 */
export const programsRepo = {
	async list(opts: ListProgramsQuery) {
		const where = and(
			opts.tag ? eq(programs.tag, opts.tag) : undefined,
			opts.q
				? or(ilike(programs.title, `%${opts.q}%`), ilike(programs.excerpt, `%${opts.q}%`))
				: undefined
		);

		const [rows, [{ count }]] = await Promise.all([
			db
				.select()
				.from(programs)
				.where(where)
				.orderBy(desc(programs.createdAt))
				.limit(opts.limit)
				.offset(opts.offset),
			db
				.select({ count: sql<number>`count(*)::int` })
				.from(programs)
				.where(where)
		]);

		return { rows, total: count };
	},

	findById(id: number) {
		return db
			.select()
			.from(programs)
			.where(eq(programs.id, id))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	async create(input: CreateProgramInput) {
		const [row] = await db
			.insert(programs)
			.values({
				title: input.title,
				tag: input.tag,
				excerpt: input.excerpt,
				image: input.image,
				post: input.post ?? null,
				audience: input.audience ?? null,
				schedule: input.schedule ?? null,
				location: input.location ?? null,
				mentor: input.mentor ?? null,
				capacity: input.capacity ?? null,
				contact: input.contact ?? null,
				registration: input.registration ?? null,
				highlights: input.highlights ?? null,
				outcomes: input.outcomes ?? null,
				activities: input.activities ?? null,
				requirements: input.requirements ?? null
			})
			.returning();
		return row;
	},

	async update(id: number, input: UpdateProgramInput) {
		const [row] = await db
			.update(programs)
			.set({
				...input,
				updatedAt: new Date()
			})
			.where(eq(programs.id, id))
			.returning();
		return row ?? null;
	},

	async remove(id: number) {
		const [row] = await db.delete(programs).where(eq(programs.id, id)).returning({ id: programs.id });
		return row ?? null;
	}
};
