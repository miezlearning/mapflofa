import type { RequestEvent } from '@sveltejs/kit';
import type { ZodSchema } from 'zod';
import { ApiError } from './response';

const MAX_BODY_BYTES = 32 * 1024; // 32 KB — enough for our records, blocks accidental abuse

/**
 * Reads + validates a JSON body against a Zod schema.
 * Returns either { data } on success or { response } when the request should
 * be rejected (caller just `return`s the response).
 */
export async function readJson<T>(
	event: RequestEvent,
	schema: ZodSchema<T>
): Promise<{ data: T; response?: undefined } | { data?: undefined; response: Response }> {
	const ctype = event.request.headers.get('content-type') ?? '';
	if (!ctype.toLowerCase().startsWith('application/json')) {
		return { response: ApiError.unsupportedMediaType('Content-Type must be application/json.') };
	}

	const lenHeader = event.request.headers.get('content-length');
	if (lenHeader && Number(lenHeader) > MAX_BODY_BYTES) {
		return { response: ApiError.payloadTooLarge() };
	}

	let raw: string;
	try {
		raw = await event.request.text();
	} catch {
		return { response: ApiError.badRequest('Could not read request body.') };
	}

	if (raw.length > MAX_BODY_BYTES) {
		return { response: ApiError.payloadTooLarge() };
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return { response: ApiError.badRequest('Body is not valid JSON.') };
	}

	const result = schema.safeParse(parsed);
	if (!result.success) {
		return {
			response: ApiError.badRequest('Validation failed.', result.error.flatten())
		};
	}

	return { data: result.data };
}

/** Parse + validate a positive integer ID from a URL param. */
export function parseId(value: string | undefined): number | null {
	if (!value) return null;
	if (!/^\d+$/.test(value)) return null;
	const n = Number(value);
	if (!Number.isSafeInteger(n) || n <= 0) return null;
	return n;
}
