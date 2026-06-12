import { asc, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/db';
import { members, siteContent } from '$lib/db/schema';
import type { CreateMemberInput, UpdateMemberInput } from '$lib/server/api/schemas/profile';

/**
 * Default labels + values for the editable Profil content blocks.
 * Used to seed missing rows so the admin form always has something to edit,
 * and as the public fallback when the DB is empty.
 */
export const PROFILE_DEFAULTS: Record<string, { label: string; value: string }> = {
	'profile.header_label': { label: 'Header — Label', value: 'Profil Organisasi' },
	'profile.header_title': { label: 'Header — Judul', value: 'Tentang MAPFLOFA' },
	'profile.header_desc': {
		label: 'Header — Deskripsi',
		value:
			'Mahasiswa Penyayang Flora Fauna (MAPFLOFA) adalah organisasi mahasiswa pecinta alam yang berfokus pada konservasi flora, fauna, dan kelestarian lingkungan.'
	},
	'profile.visi': {
		label: 'Visi',
		value:
			'Menjadi wadah mahasiswa yang aktif menjaga keanekaragaman hayati dan menumbuhkan budaya cinta lingkungan yang berkelanjutan.'
	},
	'profile.misi': {
		label: 'Misi (satu poin per baris)',
		value: [
			'Melaksanakan kegiatan konservasi flora dan fauna secara berkelanjutan.',
			'Mengedukasi mahasiswa dan masyarakat tentang pentingnya menjaga lingkungan.',
			'Melakukan pendataan dan pelestarian satwa serta tumbuhan endemik.',
			'Membangun kolaborasi dengan komunitas, kampus, dan lembaga konservasi.',
			'Menumbuhkan rasa cinta terhadap alam melalui aksi nyata dan ekspedisi.'
		].join('\n')
	},
	'profile.sejarah': {
		label: 'Sejarah (satu paragraf per baris)',
		value: [
			'MAPFLOFA lahir dari sekelompok mahasiswa yang resah melihat kerusakan lingkungan dan menyusutnya habitat satwa di sekitar kampus. Berawal dari kegiatan penanaman pohon kecil-kecilan, organisasi ini tumbuh menjadi komunitas konservasi yang aktif.',
			'Kini MAPFLOFA rutin menggelar aksi penghijauan, edukasi lingkungan, dan ekspedisi pendataan flora fauna bersama berbagai mitra.'
		].join('\n')
	},
	'profile.nilai': {
		label: 'Nilai (format: icon|judul|deskripsi per baris)',
		value: [
			'sprout|Lestari|Menjaga alam untuk generasi mendatang',
			'users|Gotong Royong|Bergerak bersama, berdampak lebih besar',
			'book|Edukatif|Berbagi ilmu dan kesadaran lingkungan',
			'shield|Integritas|Jujur dan bertanggung jawab pada bumi'
		].join('\n')
	},
	'contact.address': { label: 'Alamat', value: 'Sekretariat MAPFLOFA, Gedung Unit Kegiatan Mahasiswa, Jl. Kampus Hijau No. 1, Indonesia.' },
	'contact.whatsapp': { label: 'WhatsApp', value: '+62 812-3456-7890' },
	'contact.instagram': { label: 'Instagram', value: '@mapflofa' },
	'contact.email': { label: 'Email', value: 'halo@mapflofa.org' },
	'contact.extra': { label: 'Kontak tambahan (satu per baris, format: label|value)', value: '' },
	'contact.socials': {
		label: 'Link sosial media (satu per baris, format: platform|url)',
		value: [
			'Instagram|https://instagram.com/mapflofa',
			'WhatsApp|https://wa.me/6281234567890',
			'Facebook|#',
			'YouTube|#'
		].join('\n')
	}
};

export const profileRepo = {
	/** Read all profile content blocks as a key→value map (with defaults). */
	async getContentMap(): Promise<Record<string, string>> {
		const keys = Object.keys(PROFILE_DEFAULTS);
		const rows = await db
			.select()
			.from(siteContent)
			.where(inArray(siteContent.key, keys));

		const map: Record<string, string> = {};
		for (const key of keys) map[key] = PROFILE_DEFAULTS[key].value;
		for (const row of rows) map[row.key] = row.value;
		return map;
	},

	/** Admin view: every block as a row with label, ensuring defaults exist. */
	async listContentBlocks() {
		const keys = Object.keys(PROFILE_DEFAULTS);
		const rows = await db
			.select()
			.from(siteContent)
			.where(inArray(siteContent.key, keys));
		const byKey = new Map(rows.map((r) => [r.key, r]));

		return keys.map((key) => {
			const existing = byKey.get(key);
			return {
				key,
				label: existing?.label ?? PROFILE_DEFAULTS[key].label,
				value: existing?.value ?? PROFILE_DEFAULTS[key].value
			};
		});
	},

	/** Upsert a single content block. */
	async setContent(key: string, value: string) {
		const label = PROFILE_DEFAULTS[key]?.label ?? key;
		await db
			.insert(siteContent)
			.values({ key, group: 'profile', label, value })
			.onConflictDoUpdate({
				target: siteContent.key,
				set: { value, label, updatedAt: new Date() }
			});
	},

	/* ---------- members / struktur organisasi ---------- */

	listMembers(opts?: { activeOnly?: boolean }) {
		const where = opts?.activeOnly ? eq(members.isActive, true) : undefined;
		return db
			.select()
			.from(members)
			.where(where)
			.orderBy(asc(members.sortOrder), asc(members.id));
	},

	/** Distinct division names already in use — powers admin autocomplete. */
	async listDivisions(): Promise<string[]> {
		const rows = await db
			.select({ division: members.division })
			.from(members)
			.where(eq(members.group, 'divisi'));
		const set = new Set<string>();
		for (const r of rows) {
			const d = (r.division ?? '').trim();
			if (d) set.add(d);
		}
		return [...set].sort((a, b) => a.localeCompare(b));
	},

	/** Distinct custom group keys in use (excluding the built-in presets). */
	async listCustomGroups(): Promise<string[]> {
		const presets = ['pelindung', 'penanggung_jawab', 'pembina', 'pengurus', 'divisi'];
		const rows = await db.select({ group: members.group }).from(members);
		const set = new Set<string>();
		for (const r of rows) {
			const g = (r.group ?? '').trim();
			if (g && !presets.includes(g)) set.add(g);
		}
		return [...set].sort((a, b) => a.localeCompare(b));
	},

	findMemberById(id: number) {
		return db
			.select()
			.from(members)
			.where(eq(members.id, id))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	async createMember(input: CreateMemberInput) {
		const [row] = await db.insert(members).values(input).returning();
		return row;
	},

	async updateMember(id: number, input: UpdateMemberInput) {
		const [row] = await db
			.update(members)
			.set(input)
			.where(eq(members.id, id))
			.returning();
		return row ?? null;
	},

	async removeMember(id: number) {
		const [row] = await db
			.delete(members)
			.where(eq(members.id, id))
			.returning({ id: members.id });
		return row ?? null;
	}
};
