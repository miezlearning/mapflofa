<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let saving = $state(false);

	// Hints per key so editors know the expected format.
	const hints: Record<string, string> = {
		'profile.misi': 'Satu poin misi per baris.',
		'profile.sejarah': 'Satu paragraf per baris.',
		'profile.nilai': 'Satu nilai per baris dengan format: icon|judul|deskripsi (contoh: sprout|Lestari|Menjaga alam).'
	};

	// Which keys render as a multi-line textarea.
	function isLong(key: string): boolean {
		return ['profile.misi', 'profile.sejarah', 'profile.nilai', 'profile.header_desc', 'profile.visi'].includes(key);
	}
</script>

<svelte:head>
	<title>Profil · Admin</title>
</svelte:head>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Profil Organisasi</h1>
		<p class="adm-sub">Edit konten halaman Profil: header, visi, misi, sejarah, dan nilai.</p>
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
	class="adm-card"
	use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			await update({ reset: false });
			saving = false;
		};
	}}
>
	<div class="blocks">
		{#each data.blocks as block (block.key)}
			<label class="block">
				<span class="block-label">{block.label}</span>
				{#if isLong(block.key)}
					<textarea name={`content__${block.key}`} rows={block.key === 'profile.misi' || block.key === 'profile.nilai' ? 5 : 3}>{block.value}</textarea>
				{:else}
					<input type="text" name={`content__${block.key}`} value={block.value} />
				{/if}
				{#if hints[block.key]}
					<span class="block-hint">{hints[block.key]}</span>
				{/if}
			</label>
		{/each}
	</div>

	<div class="form-actions">
		<button type="submit" class="adm-btn adm-btn-primary" disabled={saving}>
			{saving ? 'Menyimpan…' : 'Simpan Perubahan'}
		</button>
	</div>
</form>

<style>
	.blocks {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.block {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.block-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-ink, #333);
	}

	.block-hint {
		font-size: 0.75rem;
		color: var(--color-muted, #6b7b8c);
	}

	.block input,
	.block textarea {
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

	.block textarea {
		line-height: 1.55;
		resize: vertical;
	}

	.block input:focus,
	.block textarea:focus {
		border-color: var(--color-primary, #6eaee8);
		box-shadow: 0 0 0 3px rgba(110, 174, 232, 0.12);
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}
</style>
