<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	import type { ProgramPreview } from '$lib/types/program';
	import ProgramCard from './ProgramCard.svelte';
	import ProgramsEmptyState from './ProgramsEmptyState.svelte';

	interface Props {
		programs: ProgramPreview[];
	}

	let { programs }: Props = $props();
</script>

<section
	id="daftar-program"
	class="programs-list [padding:clamp(2rem,6vw,5rem)_clamp(1rem,4vw,4rem)_clamp(4rem,7vw,7rem)]"
	aria-label="Daftar program sekolah"
>
	<div
		use:reveal
		class="mx-auto mb-[clamp(1.5rem,4vw,3.25rem)] max-w-[1180px]"
	>
		<div class="grid items-end gap-[clamp(1rem,3vw,2rem)] border-y border-[oklch(84%_0.021_238)] py-[clamp(1.25rem,3vw,2rem)] [grid-template-columns:minmax(0,0.74fr)_minmax(12rem,0.26fr)] dark:border-[oklch(76%_0.08_218_/_0.24)] max-[760px]:grid-cols-1">
			<h2
				class="m-0 max-w-[22ch] text-[clamp(1.85rem,3.2vw,3.15rem)] font-[850] leading-[1.03] tracking-[0] text-[oklch(23%_0.071_246)] dark:text-[oklch(98%_0.018_92)]"
			>
				Tiap minat punya ruang untuk tumbuh serius.
			</h2>
			<p class="m-0 max-w-[32rem] text-sm font-semibold leading-[1.75] text-[oklch(43%_0.04_246)] dark:text-[oklch(78%_0.048_235)]">
				Pilih jalur yang paling dekat dengan cara siswa belajar, lalu buka detail untuk melihat
				pendekatan, kegiatan, dan ruang bertumbuhnya.
			</p>
		</div>
	</div>

	{#if programs.length}
		<div
			class="mx-auto grid max-w-[1180px] auto-rows-[minmax(24rem,auto)] gap-[clamp(1rem,2vw,1.5rem)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr))] max-[640px]:auto-rows-[minmax(21rem,auto)]"
		>
			{#each programs as program, index}
				<ProgramCard {program} {index} />
			{/each}
		</div>
	{:else}
		<ProgramsEmptyState />
	{/if}
</section>
