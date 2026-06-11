/**
 * /api/news/[id]
 *   GET    — read one (public)
 *   PATCH  — partial update (admin)
 *   DELETE — remove (admin)
 */
import type { RequestHandler } from './$types';
import { newsRepo } from '$lib/server/repositories/news';
import { requireAdmin } from '$lib/server/api/auth';
import { rateLimit } from '$lib/server/api/rate-limit';
import { parseId, readJson } from '$lib/server/api/parse';
import { ok, ApiError } from '$lib/server/api/response';
import { updateNewsSchema } from '$lib/server/api/schemas/news';

export const GET: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'news:read-one', limit: 240, windowMs: 60_000 });
	if (limited) return limited;

	const id = parseId(event.params.id);
	if (id === null) return ApiError.badRequest('Invalid id.');

	try {
		const row = await newsRepo.findById(id);
		if (!row) return ApiError.notFound('News not found.');
		return ok(row);
	} catch (err) {
		console.error('[GET /api/news/[id]]', err);
		return ApiError.internal();
	}
};

export const PATCH: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'news:write', limit: 20, windowMs: 60_000 });
	if (limited) return limited;

	const unauth = requireAdmin(event);
	if (unauth) return unauth;

	const id = parseId(event.params.id);
	if (id === null) return ApiError.badRequest('Invalid id.');

	const body = await readJson(event, updateNewsSchema);
	if (body.response) return body.response;

	try {
		const row = await newsRepo.update(id, body.data);
		if (!row) return ApiError.notFound('News not found.');
		return ok(row);
	} catch (err) {
		console.error('[PATCH /api/news/[id]]', err);
		return ApiError.internal();
	}
};

export const DELETE: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'news:write', limit: 20, windowMs: 60_000 });
	if (limited) return limited;

	const unauth = requireAdmin(event);
	if (unauth) return unauth;

	const id = parseId(event.params.id);
	if (id === null) return ApiError.badRequest('Invalid id.');

	try {
		const removed = await newsRepo.remove(id);
		if (!removed) return ApiError.notFound('News not found.');
		return ok({ id: removed.id });
	} catch (err) {
		console.error('[DELETE /api/news/[id]]', err);
		return ApiError.internal();
	}
};
