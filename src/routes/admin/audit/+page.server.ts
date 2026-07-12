import type { PageServerLoad } from './$types';
import { and, desc, eq, sql } from 'drizzle-orm';
import { requireRole } from '$lib/server/auth/guard';
import { db } from '$lib/db';
import { auditLogs } from '$lib/db/schema';

const PAGE_SIZE = 50;

export const load: PageServerLoad = async (event) => {
	requireRole(event, 'admin');

	const params = event.url.searchParams;
	const page = Math.max(1, Number(params.get('page') ?? '1'));
	const offset = (page - 1) * PAGE_SIZE;

	const filters = {
		userEmail: params.get('user')?.trim() || null,
		resource: params.get('resource')?.trim() || null,
		action: params.get('action')?.trim() || null
	};

	const where = and(
		filters.userEmail ? eq(auditLogs.userEmail, filters.userEmail) : undefined,
		filters.resource ? eq(auditLogs.resource, filters.resource) : undefined,
		filters.action ? eq(auditLogs.action, filters.action) : undefined
	);

	const [rows, [{ count }]] = await Promise.all([
		db
			.select()
			.from(auditLogs)
			.where(where)
			.orderBy(desc(auditLogs.createdAt))
			.limit(PAGE_SIZE)
			.offset(offset),
		db.select({ count: sql<number>`cast(count(*) as signed)` }).from(auditLogs).where(where)
	]);

	// Distinct values for filter dropdowns. Cheap on small tables; cap at 100.
	const [resources, actions, users] = await Promise.all([
		db
			.selectDistinct({ value: auditLogs.resource })
			.from(auditLogs)
			.orderBy(auditLogs.resource)
			.limit(100),
		db
			.selectDistinct({ value: auditLogs.action })
			.from(auditLogs)
			.orderBy(auditLogs.action)
			.limit(100),
		db
			.selectDistinct({ value: auditLogs.userEmail })
			.from(auditLogs)
			.orderBy(auditLogs.userEmail)
			.limit(100)
	]);

	return {
		items: rows.map((r) => ({
			id: r.id,
			userEmail: r.userEmail,
			userRole: r.userRole,
			action: r.action,
			resource: r.resource,
			resourceId: r.resourceId,
			details: r.details as Record<string, unknown> | null,
			ip: r.ip,
			userAgent: r.userAgent,
			createdAt: r.createdAt.toISOString()
		})),
		pagination: {
			page,
			pageSize: PAGE_SIZE,
			total: count,
			pages: Math.max(1, Math.ceil(count / PAGE_SIZE))
		},
		filters: {
			user: filters.userEmail ?? '',
			resource: filters.resource ?? '',
			action: filters.action ?? ''
		},
		options: {
			resources: resources.map((r) => r.value),
			actions: actions.map((a) => a.value),
			users: users.map((u) => u.value)
		}
	};
};
