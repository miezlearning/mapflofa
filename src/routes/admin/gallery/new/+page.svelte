<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
	import AdminTourGuide, { type TourStep } from '$lib/components/admin/AdminTourGuide.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let title = $state('');
	let slug = $state('');
	let slugTouched = $state(false);
	let coverPreview = $state('');
	let submitting = $state(false);
	let tourActive = $state(false);

	let eventDate = $state(
		(form?.values?.eventDate as string) ?? data?.initial?.eventDate ?? ''
	);

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

	const tourSteps: TourStep[] = [
		{
			target: '[data-tour="album-title"]',
			title: 'Judul Album Kegiatan',
			content: 'Tuliskan nama atau judul kegiatan utama (contoh: Penanaman 1000 Mangrove 2026).'
		},
		{
			target: '[data-tour="album-slug"]',
			title: 'Slug URL Publik',
			content: 'URL unik halaman galeripublik. Terbuat otomatis dari judul atau bisa disesuaikan manual.'
		},
		{
			target: '[data-tour="album-desc"]',
			title: 'Deskripsi Singkat',
			content: 'Tulis ringkasan mengenai latar belakang, lokasi, atau tujuan dari kegiatan ini.'
		},
		{
			target: '[data-tour="album-date"]',
			title: 'Tanggal Rilis / Pelaksanaan',
			content: 'Gunakan kalender interaktif atau tombol Hari Ini untuk mengisi tanggal pelaksanaan kegiatan.'
		},
		{
			target: '[data-tour="album-sort"]',
			title: 'Urutan Tampil Album',
			content: 'Angka lebih kecil akan membuat album ditampilkan lebih awal pada daftar galeri.'
		},
		{
			target: '[data-tour="album-cover"]',
			title: 'Foto Sampul Album',
			content: 'Pilih foto utama album dari komputer Anda atau masukkan URL gambar langsung.'
		},
		{
			target: '[data-tour="album-publish"]',
			title: 'Status Publikasi',
			content: 'Centang opsi ini agar album langsung tampil di halaman publik pengunjung situs.'
		}
	];

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

<AdminTourGuide steps={tourSteps} bind:active={tourActive} tourKey="gallery-new" />

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Album Baru</h1>
		<p class="adm-sub">Buat album kegiatan, lalu tambahkan foto di langkah berikutnya.</p>
	</div>
	<div class="flex items-center gap-2">
		<button
			type="button"
			class="adm-btn"
			onclick={() => (tourActive = true)}
			style="background: var(--color-surface-3, #f0f9ff); border-color: var(--color-primary, #0284c7); color: var(--color-primary, #0284c7); font-weight: 700; display: inline-flex; align-items: center; gap: 0.375rem;"
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"/>
				<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
				<line x1="12" y1="17" x2="12.01" y2="17"/>
			</svg>
			<span>Panduan Album Baru</span>
		</button>
		<a class="adm-btn" href="/admin/gallery">← Kembali</a>
	</div>
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
		<label data-tour="album-title">
			<span class="field-label">Judul album *</span>
			<input name="title" bind:value={title} placeholder="cth. Penanaman Pohon 2026" required />
			{#if form?.fieldErrors?.title}<span class="field-error">{form.fieldErrors.title[0]}</span>{/if}
		</label>

		<label data-tour="album-slug">
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

		<label data-tour="album-desc">
			<span class="field-label">Deskripsi</span>
			<textarea name="description" rows="3" placeholder="Ceritakan singkat tentang kegiatan ini.">{(form?.values?.description as string) ?? ''}</textarea>
		</label>

		<div class="grid-2">
			<div class="flex flex-col gap-1.5" data-tour="album-date">
				<span class="field-label">Tanggal kegiatan</span>
				<div class="flex items-center gap-2">
					<div class="relative flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xs cursor-pointer hover:border-sky-400 dark:hover:border-sky-600 transition-colors flex-1">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500 shrink-0" aria-hidden="true">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
							<line x1="16" y1="2" x2="16" y2="6"/>
							<line x1="8" y1="2" x2="8" y2="6"/>
							<line x1="3" y1="10" x2="21" y2="10"/>
						</svg>
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
						Hari Ini
					</button>
				</div>
			</div>

			<label data-tour="album-sort">
				<span class="field-label">Urutan tampil</span>
				<input name="sortOrder" type="number" min="0" value="0" />
				<span class="field-hint">Angka kecil tampil lebih dulu.</span>
			</label>
		</div>

		<label data-tour="album-cover">
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

		<label class="check" data-tour="album-publish">
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
