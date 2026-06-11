<script lang="ts">
	import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Button from '$lib/components/Button.svelte';
	import Carousel from '$lib/components/Carousel.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { parallax } from '$lib/actions/parallax';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const news = $derived(data.news);

	// Galeri preview — a few highlight albums linking to the full /galeri page.
	const galleryPreview = [
		{
			title: 'Penanaman Pohon',
			category: 'Aksi',
			image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1000&auto=format&fit=crop'
		},
		{
			title: 'Sosialisasi Satwa Langka',
			category: 'Edukasi',
			image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80&w=1000&auto=format&fit=crop'
		},
		{
			title: 'Bersih Sungai Bersama',
			category: 'Aksi',
			image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=1000&auto=format&fit=crop'
		},
		{
			title: 'Ekspedisi Pendataan Burung',
			category: 'Konservasi',
			image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=1000&auto=format&fit=crop'
		}
	];

	// Dampak & pencapaian — evergreen stats, no DB needed.
	const impactStats = [
		{ value: '1.200+', label: 'Pohon ditanam', icon: '🌳' },
		{ value: '45+', label: 'Kegiatan terlaksana', icon: '📅' },
		{ value: '120+', label: 'Anggota aktif', icon: '🧑‍🤝‍🧑' },
		{ value: '8', label: 'Spesies satwa didata', icon: '🦜' }
	];
</script>

<svelte:head>
	<title>MAPFLOFA — Mahasiswa Penyayang Flora Fauna</title>
	<meta
		name="description"
		content="Website resmi MAPFLOFA (Mahasiswa Penyayang Flora Fauna). Komunitas mahasiswa pecinta alam yang bergerak untuk konservasi flora, fauna, dan lingkungan."
	/>
</svelte:head>

<FloatingNavbar />

<main class="overflow-x-clip">
	<Hero />

	<!-- ========================================================
	     ABOUT — split with stats overlay
	======================================================== -->
	<section id="tentang" class="py-20 md:py-28 px-4 md:px-8">
		<div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
			<div use:reveal={{ from: 'left' }} class="relative order-2 lg:order-1">
				<div class="parallax-clip mask-organic relative aspect-[4/5] bg-slate-100">
					<img
						use:parallax={{ speed: 0.18 }}
						src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop"
						alt="Kegiatan konservasi alam MAPFLOFA"
						loading="lazy"
						class="parallax-img"
					/>
				</div>

				<!-- Floating stat card overlay -->
				<div
					use:parallax={{ speed: -0.06 }}
					class="about-stat-card absolute -bottom-8 left-4 md:left-auto md:right-[-20px]
					       bg-white rounded-3xl shadow-2xl shadow-slate-300/50
					       border border-slate-100 p-6 max-w-[260px]"
				>
					<div class="flex items-center gap-3">
						<div class="w-12 h-12 rounded-2xl bg-primary/5 grid place-items-center text-primary">
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 14l9-5-9-5-9 5 9 5z" />
								<path d="M12 14l6.16-3.422A12 12 0 0 1 12 21a12 12 0 0 1-6.16-10.422L12 14z" />
							</svg>
						</div>
						<div>
							<div class="font-display font-extrabold text-3xl text-primary leading-none">120+</div>
							<div class="text-xs text-slate-500 font-medium mt-1">Anggota aktif</div>
						</div>
					</div>
				</div>

				<div
					aria-hidden="true"
					use:parallax={{ speed: 0.08 }}
					class="absolute -top-6 -left-6 w-32 h-32 rounded-full
					       border-[8px] border-accent/15 -z-10"
				></div>
			</div>

			<div use:reveal={{ from: 'right', delay: 120 }} class="order-1 lg:order-2">
				<div class="text-xs font-bold uppercase tracking-widest text-accent">Tentang Kami</div>
				<h2 class="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-5xl text-primary leading-tight">
					Mahasiswa yang bergerak untuk alam
				</h2>
				<p class="mt-6 text-slate-600 text-base md:text-lg leading-relaxed">
					MAPFLOFA adalah komunitas mahasiswa penyayang flora dan fauna. Kami percaya kepedulian
					terhadap lingkungan dimulai dari aksi nyata: menanam, mengedukasi, dan menjaga
					keanekaragaman hayati di sekitar kita.
				</p>

				<div class="mt-8 grid sm:grid-cols-2 gap-4">
					{#each [
						{ icon: '🌱', title: 'Konservasi', desc: 'Penanaman pohon & reboisasi rutin' },
						{ icon: '🦅', title: 'Satwa Langka', desc: 'Edukasi & pelestarian fauna endemik' },
						{ icon: '📚', title: 'Edukasi', desc: 'Sosialisasi lingkungan ke masyarakat' },
						{ icon: '🤝', title: 'Kolaborasi', desc: 'Aksi bersama komunitas & kampus' }
					] as item, i}
						<div
							use:reveal={{ from: 'up', delay: 200 + i * 80 }}
							class="about-feature-card rounded-2xl bg-white border border-slate-100 p-4 shadow-sm
							       transition-all duration-300
							       hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
						>
							<div class="text-2xl">{item.icon}</div>
							<div class="mt-2 font-bold text-primary text-sm">{item.title}</div>
							<div class="text-xs text-slate-500 mt-1">{item.desc}</div>
						</div>
					{/each}
				</div>

				<div class="mt-10 flex flex-wrap gap-4">
					<Button href="/profil" variant="primary">Lihat Visi &amp; Misi</Button>
					<a
						href="/profil#struktur"
						class="link-underline inline-flex items-center gap-2 px-2 py-3 font-semibold text-primary"
					>
						Struktur Organisasi
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<path d="M5 12h14M13 5l7 7-7 7" />
						</svg>
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- ========================================================
	     GALERI — preview linking to full gallery
	======================================================== -->
	<section id="program" class="bg-surface-2 py-20 md:py-28 px-4 md:px-8">
		<div class="max-w-7xl mx-auto">
			<div class="flex flex-wrap items-end justify-between gap-6">
				<div use:reveal={{ from: 'left' }} class="max-w-xl">
					<div class="text-xs font-bold uppercase tracking-widest text-accent">Galeri Aksi & Kegiatan</div>
					<h2 class="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-5xl text-primary leading-tight">
						Jejak langkah kami di lapangan
					</h2>
					<p class="mt-5 text-slate-600 text-base md:text-lg leading-relaxed">
						Dokumentasi foto dari setiap kegiatan konservasi, edukasi, dan aksi lingkungan
						yang kami lakukan bersama.
					</p>
				</div>
				<div use:reveal={{ from: 'right' }} class="shrink-0">
					<Button href="/galeri" variant="primary">Lihat Galeri Lengkap</Button>
				</div>
			</div>

			<div class="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
				{#each galleryPreview as g, i}
					<a
						href="/galeri"
						use:reveal={{ from: 'up', delay: i * 90 }}
						class="group relative block overflow-hidden rounded-3xl bg-slate-100 aspect-[3/4]
						       shadow-sm shadow-slate-200/50 transition-all duration-300
						       hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/40"
					>
						<img
							src={g.image}
							alt={g.title}
							loading="lazy"
							class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-primary-700/75 via-primary-700/10 to-transparent"></div>
						<span class="absolute top-4 left-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-primary">
							{g.category}
						</span>
						<div class="absolute inset-x-0 bottom-0 p-4">
							<div class="font-display font-bold text-white text-base leading-snug">{g.title}</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- ========================================================
	     BERITA — Carousel (Telkom-style)
	======================================================== -->
	<Carousel
		id="berita"
		eyebrow="Update Terbaru"
		title="Berita & Artikel"
		subtitle="Kabar terbaru seputar konservasi, edukasi, dan aksi lingkungan MAPFLOFA."
		viewAllHref="/berita"
		viewAllLabel="Baca Selengkapnya"
	>
		{#each news as n}
			<NewsCard {...n} href={`/berita/${n.slug}`} />
		{/each}
	</Carousel>

	<!-- ========================================================
	     DAMPAK & PENCAPAIAN — evergreen stats band
	======================================================== -->
	<section class="py-20 md:py-28 px-4 md:px-8">
		<div class="max-w-7xl mx-auto">
			<div use:reveal={{ from: 'up' }} class="text-center max-w-2xl mx-auto">
				<div class="text-xs font-bold uppercase tracking-widest text-accent">Dampak Kami</div>
				<h2 class="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-5xl text-primary leading-tight">
					Aksi nyata, dampak nyata
				</h2>
				<p class="mt-5 text-slate-600 text-base md:text-lg leading-relaxed">
					Setiap kegiatan MAPFLOFA berkontribusi pada lingkungan yang lebih asri dan
					kesadaran masyarakat yang lebih tinggi.
				</p>
			</div>

			<div class="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
				{#each impactStats as s, i}
					<div
						use:reveal={{ from: 'up', delay: i * 90 }}
						class="rounded-3xl bg-surface-3 border border-slate-100 p-6 md:p-8 text-center
						       transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
					>
						<div class="text-3xl md:text-4xl">{s.icon}</div>
						<div class="mt-3 font-display font-extrabold text-3xl md:text-4xl text-primary leading-none">
							{s.value}
						</div>
						<div class="mt-2 text-sm text-slate-500 font-medium">{s.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ========================================================
	     CONTACT / CTA
	======================================================== -->
	<section id="kontak" class="py-20 md:py-28 px-4 md:px-8">
		<div class="max-w-7xl mx-auto">
			<div
				use:reveal={{ from: 'scale' }}
				class="relative bg-gradient-to-br from-primary to-primary-700 text-white
				       rounded-[2.5rem] overflow-hidden
				       px-8 md:px-16 py-16 md:py-24
				       shadow-2xl shadow-primary/30"
			>
				<div
					aria-hidden="true"
					use:parallax={{ speed: 0.2 }}
					class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl"
				></div>
				<div
					aria-hidden="true"
					use:parallax={{ speed: -0.15 }}
					class="absolute -bottom-40 -left-20 w-[28rem] h-[28rem] rounded-full bg-white/5 blur-3xl"
				></div>

				<div class="relative grid lg:grid-cols-2 gap-12 items-center">
					<div use:reveal={{ from: 'left', delay: 100 }}>
						<div class="text-xs font-bold uppercase tracking-widest text-accent">Gabung MAPFLOFA</div>
						<h2 class="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl leading-[1.05]">
							Jadi bagian dari gerakan penyayang flora & fauna
						</h2>
						<p class="mt-6 text-white/80 text-lg leading-relaxed max-w-xl">
							Terbuka untuk semua mahasiswa yang peduli pada alam. Ikuti kegiatan kami atau
							hubungi pengurus untuk informasi pendaftaran anggota.
						</p>

						<div class="mt-10 flex flex-wrap gap-4">
							<Button variant="accent" size="lg">Daftar Anggota</Button>
							<a
								href="https://wa.me/6281234567890"
								class="inline-flex items-center gap-3 px-7 py-3.5
								       text-white border border-white/25 rounded-full
								       font-semibold text-base
								       hover:bg-white hover:text-primary
								       transition-all duration-300"
							>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
								</svg>
								Chat WhatsApp
							</a>
						</div>
					</div>

					<div use:reveal={{ from: 'right', delay: 200 }} class="bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-8">
						<h3 class="font-display font-bold text-2xl">Hubungi Kami</h3>
						<ul class="mt-6 space-y-5">
							{#each [
								{ icon: '📍', label: 'Sekretariat', value: 'Gedung UKM Kampus, Jl. Kampus Hijau No. 1, Indonesia' },
								{ icon: '✉', label: 'Email', value: 'halo@mapflofa.org' },
								{ icon: '📱', label: 'Instagram', value: '@mapflofa' }
							] as c}
								<li class="flex gap-4">
									<div class="w-11 h-11 rounded-2xl bg-white/15 grid place-items-center shrink-0 text-lg">
										{c.icon}
									</div>
									<div>
										<div class="text-xs uppercase tracking-wider text-white/65 font-semibold">{c.label}</div>
										<div class="mt-1 font-medium">{c.value}</div>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ========================================================
	     FOOTER
	======================================================== -->
	<Footer />
</main>
