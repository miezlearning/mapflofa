/**
 * /api/docs — machine-readable list of every endpoint exposed under /api/*.
 * Generated from the registry so it can never go out of sync with /docs.
 */
import type { RequestHandler } from './$types';
import { ok } from '$lib/server/api/response';
import { rateLimit } from '$lib/server/api/rate-limit';
import { apiRegistry } from '$lib/server/api/registry';

export const GET: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'docs:read', limit: 60, windowMs: 60_000 });
	if (limited) return limited;

	// Flat list view — easy for clients/scripts to consume.
	const endpoints = apiRegistry.resources.flatMap((r) =>
		r.endpoints.map((e) => ({
			resource: r.slug,
			id: e.id,
			method: e.method,
			path: e.path,
			summary: e.summary,
			auth: e.auth,
			rateLimit: e.rateLimit
		}))
	);

	return ok({
		version: 1,
		generatedAt: new Date().toISOString(),
		resources: apiRegistry.resources.map((r) => ({
			slug: r.slug,
			label: r.label,
			description: r.description,
			endpointCount: r.endpoints.length
		})),
		endpoints
	});
};
