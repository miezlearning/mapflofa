<script lang="ts">
	import type { PageData } from './$types';
	import EndpointBlock from '$lib/components/docs/EndpointBlock.svelte';
	import AuthPanel from '$lib/components/docs/AuthPanel.svelte';
	import { locale } from '$lib/i18n/locale.svelte';

	let { data }: { data: PageData } = $props();
	const resource = $derived(data.resource);
</script>

<svelte:head>
	<title>{locale.tr(resource.label)} · API Docs</title>
</svelte:head>

<section class="docs-hero">
	<span class="docs-hero-eyebrow">{locale.t('resource.eyebrow')} · {resource.slug}</span>
	<h1>{locale.tr(resource.label)}</h1>
	<p>{locale.tr(resource.description)}</p>
	<div class="docs-button-row">
		<a class="docs-button" href="/docs">{locale.t('resource.backToHome')}</a>
		<a class="docs-button" href="/api/docs" target="_blank" rel="noopener">
			{locale.t('resource.specJson')}
		</a>
	</div>
</section>

<AuthPanel />

{#each resource.endpoints as e (e.id)}
	<EndpointBlock endpoint={e} />
{/each}
