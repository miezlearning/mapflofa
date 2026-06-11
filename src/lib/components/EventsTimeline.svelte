<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import { parallax } from '$lib/actions/parallax';

	interface EventItem {
		category: string;
		date: string;
		dateD: string;
		dateM: string;
		title: string;
		excerpt: string;
		image: string;
		time?: string;
		loc?: string;
	}

	interface Props {
		events: EventItem[];
	}

	let { events }: Props = $props();

	let activeIndex = $state(0);
	const featured = $derived(events[activeIndex] ?? events[0]);
</script>

<section id="acara" class="relative py-20 md:py-28 px-4 md:px-8 bg-primary text-white overflow-hidden">
	<!-- Decorative orbs -->
	<div aria-hidden="true" class="pointer-events-none absolute inset-0">
		<div
			use:parallax={{ speed: 0.18 }}
			class="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-accent/15 blur-3xl"
		></div>
		<div
			use:parallax={{ speed: -0.12 }}
			class="absolute -bottom-40 -left-32 w-[420px] h-[420px] rounded-full bg-white/5 blur-3xl"
		></div>
	</div>

	<div class="relative max-w-7xl mx-auto">
		<!-- Header -->
		<div use:reveal class="grid lg:grid-cols-[1fr_auto] gap-8 items-end mb-12">
			<div class="max-w-2xl">
				<div class="text-xs font-bold uppercase tracking-widest text-accent">Agenda Sekolah</div>
				<h2 class="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-5xl leading-[1.05]">
					Acara mendatang yang patut dinanti
				</h2>
				<p class="mt-5 text-white/75 text-base md:text-lg leading-relaxed">
					Pilih satu agenda untuk melihat detailnya, atau jelajahi seluruh kalender sekolah.
				</p>
			</div>
			<a href="#acara" class="link-underline text-white font-semibold hidden lg:inline-flex">
				Lihat kalender
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
					<path d="M5 12h14M13 5l7 7-7 7" />
				</svg>
			</a>
		</div>

		<!-- Featured event + timeline -->
		<div class="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-start">
			<!-- Featured -->
			<div use:reveal={{ from: 'left' }} class="relative">
				<div class="relative overflow-hidden mask-organic aspect-[4/3] bg-slate-900">
					{#each events as e, i}
						<img
							src={e.image}
							alt={e.title}
							class="absolute inset-0 w-full h-full object-cover
							       transition-opacity duration-500 ease-out"
							style="opacity: {i === activeIndex ? 1 : 0};"
						/>
					{/each}
					<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

					<!-- Big date badge -->
					<div
						class="absolute top-6 left-6 bg-white text-primary
						       rounded-2xl px-4 py-3 shadow-xl shadow-black/20
						       text-center min-w-[68px]"
					>
						<div class="font-display font-extrabold text-3xl leading-none">{featured.dateD}</div>
						<div class="text-[10px] uppercase font-bold mt-1 tracking-wider text-slate-500">
							{featured.dateM}
						</div>
					</div>

					<!-- Category pill -->
					<div class="absolute top-6 right-6 bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full">
						{featured.category}
					</div>

					<!-- Bottom info -->
					<div class="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
						<h3 class="font-display font-extrabold text-2xl md:text-4xl leading-tight">
							{featured.title}
						</h3>
						<p class="mt-3 text-white/85 text-sm md:text-base max-w-xl leading-relaxed line-clamp-2">
							{featured.excerpt}
						</p>

						<div class="mt-5 flex flex-wrap gap-4 text-xs md:text-sm font-medium text-white/80">
							{#if featured.time}
								<span class="inline-flex items-center gap-2">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
										<circle cx="12" cy="12" r="10" />
										<path d="M12 6v6l4 2" />
									</svg>
									{featured.time}
								</span>
							{/if}
							{#if featured.loc}
								<span class="inline-flex items-center gap-2">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
										<circle cx="12" cy="10" r="3" />
									</svg>
									{featured.loc}
								</span>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Timeline list -->
			<ol class="relative">
				<!-- Vertical guide line -->
				<span aria-hidden="true" class="absolute left-7 top-2 bottom-2 w-px bg-white/15"></span>

				{#each events as e, i}
					<li use:reveal={{ from: 'right', delay: i * 90 }}>
						<button
							type="button"
							onclick={() => (activeIndex = i)}
							class="group relative w-full text-left
							       flex items-start gap-5 py-4
							       transition-colors duration-300"
							aria-pressed={i === activeIndex}
						>
							<!-- Date stack -->
							<div
								class="relative z-10 shrink-0 w-14 text-center
								       rounded-2xl py-2.5 px-2
								       transition-all duration-300
								       {i === activeIndex
										? 'bg-accent text-white scale-110 shadow-lg shadow-accent/40'
										: 'bg-white/10 text-white group-hover:bg-white/20'}"
							>
								<div class="font-display font-extrabold text-lg leading-none">{e.dateD}</div>
								<div class="text-[10px] uppercase font-bold mt-0.5 tracking-wider opacity-90">
									{e.dateM}
								</div>
							</div>

							<div class="flex-1 min-w-0 pt-1">
								<div class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/60">
									<span>{e.category}</span>
									{#if e.time}
										<span class="w-1 h-1 rounded-full bg-white/40"></span>
										<span>{e.time}</span>
									{/if}
								</div>
								<h4
									class="mt-1.5 font-display font-bold text-lg md:text-xl
									       transition-colors duration-300
									       {i === activeIndex ? 'text-white' : 'text-white/85 group-hover:text-white'}"
								>
									{e.title}
								</h4>
								{#if e.loc}
									<p class="mt-1 text-xs text-white/55">📍 {e.loc}</p>
								{/if}
							</div>

							<svg
								class="shrink-0 mt-3 w-5 h-5 transition-all duration-300
								       {i === activeIndex ? 'text-accent translate-x-1' : 'text-white/30 group-hover:text-white group-hover:translate-x-1'}"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
							>
								<path d="M9 18l6-6-6-6" />
							</svg>
						</button>
						{#if i < events.length - 1}
							<span aria-hidden="true" class="block ml-7 h-px bg-white/10"></span>
						{/if}
					</li>
				{/each}
			</ol>
		</div>
	</div>
</section>
