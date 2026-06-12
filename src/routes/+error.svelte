<script lang="ts">
	import { page } from '$app/state';
	import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Terjadi kesalahan');

	const errorInfo: Record<number, { title: string; description: string; icon: string }> = {
		404: {
			title: 'Halaman Tidak Ditemukan',
			description: 'Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.',
			icon: 'compass'
		},
		403: {
			title: 'Akses Ditolak',
			description: 'Kamu tidak memiliki izin untuk mengakses halaman ini.',
			icon: 'lock'
		},
		500: {
			title: 'Server Error',
			description: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
			icon: 'alert'
		},
		502: {
			title: 'Bad Gateway',
			description: 'Server sedang mengalami gangguan. Silakan coba beberapa saat lagi.',
			icon: 'cloud'
		},
		503: {
			title: 'Layanan Tidak Tersedia',
			description: 'Server sedang dalam pemeliharaan. Silakan kembali nanti.',
			icon: 'wrench'
		}
	};

	const info = $derived(errorInfo[status] ?? {
		title: 'Terjadi Kesalahan',
		description: message,
		icon: 'alert'
	});
</script>

<svelte:head>
	<title>{status} — {info.title} · MAPFLOFA</title>
</svelte:head>

<FloatingNavbar />

<main class="error-page">
	<div class="decor-ring" aria-hidden="true"></div>
	<div class="decor-leaf" aria-hidden="true"></div>

	<div class="error-content">
		<!-- Icon -->
		<div class="error-icon">
			{#if info.icon === 'compass'}
				<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
					<circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2.5"/>
					<polygon points="24,12 28,22 24,20 20,22" fill="currentColor" opacity="0.8"/>
					<polygon points="24,36 20,26 24,28 28,26" fill="currentColor" opacity="0.4"/>
					<circle cx="24" cy="24" r="2.5" fill="currentColor"/>
				</svg>
			{:else if info.icon === 'lock'}
				<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
					<rect x="12" y="22" width="24" height="18" rx="3" stroke="currentColor" stroke-width="2.5"/>
					<path d="M17 22v-6a7 7 0 0114 0v6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
					<circle cx="24" cy="32" r="3" fill="currentColor"/>
				</svg>
			{:else if info.icon === 'cloud'}
				<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
					<path d="M14 34a8 8 0 01-.5-16A10 10 0 0134 20a7 7 0 01-1 14H14z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M20 38v3M24 38v3M28 38v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			{:else if info.icon === 'wrench'}
				<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
					<path d="M29 8a10 10 0 00-9 14.5L9.5 33a3.5 3.5 0 005 5L25 27.5A10 10 0 0040 19l-5 5-4-1-1-4 5-5a10 10 0 00-6-6z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			{:else}
				<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
					<circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2.5"/>
					<path d="M24 16v10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
					<circle cx="24" cy="33" r="2" fill="currentColor"/>
				</svg>
			{/if}
		</div>

		<!-- Status code -->
		<div class="error-code">{status}</div>

		<!-- Title & description -->
		<h1 class="error-title">{info.title}</h1>
		<p class="error-desc">{info.description}</p>

		<!-- Actions -->
		<div class="error-actions">
			<a href="/" class="btn-primary">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M2 6l6-4.5L14 6v7.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 13.5V6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M6 15V9h4v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				Kembali ke Beranda
			</a>
			<button type="button" class="btn-secondary" onclick={() => history.back()}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M6 12L2 8l4-4M2 8h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				Halaman Sebelumnya
			</button>
		</div>

		<!-- Helpful links for 404 -->
		{#if status === 404}
			<div class="helpful-links">
				<p class="links-label">Mungkin yang kamu cari:</p>
				<div class="links-grid">
					<a href="/profil" class="link-card">
						<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6.5" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 15.5c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
						<span>Profil</span>
					</a>
					<a href="/berita" class="link-card">
						<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2.5" y="3" width="13" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 7h7M5.5 9.5h5M5.5 12h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
						<span>Berita</span>
					</a>
					<a href="/galeri" class="link-card">
						<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2.5" y="3.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5"/><circle cx="6.5" cy="7.5" r="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M2.5 12l3.5-3 3 2.5 2.5-2 4 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
						<span>Galeri</span>
					</a>
					<a href="/kontak" class="link-card">
						<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5.5a1.5 1.5 0 011.5-1.5h9A1.5 1.5 0 0115 5.5v7a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 013 12.5v-7z" stroke="currentColor" stroke-width="1.5"/><path d="M3 6l6 4 6-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
						<span>Kontak</span>
					</a>
				</div>
			</div>
		{/if}
	</div>
</main>

<Footer />

<style>
	.error-page {
		min-height: 70vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6rem 1.5rem 4rem;
		position: relative;
		overflow: hidden;
		background: var(--color-surface, #fff);
	}

	/* Decorative elements */
	.decor-ring {
		position: absolute;
		top: -8rem;
		right: -6rem;
		width: 28rem;
		height: 28rem;
		border-radius: 50%;
		border: 1.5px solid var(--color-line, #e3eef7);
		opacity: 0.5;
	}

	.decor-leaf {
		position: absolute;
		bottom: -4rem;
		left: -4rem;
		width: 18rem;
		height: 18rem;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(110, 174, 232, 0.06), transparent 70%);
	}

	.error-content {
		position: relative;
		z-index: 1;
		text-align: center;
		max-width: 480px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.error-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 5rem;
		height: 5rem;
		border-radius: 50%;
		background: var(--color-surface-2, #e8f4fd);
		color: var(--color-primary, #6eaee8);
		margin-bottom: 0.5rem;
	}

	.error-code {
		font-size: 4.5rem;
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 1;
		color: var(--color-primary, #6eaee8);
		opacity: 0.2;
		font-feature-settings: 'tnum';
	}

	.error-title {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--color-ink, #333);
		letter-spacing: -0.01em;
	}

	.error-desc {
		margin: 0;
		font-size: 1rem;
		color: var(--color-muted, #6b7b8c);
		line-height: 1.6;
		max-width: 360px;
	}

	.error-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1.25rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6875rem 1.25rem;
		border-radius: 0.625rem;
		background: var(--color-primary, #6eaee8);
		color: #fff;
		font-weight: 700;
		font-size: 0.875rem;
		text-decoration: none;
		transition: background 150ms ease;
	}

	.btn-primary:hover {
		background: var(--color-primary-600, #4f97d6);
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6875rem 1.25rem;
		border-radius: 0.625rem;
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		color: var(--color-ink, #333);
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: border-color 150ms ease, color 150ms ease;
	}

	.btn-secondary:hover {
		border-color: var(--color-primary, #6eaee8);
		color: var(--color-primary, #6eaee8);
	}

	/* Helpful links for 404 */
	.helpful-links {
		margin-top: 2.5rem;
		width: 100%;
	}

	.links-label {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.8125rem;
		font-weight: 600;
		margin: 0 0 0.75rem;
	}

	.links-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.625rem;
	}

	.link-card {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.75rem 1rem;
		border-radius: 0.625rem;
		background: var(--color-surface-3, #f0f8ff);
		border: 1px solid var(--color-line, #e3eef7);
		text-decoration: none;
		color: var(--color-ink, #333);
		font-size: 0.875rem;
		font-weight: 600;
		transition: border-color 150ms ease, box-shadow 150ms ease;
	}

	.link-card:hover {
		border-color: var(--color-primary, #6eaee8);
		box-shadow: 0 2px 8px rgba(110, 174, 232, 0.1);
	}

	.link-card svg {
		color: var(--color-primary, #6eaee8);
		flex-shrink: 0;
	}

	@media (max-width: 480px) {
		.error-code {
			font-size: 3.5rem;
		}
		.error-title {
			font-size: 1.375rem;
		}
		.links-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
