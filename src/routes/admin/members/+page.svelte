<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
	const items = $derived(data.items);

	let confirmingId = $state<number | null>(null);

	const groupLabels: Record<string, string> = {
		pelindung: 'Pelindung',
		penanggung_jawab: 'Penanggung Jawab',
		pembina: 'Pembina',
		pengurus: 'Pengurus Inti',
		divisi: 'Divisi'
	};

	function groupLabel(g: string) {
		return groupLabels[g] ?? g;
	}
</script>

<svelte:head>
	<title>Pengurus · Admin</title>
</svelte:head>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Pengurus / Struktur Organisasi</h1>
		<p class="adm-sub">{items.length} orang terdaftar. Urutan tampil mengikuti nomor urut.</p>
	</div>
	<a class="adm-btn adm-btn-primary" href="/admin/members/new">+ Tambah Orang</a>
</div>

{#if items.length === 0}
	<div class="adm-empty">
		Belum ada data. Klik <strong>Tambah Orang</strong> untuk menambahkan pengurus pertama.
	</div>
{:else}
	<div class="adm-card" style="padding:0;overflow:hidden">
		<table class="adm-table">
			<thead>
				<tr>
					<th style="width:4rem">Foto</th>
					<th>Nama / Jabatan</th>
					<th>Kelompok</th>
					<th style="width:4rem">Urutan</th>
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
								<div class="thumb thumb-empty">
									{m.name.charAt(0).toUpperCase()}
								</div>
							{/if}
						</td>
						<td>
							<div class="name">
								{m.name}
								{#if m.isFeatured}<span class="star" title="Tampil menonjol di website">★</span>{/if}
							</div>
							<div class="role">
								{m.position}{#if m.division} · {m.division}{/if}
							</div>
							{#if m.nim}<div class="nim">NIM. {m.nim}</div>{/if}
						</td>
						<td><span class="group-pill">{groupLabel(m.group)}</span></td>
						<td><span class="dim">{m.sortOrder}</span></td>
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
		background: var(--color-surface-2, #e8f4fd);
		color: var(--color-primary, #6eaee8);
		border-radius: 0.5rem;
		font-weight: 700;
	}
	.name {
		font-weight: 600;
		color: var(--color-ink, #333);
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	.star {
		color: #f59e0b;
		font-size: 0.875rem;
	}
	.role {
		font-size: 0.75rem;
		color: var(--color-primary, #6eaee8);
		margin-top: 0.125rem;
	}
	.nim {
		font-size: 0.6875rem;
		color: var(--color-muted, #6b7b8c);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		margin-top: 0.125rem;
	}
	.group-pill {
		display: inline-block;
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 0.125rem 0.5rem;
		border-radius: 0.375rem;
		background: var(--color-surface-3, #f0f8ff);
		color: var(--color-muted, #6b7b8c);
		border: 1px solid var(--color-line, #e3eef7);
	}
	.dim {
		color: var(--color-muted, #6b7b8c);
		font-size: 0.8125rem;
	}
</style>
