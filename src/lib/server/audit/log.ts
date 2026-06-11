/**
 * Audit logging.
 *
 * Records who did what, when, and against which resource. Stored in the
 * `audit_logs` table; user identity is snapshot (not FK only) so logs survive
 * later user deletion.
 *
 * Always call with a try/catch in callers — a logging failure must NOT
 * roll back the underlying business action.
 */
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/db';
import { auditLogs } from '$lib/db/schema';

/** Standard action verbs. Add more as needed. */
export type AuditAction =
	| 'login.success'
	| 'login.failure'
	| 'logout'
	| 'password.change'
	| 'session.revoke'
	| 'user.create'
	| 'user.update'
	| 'user.deactivate'
	| 'user.activate'
	| 'user.delete'
	| 'resource.create'
	| 'resource.update'
	| 'resource.delete';

export type AuditEntry = {
	action: AuditAction;
	resource: string;
	resourceId?: number | null;
	details?: Record<string, unknown> | null;
	/** Override actor (e.g. for failed logins where there's no logged-in user). */
	actor?: { id?: number | null; email: string; role: string };
};

function clientIp(event: RequestEvent | null | undefined): string | null {
	if (!event) return null;
	try {
		return event.getClientAddress() || null;
	} catch {
		return null;
	}
}

export async function audit(
	event: RequestEvent | null | undefined,
	entry: AuditEntry
): Promise<void> {
	const actor =
		entry.actor ??
		(event?.locals.user
			? { id: event.locals.user.id, email: event.locals.user.email, role: event.locals.user.role }
			: { id: null, email: 'anonymous', role: 'anonymous' });

	try {
		await db.insert(auditLogs).values({
			userId: actor.id ?? null,
			userEmail: actor.email,
			userRole: actor.role,
			action: entry.action,
			resource: entry.resource,
			resourceId: entry.resourceId ?? null,
			details: entry.details ?? null,
			ip: clientIp(event),
			userAgent: event?.request.headers.get('user-agent') ?? null
		});
	} catch (err) {
		// Logging must never break the underlying action.
		console.error('[audit]', entry.action, err);
	}
}
