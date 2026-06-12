<script lang="ts">
	import { enhance } from '$app/forms';

	type Values = Record<string, unknown> | null;

	type Props = {
		values?: Values;
		fieldErrors?: Record<string, string[] | undefined> | null;
		message?: string | null;
		submitLabel?: string;
		cancelHref: string;
	};

	let {
		values = null,
		fieldErrors = null,
		message = null,
		submitLabel = 'Simpan',
		cancelHref
	}: Props = $props();

	let submitting = $state(false);

	function val(name: string): string {
		const v = values?.[name];
		if (v === null || v === undefined) return '';
		return String(v);
	}

	const isActive = $derived(values?.isActive === undefined ? true : Boolean(values?.isActive));

	let photoPreview = $state('');
	function onPhotoFile(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) photoPreview = URL.createObjectURL(file);
	}

	function err(name: string): string | null {
		return fieldErrors?.[name]?.[0] ?? null;
	}
</script>

{#if message}
	<div class="adm-flash adm-flash-error">{message}</div>
{/if}

<form
	method="POST"
	enctype="multipart/form-data"
	class="adm-form"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	<div class="grid-2">
		<label>
			<span class="field-label">Nama <span style="color:#dc2626">*</span></span>
			<input type="text" name="name" value={val('name')} required maxlength="160" />
			{#if err('name')}<span class="field-error">{err('name')}</span>{/if}
		</label>
		<label>
			<span class="field-label">Jabatan <span style="color:#dc2626">*</span></span>
			<input type="text" name="position" value={val('position')} required maxlength="160" placeholder="cth. Ketua Umum" />
			{#if err('position')}<span class="field-error">{err('position')}</span>{/if}
		</label>
	</div>

	<label>
		<span class="field-label">Deskripsi singkat</span>
		<input type="text" name="description" value={val('description')} maxlength="300" placeholder="cth. Pemimpin organisasi" />
		<span class="field-hint">Tampil di bawah nama pada carousel struktur organisasi.</span>
		{#if err('description')}<span class="field-error">{err('description')}</span>{/if}
	</label>

	<label>
		<span class="field-label">Foto (unggah)</span>
		<input type="file" name="photoFile" accept="image/*" onchange={onPhotoFile} />
		<span class="field-hint">Disarankan foto potret latar polos/putih agar efek transparan rapi. JPG, PNG, WebP (maks 5 MB).</span>
	</label>
	<label>
		<span class="field-label">…atau URL foto</span>
		<input type="text" name="photo" value={val('photo')} placeholder="https://…" />
		{#if err('photo')}<span class="field-error">{err('photo')}</span>{/if}
	</label>

	{#if photoPreview || val('photo')}
		<div class="photo-preview">
			<img src={photoPreview || val('photo')} alt="Pratinjau foto" />
		</div>
	{/if}

	<label>
		<span class="field-label">Tugas Pokok &amp; Fungsi (Tupoksi)</span>
		<textarea name="tupoksi" rows="6" placeholder="Satu tugas per baris">{val('tupoksi')}</textarea>
		<span class="field-hint">Satu poin tugas per baris. Tampil di halaman detail saat diklik.</span>
		{#if err('tupoksi')}<span class="field-error">{err('tupoksi')}</span>{/if}
	</label>

	<div class="grid-2">
		<label>
			<span class="field-label">Divisi (opsional)</span>
			<input type="text" name="division" value={val('division')} maxlength="160" />
		</label>
		<label>
			<span class="field-label">Periode (opsional)</span>
			<input type="text" name="period" value={val('period')} maxlength="60" placeholder="cth. 2025/2026" />
		</label>
	</div>

	<div class="grid-2">
		<label>
			<span class="field-label">Urutan tampil</span>
			<input type="number" name="sortOrder" min="0" value={val('sortOrder') || '0'} />
			<span class="field-hint">Angka kecil tampil lebih dulu.</span>
		</label>
		<label class="check">
			<input type="checkbox" name="isActive" checked={isActive} />
			<span class="field-label" style="margin:0">Tampilkan di halaman publik</span>
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
	.grid-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	@media (max-width: 640px) {
		.grid-2 { grid-template-columns: 1fr; }
	}
	.photo-preview img {
		max-width: 10rem;
		border-radius: 0.75rem;
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
