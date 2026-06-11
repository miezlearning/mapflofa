<script lang="ts">
	import { onMount } from 'svelte';

	type Props = { rootSelector?: string };
	let { rootSelector = '.post-content .md-content' }: Props = $props();

	let activeSrc = $state<string | null>(null);
	let activeAlt = $state('');

	onMount(() => {
		const root = document.querySelector<HTMLElement>(rootSelector);
		if (!root) return;

		function open(e: Event) {
			const img = e.target as HTMLImageElement | null;
			if (!img || img.tagName !== 'IMG') return;
			activeSrc = img.currentSrc || img.src;
			activeAlt = img.alt;
		}

		// Style cursor on every img for affordance.
		for (const img of root.querySelectorAll<HTMLImageElement>('img')) {
			img.style.cursor = 'zoom-in';
		}

		root.addEventListener('click', open);
		return () => root.removeEventListener('click', open);
	});

	function close() {
		activeSrc = null;
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={onKey} />

{#if activeSrc}
	<div
		class="backdrop"
		role="dialog"
		aria-modal="true"
		aria-label={activeAlt || 'Image preview'}
		onclick={close}
		onkeydown={(e) => e.key === 'Enter' && close()}
		tabindex="-1"
	>
		<img src={activeSrc} alt={activeAlt} />
		<button type="button" class="close" aria-label="Tutup" onclick={close}>✕</button>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(2, 6, 23, 0.92);
		display: grid;
		place-items: center;
		padding: 2rem;
		z-index: 80;
		cursor: zoom-out;
		animation: fade 160ms ease-out;
	}

	.backdrop img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border-radius: 0.5rem;
		box-shadow: 0 24px 60px -10px rgba(0, 0, 0, 0.5);
	}

	.close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
		font-size: 1rem;
		cursor: pointer;
		backdrop-filter: blur(8px);
	}

	.close:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	@keyframes fade {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
