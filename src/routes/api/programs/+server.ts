/**
 * /api/programs
 *   GET   — list (public, paginated, optional `tag` and `q` filters)
 *   POST  — create (admin)
 */
import type { RequestHandler } from './$types';
import { programsRepo } from '$lib/server/repositories/programs';
import { requireAdmin } from '$lib/server/api/auth';
import { rateLimit } from '$lib/server/api/rate-limit';
import { readJson } from '$lib/server/api/parse';
import { ok, ApiError } from '$lib/server/api/response';
import {
	createProgramSchema,
	listProgramsQuerySchema
} from '$lib/server/api/schemas/programs';

export const GET: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'programs:read', limit: 120, windowMs: 60_000 });
	if (limited) return limited;

	const params = Object.fromEntries(event.url.searchParams.entries());
	const parsed = listProgramsQuerySchema.safeParse(params);
	if (!parsed.success) {
		return ApiError.badRequest('Invalid query.', parsed.error.flatten());
	}

	try {
		const { rows, total } = await programsRepo.list(parsed.data);
		return ok({
			items: rows,
			pagination: {
				total,
				limit: parsed.data.limit,
				offset: parsed.data.offset
			}
		});
	} catch (err) {
		console.error('[GET /api/programs]', err);
		return ApiError.internal();
	}
};

export const POST: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'programs:write', limit: 20, windowMs: 60_000 });
	if (limited) return limited;

	const unauth = requireAdmin(event);
	if (unauth) return unauth;

	const body = await readJson(event, createProgramSchema);
	if (body.response) return body.response;

	try {
		const row = await programsRepo.create(body.data);
		return ok(row, { status: 201 });
	} catch (err) {
		console.error('[POST /api/programs]', err);
		return ApiError.internal();
	}
};
