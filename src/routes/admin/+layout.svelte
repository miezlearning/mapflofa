<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/state';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const isLogin = $derived(page.url.pathname === '/admin/login');

	type NavItem = { href: string; label: string; icon: string; adminOnly?: boolean };
	const navItems: NavItem[] = [
		{ href: '/admin', label: 'Overview', icon: 'overview' },
		{ href: '/admin/profile', label: 'Profil', icon: 'profile' },
		{ href: '/admin/members', label: 'Pengurus', icon: 'members' },
		{ href: '/admin/programs', label: 'Programs', icon: 'programs' },
		{ href: '/admin/news', label: 'News', icon: 'news' },
		{ href: '/admin/gallery', label: 'Galeri', icon: 'gallery' },
		{ href: '/admin/events', label: 'Events', icon: 'events' },
		{ href: '/admin/users', label: 'Users', icon: 'users', adminOnly: true },
		{ href: '/admin/audit', label: 'Audit log', icon: 'audit', adminOnly: true },
		{ href: '/admin/account', label: 'Account', icon: 'account' }
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
	{@render children()}
{:else if !data.user}
	<div class="standalone-msg">
		<a href="/admin/login">Sign in to continue</a>
	</div>
{:else}
	<!-- Mobile top bar -->
	<header class="mobile-bar">
		<a href="/admin" class="brand">
			<span class="brand-mark">MF</span>
			<span class="brand-text">MAPFLOFA</span>
		</a>
		<button
			type="button"
			class="hamburger"
			aria-label="Toggle navigation"
			onclick={() => (mobileOpen = !mobileOpen)}
		>
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
				{#if mobileOpen}
					<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
				{:else}
					<path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
				{/if}
			</svg>
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
						<span class="nav-icon" aria-hidden="true">
							{#if item.icon === 'overview'}
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="5.5" height="5.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/><rect x="10.5" y="2" width="5.5" height="5.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/><rect x="2" y="10.5" width="5.5" height="5.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/><rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.25" stroke="currentColor" stroke-width="1.5"/></svg>
							{:else if item.icon === 'profile'}
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2.5" y="2.5" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="7" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 13c0-1.8 1.5-2.8 3.5-2.8s3.5 1 3.5 2.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
							{:else if item.icon === 'members'}
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="13" cy="7.5" r="2" stroke="currentColor" stroke-width="1.3"/><path d="M2 15c0-2.5 2-3.8 4.5-3.8S11 12.5 11 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 11.5c2 0 4 1 4 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
							{:else if item.icon === 'programs'}
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5.5h12M3 9h8M3 12.5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
							{:else if item.icon === 'news'}
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2.5" y="3" width="13" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 7h7M5.5 9.5h5M5.5 12h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
							{:else if item.icon === 'gallery'}
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2.5" y="3.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5"/><circle cx="6.5" cy="7.5" r="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M2.5 12l3.5-3 3 2.5 2.5-2 4 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
							{:else if item.icon === 'events'}
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2.5" y="3.5" width="13" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 7.5h13" stroke="currentColor" stroke-width="1.5"/><path d="M6 2v2.5M12 2v2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
							{:else if item.icon === 'users'}
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6.5" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 15.5c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
							{:else if item.icon === 'audit'}
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2.5v13M5.5 6l3.5 3.5L12.5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
							{:else if item.icon === 'account'}
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 15c0-2.5 2-3.5 4.5-3.5s4.5 1 4.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.5"/></svg>
							{/if}
						</span>
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>

			<div class="sidebar-footer">
				<a href="/" class="back-link" target="_blank" rel="noopener">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L2 8l4-4M2 8h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
					Lihat Website
				</a>
			</div>

			<div class="user-block">
				<div class="user-avatar">{data.user.name.charAt(0).toUpperCase()}</div>
				<div class="user-info">
					<div class="user-name">{data.user.name}</div>
					<div class="user-email">{data.user.email}</div>
				</div>
				<form method="POST" action="/admin/logout">
					<button type="submit" class="logout-btn" title="Logout">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 14H3.5A1.5 1.5 0 012 12.5v-9A1.5 1.5 0 013.5 2H6M11 11l3-3-3-3M5.5 8H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</button>
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
	.standalone-msg {
		min-height: 100vh;
		display: grid;
		place-items: center;
		color: var(--color-muted, #6b7b8c);
		background: var(--color-surface, #fff);
	}

	.standalone-msg a {
		color: var(--color-primary, #6eaee8);
		font-weight: 600;
	}

	.shell {
		display: grid;
		grid-template-columns: 250px 1fr;
		min-height: 100vh;
		color: var(--color-ink, #333);
		background: var(--color-surface-3, #f0f8ff);
		font-family: var(--font-sans, 'Plus Jakarta Sans', system-ui, sans-serif);
	}

	/* --- Mobile bar --- */
	.mobile-bar {
		display: none;
		position: sticky;
		top: 0;
		z-index: 30;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: #fff;
		border-bottom: 1px solid var(--color-line, #e3eef7);
		box-shadow: 0 1px 3px rgba(0,0,0,0.04);
	}

	.hamburger {
		background: var(--color-surface-3, #f0f8ff);
		border: 1px solid var(--color-line, #e3eef7);
		color: var(--color-ink, #333);
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.5rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	@media (max-width: 1024px) {
		.mobile-bar { display: flex; }
	}

	/* --- Sidebar --- */
	.sidebar {
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #fff;
		border-right: 1px solid var(--color-line, #e3eef7);
		z-index: 20;
	}

	.brand-block {
		padding: 1.25rem 1.25rem 1rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		text-decoration: none;
		color: var(--color-ink, #333);
	}

	.brand-mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: var(--color-primary, #6eaee8);
		color: #fff;
		font-weight: 800;
		font-size: 0.7rem;
		letter-spacing: 0.02em;
	}

	.brand-text {
		font-weight: 800;
		font-size: 1rem;
		letter-spacing: -0.01em;
	}

	.brand-accent {
		color: var(--color-primary, #6eaee8);
		font-weight: 600;
	}

	/* --- Navigation --- */
	.nav {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 0.5rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		color: var(--color-muted, #6b7b8c);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background-color 120ms ease, color 120ms ease;
	}

	.nav-link:hover {
		background: var(--color-surface-2, #e8f4fd);
		color: var(--color-ink, #333);
	}

	.nav-link.active {
		background: var(--color-surface-2, #e8f4fd);
		color: var(--color-primary, #6eaee8);
		font-weight: 600;
	}

	.nav-link.active .nav-icon {
		color: var(--color-primary, #6eaee8);
	}

	.nav-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		color: var(--color-muted, #6b7b8c);
	}

	/* --- Sidebar footer --- */
	.sidebar-footer {
		padding: 0.5rem 0.75rem;
		border-top: 1px solid var(--color-line, #e3eef7);
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		color: var(--color-muted, #6b7b8c);
		text-decoration: none;
		font-size: 0.8125rem;
		font-weight: 500;
		transition: color 120ms ease, background 120ms ease;
	}

	.back-link:hover {
		color: var(--color-primary, #6eaee8);
		background: var(--color-surface-2, #e8f4fd);
	}

	/* --- User block --- */
	.user-block {
		padding: 0.875rem 1rem;
		border-top: 1px solid var(--color-line, #e3eef7);
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.user-avatar {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: var(--color-surface-2, #e8f4fd);
		color: var(--color-primary, #6eaee8);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.8125rem;
		flex-shrink: 0;
	}

	.user-info {
		flex: 1;
		min-width: 0;
	}

	.user-name {
		color: var(--color-ink, #333);
		font-size: 0.8125rem;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.user-email {
		font-size: 0.6875rem;
		color: var(--color-muted, #6b7b8c);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.logout-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.375rem;
		background: transparent;
		border: 1px solid transparent;
		color: var(--color-muted, #6b7b8c);
		cursor: pointer;
		transition: all 120ms ease;
		flex-shrink: 0;
	}

	.logout-btn:hover {
		background: #fef2f2;
		border-color: #fecaca;
		color: #ef4444;
	}

	/* --- Main content area --- */
	.main {
		padding: 2rem clamp(1.25rem, 3vw, 2.5rem);
		max-width: 1100px;
		width: 100%;
		margin: 0 auto;
	}

	/* --- Scrim / mobile overlay --- */
	.scrim {
		display: none;
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.2);
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
			width: 270px;
			transform: translateX(-100%);
			transition: transform 220ms ease;
			box-shadow: 4px 0 24px rgba(0,0,0,0.08);
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

	/* ========== Global admin tokens ========== */

	:global(.adm-page-head) {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	:global(.adm-title) {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--color-ink, #333);
		margin: 0;
		letter-spacing: -0.01em;
	}

	:global(.adm-sub) {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.875rem;
		margin: 0.25rem 0 0;
	}

	:global(.adm-card) {
		padding: 1.25rem;
		border-radius: 0.875rem;
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		box-shadow: 0 1px 3px rgba(0,0,0,0.04);
	}

	:global(.adm-btn) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		border: 1px solid var(--color-line, #e3eef7);
		background: #fff;
		color: var(--color-ink, #333);
		transition: all 150ms ease;
	}

	:global(.adm-btn:hover) {
		border-color: var(--color-primary, #6eaee8);
		color: var(--color-primary, #6eaee8);
	}

	:global(.adm-btn-primary) {
		background: var(--color-primary, #6eaee8);
		border-color: var(--color-primary, #6eaee8);
		color: #fff;
	}

	:global(.adm-btn-primary:hover) {
		background: var(--color-primary-600, #4f97d6);
		border-color: var(--color-primary-600, #4f97d6);
		color: #fff;
	}

	:global(.adm-btn-danger) {
		background: #fff;
		border-color: #fecaca;
		color: #dc2626;
	}

	:global(.adm-btn-danger:hover) {
		background: #fef2f2;
		border-color: #f87171;
	}

	:global(.adm-btn:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}

	:global(.adm-table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	:global(.adm-table th) {
		text-align: left;
		font-weight: 600;
		color: var(--color-muted, #6b7b8c);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.625rem 0.875rem;
		border-bottom: 1px solid var(--color-line, #e3eef7);
	}

	:global(.adm-table td) {
		padding: 0.75rem 0.875rem;
		border-bottom: 1px solid var(--color-line, #e3eef7);
		color: var(--color-ink, #333);
		vertical-align: middle;
	}

	:global(.adm-table tr:hover td) {
		background: var(--color-surface-3, #f0f8ff);
	}

	:global(.adm-table .actions) {
		display: flex;
		gap: 0.375rem;
		justify-content: flex-end;
	}

	:global(.adm-empty) {
		padding: 3rem 1.25rem;
		text-align: center;
		color: var(--color-muted, #6b7b8c);
		font-size: 0.9rem;
		border: 1px dashed var(--color-line, #e3eef7);
		border-radius: 0.875rem;
		background: var(--color-surface-3, #f0f8ff);
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
		color: var(--color-ink, #333);
		font-size: 0.8125rem;
		font-weight: 600;
	}

	:global(.adm-form .field-hint) {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.75rem;
	}

	:global(.adm-form input),
	:global(.adm-form textarea),
	:global(.adm-form select) {
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

	:global(.adm-form input:focus),
	:global(.adm-form textarea:focus),
	:global(.adm-form select:focus) {
		border-color: var(--color-primary, #6eaee8);
		box-shadow: 0 0 0 3px rgba(110, 174, 232, 0.12);
	}

	:global(.adm-form textarea) {
		font-family: inherit;
		font-size: 0.8125rem;
		line-height: 1.55;
		resize: vertical;
		min-height: 6rem;
	}

	:global(.adm-form .field-error) {
		color: #dc2626;
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
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
	}

	:global(.adm-flash-ok) {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		color: #16a34a;
	}
</style>
