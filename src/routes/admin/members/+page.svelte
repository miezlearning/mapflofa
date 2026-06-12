<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
	const items = $derived(data.items);

	let confirmingId = $state<number | null>(null);
</script>

<svelte:head>
	<title>Pengurus · Admin</title>
</svelte:head>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Pengurus / Struktur Organisasi</h1>
		<p class="adm-sub">{items.length} pengurus. Urutan tampil mengikuti nomor urut.</p>
	</div>
	<a class="adm-btn adm-btn-primary" href="/admin/members/new">+ Tambah Pengurus</a>
</div>

{#if items.length === 0}
	<div class="adm-empty">
		Belum ada data pengurus. Klik <strong>Tambah Pengurus</strong> untuk menambahkan yang pertama.
	</div>
{:else}
	<div class="adm-card" style="padding:0;overflow:hidden">
		<table class="adm-table">
			<thead>
				<tr>
					<th style="width:4rem">Foto</th>
					<th>Nama / Jabatan</th>
					<th style="width:5rem">Urutan</th>
					<th style="width:5rem">Status</th>
					<th style="text-align:right">Aksi</th>
				</tr>
			</thead>
			<tbody>
				{#each items as m (m.id)}
					<tr>
						<td>
							{#if m.photo}
								<img src={m.photo} alt="" class="thumb" loading="lazy" />
							{:else}
								<div class="thumb thumb-empty">—</div>
							{/if}
						</td>
						<td>
							<div class="name">{m.name}</div>
							<div class="role">{m.position}</div>
						</td>
						<td><span class="dim">{m.sortOrder}</span></td>
						<td>
							{#if m.isActive}
								<span class="badge badge-on">Aktif</span>
							{:else}
								<span class="badge badge-off">Nonaktif</span>
							{/if}
						</td>
						<td>
							<div class="actions">
								<a class="adm-btn" href={`/admin/members/${m.id}`}>Edit</a>
								{#if confirmingId === m.id}
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
										<input type="hidden" name="id" value={m.id} />
										<button class="adm-btn adm-btn-danger" type="submit">Hapus permanen</button>
									</form>
									<button type="button" class="adm-btn" onclick={() => (confirmingId = null)}>Batal</button>
								{:else}
									<button type="button" class="adm-btn adm-btn-danger" onclick={() => (confirmingId = m.id)}>Hapus</button>
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
		width: 3rem;
		height: 3rem;
		object-fit: cover;
		border-radius: 0.5rem;
		display: block;
	}
	.thumb-empty {
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		background: var(--color-surface-3, #f0f8ff);
		color: var(--color-muted, #6b7b8c);
		border-radius: 0.5rem;
	}
	.name {
		font-weight: 600;
		color: var(--color-ink, #333);
	}
	.role {
		font-size: 0.75rem;
		color: var(--color-primary, #6eaee8);
		margin-top: 0.125rem;
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
