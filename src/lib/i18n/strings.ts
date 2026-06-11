/**
 * UI string dictionary for the docs section.
 * Add a key here and it's available everywhere via `locale.t(key)`.
 */
export type Locale = 'id' | 'en';

export const docsStrings = {
	id: {
		// Sidebar
		'sidebar.gettingStarted': 'Memulai',
		'sidebar.introduction': 'Pendahuluan',
		'sidebar.authentication': 'Autentikasi',
		'sidebar.responseEnvelope': 'Format Respons',
		'sidebar.rateLimiting': 'Pembatasan Laju',
		'sidebar.specJson': 'Spec JSON',
		'sidebar.viewOnGithub': 'Lihat di GitHub',
		'sidebar.openNav': 'Buka navigasi',
		'sidebar.closeNav': 'Tutup navigasi',
		'sidebar.language': 'Bahasa',

		// Intro page
		'intro.eyebrow': 'REST API · v1',
		'intro.heading': 'Dokumentasi API',
		'intro.description':
			'Dokumentasi lengkap REST API untuk situs SMP 1 Anggana. Mencakup data programs, news, dan events, dengan validasi Zod, rate limiting per-IP, serta auth bearer token untuk operasi tulis.',
		'intro.specBtn': '↗ Spec siap-mesin',
		'intro.authBtn': '🔐 Autentikasi',
		'intro.baseUrlTitle': 'Base URL',
		'intro.baseUrlBody': 'Semua endpoint relatif terhadap base URL berikut:',
		'intro.baseUrlNote': 'Untuk pengembangan lokal biasanya',
		'intro.authTitle': 'Autentikasi',
		'intro.authBody':
			'Endpoint baca (GET) bersifat publik. Endpoint tulis (POST, PATCH, DELETE) memerlukan bearer token admin yang dikirim lewat header Authorization:',
		'intro.authCallout':
			'Token dibandingkan secara constant-time di server untuk mencegah timing-attack. Set value-nya di .env sebagai API_ADMIN_TOKEN dengan minimal 16 karakter.',
		'intro.envelopeTitle': 'Format respons',
		'intro.envelopeBody': 'Semua respons API dibungkus dengan envelope JSON yang konsisten:',
		'intro.rateTitle': 'Pembatasan laju',
		'intro.rateBody':
			'Setiap endpoint punya budget rate-limit per-IP. Batas dan sisa quota dikembalikan via header:',
		'intro.rateNote':
			'Bila melebihi, server membalas 429 TOO_MANY_REQUESTS dengan header Retry-After dalam detik.',
		'intro.resourcesTitle': 'Resource',
		'intro.resourcesIntro': 'API memiliki',
		'intro.resourcesIntroSuffix': 'resource dengan total',
		'intro.resourcesSuffix': 'endpoint:',

		// Resource page
		'resource.eyebrow': 'Resource',
		'resource.backToHome': '← Kembali ke beranda',
		'resource.specJson': '↗ Spec JSON',

		// Auth panel
		'auth.authorized': 'Terotorisasi',
		'auth.authorizedHint': 'Token termuat untuk sesi ini',
		'auth.notAuthorized': 'Belum terotorisasi',
		'auth.notAuthorizedHint': 'Endpoint tulis akan mengembalikan 401',
		'auth.logout': 'Keluar',
		'auth.authorize': 'Otorisasi',
		'auth.update': 'Perbarui token',
		'auth.tokenLabel': 'API_ADMIN_TOKEN',
		'auth.tokenHint':
			'Disimpan hanya di sessionStorage, tidak dikirim ke mana pun selain server ini.',
		'auth.tokenPlaceholder': 'Tempel bearer token admin di sini',
		'auth.save': 'Simpan',

		// Endpoint block
		'ep.public': 'publik',
		'ep.admin': 'admin',
		'ep.rateLimit': 'Batas laju:',
		'ep.requestsPer': 'permintaan per',
		'ep.pathParams': 'Parameter path',
		'ep.queryParams': 'Parameter query',
		'ep.requestBody': 'Body permintaan (application/json)',
		'ep.tryItOut': '▶ Coba sekarang',
		'ep.execute': '▶ Eksekusi',
		'ep.executing': '⏳ Mengeksekusi…',
		'ep.cancel': 'Batal',
		'ep.clear': 'Bersihkan',
		'ep.curlHeading': 'cURL',
		'ep.responseHeading': 'Respons',
		'ep.bodyTab': 'Body',
		'ep.headersTab': 'Header',
		'ep.colName': 'Nama',
		'ep.colType': 'Tipe',
		'ep.colDescription': 'Deskripsi',
		'ep.colValue': 'Nilai',
		'ep.colField': 'Field',
		'ep.errPathRequired': 'Parameter path "{name}" wajib diisi.',
		'ep.errAuthRequired':
			'Endpoint ini butuh auth admin. Klik tombol Otorisasi di atas untuk masukkan token.',
		'ep.errInvalidJson': 'Body bukan JSON valid:',
		'ep.errNetwork': 'Kesalahan jaringan:',
		'ep.statusOk': 'OK',
		'ep.statusError': 'Gagal'
	},
	en: {
		// Sidebar
		'sidebar.gettingStarted': 'Getting Started',
		'sidebar.introduction': 'Introduction',
		'sidebar.authentication': 'Authentication',
		'sidebar.responseEnvelope': 'Response Envelope',
		'sidebar.rateLimiting': 'Rate Limiting',
		'sidebar.specJson': 'JSON Spec',
		'sidebar.viewOnGithub': 'View on GitHub',
		'sidebar.openNav': 'Open navigation',
		'sidebar.closeNav': 'Close navigation',
		'sidebar.language': 'Language',

		// Intro page
		'intro.eyebrow': 'REST API · v1',
		'intro.heading': 'API Documentation',
		'intro.description':
			'Complete REST API reference for the SMP 1 Anggana website. Covers programs, news, and events data with Zod validation, per-IP rate limiting, and bearer-token auth for write operations.',
		'intro.specBtn': '↗ Machine-readable spec',
		'intro.authBtn': '🔐 Authentication',
		'intro.baseUrlTitle': 'Base URL',
		'intro.baseUrlBody': 'All endpoints are relative to the following base URL:',
		'intro.baseUrlNote': 'For local development, typically',
		'intro.authTitle': 'Authentication',
		'intro.authBody':
			'Read endpoints (GET) are public. Write endpoints (POST, PATCH, DELETE) require an admin bearer token sent via the Authorization header:',
		'intro.authCallout':
			'The token is compared in constant-time on the server to prevent timing attacks. Set its value in .env as API_ADMIN_TOKEN with at least 16 characters.',
		'intro.envelopeTitle': 'Response envelope',
		'intro.envelopeBody': 'Every API response is wrapped in a consistent JSON envelope:',
		'intro.rateTitle': 'Rate limiting',
		'intro.rateBody':
			'Every endpoint has a per-IP rate budget. Limits and remaining quota are returned via headers:',
		'intro.rateNote':
			'If exceeded, the server replies with 429 TOO_MANY_REQUESTS plus a Retry-After header in seconds.',
		'intro.resourcesTitle': 'Resources',
		'intro.resourcesIntro': 'The API exposes',
		'intro.resourcesIntroSuffix': 'resources with a total of',
		'intro.resourcesSuffix': 'endpoints:',

		// Resource page
		'resource.eyebrow': 'Resource',
		'resource.backToHome': '← Back to docs home',
		'resource.specJson': '↗ JSON spec',

		// Auth panel
		'auth.authorized': 'Authorized',
		'auth.authorizedHint': 'Token loaded for this session',
		'auth.notAuthorized': 'Not authorized',
		'auth.notAuthorizedHint': 'Write endpoints will return 401',
		'auth.logout': 'Logout',
		'auth.authorize': 'Authorize',
		'auth.update': 'Update token',
		'auth.tokenLabel': 'API_ADMIN_TOKEN',
		'auth.tokenHint':
			'Stored in sessionStorage only — never sent anywhere except this server.',
		'auth.tokenPlaceholder': 'Paste your admin bearer token',
		'auth.save': 'Save',

		// Endpoint block
		'ep.public': 'public',
		'ep.admin': 'admin',
		'ep.rateLimit': 'Rate limit:',
		'ep.requestsPer': 'requests per',
		'ep.pathParams': 'Path parameters',
		'ep.queryParams': 'Query parameters',
		'ep.requestBody': 'Request body (application/json)',
		'ep.tryItOut': '▶ Try it out',
		'ep.execute': '▶ Execute',
		'ep.executing': '⏳ Executing…',
		'ep.cancel': 'Cancel',
		'ep.clear': 'Clear',
		'ep.curlHeading': 'cURL',
		'ep.responseHeading': 'Response',
		'ep.bodyTab': 'Body',
		'ep.headersTab': 'Headers',
		'ep.colName': 'Name',
		'ep.colType': 'Type',
		'ep.colDescription': 'Description',
		'ep.colValue': 'Value',
		'ep.colField': 'Field',
		'ep.errPathRequired': 'Path parameter "{name}" is required.',
		'ep.errAuthRequired':
			'This endpoint requires admin auth. Click Authorize above to enter your token.',
		'ep.errInvalidJson': 'Body is not valid JSON:',
		'ep.errNetwork': 'Network error:',
		'ep.statusOk': 'OK',
		'ep.statusError': 'Error'
	}
} as const;

export type DocsStringKey = keyof (typeof docsStrings)['id'];
