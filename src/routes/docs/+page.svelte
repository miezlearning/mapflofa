<script lang="ts">
	import type { LayoutData } from './$types';
	import { locale } from '$lib/i18n/locale.svelte';

	let { data }: { data: LayoutData } = $props();
	const resources = $derived(data.registry.resources);
	const totalEndpoints = $derived(
		resources.reduce((acc, r) => acc + r.endpoints.length, 0)
	);
</script>

<section class="docs-hero">
	<span class="docs-hero-eyebrow">{locale.t('intro.eyebrow')}</span>
	<h1>{locale.t('intro.heading')}</h1>
	<p>{locale.t('intro.description')}</p>
	<div class="docs-button-row">
		<a class="docs-button" href="/api/docs" target="_blank" rel="noopener">
			{locale.t('intro.specBtn')}
		</a>
		<a class="docs-button" href="#authentication">{locale.t('intro.authBtn')}</a>
	</div>
</section>

<section class="docs-card">
	<h2>{locale.t('intro.baseUrlTitle')}</h2>
	<p>{locale.t('intro.baseUrlBody')}</p>
	<code class="docs-codeblock">https://&lt;host&gt;/api</code>
	<p>{locale.t('intro.baseUrlNote')} <code>http://localhost:5173/api</code>.</p>
</section>

<section class="docs-card" id="authentication">
	<h2>{locale.t('intro.authTitle')}</h2>
	<p>{locale.t('intro.authBody')}</p>
	<code class="docs-codeblock">Authorization: Bearer &lt;API_ADMIN_TOKEN&gt;</code>
	<div class="docs-callout">
		<span>🔐</span>
		<div>{locale.t('intro.authCallout')}</div>
	</div>
</section>

<section class="docs-card" id="response-envelope">
	<h2>{locale.t('intro.envelopeTitle')}</h2>
	<p>{locale.t('intro.envelopeBody')}</p>
	<code class="docs-codeblock">{`// success
{ "ok": true, "data": ... }

// failure
{ "ok": false, "error": { "code": "BAD_REQUEST", "message": "...", "details": {} } }`}</code>
</section>

<section class="docs-card" id="rate-limiting">
	<h2>{locale.t('intro.rateTitle')}</h2>
	<p>{locale.t('intro.rateBody')}</p>
	<code class="docs-codeblock">{`X-RateLimit-Limit: 120
X-RateLimit-Remaining: 118
X-RateLimit-Reset: 42`}</code>
	<p>{locale.t('intro.rateNote')}</p>
</section>

<section class="docs-card">
	<h2>{locale.t('intro.resourcesTitle')}</h2>
	<p>
		{locale.t('intro.resourcesIntro')}
		<strong style="color:#f1f5f9">{resources.length}</strong>
		{locale.t('intro.resourcesIntroSuffix')}
		<strong style="color:#f1f5f9">{totalEndpoints}</strong>
		{locale.t('intro.resourcesSuffix')}
	</p>
	<div style="display:grid;gap:0.75rem;margin-top:1rem">
		{#each resources as r (r.slug)}
			<a
				href={`/docs/${r.slug}`}
				class="docs-button"
				style="justify-content:space-between;width:100%"
			>
				<span style="display:flex;flex-direction:column;align-items:flex-start;gap:0.125rem">
					<span style="font-weight:700;color:#f8fafc">{locale.tr(r.label)}</span>
					<span style="font-size:0.75rem;color:#94a3b8">{locale.tr(r.description)}</span>
				</span>
				<span style="font-size:0.75rem;color:#38bdf8;font-weight:700">
					{r.endpoints.length} →
				</span>
			</a>
		{/each}
	</div>
</section>
