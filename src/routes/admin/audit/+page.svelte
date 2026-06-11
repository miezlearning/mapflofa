<script lang="ts">
	import type { PageData } from './$types';
	import { page as pageStore } from '$app/state';

	let { data }: { data: PageData } = $props();
	const items = $derived(data.items);
	const filters = $derived(data.filters);
	const options = $derived(data.options);
	const pagination = $derived(data.pagination);

	function urlWith(patch: Record<string, string | number | null>): string {
		const u = new URL(pageStore.url);
		for (const [k, v] of Object.entries(patch)) {
			if (v === null || v === '') u.searchParams.delete(k);
			else u.searchParams.set(k, String(v));
		}
		return u.pathname + (u.search ? u.search : '');
	}

	function fmt(date: string) {
		return new Date(date).toLocaleString();
	}

	function actionPillClass(action: string) {
		if (action.startsWith('login.success') || action === 'logout') return 'pill ok';
		if (action.startsWith('login.failure')) return 'pill warn';
		if (action.startsWith('password.') || action.startsWith('session.')) return 'pill info';
		if (action.startsWith('user.delete') || action.endsWith('.delete') || action.endsWith('.deactivate'))
			return 'pill danger';
		if (action.endsWith('.create')) return 'pill ok';
		if (action.endsWith('.update') || action.endsWith('.activate')) return 'pill info';
		return 'pill';
	}
</script>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Audit Log</h1>
		<p class="adm-sub">{pagination.total} entri tercatat. Append-only.</p>
	</div>
</div>

<form class="adm-card filters" method="GET">
	<label>
		<span class="lbl">User</span>
		<select name="user" value={filters.user}>
			<option value="">Semua</option>
			{#each options.users as u}<option value={u}>{u}</option>{/each}
		</select>
	</label>
	<label>
		<span class="lbl">Resource</span>
		<select name="resource" value={filters.resource}>
			<option value="">Semua</option>
			{#each options.resources as r}<option value={r}>{r}</option>{/each}
		</select>
	</label>
	<label>
		<span class="lbl">Action</span>
		<select name="action" value={filters.action}>
			<option value="">Semua</option>
			{#each options.actions as a}<option value={a}>{a}</option>{/each}
		</select>
	</label>
	<div class="actions">
		<button type="submit" class="adm-btn adm-btn-primary">Filter</button>
		<a href="/admin/audit" class="adm-btn">Reset</a>
	</div>
</form>

{#if items.length === 0}
	<div class="adm-empty">Belum ada entri yang cocok dengan filter.</div>
{:else}
	<div class="adm-card" style="padding:0;overflow:hidden">
		<table class="adm-table">
			<thead>
				<tr>
					<th style="width:11.5rem">When</th>
					<th>Actor</th>
					<th>Action</th>
					<th>Resource</th>
					<th>Details</th>
				</tr>
			</thead>
			<tbody>
				{#each items as e (e.id)}
					<tr>
						<td><span class="dim">{fmt(e.createdAt)}</span></td>
						<td>
							<div class="actor">
								<span class="actor-email">{e.userEmail}</span>
								<span class="role-chip">{e.userRole}</span>
							</div>
							{#if e.ip}<div class="ip">{e.ip}</div>{/if}
						</td>
						<td><span class={actionPillClass(e.action)}>{e.action}</span></td>
						<td>
							<code class="res">{e.resource}{e.resourceId !== null ? `#${e.resourceId}` : ''}</code>
						</td>
						<td>
							{#if e.details}
								<details>
									<summary>view</summary>
									<pre class="details-pre">{JSON.stringify(e.details, null, 2)}</pre>
								</details>
							{:else}
								<span class="dim">—</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pagination.pages > 1}
		<div class="pager">
			<a
				class="adm-btn"
				href={urlWith({ page: Math.max(1, pagination.page - 1) })}
				aria-disabled={pagination.page === 1}
				style:pointer-events={pagination.page === 1 ? 'none' : 'auto'}
				style:opacity={pagination.page === 1 ? 0.5 : 1}
			>
				← Prev
			</a>
			<span class="page-info">
				Page <strong>{pagination.page}</strong> of {pagination.pages}
			</span>
			<a
				class="adm-btn"
				href={urlWith({ page: Math.min(pagination.pages, pagination.page + 1) })}
				aria-disabled={pagination.page === pagination.pages}
				style:pointer-events={pagination.page === pagination.pages ? 'none' : 'auto'}
				style:opacity={pagination.page === pagination.pages ? 0.5 : 1}
			>
				Next →
			</a>
		</div>
	{/if}
{/if}

<style>
	.filters {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		align-items: flex-end;
		margin-bottom: 1.25rem;
	}

	.filters label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 12rem;
		flex: 1;
	}

	.filters .lbl {
		color: #94a3b8;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.filters select {
		padding: 0.5rem 0.625rem;
		border-radius: 0.5rem;
		background: rgba(2, 6, 23, 0.7);
		border: 1px solid rgba(148, 163, 184, 0.2);
		color: #f1f5f9;
		font-size: 0.875rem;
		outline: none;
	}

	.filters .actions {
		display: flex;
		gap: 0.375rem;
	}

	.dim {
		color: #94a3b8;
		font-size: 0.8125rem;
	}

	.actor {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.actor-email {
		color: #f1f5f9;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.role-chip {
		display: inline-block;
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #94a3b8;
	}

	.ip {
		color: #64748b;
		font-size: 0.7rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		margin-top: 0.125rem;
	}

	.pill {
		display: inline-block;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		background: rgba(148, 163, 184, 0.1);
		color: #cbd5e1;
		border: 1px solid rgba(148, 163, 184, 0.2);
	}
	.pill.ok {
		color: #34d399;
		background: rgba(52, 211, 153, 0.1);
		border-color: rgba(52, 211, 153, 0.3);
	}
	.pill.info {
		color: #38bdf8;
		background: rgba(56, 189, 248, 0.1);
		border-color: rgba(56, 189, 248, 0.3);
	}
	.pill.warn {
		color: #f87171;
		background: rgba(248, 113, 113, 0.1);
		border-color: rgba(248, 113, 113, 0.3);
	}
	.pill.danger {
		color: #fb7185;
		background: rgba(251, 113, 133, 0.1);
		border-color: rgba(251, 113, 133, 0.3);
	}

	.res {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
		color: #e2e8f0;
		background: rgba(148, 163, 184, 0.08);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	details summary {
		cursor: pointer;
		font-size: 0.75rem;
		color: #38bdf8;
	}

	.details-pre {
		margin: 0.375rem 0 0;
		padding: 0.5rem 0.625rem;
		background: rgba(2, 6, 23, 0.85);
		border: 1px solid rgba(148, 163, 184, 0.15);
		border-radius: 0.5rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
		color: #cbd5e1;
		max-height: 16rem;
		overflow: auto;
	}

	.pager {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.page-info {
		color: #94a3b8;
		font-size: 0.8125rem;
	}
</style>
