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
	'profile.header_label': { label: 'Header — Label', value: 'PROFIL MAPFLOFA' },
	'profile.header_title': { label: 'Header — Judul', value: 'MAHASISWA PENYAYANG FLORA FAUNA' },
	'profile.header_desc': {
		label: 'Header — Deskripsi',
		value:
			'Mahasiswa Penyayang Flora Fauna (MAPFLOFA) adalah sebuah organisasi kemahasiswaan yang terdapat didalam kampus FAHUTAN UNMUL yang berkecimpung dalam kepecintaalaman khususnya penelitian dan pengembangan bidang flora, fauna dan lingkungan hidup. Berazazkan pada kelestarian flora dan fauna tersebut.'
	},
	'profile.visi': {
		label: 'Visi',
		value:
			'Terwujud nya mahasiswa Fakultas Kehutanan Universitas Mulawarman yang berdimensikan masyarakat dan lingkungan hidup'
	},
	'profile.misi': {
		label: 'Misi (satu poin per baris)',
		value: [
			'Meningkatkan kepedulian terhadap flora fauna',
			'Meningkatkan usaha konservasi keanekaragaman hayati',
			'Mendukung usaha pemberdayaan masyarakat dalam rangka pelestarian flora fauna',
			'Menggalang dukungan terhadap program-program Kegiatan MAPFLOFA FAHUTAN UNMUL'
		].join('\n')
	},
	'profile.sejarah': {
		label: 'Sejarah (satu paragraf per baris)',
		value: [
			'MAPFLOFA didirikan pada tanggal 10 November 1984 di kampus FAHUTAN UNMUL Gunung Lingai, Samarinda, Kalimantan timur.',
			'Mahasiswa Penyayang Flora Fauna (MAPFLOFA) adalah sebuah organisasi kemahasiswaan yang terdapat didalam kampus FAHUTAN UNMUL yang berkecimpung dalam kepecintaalaman khususnya penelitian dan pengembangan bidang flora, fauna dan lingkungan hidup. Berazazkan pada kelestarian flora dan fauna tersebut.'
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
	'profile.tujuan': {
		label: 'Tujuan',
		value: 'Sebagai wadah berkumpulnya mahasiswa Fakultas Kehutanan Universitas Mulawarman yang kritis dan peduli terhadap fenomena lingkungan yang terjadi. Melestarikan keberadaan flora fauna yang merupakan bagian dari lingkungan hidup.'
	},
	'profile.lambang_makna': {
		label: 'Makna Lambang (format: nama|makna per baris)',
		value: [
			'Burung Pergam Raja (Ducula whartoni)|Terbang di atas sungai Mahakam dengan kepala menunduk ke bawah yang berada dalam satu lingkaran penuh.',
			'Tiga Garis|Melambangkan Daerah Aliran Sungai (DAS) Mahakam.',
			'Lingkaran|Melambangkan persatuan dan kesatuan seluruh anggota MAPFLOFA.'
		].join('\n')
	},
	'profile.kegiatan_list': {
		label: 'Kegiatan yang Dilaksanakan (format: tahun|deskripsi per baris)',
		value: [
			'2000|Mengikuti Konferensi Nasional Pengelolaan Sumber daya Alam, Hotel indonesia (22-25 Mei 2000)',
			'2000|Menghadiri Peringatan Puncak Pekan Penghijauan Nasional di Palangkaraya (Pencinta Alam terbaik Kaltim, 24-28 Oktober 2000)',
			'2000|Mengadakan Diskusi Panel Strategi Enclave Taman Nasional Kutai',
			'2001|Pengamatan Burung di Alam (27-28 Agustus 2001, Malang)',
			'2001|Lintas Taman Nasional dan kawasan konservasi se Kalimantan, Jawa, Bali dan Sumatera',
			'2001|Penelitian Pesut Mahakam (1998-2001)',
			'2001|Penelitian Beruang Madu di Hutan Lindung Sungai Wain Balikpapan (2000-2001)',
			'2001|Inventarisasi partisipatif tumbuhan obat hutan (IPTOH) I dan II serta fasilitas tumbuhan obat hutan (FATUMOTAN)',
			'2001|Eksplorasi Tumbuhan Obat Hutan',
			'2001|Penyusuran sungai Karang Mumus (Kualitas air dan Permasalahan lingkungan hidup)',
			'2001|Kampanye Konservasi Pesut Mahakam',
			'2001|Aksi Cinta Lingkungan I, II dan III (1997, 1999, dan 2001)',
			'2001|Ekspedisi Komodo',
			'2001|Studi Komplikasi Penyu laut di Pulau Derawan dan TN Sukamade Jatim',
			'2002|Ekspedisi Gajah Sumatera TN Way Kambas Lampung (2002)',
			'2002|Studi Orientasi Monyet merah dan Bekantan',
			'2002|Studi Eksplorasi Taman Laut Buneken (Agustus 2002)',
			'2003|Lomba Pengamatan Burung "Bird race" Malang, Yogyakarta (2003)',
			'2003|ACIL (Aksi Cinta Lingkungan) dan LLA (Lomba Lintas Alam) IV (2003)',
			'2004|Lomba Gambar tingkat TK dan SD se Kalimantan Timur (Lustrum IV MAPFLOFA, 2004)',
			'2004|Lomba Pengamatan Burung (Bird Watching) dan meniru suara satwa di KRUS (Kebun Raya Unmul Samarinda) (Lustrum IV, 2004)',
			'2005|Buka puasa bersama Anjal (Anak Jalanan) menyambut bulan suci Ramadhan (2005)',
			'2005|ACIL (Aksi Cinta Lingkungan) dan LLA (Lomba Lintas Alam) V (2005)',
			'2005|Studi Komparasi Penyu Laut di Pulau Derawan dan Bali (Desember 2005)',
			'2006|Camping Lingkungan, kerjasama MAPFLOFA dengan JPL (Jaringan Pendidik Lingkungan Hidup) Kaltim (18-19 Februari 2006)',
			'2006|Bedah Buku Orang Utan, kerjasama dengan berbagai LSM dan instansi pemerintah dimotori BEBSIC (Juni 2006)',
			'2006|Ekspedisi Goa Sulawesi Selatan (September 2006)',
			'2006|Ekspedisi Kupu-kupu Sulawesi Selatan (September 2006)',
			'2006|Ekspedisi Burung di Pulau Derawan, Sangkalaki, Kakaban, Samama dan Maratua, Berau (September 2006)',
			'2006|Pelatihan Jurnalistik Lingkungan "Dengan Pena Aku Ubah Dunia" MAPFLOFA (Oktober 2006)',
			'2007|Kegiatan Aksi Cinta Lingkungan VI (Januari 2007)',
			'2007|Reuni Akbar MAPFLOFA (November 2007)',
			'2007|Lomba Karya Tulis Ilmiah Lingkungan Hidup bekerjasama dengan BAPEDALDA (November 2007)',
			'2007|Kegiatan pembuatan kompos dengan memanfaatkan limbah kampus (2007)',
			'2008|Camping Lingkungan "Lestarikan Alam Bukan Celote Belaka" MAPFLOFA (Hari Bumi, April 2008)',
			'2008|Pelatihan pembuatan bubur kertas untuk didaur ulang kembali (2008)',
			'2008|Buka puasa bersama anak jalanan (September 2008)',
			'2008|Bakti sosial ke panti asuhan (September 2008)',
			'2008|Lomba Karya Tulis Ilmiah Lingkungan hidup tingkat SMU/sederajat se-Kaltim (November 2008)',
			'2008|Aksi Cinta Lingkungan VII MAPFLOFA (Desember 2008)',
			'2009|Lomba Samping Lingkungan dan pelatihan pupuk kompos tingkat SMA se-Kaltim, kerjasama GTZ (Lustrum V, 2009)',
			'2009|Pawai Sepeda, Rangkaian Lustrum V MAPFLOFA Fahutan Unmul (2009)',
			'2009|Lomba Lintas Alam (LLA) se-Kalimantan Timur (Lustrum V, 2009)',
			'2009|Lomba Karya Tulis Ilmiah Lingkungan Hidup tingkat SMU/sederajat se-Kaltim (Lustrum V, 2009)',
			'2010|Ekspedisi Medan (Tahun 2010)',
			'2010|Penanaman 10-10-10 dalam upaya Meminimalisir dampak perubahan iklim di 10 Negara (Tahun 2010)',
			'2010|Lomba Lintas Alam (LLA) Rangkaian ACIL VIII Mapflofa Fahutan Unmul (2010)',
			'2010|Lomba karya Tulis Ilmiah Memperingati hari Cinta Puspa dan Satwa tingkat SMU/sederajat se-Kaltim (ACIL VIII, 2010)',
			'2011|Mengadakan Workshop Raptor Of Borneo "Membangun Kemitraan Dalam Upaya Konservasi Raptor di Kalimantan" (2011)',
			'2011|Buka puasa dan Bakti sosial bersama Anak Jalanan (2011)',
			'2011|11-11-11 One Man Eleven Fish For Sungai Karang Mumus "Sungai Beranda Kehidupan" (ACIL IX, 2011)',
			'2011|Kemah Lingkungan Tingkat SMA sederajat se-Kalimantan Timur (2011)',
			'2011|Lomba karya Tulis Ilmiah Memperingati hari Cinta Puspa dan Satwa tingkat SMU/sederajat se-Kaltim (ACIL IX, 2011)',
			'2011|Lomba Lintas Alam (LLA) Rangkaian ACIL IX Mapflofa Fahutan Unmul (2011)',
			'2012|Lomba karya Tulis Ilmiah Memperingati hari Cinta Puspa dan Satwa tingkat SMU/sederajat se-Kaltim (2012)',
			'2012|Seminar Keanekaragaman Hayati di Kalimantan Timur (2012)',
			'2012|Give and Run satu pengantin dua belas pohon (12-12-12)',
			'2012|Green Campus dalam rangkaian HUT Mapflofa di Fahutan Unmul (2012)',
			'2013|Ekspedisi Gunung Semeru-Bromo monitoring moratorium hutan primer bersama PT Sinar Mas (2013)',
			'2013|BANSOS, membersihkan sampah bersama SD 034 dan SMK Kesehatan di sekitar Jl. Perjuangan dan Pramuka (2013)',
			'2013|Aksi damai bersama KPA dan pemerhati lingkungan dalam peringatan hari bumi (2013)',
			'2013|Monitoring Teluk Balikpapan bersama Mr. Stan Lotha dan Mahasiswa Singapore (2013)',
			'2013|Kemah Lingkungan dan Pengkaderan anggota konservasi kerjasama BKSDA Kaltim (2013)',
			'2013|Kemah Lingkungan Tingkat SMA sederajat dalam rangka Aksi Cinta Lingkungan (ACIL) se-Samarinda (2013)',
			'2022|Pelatihan Jurnalistik dalam rangkaian HUT MAPFLOFA (2022)',
			'2022|Aksi Cinta Lingkungan VIII (2022)',
			'2022|Education Camp kerjasama dengan Biodiversity Warriors (2022)',
			'2023|Aksi Cinta Lingkungan IX (2023)',
			'2024|Seminar Badak (2024)',
			'2024|Lomba mewarnai tingkat TK dan SD (2024)',
			'2024|Workshop Herbarium (2024)',
			'2024|EXPO 4 Ekosistem (2024)'
		].join('\n')
	},
	'profile.penghargaan_list': {
		label: 'Penghargaan yang Diperoleh (format: tahun|deskripsi per baris)',
		value: [
			'1996|Juara II Lomba Karya Tulis Flora – Fauna Hari Cinta Puspa & Satwa Tingkat Kab. Pasir (1996)',
			'1998|Kelompok Pencinta Alam Terbaik Kalimantan Timur 1998 sekaligus memperoleh predikat Pencinta Alam Tingkat Nasional (Penghargaan dari Gubernur Kaltim, Dirjen PKA dan Menhutbun RI) (1998)',
			'2000|Kelompok Pencinta Alam Terbaik Kalimantan Timur 2000 sekaligus memperoleh predikat Pencinta Alam Tingkat Nasional (Penghargaan dari Pusat Bina Penyuluhan Kehutanan dan Mentri Muda Kehutanan RI) (2000)',
			'2001|Juara III Kelompok Pencinta Alam Terbaik se-Indonesia (Penghargaan dari Mentri Kehutanan RI) (2001)',
			'2002|Juara II Kuesioner Tentang Lingkungan Hidup memperingati Hari Bumi dan Lingkungan Hidup (2002)',
			'2003|Penghargaan dari Direktur Jenderal Perlindungan Hutan Pelestarian Alam sebagai peringkat III Pencinta Alam Terbaik se-Indonesia (2003)',
			'2008|Kelompok Pencinta Alam Terbaik Kalimantan Timur (Penghargaan dari Pusat Bina Penyuluhan Kehutanan dan Mentri Muda Kehutanan RI) (2008)',
			'2008|Penghargaan dari Direktorat Jenderal Perlindungan Hutan dan Konservasi Alam atas partisipasi MAPFLOFA dalam Upaya Penghijauan dan Konservasi Alam (2008)',
			'2010|Kelompok Pencinta Alam Terbaik Kalimantan Timur (Penghargaan dari Pusat Bina Penyuluhan Kehutanan dan Mentri Muda Kehutanan RI) (2010)',
			'2011|Juara Harapan III Kelompok Pencinta Alam Terbaik Se-Indonesia (2011)',
			'2013|Juara II Turnamen Futsal antar KPA se-Samarinda (2013)',
			'2013|Kelompok Pencinta Alam Terbaik Kalimantan Timur (Penghargaan dari Pusat Bina Penyuluhan Kehutanan dan Mentri Muda Kehutanan RI) (2013)',
			'2014|Juara I Sayembara Prakasa Masyarakat dalam Penataan Ruang (Bidang Penataan Ruang Dinas PU Provinsi Kalimantan Timur) (2014)',
			'2019|Sylva Award Winner UKMF Terfavorit (2019)',
			'2019|Sylva Award Winner Ketua UKMF Terfavorit (2019)',
			'2019|Sylva Award Winner Departemen Kaderisasi dan Pengembangan SDM UKMF Terfavorit (2019)',
			'2019|Sylva Award Winner Bendahara UKMF Terfavorit (2019)',
			'2019|Sylva Award Winner Aktivis Terfavorit (2019)',
			'2021|Juara I dan II Dalam Program Sponsorship Biodiversity Warrior Kalimantan (2021)',
			'2022|Juara 1 Lomba Wana Lestari Tingkat Provinsi (2022)',
			'2022|Juara III Lomba Lintas Alam SEMERU 2 dari MAPALA MAHAMERU POLNES (2022)'
		].join('\n')
	},
	'contact.address': { label: 'Alamat', value: 'Jln. Penajam Kampus Gunung Kelua FAHUTAN UNMUL, Samarinda, Kalimantan timur 75123' },
	'contact.whatsapp': { label: 'WhatsApp', value: '0813-1262-0425' },
	'contact.instagram': { label: 'Instagram', value: 'mapflofafahutan' },
	'contact.email': { label: 'Email', value: 'mpff.fahutan@gmail.com' },
	'contact.extra': {
		label: 'Kontak tambahan (satu per baris, format: label|value)',
		value: [
			'Facebook|Mapflofa Fahutan unmul',
			'YouTube|MAPFLOFA FAHUTAN Universitas Mulawarman'
		].join('\n')
	},
	'contact.socials': {
		label: 'Link sosial media (satu per baris, format: platform|url)',
		value: [
			'Instagram|https://instagram.com/mapflofafahutan',
			'Facebook|https://www.facebook.com/profile.php?id=100008453443187',
			'YouTube|https://youtube.com',
			'Email|mailto:mpff.fahutan@gmail.com'
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
			.onDuplicateKeyUpdate({
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
		const [result] = await db.insert(members).values(input);
		return db
			.select()
			.from(members)
			.where(eq(members.id, result.insertId))
			.limit(1)
			.then((rows) => rows[0]);
	},

	async updateMember(id: number, input: UpdateMemberInput) {
		await db
			.update(members)
			.set(input)
			.where(eq(members.id, id));
		return db
			.select()
			.from(members)
			.where(eq(members.id, id))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	async removeMember(id: number) {
		await db
			.delete(members)
			.where(eq(members.id, id));
		return { id };
	}
};
