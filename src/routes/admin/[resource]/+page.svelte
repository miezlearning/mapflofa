<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
	const resource = $derived(data.resource);
	const items = $derived(data.items);
	const listColumns = $derived(resource.fields.filter((f) => f.listColumn));

	function truncate(s: unknown, max = 80): string {
		if (typeof s !== 'string') return '';
		return s.length > max ? s.slice(0, max - 1) + '…' : s;
	}

	let confirmingId = $state<number | null>(null);
</script>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">{resource.plural}</h1>
		<p class="adm-sub">{data.pagination.total} entri tersimpan.</p>
	</div>
	<a class="adm-btn adm-btn-primary" href={`/admin/${resource.slug}/new`}>+ Tambah {resource.label}</a>
</div>

{#if items.length === 0}
	<div class="adm-empty">
		Belum ada {resource.label.toLowerCase()}. Klik <strong>Tambah {resource.label}</strong> di kanan
		atas untuk membuat yang pertama.
	</div>
{:else}
	<div class="adm-card" style="padding:0;overflow:hidden">
		<table class="adm-table">
			<thead>
				<tr>
					<th style="width:4rem">ID</th>
					{#each listColumns as col}
						<th>{col.label}</th>
					{/each}
					<th style="text-align:right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each items as item}
					{@const id = item.id as number}
					<tr>
						<td><code style="color:#94a3b8">#{id}</code></td>
						{#each listColumns as col}
							<td>{truncate(item[col.name])}</td>
						{/each}
						<td>
							<div class="actions">
								<a
									class="adm-btn"
									href={`/admin/${resource.slug}/${id}`}
									title="Edit"
								>
									Edit
								</a>
								{#if confirmingId === id}
									<form
										method="POST"
										action={`/admin/${resource.slug}?/delete`}
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												confirmingId = null;
											};
										}}
									>
										<input type="hidden" name="id" value={id} />
										<button class="adm-btn adm-btn-danger" type="submit">Confirm delete</button>
									</form>
									<button
										type="button"
										class="adm-btn"
										onclick={() => (confirmingId = null)}
									>
										Cancel
									</button>
								{:else}
									<button
										type="button"
										class="adm-btn adm-btn-danger"
										onclick={() => (confirmingId = id)}
									>
										Delete
									</button>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
