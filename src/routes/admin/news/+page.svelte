<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import AdminTourGuide, { type TourStep } from '$lib/components/admin/AdminTourGuide.svelte';

	let { data }: { data: PageData } = $props();
	const items = $derived(data.items);

	let confirmingId = $state<number | null>(null);
	let tourActive = $state(false);

	const tourSteps: TourStep[] = [
		{
			target: '[data-tour="news-header"]',
			title: 'Kelola Berita Mapflofa',
			content: 'Halaman ini menampilkan seluruh artikel berita & artikel kegiatan yang tersimpan di situs Mapflofa.'
		},
		{
			target: '[data-tour="add-btn"]',
			title: 'Tambah Berita Baru',
			content: 'Klik tombol "+ Tambah News" untuk membuka Visual Rich Editor dan membuat berita baru.'
		},
		{
			target: '[data-tour="news-table"]',
			title: 'Daftar Artikel',
			content: 'Anda dapat melihat cover gambar, judul, tautan publik /berita/slug, kategori, dan tanggal rilis artikel.'
		},
		{
			target: '[data-tour="news-actions"]',
			title: 'Aksi Edit & Hapus',
			content: 'Gunakan tombol Edit untuk memperbarui artikel atau Delete untuk menghapus entri berita.'
		}
	];

	function fmt(d: Date | string) {
		return new Date(d).toLocaleDateString();
	}
</script>

<AdminTourGuide steps={tourSteps} bind:active={tourActive} tourKey="news-list" />

<div class="adm-page-head" data-tour="news-header">
	<div>
		<h1 class="adm-title">News</h1>
		<p class="adm-sub">{data.pagination.total} entri tersimpan.</p>
	</div>
	<div class="flex items-center gap-2">
		<button
			type="button"
			class="adm-btn"
			onclick={() => (tourActive = true)}
			style="background: var(--color-surface-3, #f0f9ff); border-color: var(--color-primary, #0284c7); color: var(--color-primary, #0284c7); font-weight: 700;"
		>
			💡 Panduan Cara Membuat Berita
		</button>
		<a class="adm-btn adm-btn-primary" href="/admin/news/new" data-tour="add-btn">+ Tambah News</a>
	</div>
</div>

{#if items.length === 0}
	<div class="adm-empty">Belum ada berita. Klik <strong>Tambah News</strong> untuk membuat yang pertama.</div>
{:else}
	<div class="adm-card" style="padding:0;overflow:hidden" data-tour="news-table">
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
				{#each items as n, idx (n.id)}
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
							<div class="actions" data-tour={idx === 0 ? "news-actions" : undefined}>
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
</style>
