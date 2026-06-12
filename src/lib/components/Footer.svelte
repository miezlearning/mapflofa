<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { page } from '$app/state';

	interface Article {
		date: string;
		time: string;
		tag: string;
		title: string;
	}

	// Contact data from the root layout (loaded from site_content DB).
	type ContactData = {
		address: string;
		whatsapp: string;
		instagram: string;
		email: string;
		extra: { label: string; value: string }[];
		socials: { platform: string; url: string }[];
	};

	const contact = $derived((page.data as { contact?: ContactData })?.contact ?? {
		address: '', whatsapp: '', instagram: '', email: '', extra: [], socials: []
	});

	const recentArticles: Article[] = [
		{
			date: '20-05-2026',
			time: '20:46',
			tag: 'Aksi',
			title:
				'MAPFLOFA Tanam 500 Bibit Pohon di Kawasan Hulu Sungai #AksiHijau #PenyayangAlam'
		},
		{
			date: '20-05-2026',
			time: '07:40',
			tag: 'Konservasi',
			title:
				'Pendataan Burung Ducula whartoni, Upaya Lindungi Satwa Endemik Pulau'
		},
		{
			date: '18-05-2026',
			time: '14:20',
			tag: 'Edukasi',
			title:
				'Sosialisasi Satwa Langka ke Sekolah Dasar, Tumbuhkan Cinta Lingkungan Sejak Dini'
		}
	];

	const navLinks = [
		'Beranda',
		'Profil',
		'Visi & Misi',
		'Berita',
		'Galeri',
		'Kegiatan',
		'Anggota',
		'Kontak'
	];

	// Social icon paths by platform name (case-insensitive match)
	const SOCIAL_ICONS: Record<string, string> = {
		instagram: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z',
		whatsapp: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
		facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
		youtube: 'M22.54 6.42A2.78 2.78 0 0 0 20.6 4.5C18.88 4 12 4 12 4s-6.88 0-8.6.5A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 11.5a29 29 0 0 0 .46 5.08 2.78 2.78 0 0 0 1.94 1.92C5.12 19 12 19 12 19s6.88 0 8.6-.5a2.78 2.78 0 0 0 1.94-1.92A29 29 0 0 0 23 11.5a29 29 0 0 0-.46-5.08zM10 15.02v-7l6 3.5z',
		twitter: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z',
		tiktok: 'M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5',
		linkedin: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'
	};

	function getSocialIcon(platform: string): string {
		const key = platform.toLowerCase().replace(/\s/g, '');
		return SOCIAL_ICONS[key] ?? SOCIAL_ICONS['instagram'];
	}

	let showScrollTop = $state(false);

	onMount(() => {
		const onScroll = () => (showScrollTop = window.scrollY > 600);
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	});

	function scrollTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<footer class="relative bg-primary-700 text-white mt-24 md:mt-32">
	<!-- ================ Curved white tab top-left ================ -->
	<div
		class="relative bg-white rounded-br-[2.5rem]
		       w-[280px] md:w-[320px] h-24 md:h-28
		       flex items-center px-7 md:px-9"
	>
		<!-- Logo + brand -->
		<div class="flex items-center gap-3">
			<div class="w-11 h-11 rounded-2xl overflow-hidden">
				<img src="/logo.png" alt="MAPFLOFA" class="w-full h-full object-contain" />
			</div>

			<div>
				<div class="font-display font-extrabold text-primary tracking-tight leading-none">
					MAPFLOFA
				</div>
				<div class="text-[11px] text-slate-500 mt-1 font-medium">
					penyayang flora &amp; fauna
				</div>
			</div>
		</div>

		<!-- Concave curve to the RIGHT of the tab (so dark "bites" into white) -->
		<span
			aria-hidden="true"
			class="absolute top-0 right-[-2.5rem] w-10 h-10 bg-primary-700"
			style="border-top-left-radius: 2.5rem;"
		></span>
	</div>

	<!-- Horizontal divider that visually links to the tab bottom -->
	<div class="absolute top-24 md:top-28 left-[280px] md:left-[320px] right-8 md:right-12 h-px bg-white/15"></div>

	<!-- ================ Body grid ================ -->
	<div class="px-6 md:px-12 lg:px-16 pt-10 md:pt-14 pb-10">
		<div class="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_1fr_1fr] gap-10 md:gap-14">
			<!-- ===== COL 1: Contact info ===== -->
			<div>
				<address class="not-italic text-sm leading-relaxed text-white/80">
					{contact.address}
				</address>
				{#if contact.whatsapp}
					<p class="mt-4 text-sm text-white/80">WhatsApp: {contact.whatsapp}</p>
				{/if}
				{#if contact.instagram}
					<p class="text-sm text-white/80">Instagram: {contact.instagram}</p>
				{/if}
				{#if contact.email}
					<p class="text-sm text-white/80">Email: {contact.email}</p>
				{/if}
				{#each contact.extra as c}
					<p class="text-sm text-white/80">{c.label}: {c.value}</p>
				{/each}

				<!-- Social row -->
				<ul class="mt-7 flex flex-wrap gap-2.5">
					{#each contact.socials as s (s.platform)}
						<li>
							<a
								href={s.url}
								aria-label={s.platform}
								target="_blank"
								rel="noopener"
								class="group w-10 h-10 rounded-full
								       border border-white/20
								       grid place-items-center
								       transition-all duration-300
								       hover:bg-white hover:border-white hover:-translate-y-0.5"
							>
								<svg
									class="w-[18px] h-[18px] text-white/85 group-hover:text-primary transition-colors"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d={getSocialIcon(s.platform)} />
								</svg>
							</a>
						</li>
					{/each}
				</ul>

				<!-- Organisation badge -->
				<div class="mt-9 inline-flex items-center gap-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3">
					<div class="w-9 h-9 rounded-xl bg-accent grid place-items-center text-white">
						<Icon name="leaf" size={18} />
					</div>
					<div>
						<div class="text-[11px] text-white/60 uppercase tracking-wider font-semibold">
							Organisasi Mahasiswa
						</div>
						<div class="font-display font-bold text-white text-sm">
							Pecinta Alam &amp; Konservasi
						</div>
					</div>
				</div>
			</div>

			<!-- ===== COL 2: Nav links ===== -->
			<nav aria-label="Tautan kaki" class="lg:pl-8">
				<ul class="space-y-4">
					{#each navLinks as link}
						<li>
							<a
								href="/"
								class="group inline-flex items-center gap-2
								       text-base md:text-lg font-semibold text-white/90
								       transition-colors duration-200
								       hover:text-accent"
							>
								<span>{link}</span>
								<svg
									class="w-4 h-4 opacity-0 -translate-x-1
									       transition-all duration-200
									       group-hover:opacity-100 group-hover:translate-x-0"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
								>
									<path d="M5 12h14M13 5l7 7-7 7" />
								</svg>
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<!-- ===== COL 3: Article feed widget ===== -->
			<div>
				<div
					class="rounded-2xl bg-primary border border-white/10
					       p-3 max-h-[320px] overflow-y-auto scrollbar-hide"
				>
					{#each recentArticles as a, i}
						<article
							class="group p-3 rounded-xl
							       transition-colors duration-200
							       hover:bg-white/5 cursor-pointer"
						>
							<div class="flex items-start gap-3">
								<div
									class="w-10 h-10 rounded-lg bg-white/10 grid place-items-center shrink-0
									       text-white/70 group-hover:bg-accent group-hover:text-white
									       transition-colors duration-200"
								>
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
										<polyline points="14 2 14 8 20 8" />
										<line x1="8" y1="13" x2="16" y2="13" />
										<line x1="8" y1="17" x2="13" y2="17" />
									</svg>
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-2 text-[11px] font-semibold">
										<span class="text-white/90">{a.tag}</span>
										<span class="text-white/40">{a.date} {a.time}</span>
									</div>
									<p class="mt-1.5 text-sm text-white/90 leading-snug line-clamp-3 group-hover:text-white">
										{a.title}
									</p>
								</div>
							</div>
						</article>
						{#if i < recentArticles.length - 1}
							<div class="border-t border-dashed border-white/10 mx-3"></div>
						{/if}
					{/each}
				</div>

				<a
					href="/berita"
					class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/85 hover:text-white"
				>
					<span class="link-underline">Lihat semua berita</span>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
						<path d="M5 12h14M13 5l7 7-7 7" />
					</svg>
				</a>
			</div>
		</div>

		<!-- ================ Bottom bar ================ -->
		<div class="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/55">
			<div>© 2026 MAPFLOFA — Mahasiswa Penyayang Flora Fauna. All Rights Reserved.</div>
			<div class="flex gap-6">
				<a href="/" class="hover:text-white transition-colors">Kebijakan Privasi</a>
				<a href="/" class="hover:text-white transition-colors">Syarat & Ketentuan</a>
				<a href="/" class="hover:text-white transition-colors">Sitemap</a>
			</div>
		</div>
	</div>

	<!-- ================ Floating action buttons ================ -->
	<div class="fixed right-5 md:right-7 bottom-5 md:bottom-7 z-40 flex flex-col gap-3">
		<!-- Scroll to top -->
		<button
			type="button"
			onclick={scrollTop}
			aria-label="Kembali ke atas"
			class="w-12 h-12 rounded-full bg-white text-primary grid place-items-center
			       shadow-xl shadow-slate-400/30
			       transition-all duration-300
			       hover:-translate-y-0.5 hover:shadow-2xl
			       focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30
			       {showScrollTop ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-y-2'}"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
				<path d="M12 19V5M5 12l7-7 7 7" />
			</svg>
		</button>
	</div>
</footer>

<style>
	/* Footer uses brand tokens directly; no theme-toggle styling needed. */
</style>
