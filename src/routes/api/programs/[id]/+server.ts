/**
 * /api/programs/[id]
 *   GET    — read one (public)
 *   PATCH  — partial update (admin)
 *   DELETE — remove (admin)
 */
import type { RequestHandler } from './$types';
import { programsRepo } from '$lib/server/repositories/programs';
import { requireAdmin } from '$lib/server/api/auth';
import { rateLimit } from '$lib/server/api/rate-limit';
import { parseId, readJson } from '$lib/server/api/parse';
import { ok, ApiError } from '$lib/server/api/response';
import { updateProgramSchema } from '$lib/server/api/schemas/programs';

export const GET: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'programs:read-one', limit: 240, windowMs: 60_000 });
	if (limited) return limited;

	const id = parseId(event.params.id);
	if (id === null) return ApiError.badRequest('Invalid id.');

	try {
		const row = await programsRepo.findById(id);
		if (!row) return ApiError.notFound('Program not found.');
		return ok(row);
	} catch (err) {
		console.error('[GET /api/programs/[id]]', err);
		return ApiError.internal();
	}
};

export const PATCH: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'programs:write', limit: 20, windowMs: 60_000 });
	if (limited) return limited;

	const unauth = requireAdmin(event);
	if (unauth) return unauth;

	const id = parseId(event.params.id);
	if (id === null) return ApiError.badRequest('Invalid id.');

	const body = await readJson(event, updateProgramSchema);
	if (body.response) return body.response;

	try {
		const row = await programsRepo.update(id, body.data);
		if (!row) return ApiError.notFound('Program not found.');
		return ok(row);
	} catch (err) {
		console.error('[PATCH /api/programs/[id]]', err);
		return ApiError.internal();
	}
};

export const DELETE: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'programs:write', limit: 20, windowMs: 60_000 });
	if (limited) return limited;

	const unauth = requireAdmin(event);
	if (unauth) return unauth;

	const id = parseId(event.params.id);
	if (id === null) return ApiError.badRequest('Invalid id.');

	try {
		const removed = await programsRepo.remove(id);
		if (!removed) return ApiError.notFound('Program not found.');
		return ok({ id: removed.id });
	} catch (err) {
		console.error('[DELETE /api/programs/[id]]', err);
		return ApiError.internal();
	}
};
