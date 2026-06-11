<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import type { ProgramPreview } from '$lib/types/program';

	interface Props {
		programs: ProgramPreview[];
	}

	let { programs }: Props = $props();
	const programCount = $derived(programs.length);
</script>

<section
	class="programs-hero relative overflow-hidden [padding:clamp(7rem,12vw,10rem)_clamp(1rem,4vw,4rem)_clamp(3rem,7vw,6rem)] max-[760px]:pt-[6.25rem]"
>
	<div
		aria-hidden="true"
		class="absolute inset-x-0 top-0 h-px bg-[oklch(84%_0.021_238)] dark:bg-[oklch(24%_0.072_246)]"
	></div>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,oklch(23%_0.071_246_/_0.05)_1px,transparent_1px),linear-gradient(0deg,oklch(23%_0.071_246_/_0.035)_1px,transparent_1px)] bg-[size:4.75rem_4.75rem] dark:bg-[linear-gradient(90deg,oklch(80%_0.16_188_/_0.14)_1px,transparent_1px),linear-gradient(0deg,oklch(70%_0.22_22_/_0.11)_1px,transparent_1px)]"
	></div>
	<div
		aria-hidden="true"
		class="absolute left-[-1rem] top-[clamp(5.5rem,11vw,8rem)] z-0 select-none whitespace-nowrap text-[clamp(5.2rem,15vw,13rem)] font-[850] uppercase leading-[0.85] text-[oklch(18%_0.04_244_/_0.035)] dark:text-[oklch(98%_0.018_92_/_0.07)]"
	>
		PROGRAM · PROGRAM · PROGRAM
	</div>

	<div
		class="relative z-[1] mx-auto max-w-[1280px]"
	>
		<div
			use:reveal={{ from: 'left' }}
			class="flex min-h-[clamp(24rem,42vw,34rem)] max-w-[880px] flex-col justify-end pb-[clamp(0rem,3vw,3rem)] max-[900px]:min-h-auto"
		>
			<div class="mb-[clamp(1.25rem,3vw,2rem)] flex flex-wrap items-center gap-3">
				<p class="m-0 text-[0.78rem] font-extrabold uppercase tracking-[0.14em] text-[oklch(51%_0.18_18)] dark:text-[oklch(70%_0.22_22)]">
					Program Unggulan
				</p>
				<span
					class="inline-flex min-h-10 items-center rounded-full border border-[oklch(84%_0.021_238)] bg-[oklch(97%_0.008_238_/_0.86)] px-4 text-sm font-extrabold text-[oklch(23%_0.071_246)] shadow-sm shadow-[oklch(38%_0.08_244_/_0.08)] dark:border-[oklch(76%_0.08_218_/_0.24)] dark:bg-[oklch(24%_0.072_246_/_0.8)] dark:text-[oklch(98%_0.018_92)]"
				>
					{programCount} program aktif
				</span>
			</div>

			<h1
				class="m-0 max-w-[760px] text-[clamp(2.55rem,6.2vw,5.8rem)] font-[850] leading-[0.96] tracking-[0] text-[oklch(23%_0.071_246)] dark:text-[oklch(98%_0.018_92)]"
			>
				Ruang belajar yang membuat siswa berani mencoba.
			</h1>
			<p
				class="mb-0 mt-[clamp(1.25rem,3vw,2rem)] max-w-[43rem] text-[clamp(1rem,1.4vw,1.18rem)] leading-[1.8] text-[oklch(43%_0.04_246)] dark:text-[oklch(78%_0.048_235)]"
			>
				Setiap program dibuat sebagai pengalaman nyata: eksperimen, latihan, panggung,
				pertandingan, dan pendampingan karakter yang terukur.
			</p>

			<div class="mt-[clamp(1.5rem,4vw,2.5rem)] flex flex-wrap items-center gap-3">
				<a
					class="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[oklch(23%_0.071_246)] px-5 py-3 text-sm font-extrabold text-[oklch(97%_0.008_238)] no-underline shadow-lg shadow-[oklch(23%_0.071_246_/_0.18)] [transition:transform_0.28s_cubic-bezier(0.22,1,0.36,1),background_0.28s_cubic-bezier(0.22,1,0.36,1),box-shadow_0.28s_cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[oklch(30%_0.08_246)] hover:shadow-xl hover:shadow-[oklch(23%_0.071_246_/_0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(23%_0.071_246_/_0.4)]"
					href="#daftar-program"
				>
					Lihat daftar program
					<span aria-hidden="true">↓</span>
				</a>
				<a
					class="inline-flex min-h-12 items-center justify-center rounded-full border border-[oklch(84%_0.021_238)] bg-[oklch(97%_0.008_238_/_0.72)] px-5 py-3 text-sm font-extrabold text-[oklch(23%_0.071_246)] no-underline [transition:transform_0.28s_cubic-bezier(0.22,1,0.36,1),border-color_0.28s_cubic-bezier(0.22,1,0.36,1),color_0.28s_cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[oklch(51%_0.18_18)] hover:text-[oklch(51%_0.18_18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(23%_0.071_246_/_0.35)]"
					href="/#kontak"
				>
					Konsultasi PPDB
				</a>
			</div>
		</div>
	</div>
</section>
