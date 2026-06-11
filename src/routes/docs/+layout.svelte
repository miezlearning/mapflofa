<script lang="ts">
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import { locale } from '$lib/i18n/locale.svelte';
	import LangSwitcher from '$lib/components/docs/LangSwitcher.svelte';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const resources = $derived(data.registry.resources);
	const currentPath = $derived(page.url.pathname);
	const currentHash = $derived(page.url.hash);

	onMount(() => locale.hydrate());

	function isPath(href: string) {
		return currentPath === href || currentPath === href + '/';
	}

	function isHash(resourceSlug: string, anchor: string) {
		return currentPath === `/docs/${resourceSlug}` && currentHash === `#${anchor}`;
	}

	function methodClass(m: string) {
		switch (m) {
			case 'GET':
				return 'sm get';
			case 'POST':
				return 'sm post';
			case 'PATCH':
			case 'PUT':
				return 'sm patch';
			case 'DELETE':
				return 'sm delete';
			default:
				return 'sm';
		}
	}

	let mobileOpen = $state(false);
</script>

<svelte:head>
	<title>API Docs — SMP 1 Anggana</title>
	<meta
		name="description"
		content="Dokumentasi REST API SMP 1 Anggana — programs, news, events."
	/>
</svelte:head>

<!-- Mobile top bar -->
<header class="mobile-bar">
	<a href="/docs" class="brand">
		<span class="brand-mark">SMP</span>
		<span class="brand-text">1A <span class="brand-accent">Docs</span></span>
	</a>
	<div style="display:flex;align-items:center;gap:0.5rem">
		<LangSwitcher />
		<button
			type="button"
			class="hamburger"
			aria-label={locale.t(mobileOpen ? 'sidebar.closeNav' : 'sidebar.openNav')}
			onclick={() => (mobileOpen = !mobileOpen)}
		>
			{mobileOpen ? '✕' : '☰'}
		</button>
	</div>
</header>

<div class="shell" class:mobile-open={mobileOpen}>
	<!-- Sidebar -->
	<aside class="sidebar" id="docsSidebar">
		<div class="brand-block">
			<a href="/docs" class="brand">
				<span class="brand-mark">SMP</span>
				<span class="brand-text">1A <span class="brand-accent">Docs</span></span>
			</a>
			<LangSwitcher />
		</div>

		<nav class="nav" aria-label="API navigation">
			<div class="group">
				<div class="group-title">{locale.t('sidebar.gettingStarted')}</div>
				<a
					href="/docs"
					class="link"
					class:active={isPath('/docs') && !currentHash}
					onclick={() => (mobileOpen = false)}>{locale.t('sidebar.introduction')}</a
				>
				<a
					href="/docs#authentication"
					class="link"
					class:active={isPath('/docs') && currentHash === '#authentication'}
					onclick={() => (mobileOpen = false)}>{locale.t('sidebar.authentication')}</a
				>
				<a
					href="/docs#response-envelope"
					class="link"
					class:active={isPath('/docs') && currentHash === '#response-envelope'}
					onclick={() => (mobileOpen = false)}>{locale.t('sidebar.responseEnvelope')}</a
				>
				<a
					href="/docs#rate-limiting"
					class="link"
					class:active={isPath('/docs') && currentHash === '#rate-limiting'}
					onclick={() => (mobileOpen = false)}>{locale.t('sidebar.rateLimiting')}</a
				>
				<a class="link" href="/api/docs" target="_blank" rel="noopener">
					{locale.t('sidebar.specJson')} ↗
				</a>
			</div>

			{#each resources as r (r.slug)}
				<div class="group">
					<div class="group-title">{locale.tr(r.label)}</div>
					{#each r.endpoints as e (e.id)}
						<a
							href={`/docs/${r.slug}#${e.id}`}
							class="link with-method"
							class:active={isHash(r.slug, e.id)}
							onclick={() => (mobileOpen = false)}
						>
							<span class={methodClass(e.method)}>{e.method}</span>
							<span class="link-label">{locale.tr(e.summary)}</span>
						</a>
					{/each}
				</div>
			{/each}
		</nav>

		<a
			href="https://github.com/mattismyname3011/sveltekit_modern_school_profile"
			target="_blank"
			rel="noopener noreferrer"
			class="github-cta"
			aria-label={locale.t('sidebar.viewOnGithub')}
		>
			<svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path
					d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
				/>
			</svg>
			<span>{locale.t('sidebar.viewOnGithub')}</span>
		</a>
	</aside>

	<button
		type="button"
		class="scrim"
		aria-label={locale.t('sidebar.closeNav')}
		onclick={() => (mobileOpen = false)}
	></button>

	<!-- Main content -->
	<main class="main">
		{@render children()}
	</main>
</div>

<style>
	/* ---------- Theme ---------- */
	:global(html, body) {
		background: #05070d;
		margin: 0;
		padding: 0;
	}

	.shell {
		display: grid;
		grid-template-columns: 280px 1fr;
		min-height: 100vh;
		color: #e5e7eb;
		background:
			radial-gradient(1200px 600px at 80% -10%, rgba(56, 189, 248, 0.08), transparent 60%),
			radial-gradient(900px 600px at 0% 100%, rgba(139, 92, 246, 0.07), transparent 60%),
			#05070d;
		font-family:
			'Inter',
			ui-sans-serif,
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
	}

	/* ---------- Mobile bar ---------- */
	.mobile-bar {
		display: none;
		position: sticky;
		top: 0;
		z-index: 30;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1rem;
		background: rgba(2, 6, 23, 0.85);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(148, 163, 184, 0.12);
	}

	.hamburger {
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(148, 163, 184, 0.18);
		color: #f1f5f9;
		font-size: 1.125rem;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.5rem;
		cursor: pointer;
	}

	@media (max-width: 1024px) {
		.mobile-bar {
			display: flex;
		}
	}

	/* ---------- Sidebar ---------- */
	.sidebar {
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background:
			linear-gradient(180deg, rgba(8, 12, 22, 0.85), rgba(8, 12, 22, 0.6)),
			radial-gradient(600px 400px at 0% 0%, rgba(56, 189, 248, 0.05), transparent 70%);
		border-right: 1px solid rgba(148, 163, 184, 0.12);
		z-index: 20;
	}

	.brand-block {
		padding: 1.25rem 1.25rem 1rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.08);
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		text-decoration: none;
		color: #f8fafc;
	}

	.brand-mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: linear-gradient(135deg, #38bdf8, #6366f1);
		color: #fff;
		font-weight: 800;
		font-size: 0.7rem;
		letter-spacing: 0.02em;
		box-shadow: 0 6px 20px -8px rgba(56, 189, 248, 0.7);
	}

	.brand-text {
		font-weight: 800;
		font-size: 1.0625rem;
		letter-spacing: -0.01em;
	}

	.brand-accent {
		color: #38bdf8;
	}

	/* ---------- Nav ---------- */
	.nav {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 0.75rem 0.625rem 1rem;
		scrollbar-width: thin;
		scrollbar-color: rgba(148, 163, 184, 0.25) transparent;
	}

	.nav::-webkit-scrollbar {
		width: 6px;
	}
	.nav::-webkit-scrollbar-thumb {
		background: rgba(148, 163, 184, 0.25);
		border-radius: 3px;
	}

	.group {
		display: flex;
		flex-direction: column;
		gap: 0.0625rem;
		margin-bottom: 0.875rem;
	}

	.group-title {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #475569;
		padding: 0.5rem 0.75rem 0.375rem;
	}

	.link {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.4375rem 0.75rem;
		border-radius: 0.5rem;
		text-decoration: none;
		color: #94a3b8;
		font-size: 0.8125rem;
		font-weight: 500;
		line-height: 1.3;
		transition: background-color 120ms ease, color 120ms ease;
	}

	.link:hover {
		background: rgba(56, 189, 248, 0.06);
		color: #e2e8f0;
	}

	.link.active {
		background: rgba(56, 189, 248, 0.13);
		color: #f8fafc;
		font-weight: 600;
	}

	.link.with-method {
		gap: 0.5rem;
	}

	.link-label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sm {
		display: inline-block;
		min-width: 2.625rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.625rem;
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: #94a3b8;
		flex: none;
	}

	.sm.get {
		color: #34d399;
	}
	.sm.post {
		color: #38bdf8;
	}
	.sm.patch {
		color: #f87171;
	}
	.sm.delete {
		color: #fb7185;
	}

	.github-cta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 0.75rem 1rem 1rem;
		padding: 0.625rem 0.875rem;
		border-radius: 0.625rem;
		background: rgba(15, 23, 42, 0.55);
		border: 1px solid rgba(148, 163, 184, 0.18);
		color: #e2e8f0;
		font-size: 0.8125rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 150ms ease;
	}

	.github-cta:hover {
		background: rgba(56, 189, 248, 0.1);
		border-color: rgba(56, 189, 248, 0.4);
		color: #f8fafc;
	}

	/* ---------- Main ---------- */
	.main {
		padding: 3rem clamp(1.25rem, 3vw, 3rem);
		max-width: 1100px;
		width: 100%;
		margin: 0 auto;
	}

	/* ---------- Mobile drawer ---------- */
	.scrim {
		display: none;
		position: fixed;
		inset: 0;
		background: rgba(2, 6, 23, 0.6);
		border: 0;
		z-index: 15;
		cursor: pointer;
	}

	@media (max-width: 1024px) {
		.shell {
			grid-template-columns: 1fr;
		}

		.sidebar {
			position: fixed;
			top: 0;
			left: 0;
			width: 280px;
			transform: translateX(-100%);
			transition: transform 220ms ease;
		}

		.shell.mobile-open .sidebar {
			transform: translateX(0);
		}

		.shell.mobile-open .scrim {
			display: block;
		}

		.main {
			padding: 1.25rem;
		}
	}

	/* ---------- Shared content styles ---------- */
	:global(.docs-hero) {
		position: relative;
		padding: 2.25rem 2rem;
		border-radius: 1.25rem;
		background:
			radial-gradient(800px 240px at 100% 0%, rgba(99, 102, 241, 0.18), transparent 60%),
			linear-gradient(180deg, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.35));
		border: 1px solid rgba(148, 163, 184, 0.15);
		overflow: hidden;
		margin-bottom: 2rem;
	}

	:global(.docs-hero-eyebrow) {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: #38bdf8;
	}

	:global(.docs-hero h1) {
		margin: 0.625rem 0 0.75rem;
		font-size: clamp(1.875rem, 4vw, 2.5rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		color: #f8fafc;
	}

	:global(.docs-hero p) {
		max-width: 60ch;
		color: #cbd5e1;
		line-height: 1.65;
	}

	:global(.docs-card) {
		padding: 1.75rem;
		border-radius: 1rem;
		background: linear-gradient(180deg, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.35));
		border: 1px solid rgba(148, 163, 184, 0.12);
		margin-bottom: 1.5rem;
		scroll-margin-top: 1.25rem;
	}

	:global(.docs-card h2) {
		margin: 0 0 0.5rem;
		color: #f8fafc;
		font-size: 1.25rem;
		font-weight: 700;
	}

	:global(.docs-card h3) {
		color: #f1f5f9;
		font-size: 0.95rem;
		font-weight: 700;
		margin: 1.25rem 0 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	:global(.docs-card p) {
		color: #94a3b8;
		line-height: 1.65;
		margin: 0.25rem 0;
	}

	:global(.docs-button-row) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.625rem;
		margin-top: 1.25rem;
	}

	:global(.docs-button) {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		border-radius: 0.625rem;
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(148, 163, 184, 0.18);
		color: #f1f5f9;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 600;
		transition: all 150ms ease;
	}

	:global(.docs-button:hover) {
		background: rgba(56, 189, 248, 0.08);
		border-color: rgba(56, 189, 248, 0.4);
		transform: translateY(-1px);
	}

	:global(.docs-codeblock) {
		display: block;
		background: rgba(2, 6, 23, 0.85);
		border: 1px solid rgba(148, 163, 184, 0.15);
		border-radius: 0.75rem;
		padding: 1rem 1.125rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.8125rem;
		color: #cbd5e1;
		line-height: 1.65;
		overflow-x: auto;
		margin: 0.5rem 0;
		white-space: pre;
	}

	:global(.docs-callout) {
		display: flex;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		border-radius: 0.625rem;
		background: rgba(56, 189, 248, 0.06);
		border: 1px solid rgba(56, 189, 248, 0.2);
		color: #e0f2fe;
		font-size: 0.875rem;
		line-height: 1.6;
		margin: 1rem 0;
	}

	:global(.docs-callout strong) {
		color: #38bdf8;
	}
</style>
