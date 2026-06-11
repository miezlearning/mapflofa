<script lang="ts">
	import { onMount } from 'svelte';
	import { locale, type Locale } from '$lib/i18n/locale.svelte';

	onMount(() => locale.hydrate());

	const options: { value: Locale; label: string; flag: string }[] = [
		{ value: 'id', label: 'ID', flag: '🇮🇩' },
		{ value: 'en', label: 'EN', flag: '🇬🇧' }
	];
</script>

<div class="lang" role="group" aria-label="Language">
	{#each options as o (o.value)}
		<button
			type="button"
			class="opt"
			class:active={locale.current === o.value}
			onclick={() => locale.set(o.value)}
			aria-pressed={locale.current === o.value}
			title={o.label}
		>
			<span aria-hidden="true">{o.flag}</span>
			<span>{o.label}</span>
		</button>
	{/each}
</div>

<style>
	.lang {
		display: inline-flex;
		gap: 0.125rem;
		padding: 0.1875rem;
		border-radius: 0.5rem;
		background: rgba(2, 6, 23, 0.55);
		border: 1px solid rgba(148, 163, 184, 0.18);
	}

	.opt {
		display: inline-flex;
		align-items: center;
		gap: 0.3125rem;
		padding: 0.3125rem 0.5rem;
		border-radius: 0.375rem;
		background: transparent;
		border: 0;
		color: #94a3b8;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: all 120ms ease;
	}

	.opt:hover {
		color: #e2e8f0;
	}

	.opt.active {
		background: rgba(56, 189, 248, 0.15);
		color: #f8fafc;
	}
</style>
