<script lang="ts">
	import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ProgramsHero from '$lib/components/programs/ProgramsHero.svelte';
	import ProgramsList from '$lib/components/programs/ProgramsList.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const allPrograms = $derived(data.programs);
</script>

<svelte:head>
	<title>Kegiatan | MAPFLOFA</title>
	<meta
		name="description"
		content="Jelajahi kegiatan konservasi, edukasi, aksi lingkungan, dan ekspedisi alam MAPFLOFA."
	/>
</svelte:head>

<FloatingNavbar />

<main
	class="min-h-screen [overflow-x:clip] bg-[linear-gradient(135deg,oklch(97%_0.009_238)_0%,oklch(92%_0.02_244)_52%,oklch(98%_0.01_18)_100%)] text-[oklch(22%_0.045_244)] transition-colors duration-200 dark:bg-[radial-gradient(circle_at_12%_12%,oklch(80%_0.16_188_/_0.28),transparent_28rem),radial-gradient(circle_at_88%_2%,oklch(67%_0.24_18_/_0.22),transparent_24rem),radial-gradient(circle_at_55%_0%,oklch(70%_0.22_22_/_0.1),transparent_34rem),linear-gradient(135deg,oklch(13%_0.052_258),oklch(9%_0.046_268)_56%,oklch(25%_0.065_250))] dark:text-[oklch(91%_0.028_242)]"
>
	<ProgramsHero programs={allPrograms} />
	<ProgramsList programs={allPrograms} />
</main>

<Footer />
