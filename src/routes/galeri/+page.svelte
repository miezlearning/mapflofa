<script lang="ts">
	import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * Galeri Aksi & Kegiatan.
	 *
	 * Static showcase for now — the album/photo data model lives in
	 * `gallery_albums` / `gallery_photos` (see src/lib/db/schema.ts). Wire this
	 * page to a `+page.server.ts` load + admin CRUD to make it editable.
	 */
	interface Album {
		title: string;
		category: string;
		date: string;
		count: number;
		cover: string;
	}

	const albums: Album[] = [
		{
			title: 'Penanaman Pohon',
			category: 'Aksi',
			date: 'Mei 2026',
			count: 24,
			cover: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1200&auto=format&fit=crop'
		},
		{
			title: 'Sosialisasi Satwa Langka',
			category: 'Edukasi',
			date: 'April 2026',
			count: 18,
			cover: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80&w=1200&auto=format&fit=crop'
		},
		{
			title: 'Bersih Sungai Bersama',
			category: 'Aksi',
			date: 'Maret 2026',
			count: 31,
			cover: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=1200&auto=format&fit=crop'
		},
		{
			title: 'Ekspedisi Pendataan Burung',
			category: 'Konservasi',
			date: 'Februari 2026',
			count: 42,
			cover: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=1200&auto=format&fit=crop'
		},
		{
			title: 'Reboisasi Lereng Bukit',
			category: 'Aksi',
			date: 'Januari 2026',
			count: 27,
			cover: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop'
		},
		{
			title: 'Kelas Lingkungan Anak',
			category: 'Edukasi',
			date: 'Desember 2025',
			count: 16,
			cover: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1200&auto=format&fit=crop'
		}
	];
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
				<div class="text-xs font-bold uppercase tracking-widest text-accent">Dokumentasi</div>
				<h1 class="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl text-primary leading-[1.05]">
					Galeri Aksi &amp; Kegiatan
				</h1>
				<p class="mt-5 text-slate-600 text-base md:text-lg leading-relaxed">
					Jejak langkah MAPFLOFA dalam menjaga flora, fauna, dan lingkungan — tersusun rapi
					dalam album per kegiatan.
				</p>
			</div>
		</div>
	</section>

	<!-- ===== Album grid ===== -->
	<section class="py-16 md:py-24 px-4 md:px-8">
		<div class="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
			{#each albums as album, i}
				<article
					use:reveal={{ from: 'up', delay: (i % 3) * 90 }}
					class="group relative overflow-hidden rounded-3xl bg-white border border-slate-100
					       shadow-sm shadow-slate-200/50 transition-all duration-300
					       hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/40"
				>
					<div class="relative aspect-[4/3] overflow-hidden bg-slate-100">
						<img
							src={album.cover}
							alt={album.title}
							loading="lazy"
							class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-primary-700/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
						<span class="absolute top-4 left-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-primary">
							{album.category}
						</span>
						<span class="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="3" y="3" width="18" height="18" rx="2" />
								<circle cx="8.5" cy="8.5" r="1.5" />
								<path d="M21 15l-5-5L5 21" />
							</svg>
							{album.count} foto
						</span>
					</div>
					<div class="p-5">
						<div class="text-xs text-slate-400 font-medium">{album.date}</div>
						<h2 class="mt-1.5 font-display font-bold text-lg text-primary group-hover:text-primary-600 transition-colors">
							{album.title}
						</h2>
					</div>
				</article>
			{/each}
		</div>
	</section>

	<Footer />
</main>
