/**
 * Seed script — run with: npm run db:seed
 *
 * Note: this file is run via `tsx` outside SvelteKit, so it loads
 * environment variables itself instead of using $env/static/private.
 */
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import * as schema from './schema';
import { events, members, news, programs, users } from './schema';

const scrypt = promisify(scryptCb) as (
	password: string | Buffer,
	salt: string | Buffer,
	keylen: number,
	options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16);
	const N = 16384,
		r = 8,
		p = 1;
	const hash = await scrypt(password, salt, 64, { N, r, p, maxmem: 128 * 1024 * 1024 });
	return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

const client = await mysql.createConnection(DATABASE_URL);
const db = drizzle(client, { schema, mode: 'default' });

const programSeed: (typeof programs.$inferInsert)[] = [
	{
		tag: 'Akademik',
		title: 'Sains & Laboratorium',
		excerpt:
			'Pembelajaran berbasis eksperimen dengan laboratorium IPA modern untuk menumbuhkan rasa ingin tahu siswa.',
		image:
			'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1400&auto=format&fit=crop',
		post:
			'Program ini memberi ruang bagi siswa untuk menguji konsep IPA melalui praktik sederhana, pencatatan data, dan diskusi hasil percobaan. Kegiatan dibuat bertahap agar siswa berani bertanya, mencoba, lalu menyampaikan temuannya dengan bahasa yang rapi.',
		audience: 'Kelas VII sampai IX',
		schedule: 'Selasa, 15.00 sampai 16.30 WITA',
		location: 'Laboratorium IPA',
		mentor: 'Tim guru IPA',
		capacity: '24 siswa per siklus',
		contact: 'Wali kelas atau guru IPA',
		registration: 'Pendaftaran dibuka di awal semester melalui wali kelas.',
		highlights: 'Praktik eksperimen mingguan\nPencatatan data dan laporan singkat\nPersiapan lomba sains sekolah',
		outcomes:
			'Siswa memahami langkah kerja ilmiah\nSiswa mampu membaca hasil pengamatan\nSiswa menghasilkan laporan praktikum sederhana',
		activities: 'Eksperimen IPA\nDiskusi hasil pengamatan\nPresentasi mini\nKlinik persiapan lomba',
		requirements: 'Membawa buku catatan praktik\nMengikuti aturan keselamatan laboratorium'
	},
	{
		tag: 'Teknologi',
		title: 'Coding & Robotik',
		excerpt:
			'Kurikulum digital yang membekali siswa dengan keterampilan coding, robotika, dan literasi data.',
		image:
			'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
		post:
			'Kegiatan berfokus pada pemecahan masalah dengan perangkat sederhana. Siswa belajar membuat instruksi, menguji rangkaian, memperbaiki kesalahan, dan bekerja dalam tim kecil sampai prototipe dapat berjalan.',
		audience: 'Kelas VIII dan IX, terbuka untuk pemula',
		schedule: 'Kamis, 15.00 sampai 17.00 WITA',
		location: 'Lab Komputer',
		mentor: 'Pembina TIK dan mitra alumni',
		capacity: '20 siswa',
		contact: 'Pembina TIK',
		registration: 'Calon peserta mengikuti sesi pengenalan sebelum masuk kelompok rutin.',
		highlights: 'Dasar pemrograman visual\nRobot line follower\nProyek akhir per kelompok',
		outcomes:
			'Siswa memahami logika dasar pemrograman\nSiswa mampu merakit prototipe sederhana\nSiswa terbiasa menguji dan memperbaiki solusi',
		activities: 'Latihan coding\nPerakitan sensor\nUji lintasan robot\nReview proyek kelompok',
		requirements: 'Tidak wajib punya laptop pribadi\nBersedia bekerja berpasangan atau berkelompok'
	},
	{
		tag: 'Seni',
		title: 'Musik & Pertunjukan',
		excerpt: 'Wadah ekspresi melalui ansambel musik, paduan suara, dan pentas seni tahunan.',
		image:
			'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop',
		post:
			'Program seni memberi tempat bagi siswa untuk berlatih ekspresi, disiplin panggung, dan kerja kelompok. Latihan tidak hanya mengejar penampilan akhir, tetapi juga keberanian mendengar, menyesuaikan tempo, dan menghargai peran teman.',
		audience: 'Kelas VII sampai IX',
		schedule: 'Rabu, 15.00 sampai 16.30 WITA',
		location: 'Ruang Seni dan Aula',
		mentor: 'Pembina seni budaya',
		capacity: '30 siswa',
		contact: 'Guru Seni Budaya',
		registration: 'Peserta memilih minat vokal, instrumen, atau produksi panggung saat mendaftar.',
		highlights: 'Ansambel musik\nPaduan suara\nLatihan panggung untuk pentas sekolah',
		outcomes:
			'Siswa percaya diri tampil di depan publik\nSiswa memahami disiplin latihan bersama\nSiswa memiliki dokumentasi karya atau penampilan',
		activities: 'Latihan vokal\nLatihan instrumen\nBlocking panggung\nRekam dan evaluasi penampilan',
		requirements: 'Mengikuti jadwal latihan menjelang pentas\nMenjaga alat musik sekolah'
	},
	{
		tag: 'Olahraga',
		title: 'Pembinaan Atlet',
		excerpt:
			'Pelatihan terstruktur di basket, futsal, bulutangkis, dan kompetisi rutin antar sekolah.',
		image:
			'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop',
		post:
			'Pembinaan atlet menekankan kebugaran, teknik dasar, dan sikap sportif. Siswa ditempatkan sesuai minat cabang olahraga, lalu mengikuti latihan rutin dengan pemantauan sederhana agar perkembangan fisik dan kerja tim tetap sehat.',
		audience: 'Kelas VII sampai IX',
		schedule: 'Senin dan Jumat, 15.30 sampai 17.00 WITA',
		location: 'Lapangan dan aula olahraga',
		mentor: 'Pembina olahraga',
		capacity: 'Menyesuaikan cabang olahraga',
		contact: 'Guru PJOK',
		registration: 'Seleksi ringan dilakukan untuk cabang yang akan mengikuti kompetisi.',
		highlights: 'Latihan teknik dasar\nSparring antar kelas\nPersiapan kompetisi daerah',
		outcomes:
			'Siswa meningkatkan kebugaran dan koordinasi\nSiswa memahami sportivitas dalam pertandingan\nSiswa siap mengikuti agenda kompetisi sekolah',
		activities: 'Pemanasan dan conditioning\nLatihan teknik cabang\nSimulasi pertandingan\nEvaluasi kebugaran berkala',
		requirements: 'Membawa pakaian olahraga\nMengikuti arahan keselamatan latihan'
	},
	{
		tag: 'Karakter',
		title: 'Pramuka & Kepemimpinan',
		excerpt:
			'Pendidikan karakter terintegrasi: kemandirian, kerja sama, dan kepemimpinan siswa.',
		image:
			'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200&auto=format&fit=crop',
		post:
			'Pramuka menjadi ruang latihan tanggung jawab yang dekat dengan kehidupan sekolah. Siswa belajar memimpin kelompok kecil, menyelesaikan tugas lapangan, dan menjaga kebiasaan tertib dalam kegiatan bersama.',
		audience: 'Kelas VII sampai IX',
		schedule: 'Sabtu, 08.00 sampai 10.00 WITA',
		location: 'Lapangan sekolah',
		mentor: 'Pembina Pramuka',
		capacity: 'Terbuka untuk seluruh siswa',
		contact: 'Pembina Pramuka',
		registration: 'Peserta bergabung melalui gugus depan sekolah.',
		highlights: 'Latihan regu\nKeterampilan lapangan\nProyek layanan sekolah',
		outcomes:
			'Siswa terbiasa bekerja dalam regu\nSiswa berani mengambil peran kepemimpinan\nSiswa memahami tanggung jawab dalam kegiatan bersama',
		activities: 'Apel dan latihan baris\nMateri tali-temali\nSimulasi kepemimpinan regu\nKegiatan bakti lingkungan',
		requirements: 'Menggunakan atribut sesuai jadwal\nMenjaga kedisiplinan selama latihan'
	},
	{
		tag: 'Bahasa',
		title: 'Klub Bahasa Inggris',
		excerpt:
			'Praktik percakapan, debat, dan public speaking untuk membangun kepercayaan diri global.',
		image:
			'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop',
		post:
			'Klub Bahasa Inggris membantu siswa menggunakan bahasa secara aktif, bukan hanya menghafal materi. Sesi dibuat ringan dengan percakapan, permainan peran, dan latihan berbicara singkat agar siswa berani mencoba.',
		audience: 'Kelas VII sampai IX',
		schedule: 'Jumat, 14.30 sampai 16.00 WITA',
		location: 'Ruang Bahasa',
		mentor: 'Guru Bahasa Inggris',
		capacity: '25 siswa',
		contact: 'Guru Bahasa Inggris',
		registration: 'Pendaftaran dibuka tiap semester, pemula boleh bergabung.',
		highlights: 'Conversation circle\nStorytelling\nDebat ringan dan public speaking',
		outcomes:
			'Siswa lebih percaya diri berbicara\nSiswa memperluas kosakata sehari-hari\nSiswa mampu menyusun presentasi pendek',
		activities: 'Percakapan berpasangan\nRole play\nLatihan pidato singkat\nUmpan balik pelafalan',
		requirements: 'Membawa buku catatan kosakata\nBersedia aktif berbicara dalam sesi latihan'
	}
];

const newsSeed: (typeof news.$inferInsert)[] = [
	{
		category: 'Prestasi',
		date: '12 Mei 2026',
		title: 'Tim Robotik Raih Juara 2 Tingkat Provinsi',
		slug: 'tim-robotik-raih-juara-2-tingkat-provinsi',
		excerpt:
			'Lima siswa SMP 1 Anggana berhasil membawa pulang trofi setelah final ketat di Samarinda. Mereka mengalahkan 24 sekolah lainnya.',
		image:
			'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
		content:
			'<h2>Perjalanan menuju juara</h2><p>Tim <strong>Robotik SMP 1 Anggana</strong> mengikuti kompetisi tingkat provinsi yang berlangsung selama 3 hari di Samarinda. Tahun ini, mereka mempersiapkan robot line-follower yang lebih akurat dengan tambahan sensor IR.</p><blockquote><p>"Kami latihan tiap sore selama dua bulan terakhir." — Andi, kapten tim</p></blockquote><h3>Apa selanjutnya?</h3><ul><li>Persiapan untuk tingkat nasional di Jakarta</li><li>Rekrutmen anggota baru kelas VII</li><li>Workshop terbuka untuk siswa lain</li></ul><p>Selamat untuk para siswa hebat ini!</p>'
	},
	{
		category: 'Akademik',
		date: '8 Mei 2026',
		title: 'Kurikulum STEAM Diluncurkan Tahun Ini',
		slug: 'kurikulum-steam-diluncurkan-tahun-ini',
		excerpt:
			'Kurikulum baru memadukan Science, Technology, Engineering, Arts, dan Mathematics dengan proyek lintas mata pelajaran.',
		image:
			'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1400&auto=format&fit=crop',
		content: null
	},
	{
		category: 'Kegiatan',
		date: '4 Mei 2026',
		title: 'Bakti Sosial Siswa di Desa Sungai Mariam',
		slug: 'bakti-sosial-siswa-di-desa-sungai-mariam',
		excerpt:
			'Pengabdian masyarakat sebagai bagian dari pendidikan karakter, melibatkan 120 siswa kelas IX dalam tiga hari kegiatan.',
		image:
			'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop',
		content: null
	},
	{
		category: 'Olahraga',
		date: '28 Apr 2026',
		title: 'Tim Basket Sekolah Lolos ke Final Daerah',
		slug: 'tim-basket-sekolah-lolos-ke-final-daerah',
		excerpt:
			'Setelah semifinal yang dramatis melawan SMP 5 Tenggarong, tim putra sekolah memastikan tiket ke final tingkat kabupaten.',
		image:
			'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop',
		content: null
	},
	{
		category: 'Sekolah',
		date: '20 Apr 2026',
		title: 'Renovasi Lab Komputer Selesai Dilakukan',
		slug: 'renovasi-lab-komputer-selesai-dilakukan',
		excerpt:
			'Fasilitas baru dengan 36 unit komputer dan jaringan fiber optik siap digunakan untuk pembelajaran semester depan.',
		image:
			'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
		content: null
	}
];

const eventsSeed: (typeof events.$inferInsert)[] = [
	{
		date: '12 Jun 2026',
		dateDay: '12',
		dateMonth: 'Jun',
		title: 'Seminar Inovasi Pelajar Nasional',
		excerpt:
			'Menghadirkan tiga pembicara utama dari startup tech Indonesia. Terbuka untuk siswa dan orang tua di Aula Utama.',
		image:
			'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1400&auto=format&fit=crop',
		time: '08:00 WITA',
		location: 'Aula Utama'
	},
	{
		date: '8 Jul 2026',
		dateDay: '08',
		dateMonth: 'Jul',
		title: 'Pekan Olahraga Antar Kelas',
		excerpt:
			'Lima cabang olahraga dan lebih dari 200 peserta. Acara puncak akan ditutup dengan pertandingan eksibisi alumni.',
		image:
			'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1400&auto=format&fit=crop',
		time: '07:30 WITA',
		location: 'Lapangan Sekolah'
	},
	{
		date: '2 Agu 2026',
		dateDay: '02',
		dateMonth: 'Agu',
		title: 'Coding & Robotic Workshop',
		excerpt:
			'Workshop intensif tiga hari mengenalkan Arduino dan Python kepada siswa kelas VIII di Lab Komputer baru.',
		image:
			'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop',
		time: '09:00 WITA',
		location: 'Lab Komputer'
	},
	{
		date: '17 Agu 2026',
		dateDay: '17',
		dateMonth: 'Agu',
		title: 'Upacara HUT RI ke-81',
		excerpt:
			'Upacara bendera dan rangkaian lomba kemerdekaan sepanjang hari di halaman sekolah. Dimulai pukul 07:00 WITA.',
		image:
			'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1400&auto=format&fit=crop',
		time: '07:00 WITA',
		location: 'Halaman Sekolah'
	},
	{
		date: '25 Sep 2026',
		dateDay: '25',
		dateMonth: 'Sep',
		title: 'Pentas Seni Tahunan',
		excerpt:
			'Penampilan dari klub musik, tari tradisional, paduan suara, dan teater siswa di Aula Utama. Tiket gratis untuk wali murid.',
		image:
			'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1400&auto=format&fit=crop',
		time: '19:00 WITA',
		location: 'Aula Utama'
	}
];

async function main() {
	console.log('🌱 Seeding database...');

	// Clear existing rows so the seed is idempotent during development
	await db.delete(events);
	await db.delete(news);
	await db.delete(programs);

	await db.insert(programs).values(programSeed);
	await db.insert(news).values(newsSeed);
	await db.insert(events).values(eventsSeed);

	console.log(
		`✅ Done. Inserted ${programSeed.length} programs, ${newsSeed.length} news, ${eventsSeed.length} events.`
	);

	// --- Bootstrap admin user (idempotent) ---
	const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
	const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
	const adminName = process.env.BOOTSTRAP_ADMIN_NAME ?? 'Administrator';

	if (adminEmail && adminPassword) {
		const normalizedEmail = adminEmail.trim().toLowerCase();
		const existing = await db
			.select()
			.from(users)
			.where(eq(users.email, normalizedEmail))
			.limit(1);
		if (existing.length > 0) {
			console.log(`👤 Admin user already exists: ${normalizedEmail}`);
		} else {
			if (adminPassword.length < 12) {
				console.warn(
					'⚠️  BOOTSTRAP_ADMIN_PASSWORD is shorter than 12 chars — choose something stronger for production.'
				);
			}
			const passwordHash = await hashPassword(adminPassword);
			const [result] = await db
				.insert(users)
				.values({
					email: normalizedEmail,
					name: adminName.trim(),
					passwordHash,
					role: 'admin'
				});
			console.log(`👤 Admin user created: ${normalizedEmail} (id=${result.insertId})`);
		}
	} else {
		console.log(
			'ℹ️  Skipped admin bootstrap (set BOOTSTRAP_ADMIN_EMAIL + BOOTSTRAP_ADMIN_PASSWORD).'
		);
	}

	// --- Seed struktur organisasi (members) — only if table is empty ---
	const existingMembers = await db.select().from(members).limit(1);
	if (existingMembers.length === 0) {
		const memberSeed: (typeof members.$inferInsert)[] = [
			// --- Pengurus Inti ---
			{
				name: 'Zidan Ata Mawla',
				position: 'Ketua Umum',
				nim: 'NPA.Dw 39002',
				group: 'pengurus',
				isFeatured: true,
				isActive: true,
				sortOrder: 20,
				photo: '/uploads/baab86fd514d602201b73017dd5dee1965866ad437d3288348977b5ae7469863.png',
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
				photo: '/uploads/8d83d9b5f80d375e287eb66a5385bf69524ee89a1b8d32f32df28b2111967235.png',
				description: 'Pendamping ketua',
				tupoksi: [
					'Mendampingi dan membantu ketua dalam menjalankan tugas organisasi.',
					'Menggantikan peran ketua apabila berhalangan hadir.',
					'Mengawasi pelaksanaan program kerja tiap divisi.'
				].join('\n')
			},
			{
				name: 'Ekrin Hagana Br Sembiring',
				position: 'Sekretaris',
				nim: 'NPA.Dw 40003',
				group: 'pengurus',
				isFeatured: true,
				isActive: true,
				sortOrder: 22,
				photo: '/uploads/9e0b5f003f99d2d644abbca75c94ef64257505d2f7b008e2350415066238de35.webp',
				description: 'Administrasi & surat',
				tupoksi: [
					'Mengelola seluruh administrasi dan surat-menyurat organisasi.',
					'Menyusun notulen rapat dan mendokumentasikan kegiatan.',
					'Mengarsipkan dokumen penting organisasi secara rapi.'
				].join('\n')
			},
			{
				name: 'Debora Regina Rumagit',
				position: 'Sekretaris',
				nim: 'NPA.Dw 39010',
				group: 'pengurus',
				isFeatured: true,
				isActive: true,
				sortOrder: 23,
				photo: '/uploads/84e8cb5e73e7cef15e52b06d343634c5b811e4cd73804af351d2a5d00c7f6f6a.jpg',
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
				photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=700&auto=format&fit=crop',
				description: 'Koordinator Divisi Flora',
				tupoksi: [
					'Memimpin dan mengoordinasikan kegiatan Divisi Flora.',
					'Merencanakan program pelestarian and pendataan tumbuhan.',
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

			// --- Divisi Fauna ---
			{
				name: 'Damar Wira Yodiya',
				position: 'Koordinator',
				nim: 'NPA.Dw 39005',
				group: 'divisi',
				division: 'Divisi Fauna',
				isFeatured: true,
				isActive: true,
				sortOrder: 40,
				photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=700&auto=format&fit=crop',
				description: 'Koordinator Divisi Fauna',
				tupoksi: [
					'Memimpin dan mengoordinasikan kegiatan Divisi Fauna.',
					'Merencanakan program pelestarian and pendataan satwa.',
					'Membimbing anggota divisi dalam kegiatan lapangan.'
				].join('\n')
			},
			{
				name: 'Robiana mochdar',
				position: 'Anggota',
				nim: 'NPA.Dw 40002',
				group: 'divisi',
				division: 'Divisi Fauna',
				isFeatured: false,
				isActive: true,
				sortOrder: 41
			},
			{
				name: 'Dea mukaromah',
				position: 'Anggota',
				nim: 'NPA.Dw 36006',
				group: 'divisi',
				division: 'Divisi Fauna',
				isFeatured: false,
				isActive: true,
				sortOrder: 42
			},
			{
				name: 'Ahmad baihaki',
				position: 'Anggota',
				nim: 'NPA.Dw 37009',
				group: 'divisi',
				division: 'Divisi Fauna',
				isFeatured: false,
				isActive: true,
				sortOrder: 43
			},
			{
				name: 'Oktavianus vionjar',
				position: 'Anggota',
				nim: 'NPA.Dw 37006',
				group: 'divisi',
				division: 'Divisi Fauna',
				isFeatured: false,
				isActive: true,
				sortOrder: 44
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
				sortOrder: 50,
				photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=700&auto=format&fit=crop',
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
				sortOrder: 51
			},
			{
				name: 'Aron',
				position: 'Anggota',
				nim: 'NPA.Dw 38004',
				group: 'divisi',
				division: 'Divisi Olpet',
				isFeatured: false,
				isActive: true,
				sortOrder: 52
			},
			{
				name: 'Heldi pratama',
				position: 'Anggota',
				nim: 'NPA.Dw 37003',
				group: 'divisi',
				division: 'Divisi Olpet',
				isFeatured: false,
				isActive: true,
				sortOrder: 53
			},
			{
				name: 'Yanri Amos tamba',
				position: 'Anggota',
				nim: 'NPA.Dw 38014',
				group: 'divisi',
				division: 'Divisi Olpet',
				isFeatured: false,
				isActive: true,
				sortOrder: 54
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
				sortOrder: 60,
				photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=700&auto=format&fit=crop',
				description: 'Koordinator Divisi Lingkungan Hidup',
				tupoksi: [
					'Memimpin dan mengoordinasikan kegiatan Divisi Lingkungan Hidup.',
					'Merencanakan program aksi lingkungan and kampanye.',
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
				sortOrder: 61
			},
			{
				name: 'Intan Nur Laila',
				position: 'Anggota',
				nim: 'NPA.Dw 40004',
				group: 'divisi',
				division: 'Divisi Lingkungan Hidup',
				isFeatured: false,
				isActive: true,
				sortOrder: 62
			},
			{
				name: 'Tsani maulana Abdillah',
				position: 'Anggota',
				nim: 'NPA.Dw 38008',
				group: 'divisi',
				division: 'Divisi Lingkungan Hidup',
				isFeatured: false,
				isActive: true,
				sortOrder: 63
			},
			{
				name: 'Regina Theresia sembiring',
				position: 'Anggota',
				nim: 'NPA.Dw 38009',
				group: 'divisi',
				division: 'Divisi Lingkungan Hidup',
				isFeatured: false,
				isActive: true,
				sortOrder: 64
			},

			// --- Biro Humas ---
			{
				name: 'Fauzhil Adhim',
				position: 'Koordinator',
				nim: 'NPA.Dw 39001',
				group: 'divisi',
				division: 'Biro Humas',
				isFeatured: true,
				isActive: true,
				sortOrder: 70,
				photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=700&auto=format&fit=crop',
				description: 'Koordinator Biro Humas',
				tupoksi: [
					'Memimpin dan mengoordinasikan kegiatan Biro Humas.',
					'Menghubungkan organisasi dengan pihak eksternal.',
					'Mengelola publikasi dan hubungan masyarakat.'
				].join('\n')
			},
			{
				name: 'Nabila Fauziyah',
				position: 'Anggota',
				nim: 'NPA.Dw 40007',
				group: 'divisi',
				division: 'Biro Humas',
				isFeatured: false,
				isActive: true,
				sortOrder: 71
			},
			{
				name: 'Mayada',
				position: 'Anggota',
				nim: 'NPA.Dw 40010',
				group: 'divisi',
				division: 'Biro Humas',
				isFeatured: false,
				isActive: true,
				sortOrder: 72
			},
			{
				name: 'Nisa aulia rochmat',
				position: 'Anggota',
				nim: 'NPA.Dw 38007',
				group: 'divisi',
				division: 'Biro Humas',
				isFeatured: false,
				isActive: true,
				sortOrder: 73
			},
			{
				name: 'Siraj ramadhan',
				position: 'Anggota',
				nim: 'NPA.Dw 36010',
				group: 'divisi',
				division: 'Biro Humas',
				isFeatured: false,
				isActive: true,
				sortOrder: 74
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
				sortOrder: 80,
				photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=700&auto=format&fit=crop',
				description: 'Koordinator Biro Bud',
				tupoksi: [
					'Memimpin dan mengoordinasikan kegiatan Biro Bud.',
					'Merencanakan program terkait budaya, seni, and kreativitas.',
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
				sortOrder: 81
			},
			{
				name: 'Sopian exsel',
				position: 'Anggota',
				nim: 'NPA.Dw 38003',
				group: 'divisi',
				division: 'Biro Bud',
				isFeatured: false,
				isActive: true,
				sortOrder: 82
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
				sortOrder: 90,
				photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=700&auto=format&fit=crop',
				description: 'Koordinator Biro Perpustakaan',
				tupoksi: [
					'Memimpin dan mengoordinasikan kegiatan Biro Perpustakaan.',
					'Mengelola perpustakaan and buku rujukan organisasi.',
					'Merencanakan program literasi and diskusi buku.'
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
				sortOrder: 91
			},
			{
				name: 'Dea nopita',
				position: 'Anggota',
				nim: 'NPA.Dw 39011',
				group: 'divisi',
				division: 'Biro Perpustakaan',
				isFeatured: false,
				isActive: true,
				sortOrder: 92
			},
			{
				name: 'Ni ketut rini wiryanti',
				position: 'Anggota',
				nim: 'NPA.Dw 38010',
				group: 'divisi',
				division: 'Biro Perpustakaan',
				isFeatured: false,
				isActive: true,
				sortOrder: 93
			},
			{
				name: 'Ruqy tami ahmad',
				position: 'Anggota',
				nim: 'NPA.Dw 38011',
				group: 'divisi',
				division: 'Biro Perpustakaan',
				isFeatured: false,
				isActive: true,
				sortOrder: 94
			},

			// --- Bidang Perlengkapan ---
			{
				name: 'Muhammad Shafa Al-Asrar',
				position: 'Koordinator',
				nim: 'NPA.Dw 38001',
				group: 'divisi',
				division: 'Bidang Perlengkapan',
				isFeatured: true,
				isActive: true,
				sortOrder: 100,
				photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=700&auto=format&fit=crop',
				description: 'Koordinator Bidang Perlengkapan',
				tupoksi: [
					'Memimpin dan mengoordinasikan kegiatan Bidang Perlengkapan.',
					'Mengelola logistik dan perlengkapan organisasi.',
					'Mendukung logistik setiap program kerja.'
				].join('\n')
			},
			{
				name: 'Sandi M silitong',
				position: 'Anggota',
				nim: 'NPA.Dw 40005',
				group: 'divisi',
				division: 'Bidang Perlengkapan',
				isFeatured: false,
				isActive: true,
				sortOrder: 101
			},
			{
				name: 'Rey putra berutu',
				position: 'Anggota',
				nim: 'NPA.Dw 37011',
				group: 'divisi',
				division: 'Bidang Perlengkapan',
				isFeatured: false,
				isActive: true,
				sortOrder: 102
			},
			{
				name: 'Megita Vivaldy T',
				position: 'Anggota',
				nim: 'NPA.Dw 35008',
				group: 'divisi',
				division: 'Bidang Perlengkapan',
				isFeatured: false,
				isActive: true,
				sortOrder: 103
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
				sortOrder: 110,
				photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=700&auto=format&fit=crop',
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
				sortOrder: 111
			},
			{
				name: 'M riswandi gunawan',
				position: 'Anggota',
				nim: 'NPA.Dw 35005',
				group: 'divisi',
				division: 'Bidang Sekretariatan',
				isFeatured: false,
				isActive: true,
				sortOrder: 112
			},
			{
				name: 'Rangga al wafi',
				position: 'Anggota',
				nim: 'NPA.Dw 37002',
				group: 'divisi',
				division: 'Bidang Sekretariatan',
				isFeatured: false,
				isActive: true,
				sortOrder: 113
			},
			{
				name: 'Deska mutmainah R',
				position: 'Anggota',
				nim: 'NPA.Dw 38012',
				group: 'divisi',
				division: 'Bidang Sekretariatan',
				isFeatured: false,
				isActive: true,
				sortOrder: 114
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
				sortOrder: 120,
				photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=700&auto=format&fit=crop',
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
				sortOrder: 121
			},
			{
				name: 'Qori\' Anggraeni S A',
				position: 'Anggota',
				nim: 'NPA.Dw 36017',
				group: 'divisi',
				division: 'Bidang PSDS',
				isFeatured: false,
				isActive: true,
				sortOrder: 122
			},
			{
				name: 'Samuel F D rajagukguk',
				position: 'Anggota',
				nim: 'NPA.Dw 38006',
				group: 'divisi',
				division: 'Bidang PSDS',
				isFeatured: false,
				isActive: true,
				sortOrder: 123
			}
		];
		await db.insert(members).values(memberSeed);
		console.log(`👥 Inserted ${memberSeed.length} members (struktur organisasi).`);
	} else {
		console.log('👥 Members already exist — skipped struktur organisasi seed.');
	}

	await client.end();
}

main().catch(async (err) => {
	console.error('❌ Seed failed:', err);
	await client.end();
	process.exit(1);
});
