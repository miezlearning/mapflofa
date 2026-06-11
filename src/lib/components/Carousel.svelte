<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		eyebrow?: string;
		title: string;
		subtitle?: string;
		viewAllHref?: string;
		viewAllLabel?: string;
		id?: string;
		children: Snippet;
	}

	let {
		eyebrow,
		title,
		subtitle,
		viewAllHref = '#',
		viewAllLabel = 'Baca Selengkapnya',
		id,
		children
	}: Props = $props();

	let track: HTMLDivElement | null = $state(null);
	let canPrev = $state(false);
	let canNext = $state(true);

	function updateButtons() {
		if (!track) return;
		canPrev = track.scrollLeft > 4;
		canNext = track.scrollLeft + track.clientWidth < track.scrollWidth - 4;
	}

	function scroll(dir: 1 | -1) {
		if (!track) return;
		const card = track.firstElementChild as HTMLElement | null;
		const step = card ? card.clientWidth + 24 : track.clientWidth * 0.8;
		track.scrollBy({ left: dir * step, behavior: 'smooth' });
	}

	onMount(() => {
		updateButtons();
		const ro = new ResizeObserver(updateButtons);
		if (track) ro.observe(track);
		return () => ro.disconnect();
	});
</script>

<section {id} class="py-20 md:py-28 px-4 md:px-8">
	<div class="max-w-7xl mx-auto">
		<div class="grid lg:grid-cols-[320px_1fr] gap-6 md:gap-8 items-stretch">
			<!-- Intro card -->
			<div
				class="rounded-3xl bg-white border border-slate-100
				       shadow-xl shadow-slate-200/50
				       p-7 md:p-8 flex flex-col"
			>
				{#if eyebrow}
					<div class="text-xs font-bold uppercase tracking-widest text-accent">
						{eyebrow}
					</div>
				{/if}
				<h2
					class="mt-2 font-display font-extrabold tracking-tight
					       text-3xl md:text-4xl text-primary leading-[1.05]"
				>
					{title}
				</h2>
				{#if subtitle}
					<p class="mt-4 text-slate-600 text-sm md:text-base leading-relaxed">
						{subtitle}
					</p>
				{/if}

				<a
					href={viewAllHref}
					class="mt-8 lg:mt-auto inline-flex items-center gap-2
					       text-accent font-semibold text-sm group w-fit"
				>
					<span class="link-underline">{viewAllLabel}</span>
					<span
						class="w-7 h-7 rounded-full bg-accent/10 grid place-items-center
						       transition-all duration-300
						       group-hover:bg-accent group-hover:text-white group-hover:rotate-[-45deg]"
					>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<path d="M5 12h14M13 5l7 7-7 7" />
						</svg>
					</span>
				</a>

				<!-- Carousel controls -->
				<div class="mt-6 flex gap-2">
					<button
						type="button"
						onclick={() => scroll(-1)}
						disabled={!canPrev}
						aria-label="Sebelumnya"
						class="w-11 h-11 rounded-full border border-slate-200 bg-white
						       grid place-items-center text-primary
						       transition-all duration-300
						       hover:bg-primary hover:text-white hover:border-primary
						       hover:-translate-y-0.5
						       disabled:opacity-40 disabled:cursor-not-allowed
						       disabled:hover:bg-white disabled:hover:text-primary
						       disabled:hover:translate-y-0 disabled:hover:border-slate-200
						       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<path d="M19 12H5M12 19l-7-7 7-7" />
						</svg>
					</button>
					<button
						type="button"
						onclick={() => scroll(1)}
						disabled={!canNext}
						aria-label="Berikutnya"
						class="w-11 h-11 rounded-full border border-slate-200 bg-white
						       grid place-items-center text-primary
						       transition-all duration-300
						       hover:bg-primary hover:text-white hover:border-primary
						       hover:-translate-y-0.5
						       disabled:opacity-40 disabled:cursor-not-allowed
						       disabled:hover:bg-white disabled:hover:text-primary
						       disabled:hover:translate-y-0 disabled:hover:border-slate-200
						       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<path d="M5 12h14M13 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Track -->
			<div class="relative min-w-0">
				<div
					bind:this={track}
					onscroll={updateButtons}
					class="flex gap-5 md:gap-6 overflow-x-auto
					       snap-x snap-mandatory scrollbar-hide
					       -mx-4 md:-mx-8 lg:mx-0
					       px-0 scroll-px-4 md:scroll-px-8 lg:scroll-px-0
					       [&>*:first-child]:ml-4 md:[&>*:first-child]:ml-8 lg:[&>*:first-child]:ml-0
					       [&>*:last-child]:mr-4 md:[&>*:last-child]:mr-8 lg:[&>*:last-child]:mr-0
					       pb-3 scroll-smooth"
				>
					{@render children()}
				</div>

				<!-- Right edge fade hint (desktop only) -->
				<div
					aria-hidden="true"
					class="carousel-edge-fade hidden lg:block pointer-events-none
					       absolute inset-y-0 right-0 w-12
					       bg-gradient-to-l from-surface to-transparent"
				></div>
			</div>
		</div>
	</div>
</section>
