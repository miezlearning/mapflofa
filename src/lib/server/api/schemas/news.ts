import { z } from 'zod';

const trimmedString = (max: number) =>
	z.string().trim().min(1, 'Field is required.').max(max, `Max ${max} characters.`);

const httpsUrl = z
	.string()
	.trim()
	.url('Must be a valid URL.')
	.max(2048)
	.refine((u) => /^https?:\/\//i.test(u), 'URL must start with http(s)://');

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(3, 'Slug minimal 3 karakter.')
	.max(120, 'Slug maksimal 120 karakter.')
	.regex(slugRegex, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.');

export const createNewsSchema = z.object({
	category: trimmedString(60),
	date: trimmedString(40),
	title: trimmedString(200),
	slug: slugSchema,
	excerpt: trimmedString(500),
	image: httpsUrl,
	content: z.string().max(50_000, 'Content terlalu panjang.').optional().nullable()
});

export const updateNewsSchema = createNewsSchema
	.partial()
	.refine((obj) => Object.values(obj).some((v) => v !== undefined), {
		message: 'At least one field must be provided.'
	});

export const listNewsQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0),
	category: z.string().trim().min(1).max(60).optional(),
	q: z.string().trim().min(1).max(100).optional()
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
export type ListNewsQuery = z.infer<typeof listNewsQuerySchema>;

/**
 * Slugify a title to a URL-safe form. Used by the dashboard's auto-suggest.
 */
export function slugify(input: string): string {
	return input
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 120);
}
