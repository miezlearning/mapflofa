/**
 * /api/events/[id]
 *   GET    — read one (public)
 *   PATCH  — partial update (admin)
 *   DELETE — remove (admin)
 */
import type { RequestHandler } from './$types';
import { eventsRepo } from '$lib/server/repositories/events';
import { requireAdmin } from '$lib/server/api/auth';
import { rateLimit } from '$lib/server/api/rate-limit';
import { parseId, readJson } from '$lib/server/api/parse';
import { ok, ApiError } from '$lib/server/api/response';
import { updateEventSchema } from '$lib/server/api/schemas/events';

export const GET: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'events:read-one', limit: 240, windowMs: 60_000 });
	if (limited) return limited;

	const id = parseId(event.params.id);
	if (id === null) return ApiError.badRequest('Invalid id.');

	try {
		const row = await eventsRepo.findById(id);
		if (!row) return ApiError.notFound('Event not found.');
		return ok(row);
	} catch (err) {
		console.error('[GET /api/events/[id]]', err);
		return ApiError.internal();
	}
};

export const PATCH: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'events:write', limit: 20, windowMs: 60_000 });
	if (limited) return limited;

	const unauth = requireAdmin(event);
	if (unauth) return unauth;

	const id = parseId(event.params.id);
	if (id === null) return ApiError.badRequest('Invalid id.');

	const body = await readJson(event, updateEventSchema);
	if (body.response) return body.response;

	try {
		const row = await eventsRepo.update(id, body.data);
		if (!row) return ApiError.notFound('Event not found.');
		return ok(row);
	} catch (err) {
		console.error('[PATCH /api/events/[id]]', err);
		return ApiError.internal();
	}
};

export const DELETE: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'events:write', limit: 20, windowMs: 60_000 });
	if (limited) return limited;

	const unauth = requireAdmin(event);
	if (unauth) return unauth;

	const id = parseId(event.params.id);
	if (id === null) return ApiError.badRequest('Invalid id.');

	try {
		const removed = await eventsRepo.remove(id);
		if (!removed) return ApiError.notFound('Event not found.');
		return ok({ id: removed.id });
	} catch (err) {
		console.error('[DELETE /api/events/[id]]', err);
		return ApiError.internal();
	}
};
