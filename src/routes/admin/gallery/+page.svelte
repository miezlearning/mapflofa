<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
	const items = $derived(data.items);

	let confirmingId = $state<number | null>(null);
</script>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Galeri</h1>
		<p class="adm-sub">{data.pagination.total} album tersimpan.</p>
	</div>
	<a class="adm-btn adm-btn-primary" href="/admin/gallery/new">+ Album Baru</a>
</div>

{#if items.length === 0}
	<div class="adm-empty">
		Belum ada album. Klik <strong>Album Baru</strong> untuk membuat album kegiatan pertama.
	</div>
{:else}
	<div class="adm-card" style="padding:0;overflow:hidden">
		<table class="adm-table">
			<thead>
				<tr>
					<th style="width:5rem">Sampul</th>
					<th>Judul</th>
					<th>Foto</th>
					<th>Status</th>
					<th style="text-align:right">Aksi</th>
				</tr>
			</thead>
			<tbody>
				{#each items as a (a.id)}
					<tr>
						<td>
							{#if a.effectiveCover}
								<img src={a.effectiveCover} alt="" class="thumb" loading="lazy" />
							{:else}
								<div class="thumb thumb-empty">—</div>
							{/if}
						</td>
						<td>
							<div class="title">{a.title}</div>
							<a class="slug" href={`/galeri/${a.slug}`} target="_blank" rel="noopener">
								/galeri/{a.slug} ↗
							</a>
							{#if a.eventDate}
								<div class="dim">{a.eventDate}</div>
							{/if}
						</td>
						<td><span class="dim">{a.photoCount} foto</span></td>
						<td>
							{#if a.isPublished}
								<span class="badge badge-on">Publik</span>
							{:else}
								<span class="badge badge-off">Draft</span>
							{/if}
						</td>
						<td>
							<div class="actions">
								<a class="adm-btn" href={`/admin/gallery/${a.id}`}>Kelola</a>
								{#if confirmingId === a.id}
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
										<input type="hidden" name="id" value={a.id} />
										<button class="adm-btn adm-btn-danger" type="submit">Hapus permanen</button>
									</form>
									<button type="button" class="adm-btn" onclick={() => (confirmingId = null)}>
										Batal
									</button>
								{:else}
									<button
										type="button"
										class="adm-btn adm-btn-danger"
										onclick={() => (confirmingId = a.id)}
									>
										Hapus
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
	.thumb-empty {
		display: grid;
		place-items: center;
		background: var(--color-surface-3, #f0f8ff);
		color: var(--color-muted, #6b7b8c);
	}
	.title {
		font-weight: 600;
		color: var(--color-ink, #333);
	}
	.slug {
		display: inline-block;
		margin-top: 0.125rem;
		font-size: 0.7rem;
		color: var(--color-primary, #6eaee8);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		text-decoration: none;
	}
	.slug:hover {
		text-decoration: underline;
	}
	.dim {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.8125rem;
	}
	.badge {
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.125rem 0.5rem;
		border-radius: 0.375rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.badge-on {
		color: #16a34a;
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
	}
	.badge-off {
		color: #ca8a04;
		background: #fefce8;
		border: 1px solid #fef08a;
	}
</style>
