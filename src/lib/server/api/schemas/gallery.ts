import { z } from 'zod';
import { slugSchema, slugify } from './news';

/**
 * Validation schemas for the photo gallery (albums + photos).
 *
 * Image references may be either an absolute https URL or a local upload
 * path (e.g. "/uploads/<hash>.jpg") produced by the admin upload action.
 */
const imageRef = z
	.string()
	.trim()
	.min(1, 'Gambar wajib diisi.')
	.max(2048)
	.refine((v) => /^https?:\/\//i.test(v) || v.startsWith('/'), 'URL gambar tidak valid.');

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max, `Maksimal ${max} karakter.`)
		.optional()
		.nullable()
		.transform((v) => (v && v.length > 0 ? v : null));

export const createAlbumSchema = z.object({
	title: z.string().trim().min(1, 'Judul wajib diisi.').max(160, 'Maksimal 160 karakter.'),
	slug: slugSchema,
	description: optionalText(2000),
	coverImage: imageRef.optional().nullable(),
	eventDate: optionalText(40),
	isPublished: z.boolean().default(true),
	sortOrder: z.coerce.number().int().min(0).default(0)
});

export const updateAlbumSchema = createAlbumSchema
	.partial()
	.refine((obj) => Object.values(obj).some((v) => v !== undefined), {
		message: 'Minimal satu field harus diisi.'
	});

export const createPhotoSchema = z.object({
	albumId: z.coerce.number().int().positive(),
	image: imageRef,
	caption: optionalText(300),
	sortOrder: z.coerce.number().int().min(0).default(0)
});

export const updatePhotoSchema = z.object({
	caption: optionalText(300),
	sortOrder: z.coerce.number().int().min(0).optional()
});

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;
export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;
export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;

export { slugify };
