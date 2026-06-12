<script lang="ts">
	interface Props {
		category: string;
		date: string;
		title: string;
		excerpt: string;
		image: string;
		href?: string;
	}

	let { category, date, title, excerpt, image, href = '#' }: Props = $props();
</script>

<a
	{href}
	class="group snap-start shrink-0
	       w-[280px] sm:w-[320px] md:w-[340px]
	       block"
>
	<div
		class="relative rounded-3xl overflow-hidden bg-slate-100 aspect-[4/3]
		       shadow-lg shadow-slate-200/50"
	>
		<img
			src={image}
			alt={title}
			loading="lazy"
			class="w-full h-full object-cover
			       transition-transform duration-700 ease-out
			       group-hover:scale-110"
		/>
		<!-- Date pill (top-left) -->
		<div
			class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm
			       px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700"
		>
			{date}
		</div>
		<!-- Category tag (bottom-right) -->
		<div
			class="absolute bottom-4 right-4
			       bg-white/95 backdrop-blur-sm text-ink text-[11px] font-semibold
			       px-3 py-1.5 rounded-lg"
		>
			{category}
		</div>
	</div>

	<h3
		class="mt-5 font-display font-bold text-lg md:text-xl text-ink
		       leading-snug
		       transition-colors duration-300
		       group-hover:text-primary"
	>
		{title}
	</h3>
	<p class="mt-3 text-sm text-muted leading-relaxed line-clamp-3">
		{excerpt}
	</p>
</a>
