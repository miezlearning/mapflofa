import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { findResource } from '$lib/server/api/registry';

export const load: PageServerLoad = async ({ params }) => {
	const resource = findResource(params.resource);
	if (!resource) throw error(404, 'Unknown resource');
	return { resource };
};
