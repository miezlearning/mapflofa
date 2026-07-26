<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const album = $derived(data.album);
	const photos = $derived(data.photos);

	let savingAlbum = $state(false);
	let uploading = $state(false);
	let newCoverPreview = $state('');

	let eventDate = $state(album.eventDate ?? '');

	function setTodayDate() {
		const now = new Date();
		eventDate = now.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function onDatePickerChange(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		if (!val) return;
		const [y, m, d] = val.split('-').map(Number);
		if (isNaN(y) || isNaN(m) || isNaN(d)) return;
		const dateObj = new Date(y, m - 1, d);
		eventDate = dateObj.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

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
			· {photos.length} foto dalam album
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
			<div class="flex flex-col gap-1.5 mb-4">
				<span class="field-label">Tanggal kegiatan</span>
				<div class="flex items-center gap-2">
					<div class="relative flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xs cursor-pointer hover:border-sky-400 dark:hover:border-sky-600 transition-colors flex-1">
						<span class="text-emerald-500 font-bold text-xs" aria-hidden="true">📅</span>
						<input
							type="text"
							name="eventDate"
							class="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-transparent outline-none w-full placeholder:text-slate-400"
							placeholder="26 Juli 2026"
							bind:value={eventDate}
							maxlength="40"
						/>
						<span class="text-[10px] text-slate-400" aria-hidden="true">▾</span>

						<!-- Hidden overlay date picker -->
						<input
							type="date"
							onchange={onDatePickerChange}
							class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
							title="Klik untuk memilih tanggal dari kalender"
						/>
					</div>

					<button
						type="button"
						onclick={setTodayDate}
						class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs shrink-0"
						title="Set ke tanggal hari ini"
					>
						⚡ Hari ini
					</button>
				</div>
			</div>
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
			<div class="cover-info">
				💡 Foto sampul akan tampil sebagai foto pertama di halaman publik galeri.
				Gunakan tombol ★ pada foto di bawah untuk menjadikan foto tersebut sebagai sampul.
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
				<span class="field-hint">JPG, PNG, WebP, atau GIF. Maks 15 MB per file.</span>
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
		color: var(--color-ink, #333);
		margin: 0 0 1rem;
	}
	.slug {
		color: var(--color-primary, #6eaee8);
		text-decoration: none;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
	}
	.cover-now img {
		max-width: 100%;
		border-radius: 0.625rem;
		border: 1px solid var(--color-line, #e3eef7);
	}
	.cover-empty {
		padding: 1.5rem;
		text-align: center;
		color: var(--color-muted, #6b7b8c);
		border: 1px dashed var(--color-line, #e3eef7);
		border-radius: 0.625rem;
		font-size: 0.8125rem;
	}
	.cover-info {
		margin-top: 0.5rem;
		padding: 0.625rem 0.75rem;
		font-size: 0.75rem;
		line-height: 1.5;
		color: var(--color-muted, #6b7b8c);
		background: var(--color-surface-3, #f0f8ff);
		border-radius: 0.5rem;
		border: 1px solid var(--color-line, #e3eef7);
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
		border: 1px solid var(--color-line, #e3eef7);
		border-radius: 0.75rem;
		overflow: hidden;
		background: #fff;
		display: flex;
		flex-direction: column;
		box-shadow: 0 1px 3px rgba(0,0,0,0.04);
	}
	.photo-thumb {
		position: relative;
		aspect-ratio: 4 / 3;
		background: var(--color-surface-3, #f0f8ff);
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
		color: #fff;
		background: var(--color-primary, #6eaee8);
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
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		color: var(--color-ink, #333);
		font-size: 0.75rem;
		font-family: inherit;
	}
	.caption-input:focus {
		border-color: var(--color-primary, #6eaee8);
		outline: none;
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
		background: var(--color-surface-3, #f0f8ff);
		border: 1px solid var(--color-line, #e3eef7);
		color: var(--color-ink, #333);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 120ms ease;
	}
	.icon-btn:hover:not(:disabled) {
		border-color: var(--color-primary, #6eaee8);
		color: var(--color-primary, #6eaee8);
	}
	.icon-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.icon-btn.danger:hover {
		border-color: #fecaca;
		color: #dc2626;
	}
	.photo-actions form {
		display: flex;
		flex: 1;
	}
</style>
