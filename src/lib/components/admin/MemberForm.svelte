<script lang="ts">
	import { enhance } from '$app/forms';

	type Values = Record<string, unknown> | null;

	type Props = {
		values?: Values;
		fieldErrors?: Record<string, string[] | undefined> | null;
		message?: string | null;
		submitLabel?: string;
		cancelHref: string;
		divisions?: string[];
		customGroups?: string[];
	};

	let {
		values = null,
		fieldErrors = null,
		message = null,
		submitLabel = 'Simpan',
		cancelHref,
		divisions = [],
		customGroups = []
	}: Props = $props();

	let submitting = $state(false);

	function initStr(name: string, fallback = ''): string {
		const v = values?.[name];
		if (v === null || v === undefined) return fallback;
		return String(v);
	}

	const PRESET_GROUPS = ['pelindung', 'penanggung_jawab', 'pembina', 'pengurus', 'divisi'];

	function humanize(key: string): string {
		const map: Record<string, string> = {
			pelindung: 'Pelindung',
			penanggung_jawab: 'Penanggung Jawab',
			pembina: 'Pembina',
			pengurus: 'Pengurus Inti',
			divisi: 'Divisi'
		};
		if (map[key]) return map[key];
		return key
			.replace(/[_-]+/g, ' ')
			.trim()
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.replace(/\s+/g, '_')
			.replace(/[^a-z0-9_]/g, '')
			.replace(/_+/g, '_')
			.replace(/^_|_$/g, '');
	}

	// ---- Editable state ----
	const initialGroup = initStr('group', 'pengurus');
	const isPresetInitial = PRESET_GROUPS.includes(initialGroup);

	let groupChoice = $state(isPresetInitial ? initialGroup : '__custom__');
	let customGroup = $state(isPresetInitial ? '' : humanize(initialGroup));

	const groupValue = $derived(
		groupChoice === '__custom__' ? slugify(customGroup) || 'pengurus' : groupChoice
	);

	let name = $state(initStr('name'));
	let position = $state(initStr('position'));
	let nim = $state(initStr('nim'));
	let division = $state(initStr('division'));
	let description = $state(initStr('description'));
	let tupoksi = $state(initStr('tupoksi'));
	let period = $state(initStr('period'));
	let sortOrder = $state(initStr('sortOrder', '0'));
	let photoUrl = $state(initStr('photo'));
	let isFeatured = $state(
		values?.isFeatured === undefined ? false : Boolean(values?.isFeatured)
	);
	let isActive = $state(values?.isActive === undefined ? true : Boolean(values?.isActive));

	// Built-in preset cards + any custom groups already used in the DB.
	const presetCards = [
		{ value: 'pelindung', label: 'Pelindung', hint: 'Pejabat pelindung (mis. Dekan)' },
		{ value: 'penanggung_jawab', label: 'Penanggung Jawab', hint: 'Mis. Wakil Dekan III' },
		{ value: 'pembina', label: 'Pembina', hint: 'Dosen pembina organisasi' },
		{ value: 'pengurus', label: 'Pengurus Inti', hint: 'Ketua, Wakil, Sekretaris, Bendahara' },
		{ value: 'divisi', label: 'Divisi', hint: 'Koordinator & anggota divisi' }
	];
	const extraGroupCards = $derived(
		customGroups
			.filter((g) => !PRESET_GROUPS.includes(g))
			.map((g) => ({ value: g, label: humanize(g), hint: 'Kelompok khusus' }))
	);

	// Field visibility per group — keeps the form simple & contextual.
	const councilGroups = ['pelindung', 'penanggung_jawab', 'pembina'];
	const isCouncil = $derived(councilGroups.includes(groupValue));
	const isDivisi = $derived(groupValue === 'divisi');
	const showNim = $derived(!isCouncil);
	const showFeatured = $derived(!isCouncil);
	const showRichFields = $derived(isFeatured);

	// Suggested position label depending on group
	const positionPlaceholder = $derived(
		groupValue === 'pelindung'
			? 'cth. Dekan FKLT UNMUL'
			: groupValue === 'penanggung_jawab'
				? 'cth. Wakil Dekan III'
				: groupValue === 'pembina'
					? 'Pembina'
					: groupValue === 'divisi'
						? 'cth. Koordinator / Anggota'
						: 'cth. Ketua Umum'
	);

	let photoPreview = $state('');
	function onPhotoFile(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) photoPreview = URL.createObjectURL(file);
	}

	function err(n: string): string | null {
		return fieldErrors?.[n]?.[0] ?? null;
	}
</script>

{#if message}
	<div class="adm-flash adm-flash-error">{message}</div>
{/if}

<form
	method="POST"
	enctype="multipart/form-data"
	class="member-form"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	<!-- ===== Step 1: Tingkatan ===== -->
	<fieldset class="group-field">
		<legend class="lbl">1. Posisi ini termasuk kelompok apa?</legend>
		<input type="hidden" name="group" value={groupValue} />
		<div class="group-options">
			{#each presetCards as g (g.value)}
				<label class="group-opt" class:active={groupChoice === g.value}>
					<input type="radio" value={g.value} bind:group={groupChoice} />
					<span class="group-opt-label">{g.label}</span>
					<span class="group-opt-hint">{g.hint}</span>
				</label>
			{/each}
			{#each extraGroupCards as g (g.value)}
				<label class="group-opt" class:active={groupChoice === g.value}>
					<input type="radio" value={g.value} bind:group={groupChoice} />
					<span class="group-opt-label">{g.label}</span>
					<span class="group-opt-hint">{g.hint}</span>
				</label>
			{/each}
			<label class="group-opt" class:active={groupChoice === '__custom__'}>
				<input type="radio" value="__custom__" bind:group={groupChoice} />
				<span class="group-opt-label">+ Kelompok lain</span>
				<span class="group-opt-hint">Buat kelompok baru sendiri</span>
			</label>
		</div>
		{#if groupChoice === '__custom__'}
			<div class="custom-group">
				<label class="field">
					<span class="lbl">Nama kelompok baru</span>
					<input type="text" bind:value={customGroup} maxlength="60" placeholder="cth. Dewan Penasihat" />
					<span class="field-hint">Kelompok ini akan muncul sebagai bagian tersendiri di halaman Profil.</span>
				</label>
			</div>
		{/if}
	</fieldset>

	<!-- ===== Step 2: Identitas ===== -->
	<div class="section">
		<div class="section-title">2. Identitas</div>
		<div class="grid-2">
			<label class="field">
				<span class="lbl">Nama lengkap <span class="req">*</span></span>
				<input type="text" name="name" bind:value={name} required maxlength="160" placeholder="cth. Zidan Ata Mawla" />
				{#if err('name')}<span class="field-error">{err('name')}</span>{/if}
			</label>
			<label class="field">
				<span class="lbl">Jabatan <span class="req">*</span></span>
				<input type="text" name="position" bind:value={position} required maxlength="160" placeholder={positionPlaceholder} />
				{#if err('position')}<span class="field-error">{err('position')}</span>{/if}
			</label>
		</div>

		{#if showNim}
			<label class="field">
				<span class="lbl">NIM <span class="opt">(Nomor Induk Mahasiswa)</span></span>
				<input type="text" name="nim" bind:value={nim} maxlength="40" placeholder="cth. 2304016076" />
				{#if err('nim')}<span class="field-error">{err('nim')}</span>{/if}
			</label>
		{:else}
			<input type="hidden" name="nim" value="" />
		{/if}

		{#if isDivisi}
			<label class="field">
				<span class="lbl">Nama divisi <span class="req">*</span></span>
				<input type="text" name="division" bind:value={division} maxlength="160" placeholder="cth. Divisi Flora" list="division-list" />
				<datalist id="division-list">
					{#each divisions as d (d)}
						<option value={d}></option>
					{/each}
				</datalist>
				<span class="field-hint">
					{#if divisions.length > 0}
						Ketik nama baru atau pilih yang sudah ada. Anggota dengan divisi sama akan dikelompokkan otomatis.
					{:else}
						Anggota dengan nama divisi yang sama akan dikelompokkan otomatis.
					{/if}
				</span>
			</label>
		{:else}
			<input type="hidden" name="division" value={division} />
		{/if}
	</div>

	<!-- ===== Step 3: Tampilan ===== -->
	{#if showFeatured}
		<div class="section">
			<div class="section-title">3. Tampilan di Website</div>
			<label class="toggle-card" class:active={isFeatured}>
				<input type="checkbox" name="isFeatured" bind:checked={isFeatured} />
				<span class="toggle-body">
					<span class="toggle-title">Tampilkan menonjol dengan foto besar</span>
					<span class="toggle-hint">
						Aktifkan untuk orang penting (Ketua, Wakil, Sekretaris, Bendahara, Koordinator) agar
						muncul di galeri foto interaktif. Anggota biasa cukup nonaktif — hanya tampil sebagai nama &amp; NIM.
					</span>
				</span>
			</label>
		</div>
	{:else}
		<input type="hidden" name="isFeatured" value="false" />
	{/if}

	<!-- ===== Step 4: Detail (only when featured) ===== -->
	{#if showRichFields}
		<div class="section">
			<div class="section-title">4. Foto &amp; Detail</div>

			<label class="field">
				<span class="lbl">Foto</span>
				<input type="file" name="photoFile" accept="image/*" onchange={onPhotoFile} />
				<span class="field-hint">Foto potret latar polos/putih paling rapi. JPG, PNG, WebP (maks 15 MB).</span>
			</label>
			<label class="field">
				<span class="lbl">…atau tempel URL foto</span>
				<input type="text" name="photo" bind:value={photoUrl} placeholder="https://…" />
				{#if err('photo')}<span class="field-error">{err('photo')}</span>{/if}
			</label>

			{#if photoPreview || photoUrl}
				<div class="photo-preview">
					<img src={photoPreview || photoUrl} alt="Pratinjau foto" />
				</div>
			{/if}

			<label class="field">
				<span class="lbl">Deskripsi singkat</span>
				<input type="text" name="description" bind:value={description} maxlength="300" placeholder="cth. Pemimpin organisasi" />
				<span class="field-hint">Kalimat pendek di bawah nama.</span>
			</label>

			<label class="field">
				<span class="lbl">Tugas Pokok &amp; Fungsi</span>
				<textarea name="tupoksi" bind:value={tupoksi} rows="6" placeholder="Tulis satu tugas per baris…"></textarea>
				<span class="field-hint">Satu poin tugas per baris. Tampil di halaman detail saat foto diklik.</span>
			</label>
		</div>
	{:else}
		<!-- Keep values present so they're not wiped on save -->
		<input type="hidden" name="photo" value={photoUrl} />
		<input type="hidden" name="description" value={description} />
		<input type="hidden" name="tupoksi" value={tupoksi} />
	{/if}

	<!-- ===== Pengaturan lain ===== -->
	<div class="section">
		<div class="section-title">Pengaturan</div>
		<div class="grid-2">
			<label class="field">
				<span class="lbl">Urutan tampil</span>
				<input type="number" name="sortOrder" bind:value={sortOrder} min="0" />
				<span class="field-hint">Angka kecil tampil lebih dulu.</span>
			</label>
			<label class="field">
				<span class="lbl">Periode <span class="opt">(opsional)</span></span>
				<input type="text" name="period" bind:value={period} maxlength="60" placeholder="cth. 2026" />
			</label>
		</div>
		<label class="check">
			<input type="checkbox" name="isActive" bind:checked={isActive} />
			<span>Tampilkan di halaman publik</span>
		</label>
	</div>

	<div class="form-actions">
		<button type="submit" class="adm-btn adm-btn-primary" disabled={submitting}>
			{submitting ? 'Menyimpan…' : submitLabel}
		</button>
		<a href={cancelHref} class="adm-btn">Batal</a>
	</div>
</form>

<style>
	.member-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.lbl {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-ink, #333);
	}

	.req {
		color: #dc2626;
	}

	.opt {
		font-weight: 400;
		color: var(--color-muted, #6b7b8c);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		min-width: 0;
	}

	.field-hint {
		font-size: 0.75rem;
		color: var(--color-muted, #6b7b8c);
	}

	.field-error {
		font-size: 0.75rem;
		color: #dc2626;
		font-weight: 600;
	}

	.member-form input[type='text'],
	.member-form input[type='number'],
	.member-form textarea {
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

	.member-form textarea {
		line-height: 1.55;
		resize: vertical;
	}

	.member-form input[type='text']:focus,
	.member-form input[type='number']:focus,
	.member-form textarea:focus {
		border-color: var(--color-primary, #6eaee8);
		box-shadow: 0 0 0 3px rgba(110, 174, 232, 0.12);
	}

	.grid-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	@media (max-width: 640px) {
		.grid-2 { grid-template-columns: 1fr; }
	}

	/* ---- Section blocks ---- */
	.section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--color-line, #e3eef7);
	}

	.section-title {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-ink, #333);
	}

	/* ---- Group radio cards ---- */
	.group-field {
		border: 0;
		padding: 0;
		margin: 0;
	}

	.group-field legend {
		padding: 0;
		margin-bottom: 0.75rem;
	}

	.group-options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.5rem;
	}

	.group-opt {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.75rem 0.875rem;
		border: 1px solid var(--color-line, #e3eef7);
		border-radius: 0.625rem;
		cursor: pointer;
		background: #fff;
		transition: all 150ms ease;
	}

	.group-opt:hover {
		border-color: var(--color-primary, #6eaee8);
	}

	.group-opt.active {
		border-color: var(--color-primary, #6eaee8);
		background: var(--color-surface-2, #e8f4fd);
	}

	.group-opt input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.group-opt-label {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--color-ink, #333);
	}

	.group-opt.active .group-opt-label {
		color: var(--color-primary, #6eaee8);
	}

	.group-opt-hint {
		font-size: 0.6875rem;
		color: var(--color-muted, #6b7b8c);
		line-height: 1.3;
	}

	.custom-group {
		margin-top: 0.75rem;
		padding: 0.875rem;
		border: 1px solid var(--color-line, #e3eef7);
		border-radius: 0.625rem;
		background: var(--color-surface-3, #f0f8ff);
	}

	/* ---- Featured toggle card ---- */
	.toggle-card {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid var(--color-line, #e3eef7);
		border-radius: 0.75rem;
		cursor: pointer;
		background: #fff;
		transition: all 150ms ease;
	}

	.toggle-card.active {
		border-color: var(--color-primary, #6eaee8);
		background: var(--color-surface-2, #e8f4fd);
	}

	.toggle-card input {
		margin-top: 0.2rem;
		width: 1.1rem;
		height: 1.1rem;
		flex-shrink: 0;
		accent-color: var(--color-primary, #6eaee8);
	}

	.toggle-body {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.toggle-title {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-ink, #333);
	}

	.toggle-hint {
		font-size: 0.75rem;
		color: var(--color-muted, #6b7b8c);
		line-height: 1.4;
	}

	.photo-preview img {
		max-width: 10rem;
		border-radius: 0.75rem;
		border: 1px solid var(--color-line, #e3eef7);
	}

	.check {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-ink, #333);
		cursor: pointer;
	}

	.check input {
		width: 1.1rem;
		height: 1.1rem;
		accent-color: var(--color-primary, #6eaee8);
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--color-line, #e3eef7);
	}
</style>
