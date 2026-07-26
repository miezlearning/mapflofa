<script lang="ts">
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { form }: { form: ActionData } = $props();

	let title = $state('');
	let slug = $state('');
	let slugTouched = $state(false);
	let coverPreview = $state('');
	let submitting = $state(false);

	function autoSlug(t: string) {
		return t
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 120);
	}

	$effect(() => {
		if (!slugTouched) slug = autoSlug(title);
	});

	function onCoverFile(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) coverPreview = URL.createObjectURL(file);
	}
</script>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Album Baru</h1>
		<p class="adm-sub">Buat album kegiatan, lalu tambahkan foto di langkah berikutnya.</p>
	</div>
	<a class="adm-btn" href="/admin/gallery">← Kembali</a>
</div>

{#if form?.message}
	<div class="adm-flash adm-flash-error">{form.message}</div>
{/if}

<div class="adm-card">
	<form
		method="POST"
		enctype="multipart/form-data"
		class="adm-form"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
	>
		<label>
			<span class="field-label">Judul album *</span>
			<input name="title" bind:value={title} placeholder="cth. Penanaman Pohon 2026" required />
			{#if form?.fieldErrors?.title}<span class="field-error">{form.fieldErrors.title[0]}</span>{/if}
		</label>

		<label>
			<span class="field-label">Slug</span>
			<input
				name="slug"
				bind:value={slug}
				oninput={() => (slugTouched = true)}
				placeholder="penanaman-pohon-2026"
			/>
			<span class="field-hint">Dipakai pada URL: /galeri/{slug || 'slug-album'}</span>
			{#if form?.fieldErrors?.slug}<span class="field-error">{form.fieldErrors.slug[0]}</span>{/if}
		</label>

		<label>
			<span class="field-label">Deskripsi</span>
			<textarea name="description" rows="3" placeholder="Ceritakan singkat tentang kegiatan ini.">{(form?.values?.description as string) ?? ''}</textarea>
		</label>

		<div class="grid-2">
			<label>
				<span class="field-label">Tanggal kegiatan</span>
				<input name="eventDate" value={(form?.values?.eventDate as string) ?? ''} placeholder="cth. Mei 2026" />
			</label>
			<label>
				<span class="field-label">Urutan tampil</span>
				<input name="sortOrder" type="number" min="0" value="0" />
				<span class="field-hint">Angka kecil tampil lebih dulu.</span>
			</label>
		</div>

		<label>
			<span class="field-label">Sampul album</span>
			<input type="file" name="coverFile" accept="image/*" onchange={onCoverFile} />
			<span class="field-hint">Opsional. JPG, PNG, WebP, atau GIF (maks 15 MB). Bisa juga tempel URL di bawah.</span>
		</label>

		<label>
			<span class="field-label">…atau URL sampul</span>
			<input name="coverImage" value={(form?.values?.coverImage as string) ?? ''} placeholder="https://…" />
		</label>

		{#if coverPreview}
			<img src={coverPreview} alt="Pratinjau sampul" class="cover-preview" />
		{/if}

		<label class="check">
			<input type="checkbox" name="isPublished" checked />
			<span class="field-label" style="margin:0">Publikasikan album (tampil di halaman publik)</span>
		</label>

		<div class="form-actions">
			<button class="adm-btn adm-btn-primary" type="submit" disabled={submitting}>
				{submitting ? 'Menyimpan…' : 'Simpan & tambah foto'}
			</button>
			<a class="adm-btn" href="/admin/gallery">Batal</a>
		</div>
	</form>
</div>

<style>
	.grid-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	@media (max-width: 640px) {
		.grid-2 {
			grid-template-columns: 1fr;
		}
	}
	.cover-preview {
		max-width: 18rem;
		border-radius: 0.625rem;
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
</style>
