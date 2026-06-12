<script lang="ts">
	import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const albums = $derived(data.albums);
</script>

<svelte:head>
	<title>Galeri Aksi & Kegiatan — MAPFLOFA</title>
	<meta
		name="description"
		content="Dokumentasi foto kegiatan MAPFLOFA: penanaman pohon, sosialisasi satwa langka, bersih sungai, dan ekspedisi konservasi."
	/>
</svelte:head>

<FloatingNavbar />

<main class="overflow-x-clip">
	<!-- ===== Header ===== -->
	<section class="bg-surface-2 pt-32 md:pt-40 pb-16 md:pb-20 px-4 md:px-8">
		<div class="max-w-7xl mx-auto">
			<div use:reveal={{ from: 'up' }} class="max-w-2xl">
				<div class="text-xs font-bold uppercase tracking-widest text-primary">Dokumentasi</div>
				<h1 class="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl text-ink leading-[1.05]">
					Galeri Aksi &amp; Kegiatan
				</h1>
				<p class="mt-5 text-muted text-base md:text-lg leading-relaxed">
					Jejak langkah MAPFLOFA dalam menjaga flora, fauna, dan lingkungan — tersusun rapi
					dalam album per kegiatan.
				</p>
			</div>
		</div>
	</section>

	<!-- ===== Album grid ===== -->
	<section class="py-16 md:py-24 px-4 md:px-8">
		<div class="max-w-7xl mx-auto">
			{#if albums.length === 0}
				<div class="max-w-xl mx-auto text-center py-16 px-6 rounded-3xl bg-surface-3 border border-slate-100">
					<div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 text-primary grid place-items-center">
						<Icon name="camera" size={30} />
					</div>
					<h2 class="font-display font-bold text-xl text-primary">Galeri segera hadir</h2>
					<p class="mt-2 text-muted">
						Album kegiatan sedang disiapkan. Pantau terus halaman ini ya.
					</p>
				</div>
			{:else}
				<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
					{#each albums as album, i}
						<a
							href={`/galeri/${album.slug}`}
							use:reveal={{ from: 'up', delay: (i % 3) * 90 }}
							class="group relative block overflow-hidden rounded-3xl bg-white border border-slate-100
							       shadow-sm shadow-slate-200/50 transition-all duration-300
							       hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/40"
						>
							<div class="relative aspect-[4/3] overflow-hidden bg-slate-100">
								{#if album.cover}
									<img
										src={album.cover}
										alt={album.title}
										loading="lazy"
										class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
								{:else}
									<div class="w-full h-full grid place-items-center text-primary/40">
										<Icon name="camera" size={36} />
									</div>
								{/if}
								<div class="absolute inset-0 bg-gradient-to-t from-primary-700/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								<span class="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white">
									<Icon name="camera" size={13} />
									{album.photoCount} foto
								</span>
							</div>
							<div class="p-5">
								{#if album.eventDate}
									<div class="text-xs text-slate-400 font-medium">{album.eventDate}</div>
								{/if}
								<h2 class="mt-1.5 font-display font-bold text-lg text-primary group-hover:text-primary-600 transition-colors">
									{album.title}
								</h2>
								{#if album.description}
									<p class="mt-1.5 text-sm text-slate-500 line-clamp-2">{album.description}</p>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<Footer />
</main>
