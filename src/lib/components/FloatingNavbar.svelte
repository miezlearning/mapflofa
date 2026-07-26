<script lang="ts">
	import { onMount, tick } from "svelte";
	import { page } from "$app/state";

	interface NavItem {
		label: string;
		href: string;
	}
	interface Props {
		items?: NavItem[];
		brand?: string;
	}

	let {
		items = [
			{ label: "Beranda", href: "/" },
			{ label: "Profil", href: "/profil" },
			{ label: "Berita", href: "/berita" },
			{ label: "Galeri", href: "/galeri" },
		],
		brand = "MAPFLOFA",
	}: Props = $props();

	const onHome = $derived(page.url.pathname === "/");
	function resolveHref(href: string): string {
		if (!href.startsWith("#")) return href;
		return onHome ? href : "/" + href;
	}

	const ctaHref = $derived(resolveHref("#kontak"));
	const brandHref = $derived(onHome ? "#beranda" : "/");
	const currentPath = $derived(page.url.pathname);

	function isActive(href: string): boolean {
		if (href === "/") return currentPath === "/";
		if (href.startsWith("#")) return onHome;
		return currentPath.startsWith(href);
	}

	let listEl: HTMLUListElement | null = $state(null);
	let itemEls: HTMLAnchorElement[] = $state([]);

	// Magic Pill state
	let pill = $state({ x: 0, w: 0, h: 0, visible: false, instant: false });
	let reducedMotion = $state(false);
	let mobileMenuOpen = $state(false);

	onMount(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		reducedMotion = mq.matches;
		const onChange = (e: MediaQueryListEvent) => (reducedMotion = e.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	});

	async function moveTo(i: number) {
		if (!listEl || !itemEls[i]) return;
		await tick();
		const list = listEl.getBoundingClientRect();
		const it = itemEls[i].getBoundingClientRect();
		const wasHidden = !pill.visible;
		pill = {
			x: it.left - list.left,
			w: it.width,
			h: it.height,
			visible: true,
			instant: wasHidden,
		};
	}

	function leave() {
		pill = { ...pill, visible: false, instant: false };
	}

	const transition = $derived(
		reducedMotion || pill.instant
			? "opacity 0.15s ease-out"
			: "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), width 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease-out",
	);
</script>

<nav
	class="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50
	       w-[min(96vw,960px)]"
	aria-label="Navigasi utama"
>
	<div
		class="relative flex items-center justify-between gap-3
		       rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
		       border border-slate-200 dark:border-slate-800
		       pl-5 pr-2 py-2
		       shadow-xl shadow-slate-900/10 dark:shadow-slate-950/60"
	>
		<!-- Brand -->
		<a href={brandHref} class="flex items-center gap-2.5 shrink-0 group">
			<span class="w-8 h-8 rounded-xl overflow-hidden shrink-0 transition-transform duration-200 group-hover:scale-105">
				<img src="/logo.png" alt="MAPFLOFA" class="w-full h-full object-contain" />
			</span>
			<span
				class="hidden sm:block font-extrabold text-primary tracking-tight text-sm md:text-base"
			>
				{brand}
			</span>
		</a>

		<!-- Desktop nav list -->
		<ul
			bind:this={listEl}
			onmouseleave={leave}
			onfocusout={(e) => {
				if (!listEl?.contains(e.relatedTarget as Node)) leave();
			}}
			class="relative hidden md:flex items-center gap-1"
		>
			<!-- High Contrast Smooth Magic Pill -->
			<li
				aria-hidden="true"
				class="absolute top-0 left-0 pointer-events-none rounded-full
				       bg-sky-100/90 dark:bg-sky-950/90
				       border border-sky-300/80 dark:border-sky-700/80
				       shadow-sm shadow-sky-500/10 will-change-transform"
				style="
					transform: translate3d({pill.x}px, 0, 0);
					width: {pill.w}px;
					height: {pill.h}px;
					opacity: {pill.visible ? 1 : 0};
					transition: {transition};
				"
			></li>

			{#each items as item, i (item.href)}
				{@const active = isActive(item.href)}
				<li>
					<a
						bind:this={itemEls[i]}
						href={resolveHref(item.href)}
						onmouseenter={() => moveTo(i)}
						onfocus={() => moveTo(i)}
						class="relative z-10 inline-flex items-center gap-1.5
						       px-4 py-2 rounded-full
						       text-sm font-bold transition-colors duration-150
						       {active
						         ? 'text-primary dark:text-sky-300'
						         : 'text-slate-700 dark:text-slate-200 hover:text-sky-900 dark:hover:text-sky-100'}
						       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>

		<div class="flex items-center gap-2">
			<!-- CTA -->
			<a
				href={ctaHref}
				class="inline-flex items-center gap-2 shrink-0
				       bg-accent hover:bg-accent-600 text-white
				       text-xs md:text-sm font-bold
				       px-4 md:px-5 py-2.5 rounded-full
				       transition-all duration-200
				       shadow-md shadow-accent/20
				       hover:shadow-lg hover:shadow-accent/30 hover:scale-105 active:scale-95"
			>
				Gabung
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
				>
					<path d="M5 12h14M13 5l7 7-7 7" />
				</svg>
			</a>

			<!-- Mobile hamburger toggle -->
			<button
				type="button"
				class="md:hidden inline-flex items-center justify-center
				       w-10 h-10 rounded-full
				       text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800
				       transition-colors duration-200
				       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
				aria-expanded={mobileMenuOpen}
			>
				{#if mobileMenuOpen}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
						<path d="M18 6L6 18M6 6l12 12"/>
					</svg>
				{:else}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
						<path d="M4 6h16M4 12h16M4 18h16"/>
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile dropdown menu -->
	{#if mobileMenuOpen}
		<div
			class="md:hidden mt-2 mx-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
			       border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10
			       p-4 animate-in"
		>
			<ul class="flex flex-col gap-1">
				{#each items as item (item.href)}
					{@const active = isActive(item.href)}
					<li>
						<a
							href={resolveHref(item.href)}
							onclick={() => (mobileMenuOpen = false)}
							class="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold
							       {active
							         ? 'bg-sky-50 dark:bg-sky-950/50 text-primary dark:text-sky-300'
							         : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-primary'}
							       transition-colors duration-150"
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</nav>

<style>
	.animate-in {
		animation: menuSlideIn 200ms ease-out;
	}

	@keyframes menuSlideIn {
		from { opacity: 0; transform: translateY(-8px); }
		to   { opacity: 1; transform: translateY(0); }
	}
</style>
