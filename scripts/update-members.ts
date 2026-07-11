import 'dotenv/config';
import { eq, notInArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/db/schema.js';
import { members } from '../src/lib/db/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL is not set');
	process.exit(1);
}

const client = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
	console.log('🔄 Fetching existing members...');
	const existing = await db.select().from(members);
	const photoMap = new Map<string, string>();
	for (const m of existing) {
		if (m.photo) {
			photoMap.set(m.name.toLowerCase().trim(), m.photo);
		}
	}

	console.log('🗑️ Deleting old non-council members...');
	await db.delete(members).where(
		notInArray(members.group, ['pelindung', 'penanggung_jawab', 'pembina'])
	);

	// Let's define the new members list
	const newMembers: (typeof members.$inferInsert)[] = [
		// --- Pengurus Inti ---
		{
			name: 'Zidan Ata Mawla',
			position: 'Ketua Umum',
			nim: 'NPA.Dw 39002',
			group: 'pengurus',
			isFeatured: true,
			isActive: true,
			sortOrder: 20,
			photo: photoMap.get('zidan ata mawla') ?? '/uploads/baab86fd514d602201b73017dd5dee1965866ad437d3288348977b5ae7469863.png',
			description: 'Pemimpin organisasi',
			tupoksi: [
				'Memimpin dan mengarahkan jalannya organisasi sesuai visi dan misi MAPFLOFA.',
				'Mengambil keputusan strategis terkait program kerja dan kebijakan organisasi.',
				'Mewakili organisasi dalam hubungan dengan fakultas, mitra, dan lembaga konservasi.',
				'Mengkoordinasikan seluruh pengurus dan divisi agar berjalan selaras.'
			].join('\n')
		},
		{
			name: 'M.Rapli',
			position: 'Wakil Ketua Umum',
			nim: 'NPA.Dw 39004',
			group: 'pengurus',
			isFeatured: true,
			isActive: true,
			sortOrder: 21,
			photo: photoMap.get('m.rapli') ?? photoMap.get('muhammad rapli') ?? '/uploads/8d83d9b5f80d375e287eb66a5385bf69524ee89a1b8d32f32df28b2111967235.png',
			description: 'Pendamping ketua',
			tupoksi: [
				'Mendampingi dan membantu ketua dalam menjalankan tugas organisasi.',
				'Menggantikan peran ketua apabila berhalangan hadir.',
				'Mengawasi pelaksanaan program kerja tiap divisi.'
			].join('\n')
		},
		{
			name: 'Debora Regina Rumagit',
			position: 'Sekretaris',
			nim: 'NPA.Dw 39010',
			group: 'pengurus',
			isFeatured: true,
			isActive: true,
			sortOrder: 22,
			photo: photoMap.get('debora regina rumagit') ?? '/uploads/84e8cb5e73e7cef15e52b06d343634c5b811e4cd73804af351d2a5d00c7f6f6a.jpg',
			description: 'Administrasi & surat',
			tupoksi: [
				'Mengelola seluruh administrasi dan surat-menyurat organisasi.',
				'Menyusun notulen rapat dan mendokumentasikan kegiatan.',
				'Mengarsipkan dokumen penting organisasi secara rapi.'
			].join('\n')
		},

		// --- Divisi Flora ---
		{
			name: 'Baharuddin Septianto',
			position: 'Koordinator',
			nim: 'NPA.Dw 36008',
			group: 'divisi',
			division: 'Divisi Flora',
			isFeatured: true,
			isActive: true,
			sortOrder: 30,
			photo: photoMap.get('baharuddin septianto') ?? photoMap.get('baharrudin septianto') ?? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=700&auto=format&fit=crop',
			description: 'Koordinator Divisi Flora',
			tupoksi: [
				'Memimpin dan mengoordinasikan kegiatan Divisi Flora.',
				'Merencanakan program pelestarian dan pendataan tumbuhan.',
				'Membimbing anggota divisi dalam kegiatan lapangan.'
			].join('\n')
		},
		{
			name: 'She Lomitha Rianti Banner',
			position: 'Anggota',
			nim: 'NPA.Dw 40011',
			group: 'divisi',
			division: 'Divisi Flora',
			isFeatured: false,
			isActive: true,
			sortOrder: 31
		},
		{
			name: 'Lisaniyah',
			position: 'Anggota',
			nim: 'NPA.Dw 36003',
			group: 'divisi',
			division: 'Divisi Flora',
			isFeatured: false,
			isActive: true,
			sortOrder: 32
		},
		{
			name: 'Muhammad Syafi’i',
			position: 'Anggota',
			nim: 'NPA.Dw 37010',
			group: 'divisi',
			division: 'Divisi Flora',
			isFeatured: false,
			isActive: true,
			sortOrder: 33
		},
		{
			name: 'Vany Ayu Lestari',
			position: 'Anggota',
			nim: 'NPA.Dw 38002',
			group: 'divisi',
			division: 'Divisi Flora',
			isFeatured: false,
			isActive: true,
			sortOrder: 34
		},

		// --- Divisi Olpet ---
		{
			name: 'Riski Muammar Hadi',
			position: 'Koordinator',
			nim: 'NPA.Dw 39007',
			group: 'divisi',
			division: 'Divisi Olpet',
			isFeatured: true,
			isActive: true,
			sortOrder: 40,
			photo: photoMap.get('riski muammar hadi') ?? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=700&auto=format&fit=crop',
			description: 'Koordinator Divisi Olpet',
			tupoksi: [
				'Memimpin dan mengoordinasikan kegiatan Divisi Olpet.',
				'Merencanakan program terkait olahraga dan pecinta alam.',
				'Membimbing anggota divisi dalam kegiatan lapangan.'
			].join('\n')
		},
		{
			name: 'Wa Sinta',
			position: 'Anggota',
			nim: 'NPA.Dw 40014',
			group: 'divisi',
			division: 'Divisi Olpet',
			isFeatured: false,
			isActive: true,
			sortOrder: 41
		},
		{
			name: 'Aron',
			position: 'Anggota',
			nim: 'NPA.Dw 38004',
			group: 'divisi',
			division: 'Divisi Olpet',
			isFeatured: false,
			isActive: true,
			sortOrder: 42
		},
		{
			name: 'Heldi pratama',
			position: 'Anggota',
			nim: 'NPA.Dw 37003',
			group: 'divisi',
			division: 'Divisi Olpet',
			isFeatured: false,
			isActive: true,
			sortOrder: 43
		},
		{
			name: 'Yanri Amos tamba',
			position: 'Anggota',
			nim: 'NPA.Dw 38014',
			group: 'divisi',
			division: 'Divisi Olpet',
			isFeatured: false,
			isActive: true,
			sortOrder: 44
		},

		// --- Divisi LH ---
		{
			name: 'Karolus Tueng Lengary',
			position: 'Koordinator',
			nim: 'NPA.Dw 39009',
			group: 'divisi',
			division: 'Divisi Lingkungan Hidup',
			isFeatured: true,
			isActive: true,
			sortOrder: 50,
			photo: photoMap.get('karolus tueng lengary') ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=700&auto=format&fit=crop',
			description: 'Koordinator Divisi Lingkungan Hidup',
			tupoksi: [
				'Memimpin dan mengoordinasikan kegiatan Divisi Lingkungan Hidup.',
				'Merencanakan program aksi lingkungan dan kampanye.',
				'Membimbing anggota divisi dalam kegiatan lapangan.'
			].join('\n')
		},
		{
			name: 'Anta brife Pinem',
			position: 'Anggota',
			nim: 'NPA.Dw 40006',
			group: 'divisi',
			division: 'Divisi Lingkungan Hidup',
			isFeatured: false,
			isActive: true,
			sortOrder: 51
		},
		{
			name: 'Intan Nur Laila',
			position: 'Anggota',
			nim: 'NPA.Dw 40004',
			group: 'divisi',
			division: 'Divisi Lingkungan Hidup',
			isFeatured: false,
			isActive: true,
			sortOrder: 52
		},
		{
			name: 'Tsani maulana Abdillah',
			position: 'Anggota',
			nim: 'NPA.Dw 38008',
			group: 'divisi',
			division: 'Divisi Lingkungan Hidup',
			isFeatured: false,
			isActive: true,
			sortOrder: 53
		},
		{
			name: 'Regina Theresia sembiring',
			position: 'Anggota',
			nim: 'NPA.Dw 38009',
			group: 'divisi',
			division: 'Divisi Lingkungan Hidup',
			isFeatured: false,
			isActive: true,
			sortOrder: 54
		},

		// --- Biro Bud ---
		{
			name: 'Dion Rudiansyah',
			position: 'Koordinator',
			nim: 'NPA.Dw 39003',
			group: 'divisi',
			division: 'Biro Bud',
			isFeatured: true,
			isActive: true,
			sortOrder: 60,
			photo: photoMap.get('dion rudiansyah') ?? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=700&auto=format&fit=crop',
			description: 'Koordinator Biro Bud',
			tupoksi: [
				'Memimpin dan mengoordinasikan kegiatan Biro Bud.',
				'Merencanakan program terkait budaya, seni, dan kreativitas.',
				'Membimbing anggota biro dalam kegiatan.'
			].join('\n')
		},
		{
			name: 'Nia naila afifah',
			position: 'Anggota',
			nim: 'NPA.Dw 40013',
			group: 'divisi',
			division: 'Biro Bud',
			isFeatured: false,
			isActive: true,
			sortOrder: 61
		},
		{
			name: 'Sopian exsel',
			position: 'Anggota',
			nim: 'NPA.Dw 38003',
			group: 'divisi',
			division: 'Biro Bud',
			isFeatured: false,
			isActive: true,
			sortOrder: 62
		},

		// --- Biro Perpustakaan ---
		{
			name: 'Nur Tatia Safitri',
			position: 'Koordinator',
			nim: 'NPA.Dw 40014',
			group: 'divisi',
			division: 'Biro Perpustakaan',
			isFeatured: true,
			isActive: true,
			sortOrder: 70,
			photo: photoMap.get('nur tatia safitri') ?? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=700&auto=format&fit=crop',
			description: 'Koordinator Biro Perpustakaan',
			tupoksi: [
				'Memimpin dan mengoordinasikan kegiatan Biro Perpustakaan.',
				'Mengelola perpustakaan dan buku referensi organisasi.',
				'Merencanakan program literasi dan diskusi buku.'
			].join('\n')
		},
		{
			name: 'Cinta rydha Dealova',
			position: 'Anggota',
			nim: 'NPA.Dw 40008',
			group: 'divisi',
			division: 'Biro Perpustakaan',
			isFeatured: false,
			isActive: true,
			sortOrder: 71
		},
		{
			name: 'Dea nopita',
			position: 'Anggota',
			nim: 'NPA.Dw 39011',
			group: 'divisi',
			division: 'Biro Perpustakaan',
			isFeatured: false,
			isActive: true,
			sortOrder: 72
		},
		{
			name: 'Ni ketut rini wiryanti',
			position: 'Anggota',
			nim: 'NPA.Dw 38010',
			group: 'divisi',
			division: 'Biro Perpustakaan',
			isFeatured: false,
			isActive: true,
			sortOrder: 73
		},
		{
			name: 'Ruqy tami ahmad',
			position: 'Anggota',
			nim: 'NPA.Dw 38011',
			group: 'divisi',
			division: 'Biro Perpustakaan',
			isFeatured: false,
			isActive: true,
			sortOrder: 74
		},

		// --- Bidang Sekretariatan ---
		{
			name: 'Bisgelita Simamora',
			position: 'Koordinator',
			nim: 'NPA.Dw 39006',
			group: 'divisi',
			division: 'Bidang Sekretariatan',
			isFeatured: true,
			isActive: true,
			sortOrder: 80,
			photo: photoMap.get('bisgelita simamora') ?? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=700&auto=format&fit=crop',
			description: 'Koordinator Bidang Sekretariatan',
			tupoksi: [
				'Mengoordinasikan urusan kesekretariatan organisasi.',
				'Mengelola inventaris dan fasilitas sekretariat.',
				'Membimbing anggota bidang dalam tugas administrasi.'
			].join('\n')
		},
		{
			name: 'Asrul',
			position: 'Anggota',
			nim: 'NPA.Dw 40009',
			group: 'divisi',
			division: 'Bidang Sekretariatan',
			isFeatured: false,
			isActive: true,
			sortOrder: 81
		},
		{
			name: 'M riswandi gunawan',
			position: 'Anggota',
			nim: 'NPA.Dw 35005',
			group: 'divisi',
			division: 'Bidang Sekretariatan',
			isFeatured: false,
			isActive: true,
			sortOrder: 82
		},
		{
			name: 'Rangga al wafi',
			position: 'Anggota',
			nim: 'NPA.Dw 37002',
			group: 'divisi',
			division: 'Bidang Sekretariatan',
			isFeatured: false,
			isActive: true,
			sortOrder: 83
		},
		{
			name: 'Deska mutmainah R',
			position: 'Anggota',
			nim: 'NPA.Dw 38012',
			group: 'divisi',
			division: 'Bidang Sekretariatan',
			isFeatured: false,
			isActive: true,
			sortOrder: 84
		},

		// --- Bidang PSDS ---
		{
			name: 'Dellila Calista Salsabila',
			position: 'Koordinator',
			nim: 'NPA.Dw 39012',
			group: 'divisi',
			division: 'Bidang PSDS',
			isFeatured: true,
			isActive: true,
			sortOrder: 90,
			photo: photoMap.get('dellila calista salsabila') ?? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=700&auto=format&fit=crop',
			description: 'Koordinator Bidang PSDS',
			tupoksi: [
				'Mengoordinasikan Pengembangan Sumber Daya Anggota.',
				'Merencanakan program pelatihan dan kaderisasi anggota.',
				'Mengevaluasi perkembangan keaktifan anggota.'
			].join('\n')
		},
		{
			name: 'Aula adriansyah',
			position: 'Anggota',
			nim: 'NPA.Dw 40001',
			group: 'divisi',
			division: 'Bidang PSDS',
			isFeatured: false,
			isActive: true,
			sortOrder: 91
		},
		{
			name: 'Qori\' Anggraeni S A',
			position: 'Anggota',
			nim: 'NPA.Dw 36017',
			group: 'divisi',
			division: 'Bidang PSDS',
			isFeatured: false,
			isActive: true,
			sortOrder: 92
		},
		{
			name: 'Samuel F D rajagukguk',
			position: 'Anggota',
			nim: 'NPA.Dw 38006',
			group: 'divisi',
			division: 'Bidang PSDS',
			isFeatured: false,
			isActive: true,
			sortOrder: 93
		}
	];

	console.log(`🚀 Inserting ${newMembers.length} new members...`);
	await db.insert(members).values(newMembers);

	console.log('✅ Database updated successfully!');
	await client.end();
}

main().catch((err) => {
	console.error('❌ Failed to update members:', err);
	client.end();
	process.exit(1);
});
