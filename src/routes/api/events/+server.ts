/**
 * /api/events
 *   GET   — list (public, paginated, optional `q` filter)
 *   POST  — create (admin)
 */
import type { RequestHandler } from './$types';
import { eventsRepo } from '$lib/server/repositories/events';
import { requireAdmin } from '$lib/server/api/auth';
import { rateLimit } from '$lib/server/api/rate-limit';
import { readJson } from '$lib/server/api/parse';
import { ok, ApiError } from '$lib/server/api/response';
import { createEventSchema, listEventsQuerySchema } from '$lib/server/api/schemas/events';

export const GET: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'events:read', limit: 120, windowMs: 60_000 });
	if (limited) return limited;

	const params = Object.fromEntries(event.url.searchParams.entries());
	const parsed = listEventsQuerySchema.safeParse(params);
	if (!parsed.success) return ApiError.badRequest('Invalid query.', parsed.error.flatten());

	try {
		const { rows, total } = await eventsRepo.list(parsed.data);
		return ok({
			items: rows,
			pagination: { total, limit: parsed.data.limit, offset: parsed.data.offset }
		});
	} catch (err) {
		console.error('[GET /api/events]', err);
		return ApiError.internal();
	}
};

export const POST: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'events:write', limit: 20, windowMs: 60_000 });
	if (limited) return limited;

	const unauth = requireAdmin(event);
	if (unauth) return unauth;

	const body = await readJson(event, createEventSchema);
	if (body.response) return body.response;

	try {
		const row = await eventsRepo.create(body.data);
		return ok(row, { status: 201 });
	} catch (err) {
		console.error('[POST /api/events]', err);
		return ApiError.internal();
	}
};
