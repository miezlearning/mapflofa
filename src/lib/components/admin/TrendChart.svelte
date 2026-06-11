<script lang="ts">
	type Point = { date: string; views: number; uniques: number };
	type Props = { data: Point[]; height?: number };
	let { data, height = 180 }: Props = $props();

	const W = 600;
	const H = $derived(height);
	const PAD = { top: 16, right: 8, bottom: 24, left: 32 };

	const max = $derived(Math.max(1, ...data.map((d) => d.views)));
	const xStep = $derived(data.length > 1 ? (W - PAD.left - PAD.right) / (data.length - 1) : 0);

	function x(i: number) {
		return PAD.left + i * xStep;
	}
	function y(v: number) {
		const innerH = H - PAD.top - PAD.bottom;
		return PAD.top + innerH - (v / max) * innerH;
	}

	const linePath = $derived.by(() => {
		if (data.length === 0) return '';
		return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.views)}`).join(' ');
	});

	const areaPath = $derived.by(() => {
		if (data.length === 0) return '';
		const top = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.views)}`).join(' ');
		const lastX = x(data.length - 1);
		const baseY = H - PAD.bottom;
		return `${top} L ${lastX} ${baseY} L ${PAD.left} ${baseY} Z`;
	});

	const uniquePath = $derived.by(() => {
		if (data.length === 0) return '';
		return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.uniques)}`).join(' ');
	});

	function tickLabel(d: string) {
		const date = new Date(d + 'T00:00:00Z');
		return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
	}

	// Y-axis ticks
	const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(max * p));
</script>

<div class="chart-wrap">
	<svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" class="chart" role="img"
		aria-label="Daily views chart">
		<defs>
			<linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="rgba(56,189,248,0.35)" />
				<stop offset="100%" stop-color="rgba(56,189,248,0)" />
			</linearGradient>
		</defs>

		<!-- Y grid + labels -->
		{#each yTicks as t, i}
			<line
				x1={PAD.left}
				x2={W - PAD.right}
				y1={y(t)}
				y2={y(t)}
				stroke="rgba(148,163,184,0.12)"
				stroke-width="1"
			/>
			<text
				x={PAD.left - 6}
				y={y(t) + 3}
				text-anchor="end"
				fill="#64748b"
				font-size="9"
				font-family="ui-monospace, monospace"
			>
				{t}
			</text>
		{/each}

		<!-- X labels — show first, mid, last -->
		{#if data.length > 0}
			{@const idxs = [0, Math.floor(data.length / 2), data.length - 1]}
			{#each idxs as i}
				<text
					x={x(i)}
					y={H - 8}
					text-anchor="middle"
					fill="#64748b"
					font-size="9"
					font-family="ui-monospace, monospace"
				>
					{tickLabel(data[i].date)}
				</text>
			{/each}
		{/if}

		<!-- Area fill -->
		<path d={areaPath} fill="url(#area-grad)" />

		<!-- Views line -->
		<path d={linePath} stroke="#38bdf8" stroke-width="1.75" fill="none" />

		<!-- Uniques line -->
		<path d={uniquePath} stroke="#c084fc" stroke-width="1.5" fill="none" stroke-dasharray="4 3" />

		<!-- Hover hit areas + dots -->
		{#each data as d, i}
			<g>
				<title>{d.date}: {d.views} views, {d.uniques} unique</title>
				<circle cx={x(i)} cy={y(d.views)} r="2" fill="#38bdf8" />
				<rect
					x={x(i) - xStep / 2}
					y={PAD.top}
					width={Math.max(2, xStep)}
					height={H - PAD.top - PAD.bottom}
					fill="transparent"
				/>
			</g>
		{/each}
	</svg>

	<div class="legend">
		<span class="leg views">Views</span>
		<span class="leg uniques">Uniques</span>
	</div>
</div>

<style>
	.chart-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.chart {
		width: 100%;
		height: auto;
	}
	.legend {
		display: flex;
		gap: 0.875rem;
		font-size: 0.75rem;
		color: #94a3b8;
	}
	.leg {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}
	.leg::before {
		content: '';
		display: inline-block;
		width: 0.875rem;
		height: 0.125rem;
		border-radius: 0.0625rem;
	}
	.leg.views::before {
		background: #38bdf8;
	}
	.leg.uniques::before {
		background: #c084fc;
		border-top: 1px dashed #c084fc;
	}
</style>
