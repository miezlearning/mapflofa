/**
 * Admin resource registry.
 *
 * Each resource declares:
 *   - field shape used by the generic form/list
 *   - the Zod schemas (re-used from the API layer)
 *   - the repository (re-used from the API layer)
 *
 * Adding a new resource = register it here. The admin pages auto-pick it up.
 *
 * Note: `news` is intentionally NOT in this registry — it has a custom
 * editor with markdown live preview at /admin/news/*.
 */
import type { ZodSchema } from 'zod';
import { programsRepo } from '$lib/server/repositories/programs';
import { eventsRepo } from '$lib/server/repositories/events';
import {
	createProgramSchema,
	updateProgramSchema
} from '$lib/server/api/schemas/programs';
import { createEventSchema, updateEventSchema } from '$lib/server/api/schemas/events';

export type FieldKind = 'text' | 'textarea' | 'url' | 'longtext';

export type AdminField = {
	name: string;
	label: string;
	kind: FieldKind;
	hint?: string;
	required?: boolean;
	/** Show in list view as a column. Default false. */
	listColumn?: boolean;
};

/**
 * Loose typing for the repos: routes only call list/findById/create/update/remove.
 * `unknown` keeps the contract narrow without type gymnastics.
 */
export type RepoLike = {
	list(opts: { limit: number; offset: number }): Promise<{ rows: unknown[]; total: number }>;
	findById(id: number): Promise<unknown>;
	create(input: unknown): Promise<unknown>;
	update(id: number, input: unknown): Promise<unknown>;
	remove(id: number): Promise<unknown>;
};

export type AdminResource = {
	slug: string;
	label: string;
	plural: string;
	repo: RepoLike;
	createSchema: ZodSchema;
	updateSchema: ZodSchema;
	fields: AdminField[];
};

const programsResource: AdminResource = {
	slug: 'programs',
	label: 'Program',
	plural: 'Programs',
	repo: programsRepo as unknown as RepoLike,
	createSchema: createProgramSchema,
	updateSchema: updateProgramSchema,
	fields: [
		{ name: 'title', label: 'Title', kind: 'text', required: true, listColumn: true },
		{ name: 'tag', label: 'Tag', kind: 'text', required: true, listColumn: true },
		{ name: 'excerpt', label: 'Excerpt', kind: 'textarea', required: true },
		{ name: 'image', label: 'Image URL', kind: 'url', required: true },
		{ name: 'audience', label: 'Audience', kind: 'text', hint: 'e.g. Kelas VII sampai IX.' },
		{ name: 'schedule', label: 'Schedule', kind: 'text', hint: 'e.g. Rabu, 15.30 WITA.' },
		{ name: 'location', label: 'Location', kind: 'text', listColumn: true },
		{ name: 'mentor', label: 'Mentor', kind: 'text', hint: 'Teacher or coach in charge.' },
		{ name: 'capacity', label: 'Capacity', kind: 'text', hint: 'Optional participant limit.' },
		{ name: 'contact', label: 'Contact', kind: 'text', hint: 'Contact person or channel.' },
		{
			name: 'registration',
			label: 'Registration notes',
			kind: 'textarea',
			hint: 'Short note about how students join.'
		},
		{
			name: 'highlights',
			label: 'Highlights',
			kind: 'textarea',
			hint: 'One item per line. Shown as compact facts.'
		},
		{
			name: 'outcomes',
			label: 'Outcomes',
			kind: 'textarea',
			hint: 'One item per line. What students will practice or produce.'
		},
		{
			name: 'activities',
			label: 'Activities',
			kind: 'textarea',
			hint: 'One item per line. Regular activities in the program.'
		},
		{
			name: 'requirements',
			label: 'Requirements',
			kind: 'textarea',
			hint: 'One item per line. Preparation, equipment, or eligibility.'
		},
		{
			name: 'post',
			label: 'Long content',
			kind: 'longtext',
			hint: 'Optional. Markdown or plain text up to 20000 chars.'
		}
	]
};


const eventsResource: AdminResource = {
	slug: 'events',
	label: 'Event',
	plural: 'Events',
	repo: eventsRepo as unknown as RepoLike,
	createSchema: createEventSchema,
	updateSchema: updateEventSchema,
	fields: [
		{ name: 'date', label: 'Date label', kind: 'text', required: true, listColumn: true, hint: 'e.g. "12 Jun 2026"' },
		{ name: 'dateDay', label: 'Day', kind: 'text', required: true, hint: '1–2 digits, e.g. "12"' },
		{ name: 'dateMonth', label: 'Month', kind: 'text', required: true, hint: 'Short label, e.g. "Jun"' },
		{ name: 'title', label: 'Title', kind: 'text', required: true, listColumn: true },
		{ name: 'excerpt', label: 'Excerpt', kind: 'textarea', required: true },
		{ name: 'image', label: 'Image URL', kind: 'url', required: true },
		{ name: 'time', label: 'Time', kind: 'text', required: true, hint: 'e.g. "08:00 WITA"' },
		{ name: 'location', label: 'Location', kind: 'text', required: true, listColumn: true }
	]
};

export const ADMIN_RESOURCES: Record<string, AdminResource> = {
	programs: programsResource,
	events: eventsResource
};

export function findAdminResource(slug: string): AdminResource | null {
	return ADMIN_RESOURCES[slug] ?? null;
}

export function listAdminResources(): AdminResource[] {
	return Object.values(ADMIN_RESOURCES);
}
