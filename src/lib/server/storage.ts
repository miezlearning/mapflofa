/**
 * Image upload storage.
 *
 * Files land in `static/uploads/` so SvelteKit serves them directly at
 * `/uploads/<file>` without any additional config. Filename = sha256 of
 * the bytes + content extension. That gives us:
 *   - Idempotent uploads (same image twice = same URL)
 *   - No filename collisions
 *   - No user-controlled filename in the path
 *
 * Validation:
 *   - 5 MB hard limit
 *   - Allowed MIME types whitelist
 *   - Magic-byte sniffing (don't trust the client-declared mime)
 *
 * To migrate to S3 / Cloudflare R2 later, swap this module — the API
 * surface (saveUpload) stays the same.
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

import { env } from '$env/dynamic/private';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED: Record<string, { ext: string; sniff: (buf: Buffer) => boolean }> = {
	'image/jpeg': {
		ext: 'jpg',
		sniff: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
	},
	'image/png': {
		ext: 'png',
		sniff: (b) =>
			b.length >= 8 &&
			b[0] === 0x89 &&
			b[1] === 0x50 &&
			b[2] === 0x4e &&
			b[3] === 0x47 &&
			b[4] === 0x0d &&
			b[5] === 0x0a &&
			b[6] === 0x1a &&
			b[7] === 0x0a
	},
	'image/webp': {
		ext: 'webp',
		sniff: (b) =>
			b.length >= 12 &&
			b[0] === 0x52 &&
			b[1] === 0x49 &&
			b[2] === 0x46 &&
			b[3] === 0x46 &&
			b[8] === 0x57 &&
			b[9] === 0x45 &&
			b[10] === 0x42 &&
			b[11] === 0x50
	},
	'image/gif': {
		ext: 'gif',
		sniff: (b) =>
			b.length >= 6 &&
			b[0] === 0x47 &&
			b[1] === 0x49 &&
			b[2] === 0x46 &&
			b[3] === 0x38 &&
			(b[4] === 0x37 || b[4] === 0x39) &&
			b[5] === 0x61
	}
};

export type UploadResult = {
	url: string;
	path: string;
	size: number;
	mime: string;
	filename: string;
};

export function getUploadsDir(): string {
	let dir = (env.UPLOAD_DIR || process.env.UPLOAD_DIR || process.env.UPLOADS_DIR || '').trim();
	if (dir) {
		dir = dir.replace(/^["']|["']$/g, '').trim();
	}
	return dir || join(process.cwd(), 'static', 'uploads');
}

async function ensureDir() {
	const dir = getUploadsDir();
	try {
		await access(dir);
	} catch {
		await mkdir(dir, { recursive: true });
	}
}

export type UploadFailure = { error: string };

export async function saveUpload(file: File): Promise<UploadResult | UploadFailure> {
	if (file.size === 0) return { error: 'File kosong.' };
	if (file.size > MAX_UPLOAD_BYTES) {
		return { error: `Ukuran maksimum ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.` };
	}

	const declaredMime = file.type.toLowerCase();
	const allowed = ALLOWED[declaredMime];
	if (!allowed) {
		return { error: 'Tipe file tidak diizinkan. Hanya JPG, PNG, WebP, dan GIF.' };
	}

	const buf = Buffer.from(await file.arrayBuffer());
	if (!allowed.sniff(buf)) {
		return { error: 'Konten file tidak cocok dengan tipe yang diklaim.' };
	}

	const hash = createHash('sha256').update(buf).digest('hex');
	const filename = `${hash}.${allowed.ext}`;

	try {
		await ensureDir();
		const fullPath = join(getUploadsDir(), filename);
		try {
			await access(fullPath);
			// File already exists — same content, same URL. Skip rewrite.
		} catch {
			await writeFile(fullPath, buf);
		}

		return {
			url: `/uploads/${filename}`,
			path: fullPath,
			size: buf.length,
			mime: declaredMime,
			filename
		};
	} catch (err) {
		console.error('[storage] Gagal menyimpan file upload:', err);
		return { error: `Gagal menyimpan file ke sistem server: ${(err as Error).message}` };
	}
}
