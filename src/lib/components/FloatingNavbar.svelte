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
			{ label: "Kontak", href: "/#kontak" },
		],
		brand = "MAPFLOFA",
	}: Props = $props();

	/**
	 * Hash-only links (`#tentang`) only work as in-page anchors when we're
	 * actually on the homepage. On any other route they would resolve
	 * against the current URL — clicking "Beranda" from `/berita/abc`
	 * would land at `/berita/abc#beranda`, which is wrong.
	 *
	 * Rewrite hash hrefs to absolute `/` + hash whenever we're not on the
	 * homepage; SvelteKit will navigate home and then scroll to the anchor.
	 */
	const onHome = $derived(page.url.pathname === "/");
	function resolveHref(href: string): string {
		if (!href.startsWith("#")) return href;
		return onHome ? href : "/" + href;
	}

	const ctaHref = $derived(resolveHref("#kontak"));
	const brandHref = $derived(onHome ? "#beranda" : "/");

	let listEl: HTMLUListElement | null = $state(null);
	let itemEls: HTMLAnchorElement[] = $state([]);

	// Magic Pill state
	// `instant` snaps without sliding (used the very first appearance so the pill
	// doesn't grow from the corner). After that it slides smoothly.
	let pill = $state({ x: 0, w: 0, h: 0, visible: false, instant: false });
	let reducedMotion = $state(false);

	onMount(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		reducedMotion = mq.matches;
		const onChange = (e: MediaQueryListEvent) =>
			(reducedMotion = e.matches);
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
			? "opacity 0.18s linear"
			: "transform 0.42s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.42s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease-out",
	);
</script>

<nav
	class="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50
	       w-[min(96vw,960px)]"
	aria-label="Navigasi utama"
>
	<div
		class="flex items-center justify-between gap-3
		       rounded-full bg-white/85 backdrop-blur-lg
		       border border-slate-200
		       pl-5 pr-2 py-2
		       shadow-xl shadow-slate-300/40"
	>
		<!-- Brand -->
		<a href={brandHref} class="flex items-center gap-2.5 shrink-0 group">
			<span
				class="w-8 h-8 rounded-xl bg-primary text-white grid place-items-center
				       transition-transform duration-300 group-hover:rotate-6"
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M12 4c-1.2 0-2.2.6-2.8 1.6-.8-.4-1.8-.4-2.6.2-1 .8-1.4 2-1.2 3.2.8-.6 1.8-.8 2.6-.4-.6.6-.8 1.4-.6 2.2.6-.4 1.4-.6 2-.2l-.4 1c.6-.2 1.4-.2 2 .2.2-.8.2-1.6-.2-2.2.8.2 1.6 0 2.2-.6-.4-.8-1.2-1.2-2-1.2.6-.6 1-1.4 1-2.2.4.6 1.2 1 2 1 1.2 0 2.2-.8 2.6-1.8-1 .2-1.8 0-2.4-.6.8-.4 1.4-1.2 1.4-2.2-.8.4-1.6.4-2.2 0C13.8 4.6 13 4 12 4z"/>
				</svg>
			</span>
			<span
				class="hidden sm:block font-bold text-primary tracking-tight text-sm md:text-base"
			>
				{brand}
			</span>
		</a>

		<!-- Nav list -->
		<ul
			bind:this={listEl}
			onmouseleave={leave}
			onfocusout={(e) => {
				if (!listEl?.contains(e.relatedTarget as Node)) leave();
			}}
			class="relative hidden md:flex items-center"
		>
			<!-- Magic Pill -->
			<li
				aria-hidden="true"
				class="absolute top-0 left-0 pointer-events-none rounded-full
				       bg-slate-100 will-change-transform"
				style="
					transform: translate3d({pill.x}px, 0, 0);
					width: {pill.w}px;
					height: {pill.h}px;
					opacity: {pill.visible ? 1 : 0};
					transition: {transition};
				"
			></li>

			{#each items as item, i (item.href)}
				<li>
					<a
						bind:this={itemEls[i]}
						href={resolveHref(item.href)}
						onmouseenter={() => moveTo(i)}
						onfocus={() => moveTo(i)}
						class="relative z-10 inline-flex items-center
						       px-4 py-2 rounded-full
						       text-sm font-semibold text-slate-700
						       transition-colors duration-200 hover:text-primary
						       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>

		<!-- CTA -->
		<a
			href={ctaHref}
			class="inline-flex items-center gap-2 shrink-0
			       bg-accent hover:bg-accent-600 text-white
			       text-xs md:text-sm font-semibold
			       px-4 md:px-5 py-2.5 rounded-full
			       transition-all duration-300
			       shadow-lg shadow-accent/20
			       hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
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
	</div>
</nav>
