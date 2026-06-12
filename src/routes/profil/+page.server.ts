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

	// Members → grouped structure
	const sortMember = (a: typeof memberRows[number], b: typeof memberRows[number]) =>
		a.sortOrder - b.sortOrder || a.id - b.id;

	const all = [...memberRows].sort(sortMember);

	// 1) Dewan Pembina: pelindung → penanggung_jawab → pembina
	const councilOrder = ['pelindung', 'penanggung_jawab', 'pembina'];
	const council = councilOrder
		.map((g) => ({
			group: g,
			label:
				g === 'pelindung'
					? 'Pelindung'
					: g === 'penanggung_jawab'
						? 'Penanggung Jawab'
						: 'Pembina',
			people: all
				.filter((m) => m.group === g)
				.map((m) => ({ id: m.id, name: m.name, position: m.position }))
		}))
		.filter((c) => c.people.length > 0);

	// 2) Featured carousel (pengurus inti + koordinator with photos)
	const featured = all
		.filter((m) => m.isFeatured)
		.map((m) => ({
			id: m.id,
			role: m.position,
			name: m.name,
			nim: m.nim ?? '',
			description: m.description ?? '',
			imageUrl: m.photo ?? '',
			tupoksi: (m.tupoksi ?? '')
				.split('\n')
				.map((s) => s.trim())
				.filter(Boolean)
		}));

	// 3) Divisi: group divisi members by division name (koordinator first)
	const divisiMembers = all.filter((m) => m.group === 'divisi');
	const divisionNames: string[] = [];
	for (const m of divisiMembers) {
		const d = m.division ?? 'Divisi';
		if (!divisionNames.includes(d)) divisionNames.push(d);
	}
	const isKoordinator = (pos: string) => /koordinator/i.test(pos);
	const divisions = divisionNames.map((name) => {
		const people = divisiMembers.filter((m) => (m.division ?? 'Divisi') === name);
		const koordinator = people.find((m) => isKoordinator(m.position)) ?? null;
		const anggota = people.filter((m) => m !== koordinator);
		return {
			name,
			koordinator: koordinator
				? { id: koordinator.id, name: koordinator.name, nim: koordinator.nim ?? '', position: koordinator.position }
				: null,
			anggota: anggota.map((m) => ({ id: m.id, name: m.name, nim: m.nim ?? '' }))
		};
	});

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
		council,
		members: featured,
		divisions
	};
};
