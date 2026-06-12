import type { Member } from '$lib/db/schema';

/**
 * Builds the public "struktur organisasi" view from raw member rows.
 *
 * Designed to be SCALABLE: nothing here is hardcoded to specific division
 * names or a fixed set of groups. Admins can rename divisions, add new
 * groups, reorder people, and the page adapts automatically.
 *
 * Output shape:
 *   - council:   non-featured, non-division members grouped by `group`
 *                (Pelindung, Pembina, or any custom group) → simple cards.
 *   - featured:  members flagged `isFeatured` → big photo carousel.
 *   - divisions: members in group 'divisi' grouped by their (normalized)
 *                division name → koordinator + anggota list.
 */

/** Preferred display order for known groups; unknown groups fall after these. */
const GROUP_ORDER: Record<string, number> = {
	pelindung: 0,
	penanggung_jawab: 1,
	pembina: 2,
	pengurus: 3,
	divisi: 4
};

/** Friendly labels for known groups. Unknown groups are humanized. */
const GROUP_LABELS: Record<string, string> = {
	pelindung: 'Pelindung',
	penanggung_jawab: 'Penanggung Jawab',
	pembina: 'Pembina',
	pengurus: 'Pengurus Inti',
	divisi: 'Divisi'
};

/** Turn an arbitrary key like "dewan_penasihat" into "Dewan Penasihat". */
export function humanizeGroup(key: string): string {
	if (GROUP_LABELS[key]) return GROUP_LABELS[key];
	return key
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function groupRank(key: string): number {
	return key in GROUP_ORDER ? GROUP_ORDER[key] : 90;
}

const lines = (s: string | null) =>
	(s ?? '')
		.split('\n')
		.map((x) => x.trim())
		.filter(Boolean);

const isKoordinator = (pos: string) => /koordinator|ketua|kepala/i.test(pos);

export type OrgStructure = ReturnType<typeof buildOrgStructure>;

export function buildOrgStructure(rows: Member[]) {
	const all = [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

	// ---- Featured carousel (any group) ----
	const featured = all
		.filter((m) => m.isFeatured)
		.map((m) => ({
			id: m.id,
			role: m.position,
			name: m.name,
			nim: m.nim ?? '',
			description: m.description ?? '',
			imageUrl: m.photo ?? '',
			tupoksi: lines(m.tupoksi)
		}));

	// ---- Council: non-featured, non-division members grouped by `group` ----
	const councilMembers = all.filter((m) => !m.isFeatured && m.group !== 'divisi');
	const councilByGroup = new Map<string, typeof councilMembers>();
	for (const m of councilMembers) {
		const key = (m.group || 'lainnya').trim();
		if (!councilByGroup.has(key)) councilByGroup.set(key, []);
		councilByGroup.get(key)!.push(m);
	}
	const council = [...councilByGroup.entries()]
		.map(([group, people]) => ({
			group,
			label: humanizeGroup(group),
			rank: groupRank(group),
			people: people.map((m) => ({
				id: m.id,
				name: m.name,
				position: m.position,
				nim: m.nim ?? ''
			}))
		}))
		.sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label))
		.map(({ group, label, people }) => ({ group, label, people }));

	// ---- Divisions: group 'divisi' members by normalized division name ----
	const divisiMembers = all.filter((m) => m.group === 'divisi');
	const divisionOrder: string[] = [];
	const divisionMap = new Map<string, typeof divisiMembers>();
	for (const m of divisiMembers) {
		// Normalize so "Divisi Flora " and "divisi flora" don't split.
		const raw = (m.division ?? '').trim() || 'Divisi Lainnya';
		const key = raw.toLowerCase();
		if (!divisionMap.has(key)) {
			divisionMap.set(key, []);
			divisionOrder.push(key);
		}
		divisionMap.get(key)!.push(m);
	}
	const divisions = divisionOrder.map((key) => {
		const people = divisionMap.get(key)!;
		// Display name = first member's original (trimmed) division string.
		const name = (people[0].division ?? '').trim() || 'Divisi Lainnya';
		const koordinator = people.find((m) => isKoordinator(m.position)) ?? null;
		const anggota = people.filter((m) => m !== koordinator);
		return {
			name,
			koordinator: koordinator
				? {
						id: koordinator.id,
						name: koordinator.name,
						nim: koordinator.nim ?? '',
						position: koordinator.position
					}
				: null,
			anggota: anggota.map((m) => ({
				id: m.id,
				name: m.name,
				nim: m.nim ?? '',
				position: m.position
			}))
		};
	});

	return { council, featured, divisions };
}
