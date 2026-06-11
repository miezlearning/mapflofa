<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ProgramCard from '$lib/components/programs/ProgramCard.svelte';
	import type { PageData } from './$types';

	type DetailItem = {
		label: string;
		value: string;
	};

	type ListSection = {
		title: string;
		items: string[];
	};

	let { data }: { data: PageData } = $props();
	const program = $derived(data.program);
	const relatedPrograms = $derived(data.relatedPrograms ?? []);

	const toList = (value: string | null | undefined) =>
		(value ?? '')
			.split(/\r?\n/)
			.map((item) => item.trim())
			.filter(Boolean);

	const bodyText = $derived(program.post?.trim() ? program.post : program.excerpt);
	const paragraphs = $derived(
		bodyText
			.split(/\n{2,}/)
			.map((paragraph) => paragraph.trim())
			.filter(Boolean)
	);
	const primaryFacts = $derived(
		[
			{ label: 'Jadwal', value: program.schedule },
			{ label: 'Lokasi', value: program.location },
			{ label: 'Peserta', value: program.audience }
		].filter((item): item is DetailItem => Boolean(item.value))
	);

	const quickFacts = $derived(
		[
			{ label: 'Pembina', value: program.mentor },
			{ label: 'Kapasitas', value: program.capacity },
			{ label: 'Kontak', value: program.contact }
		].filter((item): item is DetailItem => Boolean(item.value))
	);

	const highlightList = $derived(toList(program.highlights));
	const listSections = $derived(
		[
			{ title: 'Yang dilatih', items: toList(program.outcomes) },
			{ title: 'Kegiatan rutin', items: toList(program.activities) },
			{ title: 'Perlu disiapkan', items: toList(program.requirements) }
		].filter((section): section is ListSection => section.items.length > 0)
	);
</script>

<svelte:head>
	<title>{program.title} | Kegiatan MAPFLOFA</title>
	<meta name="description" content={program.excerpt} />
</svelte:head>

<FloatingNavbar />

<main class="min-h-screen overflow-x-clip bg-[linear-gradient(135deg,oklch(97%_0.009_238)_0%,oklch(92%_0.02_244)_54%,oklch(98%_0.01_18)_100%)] text-[oklch(22%_0.045_244)] transition-colors duration-200 dark:bg-[radial-gradient(circle_at_9%_13%,oklch(80%_0.16_188_/_0.26),transparent_30rem),radial-gradient(circle_at_90%_4%,oklch(67%_0.24_18_/_0.2),transparent_25rem),linear-gradient(135deg,oklch(13%_0.052_258),oklch(9%_0.046_268))] dark:text-[oklch(92%_0.014_238)]">
	<section class="px-[clamp(1rem,4vw,4rem)] pb-[clamp(2.5rem,5vw,4.5rem)] pt-[clamp(6.5rem,10vw,9rem)]">
		<div class="mx-auto max-w-[1180px]">
			<nav
				class="mb-[clamp(1.25rem,3vw,2rem)] flex flex-wrap items-center gap-2 text-[0.82rem] font-semibold text-[oklch(46%_0.034_244)] dark:text-[oklch(76%_0.018_238)]"
				aria-label="Breadcrumb"
			>
				<a class="text-inherit no-underline transition-colors duration-200 hover:text-[oklch(24%_0.06_244)] dark:hover:text-[oklch(96%_0.012_238)]" href="/">Beranda</a>
				<span aria-hidden="true">/</span>
				<a class="text-inherit no-underline transition-colors duration-200 hover:text-[oklch(24%_0.06_244)] dark:hover:text-[oklch(96%_0.012_238)]" href="/programs">Program</a>
				<span aria-hidden="true">/</span>
				<span aria-current="page">{program.tag}</span>
			</nav>

			<div class="grid items-end gap-[clamp(1.5rem,4vw,3rem)] [grid-template-columns:minmax(0,0.84fr)_minmax(18rem,0.56fr)] max-[900px]:grid-cols-1">
				<div use:reveal={{ from: 'up', delay: 60 }}>
					<div class="flex flex-wrap items-center gap-3 text-[0.82rem] font-semibold text-[oklch(45%_0.036_244)] dark:text-[oklch(78%_0.018_238)]">
						<span class="rounded-full border border-[oklch(82%_0.036_28)] bg-[oklch(98%_0.012_28)] px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[oklch(45%_0.09_28)] dark:border-[oklch(67%_0.24_18_/_0.42)] dark:bg-[oklch(20%_0.06_18_/_0.42)] dark:text-[oklch(84%_0.15_20)]">{program.tag}</span>
						{#if program.mentor}
							<span>{program.mentor}</span>
						{/if}
					</div>

					<h1 class="mt-5 max-w-[12ch] font-display text-[clamp(2.45rem,6vw,5.1rem)] font-[850] leading-[0.98] tracking-[0] text-[oklch(22%_0.06_244)] [text-wrap:balance] dark:text-[oklch(96%_0.012_238)]">
						{program.title}
					</h1>
					<p class="mt-6 max-w-[64ch] text-[clamp(1rem,1.5vw,1.16rem)] font-[450] leading-[1.75] text-[oklch(38%_0.036_244)] dark:text-[oklch(81%_0.023_238)]">
						{program.excerpt}
					</p>

					{#if primaryFacts.length > 0}
						<dl class="mt-8 grid max-w-[52rem] gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr))]">
							{#each primaryFacts as item}
								<div class="border-t border-[oklch(78%_0.025_244)] pt-3 dark:border-[oklch(88%_0.018_238_/_0.16)]">
									<dt class="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[oklch(48%_0.035_244)] dark:text-[oklch(76%_0.018_238)]">{item.label}</dt>
									<dd class="m-0 mt-1 text-[0.98rem] font-[800] leading-[1.36] text-[oklch(24%_0.058_244)] dark:text-[oklch(94%_0.012_238)]">{item.value}</dd>
								</div>
							{/each}
						</dl>
					{/if}

					{#if highlightList.length > 0}
						<ul class="mt-7 flex list-none flex-wrap gap-2 p-0">
							{#each highlightList as item}
								<li class="rounded-full bg-[oklch(99%_0.006_238_/_0.78)] px-3.5 py-2 text-[0.86rem] font-semibold text-[oklch(27%_0.05_244)] shadow-[inset_0_0_0_1px_oklch(83%_0.025_244)] dark:bg-[oklch(17%_0.032_244)] dark:text-[oklch(88%_0.015_238)] dark:shadow-[inset_0_0_0_1px_oklch(88%_0.018_238_/_0.16)]">
									{item}
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<figure
					class="m-0 overflow-hidden rounded-[1.25rem] border border-[oklch(86%_0.02_244)] bg-[oklch(93%_0.012_238)] shadow-[0_24px_70px_-48px_oklch(22%_0.06_244_/_0.45)] dark:border-[oklch(88%_0.018_238_/_0.14)] dark:bg-[oklch(17%_0.032_244)]"
					use:reveal={{ from: 'scale', delay: 140 }}
				>
					<img class="block aspect-[4/3] w-full object-cover" src={program.image} alt={`Suasana program ${program.title}`} />
				</figure>
			</div>
		</div>
	</section>

	<section class="px-[clamp(1rem,4vw,4rem)] pb-[clamp(3.5rem,7vw,7rem)]">
		<div class="mx-auto grid max-w-[1180px] gap-[clamp(2rem,5vw,4rem)] border-t border-[oklch(82%_0.021_238)] pt-[clamp(2rem,5vw,4rem)] [grid-template-columns:minmax(0,0.74fr)_minmax(17rem,0.26fr)] max-[960px]:grid-cols-1 dark:border-[oklch(88%_0.018_238_/_0.14)]">
			<article use:reveal>
				<h2 class="m-0 text-[clamp(1.55rem,3vw,2.35rem)] font-[800] leading-[1.12] tracking-[0] text-[oklch(23%_0.058_244)] dark:text-[oklch(96%_0.012_238)]">
					Apa yang dipelajari
				</h2>

				<div class="mt-6 max-w-[72ch] text-[1rem] leading-[1.82] text-[oklch(34%_0.035_244)] dark:text-[oklch(82%_0.024_238)]">
					{#each paragraphs as paragraph}
						<p class="mt-5 first:mt-0">{paragraph}</p>
					{/each}
				</div>

				{#if listSections.length > 0}
					<div class="mt-[clamp(2rem,5vw,3.5rem)] grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))]">
						{#each listSections as section}
							<section class="border-t border-[oklch(82%_0.021_238)] pt-5 dark:border-[oklch(88%_0.018_238_/_0.14)]">
								<h3 class="m-0 text-[1.05rem] font-[800] text-[oklch(23%_0.058_244)] dark:text-[oklch(96%_0.012_238)]">{section.title}</h3>
								<ul class="mt-4 grid list-none gap-3 p-0">
									{#each section.items as item}
										<li class="grid gap-3 text-[0.96rem] leading-[1.58] text-[oklch(37%_0.035_244)] [grid-template-columns:0.55rem_1fr] dark:text-[oklch(82%_0.024_238)]">
											<span class="mt-[0.58rem] h-1.5 w-1.5 rounded-full bg-[oklch(50%_0.095_28)]" aria-hidden="true"></span>
											<span>{item}</span>
										</li>
									{/each}
								</ul>
							</section>
						{/each}
					</div>
				{/if}
			</article>

			<aside class="min-w-0" use:reveal={{ from: 'right', delay: 90 }}>
				<div class="sticky top-24 space-y-5">
					{#if quickFacts.length > 0}
						<section class="rounded-[1rem] border border-[oklch(84%_0.021_238)] bg-[oklch(99%_0.006_238)] p-5 dark:border-[oklch(88%_0.018_238_/_0.14)] dark:bg-[oklch(16%_0.03_244)]">
							<h2 class="m-0 text-[1rem] font-[800] text-[oklch(23%_0.058_244)] dark:text-[oklch(96%_0.012_238)]">Detail singkat</h2>
							<dl class="mt-5 grid gap-4">
								{#each quickFacts as item}
									<div>
										<dt class="text-[0.78rem] font-semibold text-[oklch(48%_0.035_244)] dark:text-[oklch(76%_0.018_238)]">{item.label}</dt>
										<dd class="m-0 mt-1 text-[0.96rem] font-[750] leading-[1.42] text-[oklch(25%_0.052_244)] dark:text-[oklch(94%_0.012_238)]">{item.value}</dd>
									</div>
								{/each}
							</dl>
						</section>
					{/if}

					<section class="rounded-[1rem] border border-[oklch(84%_0.021_238)] bg-[oklch(99%_0.006_238)] p-5 dark:border-[oklch(88%_0.018_238_/_0.14)] dark:bg-[oklch(16%_0.03_244)]">
						<h2 class="m-0 text-[1rem] font-[800] text-[oklch(23%_0.058_244)] dark:text-[oklch(96%_0.012_238)]">Cara bergabung</h2>
						<p class="mt-3 text-[0.95rem] leading-[1.68] text-[oklch(38%_0.035_244)] dark:text-[oklch(82%_0.024_238)]">
							{program.registration ?? 'Hubungi wali kelas atau pembina program untuk jadwal pendaftaran terbaru.'}
						</p>
						<a
							href="/#kontak"
							class="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[oklch(23%_0.071_246)] px-4 py-2.5 text-[0.9rem] font-[750] text-[oklch(97%_0.008_238)] no-underline transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px focus-visible:-translate-y-px motion-reduce:transition-none"
						>
							Hubungi sekolah
						</a>
					</section>
				</div>
			</aside>
		</div>
	</section>

	{#if relatedPrograms.length > 0}
		<section class="px-[clamp(1rem,4vw,4rem)] pb-[clamp(4rem,7vw,7rem)]" use:reveal>
			<div class="mx-auto max-w-[1180px] border-t border-[oklch(82%_0.021_238)] pt-[clamp(2rem,5vw,3.25rem)] dark:border-[oklch(88%_0.018_238_/_0.14)]">
				<div class="flex items-end justify-between gap-5 max-[760px]:items-start max-[760px]:flex-col">
					<div>
						<h2 class="m-0 text-[clamp(1.45rem,3vw,2.1rem)] font-[800] leading-[1.15] tracking-[0] text-[oklch(23%_0.058_244)] dark:text-[oklch(96%_0.012_238)]">Program terkait</h2>
						<p class="mt-2 max-w-[42rem] text-[0.96rem] leading-[1.65] text-[oklch(42%_0.036_244)] dark:text-[oklch(80%_0.023_238)]">
							Beberapa pilihan lain yang masih dekat dengan minat siswa.
						</p>
					</div>
					<a class="text-[0.9rem] font-[750] text-[oklch(23%_0.058_244)] no-underline hover:underline dark:text-[oklch(96%_0.012_238)] dark:hover:text-[oklch(87%_0.105_185)]" href="/programs">Lihat semua program</a>
				</div>

				<div class="mt-7 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))]">
					{#each relatedPrograms as rel, i}
						<ProgramCard program={rel} index={i} />
					{/each}
				</div>
			</div>
		</section>
	{/if}
</main>

<Footer />
