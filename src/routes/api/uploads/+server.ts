/**
 * /api/uploads — multipart upload (admin only).
 *
 * Returns: { ok: true, data: { url, size, mime } }
 *
 * Bypasses the standard 32 KB body cap of /api/* (this one is a stream
 * straight to the filesystem). Still capped at 5 MB inside saveUpload().
 */
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/api/auth';
import { rateLimit } from '$lib/server/api/rate-limit';
import { ApiError, ok } from '$lib/server/api/response';
import { saveUpload, MAX_UPLOAD_BYTES } from '$lib/server/storage';
import { audit } from '$lib/server/audit/log';

export const POST: RequestHandler = async (event) => {
	const limited = rateLimit(event, { key: 'uploads:write', limit: 30, windowMs: 60_000 });
	if (limited) return limited;

	const unauth = requireAdmin(event);
	if (unauth) return unauth;

	const ctype = event.request.headers.get('content-type') ?? '';
	if (!ctype.toLowerCase().startsWith('multipart/form-data')) {
		return ApiError.unsupportedMediaType('Use multipart/form-data with a "file" field.');
	}

	const lenHeader = event.request.headers.get('content-length');
	if (lenHeader && Number(lenHeader) > MAX_UPLOAD_BYTES + 4096) {
		return ApiError.payloadTooLarge();
	}

	let form: FormData;
	try {
		form = await event.request.formData();
	} catch {
		return ApiError.badRequest('Could not read form data.');
	}

	const file = form.get('file');
	if (!(file instanceof File)) {
		return ApiError.badRequest('Field "file" missing or not a file.');
	}

	const result = await saveUpload(file);
	if ('error' in result) return ApiError.badRequest(result.error);

	await audit(event, {
		action: 'resource.create',
		resource: 'uploads',
		details: { filename: result.filename, size: result.size, mime: result.mime }
	});

	return ok({ url: result.url, size: result.size, mime: result.mime, filename: result.filename }, { status: 201 });
};
