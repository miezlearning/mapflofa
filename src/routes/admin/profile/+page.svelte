<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let saving = $state(false);

	// ---- Editable state (structured, friendly) ----
	let headerLabel = $state(data.header.label);
	let headerTitle = $state(data.header.title);
	let headerDesc = $state(data.header.desc);
	let visi = $state(data.visi);
	let misi = $state<string[]>(data.misi.length ? [...data.misi] : ['']);
	let sejarah = $state<string[]>(data.sejarah.length ? [...data.sejarah] : ['']);
	let nilai = $state<{ icon: IconName; title: string; desc: string }[]>(
		data.nilai.length
			? data.nilai.map((n) => ({ icon: n.icon as IconName, title: n.title, desc: n.desc }))
			: [{ icon: 'sprout', title: '', desc: '' }]
	);

	// Contact
	let contactAddress = $state(data.contact.address);
	let contactWhatsapp = $state(data.contact.whatsapp);
	let contactInstagram = $state(data.contact.instagram);
	let contactEmail = $state(data.contact.email);
	let contactExtra = $state(data.contact.extra);
	let contactSocials = $state(data.contact.socials);

	// Icon options for the visual picker, with friendly Indonesian labels.
	const iconOptions: { name: IconName; label: string }[] = [
		{ name: 'sprout', label: 'Tunas' },
		{ name: 'leaf', label: 'Daun' },
		{ name: 'tree', label: 'Pohon' },
		{ name: 'bird', label: 'Burung' },
		{ name: 'users', label: 'Komunitas' },
		{ name: 'book', label: 'Buku' },
		{ name: 'compass', label: 'Kompas' },
		{ name: 'shield', label: 'Perisai' },
		{ name: 'megaphone', label: 'Kampanye' },
		{ name: 'camera', label: 'Kamera' },
		{ name: 'calendar', label: 'Kalender' },
		{ name: 'map-pin', label: 'Lokasi' },
		{ name: 'mail', label: 'Email' },
		{ name: 'newspaper', label: 'Berita' }
	];

	// Which value card currently has its icon picker open.
	let openPicker = $state<number | null>(null);

	function labelFor(name: IconName) {
		return iconOptions.find((o) => o.name === name)?.label ?? name;
	}

	// ---- Misi handlers ----
	function addMisi() {
		misi = [...misi, ''];
	}
	function removeMisi(i: number) {
		misi = misi.filter((_, idx) => idx !== i);
		if (misi.length === 0) misi = [''];
	}
	function moveMisi(i: number, dir: -1 | 1) {
		const j = i + dir;
		if (j < 0 || j >= misi.length) return;
		const copy = [...misi];
		[copy[i], copy[j]] = [copy[j], copy[i]];
		misi = copy;
	}

	// ---- Sejarah handlers ----
	function addSejarah() {
		sejarah = [...sejarah, ''];
	}
	function removeSejarah(i: number) {
		sejarah = sejarah.filter((_, idx) => idx !== i);
		if (sejarah.length === 0) sejarah = [''];
	}

	// ---- Nilai handlers ----
	function addNilai() {
		nilai = [...nilai, { icon: 'sprout', title: '', desc: '' }];
	}
	function removeNilai(i: number) {
		nilai = nilai.filter((_, idx) => idx !== i);
		if (nilai.length === 0) nilai = [{ icon: 'sprout', title: '', desc: '' }];
	}
	function pickIcon(i: number, name: IconName) {
		nilai[i].icon = name;
		openPicker = null;
	}

	// ---- Serialized values for submission (hidden inputs) ----
	const misiValue = $derived(misi.map((m) => m.trim()).filter(Boolean).join('\n'));
	const sejarahValue = $derived(sejarah.map((s) => s.trim()).filter(Boolean).join('\n'));
	const nilaiValue = $derived(
		nilai
			.filter((n) => n.title.trim())
			.map((n) => `${n.icon}|${n.title.trim()}|${n.desc.trim()}`)
			.join('\n')
	);
</script>

<svelte:head>
	<title>Profil · Admin</title>
</svelte:head>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Profil Organisasi</h1>
		<p class="adm-sub">Atur isi halaman Profil. Perubahan langsung tampil setelah disimpan.</p>
	</div>
	<a class="adm-btn" href="/profil" target="_blank" rel="noopener">
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 2.5h-2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1v-2" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><path d="M8 2.5h3.5V6M7 7l4.5-4.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>
		Lihat halaman
	</a>
</div>

{#if form?.ok}
	<div class="adm-flash adm-flash-ok">{form.message}</div>
{:else if form?.message}
	<div class="adm-flash adm-flash-error">{form.message}</div>
{/if}

<form
	method="POST"
	action="?/save"
	use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			await update({ reset: false });
			saving = false;
		};
	}}
>
	<!-- Hidden serialized values that the server reads -->
	<input type="hidden" name="content__profile.header_label" value={headerLabel} />
	<input type="hidden" name="content__profile.header_title" value={headerTitle} />
	<input type="hidden" name="content__profile.header_desc" value={headerDesc} />
	<input type="hidden" name="content__profile.visi" value={visi} />
	<input type="hidden" name="content__profile.misi" value={misiValue} />
	<input type="hidden" name="content__profile.sejarah" value={sejarahValue} />
	<input type="hidden" name="content__profile.nilai" value={nilaiValue} />
	<input type="hidden" name="content__contact.address" value={contactAddress} />
	<input type="hidden" name="content__contact.whatsapp" value={contactWhatsapp} />
	<input type="hidden" name="content__contact.instagram" value={contactInstagram} />
	<input type="hidden" name="content__contact.email" value={contactEmail} />
	<input type="hidden" name="content__contact.extra" value={contactExtra} />
	<input type="hidden" name="content__contact.socials" value={contactSocials} />

	<!-- ===== Section: Header ===== -->
	<section class="card">
		<div class="card-head">
			<h2 class="card-title">Bagian Atas Halaman</h2>
			<p class="card-desc">Teks pembuka yang tampil paling atas di halaman Profil.</p>
		</div>
		<div class="fields">
			<label class="field">
				<span class="lbl">Label kecil <span class="opt">(teks kecil di atas judul)</span></span>
				<input type="text" bind:value={headerLabel} placeholder="Profil Organisasi" maxlength="120" />
			</label>
			<label class="field">
				<span class="lbl">Judul utama</span>
				<input type="text" bind:value={headerTitle} placeholder="Tentang MAPFLOFA" maxlength="160" />
			</label>
			<label class="field">
				<span class="lbl">Deskripsi</span>
				<textarea bind:value={headerDesc} rows="3" placeholder="Penjelasan singkat tentang organisasi…"></textarea>
			</label>
		</div>
	</section>

	<!-- ===== Section: Visi ===== -->
	<section class="card">
		<div class="card-head">
			<h2 class="card-title">Visi</h2>
			<p class="card-desc">Cita-cita besar organisasi dalam satu kalimat.</p>
		</div>
		<label class="field">
			<span class="lbl">Kalimat visi</span>
			<textarea bind:value={visi} rows="3" placeholder="Menjadi wadah mahasiswa yang…"></textarea>
		</label>
	</section>

	<!-- ===== Section: Misi ===== -->
	<section class="card">
		<div class="card-head">
			<h2 class="card-title">Misi</h2>
			<p class="card-desc">Daftar langkah nyata. Tambah atau hapus poin sesuai kebutuhan.</p>
		</div>
		<div class="list">
			{#each misi as _, i (i)}
				<div class="list-row">
					<span class="row-num">{i + 1}</span>
					<input type="text" bind:value={misi[i]} placeholder="Tulis satu poin misi…" />
					<div class="row-actions">
						<button type="button" class="icon-btn" title="Naikkan" onclick={() => moveMisi(i, -1)} disabled={i === 0} aria-label="Naikkan poin">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
						</button>
						<button type="button" class="icon-btn" title="Turunkan" onclick={() => moveMisi(i, 1)} disabled={i === misi.length - 1} aria-label="Turunkan poin">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
						</button>
						<button type="button" class="icon-btn danger" title="Hapus" onclick={() => removeMisi(i)} aria-label="Hapus poin">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
						</button>
					</div>
				</div>
			{/each}
		</div>
		<button type="button" class="add-btn" onclick={addMisi}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
			Tambah poin misi
		</button>
	</section>

	<!-- ===== Section: Nilai ===== -->
	<section class="card">
		<div class="card-head">
			<h2 class="card-title">Nilai / Prinsip</h2>
			<p class="card-desc">Kartu prinsip yang dipegang organisasi. Pilih ikon, lalu isi judul dan keterangannya.</p>
		</div>
		<div class="nilai-grid">
			{#each nilai as item, i (i)}
				<div class="nilai-card">
					<div class="nilai-top">
						<!-- Icon picker -->
						<div class="picker">
							<button
								type="button"
								class="picker-trigger"
								onclick={() => (openPicker = openPicker === i ? null : i)}
								aria-label="Pilih ikon"
							>
								<span class="picker-icon"><Icon name={item.icon} size={22} /></span>
								<span class="picker-meta">
									<span class="picker-name">{labelFor(item.icon)}</span>
									<span class="picker-hint">Ganti ikon</span>
								</span>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
							</button>

							{#if openPicker === i}
								<div class="picker-pop">
									{#each iconOptions as opt (opt.name)}
										<button
											type="button"
											class="picker-opt"
											class:active={opt.name === item.icon}
											onclick={() => pickIcon(i, opt.name)}
											title={opt.label}
										>
											<Icon name={opt.name} size={20} />
											<span>{opt.label}</span>
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<button type="button" class="icon-btn danger remove-nilai" title="Hapus nilai" onclick={() => removeNilai(i)} aria-label="Hapus nilai">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
						</button>
					</div>

					<label class="field">
						<span class="lbl">Judul nilai</span>
						<input type="text" bind:value={item.title} placeholder="cth. Lestari" maxlength="60" />
					</label>
					<label class="field">
						<span class="lbl">Keterangan singkat</span>
						<input type="text" bind:value={item.desc} placeholder="cth. Menjaga alam untuk generasi mendatang" maxlength="120" />
					</label>
				</div>
			{/each}
		</div>
		<button type="button" class="add-btn" onclick={addNilai}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
			Tambah nilai
		</button>
	</section>

	<!-- ===== Section: Sejarah ===== -->
	<section class="card">
		<div class="card-head">
			<h2 class="card-title">Sejarah</h2>
			<p class="card-desc">Cerita organisasi. Setiap kotak menjadi satu paragraf.</p>
		</div>
		<div class="list">
			{#each sejarah as _, i (i)}
				<div class="list-row align-top">
					<span class="row-num">{i + 1}</span>
					<textarea bind:value={sejarah[i]} rows="3" placeholder="Tulis satu paragraf cerita…"></textarea>
					<div class="row-actions">
						<button type="button" class="icon-btn danger" title="Hapus paragraf" onclick={() => removeSejarah(i)} aria-label="Hapus paragraf">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
						</button>
					</div>
				</div>
			{/each}
		</div>
		<button type="button" class="add-btn" onclick={addSejarah}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
			Tambah paragraf
		</button>
	</section>

	<!-- ===== Section: Kontak (Footer) ===== -->
	<section class="card">
		<div class="card-head">
			<h2 class="card-title">Kontak &amp; Footer</h2>
			<p class="card-desc">Info kontak yang tampil di bagian bawah website. Tambah kontak baru kapan saja.</p>
		</div>
		<div class="fields">
			<label class="field">
				<span class="lbl">Alamat</span>
				<textarea bind:value={contactAddress} rows="2" placeholder="Sekretariat MAPFLOFA, Gedung UKM..."></textarea>
			</label>
			<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
				<label class="field">
					<span class="lbl">WhatsApp</span>
					<input type="text" bind:value={contactWhatsapp} placeholder="+62 812-3456-7890" />
				</label>
				<label class="field">
					<span class="lbl">Instagram</span>
					<input type="text" bind:value={contactInstagram} placeholder="@mapflofa" />
				</label>
			</div>
			<label class="field">
				<span class="lbl">Email</span>
				<input type="text" bind:value={contactEmail} placeholder="halo@mapflofa.org" />
			</label>
			<label class="field">
				<span class="lbl">Kontak tambahan <span class="opt">(opsional)</span></span>
				<textarea bind:value={contactExtra} rows="3" placeholder="Satu kontak per baris, format: Label|Nilai&#10;cth: YouTube|youtube.com/@mapflofa"></textarea>
				<span class="field-hint">Satu per baris. Format: Label|Nilai (mis. Facebook|fb.com/mapflofa). Akan ditampilkan di footer.</span>
			</label>
		</div>
	</section>

	<!-- Sticky save bar -->
	<div class="save-bar">
		<span class="save-hint">Pastikan semua isian sudah benar sebelum menyimpan.</span>
		<button type="submit" class="adm-btn adm-btn-primary" disabled={saving}>
			{saving ? 'Menyimpan…' : 'Simpan Semua Perubahan'}
		</button>
	</div>
</form>

<style>
	.card {
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		border-radius: 0.875rem;
		padding: 1.5rem;
		margin-bottom: 1.25rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	}

	.card-head {
		margin-bottom: 1.25rem;
	}

	.card-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-ink, #333);
	}

	.card-desc {
		margin: 0.25rem 0 0;
		font-size: 0.8125rem;
		color: var(--color-muted, #6b7b8c);
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		min-width: 0;
	}

	.lbl {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-ink, #333);
	}

	.opt {
		font-weight: 400;
		color: var(--color-muted, #6b7b8c);
	}

	input[type='text'],
	textarea {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		color: var(--color-ink, #333);
		font-family: inherit;
		font-size: 0.875rem;
		outline: none;
		transition: border-color 150ms ease, box-shadow 150ms ease;
	}

	textarea {
		line-height: 1.55;
		resize: vertical;
	}

	input[type='text']:focus,
	textarea:focus {
		border-color: var(--color-primary, #6eaee8);
		box-shadow: 0 0 0 3px rgba(110, 174, 232, 0.12);
	}

	/* ---- Repeatable list rows ---- */
	.list {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.list-row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.list-row.align-top {
		align-items: flex-start;
	}

	.row-num {
		flex-shrink: 0;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background: var(--color-surface-2, #e8f4fd);
		color: var(--color-primary, #6eaee8);
		font-size: 0.75rem;
		font-weight: 800;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.list-row.align-top .row-num {
		margin-top: 0.5rem;
	}

	.row-actions {
		display: flex;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		color: var(--color-muted, #6b7b8c);
		cursor: pointer;
		transition: all 150ms ease;
	}

	.icon-btn:hover:not(:disabled) {
		border-color: var(--color-primary, #6eaee8);
		color: var(--color-primary, #6eaee8);
	}

	.icon-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.icon-btn.danger:hover:not(:disabled) {
		border-color: #fecaca;
		color: #dc2626;
		background: #fef2f2;
	}

	.add-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 1rem;
		padding: 0.5rem 0.875rem;
		border-radius: 0.5rem;
		border: 1px dashed var(--color-line, #e3eef7);
		background: var(--color-surface-3, #f0f8ff);
		color: var(--color-primary, #6eaee8);
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 150ms ease;
	}

	.add-btn:hover {
		border-color: var(--color-primary, #6eaee8);
		background: var(--color-surface-2, #e8f4fd);
	}

	/* ---- Nilai cards + icon picker ---- */
	.nilai-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1rem;
	}

	.nilai-card {
		border: 1px solid var(--color-line, #e3eef7);
		border-radius: 0.75rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		background: var(--color-surface-3, #f0f8ff);
	}

	.nilai-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.picker {
		position: relative;
		flex: 1;
		min-width: 0;
	}

	.picker-trigger {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.5rem 0.625rem;
		border-radius: 0.5rem;
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		cursor: pointer;
		text-align: left;
		transition: border-color 150ms ease;
	}

	.picker-trigger:hover {
		border-color: var(--color-primary, #6eaee8);
	}

	.picker-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.5rem;
		background: var(--color-surface-2, #e8f4fd);
		color: var(--color-primary, #6eaee8);
		flex-shrink: 0;
	}

	.picker-meta {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.picker-name {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--color-ink, #333);
	}

	.picker-hint {
		font-size: 0.6875rem;
		color: var(--color-muted, #6b7b8c);
	}

	.picker-pop {
		position: absolute;
		top: calc(100% + 0.375rem);
		left: 0;
		right: 0;
		z-index: 20;
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		border-radius: 0.625rem;
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
		padding: 0.5rem;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.25rem;
		max-height: 16rem;
		overflow-y: auto;
	}

	.picker-opt {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		border: 1px solid transparent;
		background: transparent;
		color: var(--color-ink, #333);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 120ms ease;
	}

	.picker-opt:hover {
		background: var(--color-surface-2, #e8f4fd);
	}

	.picker-opt.active {
		border-color: var(--color-primary, #6eaee8);
		background: var(--color-surface-2, #e8f4fd);
		color: var(--color-primary, #6eaee8);
	}

	.remove-nilai {
		flex-shrink: 0;
	}

	/* ---- Sticky save bar ---- */
	.save-bar {
		position: sticky;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		padding: 1rem 1.25rem;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(10px);
		border: 1px solid var(--color-line, #e3eef7);
		border-radius: 0.875rem;
		box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
	}

	.save-hint {
		font-size: 0.8125rem;
		color: var(--color-muted, #6b7b8c);
	}
</style>
