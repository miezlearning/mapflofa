import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { users, type User } from '$lib/db/schema';
import { hashPassword, verifyPassword } from './password';

export const usersRepo = {
	findByEmail(email: string): Promise<User | null> {
		const normalized = email.trim().toLowerCase();
		return db
			.select()
			.from(users)
			.where(eq(users.email, normalized))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	findById(id: number): Promise<User | null> {
		return db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	async list(opts: { limit: number; offset: number; q?: string }) {
		const where = opts.q
			? sql`(${users.email} LIKE ${'%' + opts.q + '%'} OR ${users.name} LIKE ${'%' + opts.q + '%'})`
			: undefined;
		const [rows, [{ count }]] = await Promise.all([
			db
				.select()
				.from(users)
				.where(where)
				.orderBy(desc(users.createdAt))
				.limit(opts.limit)
				.offset(opts.offset),
			db.select({ count: sql<number>`count(*)` }).from(users).where(where)
		]);
		return { rows, total: count };
	},

	async create(input: { email: string; name: string; password: string; role?: string }) {
		const [result] = await db
			.insert(users)
			.values({
				email: input.email.trim().toLowerCase(),
				name: input.name.trim(),
				passwordHash: await hashPassword(input.password),
				role: input.role ?? 'admin'
			});
		return db
			.select()
			.from(users)
			.where(eq(users.id, result.insertId))
			.limit(1)
			.then((rows) => rows[0]);
	},

	async updateProfile(id: number, input: { name?: string; role?: string }) {
		const set: Record<string, unknown> = { updatedAt: new Date() };
		if (input.name !== undefined) set.name = input.name.trim();
		if (input.role !== undefined) set.role = input.role;
		await db.update(users).set(set).where(eq(users.id, id));
		return db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	async setActive(id: number, isActive: boolean) {
		await db
			.update(users)
			.set({ isActive, updatedAt: new Date() })
			.where(eq(users.id, id));
		return db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	async changePassword(id: number, newPassword: string) {
		await db
			.update(users)
			.set({
				passwordHash: await hashPassword(newPassword),
				updatedAt: new Date()
			})
			.where(eq(users.id, id));
	},

	/**
	 * Authenticate by email + password. Returns the user only on success.
	 * Inactive accounts are rejected even with the right password.
	 */
	async authenticate(email: string, password: string): Promise<User | null> {
		const user = await this.findByEmail(email);
		if (!user) {
			// Run a dummy hash to avoid leaking that the email doesn't exist via timing.
			await verifyPassword(password, 'scrypt$16384$8$1$00$00').catch(() => false);
			return null;
		}
		const ok = await verifyPassword(password, user.passwordHash);
		if (!ok) return null;
		if (!user.isActive) return null;
		return user;
	},

	async touchLogin(userId: number) {
		await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
	},

	/** True if there's exactly one active admin in the system. */
	async isLastActiveAdmin(userId: number): Promise<boolean> {
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(users)
			.where(and(eq(users.role, 'admin'), eq(users.isActive, true), ne(users.id, userId)));
		return count === 0;
	}
};
