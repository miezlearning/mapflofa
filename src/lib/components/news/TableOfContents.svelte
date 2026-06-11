<script lang="ts">
	import { onMount } from 'svelte';
	import type { TocItem } from '$lib/server/markdown';

	type Props = { items: TocItem[]; rootSelector?: string };
	let { items, rootSelector = '.post-content .md-content' }: Props = $props();

	let activeId = $state<string | null>(null);

	$effect.pre(() => {
		if (activeId === null && items.length > 0) activeId = items[0].id;
	});

	onMount(() => {
		const root = document.querySelector(rootSelector);
		if (!root) return;
		const headings = Array.from(root.querySelectorAll<HTMLElement>('h1, h2, h3, h4')).filter(
			(h) => h.id
		);
		if (headings.length === 0) return;

		const update = () => {
			const probe = window.innerHeight * 0.25;
			let current: HTMLElement | null = null;
			for (const h of headings) {
				const rect = h.getBoundingClientRect();
				if (rect.top <= probe) {
					current = h;
				} else {
					break;
				}
			}
			activeId = current?.id ?? headings[0]?.id ?? null;
		};

		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});

	function smoothJump(e: Event, id: string) {
		const target = document.getElementById(id);
		if (!target) return;
		e.preventDefault();
		const top = target.getBoundingClientRect().top + window.scrollY - 92;
		window.scrollTo({ top, behavior: 'smooth' });
		history.replaceState(history.state, '', `#${id}`);
		activeId = id;
	}

	// ---------- Rail meta computation ----------
	//
	// For each item, decide how to draw its left-hand "rail" — the line
	// graphic that visualizes the heading hierarchy as a tree.
	//
	// Approach: a stack-based pass over the headings tells us, for every
	// row, which ancestor levels are still in scope. Each scoped ancestor
	// gets a vertical line drawn through that row's rail. The current item
	// gets a dot at its own column, plus a curve from its nearest
	// ancestor's column into that dot.

	type RailMeta = {
		/** ancestorLines[p-1] = should we draw a vertical line at column p in this row? */
		ancestorLines: boolean[];
		/** Column to draw the branch curve from (0 = no curve, item is at root). */
		branchFromCol: number;
		/** Should the own-level vertical line continue below this item's dot? */
		extendBelow: boolean;
	};

	const meta = $derived.by((): RailMeta[] => {
		const stack: { level: number }[] = [];
		const ancestorsPerRow: Set<number>[] = [];

		for (let i = 0; i < items.length; i++) {
			const L = items[i].level;
			while (stack.length && stack[stack.length - 1].level >= L) stack.pop();
			ancestorsPerRow.push(new Set(stack.map((e) => e.level)));
			stack.push({ level: L });
		}

		return items.map((item, i) => {
			const aSet = ancestorsPerRow[i];
			const ancestorLines: boolean[] = [];
			for (let p = 1; p < item.level; p++) ancestorLines.push(aSet.has(p));

			// Branch source = nearest existing ancestor column.
			let branchFromCol = 0;
			for (let p = item.level - 1; p >= 1; p--) {
				if (ancestorLines[p - 1]) {
					branchFromCol = p;
					break;
				}
			}

			// Continue line below this dot if any sibling/child follows
			// before we move out of this scope.
			let extendBelow = false;
			for (let j = i + 1; j < items.length; j++) {
				if (items[j].level < item.level) break;
				extendBelow = true;
				break;
			}

			return { ancestorLines, branchFromCol, extendBelow };
		});
	});

	// ---------- SVG geometry ----------
	const COL_W = 16;
	const ITEM_H = 30;
	const CURVE_R = 6;
	const DOT_R = 3.5;
	const DOT_R_ACTIVE = 5;
	const DOT_R_L1 = 4.5;
	const DOT_R_L1_ACTIVE = 6;

	const maxLevel = $derived(items.length === 0 ? 1 : Math.max(...items.map((i) => i.level)));
	const railW = $derived((maxLevel + 1) * COL_W);

	function dotR(level: number, active: boolean) {
		if (level === 1) return active ? DOT_R_L1_ACTIVE : DOT_R_L1;
		return active ? DOT_R_ACTIVE : DOT_R;
	}
</script>

{#if items.length > 0}
	<nav class="toc" aria-label="Daftar isi">
		<div class="toc-label">Daftar isi</div>
		<ol class="toc-list">
			{#each items as item, i (item.id)}
				{@const m = meta[i]}
				{@const isActive = activeId === item.id}
				{@const r = dotR(item.level, isActive)}
				{@const cx = item.level * COL_W}
				{@const my = ITEM_H / 2}
				<li class:active={isActive}>
					<svg
						class="rail"
						viewBox="0 0 {railW} {ITEM_H}"
						width={railW}
						height={ITEM_H}
						aria-hidden="true"
					>
						<!-- Ancestor vertical lines: trunks for parents in scope -->
						{#each m.ancestorLines as drawLine, lvlIdx}
							{#if drawLine}
								<line
									x1={(lvlIdx + 1) * COL_W}
									x2={(lvlIdx + 1) * COL_W}
									y1="0"
									y2={ITEM_H}
									class="rail-line"
								/>
							{/if}
						{/each}

						<!-- Branch curve from nearest ancestor column to own dot -->
						{#if item.level > 1 && m.branchFromCol > 0}
							{@const bx = m.branchFromCol * COL_W}
							<path
								d={`M ${bx} 0 L ${bx} ${my - CURVE_R} Q ${bx} ${my}, ${bx + CURVE_R} ${my} L ${cx - r - 1} ${my}`}
								class="rail-line rail-branch"
								fill="none"
							/>
						{/if}

						<!-- Own-level line continuing below dot to next sibling/child -->
						{#if m.extendBelow}
							<line
								x1={cx}
								x2={cx}
								y1={my + r + 1}
								y2={ITEM_H}
								class="rail-line"
							/>
						{/if}

						<!-- Halo for the active dot -->
						{#if isActive}
							<circle cx={cx} cy={my} r={r + 4} class="rail-halo" fill="none" />
						{/if}

						<!-- Dot -->
						<circle cx={cx} cy={my} r={r} class="rail-dot lvl-{item.level}" class:active={isActive} />
					</svg>
					<a href={`#${item.id}`} onclick={(e) => smoothJump(e, item.id)} class="lvl-{item.level}">
						{item.text}
					</a>
				</li>
			{/each}
		</ol>
	</nav>
{/if}

<style>
	.toc {
		font-size: 0.8125rem;
		line-height: 1.4;
	}

	.toc-label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #64748b;
		margin-bottom: 0.625rem;
	}

	.toc-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.toc-list li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		min-height: 30px;
		padding: 0;
	}

	.toc-list svg.rail {
		flex: none;
		display: block;
	}

	/* ----- Rail strokes / fills (light theme) ----- */
	.rail-line {
		stroke: rgba(100, 116, 139, 0.35);
		stroke-width: 1.5;
		stroke-linecap: round;
	}

	.rail-dot {
		fill: rgba(100, 116, 139, 0.55);
		transition: fill 150ms ease, r 150ms ease;
	}

	/* Slight tonal shift per level so the eye can distinguish them. */
	.rail-dot.lvl-1 { fill: rgba(11, 46, 79, 0.85); }   /* navy primary */
	.rail-dot.lvl-2 { fill: rgba(100, 116, 139, 0.65); }
	.rail-dot.lvl-3 { fill: rgba(148, 163, 184, 0.6); }
	.rail-dot.lvl-4 { fill: rgba(148, 163, 184, 0.5); }

	.rail-dot.active {
		fill: #e11d48;
	}

	.rail-halo {
		stroke: #e11d48;
		stroke-width: 1.5;
		opacity: 0.35;
	}

	/* When the row is active, brighten its rail line + branch curve too. */
	.toc-list li.active .rail-branch {
		stroke: #e11d48;
		opacity: 0.55;
	}

	/* ----- Link styling per level ----- */
	.toc-list a {
		flex: 1;
		min-width: 0;
		padding: 0.25rem 0.25rem 0.25rem 0;
		color: #64748b;
		text-decoration: none;
		font-weight: 500;
		line-height: 1.35;
		transition: color 150ms ease;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Heading visual hierarchy: H1 = strongest, H4 = lightest. */
	.toc-list a.lvl-1 {
		color: #0b2e4f;
		font-weight: 700;
		font-size: 0.875rem;
	}
	.toc-list a.lvl-2 {
		color: #475569;
		font-weight: 600;
	}
	.toc-list a.lvl-3 {
		color: #64748b;
	}
	.toc-list a.lvl-4 {
		color: #94a3b8;
		font-size: 0.78125rem;
	}

	.toc-list a:hover {
		color: #0b2e4f;
	}

	.toc-list li.active a {
		color: #0b2e4f;
		font-weight: 700;
	}

	.toc-list li.active a.lvl-1 { color: #0b2e4f; }
	.toc-list li.active a.lvl-2,
	.toc-list li.active a.lvl-3,
	.toc-list li.active a.lvl-4 {
		color: #0b2e4f;
	}

	/* ----- Dark theme overrides ----- */
	:global([data-theme='dark']) .toc-label { color: #94a3b8; }

	:global([data-theme='dark']) .rail-line {
		stroke: rgba(148, 163, 184, 0.28);
	}
	:global([data-theme='dark']) .rail-dot           { fill: rgba(148, 163, 184, 0.5); }
	:global([data-theme='dark']) .rail-dot.lvl-1     { fill: #38bdf8; }
	:global([data-theme='dark']) .rail-dot.lvl-2     { fill: rgba(148, 163, 184, 0.65); }
	:global([data-theme='dark']) .rail-dot.lvl-3     { fill: rgba(148, 163, 184, 0.5); }
	:global([data-theme='dark']) .rail-dot.lvl-4     { fill: rgba(148, 163, 184, 0.4); }

	:global([data-theme='dark']) .rail-dot.active {
		fill: #fb7185;
	}
	:global([data-theme='dark']) .rail-halo {
		stroke: #fb7185;
	}
	:global([data-theme='dark']) .toc-list li.active .rail-branch {
		stroke: #fb7185;
	}

	:global([data-theme='dark']) .toc-list a            { color: #94a3b8; }
	:global([data-theme='dark']) .toc-list a.lvl-1      { color: #f8fafc; }
	:global([data-theme='dark']) .toc-list a.lvl-2      { color: #cbd5e1; }
	:global([data-theme='dark']) .toc-list a.lvl-3      { color: #94a3b8; }
	:global([data-theme='dark']) .toc-list a.lvl-4      { color: #64748b; }

	:global([data-theme='dark']) .toc-list a:hover      { color: #f1f5f9; }
	:global([data-theme='dark']) .toc-list li.active a  { color: #f8fafc; }
</style>
