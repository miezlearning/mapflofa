<script lang="ts">
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import { parallax } from '$lib/actions/parallax';

	interface Slide {
		hashtag: string;
		titleA: string;
		titleB: string;
		desc: string;
		image: string;
		previewLabel: string;
		previewTitle: string;
	}

	const slides: Slide[] = [
		{
			hashtag: '#PenyayangFloraFauna',
			titleA: 'Menjaga',
			titleB: 'Alam & Satwa',
			desc: 'Komunitas mahasiswa pecinta alam yang bergerak nyata untuk konservasi flora, fauna, dan ekosistem Indonesia.',
			image:
				'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop',
			previewLabel: 'KegiatanKami',
			previewTitle: 'Penanaman\nPohon'
		},
		{
			hashtag: '#KonservasiSatwa',
			titleA: 'Melindungi',
			titleB: 'Satwa Langka',
			desc: 'Edukasi dan aksi pelestarian satwa endemik, dari burung Ducula whartoni hingga habitat di sekitar kita.',
			image:
				'https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=1600&auto=format&fit=crop',
			previewLabel: 'KegiatanKami',
			previewTitle: 'Sosialisasi\nSatwa'
		},
		{
			hashtag: '#AksiHijau',
			titleA: 'Menanam',
			titleB: 'Harapan Hijau',
			desc: 'Gerakan penanaman pohon, bersih sungai, dan reboisasi bersama untuk bumi yang lebih asri.',
			image:
				'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1600&auto=format&fit=crop',
			previewLabel: 'KegiatanKami',
			previewTitle: 'Edukasi\nLingkungan'
		},
		{
			hashtag: '#JelajahAlam',
			titleA: 'Menjelajah',
			titleB: 'Keanekaragaman Hayati',
			desc: 'Ekspedisi dan pendataan flora fauna di alam liar, sambil menumbuhkan kecintaan pada lingkungan.',
			image:
				'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1600&auto=format&fit=crop',
			previewLabel: 'KegiatanKami',
			previewTitle: 'Ekspedisi\nKonservasi'
		}
	];

	const discover = [
		{ label: 'Tentang MAPFLOFA', href: '/profil' },
		{ label: 'Visi & Misi', href: '/profil' },
		{ label: 'Kegiatan & Aksi', href: '#program' },
		{ label: 'Galeri Kegiatan', href: '/galeri' },
		{ label: 'Berita Lingkungan', href: '#berita' }
	];

	let index = $state(0);
	let isAnimating = $state(false);
	let reducedMotion = $state(false);
	let timer: ReturnType<typeof setInterval> | null = null;
	let pointerStartX: number | null = null;

	const current = $derived(slides[index]);
	const next = $derived(slides[(index + 1) % slides.length]);

	function go(dir: 1 | -1) {
		if (isAnimating) return;
		isAnimating = true;
		index = (index + dir + slides.length) % slides.length;
		setTimeout(() => (isAnimating = false), 600);
		restartAuto();
	}

	function jumpTo(i: number) {
		if (isAnimating || i === index) return;
		isAnimating = true;
		index = i;
		setTimeout(() => (isAnimating = false), 600);
		restartAuto();
	}

	function startAuto() {
		if (reducedMotion) return;
		stopAuto();
		timer = setInterval(() => {
			index = (index + 1) % slides.length;
		}, 7000);
	}
	function stopAuto() {
		if (timer) clearInterval(timer);
		timer = null;
	}
	function restartAuto() {
		stopAuto();
		startAuto();
	}

	function handlePointerDown(event: PointerEvent) {
		if (event.pointerType === 'mouse') return;
		pointerStartX = event.clientX;
		stopAuto();
	}

	function handlePointerUp(event: PointerEvent) {
		if (pointerStartX === null) return;
		const distance = event.clientX - pointerStartX;
		pointerStartX = null;

		if (Math.abs(distance) >= 48) go(distance < 0 ? 1 : -1);
		else startAuto();
	}

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mq.matches;
		const onChange = (e: MediaQueryListEvent) => {
			reducedMotion = e.matches;
			if (reducedMotion) stopAuto();
			else startAuto();
		};
		mq.addEventListener('change', onChange);

		startAuto();

		return () => {
			mq.removeEventListener('change', onChange);
			stopAuto();
		};
	});
</script>

<section
	id="beranda"
	class="relative overflow-hidden px-4 pb-14 pt-24 sm:pt-28 md:px-8 md:pb-20 md:pt-32 lg:pt-36"
>
	<!-- Background ambient blobs -->
	<div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
		<div use:parallax={{ speed: 0.15 }} class="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl"></div>
		<div use:parallax={{ speed: -0.18 }} class="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-accent/5 dark:bg-accent/10 blur-3xl"></div>
	</div>

	<!-- Parallax band behind everything -->
	<div
		aria-hidden="true"
		class="absolute inset-x-0 top-24 md:top-32 pointer-events-none overflow-hidden -z-0"
	>
		<div
			use:parallax={{ speed: 0.05 }}
			class="select-none whitespace-nowrap
			       font-display font-extrabold uppercase tracking-tighter
			       text-[28vw] leading-[0.85] text-slate-900/[0.04] dark:text-white/[0.02] md:text-[18vw]"
		>
			MAPFLOFA · FLORA · FAUNA</div>
	</div>

	<div class="relative z-10 max-w-7xl mx-auto">
		<div class="grid gap-6 md:gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_390px]">
			<!-- ============ MAIN SLIDE ============ -->
			<div
				class="relative min-w-0"
				role="region"
				aria-roledescription="carousel"
				aria-label="Sorotan MAPFLOFA"
				onmouseenter={stopAuto}
				onmouseleave={startAuto}
				onfocusin={stopAuto}
				onfocusout={startAuto}
			>
				<!-- Slide stack with crossfade -->
				<div
					class="relative overflow-hidden mask-organic
					       h-[min(76svh,42rem)] min-h-[32rem] bg-slate-900
					       sm:min-h-[35rem] md:h-[min(72svh,46rem)] md:min-h-[38rem]
					       lg:h-auto lg:min-h-0 lg:aspect-[16/11] xl:aspect-[16/10]"
					role="group"
					aria-label={`Slide ${index + 1} dari ${slides.length}`}
					onpointerdown={handlePointerDown}
					onpointerup={handlePointerUp}
					onpointercancel={() => {
						pointerStartX = null;
						startAuto();
					}}
				>
					{#each slides as slide, i}
						<div
							class="absolute inset-0 transition-opacity duration-700 ease-out"
							style="opacity: {i === index ? 1 : 0}; pointer-events: {i === index ? 'auto' : 'none'};"
							aria-hidden={i !== index}
						>
							<img
								src={slide.image}
								alt={slide.titleB}
								class="w-full h-full object-cover transition-transform duration-[7000ms] ease-out"
								style="transform: scale({i === index ? 1.06 : 1});"
							/>
							<!-- Gradient overlay for legibility -->
							<div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/5 md:from-slate-950/76"></div>
							<div class="absolute inset-0 bg-gradient-to-r from-slate-950/45 via-transparent to-transparent"></div>
						</div>
					{/each}

					<!-- Foreground copy -->
					<div class="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 md:p-10 lg:p-12 xl:p-14">
						<div class="max-w-3xl text-white">
							<div
								class="text-xs font-bold tracking-wide sm:text-sm md:text-base
								       text-white/90"
							>
								{current.hashtag}
							</div>
							<h1
								class="mt-2 max-w-[12ch] font-display font-extrabold tracking-[-0.045em]
								       text-[clamp(2.45rem,11.5vw,4.75rem)] leading-[0.94] text-white
								       md:mt-3 md:max-w-[13ch] md:text-[clamp(4.2rem,7vw,5.5rem)]"
							>
								<span class="block opacity-95">{current.titleA}</span>
								<span class="block">{current.titleB}</span>
							</h1>

							<p class="hero-description mt-4 max-w-[38rem] text-sm leading-relaxed text-white/85 sm:text-base md:mt-6">
								{current.desc}
							</p>

							<div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 md:mt-8">
								<Button href="/galeri" variant="accent" size="lg" class="max-sm:w-full">Lihat Kegiatan</Button>

								<!-- Counter -->
								<div class="flex min-h-11 items-center gap-3 sm:ml-2">
									<span class="font-display font-bold text-white text-lg">
										{String(index + 1).padStart(2, '0')}
									</span>
									<span class="w-12 h-[2px] bg-white/30 relative overflow-hidden">
										<span
											class="absolute inset-y-0 left-0 bg-accent"
											style="width: {((index + 1) / slides.length) * 100}%; transition: width 0.6s ease-out;"
										></span>
									</span>
									<span class="text-white/60 text-sm">{slides.length}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Persistent controls -->
				<div class="mt-4 flex min-h-12 items-center gap-3 sm:mt-5">
					<button
						type="button"
						onclick={() => go(-1)}
						aria-label="Slide sebelumnya"
						class="grid size-12 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-primary
						       shadow-sm transition-[transform,background-color,color,border-color] duration-300
						       hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white
						       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
						       dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-accent dark:hover:bg-accent"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<path d="M19 12H5M12 19l-7-7 7-7" />
						</svg>
					</button>

					<div class="flex flex-1 items-center justify-center gap-1 sm:gap-2" aria-label="Pilih slide">
						{#each slides as _, i}
							<button
								type="button"
								aria-label={`Pindah ke slide ${i + 1}`}
								aria-current={i === index ? 'true' : undefined}
								onclick={() => jumpTo(i)}
								class="group grid min-h-11 min-w-11 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
							>
								<span
									aria-hidden="true"
									class="h-2 rounded-full transition-all duration-300
									       {i === index ? 'w-8 bg-accent' : 'w-2 bg-slate-300 group-hover:bg-slate-400 dark:bg-slate-600'}"
								></span>
							</button>
						{/each}
					</div>

					<button
						type="button"
						onclick={() => go(1)}
						aria-label="Slide berikutnya"
						class="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-white
						       shadow-lg shadow-primary/20 transition-[transform,background-color,box-shadow] duration-300
						       hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary/30
						       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
						       dark:bg-accent dark:shadow-accent/20 dark:hover:bg-accent-600"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<path d="M5 12h14M13 5l7 7-7 7" />
						</svg>
					</button>
				</div>

				<!-- Touch-friendly shortcuts -->
				<nav aria-label="Jelajahi MAPFLOFA" class="mt-4 overflow-x-auto scrollbar-hide lg:hidden">
					<ul class="flex w-max gap-2 pr-4">
						{#each discover as d}
							<li>
								<a
									href={d.href}
									class="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700
									       shadow-sm shadow-slate-200/40 transition-colors duration-200
									       hover:border-primary/25 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30
									       dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-accent"
								>
									{d.label}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			</div>

			<!-- ============ RIGHT RAIL: Preview + Controls + Discover ============ -->
			<div class="hidden flex-col gap-6 lg:flex">
				<!-- Preview of next slide -->
				<button
					type="button"
					onclick={() => go(1)}
					aria-label="Slide berikutnya"
					class="group relative block overflow-hidden mask-organic-alt
					       aspect-[4/5] lg:aspect-auto lg:h-[300px] xl:h-[340px]
					       bg-slate-200 dark:bg-slate-800 cursor-pointer
					       focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 dark:focus-visible:ring-accent/30"
				>
					{#each slides as slide, i}
						<img
							src={slide.image}
							alt=""
							aria-hidden="true"
							class="absolute inset-0 w-full h-full object-cover
							       transition-[opacity,transform] duration-700 ease-out
							       group-hover:scale-105"
							style="opacity: {i === (index + 1) % slides.length ? 1 : 0};"
						/>
					{/each}
					<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent"></div>

					<div class="absolute inset-0 p-5 md:p-6 flex flex-col justify-end text-white">
						<div class="text-xs font-semibold opacity-85">#{next.previewLabel}</div>
						<div
							class="mt-1 font-display font-extrabold leading-[0.95]
							       text-2xl md:text-3xl whitespace-pre-line"
						>
							{next.previewTitle}
						</div>
					</div>

					<!-- Hover hint -->
					<div
						class="absolute top-4 right-4 w-9 h-9 rounded-full
						       bg-white/90 text-primary grid place-items-center
						       opacity-0 -translate-y-2
						       transition-all duration-300
						       group-hover:opacity-100 group-hover:translate-y-0"
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<path d="M5 12h14M13 5l7 7-7 7" />
						</svg>
					</div>
				</button>

				<!-- Discover list -->
				<div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-black/20 p-6">
					<div class="font-display font-bold text-primary dark:text-white">Jelajahi MAPFLOFA</div>
					<ul class="mt-4 divide-y divide-slate-100 dark:divide-slate-700">
						{#each discover as d}
							<li>
								<a
									href={d.href}
									class="group flex items-center justify-between py-3
									       text-sm text-slate-700 dark:text-slate-300 font-medium
									       hover:text-primary dark:hover:text-accent transition-colors duration-200"
								>
									<span>{d.label}</span>
									<svg
										class="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-accent
										       group-hover:translate-x-0.5 transition-all duration-200"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
									>
										<path d="M9 18l6-6-6-6" />
									</svg>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	@media (max-width: 389px) {
		.hero-description {
			display: none;
		}
	}

	@media (max-height: 560px) and (orientation: landscape) {
		.hero-description {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.duration-700),
		:global(.duration-\[7000ms\]) {
			transition-duration: 0.01ms;
		}
	}
</style>
