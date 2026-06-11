<script lang="ts">
	import type { PageData } from './$types';
	import TrendChart from '$lib/components/admin/TrendChart.svelte';

	let { data }: { data: PageData } = $props();
	const summary = $derived(data.analytics.summary);

	const tiles = $derived([
		{ label: 'Programs', count: data.stats.programs, href: '/admin/programs', color: 'cyan' },
		{ label: 'News', count: data.stats.news, href: '/admin/news', color: 'violet' },
		{ label: 'Events', count: data.stats.events, href: '/admin/events', color: 'amber' }
	]);
</script>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Overview</h1>
		<p class="adm-sub">Konten yang dipublikasikan dan kunjungan website 30 hari terakhir.</p>
	</div>
	<a class="adm-btn" href="/docs" target="_blank" rel="noopener">↗ API Docs</a>
</div>

<!-- Content tiles -->
<div class="grid">
	{#each tiles as t (t.label)}
		<a href={t.href} class={`tile ${t.color}`}>
			<div class="label">{t.label}</div>
			<div class="count">{t.count}</div>
			<div class="cta">Kelola →</div>
		</a>
	{/each}
</div>

<!-- Analytics summary stats -->
<h2 class="section-h">Traffic</h2>
<div class="stat-grid">
	<div class="stat">
		<div class="stat-label">Hari ini</div>
		<div class="stat-value">{summary.viewsToday.toLocaleString('id')}</div>
		<div class="stat-meta">Page views</div>
	</div>
	<div class="stat">
		<div class="stat-label">7 hari</div>
		<div class="stat-value">{summary.views7.toLocaleString('id')}</div>
		<div class="stat-meta">{summary.uniques7.toLocaleString('id')} unique visitors</div>
	</div>
	<div class="stat">
		<div class="stat-label">30 hari</div>
		<div class="stat-value">{summary.views30.toLocaleString('id')}</div>
		<div class="stat-meta">{summary.uniques30.toLocaleString('id')} unique visitors</div>
	</div>
</div>

<!-- Trend chart -->
<div class="adm-card chart-card">
	<div class="card-h">
		<h3>Daily views</h3>
		<span class="dim">30 hari terakhir</span>
	</div>
	<TrendChart data={data.analytics.daily30} height={200} />
</div>

<!-- Top posts -->
<div class="lists">
	<div class="adm-card">
		<div class="card-h">
			<h3>Top news</h3>
			<span class="dim">30 hari · by views</span>
		</div>
		{#if data.analytics.topPosts.length === 0}
			<div class="empty">Belum ada kunjungan ke detail berita.</div>
		{:else}
			<ol class="rank">
				{#each data.analytics.topPosts as p (p.slug)}
					<li>
						<a href={`/berita/${p.slug}`} target="_blank" rel="noopener" class="rank-title">
							{p.title}
						</a>
						<div class="rank-meta">
							<span>{p.views.toLocaleString('id')} views</span>
							<span class="sep">·</span>
							<span>{p.uniques.toLocaleString('id')} unique</span>
						</div>
					</li>
				{/each}
			</ol>
		{/if}
	</div>

	<div class="adm-card">
		<div class="card-h">
			<h3>Top pages</h3>
			<span class="dim">30 hari · semua URL publik</span>
		</div>
		{#if data.analytics.topAll.length === 0}
			<div class="empty">Belum ada page view tercatat.</div>
		{:else}
			<table class="adm-table" style="font-size:0.8125rem">
				<thead>
					<tr><th>Path</th><th style="text-align:right">Views</th><th style="text-align:right">Unique</th></tr>
				</thead>
				<tbody>
					{#each data.analytics.topAll as r}
						<tr>
							<td><code class="path">{r.path}</code></td>
							<td style="text-align:right">{r.views.toLocaleString('id')}</td>
							<td style="text-align:right">{r.uniques.toLocaleString('id')}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.tile {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 1.5rem;
		border-radius: 1rem;
		background: linear-gradient(180deg, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.35));
		border: 1px solid rgba(148, 163, 184, 0.12);
		text-decoration: none;
		color: inherit;
		transition: all 150ms ease;
		position: relative;
		overflow: hidden;
	}
	.tile:hover {
		transform: translateY(-2px);
		border-color: rgba(56, 189, 248, 0.4);
	}
	.tile::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(400px 200px at 100% 0%, var(--glow), transparent 60%);
		opacity: 0.5;
		pointer-events: none;
	}
	.tile.cyan {
		--glow: rgba(56, 189, 248, 0.18);
	}
	.tile.violet {
		--glow: rgba(139, 92, 246, 0.18);
	}
	.tile.amber {
		--glow: rgba(248, 113, 113, 0.2);
	}
	.label {
		color: #94a3b8;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.count {
		color: #f8fafc;
		font-size: 2.5rem;
		font-weight: 800;
		line-height: 1;
		font-feature-settings: 'tnum';
	}
	.cta {
		color: #38bdf8;
		font-size: 0.8125rem;
		font-weight: 600;
		margin-top: 0.5rem;
	}

	.section-h {
		margin: 2rem 0 0.875rem;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #94a3b8;
		font-weight: 700;
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.stat {
		padding: 1.25rem;
		border-radius: 1rem;
		background: linear-gradient(180deg, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.35));
		border: 1px solid rgba(148, 163, 184, 0.12);
	}
	.stat-label {
		color: #94a3b8;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.stat-value {
		color: #f8fafc;
		font-size: 1.875rem;
		font-weight: 800;
		font-feature-settings: 'tnum';
		margin-top: 0.25rem;
	}
	.stat-meta {
		color: #64748b;
		font-size: 0.75rem;
		margin-top: 0.25rem;
	}

	.chart-card {
		margin-bottom: 1rem;
	}

	.card-h {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.card-h h3 {
		margin: 0;
		color: #f1f5f9;
		font-size: 0.95rem;
		font-weight: 700;
	}

	.dim {
		color: #64748b;
		font-size: 0.75rem;
	}

	.lists {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
		gap: 1rem;
	}

	.empty {
		color: #64748b;
		font-size: 0.875rem;
		font-style: italic;
		padding: 0.75rem 0;
	}

	.rank {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.rank li {
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		background: rgba(15, 23, 42, 0.4);
		border: 1px solid rgba(148, 163, 184, 0.08);
		counter-increment: list;
		position: relative;
		padding-left: 2rem;
	}

	.rank li::before {
		content: counter(list);
		position: absolute;
		left: 0.625rem;
		top: 0.625rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.6875rem;
		font-weight: 800;
		color: #38bdf8;
	}

	.rank {
		counter-reset: list;
	}

	.rank-title {
		color: #f1f5f9;
		font-weight: 600;
		font-size: 0.875rem;
		text-decoration: none;
		display: block;
	}

	.rank-title:hover {
		color: #38bdf8;
	}

	.rank-meta {
		display: flex;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: #94a3b8;
		margin-top: 0.125rem;
	}

	.sep {
		color: #475569;
	}

	.path {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
		color: #cbd5e1;
		background: rgba(148, 163, 184, 0.08);
		padding: 0.0625rem 0.375rem;
		border-radius: 0.25rem;
	}
</style>
