/**
 * /api/news
 *   GET   — list (public, paginated, optional `category` and `q` filters)
 *   POST  — create (admin)
 */
import type { RequestHandler } from './$types';
import { newsRepo } from '$lib/server/repositories/news';
import { requireAdmin } from '$lib/server/api/auth';
import { rateLimit } from '$lib/server/api/rate-limit';
import { readJson } from '$lib/server/api/parse';
import { ok, ApiError } from '$lib/server/api/response';
import { createNewsSchema, listNewsQuerySchema } from '$lib/server/api/schemas/news';

export const GET: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'news:read', limit: 120, windowMs: 60_000 });
	if (limited) return limited;

	const params = Object.fromEntries(event.url.searchParams.entries());
	const parsed = listNewsQuerySchema.safeParse(params);
	if (!parsed.success) return ApiError.badRequest('Invalid query.', parsed.error.flatten());

	try {
		const { rows, total } = await newsRepo.list(parsed.data);
		return ok({
			items: rows,
			pagination: { total, limit: parsed.data.limit, offset: parsed.data.offset }
		});
	} catch (err) {
		console.error('[GET /api/news]', err);
		return ApiError.internal();
	}
};

export const POST: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'news:write', limit: 20, windowMs: 60_000 });
	if (limited) return limited;

	const unauth = requireAdmin(event);
	if (unauth) return unauth;

	const body = await readJson(event, createNewsSchema);
	if (body.response) return body.response;

	try {
		const row = await newsRepo.create(body.data);
		return ok(row, { status: 201 });
	} catch (err) {
		console.error('[POST /api/news]', err);
		return ApiError.internal();
	}
};
