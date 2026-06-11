<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/state';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const isLogin = $derived(page.url.pathname === '/admin/login');

	type NavItem = { href: string; label: string; icon: string; adminOnly?: boolean };
	const navItems: NavItem[] = [
		{ href: '/admin', label: 'Overview', icon: '◧' },
		{ href: '/admin/programs', label: 'Programs', icon: '◇' },
		{ href: '/admin/news', label: 'News', icon: '✦' },
		{ href: '/admin/gallery', label: 'Galeri', icon: '▦' },
		{ href: '/admin/events', label: 'Events', icon: '◆' },
		{ href: '/admin/users', label: 'Users', icon: '◉', adminOnly: true },
		{ href: '/admin/audit', label: 'Audit log', icon: '◎', adminOnly: true },
		{ href: '/admin/account', label: 'Account', icon: '○' }
	];

	const visibleNav = $derived(
		navItems.filter((item) => !item.adminOnly || data.user?.role === 'admin')
	);

	function isActive(href: string) {
		if (href === '/admin') return page.url.pathname === '/admin';
		return page.url.pathname.startsWith(href);
	}

	let mobileOpen = $state(false);
</script>

<svelte:head>
	<title>Admin · MAPFLOFA</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

{#if isLogin}
	<!-- Login page renders standalone, no chrome -->
	{@render children()}
{:else if !data.user}
	<!-- Server-side redirect handled in page loaders; this is a fallback. -->
	<div class="standalone-msg">
		<a href="/admin/login">Sign in to continue</a>
	</div>
{:else}
	<!-- Authenticated dashboard chrome -->
	<header class="mobile-bar">
		<a href="/admin" class="brand">
			<span class="brand-mark">MF</span>
			<span class="brand-text">MAPFLOFA <span class="brand-accent">Admin</span></span>
		</a>
		<button
			type="button"
			class="hamburger"
			aria-label="Toggle navigation"
			onclick={() => (mobileOpen = !mobileOpen)}
		>
			{mobileOpen ? '✕' : '☰'}
		</button>
	</header>

	<div class="shell" class:mobile-open={mobileOpen}>
		<aside class="sidebar">
			<div class="brand-block">
				<a href="/admin" class="brand">
					<span class="brand-mark">MF</span>
					<span class="brand-text">MAPFLOFA <span class="brand-accent">Admin</span></span>
				</a>
			</div>

			<nav class="nav" aria-label="Admin navigation">
				{#each visibleNav as item (item.href)}
					<a
						href={item.href}
						class="nav-link"
						class:active={isActive(item.href)}
						onclick={() => (mobileOpen = false)}
					>
						<span class="icon" aria-hidden="true">{item.icon}</span>
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>

			<div class="user-block">
				<div class="user-info">
					<div class="user-name">{data.user.name}</div>
					<div class="user-meta">
						<span class="role-pill">{data.user.role}</span>
						<span class="user-email">{data.user.email}</span>
					</div>
				</div>
				<form method="POST" action="/admin/logout">
					<button type="submit" class="logout-btn">Logout</button>
				</form>
			</div>
		</aside>

		<button
			type="button"
			class="scrim"
			aria-label="Close navigation"
			onclick={() => (mobileOpen = false)}
		></button>

		<main class="main">
			{@render children()}
		</main>
	</div>
{/if}

<style>
	:global(html, body) {
		background: #05070d;
		margin: 0;
		padding: 0;
	}

	.standalone-msg {
		min-height: 100vh;
		display: grid;
		place-items: center;
		color: #cbd5e1;
		background: #05070d;
	}

	.standalone-msg a {
		color: #38bdf8;
	}

	.shell {
		display: grid;
		grid-template-columns: 260px 1fr;
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

	.nav {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 0.75rem 0.625rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		color: #94a3b8;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background-color 120ms ease, color 120ms ease;
	}

	.nav-link:hover {
		background: rgba(56, 189, 248, 0.06);
		color: #e2e8f0;
	}

	.nav-link.active {
		background: rgba(56, 189, 248, 0.13);
		color: #f8fafc;
		font-weight: 600;
	}

	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		color: #38bdf8;
	}

	.user-block {
		padding: 1rem;
		border-top: 1px solid rgba(148, 163, 184, 0.08);
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.user-name {
		color: #f1f5f9;
		font-size: 0.875rem;
		font-weight: 700;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.user-meta {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		min-width: 0;
	}

	.role-pill {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 700;
		color: #c084fc;
		background: rgba(192, 132, 252, 0.12);
		border: 1px solid rgba(192, 132, 252, 0.25);
		padding: 0.0625rem 0.375rem;
		border-radius: 0.25rem;
	}

	.user-email {
		font-size: 0.75rem;
		color: #64748b;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.logout-btn {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		background: rgba(15, 23, 42, 0.55);
		border: 1px solid rgba(148, 163, 184, 0.18);
		color: #e2e8f0;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 150ms ease;
	}

	.logout-btn:hover {
		border-color: rgba(251, 113, 133, 0.4);
		color: #fda4af;
	}

	.main {
		padding: 2.5rem clamp(1.25rem, 3vw, 2.5rem);
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
	}

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

	/* ---------- Shared content tokens used by child pages ---------- */
	:global(.adm-page-head) {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.75rem;
		flex-wrap: wrap;
	}

	:global(.adm-title) {
		font-size: 1.625rem;
		font-weight: 800;
		color: #f8fafc;
		margin: 0;
		letter-spacing: -0.01em;
	}

	:global(.adm-sub) {
		color: #94a3b8;
		font-size: 0.875rem;
		margin: 0.25rem 0 0;
	}

	:global(.adm-card) {
		padding: 1.5rem;
		border-radius: 1rem;
		background: linear-gradient(180deg, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.35));
		border: 1px solid rgba(148, 163, 184, 0.12);
	}

	:global(.adm-btn) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.9375rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		border: 1px solid rgba(148, 163, 184, 0.18);
		background: rgba(15, 23, 42, 0.6);
		color: #f1f5f9;
		transition: all 150ms ease;
	}

	:global(.adm-btn:hover) {
		transform: translateY(-1px);
	}

	:global(.adm-btn-primary) {
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(99, 102, 241, 0.22));
		border-color: rgba(56, 189, 248, 0.45);
		color: #e0f2fe;
	}

	:global(.adm-btn-primary:hover) {
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.32), rgba(99, 102, 241, 0.32));
	}

	:global(.adm-btn-danger) {
		background: rgba(251, 113, 133, 0.1);
		border-color: rgba(251, 113, 133, 0.3);
		color: #fda4af;
	}

	:global(.adm-btn-danger:hover) {
		background: rgba(251, 113, 133, 0.18);
	}

	:global(.adm-btn:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	:global(.adm-table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	:global(.adm-table th) {
		text-align: left;
		font-weight: 700;
		color: #94a3b8;
		text-transform: uppercase;
		font-size: 0.6875rem;
		letter-spacing: 0.06em;
		padding: 0.625rem 0.875rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.15);
	}

	:global(.adm-table td) {
		padding: 0.75rem 0.875rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.08);
		color: #cbd5e1;
		vertical-align: middle;
	}

	:global(.adm-table tr:hover td) {
		background: rgba(56, 189, 248, 0.04);
	}

	:global(.adm-table .actions) {
		display: flex;
		gap: 0.375rem;
		justify-content: flex-end;
	}

	:global(.adm-empty) {
		padding: 3rem 1.25rem;
		text-align: center;
		color: #64748b;
		font-size: 0.9rem;
		border: 1px dashed rgba(148, 163, 184, 0.18);
		border-radius: 0.875rem;
	}

	:global(.adm-form) {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	:global(.adm-form label) {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	:global(.adm-form .field-label) {
		color: #cbd5e1;
		font-size: 0.8125rem;
		font-weight: 600;
	}

	:global(.adm-form .field-hint) {
		color: #64748b;
		font-size: 0.75rem;
	}

	:global(.adm-form input),
	:global(.adm-form textarea),
	:global(.adm-form select) {
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		background: rgba(2, 6, 23, 0.7);
		border: 1px solid rgba(148, 163, 184, 0.2);
		color: #f1f5f9;
		font-family: inherit;
		font-size: 0.875rem;
		outline: none;
		transition: border-color 150ms ease;
	}

	:global(.adm-form input:focus),
	:global(.adm-form textarea:focus),
	:global(.adm-form select:focus) {
		border-color: rgba(56, 189, 248, 0.5);
	}

	:global(.adm-form textarea) {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.8125rem;
		line-height: 1.55;
		resize: vertical;
		min-height: 6rem;
	}

	:global(.adm-form .field-error) {
		color: #fda4af;
		font-size: 0.75rem;
		font-weight: 600;
	}

	:global(.adm-form .form-actions) {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	:global(.adm-flash) {
		margin-bottom: 1.25rem;
		padding: 0.875rem 1rem;
		border-radius: 0.625rem;
		font-size: 0.875rem;
	}

	:global(.adm-flash-error) {
		background: rgba(251, 113, 133, 0.1);
		border: 1px solid rgba(251, 113, 133, 0.3);
		color: #fda4af;
	}

	:global(.adm-flash-ok) {
		background: rgba(52, 211, 153, 0.1);
		border: 1px solid rgba(52, 211, 153, 0.3);
		color: #6ee7b7;
	}
</style>
