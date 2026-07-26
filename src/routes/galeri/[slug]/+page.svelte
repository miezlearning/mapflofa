<script lang="ts">
	import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const album = $derived(data.album);
	const photos = $derived(data.photos);
	const related = $derived(data.related);

	// Lightbox state
	let lightbox = $state<number | null>(null);
	const hasLightbox = $derived(lightbox !== null);

	function open(i: number) {
		lightbox = i;
	}
	function close() {
		lightbox = null;
	}
	function next() {
		if (lightbox === null) return;
		lightbox = (lightbox + 1) % photos.length;
	}
	function prev() {
		if (lightbox === null) return;
		lightbox = (lightbox - 1 + photos.length) % photos.length;
	}
	function onKey(e: KeyboardEvent) {
		if (!hasLightbox) return;
		if (e.key === 'Escape') close();
		else if (e.key === 'ArrowRight') next();
		else if (e.key === 'ArrowLeft') prev();
	}

	import SeoHead from '$lib/components/SeoHead.svelte';

	const albumDescription = $derived(
		album.description || `Dokumentasi foto kegiatan ${album.title} oleh MAPFLOFA.`
	);
	const albumCover = $derived(photos[0]?.image || '/logo.png');

	const galleryJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'ImageGallery',
		name: album.title,
		description: albumDescription,
		image: albumCover,
		author: {
			'@type': 'Organization',
			name: 'MAPFLOFA'
		}
	});
</script>

<SeoHead
	title={`${album.title} — Galeri MAPFLOFA`}
	description={albumDescription}
	image={albumCover}
	imageAlt={album.title}
	type="website"
	jsonLd={galleryJsonLd}
/>

<svelte:window onkeydown={onKey} />

<FloatingNavbar />

<main class="overflow-x-clip">
	<!-- ===== Header ===== -->
	<section class="bg-surface-2 pt-32 md:pt-40 pb-8 md:pb-12 px-4 md:px-8">
		<div class="max-w-7xl mx-auto">
			<nav class="text-sm text-slate-500 mb-5" aria-label="Breadcrumb">
				<a href="/galeri" class="hover:text-primary">Galeri</a>
				<span class="mx-2 text-slate-300">/</span>
				<span class="text-slate-700 font-medium">{album.title}</span>
			</nav>
			<div use:reveal={{ from: 'up' }} class="max-w-2xl">
				{#if album.eventDate}
					<div class="text-xs font-bold uppercase tracking-widest text-primary">{album.eventDate}</div>
				{/if}
				<h1 class="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-5xl text-ink leading-tight">
					{album.title}
				</h1>
				{#if album.description}
					<p class="mt-5 text-slate-600 text-base md:text-lg leading-relaxed">{album.description}</p>
				{/if}
				<div class="mt-4 inline-flex items-center gap-2 text-sm text-slate-500">
					<Icon name="camera" size={16} />
					{photos.length} foto
				</div>
			</div>
		</div>
	</section>

	<!-- ===== Photo grid ===== -->
	<section class="py-8 md:py-14 px-4 md:px-8">
		<div class="max-w-7xl mx-auto">
			{#if photos.length === 0}
				<div class="text-center text-slate-500 py-16">Belum ada foto di album ini.</div>
			{:else}
				<div class="photo-grid" class:few={photos.length <= 3}>
					{#each photos as photo, i (photo.id)}
						<button
							type="button"
							class="grid-item group"
							onclick={() => open(i)}
							aria-label={`Perbesar foto ${i + 1}`}
						>
							<img src={photo.image} alt={photo.caption ?? album.title} loading="lazy" />
							<span class="zoom-hint">
								<Icon name="camera" size={18} />
							</span>
							{#if photo.caption}
								<span class="caption">{photo.caption}</span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- ===== Related albums ===== -->
	{#if related.length > 0}
		<section class="bg-surface-2 py-14 md:py-20 px-4 md:px-8">
			<div class="max-w-7xl mx-auto">
				<h2 class="font-display font-extrabold text-2xl md:text-3xl text-primary">Album lainnya</h2>
				<div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each related as r}
						<a
							href={`/galeri/${r.slug}`}
							class="group relative block overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
						>
							<div class="relative aspect-[4/3] overflow-hidden bg-slate-100">
								{#if r.cover}
									<img src={r.cover} alt={r.title} loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
								{/if}
							</div>
							<div class="p-4">
								<h3 class="font-display font-bold text-primary">{r.title}</h3>
								<div class="text-xs text-slate-400 mt-1">{r.photoCount} foto</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<Footer />
</main>

<!-- ===== Lightbox ===== -->
{#if hasLightbox && lightbox !== null}
	<div
		class="lb-backdrop"
		role="dialog"
		aria-modal="true"
		aria-label="Pratinjau foto"
		tabindex="-1"
		onclick={(e) => {
			if (e.target === e.currentTarget) close();
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') close();
		}}
	>
		<img src={photos[lightbox].image} alt={photos[lightbox].caption ?? album.title} />

		{#if photos[lightbox].caption}
			<div class="lb-caption">{photos[lightbox].caption}</div>
		{/if}

		<div class="lb-counter">{lightbox + 1} / {photos.length}</div>

		<button type="button" class="lb-btn lb-close" aria-label="Tutup" onclick={close}>✕</button>
		{#if photos.length > 1}
			<button type="button" class="lb-btn lb-prev" aria-label="Sebelumnya" onclick={prev}>‹</button>
			<button type="button" class="lb-btn lb-next" aria-label="Berikutnya" onclick={next}>›</button>
		{/if}
	</div>
{/if}

<style>
	/* Responsive photo grid */
	.photo-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}
	@media (min-width: 640px) {
		.photo-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.photo-grid:not(.few) {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.grid-item {
		position: relative;
		display: block;
		width: 100%;
		aspect-ratio: 4 / 3;
		padding: 0;
		border: 0;
		border-radius: 1.25rem;
		overflow: hidden;
		background: #eef4fb;
		cursor: zoom-in;
	}
	.grid-item img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}
	.grid-item:hover img {
		transform: scale(1.04);
	}
	.zoom-hint {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		width: 2.25rem;
		height: 2.25rem;
		display: grid;
		place-items: center;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.9);
		color: var(--color-primary, #6eaee8);
		opacity: 0;
		transform: translateY(-4px);
		transition: all 0.25s ease;
	}
	.grid-item:hover .zoom-hint {
		opacity: 1;
		transform: translateY(0);
	}
	.caption {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 1.75rem 1rem 0.75rem;
		color: #fff;
		font-size: 0.8125rem;
		text-align: left;
		background: linear-gradient(to top, rgba(15, 23, 42, 0.75), transparent);
		opacity: 0;
		transition: opacity 0.25s ease;
	}
	.grid-item:hover .caption {
		opacity: 1;
	}

	/* Lightbox */
	.lb-backdrop {
		position: fixed;
		inset: 0;
		z-index: 80;
		background: rgba(8, 20, 35, 0.94);
		display: grid;
		place-items: center;
		padding: 2rem 1rem;
		animation: lb-fade 160ms ease-out;
	}
	.lb-backdrop img {
		max-width: min(92vw, 1100px);
		max-height: 82vh;
		object-fit: contain;
		border-radius: 0.5rem;
		box-shadow: 0 24px 70px -10px rgba(0, 0, 0, 0.6);
	}
	.lb-caption {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		max-width: 90vw;
		text-align: center;
		color: #e2e8f0;
		font-size: 0.875rem;
		background: rgba(8, 20, 35, 0.6);
		padding: 0.5rem 1rem;
		border-radius: 9999px;
	}
	.lb-counter {
		position: absolute;
		top: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
		color: #cbd5e1;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.05em;
	}
	.lb-btn {
		position: absolute;
		display: grid;
		place-items: center;
		border-radius: 9999px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
		cursor: pointer;
		backdrop-filter: blur(8px);
		transition: background 0.2s ease;
	}
	.lb-btn:hover {
		background: rgba(255, 255, 255, 0.22);
	}
	.lb-close {
		top: 1.25rem;
		right: 1.25rem;
		width: 2.75rem;
		height: 2.75rem;
		font-size: 1.1rem;
	}
	.lb-prev,
	.lb-next {
		top: 50%;
		transform: translateY(-50%);
		width: 3rem;
		height: 3rem;
		font-size: 1.75rem;
		line-height: 1;
	}
	.lb-prev {
		left: 1rem;
	}
	.lb-next {
		right: 1rem;
	}

	@keyframes lb-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
