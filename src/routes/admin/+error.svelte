<script lang="ts">
	import { page } from '$app/state';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Terjadi kesalahan');

	const errorInfo: Record<number, { title: string; description: string }> = {
		404: {
			title: 'Halaman Tidak Ditemukan',
			description: 'Halaman admin yang kamu cari tidak tersedia.'
		},
		403: {
			title: 'Akses Ditolak',
			description: 'Kamu tidak memiliki izin untuk mengakses halaman ini.'
		},
		500: {
			title: 'Server Error',
			description: 'Terjadi kesalahan pada server. Silakan coba lagi.'
		}
	};

	const info = $derived(errorInfo[status] ?? {
		title: 'Terjadi Kesalahan',
		description: message
	});
</script>

<div class="error-wrap">
	<div class="error-card">
		<div class="error-icon">
			<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
				<circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="2"/>
				<path d="M16 10v7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
				<circle cx="16" cy="22.5" r="1.5" fill="currentColor"/>
			</svg>
		</div>
		<span class="error-code">{status}</span>
		<h1>{info.title}</h1>
		<p>{info.description}</p>
		<div class="error-actions">
			<a href="/admin" class="adm-btn adm-btn-primary">
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" stroke-width="1.25"/><rect x="8" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" stroke-width="1.25"/><rect x="1.5" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" stroke-width="1.25"/><rect x="8" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" stroke-width="1.25"/></svg>
				Overview
			</a>
			<button type="button" class="adm-btn" onclick={() => history.back()}>
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 10L2 7l3-3M2 7h10" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>
				Kembali
			</button>
		</div>
	</div>
</div>

<style>
	.error-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: 2rem;
	}

	.error-card {
		text-align: center;
		max-width: 380px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.error-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background: var(--color-surface-2, #e8f4fd);
		color: var(--color-primary, #6eaee8);
		margin-bottom: 0.25rem;
	}

	.error-code {
		font-size: 3rem;
		font-weight: 900;
		color: var(--color-primary, #6eaee8);
		opacity: 0.2;
		line-height: 1;
		letter-spacing: -0.04em;
	}

	h1 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--color-ink, #333);
	}

	p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-muted, #6b7b8c);
		line-height: 1.5;
	}

	.error-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}
</style>
