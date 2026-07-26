<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { page } from '$app/state';

	type ContactData = {
		address: string;
		whatsapp: string;
		instagram: string;
		email: string;
		extra: { label: string; value: string }[];
		socials: { platform: string; url: string }[];
	};

	type NewsItem = {
		id: number;
		title: string;
		slug: string;
		category: string;
		createdAt?: Date | string | null;
		publishedAt?: Date | string | null;
	};

	const contact = $derived((page.data as { contact?: ContactData })?.contact ?? {
		address: '', whatsapp: '', instagram: '', email: '', extra: [], socials: []
	});

	const latestNews = $derived((page.data as { latestNews?: NewsItem[] })?.latestNews ?? []);

	function formatDate(d?: Date | string | null): string {
		if (!d) return '';
		const dateObj = typeof d === 'string' ? new Date(d) : d;
		if (isNaN(dateObj.getTime())) return '';
		return dateObj.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	const navLinks = [
		{ label: 'Beranda', href: '/' },
		{ label: 'Profil Korp', href: '/profil' },
		{ label: 'Berita & Artikel', href: '/berita' },
		{ label: 'Galeri Kegiatan', href: '/galeri' },
		{ label: 'Struktur Pengurus', href: '/profil#struktur' }
	];

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
		const onScroll = () => (showScrollTop = window.scrollY > 500);
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	});

	function scrollTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<footer class="relative bg-primary-700 text-white mt-24 md:mt-32">
	<!-- Curved white brand tab top-left -->
	<div
		class="relative bg-white rounded-br-[2.5rem]
		       w-[280px] md:w-[320px] h-24 md:h-28
		       flex items-center px-7 md:px-9 shadow-md"
	>
		<!-- Logo + brand -->
		<a href="/" class="flex items-center gap-3 group">
			<div class="w-11 h-11 rounded-2xl overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-105">
				<img src="/logo.png" alt="MAPFLOFA" class="w-full h-full object-contain" />
			</div>

			<div>
				<div class="font-display font-extrabold text-primary text-base md:text-lg tracking-tight leading-none">
					MAPFLOFA
				</div>
				<div class="text-[11px] text-slate-500 mt-1 font-medium tracking-wide">
					Penyayang Flora &amp; Fauna
				</div>
			</div>
		</a>

		<span
			aria-hidden="true"
			class="absolute top-0 right-[-2.5rem] w-10 h-10 bg-primary-700"
			style="border-top-left-radius: 2.5rem;"
		></span>
	</div>

	<!-- Horizontal divider -->
	<div class="absolute top-24 md:top-28 left-[280px] md:left-[320px] right-8 md:right-12 h-px bg-white/15"></div>

	<!-- Body grid -->
	<div class="px-6 md:px-12 lg:px-16 pt-10 md:pt-14 pb-10">
		<div class="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr_1.2fr] gap-10 md:gap-14">
			<!-- COL 1: Identitas & Kontak -->
			<div>
				<div class="inline-flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 mb-6">
					<div class="w-9 h-9 rounded-xl bg-accent grid place-items-center text-white shrink-0 shadow-md">
						<Icon name="leaf" size={18} />
					</div>
					<div>
						<div class="text-[11px] text-white/70 uppercase tracking-wider font-bold">
							Organisasi Mahasiswa
						</div>
						<div class="font-display font-extrabold text-white text-sm">
							Pecinta Alam &amp; Konservasi
						</div>
					</div>
				</div>

				<address class="not-italic text-sm leading-relaxed text-white/80 space-y-2">
					{#if contact.address}
						<div class="flex items-start gap-2.5">
							<svg class="w-4 h-4 text-emerald-400 shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
								<circle cx="12" cy="10" r="3" />
							</svg>
							<span>{contact.address}</span>
						</div>
					{/if}
					{#if contact.whatsapp}
						<div class="flex items-center gap-2.5">
							<svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
							</svg>
							<span>WhatsApp: {contact.whatsapp}</span>
						</div>
					{/if}
					{#if contact.email}
						<div class="flex items-center gap-2.5">
							<svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect width="20" height="16" x="2" y="4" rx="2" />
								<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
							</svg>
							<span>{contact.email}</span>
						</div>
					{/if}
					{#each contact.extra as c}
						<div class="text-sm text-white/80">{c.label}: {c.value}</div>
					{/each}
				</address>

				<!-- Social Media Icons -->
				{#if contact.socials && contact.socials.length > 0}
					<ul class="mt-6 flex flex-wrap gap-2.5">
						{#each contact.socials as s (s.platform)}
							<li>
								<a
									href={s.url}
									aria-label={s.platform}
									target="_blank"
									rel="noopener"
									class="group w-10 h-10 rounded-full
									       bg-white/10 border border-white/20
									       grid place-items-center
									       transition-all duration-300
									       hover:bg-accent hover:border-accent hover:scale-110"
								>
									<svg
										class="w-[18px] h-[18px] text-white transition-colors"
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
				{/if}
			</div>

			<!-- COL 2: Navigasi Cepat -->
			<nav aria-label="Navigasi kaki" class="lg:pl-6">
				<h3 class="text-xs uppercase tracking-wider font-extrabold text-emerald-400 mb-5">
					Navigasi Utama
				</h3>
				<ul class="space-y-3.5">
					{#each navLinks as link}
						<li>
							<a
								href={link.href}
								class="group inline-flex items-center gap-2
								       text-sm md:text-base font-semibold text-white/90
								       transition-all duration-200
								       hover:text-emerald-400 hover:translate-x-1"
							>
								<span>{link.label}</span>
								<svg
									class="w-4 h-4 opacity-0 -translate-x-1
									       transition-all duration-200
									       group-hover:opacity-100 group-hover:translate-x-0 text-emerald-400"
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

			<!-- COL 3: Real Database News Feed -->
			<div>
				<h3 class="text-xs uppercase tracking-wider font-extrabold text-emerald-400 mb-5 flex items-center justify-between">
					<span>Berita Terbaru</span>
					<a href="/berita" class="text-[11px] font-semibold text-white/70 hover:text-white transition-colors">
						Lihat Semua →
					</a>
				</h3>

				<div class="rounded-2xl bg-white/5 border border-white/10 p-3 space-y-2">
					{#if latestNews && latestNews.length > 0}
						{#each latestNews as a, i (a.id)}
							<a
								href={`/berita/${a.slug}`}
								class="group block p-3 rounded-xl
								       transition-all duration-200
								       hover:bg-white/10"
							>
								<div class="flex items-start gap-3">
									<div
										class="w-9 h-9 rounded-lg bg-white/10 grid place-items-center shrink-0
										       text-white/80 group-hover:bg-accent group-hover:text-white
										       transition-colors duration-200 mt-0.5"
									>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
											<polyline points="14 2 14 8 20 8" />
											<line x1="8" y1="13" x2="16" y2="13" />
											<line x1="8" y1="17" x2="13" y2="17" />
										</svg>
									</div>
									<div class="min-w-0 flex-1">
										<div class="flex items-center gap-2 text-[11px] font-bold">
											<span class="text-emerald-400 uppercase tracking-wider">{a.category || 'Berita'}</span>
											{#if a.createdAt || a.publishedAt}
												<span class="text-white/40">• {formatDate(a.publishedAt || a.createdAt)}</span>
											{/if}
										</div>
										<p class="mt-1 text-sm font-semibold text-white/90 leading-snug line-clamp-2 group-hover:text-emerald-300 transition-colors">
											{a.title}
										</p>
									</div>
								</div>
							</a>
							{#if i < latestNews.length - 1}
								<div class="border-t border-white/5 mx-2"></div>
							{/if}
						{/each}
					{:else}
						<div class="p-4 text-center text-sm text-white/60">
							Belum ada berita dipublikasikan.
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Bottom bar -->
		<div class="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/60">
			<div>© 2026 MAPFLOFA — Mahasiswa Penyayang Flora Fauna. All Rights Reserved.</div>
			<div class="flex gap-6 font-medium">
				<a href="/profil" class="hover:text-white transition-colors">Tentang Kami</a>
				<a href="/berita" class="hover:text-white transition-colors">Kabar Konservasi</a>
				<a href="/galeri" class="hover:text-white transition-colors">Galeri</a>
			</div>
		</div>
	</div>

	<!-- Floating scroll to top button -->
	<div class="fixed right-5 md:right-7 bottom-5 md:bottom-7 z-40">
		<button
			type="button"
			onclick={scrollTop}
			aria-label="Kembali ke atas"
			class="w-12 h-12 rounded-full bg-white text-primary grid place-items-center
			       shadow-2xl shadow-slate-900/40
			       transition-all duration-300
			       hover:-translate-y-1 hover:bg-emerald-400 hover:text-white
			       focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30
			       {showScrollTop ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-90 translate-y-4'}"
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
