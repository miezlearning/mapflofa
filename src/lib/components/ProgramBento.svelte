<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import type { ProgramPreview } from '$lib/types/program';

	interface Props {
		programs: ProgramPreview[];
	}

	let { programs }: Props = $props();
	const visiblePrograms = $derived(programs.slice(0, 5));
	const featured = $derived(visiblePrograms[0]);
	const secondaryPrograms = $derived(visiblePrograms.slice(1));

	const featuredLayout = 'lg:col-span-2 lg:row-span-2 min-h-[24rem] sm:min-h-[28rem] lg:min-h-0';
	const secondaryLayout = [
		'aspect-[4/3]',
		'aspect-[4/3]',
		'aspect-[4/3]',
		'aspect-[4/3]'
	];
</script>

<section id="program" class="overflow-hidden py-20 md:py-28 px-4 md:px-8">
	<div class="max-w-7xl mx-auto">
		<!-- Header row -->
		<div use:reveal class="grid lg:grid-cols-[1fr_auto] gap-8 items-end mb-12">
			<div class="max-w-2xl">
				<div class="text-xs font-bold uppercase tracking-widest text-accent">Program Unggulan</div>
				<h2 class="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-5xl text-primary leading-[1.05]">
					Tumbuh seimbang dalam ilmu, seni, dan karakter
				</h2>
				<p class="mt-5 text-slate-600 text-base md:text-lg leading-relaxed">
					Enam pilar pengembangan yang dirancang untuk membentuk pelajar utuh: dari sains
					hingga olahraga, dari teknologi hingga kepemimpinan.
				</p>
			</div>
			<a
				href="/programs"
				class="link-underline inline-flex min-h-11 w-fit items-center gap-2 text-primary font-semibold"
			>
				Semua program
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
					<path d="M5 12h14M13 5l7 7-7 7" />
				</svg>
			</a>
		</div>

		<!-- Bento grid -->
		{#if featured}
			<div class="grid sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-5 md:gap-6">
				<!-- Featured card (spans 2x2 on desktop) -->
				<a
					use:reveal
					href={`/programs/${featured.id}`}
					aria-label={`Buka program ${featured.title}`}
					class="{featuredLayout} relative group overflow-hidden rounded-[2rem] bg-primary outline-none
					       transition-transform duration-500 hover:-translate-y-1 focus-visible:-translate-y-1
					       focus-visible:ring-4 focus-visible:ring-accent/30"
				>
					<img
						src={featured.image}
						alt={featured.title}
						loading="lazy"
						class="absolute inset-0 w-full h-full object-cover
						       transition-transform duration-700 ease-out
						       group-hover:scale-110 group-focus-visible:scale-110 opacity-90 group-hover:opacity-100"
					/>
					<!-- Heavy gradient for legibility -->
					<div class="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/10"></div>

					<div class="relative z-10 h-full flex flex-col justify-between p-7 md:p-10 text-white">
						<div class="flex items-start justify-between gap-4">
							<span class="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
								{featured.tag}
							</span>
							<span class="inline-block bg-accent text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
								UNGGULAN
							</span>
						</div>

						<div>
							<h3 class="font-display font-extrabold tracking-tight text-3xl md:text-5xl leading-[0.95]">
								{featured.title}
							</h3>
							<p class="mt-4 text-white/85 text-sm md:text-base leading-relaxed max-w-md">
								{featured.excerpt}
							</p>
							<div class="mt-7 inline-flex items-center gap-3 font-semibold text-sm">
								<span class="link-underline">Pelajari lebih lanjut</span>
								<span
									class="w-9 h-9 rounded-full bg-white text-primary grid place-items-center
									       transition-transform duration-300
									       group-hover:translate-x-1 group-hover:rotate-[-45deg]
									       group-focus-visible:translate-x-1 group-focus-visible:rotate-[-45deg]"
								>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
										<path d="M5 12h14M13 5l7 7-7 7" />
									</svg>
								</span>
							</div>
						</div>
					</div>
				</a>

				<!-- Supporting cards -->
				{#each secondaryPrograms as p, i}
					{@const useImageBg = i % 2 === 1}
					<a
						use:reveal={{ delay: (i + 1) * 80 }}
						href={`/programs/${p.id}`}
						aria-label={`Buka program ${p.title}`}
						class="{secondaryLayout[i]} group relative overflow-hidden rounded-[2rem] outline-none
						       border border-slate-100
						       shadow-lg shadow-slate-200/50
						       transition-all duration-500
						       hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-1
						       focus-visible:shadow-2xl focus-visible:shadow-slate-300/60 focus-visible:-translate-y-1
						       focus-visible:ring-4 focus-visible:ring-accent/30
						       {useImageBg ? 'bg-slate-900' : 'bg-white'}"
					>
						{#if useImageBg}
							<!-- Variant A: image background, text overlay -->
							<img
								src={p.image}
								alt={p.title}
								loading="lazy"
								class="absolute inset-0 w-full h-full object-cover
								       transition-transform duration-700 ease-out
								       group-hover:scale-110 group-focus-visible:scale-110"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent"></div>
							<div class="relative z-10 h-full flex flex-col justify-between p-6 md:p-7 text-white">
								<span class="self-start inline-block bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
									{p.tag}
								</span>
								<div>
									<h3 class="font-display font-bold text-2xl md:text-[1.65rem] leading-tight">
										{p.title}
									</h3>
									<div class="mt-3 inline-flex items-center gap-2 text-sm font-semibold">
										<span class="link-underline">Pelajari</span>
										<svg
											class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											stroke-linecap="round"
										>
											<path d="M5 12h14M13 5l7 7-7 7" />
										</svg>
									</div>
								</div>
							</div>
						{:else}
							<!-- Variant B: split image top, text bottom on white card -->
							<div class="h-full flex flex-col">
								<div class="relative overflow-hidden m-3 mb-0 rounded-2xl bg-slate-100 aspect-[16/10]">
									<img
										src={p.image}
										alt={p.title}
										loading="lazy"
										class="w-full h-full object-cover
										       transition-transform duration-700 ease-out
										       group-hover:scale-110 group-focus-visible:scale-110"
									/>
									<span class="absolute top-3 left-3 inline-block bg-white text-primary text-[11px] font-semibold px-3 py-1.5 rounded-full shadow">
										{p.tag}
									</span>
								</div>
								<div class="p-6 md:p-7 flex-1 flex flex-col justify-between">
									<div>
										<h3 class="font-display font-bold text-xl md:text-2xl text-primary leading-snug
										           group-hover:text-accent group-focus-visible:text-accent transition-colors duration-300">
											{p.title}
										</h3>
										<p class="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">
											{p.excerpt}
										</p>
									</div>
									<div class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
										<span class="link-underline">Pelajari</span>
										<svg
											class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											stroke-linecap="round"
										>
											<path d="M5 12h14M13 5l7 7-7 7" />
										</svg>
									</div>
								</div>
							</div>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>
