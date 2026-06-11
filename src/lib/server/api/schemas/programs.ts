import { z } from 'zod';

/**
 * Validation schemas for the `programs` resource.
 * Strings are trimmed; URLs are validated; lengths are bounded.
 */

// Helpers ---------------------------------------------------------------

const trimmedString = (max: number) =>
	z.string().trim().min(1, 'Field is required.').max(max, `Max ${max} characters.`);

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max, `Max ${max} characters.`)
		.transform((v) => (v.length === 0 ? null : v))
		.nullable()
		.optional();

const httpsUrl = z
	.string()
	.trim()
	.url('Must be a valid URL.')
	.max(2048)
	.refine((u) => /^https?:\/\//i.test(u), 'URL must start with http(s)://');

// Schemas ---------------------------------------------------------------

export const createProgramSchema = z.object({
	title: trimmedString(160),
	tag: trimmedString(60),
	excerpt: trimmedString(500),
	image: httpsUrl,
	post: optionalText(20_000),
	audience: optionalText(180),
	schedule: optionalText(180),
	location: optionalText(180),
	mentor: optionalText(180),
	capacity: optionalText(120),
	contact: optionalText(180),
	registration: optionalText(300),
	highlights: optionalText(1_200),
	outcomes: optionalText(1_500),
	activities: optionalText(1_500),
	requirements: optionalText(1_200)
});

/** Same fields as create, all optional, but at least one must be provided. */
export const updateProgramSchema = createProgramSchema
	.partial()
	.refine((obj) => Object.values(obj).some((v) => v !== undefined), {
		message: 'At least one field must be provided.'
	});

export const listProgramsQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0),
	tag: z.string().trim().min(1).max(60).optional(),
	q: z.string().trim().min(1).max(100).optional()
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type ListProgramsQuery = z.infer<typeof listProgramsQuerySchema>;
