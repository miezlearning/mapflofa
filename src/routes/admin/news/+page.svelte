<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
	const items = $derived(data.items);

	let confirmingId = $state<number | null>(null);

	function fmt(d: Date | string) {
		return new Date(d).toLocaleDateString();
	}
</script>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">News</h1>
		<p class="adm-sub">{data.pagination.total} entri tersimpan.</p>
	</div>
	<a class="adm-btn adm-btn-primary" href="/admin/news/new">+ Tambah News</a>
</div>

{#if items.length === 0}
	<div class="adm-empty">Belum ada berita. Klik <strong>Tambah News</strong> untuk membuat yang pertama.</div>
{:else}
	<div class="adm-card" style="padding:0;overflow:hidden">
		<table class="adm-table">
			<thead>
				<tr>
					<th style="width:5rem">Cover</th>
					<th>Title / Slug</th>
					<th>Category</th>
					<th>Published</th>
					<th style="text-align:right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each items as n (n.id)}
					<tr>
						<td>
							<img src={n.image} alt="" class="thumb" loading="lazy" />
						</td>
						<td>
							<div class="title">{n.title}</div>
							<a class="slug" href={`/berita/${n.slug}`} target="_blank" rel="noopener">
								/berita/{n.slug} ↗
							</a>
						</td>
						<td><span class="dim">{n.category}</span></td>
						<td><span class="dim">{n.date}</span></td>
						<td>
							<div class="actions">
								<a class="adm-btn" href={`/admin/news/${n.id}`}>Edit</a>
								{#if confirmingId === n.id}
									<form
										method="POST"
										action="?/delete"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												confirmingId = null;
											};
										}}
									>
										<input type="hidden" name="id" value={n.id} />
										<button class="adm-btn adm-btn-danger" type="submit">Confirm</button>
									</form>
									<button type="button" class="adm-btn" onclick={() => (confirmingId = null)}>
										Cancel
									</button>
								{:else}
									<button
										type="button"
										class="adm-btn adm-btn-danger"
										onclick={() => (confirmingId = n.id)}
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

<style>
	.thumb {
		width: 4rem;
		height: 3rem;
		object-fit: cover;
		border-radius: 0.375rem;
		display: block;
	}
	.title {
		font-weight: 600;
		color: #f1f5f9;
	}
	.slug {
		display: inline-block;
		margin-top: 0.125rem;
		font-size: 0.7rem;
		color: #38bdf8;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		text-decoration: none;
	}
	.slug:hover {
		text-decoration: underline;
	}
	.dim {
		color: #94a3b8;
		font-size: 0.8125rem;
	}
</style>
