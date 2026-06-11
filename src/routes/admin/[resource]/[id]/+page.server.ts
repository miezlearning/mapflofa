import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard';
import { findAdminResource } from '$lib/server/admin/resources';
import { audit } from '$lib/server/audit/log';

function parseId(s: string | undefined): number {
	if (!s || !/^\d+$/.test(s)) throw error(400, 'Invalid id');
	const n = Number(s);
	if (!Number.isSafeInteger(n) || n <= 0) throw error(400, 'Invalid id');
	return n;
}

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const resource = findAdminResource(event.params.resource);
	if (!resource) throw error(404, 'Unknown resource');

	const id = parseId(event.params.id);
	const item = await resource.repo.findById(id);
	if (!item) throw error(404, `${resource.label} not found`);

	return {
		resource: {
			slug: resource.slug,
			label: resource.label,
			plural: resource.plural,
			fields: resource.fields
		},
		item: item as Record<string, unknown>
	};
};

export const actions: Actions = {
	default: async (event) => {
		requireUser(event);
		const resource = findAdminResource(event.params.resource);
		if (!resource) throw error(404, 'Unknown resource');
		const id = parseId(event.params.id);

		const form = await event.request.formData();
		const raw: Record<string, unknown> = {};
		for (const f of resource.fields) {
			const v = form.get(f.name);
			if (v === null) continue;
			const s = String(v);
			if (s === '' && !f.required) continue;
			raw[f.name] = s;
		}

		const parsed = resource.updateSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, {
				values: raw,
				message: 'Periksa kembali isian formulir.',
				fieldErrors: parsed.error.flatten().fieldErrors
			});
		}

		try {
			const updated = await resource.repo.update(id, parsed.data);
			if (!updated) throw error(404, `${resource.label} not found`);
			await audit(event, {
				action: 'resource.update',
				resource: resource.slug,
				resourceId: id,
				details: { fields: Object.keys(parsed.data as object) }
			});
		} catch (err) {
			console.error(`[admin/${resource.slug}/${id}]`, err);
			return fail(500, { values: raw, message: 'Gagal menyimpan perubahan.' });
		}

		throw redirect(303, `/admin/${resource.slug}`);
	}
};
