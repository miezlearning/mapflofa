<script lang="ts">
	import { onMount } from 'svelte';

	type Props = { targetSelector?: string };
	let { targetSelector = '.post-content' }: Props = $props();

	let progress = $state(0);

	onMount(() => {
		const target = document.querySelector<HTMLElement>(targetSelector);
		if (!target) return;

		const update = () => {
			const rect = target.getBoundingClientRect();
			const total = rect.height - window.innerHeight;
			if (total <= 0) {
				progress = rect.top < 0 ? 100 : 0;
				return;
			}
			const scrolled = -rect.top;
			progress = Math.max(0, Math.min(100, (scrolled / total) * 100));
		};

		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

<div class="progress" role="progressbar" aria-label="Reading progress" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100">
	<div class="bar" style:width={`${progress}%`}></div>
</div>

<style>
	.progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: transparent;
		z-index: 60;
		pointer-events: none;
	}

	.bar {
		height: 100%;
		background: linear-gradient(90deg, #0b2e4f, #e11d48);
		transition: width 80ms linear;
		box-shadow: 0 0 10px rgba(225, 29, 72, 0.35);
	}
</style>
