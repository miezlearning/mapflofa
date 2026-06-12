import type { PageServerLoad } from './$types';
import { profileRepo } from '$lib/server/repositories/profile';

/**
 * Public Profil page data.
 *
 * Content blocks (visi/misi/sejarah/nilai/header) come from `site_content`
 * with code defaults as fallback. Struktur organisasi comes from `members`.
 * The page renders fine even on an empty DB thanks to the defaults.
 */
export const load: PageServerLoad = async () => {
	const [content, memberRows] = await Promise.all([
		profileRepo.getContentMap(),
		profileRepo.listMembers({ activeOnly: true })
	]);

	// Misi: one item per line
	const misi = (content['profile.misi'] ?? '')
		.split('\n')
		.map((s) => s.trim())
		.filter(Boolean);

	// Sejarah: one paragraph per line
	const sejarah = (content['profile.sejarah'] ?? '')
		.split('\n')
		.map((s) => s.trim())
		.filter(Boolean);

	// Nilai: "icon|title|desc" per line
	const nilai = (content['profile.nilai'] ?? '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [icon, title, desc] = line.split('|').map((s) => s.trim());
			return { icon: icon || 'sprout', title: title || '', desc: desc || '' };
		})
		.filter((n) => n.title);

	// Members → org carousel shape
	const members = memberRows.map((m) => ({
		id: m.id,
		role: m.position,
		name: m.name,
		description: m.description ?? '',
		imageUrl: m.photo ?? '',
		tupoksi: (m.tupoksi ?? '')
			.split('\n')
			.map((s) => s.trim())
			.filter(Boolean)
	}));

	return {
		header: {
			label: content['profile.header_label'] ?? '',
			title: content['profile.header_title'] ?? '',
			desc: content['profile.header_desc'] ?? ''
		},
		visi: content['profile.visi'] ?? '',
		misi,
		sejarah,
		nilai,
		members
	};
};
