<script lang="ts">
	import { onMount } from 'svelte';

	let progress = $state(0);
	let reducedMotion = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mq.matches;
		const onChange = (e: MediaQueryListEvent) => (reducedMotion = e.matches);
		mq.addEventListener('change', onChange);

		let raf: number | null = null;
		const update = () => {
			raf = null;
			const h = document.documentElement;
			const total = h.scrollHeight - h.clientHeight;
			progress = total > 0 ? (h.scrollTop / total) * 100 : 0;
		};
		const schedule = () => {
			if (raf == null) raf = requestAnimationFrame(update);
		};
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		update();
		return () => {
			mq.removeEventListener('change', onChange);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			if (raf) cancelAnimationFrame(raf);
		};
	});
</script>

<div
	aria-hidden="true"
	class="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none"
>
	<div
		class="h-full bg-gradient-to-r from-accent via-accent-600 to-primary
		       origin-left will-change-transform"
		style="transform: scaleX({progress / 100}); transition: {reducedMotion ? 'none' : 'transform 0.08s linear'};"
	></div>
</div>
