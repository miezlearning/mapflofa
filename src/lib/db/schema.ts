import { boolean, index, int, json, mysqlTable, text, varchar, timestamp, datetime } from 'drizzle-orm/mysql-core';

/**
 * programs
 * id, title, tag, excerpt, image, post, audience, schedule, location,
 * mentor, capacity, contact, registration, highlights, outcomes, activities,
 * requirements, created_at, updated_at
 */
export const programs = mysqlTable('programs', {
	id: int('id').autoincrement().primaryKey(),
	title: text('title').notNull(),
	tag: text('tag').notNull(),
	excerpt: text('excerpt').notNull(),
	image: text('image').notNull(),
	post: text('post'),
	audience: text('audience'),
	schedule: text('schedule'),
	location: text('location'),
	mentor: text('mentor'),
	capacity: text('capacity'),
	contact: text('contact'),
	registration: text('registration'),
	highlights: text('highlights'),
	outcomes: text('outcomes'),
	activities: text('activities'),
	requirements: text('requirements'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * news
 * id, category, date, title, slug, excerpt, image, content, created_at, updated_at
 *
 * `slug` powers the public detail URL `/berita/:slug`. Unique, lowercase,
 * dash-separated. `content` is markdown rendered server-side for the
 * detail view; the homepage card still uses `excerpt`.
 */
export const news = mysqlTable('news', {
	id: int('id').autoincrement().primaryKey(),
	category: text('category').notNull(),
	date: text('date').notNull(),
	title: text('title').notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	excerpt: text('excerpt').notNull(),
	image: text('image').notNull(),
	content: text('content'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * events (Upcoming Events)
 * id, date (e.g. "12 Jun 2026"), date_day, date_month,
 * title, excerpt, image, time, location
 */
export const events = mysqlTable('events', {
	id: int('id').autoincrement().primaryKey(),
	date: text('date').notNull(),
	dateDay: text('date_day').notNull(),
	dateMonth: text('date_month').notNull(),
	title: text('title').notNull(),
	excerpt: text('excerpt').notNull(),
	image: text('image').notNull(),
	time: text('time').notNull(),
	location: text('location').notNull()
});

// Inferred types for use in your app code
export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

/**
 * users — admin / editor / viewer accounts for the dashboard.
 * Roles are stored as plain strings to keep it open-ended; enforce in code.
 */
export const users = mysqlTable('users', {
	id: int('id').autoincrement().primaryKey(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	name: text('name').notNull(),
	passwordHash: text('password_hash').notNull(),
	role: text('role').notNull().default('admin'),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	lastLoginAt: datetime('last_login_at')
});

/**
 * sessions — server-side session store.
 *
 * `id` is the sha256 of the random session token. We never store the raw
 * token, so even a DB compromise doesn't grant active session access.
 * The cookie holds the raw token; we hash it to look up the session.
 */
export const sessions = mysqlTable('sessions', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: int('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	ip: text('ip'),
	userAgent: text('user_agent')
});

/**
 * audit_logs — append-only record of who-did-what-when.
 *
 * - Email and role are snapshot strings, not foreign keys, so the log stays
 *   useful even if the user is later deleted.
 * - `details` is JSON for free-form context (changed fields, target name, etc.).
 * - Indexed by (user_id, created_at) and (resource, created_at) for the
 *   common filter cases on the audit page.
 */
export const auditLogs = mysqlTable(
	'audit_logs',
	{
		id: int('id').autoincrement().primaryKey(),
		userId: int('user_id'),
		userEmail: text('user_email').notNull(),
		userRole: text('user_role').notNull(),
		action: text('action').notNull(),
		resource: varchar('resource', { length: 255 }).notNull(),
		resourceId: int('resource_id'),
		details: json('details'),
		ip: text('ip'),
		userAgent: text('user_agent'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(t) => ({
		byUser: index('audit_logs_user_idx').on(t.userId, t.createdAt),
		byResource: index('audit_logs_resource_idx').on(t.resource, t.createdAt)
	})
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

/**
 * page_views — privacy-friendly analytics for public pages.
 *
 * - `visitor_hash` is sha256(ip + ua + dailySalt). Same visitor on the same
 *   day → same hash. Different day or different visitor → different hash.
 *   Raw IP is never stored.
 * - Index by (created_at) and (path, created_at) covers the common queries.
 */
export const pageViews = mysqlTable(
	'page_views',
	{
		id: int('id').autoincrement().primaryKey(),
		path: varchar('path', { length: 255 }).notNull(),
		visitorHash: varchar('visitor_hash', { length: 255 }).notNull(),
		referer: text('referer'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(t) => ({
		byTime: index('page_views_time_idx').on(t.createdAt),
		byPath: index('page_views_path_idx').on(t.path, t.createdAt),
		byVisitor: index('page_views_visitor_idx').on(t.visitorHash, t.createdAt)
	})
);

export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;

/* ============================================================
   MAPFLOFA CMS tables
   ------------------------------------------------------------
   Added for the Mahasiswa Penyayang Flora Fauna redesign:
   editable profile content, photo gallery (album → photos),
   and member / organisation-structure records.
   ============================================================ */

/**
 * site_content — editable key/value blocks for the "Profil" page and
 * global settings, so the admin can change Visi, Misi, Sejarah, and
 * contact details without code changes.
 *
 * Suggested keys:
 *   'profile.visi'        → markdown/plain text
 *   'profile.misi'        → markdown bullet list
 *   'profile.sejarah'     → markdown
 *   'contact.address'     → string
 *   'contact.email'       → string
 *   'contact.whatsapp'    → string (E.164, e.g. +6281234567890)
 *   'contact.instagram'   → handle or URL
 *   'home.tagline'        → hero tagline
 *
 * `group` lets the admin UI cluster fields (e.g. "profile", "contact").
 */
export const siteContent = mysqlTable('site_content', {
	id: int('id').autoincrement().primaryKey(),
	key: varchar('key', { length: 255 }).notNull().unique(),
	group: text('group').notNull().default('general'),
	label: text('label').notNull(),
	value: text('value').notNull().default(''),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * gallery_albums — "Galeri Aksi & Kegiatan".
 * Each album groups photos for a single activity, e.g.
 * "Penanaman Pohon", "Sosialisasi Satwa Langka".
 */
export const galleryAlbums = mysqlTable('gallery_albums', {
	id: int('id').autoincrement().primaryKey(),
	title: text('title').notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	description: text('description'),
	coverImage: text('cover_image'),
	eventDate: text('event_date'),
	isPublished: boolean('is_published').notNull().default(true),
	sortOrder: int('sort_order').notNull().default(0),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * gallery_photos — individual images that belong to an album.
 * Deleting an album cascades to its photos.
 */
export const galleryPhotos = mysqlTable(
	'gallery_photos',
	{
		id: int('id').autoincrement().primaryKey(),
		albumId: int('album_id')
			.notNull()
			.references(() => galleryAlbums.id, { onDelete: 'cascade' }),
		image: text('image').notNull(),
		caption: text('caption'),
		sortOrder: int('sort_order').notNull().default(0),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(t) => ({
		byAlbum: index('gallery_photos_album_idx').on(t.albumId, t.sortOrder)
	})
);

/**
 * members — anggota & struktur organisasi.
 * Powers the visual org chart on the Profil page. `position` is the role
 * title (e.g. "Ketua Umum", "Divisi Konservasi"); `parentId` lets you nest
 * positions to render the bagan. `period` is the kepengurusan year.
 */
export const members = mysqlTable(
	'members',
	{
		id: int('id').autoincrement().primaryKey(),
		name: text('name').notNull(),
		position: text('position').notNull(),
		/** Nomor Induk Mahasiswa (student ID), shown for pengurus & anggota. */
		nim: text('nim'),
		/**
		 * Grouping level for the org structure:
		 *   'pelindung' | 'penanggung_jawab' | 'pembina' | 'pengurus' | 'divisi'
		 */
		group: text('group').notNull().default('pengurus'),
		division: text('division'),
		parentId: int('parent_id'),
		photo: text('photo'),
		period: text('period'),
		/** Short tagline shown under the name in the select carousel. */
		description: text('description'),
		/** Tugas Pokok & Fungsi — one item per line, shown in the detail view. */
		tupoksi: text('tupoksi'),
		/** Featured members appear in the big "character select" carousel. */
		isFeatured: boolean('is_featured').notNull().default(false),
		isActive: boolean('is_active').notNull().default(true),
		sortOrder: int('sort_order').notNull().default(0),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(t) => ({
		byOrder: index('members_order_idx').on(t.sortOrder)
	})
);

export type SiteContent = typeof siteContent.$inferSelect;
export type NewSiteContent = typeof siteContent.$inferInsert;

export type GalleryAlbum = typeof galleryAlbums.$inferSelect;
export type NewGalleryAlbum = typeof galleryAlbums.$inferInsert;

export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type NewGalleryPhoto = typeof galleryPhotos.$inferInsert;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
