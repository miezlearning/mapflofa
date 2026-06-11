/**
 * Seed script — run with: npm run db:seed
 *
 * Note: this file is run via `tsx` outside SvelteKit, so it loads
 * environment variables itself instead of using $env/static/private.
 */
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import * as schema from './schema';
import { events, news, programs, users } from './schema';

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

const client = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema });

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
			const [created] = await db
				.insert(users)
				.values({
					email: normalizedEmail,
					name: adminName.trim(),
					passwordHash,
					role: 'admin'
				})
				.returning();
			console.log(`👤 Admin user created: ${created.email} (id=${created.id})`);
		}
	} else {
		console.log(
			'ℹ️  Skipped admin bootstrap (set BOOTSTRAP_ADMIN_EMAIL + BOOTSTRAP_ADMIN_PASSWORD).'
		);
	}

	await client.end();
}

main().catch(async (err) => {
	console.error('❌ Seed failed:', err);
	await client.end();
	process.exit(1);
});
