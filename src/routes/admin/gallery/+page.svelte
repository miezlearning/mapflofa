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
			target: '[data-tour="gallery-header"]',
			title: 'Kelola Galeri & Kegiatan',
			content: 'Halaman ini menampilkan seluruh album dokumentasi kegiatan dan foto galeri Mapflofa.'
		},
		{
			target: '[data-tour="add-album-btn"]',
			title: 'Buat Album Baru',
			content: 'Klik tombol "+ Album Baru" untuk membuat dokumentasi kegiatan baru.'
		},
		{
			target: '[data-tour="gallery-table"]',
			title: 'Daftar Album Dokumentasi',
			content: 'Anda dapat melihat sampul, judul kegiatan, URL slug publik, tanggal rilis, dan jumlah foto di dalam album.'
		},
		{
			target: '[data-tour="gallery-actions"]',
			title: 'Aksi Kelola Foto & Hapus',
			content: 'Gunakan tombol Kelola untuk menambah/mengatur foto di dalam album, atau Hapus untuk membuang album.'
		}
	];

	function formatHumanDate(d: Date | string | null | undefined): string {
		if (!d) return '-';
		const dateObj = typeof d === 'string' ? new Date(d) : d;
		if (isNaN(dateObj.getTime())) {
			return String(d);
		}

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const targetDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
		const diffDays = Math.round((today.getTime() - targetDay.getTime()) / (1000 * 60 * 60 * 24));

		const formattedStr = dateObj.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});

		if (diffDays === 0) return `Hari ini (${formattedStr})`;
		if (diffDays === 1) return `Kemarin (${formattedStr})`;
		if (diffDays > 1 && diffDays <= 7) return `${diffDays} hr lalu (${formattedStr})`;

		return formattedStr;
	}
</script>

<AdminTourGuide steps={tourSteps} bind:active={tourActive} tourKey="gallery-list" />

<div class="adm-page-head" data-tour="gallery-header">
	<div>
		<h1 class="adm-title">Galeri</h1>
		<p class="adm-sub">{data.pagination.total} album tersimpan.</p>
	</div>
	<div class="flex items-center gap-2">
		<button
			type="button"
			class="adm-btn"
			onclick={() => (tourActive = true)}
			style="background: var(--color-surface-3, #f0f9ff); border-color: var(--color-primary, #0284c7); color: var(--color-primary, #0284c7); font-weight: 700;"
		>
			💡 Panduan Galeri
		</button>
		<a class="adm-btn adm-btn-primary" href="/admin/gallery/new" data-tour="add-album-btn">+ Album Baru</a>
	</div>
</div>

{#if items.length === 0}
	<div class="adm-empty">
		Belum ada album. Klik <strong>Album Baru</strong> untuk membuat album kegiatan pertama.
	</div>
{:else}
	<div class="adm-card" style="padding:0;overflow:hidden" data-tour="gallery-table">
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
				{#each items as a, idx (a.id)}
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
								<div class="dim">📅 {formatHumanDate(a.eventDate)}</div>
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
							<div class="actions" data-tour={idx === 0 ? "gallery-actions" : undefined}>
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
