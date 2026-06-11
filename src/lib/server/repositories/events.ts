import { and, asc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { events } from '$lib/db/schema';
import type {
	CreateEventInput,
	ListEventsQuery,
	UpdateEventInput
} from '$lib/server/api/schemas/events';

export const eventsRepo = {
	async list(opts: ListEventsQuery) {
		// `events` doesn't have created_at, so we order by id ascending as a
		// stable insertion-order proxy. Switch to a real date column later if
		// you want chronological sort by event date.
		const where = opts.q
			? or(ilike(events.title, `%${opts.q}%`), ilike(events.excerpt, `%${opts.q}%`))
			: undefined;

		const [rows, [{ count }]] = await Promise.all([
			db
				.select()
				.from(events)
				.where(where)
				.orderBy(asc(events.id))
				.limit(opts.limit)
				.offset(opts.offset),
			db.select({ count: sql<number>`count(*)::int` }).from(events).where(where)
		]);

		return { rows, total: count };
	},

	findById(id: number) {
		return db
			.select()
			.from(events)
			.where(eq(events.id, id))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	async create(input: CreateEventInput) {
		const [row] = await db.insert(events).values(input).returning();
		return row;
	},

	async update(id: number, input: UpdateEventInput) {
		const [row] = await db
			.update(events)
			.set(input)
			.where(eq(events.id, id))
			.returning();
		return row ?? null;
	},

	async remove(id: number) {
		const [row] = await db
			.delete(events)
			.where(eq(events.id, id))
			.returning({ id: events.id });
		return row ?? null;
	}
};
