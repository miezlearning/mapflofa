import { getUploadsDir } from '$lib/server/storage';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import type { RequestHandler } from './$types';

const MIME_TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml'
};

export const GET: RequestHandler = async ({ params }) => {
	const filename = params.file;
	if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
		return new Response('Not Found', { status: 404 });
	}

	const uploadsDir = getUploadsDir();
	const filePath = join(uploadsDir, filename);

	try {
		const fileStat = await stat(filePath);
		if (!fileStat.isFile()) {
			return new Response('Not Found', { status: 404 });
		}

		const data = await readFile(filePath);
		const ext = extname(filename).toLowerCase();
		const contentType = MIME_TYPES[ext] || 'application/octet-stream';

		return new Response(data, {
			headers: {
				'Content-Type': contentType,
				'Content-Length': fileStat.size.toString(),
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	} catch {
		return new Response('Not Found', { status: 404 });
	}
};
