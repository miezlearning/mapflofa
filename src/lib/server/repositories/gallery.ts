import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { galleryAlbums, galleryPhotos } from '$lib/db/schema';
import type {
	CreateAlbumInput,
	CreatePhotoInput,
	UpdateAlbumInput,
	UpdatePhotoInput
} from '$lib/server/api/schemas/gallery';

/**
 * Gallery repository — albums and their photos.
 *
 * Album listings carry a derived `photoCount`, and an `effectiveCover`
 * (the explicit cover, falling back to the first photo) so the public grid
 * always has something to show.
 */
export const galleryRepo = {
	async listAlbums(opts: { limit: number; offset: number; publishedOnly?: boolean }) {
		const where = opts.publishedOnly ? eq(galleryAlbums.isPublished, true) : undefined;

		const [rows, [{ count }]] = await Promise.all([
			db
				.select({
					id: galleryAlbums.id,
					title: galleryAlbums.title,
					slug: galleryAlbums.slug,
					description: galleryAlbums.description,
					coverImage: galleryAlbums.coverImage,
					eventDate: galleryAlbums.eventDate,
					isPublished: galleryAlbums.isPublished,
					sortOrder: galleryAlbums.sortOrder,
					createdAt: galleryAlbums.createdAt,
					updatedAt: galleryAlbums.updatedAt,
					photoCount: sql<number>`(
						select count(*)::int from ${galleryPhotos}
						where ${galleryPhotos.albumId} = ${galleryAlbums.id}
					)`,
					firstPhoto: sql<string | null>`(
						select gp.image from ${galleryPhotos} gp
						where gp.album_id = ${galleryAlbums.id}
						order by gp.sort_order asc, gp.id asc
						limit 1
					)`
				})
				.from(galleryAlbums)
				.where(where)
				.orderBy(asc(galleryAlbums.sortOrder), desc(galleryAlbums.createdAt))
				.limit(opts.limit)
				.offset(opts.offset),
			db
				.select({ count: sql<number>`count(*)::int` })
				.from(galleryAlbums)
				.where(where)
		]);

		const withCover = rows.map((r) => ({
			...r,
			effectiveCover: r.coverImage ?? r.firstPhoto ?? null
		}));

		return { rows: withCover, total: count };
	},

	findAlbumById(id: number) {
		return db
			.select()
			.from(galleryAlbums)
			.where(eq(galleryAlbums.id, id))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	findAlbumBySlug(slug: string) {
		return db
			.select()
			.from(galleryAlbums)
			.where(eq(galleryAlbums.slug, slug))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	listPhotos(albumId: number) {
		return db
			.select()
			.from(galleryPhotos)
			.where(eq(galleryPhotos.albumId, albumId))
			.orderBy(asc(galleryPhotos.sortOrder), asc(galleryPhotos.id));
	},

	/** Public album detail: album + its photos, only if published. */
	async findPublishedWithPhotos(slug: string) {
		const album = await db
			.select()
			.from(galleryAlbums)
			.where(and(eq(galleryAlbums.slug, slug), eq(galleryAlbums.isPublished, true)))
			.limit(1)
			.then((rows) => rows[0] ?? null);
		if (!album) return null;
		const photos = await this.listPhotos(album.id);
		return { album, photos };
	},

	async createAlbum(input: CreateAlbumInput) {
		const [row] = await db.insert(galleryAlbums).values(input).returning();
		return row;
	},

	async updateAlbum(id: number, input: UpdateAlbumInput) {
		const [row] = await db
			.update(galleryAlbums)
			.set({ ...input, updatedAt: new Date() })
			.where(eq(galleryAlbums.id, id))
			.returning();
		return row ?? null;
	},

	async removeAlbum(id: number) {
		// Photos are removed via ON DELETE CASCADE.
		const [row] = await db
			.delete(galleryAlbums)
			.where(eq(galleryAlbums.id, id))
			.returning({ id: galleryAlbums.id });
		return row ?? null;
	},

	async addPhoto(input: CreatePhotoInput) {
		const [row] = await db.insert(galleryPhotos).values(input).returning();
		return row;
	},

	async updatePhoto(id: number, input: UpdatePhotoInput) {
		const [row] = await db
			.update(galleryPhotos)
			.set(input)
			.where(eq(galleryPhotos.id, id))
			.returning();
		return row ?? null;
	},

	findPhotoById(id: number) {
		return db
			.select()
			.from(galleryPhotos)
			.where(eq(galleryPhotos.id, id))
			.limit(1)
			.then((rows) => rows[0] ?? null);
	},

	async removePhoto(id: number) {
		const [row] = await db
			.delete(galleryPhotos)
			.where(eq(galleryPhotos.id, id))
			.returning({ id: galleryPhotos.id, albumId: galleryPhotos.albumId });
		return row ?? null;
	},

	/** Next sort order for appending a photo to an album. */
	async nextPhotoSortOrder(albumId: number) {
		const [{ max }] = await db
			.select({ max: sql<number>`coalesce(max(${galleryPhotos.sortOrder}), -1)::int` })
			.from(galleryPhotos)
			.where(eq(galleryPhotos.albumId, albumId));
		return (max ?? -1) + 1;
	}
};
