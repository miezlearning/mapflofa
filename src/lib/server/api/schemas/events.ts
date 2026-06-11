import { z } from 'zod';

const trimmedString = (max: number) =>
	z.string().trim().min(1, 'Field is required.').max(max, `Max ${max} characters.`);

const httpsUrl = z
	.string()
	.trim()
	.url('Must be a valid URL.')
	.max(2048)
	.refine((u) => /^https?:\/\//i.test(u), 'URL must start with http(s)://');

export const createEventSchema = z.object({
	/** Human-friendly date, e.g. "12 Jun 2026". */
	date: trimmedString(40),
	/** Numeric day, e.g. "12" or "02". 1-2 digits. */
	dateDay: z
		.string()
		.trim()
		.regex(/^\d{1,2}$/, 'dateDay must be 1-2 digits.'),
	/** Short month label, e.g. "Jun", "Agu". 1-10 chars. */
	dateMonth: trimmedString(10),
	title: trimmedString(200),
	excerpt: trimmedString(500),
	image: httpsUrl,
	/** Time of day, e.g. "08:00 WITA". */
	time: trimmedString(40),
	location: trimmedString(120)
});

export const updateEventSchema = createEventSchema
	.partial()
	.refine((obj) => Object.values(obj).some((v) => v !== undefined), {
		message: 'At least one field must be provided.'
	});

export const listEventsQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0),
	q: z.string().trim().min(1).max(100).optional()
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
