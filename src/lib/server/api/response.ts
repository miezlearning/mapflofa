import { json } from '@sveltejs/kit';

/**
 * Consistent JSON envelope for the whole API.
 * Success: { ok: true, data: T }
 * Failure: { ok: false, error: { code, message, details? } }
 */

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = {
	ok: false;
	error: { code: string; message: string; details?: unknown };
};

const securityHeaders: Record<string, string> = {
	'Cache-Control': 'no-store',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'no-referrer'
};

export function ok<T>(data: T, init: ResponseInit = {}) {
	return json(
		{ ok: true, data } satisfies ApiSuccess<T>,
		{
			...init,
			headers: { ...securityHeaders, ...(init.headers ?? {}) }
		}
	);
}

export function fail(
	status: number,
	code: string,
	message: string,
	details?: unknown,
	init: ResponseInit = {}
) {
	return json(
		{ ok: false, error: { code, message, ...(details !== undefined ? { details } : {}) } } satisfies ApiFailure,
		{
			...init,
			status,
			headers: { ...securityHeaders, ...(init.headers ?? {}) }
		}
	);
}

export const ApiError = {
	badRequest: (message = 'Bad request', details?: unknown) =>
		fail(400, 'BAD_REQUEST', message, details),
	unauthorized: (message = 'Unauthorized') => fail(401, 'UNAUTHORIZED', message),
	forbidden: (message = 'Forbidden') => fail(403, 'FORBIDDEN', message),
	notFound: (message = 'Resource not found') => fail(404, 'NOT_FOUND', message),
	conflict: (message = 'Conflict') => fail(409, 'CONFLICT', message),
	payloadTooLarge: (message = 'Payload too large') => fail(413, 'PAYLOAD_TOO_LARGE', message),
	unsupportedMediaType: (message = 'Unsupported media type') =>
		fail(415, 'UNSUPPORTED_MEDIA_TYPE', message),
	tooManyRequests: (message = 'Too many requests', retryAfter?: number) =>
		fail(429, 'TOO_MANY_REQUESTS', message, undefined, {
			headers: retryAfter !== undefined ? { 'Retry-After': String(retryAfter) } : undefined
		}),
	internal: (message = 'Internal server error') => fail(500, 'INTERNAL_ERROR', message)
};
