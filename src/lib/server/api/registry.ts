/**
 * API registry — the single source of truth for what endpoints exist,
 * what they expect, and what they return.
 *
 * Both the human-readable docs (/docs) and the machine-readable spec
 * (/api/docs) are rendered from this object, so adding or changing an
 * endpoint here updates both surfaces at once.
 *
 * Translatable strings are { id, en } pairs.
 */

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/** Bilingual string. `id` (Bahasa Indonesia) and `en` (English). */
export type LocalizedText = { id: string; en: string };

export type FieldDoc = {
	name: string;
	type: string;
	required?: boolean;
	description: LocalizedText;
};

export type EndpointDoc = {
	id: string;
	method: HttpMethod;
	path: string;
	summary: LocalizedText;
	description?: LocalizedText;
	auth: 'public' | 'admin';
	rateLimit: { limit: number; windowSec: number };
	pathParams?: FieldDoc[];
	queryParams?: FieldDoc[];
	requestBody?: FieldDoc[];
	responseExample?: unknown;
};

export type ResourceDoc = {
	slug: string;
	label: LocalizedText;
	description: LocalizedText;
	endpoints: EndpointDoc[];
};

const READ_LIMIT = { limit: 120, windowSec: 60 };
const READ_ONE_LIMIT = { limit: 240, windowSec: 60 };
const WRITE_LIMIT = { limit: 20, windowSec: 60 };

// -----------------------------------------------------------------------
// programs
// -----------------------------------------------------------------------
const programs: ResourceDoc = {
	slug: 'programs',
	label: { id: 'Programs', en: 'Programs' },
	description: {
		id: 'Daftar program akademik & ekstrakurikuler sekolah.',
		en: 'List of academic and extracurricular programs offered by the school.'
	},
	endpoints: [
		{
			id: 'list-programs',
			method: 'GET',
			path: '/api/programs',
			summary: { id: 'List programs', en: 'List programs' },
			description: {
				id: 'Mengambil daftar program dengan pagination dan filter opsional.',
				en: 'Fetch a paginated list of programs with optional filters.'
			},
			auth: 'public',
			rateLimit: READ_LIMIT,
			queryParams: [
				{
					name: 'limit',
					type: 'integer (1–100)',
					description: { id: 'Jumlah item per halaman. Default 20.', en: 'Items per page. Default 20.' }
				},
				{
					name: 'offset',
					type: 'integer ≥ 0',
					description: { id: 'Offset pagination. Default 0.', en: 'Pagination offset. Default 0.' }
				},
				{
					name: 'tag',
					type: 'string',
					description: {
						id: 'Filter exact-match berdasarkan tag.',
						en: 'Exact-match filter by tag.'
					}
				},
				{
					name: 'q',
					type: 'string',
					description: {
						id: 'Pencarian case-insensitive di title + excerpt.',
						en: 'Case-insensitive search across title + excerpt.'
					}
				}
			],
			responseExample: {
				ok: true,
				data: {
					items: [
						{
							id: 1,
							title: 'Sains & Laboratorium',
							tag: 'Akademik',
							excerpt: 'Pembelajaran berbasis eksperimen ...',
							image: 'https://example.com/img.jpg',
							post: null,
							audience: 'Kelas VII sampai IX',
							schedule: 'Selasa, 15.00 sampai 16.30 WITA',
							location: 'Laboratorium IPA',
							mentor: 'Tim guru IPA',
							capacity: '24 siswa per siklus',
							contact: 'Wali kelas atau guru IPA',
							registration: 'Pendaftaran dibuka di awal semester melalui wali kelas.',
							highlights: 'Praktik eksperimen mingguan\nPencatatan data dan laporan singkat',
							outcomes: 'Siswa memahami langkah kerja ilmiah',
							activities: 'Eksperimen IPA\nDiskusi hasil pengamatan',
							requirements: 'Mengikuti aturan keselamatan laboratorium',
							createdAt: '2026-05-01T08:00:00.000Z',
							updatedAt: '2026-05-01T08:00:00.000Z'
						}
					],
					pagination: { total: 6, limit: 20, offset: 0 }
				}
			}
		},
		{
			id: 'get-program',
			method: 'GET',
			path: '/api/programs/:id',
			summary: { id: 'Get program by id', en: 'Get program by id' },
			auth: 'public',
			rateLimit: READ_ONE_LIMIT,
			pathParams: [
				{
					name: 'id',
					type: 'integer',
					required: true,
					description: { id: 'ID program.', en: 'Program id.' }
				}
			],
			responseExample: {
				ok: true,
				data: {
					id: 1,
					title: 'Sains & Laboratorium',
					tag: 'Akademik',
					excerpt: '...',
					image: 'https://example.com/img.jpg',
					post: null,
					audience: 'Kelas VII sampai IX',
					schedule: 'Selasa, 15.00 sampai 16.30 WITA',
					location: 'Laboratorium IPA',
					mentor: 'Tim guru IPA',
					capacity: '24 siswa per siklus',
					contact: 'Wali kelas atau guru IPA',
					registration: 'Pendaftaran dibuka di awal semester melalui wali kelas.',
					highlights: 'Praktik eksperimen mingguan\nPencatatan data dan laporan singkat',
					outcomes: 'Siswa memahami langkah kerja ilmiah',
					activities: 'Eksperimen IPA\nDiskusi hasil pengamatan',
					requirements: 'Mengikuti aturan keselamatan laboratorium',
					createdAt: '2026-05-01T08:00:00.000Z',
					updatedAt: '2026-05-01T08:00:00.000Z'
				}
			}
		},
		{
			id: 'create-program',
			method: 'POST',
			path: '/api/programs',
			summary: { id: 'Create program', en: 'Create program' },
			auth: 'admin',
			rateLimit: WRITE_LIMIT,
			requestBody: [
				{
					name: 'title',
					type: 'string (1–160)',
					required: true,
					description: { id: 'Judul program.', en: 'Program title.' }
				},
				{
					name: 'tag',
					type: 'string (1–60)',
					required: true,
					description: { id: 'Kategori/label.', en: 'Category or label.' }
				},
				{
					name: 'excerpt',
					type: 'string (1–500)',
					required: true,
					description: { id: 'Deskripsi singkat.', en: 'Short description.' }
				},
				{
					name: 'image',
					type: 'string (URL https)',
					required: true,
					description: { id: 'URL gambar.', en: 'Image URL.' }
				},
				{
					name: 'post',
					type: 'string | null',
					description: {
						id: 'Konten panjang opsional, max 20000 char.',
						en: 'Optional long-form content, max 20000 chars.'
					}
				},
				{
					name: 'audience',
					type: 'string | null',
					description: { id: 'Peserta sasaran.', en: 'Target participants.' }
				},
				{
					name: 'schedule',
					type: 'string | null',
					description: { id: 'Jadwal kegiatan.', en: 'Program schedule.' }
				},
				{
					name: 'location',
					type: 'string | null',
					description: { id: 'Lokasi kegiatan.', en: 'Program location.' }
				},
				{
					name: 'mentor',
					type: 'string | null',
					description: { id: 'Pembina atau penanggung jawab.', en: 'Mentor or owner.' }
				},
				{
					name: 'capacity',
					type: 'string | null',
					description: { id: 'Kapasitas peserta.', en: 'Participant capacity.' }
				},
				{
					name: 'contact',
					type: 'string | null',
					description: { id: 'Kontak pendaftaran.', en: 'Registration contact.' }
				},
				{
					name: 'registration',
					type: 'string | null',
					description: { id: 'Catatan cara bergabung.', en: 'How to join notes.' }
				},
				{
					name: 'highlights',
					type: 'string | null',
					description: { id: 'Sorotan, satu item per baris.', en: 'Highlights, one item per line.' }
				},
				{
					name: 'outcomes',
					type: 'string | null',
					description: { id: 'Hasil belajar, satu item per baris.', en: 'Outcomes, one item per line.' }
				},
				{
					name: 'activities',
					type: 'string | null',
					description: { id: 'Kegiatan rutin, satu item per baris.', en: 'Activities, one item per line.' }
				},
				{
					name: 'requirements',
					type: 'string | null',
					description: { id: 'Persyaratan, satu item per baris.', en: 'Requirements, one item per line.' }
				}
			],
			responseExample: { ok: true, data: { id: 7, title: '...', tag: '...' } }
		},
		{
			id: 'update-program',
			method: 'PATCH',
			path: '/api/programs/:id',
			summary: { id: 'Update program', en: 'Update program' },
			description: {
				id: 'Partial update. Minimal satu field harus dikirim.',
				en: 'Partial update. At least one field is required.'
			},
			auth: 'admin',
			rateLimit: WRITE_LIMIT,
			pathParams: [
				{
					name: 'id',
					type: 'integer',
					required: true,
					description: { id: 'ID program.', en: 'Program id.' }
				}
			],
			requestBody: [
				{
					name: 'title',
					type: 'string (1–160)',
					description: { id: 'Opsional.', en: 'Optional.' }
				},
				{ name: 'tag', type: 'string (1–60)', description: { id: 'Opsional.', en: 'Optional.' } },
				{
					name: 'excerpt',
					type: 'string (1–500)',
					description: { id: 'Opsional.', en: 'Optional.' }
				},
				{
					name: 'image',
					type: 'string (URL https)',
					description: { id: 'Opsional.', en: 'Optional.' }
				},
				{ name: 'post', type: 'string | null', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'audience', type: 'string | null', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'schedule', type: 'string | null', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'location', type: 'string | null', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'mentor', type: 'string | null', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'capacity', type: 'string | null', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'contact', type: 'string | null', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'registration', type: 'string | null', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'highlights', type: 'string | null', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'outcomes', type: 'string | null', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'activities', type: 'string | null', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'requirements', type: 'string | null', description: { id: 'Opsional.', en: 'Optional.' } }
			]
		},
		{
			id: 'delete-program',
			method: 'DELETE',
			path: '/api/programs/:id',
			summary: { id: 'Delete program', en: 'Delete program' },
			auth: 'admin',
			rateLimit: WRITE_LIMIT,
			pathParams: [
				{
					name: 'id',
					type: 'integer',
					required: true,
					description: { id: 'ID program.', en: 'Program id.' }
				}
			],
			responseExample: { ok: true, data: { id: 7 } }
		}
	]
};

// -----------------------------------------------------------------------
// news
// -----------------------------------------------------------------------
const news: ResourceDoc = {
	slug: 'news',
	label: { id: 'News', en: 'News' },
	description: {
		id: 'Berita dan pengumuman sekolah.',
		en: 'School news and announcements.'
	},
	endpoints: [
		{
			id: 'list-news',
			method: 'GET',
			path: '/api/news',
			summary: { id: 'List news', en: 'List news' },
			auth: 'public',
			rateLimit: READ_LIMIT,
			queryParams: [
				{
					name: 'limit',
					type: 'integer (1–100)',
					description: { id: 'Default 20.', en: 'Default 20.' }
				},
				{
					name: 'offset',
					type: 'integer ≥ 0',
					description: { id: 'Default 0.', en: 'Default 0.' }
				},
				{
					name: 'category',
					type: 'string',
					description: {
						id: 'Filter exact-match category.',
						en: 'Exact-match category filter.'
					}
				},
				{
					name: 'q',
					type: 'string',
					description: {
						id: 'Pencarian title + excerpt.',
						en: 'Search across title + excerpt.'
					}
				}
			]
		},
		{
			id: 'get-news',
			method: 'GET',
			path: '/api/news/:id',
			summary: { id: 'Get news by id', en: 'Get news by id' },
			auth: 'public',
			rateLimit: READ_ONE_LIMIT,
			pathParams: [
				{
					name: 'id',
					type: 'integer',
					required: true,
					description: { id: 'ID berita.', en: 'News id.' }
				}
			]
		},
		{
			id: 'create-news',
			method: 'POST',
			path: '/api/news',
			summary: { id: 'Create news', en: 'Create news' },
			auth: 'admin',
			rateLimit: WRITE_LIMIT,
			requestBody: [
				{
					name: 'category',
					type: 'string (1–60)',
					required: true,
					description: { id: 'Kategori berita.', en: 'News category.' }
				},
				{
					name: 'date',
					type: 'string (1–40)',
					required: true,
					description: {
						id: 'Tanggal human, mis. "12 Mei 2026".',
						en: 'Human-readable date, e.g. "12 Mei 2026".'
					}
				},
				{
					name: 'title',
					type: 'string (1–200)',
					required: true,
					description: { id: 'Judul.', en: 'Title.' }
				},
				{
					name: 'slug',
					type: 'string (3–120)',
					required: true,
					description: {
						id: 'URL slug, format huruf kecil + dash. Mis. "tim-robotik-juara".',
						en: 'URL slug, lowercase + dashes. e.g. "tim-robotik-juara".'
					}
				},
				{
					name: 'excerpt',
					type: 'string (1–500)',
					required: true,
					description: { id: 'Ringkasan.', en: 'Summary.' }
				},
				{
					name: 'image',
					type: 'string (URL https)',
					required: true,
					description: { id: 'URL gambar cover.', en: 'Cover image URL.' }
				},
				{
					name: 'content',
					type: 'string | null',
					description: {
						id: 'Konten panjang dalam markdown (opsional, max 50000 char).',
						en: 'Long-form markdown content (optional, max 50000 chars).'
					}
				}
			]
		},
		{
			id: 'update-news',
			method: 'PATCH',
			path: '/api/news/:id',
			summary: { id: 'Update news', en: 'Update news' },
			auth: 'admin',
			rateLimit: WRITE_LIMIT,
			pathParams: [
				{
					name: 'id',
					type: 'integer',
					required: true,
					description: { id: 'ID berita.', en: 'News id.' }
				}
			],
			requestBody: [
				{ name: 'category', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'date', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'title', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'excerpt', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'image', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } }
			]
		},
		{
			id: 'delete-news',
			method: 'DELETE',
			path: '/api/news/:id',
			summary: { id: 'Delete news', en: 'Delete news' },
			auth: 'admin',
			rateLimit: WRITE_LIMIT,
			pathParams: [
				{
					name: 'id',
					type: 'integer',
					required: true,
					description: { id: 'ID berita.', en: 'News id.' }
				}
			]
		}
	]
};

// -----------------------------------------------------------------------
// events
// -----------------------------------------------------------------------
const events: ResourceDoc = {
	slug: 'events',
	label: { id: 'Events', en: 'Events' },
	description: {
		id: 'Agenda kegiatan dan event sekolah.',
		en: 'School events and agenda.'
	},
	endpoints: [
		{
			id: 'list-events',
			method: 'GET',
			path: '/api/events',
			summary: { id: 'List events', en: 'List events' },
			auth: 'public',
			rateLimit: READ_LIMIT,
			queryParams: [
				{
					name: 'limit',
					type: 'integer (1–100)',
					description: { id: 'Default 20.', en: 'Default 20.' }
				},
				{
					name: 'offset',
					type: 'integer ≥ 0',
					description: { id: 'Default 0.', en: 'Default 0.' }
				},
				{
					name: 'q',
					type: 'string',
					description: {
						id: 'Pencarian title + excerpt.',
						en: 'Search across title + excerpt.'
					}
				}
			]
		},
		{
			id: 'get-event',
			method: 'GET',
			path: '/api/events/:id',
			summary: { id: 'Get event by id', en: 'Get event by id' },
			auth: 'public',
			rateLimit: READ_ONE_LIMIT,
			pathParams: [
				{
					name: 'id',
					type: 'integer',
					required: true,
					description: { id: 'ID acara.', en: 'Event id.' }
				}
			]
		},
		{
			id: 'create-event',
			method: 'POST',
			path: '/api/events',
			summary: { id: 'Create event', en: 'Create event' },
			auth: 'admin',
			rateLimit: WRITE_LIMIT,
			requestBody: [
				{
					name: 'date',
					type: 'string (1–40)',
					required: true,
					description: {
						id: 'Tanggal human, mis. "12 Jun 2026".',
						en: 'Human-readable date, e.g. "12 Jun 2026".'
					}
				},
				{
					name: 'dateDay',
					type: 'string (1–2 digit)',
					required: true,
					description: {
						id: 'Tanggal numerik, mis. "12".',
						en: 'Numeric day, e.g. "12".'
					}
				},
				{
					name: 'dateMonth',
					type: 'string (1–10)',
					required: true,
					description: {
						id: 'Bulan singkat, mis. "Jun".',
						en: 'Short month label, e.g. "Jun".'
					}
				},
				{
					name: 'title',
					type: 'string (1–200)',
					required: true,
					description: { id: 'Judul.', en: 'Title.' }
				},
				{
					name: 'excerpt',
					type: 'string (1–500)',
					required: true,
					description: { id: 'Ringkasan.', en: 'Summary.' }
				},
				{
					name: 'image',
					type: 'string (URL https)',
					required: true,
					description: { id: 'URL gambar.', en: 'Image URL.' }
				},
				{
					name: 'time',
					type: 'string (1–40)',
					required: true,
					description: {
						id: 'Waktu acara, mis. "08:00 WITA".',
						en: 'Event time, e.g. "08:00 WITA".'
					}
				},
				{
					name: 'location',
					type: 'string (1–120)',
					required: true,
					description: { id: 'Lokasi.', en: 'Location.' }
				}
			]
		},
		{
			id: 'update-event',
			method: 'PATCH',
			path: '/api/events/:id',
			summary: { id: 'Update event', en: 'Update event' },
			auth: 'admin',
			rateLimit: WRITE_LIMIT,
			pathParams: [
				{
					name: 'id',
					type: 'integer',
					required: true,
					description: { id: 'ID acara.', en: 'Event id.' }
				}
			],
			requestBody: [
				{ name: 'date', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'dateDay', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'dateMonth', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'title', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'excerpt', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'image', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'time', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } },
				{ name: 'location', type: 'string', description: { id: 'Opsional.', en: 'Optional.' } }
			]
		},
		{
			id: 'delete-event',
			method: 'DELETE',
			path: '/api/events/:id',
			summary: { id: 'Delete event', en: 'Delete event' },
			auth: 'admin',
			rateLimit: WRITE_LIMIT,
			pathParams: [
				{
					name: 'id',
					type: 'integer',
					required: true,
					description: { id: 'ID acara.', en: 'Event id.' }
				}
			]
		}
	]
};

export const apiRegistry: { resources: ResourceDoc[] } = {
	resources: [programs, news, events]
};

/** Find a resource by slug. */
export function findResource(slug: string): ResourceDoc | undefined {
	return apiRegistry.resources.find((r) => r.slug === slug);
}
