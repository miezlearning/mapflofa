<script lang="ts">
	import type { PageData } from './$types';
	import TrendChart from '$lib/components/admin/TrendChart.svelte';

	let { data }: { data: PageData } = $props();
	const summary = $derived(data.analytics.summary);

	const tiles = $derived([
		{ label: 'Programs', count: data.stats.programs, href: '/admin/programs', icon: 'programs' },
		{ label: 'News', count: data.stats.news, href: '/admin/news', icon: 'news' },
		{ label: 'Galeri', count: data.stats.gallery, href: '/admin/gallery', icon: 'gallery' },
		{ label: 'Events', count: data.stats.events, href: '/admin/events', icon: 'events' }
	]);
</script>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Overview</h1>
		<p class="adm-sub">Konten yang dipublikasikan dan kunjungan website 30 hari terakhir.</p>
	</div>
	<a class="adm-btn" href="/docs" target="_blank" rel="noopener">
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 2.5h-2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1v-2" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><path d="M8 2.5h3.5V6M7 7l4.5-4.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>
		API Docs
	</a>
</div>

<!-- Content tiles -->
<div class="grid">
	{#each tiles as t (t.label)}
		<a href={t.href} class="tile">
			<div class="tile-icon">
				{#if t.icon === 'programs'}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 6h14M3 10h9M3 14h11" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
				{:else if t.icon === 'news'}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3.5" width="14" height="13" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M6 8h8M6 11h6M6 14h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
				{:else if t.icon === 'gallery'}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="8.5" r="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M3 13.5l4-3.5 3.5 3 3-2.5L17 13.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
				{:else if t.icon === 'events'}
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M3 8.5h14" stroke="currentColor" stroke-width="1.5"/><path d="M7 2.5v3M13 2.5v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
				{/if}
			</div>
			<div class="tile-count">{t.count}</div>
			<div class="tile-label">{t.label}</div>
		</a>
	{/each}
</div>

<!-- Analytics summary stats -->
<h2 class="section-h">Traffic</h2>
<div class="stat-grid">
	<div class="stat-card">
		<div class="stat-label">Hari ini</div>
		<div class="stat-value">{summary.viewsToday.toLocaleString('id')}</div>
		<div class="stat-meta">Page views</div>
	</div>
	<div class="stat-card">
		<div class="stat-label">7 hari</div>
		<div class="stat-value">{summary.views7.toLocaleString('id')}</div>
		<div class="stat-meta">{summary.uniques7.toLocaleString('id')} unique visitors</div>
	</div>
	<div class="stat-card">
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
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.875rem;
		margin-bottom: 2rem;
	}

	.tile {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 1.25rem;
		border-radius: 0.875rem;
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		text-decoration: none;
		color: inherit;
		transition: border-color 150ms ease, box-shadow 150ms ease;
		box-shadow: 0 1px 3px rgba(0,0,0,0.04);
	}

	.tile:hover {
		border-color: var(--color-primary, #6eaee8);
		box-shadow: 0 4px 12px rgba(110, 174, 232, 0.12);
	}

	.tile-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.5rem;
		background: var(--color-surface-2, #e8f4fd);
		color: var(--color-primary, #6eaee8);
	}

	.tile-count {
		font-size: 2rem;
		font-weight: 800;
		color: var(--color-ink, #333);
		line-height: 1;
		font-feature-settings: 'tnum';
	}

	.tile-label {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.section-h {
		margin: 1.5rem 0 0.75rem;
		font-size: 0.8125rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-muted, #6b7b8c);
		font-weight: 700;
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.875rem;
		margin-bottom: 1rem;
	}

	.stat-card {
		padding: 1.125rem;
		border-radius: 0.875rem;
		background: #fff;
		border: 1px solid var(--color-line, #e3eef7);
		box-shadow: 0 1px 3px rgba(0,0,0,0.04);
	}

	.stat-label {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.stat-value {
		color: var(--color-ink, #333);
		font-size: 1.75rem;
		font-weight: 800;
		font-feature-settings: 'tnum';
		margin-top: 0.25rem;
	}

	.stat-meta {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.75rem;
		margin-top: 0.125rem;
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
		color: var(--color-ink, #333);
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.dim {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.75rem;
	}

	.lists {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: 0.875rem;
	}

	.empty {
		color: var(--color-muted, #6b7b8c);
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
		gap: 0.5rem;
		counter-reset: list;
	}

	.rank li {
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		background: var(--color-surface-3, #f0f8ff);
		border: 1px solid var(--color-line, #e3eef7);
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
		color: var(--color-primary, #6eaee8);
	}

	.rank-title {
		color: var(--color-ink, #333);
		font-weight: 600;
		font-size: 0.875rem;
		text-decoration: none;
		display: block;
	}

	.rank-title:hover {
		color: var(--color-primary, #6eaee8);
	}

	.rank-meta {
		display: flex;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: var(--color-muted, #6b7b8c);
		margin-top: 0.125rem;
	}

	.sep {
		color: var(--color-line, #e3eef7);
	}

	.path {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
		color: var(--color-ink, #333);
		background: var(--color-surface-3, #f0f8ff);
		padding: 0.0625rem 0.375rem;
		border-radius: 0.25rem;
	}
</style>
