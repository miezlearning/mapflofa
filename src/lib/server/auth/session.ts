/**
 * Session management.
 *
 * - Random 256-bit token, base64url encoded → goes in HttpOnly cookie.
 * - DB stores only sha256(token), so leaked DB ≠ active sessions.
 * - 30-day rolling expiry.
 */
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, ne } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';
import { db } from '$lib/db';
import { sessions, users, type User } from '$lib/db/schema';

export const SESSION_COOKIE = 'sid';
const SESSION_DAYS = 30;

function newToken(): string {
	return randomBytes(32).toString('base64url');
}

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

function expiresAt(): Date {
	return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function createSession(
	userId: number,
	meta: { ip?: string; userAgent?: string } = {}
): Promise<string> {
	const token = newToken();
	const id = hashToken(token);
	await db.insert(sessions).values({
		id,
		userId,
		expiresAt: expiresAt(),
		ip: meta.ip ?? null,
		userAgent: meta.userAgent ?? null
	});
	return token; // raw token goes to the cookie; only its hash is in the DB
}

export type ResolvedSession = { user: User; sessionId: string; refreshed: boolean };

export async function resolveSession(token: string | null | undefined): Promise<ResolvedSession | null> {
	if (!token) return null;
	const id = hashToken(token);
	const rows = await db
		.select({
			session: sessions,
			user: users
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, id))
		.limit(1);
	if (rows.length === 0) return null;
	const { session, user } = rows[0];
	if (session.expiresAt.getTime() <= Date.now()) {
		await db.delete(sessions).where(eq(sessions.id, id));
		return null;
	}
	if (!user.isActive) {
		// Account was deactivated — kill the session.
		await db.delete(sessions).where(eq(sessions.id, id));
		return null;
	}
	// Rolling expiry: if more than 1 day has passed since creation, refresh.
	let refreshed = false;
	if (session.expiresAt.getTime() - Date.now() < (SESSION_DAYS - 1) * 24 * 60 * 60 * 1000) {
		await db.update(sessions).set({ expiresAt: expiresAt() }).where(eq(sessions.id, id));
		refreshed = true;
	}
	return { user, sessionId: id, refreshed };
}

export async function destroySession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

/**
 * Revoke every session for a user *except* optionally the current one.
 * Used after password change so other browsers/devices are signed out.
 */
export async function revokeAllSessions(userId: number, exceptSessionId?: string): Promise<number> {
	const conditions = exceptSessionId
		? and(eq(sessions.userId, userId), ne(sessions.id, exceptSessionId))
		: eq(sessions.userId, userId);
	const [result] = await db.delete(sessions).where(conditions);
	return result.affectedRows ?? 0;
}

export function setSessionCookie(cookies: Cookies, token: string) {
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: SESSION_DAYS * 24 * 60 * 60
	});
}

export function clearSessionCookie(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}
