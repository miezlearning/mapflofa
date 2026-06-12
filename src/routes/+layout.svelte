<script lang="ts">
	import './layout.css';
	import ScrollProgress from '$lib/components/ScrollProgress.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/logo.png" />
</svelte:head>

<ScrollProgress />

{@render children()}
