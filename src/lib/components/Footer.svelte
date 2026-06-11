<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/theme.svelte';

	interface Article {
		date: string;
		time: string;
		tag: string;
		title: string;
	}

	const recentArticles: Article[] = [
		{
			date: '20-05-2026',
			time: '20:46',
			tag: 'Artikel',
			title:
				'Tim Robotik SMP 1 Anggana Boyong Juara 2 Provinsi #BeraniBerinovasi #PelajarUnggul'
		},
		{
			date: '20-05-2026',
			time: '07:40',
			tag: 'Artikel',
			title:
				'Kurikulum STEAM Resmi Diterapkan Tahun Ini, Fokus pada Proyek Lintas Mapel'
		},
		{
			date: '18-05-2026',
			time: '14:20',
			tag: 'Artikel',
			title:
				'Renovasi Lab Komputer Selesai, 36 Unit Siap Mendukung Pembelajaran Digital'
		}
	];

	const navLinks = [
		'Profil Sekolah',
		'Akademik',
		'PPDB 2026',
		'Berita',
		'Prestasi',
		'Ekstrakurikuler',
		'Karir Guru',
		'Hubungi Kami',
		'Peta Situs'
	];

	const socials = [
		{ label: 'Facebook', href: '#', d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
		{ label: 'Instagram', href: '#', d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z' },
		{ label: 'Twitter / X', href: '#', d: 'M18 4l-12 16M6 4l12 16' },
		{ label: 'LinkedIn', href: '#', d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z' },
		{ label: 'YouTube', href: '#', d: 'M22.54 6.42A2.78 2.78 0 0 0 20.6 4.5C18.88 4 12 4 12 4s-6.88 0-8.6.5A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 11.5a29 29 0 0 0 .46 5.08 2.78 2.78 0 0 0 1.94 1.92C5.12 19 12 19 12 19s6.88 0 8.6-.5a2.78 2.78 0 0 0 1.94-1.92A29 29 0 0 0 23 11.5a29 29 0 0 0-.46-5.08zM10 15.02v-7l6 3.5z' }
	];

	let showScrollTop = $state(false);

	onMount(() => {
		theme.hydrate();
		const onScroll = () => (showScrollTop = window.scrollY > 600);
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	});

	function scrollTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function themeLabel(): string {
		switch (theme.pref) {
			case 'light':
				return 'Mode terang';
			case 'dark':
				return 'Mode gelap';
			default:
				return 'Otomatis';
		}
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
			<div class="w-11 h-11 rounded-2xl bg-primary text-white grid place-items-center font-bold">
				S1
			</div>
			<div>
				<div class="font-display font-extrabold text-primary tracking-tight leading-none">
					SMP 1 Anggana
				</div>
				<div class="text-[11px] text-slate-500 mt-1 font-medium">
					the spirit of education
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
					Jl. Anggana Raya, Kelurahan Sungai Meriam, Kecamatan Anggana,
					Kabupaten Kutai Kartanegara, Kalimantan Timur 75381, Indonesia.
				</address>
				<p class="mt-4 text-sm text-white/80">Phone: (0541) 555-0123</p>
				<p class="text-sm text-white/80">Fax: (0541) 555-0124</p>
				<p class="text-sm text-white/80">Email: info@smp1anggana.sch.id</p>

				<!-- Social row -->
				<ul class="mt-7 flex flex-wrap gap-2.5">
					{#each socials as s}
						<li>
							<a
								href={s.href}
								aria-label={s.label}
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
									<path d={s.d} />
								</svg>
							</a>
						</li>
					{/each}
				</ul>

				<!-- Partner / accreditation badge -->
				<div class="mt-9 inline-flex items-center gap-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3">
					<div class="w-9 h-9 rounded-xl bg-accent grid place-items-center text-white font-bold">
						A
					</div>
					<div>
						<div class="text-[11px] text-white/60 uppercase tracking-wider font-semibold">
							Akreditasi Sekolah
						</div>
						<div class="font-display font-bold text-white text-sm">
							Unggul (A) — BAN-S/M
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
										<span class="text-accent">{a.tag}</span>
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
			<div>© 2026 SMP 1 Anggana. All Rights Reserved.</div>
			<div class="flex gap-6">
				<a href="/" class="hover:text-white transition-colors">Kebijakan Privasi</a>
				<a href="/" class="hover:text-white transition-colors">Syarat & Ketentuan</a>
				<a href="/" class="hover:text-white transition-colors">Sitemap</a>
			</div>
		</div>
	</div>

	<!-- ================ Floating action buttons ================ -->
	<div class="fixed right-5 md:right-7 bottom-5 md:bottom-7 z-40 flex flex-col gap-3">
		<!-- Theme toggle -->
		<button
			type="button"
			onclick={() => theme.cycle()}
			aria-label={`Tema: ${themeLabel()}. Klik untuk ganti.`}
			title={`Tema: ${themeLabel()}`}
			class="theme-fab w-12 h-12 rounded-full grid place-items-center
			       shadow-xl transition-all duration-300 hover:-translate-y-0.5
			       focus:outline-none focus-visible:ring-4"
		>
			{#if theme.pref === 'dark'}
				<!-- moon -->
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
				</svg>
			{:else if theme.pref === 'light'}
				<!-- sun -->
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
				</svg>
			{:else}
				<!-- auto: half-disc -->
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="12" cy="12" r="9" />
					<path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
				</svg>
			{/if}
		</button>

		<!-- Accessibility shortcut -->
		<button
			type="button"
			aria-label="Pengaturan aksesibilitas"
			class="w-12 h-12 rounded-full bg-accent text-white grid place-items-center
			       shadow-xl shadow-accent/40
			       transition-all duration-300
			       hover:bg-accent-600 hover:-translate-y-0.5
			       focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="4" r="2" />
				<path d="M19 13a7 7 0 1 0-13.3 3" />
				<path d="M12 8v8M8 12h8M9 22l3-6 3 6" />
			</svg>
		</button>

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
	/* Theme toggle FAB — colored to match the brand in light mode and the
	   dark surface in dark mode. Uses CSS variables so theme flip is
	   instant without re-rendering. */
	.theme-fab {
		background: var(--color-primary, #0b2e4f);
		color: #ffffff;
		box-shadow: 0 14px 30px -10px rgba(11, 46, 79, 0.55);
	}

	.theme-fab:focus-visible {
		--tw-ring-color: rgba(11, 46, 79, 0.4);
	}

	:global([data-theme='dark']) .theme-fab {
		background: #ffffff;
		color: #0b2e4f;
		box-shadow: 0 14px 30px -10px rgba(0, 0, 0, 0.7);
	}
</style>
