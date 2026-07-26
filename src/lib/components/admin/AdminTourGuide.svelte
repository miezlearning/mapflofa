<script lang="ts">
	import { onMount, tick } from 'svelte';

	export interface TourStep {
		target: string; // CSS selector or data-tour attribute
		title: string;
		content: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
	}

	interface Props {
		steps: TourStep[];
		tourKey?: string;
		active?: boolean;
		onclose?: () => void;
	}

	let { steps = [], tourKey = '', active = $bindable(false), onclose }: Props = $props();

	let currentStep = $state(0);
	let targetRect = $state<{ top: number; left: number; width: number; height: number } | null>(
		null
	);
	let tooltipPos = $state<{ top: number; left: number }>({ top: 0, left: 0 });

	const step = $derived(steps[currentStep]);

	async function updatePosition() {
		if (!active || !step) {
			targetRect = null;
			return;
		}

		await tick();
		const el = document.querySelector(step.target) as HTMLElement | null;

		const vpWidth = window.innerWidth;
		const vpHeight = window.innerHeight;

		const ttWidth = Math.min(320, vpWidth - 32);
		const ttHeight = 180;

		if (!el) {
			targetRect = {
				top: Math.max(20, vpHeight / 2 - 80),
				left: Math.max(16, vpWidth / 2 - 140),
				width: 280,
				height: 60
			};
			tooltipPos = {
				top: Math.max(16, Math.min(vpHeight / 2 + 10, vpHeight - ttHeight - 20)),
				left: Math.max(16, Math.min(vpWidth / 2 - 160, vpWidth - ttWidth - 16))
			};
			return;
		}

		try {
			el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
		} catch {
			// Ignore scroll errors
		}

		const rect = el.getBoundingClientRect();
		const padding = 6;

		targetRect = {
			top: Math.max(4, rect.top - padding),
			left: Math.max(4, rect.left - padding),
			width: Math.min(rect.width + padding * 2, vpWidth - 8),
			height: Math.min(rect.height + padding * 2, vpHeight - 8)
		};

		const preferred = step.position || 'bottom';
		let tTop = 0;
		let tLeft = 0;

		if (preferred === 'bottom' && rect.bottom + ttHeight + 20 < vpHeight) {
			tTop = rect.bottom + 12;
			tLeft = Math.max(16, Math.min(rect.left + rect.width / 2 - ttWidth / 2, vpWidth - ttWidth - 16));
		} else if (preferred === 'top' && rect.top - ttHeight - 20 > 0) {
			tTop = rect.top - ttHeight - 12;
			tLeft = Math.max(16, Math.min(rect.left + rect.width / 2 - ttWidth / 2, vpWidth - ttWidth - 16));
		} else if (preferred === 'right' && rect.right + ttWidth + 20 < vpWidth) {
			tTop = Math.max(16, Math.min(rect.top, vpHeight - ttHeight - 16));
			tLeft = rect.right + 12;
		} else {
			// Fallback: place below target or clamp to viewport
			tTop = rect.bottom + 12;
			tLeft = Math.max(16, Math.min(rect.left, vpWidth - ttWidth - 16));
		}

		// Strict clamping so tooltip NEVER overflows the screen boundaries
		tTop = Math.max(12, Math.min(tTop, vpHeight - ttHeight - 16));
		tLeft = Math.max(12, Math.min(tLeft, vpWidth - ttWidth - 12));

		tooltipPos = { top: tTop, left: tLeft };
	}

	function next() {
		if (currentStep < steps.length - 1) {
			currentStep++;
			updatePosition();
		} else {
			close();
		}
	}

	function prev() {
		if (currentStep > 0) {
			currentStep--;
			updatePosition();
		}
	}

	function close() {
		active = false;
		currentStep = 0;
		targetRect = null;
		if (tourKey && typeof localStorage !== 'undefined') {
			localStorage.setItem(`tour-seen:${tourKey}`, 'true');
		}
		if (onclose) onclose();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!active) return;
		if (e.key === 'Escape') close();
		if (e.key === 'ArrowRight') next();
		if (e.key === 'ArrowLeft') prev();
	}

	let wasActive = false;
	$effect(() => {
		if (active && !wasActive) {
			currentStep = 0;
			updatePosition();
		} else if (!active) {
			targetRect = null;
		}
		wasActive = active;
	});

	onMount(() => {
		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

{#if active && step && targetRect}
	<!-- Backdrop overlay with spotlight viewport cutoff -->
	<div
		class="fixed inset-0 z-[9998] pointer-events-auto transition-opacity duration-300"
		style="
			background: radial-gradient(
				circle at {targetRect.left + targetRect.width / 2}px {targetRect.top + targetRect.height / 2}px,
				transparent {Math.max(targetRect.width, targetRect.height) / 1.6}px,
				rgba(15, 23, 42, 0.75) {Math.max(targetRect.width, targetRect.height) + 30}px
			);
		"
		onclick={close}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') close(); }}
		role="button"
		tabindex="-1"
		aria-label="Tutup panduan"
	></div>

	<!-- Spotlight highlight ring around target -->
	<div
		class="fixed z-[9999] pointer-events-none rounded-lg border-2 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all duration-300 ease-out"
		style="
			top: {targetRect.top}px;
			left: {targetRect.left}px;
			width: {targetRect.width}px;
			height: {targetRect.height}px;
		"
	></div>

	<!-- Compact Tooltip Box (Boundary Safe) -->
	<div
		class="fixed z-[10000] w-[90vw] max-w-[320px] max-h-[85vh] overflow-y-auto
		       bg-slate-900/95 text-white rounded-xl border border-sky-500/30
		       shadow-2xl p-4 transition-all duration-300 ease-out animate-in backdrop-blur-xl"
		style="
			top: {tooltipPos.top}px;
			left: {tooltipPos.left}px;
		"
		role="dialog"
		aria-modal="true"
		aria-labelledby="tour-title"
	>
		<!-- Step counter header -->
		<div class="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
			<div class="flex items-center gap-1.5">
				<span class="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-[11px] font-bold grid place-items-center border border-sky-400/40">
					💡
				</span>
				<span class="text-[11px] font-extrabold text-sky-400 uppercase tracking-wider">
					Panduan ({currentStep + 1}/{steps.length})
				</span>
			</div>
			<button
				type="button"
				onclick={close}
				class="text-slate-400 hover:text-white text-base font-bold w-5 h-5 rounded hover:bg-slate-800 grid place-items-center transition-colors"
				aria-label="Tutup"
			>
				×
			</button>
		</div>

		<!-- Step Content -->
		<h4 id="tour-title" class="font-extrabold text-sm text-white mb-1 tracking-tight">
			{step.title}
		</h4>
		<p class="text-xs text-slate-300 leading-normal mb-4">
			{step.content}
		</p>

		<!-- Footer navigation -->
		<div class="flex items-center justify-between pt-1">
			<button
				type="button"
				onclick={prev}
				disabled={currentStep === 0}
				class="px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
			>
				← Prev
			</button>

			<div class="flex items-center gap-1">
				{#each steps as _, i}
					<span
						class="w-1.5 h-1.5 rounded-full transition-all duration-300 {i === currentStep
							? 'w-4 bg-sky-400'
							: 'bg-slate-700'}"
					></span>
				{/each}
			</div>

			<button
				type="button"
				onclick={next}
				class="px-3 py-1 rounded-md text-[11px] font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 transition-all"
			>
				{currentStep === steps.length - 1 ? 'Selesai ✓' : 'Lanjut →'}
			</button>
		</div>
	</div>
{/if}

<style>
	.animate-in {
		animation: tourPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes tourPop {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(4px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
