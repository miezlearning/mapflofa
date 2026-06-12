<script lang="ts">
	import type { PageData } from './$types';
	import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import TableOfContents from '$lib/components/news/TableOfContents.svelte';
	import ImageLightbox from '$lib/components/news/ImageLightbox.svelte';
	import ReadingProgress from '$lib/components/news/ReadingProgress.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	const post = $derived(data.post);
	const related = $derived(data.related);

	let copied = $state(false);
	let pageUrl = $state('');

	onMount(() => {
		pageUrl = window.location.href;
	});

	const shareWhatsApp = $derived(
		`https://wa.me/?text=${encodeURIComponent(post.title + ' — ' + pageUrl)}`
	);
	const shareTwitter = $derived(
		`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}`
	);
	const shareFacebook = $derived(
		`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
	);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(pageUrl);
			copied = true;
			setTimeout(() => (copied = false), 1800);
		} catch {
			// ignore
		}
	}
</script>

<svelte:head>
	<title>{post.title} — MAPFLOFA</title>
	<meta name="description" content={post.excerpt} />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.excerpt} />
	<meta property="og:image" content={post.image} />
	<meta property="og:type" content="article" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<ReadingProgress />
<FloatingNavbar />

<main class="post overflow-x-clip">
	<article>
		<header class="post-header">
			<nav class="breadcrumb" aria-label="Breadcrumb">
				<a href="/">Beranda</a>
				<span class="sep">›</span>
				<a href="/berita">Berita</a>
				<span class="sep">›</span>
				<span class="current">{post.category}</span>
			</nav>

			<div class="post-meta" use:reveal={{ from: 'up', delay: 60 }}>
				<span class="cat-pill">{post.category}</span>
				<span class="dot">·</span>
				<span class="date">{post.date}</span>
			</div>

			<h1 class="post-title" use:reveal={{ from: 'up', delay: 120 }}>
				{post.title}
			</h1>

			<p class="post-lede" use:reveal={{ from: 'up', delay: 180 }}>
				{post.excerpt}
			</p>

			<!-- Reading meta strip -->
			<div class="reading-strip" use:reveal={{ from: 'up', delay: 220 }}>
				<span class="rs-item" title="Estimasi waktu membaca">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<circle cx="12" cy="12" r="10" />
						<polyline points="12 6 12 12 16 14" />
					</svg>
					<strong>{post.readingMinutes}</strong> menit baca
				</span>
				<span class="rs-sep" aria-hidden="true">·</span>
				<span class="rs-item" title="Jumlah kata">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M4 6h16M4 12h16M4 18h10" />
					</svg>
					{post.wordCount.toLocaleString('id')} kata
				</span>
				{#if post.views > 0}
					<span class="rs-sep" aria-hidden="true">·</span>
					<span class="rs-item" title="Jumlah kunjungan">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
							<circle cx="12" cy="12" r="3" />
						</svg>
						{post.views.toLocaleString('id')} dibaca
					</span>
				{/if}
			</div>

			<div class="post-hero" use:reveal={{ from: 'scale', delay: 280 }}>
				<img src={post.image} alt={post.title} />
			</div>
		</header>

		<!-- Body layout: share rail · content · TOC -->
		<div class="post-body">
			<aside class="post-share" aria-label="Share">
				<div class="share-label">Bagikan</div>
				<a
					href={shareWhatsApp}
					target="_blank"
					rel="noopener"
					class="share-btn"
					aria-label="Bagikan ke WhatsApp"
					title="WhatsApp"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01zM12.05 20.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23z" />
						<path d="M16.56 14.45c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.47-.01-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03 0 1.2.87 2.36.99 2.52.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.28z" />
					</svg>
				</a>
				<a
					href={shareTwitter}
					target="_blank"
					rel="noopener"
					class="share-btn"
					aria-label="Bagikan ke Twitter / X"
					title="Twitter / X"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
					</svg>
				</a>
				<a
					href={shareFacebook}
					target="_blank"
					rel="noopener"
					class="share-btn"
					aria-label="Bagikan ke Facebook"
					title="Facebook"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
					</svg>
				</a>
				<button type="button" class="share-btn" onclick={copyLink} title="Salin link" aria-label="Salin link">
					{#if copied}
						✓
					{:else}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
							<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
						</svg>
					{/if}
				</button>
			</aside>

			<div class="post-content">
				{#if post.contentHtml}
					<div class="md-content">
						<!-- HTML is sanitized server-side via sanitize-html. -->
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html post.contentHtml}
					</div>
				{:else}
					<p class="empty">Berita ini belum memiliki konten panjang.</p>
				{/if}

				<div class="post-end">
					<a href="/berita" class="back-to-list">← Kembali ke daftar berita</a>
				</div>
			</div>

			<!-- TOC sidebar — only when there are 2+ headings -->
			{#if post.toc.length >= 2}
				<aside class="post-toc" aria-label="Table of contents">
					<TableOfContents items={post.toc} />
				</aside>
			{/if}
		</div>
	</article>

	<!-- Related posts -->
	{#if related.length > 0}
		<section class="related-section">
			<div class="max-w-7xl mx-auto px-4 md:px-8">
				<div class="related-head" use:reveal={{ from: 'up' }}>
					<div class="text-xs font-bold uppercase tracking-widest text-primary">Baca Juga</div>
					<h2 class="font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink mt-2">
						Berita lainnya
					</h2>
				</div>
				<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
					{#each related as r, i (r.slug)}
						<div use:reveal={{ from: 'up', delay: 100 + i * 80 }} class="card-wrap">
							<NewsCard {...r} href={`/berita/${r.slug}`} />
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}
</main>

<ImageLightbox />
<Footer />

<style>
	.post-header {
		max-width: 880px;
		margin: 0 auto;
		padding: 8rem 1.5rem 3rem;
	}

	@media (min-width: 768px) {
		.post-header {
			padding: 10rem 2rem 3.5rem;
		}
	}

	.breadcrumb {
		font-size: 0.75rem;
		font-weight: 600;
		color: #64748b;
		margin-bottom: 1.25rem;
	}

	.breadcrumb a {
		color: inherit;
		text-decoration: none;
	}

	.breadcrumb a:hover {
		color: #0b2e4f;
	}

	.breadcrumb .sep {
		color: #cbd5e1;
		margin: 0 0.5rem;
	}

	.breadcrumb .current {
		color: #0b2e4f;
		font-weight: 700;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.cat-pill {
		display: inline-block;
		padding: 0.3125rem 0.75rem;
		border-radius: 0.5rem;
		background: var(--color-surface-3, #f1f5f9);
		color: var(--color-primary, #6eaee8);
		border: 1px solid var(--color-line, #e2e8f0);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 700;
	}

	.dot {
		color: #cbd5e1;
	}

	.date {
		color: #64748b;
	}

	.post-title {
		font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
		font-weight: 800;
		letter-spacing: -0.02em;
		font-size: clamp(2rem, 5vw, 3.5rem);
		color: #0b2e4f;
		line-height: 1.1;
		margin: 1.25rem 0 1.25rem;
	}

	.post-lede {
		font-size: 1.125rem;
		line-height: 1.7;
		color: #475569;
		margin: 0 0 1.75rem;
		max-width: 60ch;
	}

	@media (min-width: 768px) {
		.post-lede {
			font-size: 1.25rem;
		}
	}

	.reading-strip {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		flex-wrap: wrap;
		font-size: 0.8125rem;
		color: #64748b;
		margin-bottom: 2.5rem;
	}

	.rs-item {
		display: inline-flex;
		align-items: center;
		gap: 0.4375rem;
	}

	.rs-item svg {
		color: #0b2e4f;
	}

	.rs-item strong {
		color: #0b2e4f;
		font-weight: 700;
	}

	.rs-sep {
		color: #cbd5e1;
	}

	.post-hero {
		border-top-left-radius: 8rem;
		border-bottom-right-radius: 8rem;
		border-top-right-radius: 1.25rem;
		border-bottom-left-radius: 1.25rem;
		overflow: hidden;
		aspect-ratio: 16/9;
		background: #f1f5f9;
		box-shadow: 0 30px 60px -25px rgba(11, 46, 79, 0.3);
	}

	@media (max-width: 768px) {
		.post-hero {
			border-radius: 1.75rem;
		}
	}

	.post-hero img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Body layout: share rail + content column + TOC */
	.post-body {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0;
		max-width: 760px;
		margin: 0 auto;
		padding: 3rem 1.5rem 5rem;
		position: relative;
	}

	/* Tablet: share rail + content (no TOC yet) */
	@media (min-width: 1024px) {
		.post-body {
			max-width: 920px;
			grid-template-columns: 4rem minmax(0, 1fr);
			gap: 2.5rem;
			padding: 3.5rem 2rem 6rem;
		}
	}

	/* Desktop: share rail + content + TOC */
	@media (min-width: 1200px) {
		.post-body {
			max-width: 1180px;
			grid-template-columns: 4rem minmax(0, 720px) 14rem;
			gap: 3rem;
		}
	}

	.post-share {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}

	@media (min-width: 1024px) {
		.post-share {
			flex-direction: column;
			gap: 0.625rem;
			position: sticky;
			top: 7rem;
			align-self: start;
			margin-bottom: 0;
			align-items: center;
		}
	}

	.share-label {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #64748b;
		writing-mode: horizontal-tb;
	}

	@media (min-width: 1024px) {
		.share-label {
			writing-mode: vertical-rl;
			transform: rotate(180deg);
		}
	}

	.share-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		background: #ffffff;
		border: 1px solid #e5e7eb;
		color: #0b2e4f;
		text-decoration: none;
		cursor: pointer;
		transition: all 150ms ease;
	}

	.share-btn:hover {
		background: #0b2e4f;
		color: #ffffff;
		border-color: #0b2e4f;
		transform: translateY(-1px);
	}

	.post-content {
		min-width: 0;
	}

	.post-content :global(.md-content) {
		font-size: 1.0625rem;
		line-height: 1.8;
	}

	@media (min-width: 768px) {
		.post-content :global(.md-content) {
			font-size: 1.125rem;
		}
	}

	/* Headings get scroll-margin so anchor jumps land below the navbar. */
	.post-content :global(.md-content h2),
	.post-content :global(.md-content h3),
	.post-content :global(.md-content h4) {
		scroll-margin-top: 6.5rem;
	}

	.empty {
		color: #94a3b8;
		font-style: italic;
	}

	.post-end {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid #e5e7eb;
	}

	.back-to-list {
		display: inline-block;
		font-size: 0.875rem;
		font-weight: 600;
		color: #0b2e4f;
		text-decoration: none;
	}

	.back-to-list:hover {
		color: #e11d48;
	}

	/* TOC sidebar — only desktop */
	.post-toc {
		display: none;
	}

	@media (min-width: 1200px) {
		.post-toc {
			display: block;
			position: sticky;
			top: 7rem;
			align-self: start;
		}
	}

	/* Related */
	.related-section {
		padding: 4rem 0 6rem;
		background: #eef1f6;
	}

	:global([data-theme='dark']) .related-section {
		background: linear-gradient(
			180deg,
			color-mix(in oklch, var(--dark-canvas) 94%, var(--dark-accent) 6%),
			color-mix(in oklch, var(--dark-canvas-deep) 96%, var(--dark-brand) 4%)
		);
	}

	.related-head {
		text-align: center;
	}

	.card-wrap {
		display: flex;
	}

	.card-wrap :global(a) {
		width: 100% !important;
	}
</style>
