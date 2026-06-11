import { error } from '@sveltejs/kit';
import { parseId } from '$lib/server/api/parse';
import { programsRepo } from '$lib/server/repositories/programs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseId(params.id);
	if (id === null) {
		error(400, 'Program id tidak valid.');
	}

	const program = await programsRepo.findById(id);
	if (!program) {
		error(404, 'Program tidak ditemukan.');
	}

	// Fetch up to 4 programs to find 3 related ones (excluding current one)
	const { rows: allPrograms } = await programsRepo.list({ limit: 4, offset: 0 });
	const relatedPrograms = allPrograms.filter((p) => p.id !== id).slice(0, 3);

	return { program, relatedPrograms };
};
