<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import type { ProgramPreview } from '$lib/types/program';

	interface Props {
		program: ProgramPreview;
		index?: number;
	}

	let { program, index = 0 }: Props = $props();
	const quickMeta = $derived(
		[
			{ label: 'Jadwal', value: program.schedule },
			{ label: 'Lokasi', value: program.location },
			{ label: 'Peserta', value: program.audience }
		].find((item) => Boolean(item.value))
	);
</script>

<a
	use:reveal={{ from: index % 3 === 1 ? 'scale' : 'up', delay: index * 70 }}
	class="group relative flex h-full min-h-[27rem] flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white text-primary no-underline shadow-lg shadow-slate-200/50 outline-none transition-all duration-500 hover:shadow-2xl hover:shadow-slate-300/60 focus-visible:-translate-y-1 focus-visible:shadow-2xl focus-visible:shadow-slate-300/60 focus-visible:ring-4 focus-visible:ring-accent/30 dark:border-white/10 dark:bg-[oklch(16%_0.045_252)] dark:text-white dark:shadow-[0_20px_56px_-34px_oklch(4%_0.035_268_/_0.72)] dark:hover:bg-[oklch(19%_0.052_252)] dark:hover:shadow-[0_24px_64px_-38px_oklch(4%_0.035_268_/_0.78)] dark:focus-visible:bg-[oklch(19%_0.052_252)] dark:focus-visible:ring-accent/25 motion-reduce:transform-none motion-reduce:transition-none"
	href={`/programs/${program.id}`}
	aria-label={`Buka program ${program.title}`}
>
	<figure class="relative m-3 mb-0 aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 dark:bg-[oklch(12%_0.046_268)]">
		<img
			class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
			src={program.image}
			alt={program.title}
			loading="lazy"
		/>
		<div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/55 to-transparent dark:from-[oklch(5%_0.035_268_/_0.7)]"></div>
		<div class="absolute top-3 left-3 flex flex-wrap gap-2">
			<span class="inline-block rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-primary shadow dark:bg-white/20 dark:text-white dark:backdrop-blur-sm">
				{program.tag}
			</span>
			{#if quickMeta}
				<span class="inline-block rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-white shadow dark:bg-accent">
					{quickMeta.label}
				</span>
			{/if}
		</div>
	</figure>

	<div class="flex flex-1 flex-col justify-between p-6 md:p-7">
		<div>
			<h3 class="font-display text-xl font-bold leading-snug text-primary transition-colors duration-300 group-hover:text-accent group-focus-visible:text-accent md:text-2xl dark:text-white dark:group-hover:text-accent dark:group-focus-visible:text-accent">
				{program.title}
			</h3>

			<p class="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-white/70">
				{program.excerpt}
			</p>

			{#if quickMeta?.value}
				<p class="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/45">
					{quickMeta.value}
				</p>
			{/if}
		</div>

		<div class="mt-6 inline-flex items-center gap-3 text-sm font-semibold text-primary dark:text-white">
			<span class="link-underline">Pelajari</span>
			<span
				class="grid h-9 w-9 place-items-center rounded-full bg-primary text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-[-45deg] group-focus-visible:translate-x-1 group-focus-visible:rotate-[-45deg] dark:bg-white dark:text-primary motion-reduce:transform-none motion-reduce:transition-none"
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<path d="M5 12h14M13 5l7 7-7 7" />
				</svg>
			</span>
		</div>
	</div>
</a>
