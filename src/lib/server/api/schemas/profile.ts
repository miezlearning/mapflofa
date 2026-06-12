import { z } from 'zod';

/**
 * Validation schemas for the editable Profil page:
 *   - site_content blocks (visi, misi, sejarah, nilai, header)
 *   - members (struktur organisasi)
 */

const imageRef = z
	.string()
	.trim()
	.max(2048)
	.refine((v) => v === '' || /^https?:\/\//i.test(v) || v.startsWith('/'), 'URL gambar tidak valid.')
	.optional()
	.nullable()
	.transform((v) => (v && v.length > 0 ? v : null));

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max, `Maksimal ${max} karakter.`)
		.optional()
		.nullable()
		.transform((v) => (v && v.length > 0 ? v : null));

/* ---------- site_content ---------- */

/** Keys the Profil page reads. Used to seed defaults + validate writes. */
export const PROFILE_CONTENT_KEYS = [
	'profile.header_label',
	'profile.header_title',
	'profile.header_desc',
	'profile.visi',
	'profile.misi',
	'profile.sejarah',
	'profile.nilai'
] as const;

export type ProfileContentKey = (typeof PROFILE_CONTENT_KEYS)[number];

/** A single content block update: { key, value }. */
export const updateContentSchema = z.object({
	key: z.enum(PROFILE_CONTENT_KEYS),
	value: z.string().trim().max(8000, 'Maksimal 8000 karakter.')
});

export type UpdateContentInput = z.infer<typeof updateContentSchema>;

/* ---------- members ---------- */

export const createMemberSchema = z.object({
	name: z.string().trim().min(1, 'Nama wajib diisi.').max(160, 'Maksimal 160 karakter.'),
	position: z.string().trim().min(1, 'Jabatan wajib diisi.').max(160, 'Maksimal 160 karakter.'),
	description: optionalText(300),
	photo: imageRef,
	tupoksi: optionalText(4000),
	period: optionalText(60),
	division: optionalText(160),
	isActive: z.boolean().default(true),
	sortOrder: z.coerce.number().int().min(0).default(0)
});

export const updateMemberSchema = createMemberSchema
	.partial()
	.refine((obj) => Object.values(obj).some((v) => v !== undefined), {
		message: 'Minimal satu field harus diisi.'
	});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
