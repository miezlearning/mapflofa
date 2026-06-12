<script lang="ts">
	import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Button from '$lib/components/Button.svelte';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const header = $derived(data.header);
	const visi = $derived(data.visi);
	const misi = $derived(data.misi);
	const sejarah = $derived(data.sejarah);
	const nilai = $derived(data.nilai as { icon: IconName; title: string; desc: string }[]);
	const council = $derived(data.council);
	const divisions = $derived(data.divisions);

	// ===== Struktur Organisasi — Character Select + Detail Zoom =====
	type OrgMember = {
		id: number;
		role: string;
		description: string;
		name: string;
		nim: string;
		imageUrl: string;
		tupoksi: string[];
	};

	const orgMembers = $derived(data.members as OrgMember[]);
	const hasMembers = $derived(orgMembers.length > 0);

	let activeIndex = $state(0);
	let detailOpen = $state(false);

	// Keep activeIndex in range if members list changes
	const safeIndex = $derived(
		hasMembers ? Math.min(activeIndex, orgMembers.length - 1) : 0
	);
	const current = $derived(hasMembers ? orgMembers[safeIndex] : null);
	const nextIndex = $derived(hasMembers ? (safeIndex + 1) % orgMembers.length : 0);
	const nextMember = $derived(hasMembers ? orgMembers[nextIndex] : null);

	function goTo(index: number) {
		if (!hasMembers) return;
		activeIndex = ((index % orgMembers.length) + orgMembers.length) % orgMembers.length;
	}

	function goNext() {
		goTo(safeIndex + 1);
	}

	function openDetail() {
		if (hasMembers) detailOpen = true;
	}

	function closeDetail() {
		detailOpen = false;
	}
</script>

<svelte:head>
	<title>Profil — MAPFLOFA</title>
	<meta
		name="description"
		content="Profil MAPFLOFA: visi, misi, sejarah, dan struktur organisasi Mahasiswa Penyayang Flora Fauna."
	/>
</svelte:head>

<FloatingNavbar />

<main class="overflow-x-clip">
	<!-- ===== Header ===== -->
	<section class="profil-header relative overflow-hidden bg-surface-2 pt-32 md:pt-40 pb-16 md:pb-20 px-4 md:px-8">
		<!-- Large watermark logo for identity -->
		<div class="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-[0.04] pointer-events-none select-none" aria-hidden="true">
			<img src="/logo.png" alt="" class="w-[28rem] md:w-[36rem] lg:w-[44rem] h-auto" />
		</div>
		<div class="max-w-7xl mx-auto relative">
			<div use:reveal={{ from: 'up' }} class="max-w-2xl flex items-start gap-5 md:gap-6">
				<!-- Logo -->
				<img src="/logo.png" alt="Logo MAPFLOFA" class="w-16 h-16 md:w-20 md:h-20 shrink-0 drop-shadow-md" />
				<div>
					<div class="text-xs font-bold uppercase tracking-widest text-primary">{header.label}</div>
					<h1 class="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl text-ink leading-[1.05]">
						{header.title}
					</h1>
					<p class="mt-5 text-muted text-base md:text-lg leading-relaxed">
						{header.desc}
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== Visi & Misi ===== -->
	<section class="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden">
		<!-- Subtle dot pattern background -->
		<div class="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true"
			style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 24px 24px;"
		></div>
		<div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 md:gap-12 items-start relative">
			<!-- Visi -->
			<div
				use:reveal={{ from: 'left' }}
				class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-700 text-white p-8 md:p-12 shadow-xl shadow-primary/20"
			>
				<div aria-hidden="true" class="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl"></div>
				<div class="relative">
					<div class="text-xs font-bold uppercase tracking-widest text-white/70">Visi</div>
					<p class="mt-4 font-display font-extrabold text-2xl md:text-3xl leading-snug">
						{visi}
					</p>
				</div>
			</div>

			<!-- Misi -->
			<div use:reveal={{ from: 'right', delay: 100 }}>
				<div class="text-xs font-bold uppercase tracking-widest text-primary">Misi</div>
				<ul class="mt-5 space-y-4">
					{#each misi as m, i}
						<li class="flex gap-4">
							<span class="w-8 h-8 shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center font-bold text-sm">
								{i + 1}
							</span>
							<span class="text-muted text-base leading-relaxed pt-1">{m}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<!-- ===== Nilai ===== -->
	{#if nilai.length > 0}
		<section class="bg-surface-3 py-16 md:py-24 px-4 md:px-8">
			<div class="max-w-7xl mx-auto">
				<div use:reveal={{ from: 'up' }} class="text-center max-w-2xl mx-auto">
					<div class="text-xs font-bold uppercase tracking-widest text-primary">Nilai Kami</div>
					<h2 class="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink">Prinsip yang kami pegang
					</h2>
				</div>
				<div class="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
					{#each nilai as n, i}
						<div
							use:reveal={{ from: 'up', delay: i * 80 }}
							class="rounded-3xl bg-white border border-line p-6 text-center shadow-sm
							       transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
						>
							<div class="w-12 h-12 mx-auto rounded-2xl bg-primary/10 text-primary grid place-items-center">
								<Icon name={n.icon} size={24} />
							</div>
							<div class="mt-3 font-display font-bold text-ink">{n.title}</div>
							<div class="mt-1 text-xs text-muted leading-relaxed">{n.desc}</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- ===== Sejarah ===== -->
	<section class="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden">
		<!-- Decorative blob background -->
		<div class="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" aria-hidden="true"></div>
		<div class="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/5 blur-2xl pointer-events-none" aria-hidden="true"></div>
		<div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative">
			<div use:reveal={{ from: 'left' }} class="mask-organic overflow-hidden aspect-[4/3] bg-slate-100">
				<img
					src="https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop"
					alt="Kegiatan MAPFLOFA di alam"
					loading="lazy"
					class="w-full h-full object-cover"
				/>
			</div>
			<div use:reveal={{ from: 'right', delay: 100 }}>
				<div class="text-xs font-bold uppercase tracking-widest text-primary">Sejarah</div>
				<h2 class="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink leading-tight">
					Berawal dari kepedulian
				</h2>
				{#each sejarah as paragraph, i}
					<p class="text-muted text-base md:text-lg leading-relaxed" class:mt-5={i === 0} class:mt-4={i > 0}>
						{paragraph}
					</p>
				{/each}
			</div>
		</div>
	</section>

	<!-- ===== Dewan Pembina ===== -->
	{#if council.length > 0}
		<section class="bg-surface-3 py-16 md:py-24 px-4 md:px-8">
			<div class="max-w-7xl mx-auto">
				<div use:reveal={{ from: 'up' }} class="text-center max-w-2xl mx-auto">
					<div class="text-xs font-bold uppercase tracking-widest text-primary">Dewan Pembina</div>
					<h2 class="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink">
						Pelindung &amp; Pembina
					</h2>
					<p class="mt-3 text-muted text-sm md:text-base">
						Para pengarah dan pembina yang menaungi MAPFLOFA FKLT UNMUL.
					</p>
				</div>

				<div class="mt-12 flex flex-col gap-8">
					{#each council as block (block.group)}
						<div use:reveal={{ from: 'up' }}>
							<div class="council-label">{block.label}</div>
							<div class="council-grid">
								{#each block.people as person (person.id)}
									<div class="council-card">
										<div class="council-avatar">
											<Icon name="shield" size={20} />
										</div>
										<div class="council-info">
											<div class="council-name">{person.name}</div>
											<div class="council-role">{person.position}</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- ===== Struktur Organisasi — Character Select + Detail Zoom ===== -->
	{#if hasMembers && current && nextMember}
		<section id="struktur" class="sc-section scroll-mt-24" class:is-detail={detailOpen}>
			<!-- Subtle logo watermark -->
			<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none" aria-hidden="true">
				<img src="/logo.png" alt="" class="w-[30rem] h-auto" />
			</div>
			<!-- Section heading -->
			<div class="max-w-7xl mx-auto mb-10 text-center relative">
				<div class="text-xs font-bold uppercase tracking-widest text-primary">Struktur Organisasi</div>
				<h2 class="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink">
					Pengurus MAPFLOFA
				</h2>
			</div>
			<div class="sc-stage">
				<!-- ===== SELECT VIEW ===== -->
				<div class="sc-select" class:hidden={detailOpen} aria-hidden={detailOpen}>
					<!-- LEFT: dots + info -->
					<div class="sc-left">
						<!-- Vertical pagination dots -->
						<div class="sc-dots">
							<div class="sc-dots__track"></div>
							{#each orgMembers as member, i (member.id)}
								<button
									type="button"
									class="sc-dot"
									class:active={i === safeIndex}
									onclick={() => goTo(i)}
									aria-label={`Lihat ${member.role}`}
									aria-current={i === safeIndex ? 'true' : undefined}
								></button>
							{/each}
						</div>

						<!-- Text info -->
						<div class="sc-text">
							<div class="sc-text__org">Pengurus MAPFLOFA</div>
							{#key safeIndex}
								<div class="sc-text__content">
									<div class="sc-text__role">{current.role}</div>
									<h2 class="sc-text__name">{current.name}</h2>
									{#if current.nim}
										<div class="sc-text__nim">NIM. {current.nim}</div>
									{:else if current.description}
										<p class="sc-text__desc">{current.description}</p>
									{/if}
								</div>
							{/key}
							<button type="button" class="sc-btn" onclick={openDetail}>
								Selengkapnya
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
							</button>
						</div>
					</div>

					<!-- RIGHT: main person + next peeking + biodata cards -->
					<div class="sc-right">
						<div class="sc-decor" aria-hidden="true"></div>

						<!-- Fixed-size stage so layout never shifts regardless of image dimensions -->
						<div class="sc-stage-area">
							<!-- Next person peeking from the right edge -->
							{#if orgMembers.length > 1}
								<button
									type="button"
									class="sc-peek"
									onclick={goNext}
									aria-label={`Berikutnya: ${nextMember.name}`}
								>
									<div class="sc-peek__frame">
										{#key nextIndex}
											<img src={nextMember.imageUrl} alt="" class="sc-portrait__img" />
										{/key}
									</div>
								</button>
							{/if}

							<!-- Main person image (fixed frame) -->
							<button type="button" class="sc-person" onclick={openDetail} aria-label={`Lihat detail ${current.name}`}>
								<div class="sc-person__frame">
									{#key safeIndex}
										<img src={current.imageUrl} alt={current.name} class="sc-portrait__img" />
									{/key}
								</div>
								<span class="sc-person__hint">
									<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>
									Lihat detail
								</span>
							</button>
						</div>

						<!-- Biodata cards (current + next) -->
						<div class="sc-bios">
							<div class="sc-bio sc-bio--current">
								<span class="sc-bio__label">Biodata</span>
								<span class="sc-bio__name">{current.name}</span>
							</div>
							{#if orgMembers.length > 1}
								<button type="button" class="sc-bio sc-bio--next" onclick={goNext}>
									<span class="sc-bio__label">Selanjutnya</span>
									<span class="sc-bio__name">{nextMember.name}</span>
									<span class="sc-bio__arrow">
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
									</span>
								</button>
							{/if}
						</div>
					</div>
				</div>

				<!-- ===== DETAIL VIEW (zoom in) ===== -->
				{#if detailOpen}
					<div class="sc-detail">
						<!-- LEFT: large person -->
						<div class="sc-detail__visual">
							<img src={current.imageUrl} alt={current.name} class="sc-detail__img" />
						</div>

						<!-- RIGHT: tupoksi -->
						<div class="sc-detail__body">
							<button type="button" class="sc-back" onclick={closeDetail}>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
								Kembali
							</button>

							<div class="sc-detail__name">{current.name}</div>
							<h2 class="sc-detail__role">{current.role}</h2>
							{#if current.nim}
								<div class="sc-detail__nim">NIM. {current.nim}</div>
							{/if}

							{#if current.tupoksi.length > 0}
								<div class="sc-detail__label">Tugas Pokok &amp; Fungsi</div>
								<ol class="sc-tupoksi">
									{#each current.tupoksi as task, i (i)}
										<li>{task}</li>
									{/each}
								</ol>
							{:else if current.description}
								<p class="sc-detail__desc">{current.description}</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- ===== Divisi & Anggota ===== -->
	{#if divisions.length > 0}
		<section class="py-16 md:py-24 px-4 md:px-8">
			<div class="max-w-7xl mx-auto">
				<div use:reveal={{ from: 'up' }} class="text-center max-w-2xl mx-auto">
					<div class="text-xs font-bold uppercase tracking-widest text-primary">Divisi</div>
					<h2 class="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink">
						Divisi &amp; Anggota
					</h2>
					<p class="mt-3 text-muted text-sm md:text-base">
						Tim yang menjalankan program kerja di tiap bidang.
					</p>
				</div>

				<div class="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each divisions as div, i (div.name)}
						<div use:reveal={{ from: 'up', delay: i * 80 }} class="div-card">
							<h3 class="div-title">{div.name}</h3>

							{#if div.koordinator}
								<div class="div-koord">
									<span class="div-koord-badge">Koordinator</span>
									<div class="div-koord-name">{div.koordinator.name}</div>
									{#if div.koordinator.nim}
										<div class="div-nim">NIM. {div.koordinator.nim}</div>
									{/if}
								</div>
							{/if}

							{#if div.anggota.length > 0}
								<div class="div-members-label">Anggota</div>
								<ul class="div-members">
									{#each div.anggota as a (a.id)}
										<li class="div-member">
											<span class="div-member-name">{a.name}</span>
											{#if a.nim}<span class="div-member-nim">{a.nim}</span>{/if}
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- ===== CTA ===== -->
	<section class="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden">
		<!-- Decorative gradient background -->
		<div class="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.02] pointer-events-none" aria-hidden="true"></div>
		<div class="max-w-7xl mx-auto text-center relative">
			<h2 class="font-display font-extrabold tracking-tight text-3xl md:text-4xl text-primary">
				Ingin bergabung bersama kami?
			</h2>
			<p class="mt-4 text-muted text-base md:text-lg max-w-xl mx-auto">
				Terbuka untuk semua mahasiswa yang peduli pada alam dan ingin berkontribusi nyata.
			</p>
			<div class="mt-8 flex flex-wrap justify-center gap-4">
				<Button href="/#kontak" variant="accent" size="lg">Gabung MAPFLOFA</Button>
				<Button href="/galeri" variant="primary" size="lg">Lihat Kegiatan</Button>
			</div>
		</div>
	</section>

	<Footer />
</main>

<style>
	/* ==========================================================
	   Character Select + Detail Zoom — Struktur Organisasi
	   Pick a position (like a game character roster), then click
	   to zoom into the detail / tupoksi view.
	   ========================================================== */

	.sc-section {
		position: relative;
		overflow: hidden;
		padding: 5rem 1.5rem;
		background: var(--color-surface-2, #f8fafc);
	}

	@media (min-width: 768px) {
		.sc-section { padding: 6rem 2.5rem; }
	}

	.sc-stage {
		position: relative;
		max-width: 68rem;
		margin: 0 auto;
		min-height: 30rem;
	}

	@media (min-width: 768px) {
		.sc-stage { min-height: 34rem; }
	}

	/* ==========================================================
	   SELECT VIEW
	   ========================================================== */
	.sc-select {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		align-items: center;
		transition: opacity 400ms ease, transform 400ms ease;
	}

	@media (min-width: 768px) {
		.sc-select {
			grid-template-columns: 0.85fr 1.15fr;
			gap: 2rem;
		}
	}

	/* When detail opens, select view zooms out & fades */
	.sc-select.hidden {
		opacity: 0;
		transform: scale(1.08);
		pointer-events: none;
		position: absolute;
		inset: 0;
	}

	/* --- Left: dots + text --- */
	.sc-left {
		display: flex;
		gap: 1.5rem;
		align-items: center;
		min-width: 0;
	}

	/* Vertical dots */
	.sc-dots {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		padding: 0.5rem 0;
		flex-shrink: 0;
	}

	.sc-dots__track {
		position: absolute;
		top: 0.5rem;
		bottom: 0.5rem;
		left: 50%;
		width: 1px;
		background: var(--color-line, #e2e8f0);
		transform: translateX(-50%);
	}

	.sc-dot {
		position: relative;
		z-index: 1;
		width: 0.875rem;
		height: 0.875rem;
		border-radius: 50%;
		border: 2px solid var(--color-line, #e2e8f0);
		background: var(--color-surface-2, #f8fafc);
		cursor: pointer;
		padding: 0;
		transition: all 250ms ease;
	}

	.sc-dot:hover {
		border-color: var(--color-primary, #6eaee8);
	}

	.sc-dot:focus-visible {
		outline: 2px solid var(--color-primary, #6eaee8);
		outline-offset: 2px;
	}

	.sc-dot.active {
		border-color: var(--color-primary, #6eaee8);
		background: var(--color-primary, #6eaee8);
		box-shadow: 0 0 0 4px rgba(110, 174, 232, 0.18);
	}

	/* Text block */
	.sc-text {
		flex: 1;
		min-width: 0;
	}

	.sc-text__org {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-primary, #6eaee8);
		margin-bottom: 0.75rem;
	}

	.sc-text__content {
		animation: scSlideIn 400ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	@keyframes scSlideIn {
		from { opacity: 0; transform: translateX(-14px); }
		to   { opacity: 1; transform: translateX(0); }
	}

	.sc-text__role {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-muted, #64748b);
	}

	.sc-text__name {
		font-family: var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif);
		font-size: 2rem;
		font-weight: 800;
		color: var(--color-ink, #1e293b);
		letter-spacing: -0.025em;
		line-height: 1.1;
		margin: 0.375rem 0 0;
	}

	@media (min-width: 768px) { .sc-text__name { font-size: 2.5rem; } }
	@media (min-width: 1024px) { .sc-text__name { font-size: 3rem; } }

	.sc-text__desc {
		font-size: 0.9375rem;
		color: var(--color-muted, #64748b);
		margin: 0.5rem 0 0;
		line-height: 1.5;
	}

	.sc-text__nim {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-primary, #6eaee8);
		margin-top: 0.5rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}

	.sc-detail__nim {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-primary, #6eaee8);
		margin-top: 0.375rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	}

	/* ===== Dewan Pembina ===== */
	:global(.council-label) {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-primary, #6eaee8);
		margin-bottom: 0.875rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--color-line, #e2e8f0);
	}

	:global(.council-grid) {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 0.875rem;
	}

	:global(.council-card) {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		background: #fff;
		border: 1px solid var(--color-line, #e2e8f0);
		border-radius: 0.875rem;
		padding: 1rem 1.125rem;
		transition: border-color 200ms ease, box-shadow 200ms ease;
	}

	:global(.council-card:hover) {
		border-color: var(--color-primary, #6eaee8);
		box-shadow: 0 4px 16px rgba(110, 174, 232, 0.1);
	}

	:global(.council-avatar) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.625rem;
		background: var(--color-surface-2, #f8fafc);
		color: var(--color-primary, #6eaee8);
		flex-shrink: 0;
	}

	:global(.council-info) {
		min-width: 0;
	}

	:global(.council-name) {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-ink, #1e293b);
		line-height: 1.25;
	}

	:global(.council-role) {
		font-size: 0.75rem;
		color: var(--color-muted, #64748b);
		margin-top: 0.125rem;
	}

	/* ===== Divisi & Anggota ===== */
	:global(.div-card) {
		background: #fff;
		border: 1px solid var(--color-line, #e2e8f0);
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	}

	:global(.div-title) {
		font-family: var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif);
		font-size: 1.125rem;
		font-weight: 800;
		color: var(--color-ink, #1e293b);
		margin: 0 0 1rem;
	}

	:global(.div-koord) {
		background: var(--color-surface-2, #f8fafc);
		border: 1px solid var(--color-line, #e2e8f0);
		border-radius: 0.75rem;
		padding: 0.875rem 1rem;
		margin-bottom: 1rem;
	}

	:global(.div-koord-badge) {
		display: inline-block;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #fff;
		background: var(--color-primary, #6eaee8);
		padding: 0.125rem 0.5rem;
		border-radius: 0.375rem;
	}

	:global(.div-koord-name) {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-ink, #1e293b);
		margin-top: 0.5rem;
	}

	:global(.div-nim) {
		font-size: 0.75rem;
		color: var(--color-muted, #64748b);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		margin-top: 0.125rem;
	}

	:global(.div-members-label) {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-muted, #64748b);
		margin-bottom: 0.5rem;
	}

	:global(.div-members) {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	:global(.div-member) {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.5rem 0.625rem;
		border-radius: 0.5rem;
		background: var(--color-surface-3, #f1f5f9);
	}

	:global(.div-member-name) {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-ink, #1e293b);
		min-width: 0;
	}

	:global(.div-member-nim) {
		font-size: 0.6875rem;
		color: var(--color-muted, #64748b);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		flex-shrink: 0;
	}

	.sc-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1.75rem;
		padding: 0.6875rem 1.5rem;
		border-radius: 0.625rem;
		border: 0;
		background: var(--color-primary, #6eaee8);
		color: #fff;
		font-weight: 700;
		font-size: 0.8125rem;
		cursor: pointer;
		transition: all 200ms ease;
	}

	.sc-btn:hover {
		background: var(--color-primary-600, #4f97d6);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(110, 174, 232, 0.25);
	}

	.sc-btn:focus-visible {
		outline: 2px solid var(--color-primary, #6eaee8);
		outline-offset: 3px;
	}

	/* --- Right: person stage (FIXED dimensions, no layout shift) --- */
	.sc-right {
		position: relative;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		/* Absolute height so the column never resizes with the image */
		height: 24rem;
	}

	@media (min-width: 768px) { .sc-right { height: 28rem; } }
	@media (min-width: 1024px) { .sc-right { height: 32rem; } }

	.sc-decor {
		position: absolute;
		width: 18rem;
		height: 18rem;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(110, 174, 232, 0.1) 0%, transparent 70%);
		border: 1px dashed var(--color-line, #e2e8f0);
		bottom: 2rem;
		left: 50%;
		transform: translateX(-58%);
		pointer-events: none;
	}

	@media (min-width: 768px) { .sc-decor { width: 22rem; height: 22rem; } }

	/* Stage area: a centered, fixed-size box that holds the portraits.
	   Everything is absolutely positioned inside it, so changing the
	   image (any width/height) never moves the controls. */
	.sc-stage-area {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	/*
	   PORTRAIT FRAME — the key to stable layout + clean "cut-out" look.
	   ------------------------------------------------------------------
	   - Frame has an ABSOLUTE, fixed size (width/height in rem).
	   - The photo fills it with `object-fit: cover` + `object-position:
	     top center`, so ANY photo dimension looks uniform.
	   - A soft mask feathers the bottom edge so the portrait melts into
	     the section background instead of showing a hard rectangle —
	     a more robust "transparent" feel than mix-blend alone.
	*/
	.sc-person {
		position: relative;
		border: 0;
		background: transparent;
		cursor: pointer;
		padding: 0;
		z-index: 2;
	}

	.sc-person:focus-visible {
		outline: 2px solid var(--color-primary, #6eaee8);
		outline-offset: 4px;
		border-radius: 1.5rem;
	}

	.sc-person__frame {
		position: relative;
		width: 15rem;
		height: 22rem;
		overflow: hidden;
		border-radius: 1.5rem 1.5rem 0 0;
		border: 3px solid var(--color-line, #e2e8f0);
		border-bottom: none;
		box-shadow: 0 8px 32px rgba(110, 174, 232, 0.15), 0 2px 8px rgba(0, 0, 0, 0.06);
		/* feather bottom edge to blend into background */
		-webkit-mask-image: linear-gradient(to bottom, #000 78%, transparent 100%);
		mask-image: linear-gradient(to bottom, #000 78%, transparent 100%);
	}

	@media (min-width: 768px) {
		.sc-person__frame { width: 17rem; height: 26rem; }
	}

	@media (min-width: 1024px) {
		.sc-person__frame { width: 19rem; height: 30rem; }
	}

	/* Universal portrait image — fills its frame consistently */
	.sc-portrait__img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		display: block;
		animation: scPersonIn 500ms cubic-bezier(0.34, 1.2, 0.64, 1);
	}

	@keyframes scPersonIn {
		from { opacity: 0; transform: scale(1.04); }
		to   { opacity: 1; transform: scale(1); }
	}

	/* Hover hint badge */
	.sc-person__hint {
		position: absolute;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 3;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(8px);
		border: 1px solid var(--color-line, #e2e8f0);
		color: var(--color-primary, #6eaee8);
		font-size: 0.75rem;
		font-weight: 700;
		opacity: 0;
		transition: opacity 200ms ease;
		pointer-events: none;
		white-space: nowrap;
	}

	.sc-person:hover .sc-person__hint { opacity: 1; }

	/* Next person peeking — fixed-size frame, partially off to the right */
	.sc-peek {
		position: absolute;
		bottom: 0;
		right: 0;
		border: 0;
		background: transparent;
		padding: 0;
		cursor: pointer;
		z-index: 1;
		opacity: 0.5;
		transition: opacity 250ms ease, transform 250ms ease;
	}

	.sc-peek:hover { opacity: 0.8; transform: translateX(-8px); }

	.sc-peek:focus-visible {
		outline: 2px solid var(--color-primary, #6eaee8);
		outline-offset: 2px;
	}

	.sc-peek__frame {
		position: relative;
		width: 8rem;
		height: 18rem;
		overflow: hidden;
		border-radius: 1.25rem 1.25rem 0 0;
		border: 2px solid var(--color-line, #e2e8f0);
		border-bottom: none;
		/* fade left + bottom so only the right slice shows */
		-webkit-mask-image: linear-gradient(to right, transparent, #000 70%), linear-gradient(to bottom, #000 80%, transparent);
		-webkit-mask-composite: source-in;
		mask-image: linear-gradient(to right, transparent, #000 70%), linear-gradient(to bottom, #000 80%, transparent);
		mask-composite: intersect;
	}

	@media (min-width: 768px) {
		.sc-peek__frame { width: 9rem; height: 22rem; }
	}

	/* Biodata cards — anchored to the section, fixed position */
	.sc-bios {
		position: absolute;
		bottom: 0.75rem;
		right: 0;
		display: flex;
		gap: 0.5rem;
		z-index: 5;
	}

	.sc-bio {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.625rem 0.875rem;
		border-radius: 0.75rem;
		background: #fff;
		border: 1px solid var(--color-line, #e2e8f0);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
		min-width: 0;
		text-align: left;
	}

	.sc-bio--next {
		cursor: pointer;
		padding-right: 2rem;
		position: relative;
		transition: all 200ms ease;
	}

	.sc-bio--next:hover {
		border-color: var(--color-primary, #6eaee8);
		transform: translateY(-2px);
	}

	.sc-bio--next:focus-visible {
		outline: 2px solid var(--color-primary, #6eaee8);
		outline-offset: 2px;
	}

	.sc-bio__label {
		font-size: 0.5625rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted, #64748b);
		font-weight: 600;
	}

	.sc-bio--current .sc-bio__label {
		color: var(--color-primary, #6eaee8);
	}

	.sc-bio__name {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-ink, #1e293b);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 7rem;
	}

	.sc-bio__arrow {
		position: absolute;
		right: 0.625rem;
		top: 50%;
		transform: translateY(-50%);
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		background: var(--color-surface-3, #f1f5f9);
		color: var(--color-primary, #6eaee8);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sc-bio--next:hover .sc-bio__arrow {
		background: var(--color-primary, #6eaee8);
		color: #fff;
	}

	/* ==========================================================
	   DETAIL VIEW (zoom-in)
	   ========================================================== */
	.sc-detail {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0;
		background: #ffffff;
		border: 1px solid var(--color-line, #e2e8f0);
		border-radius: 1.5rem;
		overflow: hidden;
		box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.15);
		animation: scZoomIn 450ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	@media (min-width: 768px) {
		.sc-detail {
			grid-template-columns: 0.8fr 1.2fr;
		}
	}

	@keyframes scZoomIn {
		from { opacity: 0; transform: scale(0.9); }
		to   { opacity: 1; transform: scale(1); }
	}

	/* Left visual */
	.sc-detail__visual {
		position: relative;
		background: linear-gradient(160deg, var(--color-primary, #6eaee8), var(--color-primary-700, #2c5f7f));
		display: flex;
		align-items: flex-end;
		justify-content: center;
		min-height: 16rem;
		overflow: hidden;
	}

	@media (min-width: 768px) { .sc-detail__visual { min-height: 30rem; } }

	.sc-detail__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.2));
		animation: scImgRise 600ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	@keyframes scImgRise {
		from { opacity: 0; transform: translateY(24px) scale(1.05); }
		to   { opacity: 1; transform: translateY(0) scale(1); }
	}

	/* Right body */
	.sc-detail__body {
		padding: 1.75rem;
	}

	@media (min-width: 768px) { .sc-detail__body { padding: 2.5rem; } }

	.sc-back {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-line, #e2e8f0);
		background: #fff;
		color: var(--color-muted, #64748b);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 180ms ease;
		margin-bottom: 1.5rem;
	}

	.sc-back:hover {
		border-color: var(--color-primary, #6eaee8);
		color: var(--color-primary, #6eaee8);
	}

	.sc-back:focus-visible {
		outline: 2px solid var(--color-primary, #6eaee8);
		outline-offset: 2px;
	}

	.sc-detail__name {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-primary, #6eaee8);
	}

	.sc-detail__role {
		font-family: var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif);
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--color-ink, #1e293b);
		letter-spacing: -0.02em;
		line-height: 1.15;
		margin: 0.25rem 0 0;
	}

	@media (min-width: 768px) { .sc-detail__role { font-size: 2.25rem; } }

	.sc-detail__desc {
		font-size: 0.9375rem;
		color: var(--color-muted, #64748b);
		line-height: 1.6;
		margin-top: 1.25rem;
	}

	.sc-detail__label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-muted, #64748b);
		margin-top: 1.75rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--color-line, #e2e8f0);
	}

	.sc-tupoksi {
		list-style: none;
		counter-reset: tupoksi;
		margin: 1rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.sc-tupoksi li {
		counter-increment: tupoksi;
		position: relative;
		padding-left: 2.25rem;
		font-size: 0.9375rem;
		color: var(--color-ink, #1e293b);
		line-height: 1.55;
	}

	.sc-tupoksi li::before {
		content: counter(tupoksi);
		position: absolute;
		left: 0;
		top: 0;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background: var(--color-surface-3, #f1f5f9);
		color: var(--color-primary, #6eaee8);
		font-size: 0.75rem;
		font-weight: 800;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* ===== Mobile ===== */
	@media (max-width: 767px) {
		.sc-section { padding: 3rem 1rem; }
		.sc-stage { min-height: auto; }
		.sc-select { display: flex; flex-direction: column; }
		.sc-left { order: 2; }
		.sc-right { order: 1; height: 20rem; }
		.sc-dots { display: none; }
		.sc-text__name { font-size: 1.75rem; }
		.sc-peek { display: none; }
		.sc-decor { transform: translateX(-50%); }
		.sc-person__frame { width: 12rem; height: 18rem; }
		.sc-bios { position: relative; bottom: auto; right: auto; justify-content: center; margin-top: 0.5rem; flex-wrap: wrap; }
		.sc-detail { grid-template-columns: 1fr; }
		.sc-detail__visual { min-height: 16rem; }
		.sc-detail__role { font-size: 1.5rem; }
	}
</style>
