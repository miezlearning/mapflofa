<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const album = $derived(data.album);
	const photos = $derived(data.photos);

	let savingAlbum = $state(false);
	let uploading = $state(false);
	let newCoverPreview = $state('');

	function onCoverFile(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) newCoverPreview = URL.createObjectURL(file);
	}
</script>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Kelola Album</h1>
		<p class="adm-sub">
			<a class="slug" href={`/galeri/${album.slug}`} target="_blank" rel="noopener">/galeri/{album.slug} ↗</a>
			· {photos.length} foto
		</p>
	</div>
	<a class="adm-btn" href="/admin/gallery">← Semua album</a>
</div>

{#if data.justCreated}
	<div class="adm-flash adm-flash-ok">Album dibuat. Sekarang tambahkan foto di bawah.</div>
{/if}
{#if form?.message}
	<div class="adm-flash {form.ok ? 'adm-flash-ok' : 'adm-flash-error'}">{form.message}</div>
{/if}

<div class="cols">
	<!-- ===== Album metadata ===== -->
	<section class="adm-card">
		<h2 class="section-title">Detail Album</h2>
		<form
			method="POST"
			action="?/update"
			enctype="multipart/form-data"
			class="adm-form"
			use:enhance={() => {
				savingAlbum = true;
				return async ({ update }) => {
					await update({ reset: false });
					savingAlbum = false;
				};
			}}
		>
			<label>
				<span class="field-label">Judul *</span>
				<input name="title" value={album.title} required />
			</label>
			<label>
				<span class="field-label">Deskripsi</span>
				<textarea name="description" rows="3">{album.description ?? ''}</textarea>
			</label>
			<label>
				<span class="field-label">Tanggal kegiatan</span>
				<input name="eventDate" value={album.eventDate ?? ''} placeholder="cth. Mei 2026" />
			</label>
			<label>
				<span class="field-label">Urutan tampil</span>
				<input name="sortOrder" type="number" min="0" value={album.sortOrder} />
			</label>

			<label>
				<span class="field-label">Ganti sampul (unggah)</span>
				<input type="file" name="coverFile" accept="image/*" onchange={onCoverFile} />
			</label>
			<label>
				<span class="field-label">…atau URL sampul</span>
				<input name="coverImage" value={album.coverImage ?? ''} placeholder="https://…" />
			</label>

			<div class="cover-now">
				{#if newCoverPreview}
					<img src={newCoverPreview} alt="Pratinjau sampul baru" />
				{:else if album.coverImage}
					<img src={album.coverImage} alt="Sampul saat ini" />
				{:else}
					<div class="cover-empty">Belum ada sampul</div>
				{/if}
			</div>

			<label class="check">
				<input type="checkbox" name="isPublished" checked={album.isPublished} />
				<span class="field-label" style="margin:0">Publikasikan album</span>
			</label>

			<div class="form-actions">
				<button class="adm-btn adm-btn-primary" type="submit" disabled={savingAlbum}>
					{savingAlbum ? 'Menyimpan…' : 'Simpan detail'}
				</button>
			</div>
		</form>
	</section>

	<!-- ===== Add photos ===== -->
	<section class="adm-card">
		<h2 class="section-title">Tambah Foto</h2>
		<form
			method="POST"
			action="?/addPhotos"
			enctype="multipart/form-data"
			class="adm-form"
			use:enhance={() => {
				uploading = true;
				return async ({ update }) => {
					await update();
					uploading = false;
				};
			}}
		>
			<label>
				<span class="field-label">Unggah foto (bisa banyak sekaligus)</span>
				<input type="file" name="photos" accept="image/*" multiple />
				<span class="field-hint">JPG, PNG, WebP, atau GIF. Maks 5 MB per file.</span>
			</label>
			<label>
				<span class="field-label">…atau URL gambar</span>
				<input name="photoUrl" placeholder="https://…" />
			</label>
			<label>
				<span class="field-label">Caption (opsional, untuk yang baru ditambah)</span>
				<input name="caption" placeholder="cth. Relawan menanam bibit mangrove" />
			</label>
			<div class="form-actions">
				<button class="adm-btn adm-btn-primary" type="submit" disabled={uploading}>
					{uploading ? 'Mengunggah…' : 'Tambah ke album'}
				</button>
			</div>
		</form>
	</section>
</div>

<!-- ===== Photo manager ===== -->
<section class="adm-card" style="margin-top:1.25rem">
	<h2 class="section-title">Foto dalam Album ({photos.length})</h2>

	{#if photos.length === 0}
		<div class="adm-empty">Belum ada foto. Tambahkan lewat formulir di atas.</div>
	{:else}
		<div class="photo-grid">
			{#each photos as p, i (p.id)}
				<div class="photo-item">
					<div class="photo-thumb">
						<img src={p.image} alt={p.caption ?? ''} loading="lazy" />
						{#if album.coverImage === p.image}
							<span class="cover-flag">Sampul</span>
						{/if}
					</div>

					<form
						method="POST"
						action="?/updatePhoto"
						class="caption-form"
						use:enhance={() => async ({ update }) => update({ reset: false })}
					>
						<input type="hidden" name="photoId" value={p.id} />
						<input name="caption" value={p.caption ?? ''} placeholder="Tambah caption…" class="caption-input" />
						<button type="submit" class="adm-btn caption-save" title="Simpan caption">✓</button>
					</form>

					<div class="photo-actions">
						<form method="POST" action="?/movePhoto" use:enhance>
							<input type="hidden" name="photoId" value={p.id} />
							<input type="hidden" name="dir" value="up" />
							<button class="icon-btn" type="submit" title="Naik" disabled={i === 0}>↑</button>
						</form>
						<form method="POST" action="?/movePhoto" use:enhance>
							<input type="hidden" name="photoId" value={p.id} />
							<input type="hidden" name="dir" value="down" />
							<button class="icon-btn" type="submit" title="Turun" disabled={i === photos.length - 1}>↓</button>
						</form>
						<form method="POST" action="?/setCover" use:enhance>
							<input type="hidden" name="photoId" value={p.id} />
							<button class="icon-btn" type="submit" title="Jadikan sampul">★</button>
						</form>
						<form method="POST" action="?/deletePhoto" use:enhance>
							<input type="hidden" name="photoId" value={p.id} />
							<button class="icon-btn danger" type="submit" title="Hapus foto">✕</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	.cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
		align-items: start;
	}
	@media (max-width: 900px) {
		.cols {
			grid-template-columns: 1fr;
		}
	}
	.section-title {
		font-size: 1rem;
		font-weight: 700;
		color: #f1f5f9;
		margin: 0 0 1rem;
	}
	.slug {
		color: #38bdf8;
		text-decoration: none;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
	}
	.cover-now img {
		max-width: 100%;
		border-radius: 0.625rem;
		border: 1px solid rgba(148, 163, 184, 0.2);
	}
	.cover-empty {
		padding: 1.5rem;
		text-align: center;
		color: #64748b;
		border: 1px dashed rgba(148, 163, 184, 0.2);
		border-radius: 0.625rem;
		font-size: 0.8125rem;
	}
	.check {
		flex-direction: row !important;
		align-items: center;
		gap: 0.5rem !important;
	}
	.check input {
		width: auto;
	}

	.photo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
	}
	.photo-item {
		border: 1px solid rgba(148, 163, 184, 0.14);
		border-radius: 0.75rem;
		overflow: hidden;
		background: rgba(2, 6, 23, 0.4);
		display: flex;
		flex-direction: column;
	}
	.photo-thumb {
		position: relative;
		aspect-ratio: 4 / 3;
		background: rgba(148, 163, 184, 0.1);
	}
	.photo-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.cover-flag {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #0b1120;
		background: #38bdf8;
		padding: 0.125rem 0.4rem;
		border-radius: 0.3rem;
	}
	.caption-form {
		display: flex;
		gap: 0.375rem;
		padding: 0.5rem;
	}
	.caption-input {
		flex: 1;
		min-width: 0;
		padding: 0.4rem 0.5rem;
		border-radius: 0.4rem;
		background: rgba(2, 6, 23, 0.7);
		border: 1px solid rgba(148, 163, 184, 0.2);
		color: #f1f5f9;
		font-size: 0.75rem;
		font-family: inherit;
	}
	.caption-save {
		padding: 0.25rem 0.5rem;
	}
	.photo-actions {
		display: flex;
		gap: 0.25rem;
		padding: 0 0.5rem 0.5rem;
		justify-content: space-between;
	}
	.icon-btn {
		flex: 1;
		padding: 0.3rem;
		border-radius: 0.4rem;
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(148, 163, 184, 0.18);
		color: #e2e8f0;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 120ms ease;
	}
	.icon-btn:hover:not(:disabled) {
		border-color: rgba(56, 189, 248, 0.45);
		color: #e0f2fe;
	}
	.icon-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.icon-btn.danger:hover {
		border-color: rgba(251, 113, 133, 0.4);
		color: #fda4af;
	}
	.photo-actions form {
		display: flex;
		flex: 1;
	}
</style>
