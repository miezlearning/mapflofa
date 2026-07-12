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

	const tujuan = $derived(data.tujuan);
	const lambang = $derived(data.lambang as { name: string; makna: string }[]);
	const kegiatan = $derived(data.kegiatan as { tahun: string; deskripsi: string }[]);
	const penghargaan = $derived(data.penghargaan as { tahun: string; deskripsi: string }[]);

	let activeTab = $state<'kegiatan' | 'penghargaan'>('kegiatan');
	let showAllKegiatan = $state(false);
	let showAllPenghargaan = $state(false);

	// ===== Struktur Organisasi — Character Select + Detail Zoom =====
	type OrgMember = {
		id: number;
		role: string;
		description: string;
		name: string;
		nim: string;
		imageUrl: string;
		tupoksi: string[];
		division: string;
		group: string;
	};

	const orgMembers = $derived(data.members as OrgMember[]);
	const hasMembers = $derived(orgMembers.length > 0);

	let activeIndex = $state(0);
	let detailOpen = $state(false);
	let slideDirection = $state<'next' | 'prev'>('next');

	// Keep activeIndex in range if members list changes
	const safeIndex = $derived(
		hasMembers ? Math.min(activeIndex, orgMembers.length - 1) : 0
	);
	const current = $derived(hasMembers ? orgMembers[safeIndex] : null);
	const nextIndex = $derived(hasMembers ? (safeIndex + 1) % orgMembers.length : 0);
	const nextMember = $derived(hasMembers ? orgMembers[nextIndex] : null);

	const currentDivision = $derived(
		current && current.division
			? divisions.find((d) => d.name.toLowerCase() === current.division.toLowerCase())
			: null
	);

	function formatNim(nim: string | null) {
		if (!nim) return '';
		if (nim.toLowerCase().includes('npa')) {
			return nim;
		}
		return `NIM. ${nim}`;
	}

	function goTo(index: number) {
		if (!hasMembers) return;
		const newIndex = ((index % orgMembers.length) + orgMembers.length) % orgMembers.length;
		slideDirection = newIndex > activeIndex || (activeIndex === orgMembers.length - 1 && newIndex === 0) ? 'next' : 'prev';
		activeIndex = newIndex;
	}

	function goNext() {
		slideDirection = 'next';
		goTo(safeIndex + 1);
	}

	function goPrev() {
		slideDirection = 'prev';
		goTo(safeIndex - 1);
	}

	function openDetail() {
		if (hasMembers) detailOpen = true;
	}

	function closeDetail() {
		detailOpen = false;
	}

	function selectDivision(divName: string) {
		const idx = orgMembers.findIndex(
			(m) => m.division && m.division.toLowerCase() === divName.toLowerCase()
		);
		if (idx !== -1) {
			goTo(idx);
			const el = document.getElementById('struktur');
			if (el) el.scrollIntoView({ behavior: 'smooth' });
		}
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
		<!-- Multi-layer page decor -->
		<div class="page-decor" aria-hidden="true">
			<div class="page-decor__ring page-decor__ring--1"></div>
			<div class="page-decor__ring page-decor__ring--2"></div>
			<div class="page-decor__line page-decor__line--1"></div>
			<div class="page-decor__line page-decor__line--2"></div>
			<div class="page-decor__dot page-decor__dot--1"></div>
			<div class="page-decor__dot page-decor__dot--2"></div>
			<div class="page-decor__dot page-decor__dot--3"></div>
			<div class="page-decor__cross page-decor__cross--1"></div>
			<div class="page-decor__cross page-decor__cross--2"></div>
			<div class="page-decor__logo">
				<img src="/logo.png" alt="" class="w-full h-full object-contain" />
			</div>
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
		<!-- Geometric decor layers -->
		<div class="section-decor" aria-hidden="true">
			<div class="section-decor__diamond section-decor__diamond--1"></div>
			<div class="section-decor__diamond section-decor__diamond--2"></div>
			<div class="section-decor__stripe section-decor__stripe--1"></div>
			<div class="section-decor__stripe section-decor__stripe--2"></div>
			<div class="section-decor__stripe section-decor__stripe--3"></div>
		</div>
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

	<!-- ===== Tujuan & Makna Lambang ===== -->
	<section class="bg-surface-2 py-16 md:py-24 px-4 md:px-8 relative overflow-hidden">
		<!-- Decor for the section -->
		<div class="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true">
			<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
					<circle cx="2" cy="2" r="2" fill="currentColor"/>
				</pattern>
				<rect width="100%" height="100%" fill="url(#dot-grid)"/>
			</svg>
		</div>

		<div class="max-w-7xl mx-auto relative">
			<!-- Tujuan Banner -->
			{#if tujuan}
				<div use:reveal={{ from: 'up' }} class="relative overflow-hidden rounded-3xl bg-white border border-line p-8 md:p-10 shadow-sm mb-16">
					<div class="flex flex-col md:flex-row gap-6 items-start md:items-center">
						<div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
							<Icon name="compass" size={24} />
						</div>
						<div>
							<div class="text-xs font-bold uppercase tracking-widest text-primary">Tujuan Organisasi</div>
							<p class="mt-2 text-ink text-base md:text-lg font-medium leading-relaxed">
								{tujuan}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Makna Lambang Section -->
			{#if lambang.length > 0}
				<div class="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
					<!-- Left: Visual Logo Display -->
					<div use:reveal={{ from: 'left' }} class="lg:col-span-5 text-center flex flex-col items-center">
						<div class="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-white border border-line/60 shadow-xl shadow-slate-100 flex items-center justify-center p-8 transition-transform duration-500 hover:scale-105">
							<!-- Subtle ambient circle glow -->
							<div class="absolute inset-0 rounded-full bg-primary/5 blur-xl animate-pulse"></div>
							<img src="/logo.png" alt="Lambang MAPFLOFA" class="w-full h-full object-contain relative z-10" />
						</div>
						<h3 class="mt-6 font-display font-extrabold text-ink text-xl">Lambang MAPFLOFA</h3>
						<p class="text-muted text-xs uppercase tracking-wider font-semibold mt-1 font-mono">Ducula whartoni</p>
					</div>

					<!-- Right: Meanings list -->
					<div use:reveal={{ from: 'right', delay: 150 }} class="lg:col-span-7 space-y-6">
						<div>
							<div class="text-xs font-bold uppercase tracking-widest text-primary">Makna Lambang</div>
							<h2 class="mt-2 font-display font-extrabold text-2xl md:text-3xl text-ink">Simbolisme di Balik Logo Kami</h2>
						</div>

						<div class="space-y-4">
							{#each lambang as item}
								<div class="flex gap-4 p-5 rounded-2xl bg-white border border-line shadow-sm hover:border-primary/30 transition-colors duration-300">
									<div class="w-8 h-8 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
									</div>
									<div>
										<h4 class="font-bold text-ink text-base">{item.name}</h4>
										<p class="text-muted text-sm leading-relaxed mt-1">{item.makna}</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
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
							class="nilai-card rounded-3xl bg-white border border-line p-4 sm:p-6 text-center shadow-sm
							       transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
						>
							<div class="nilai-icon w-12 h-12 mx-auto rounded-2xl bg-primary/10 text-primary grid place-items-center
							            transition-all duration-300">
								<Icon name={n.icon} size={24} />
							</div>
							<div class="nilai-title mt-3 font-display font-bold text-ink transition-colors duration-300">{n.title}</div>
							<div class="mt-1 text-xs text-muted leading-relaxed">{n.desc}</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- ===== Sejarah ===== -->
	<section class="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden">
		<!-- Layered decor -->
		<div class="sejarah-decor" aria-hidden="true">
			<div class="sejarah-decor__arc sejarah-decor__arc--1"></div>
			<div class="sejarah-decor__arc sejarah-decor__arc--2"></div>
			<div class="sejarah-decor__grid"></div>
			<div class="sejarah-decor__accent"></div>
		</div>
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

	<!-- ===== Rekam Jejak (Kegiatan & Penghargaan) ===== -->
	{#if kegiatan.length > 0 || penghargaan.length > 0}
		<section class="bg-surface-3 py-16 md:py-24 px-4 md:px-8">
			<div class="max-w-4xl mx-auto">
				<div use:reveal={{ from: 'up' }} class="text-center max-w-2xl mx-auto mb-10">
					<div class="text-xs font-bold uppercase tracking-widest text-primary">Rekam Jejak</div>
					<h2 class="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink">Aktivitas &amp; Prestasi</h2>
					<p class="mt-3 text-muted text-sm md:text-base">Perjalanan konservasi dan dedikasi MAPFLOFA dari masa ke masa.</p>
				</div>

				<!-- Tabs Selector -->
				<div use:reveal={{ from: 'up' }} class="flex justify-center p-1 rounded-2xl bg-white border border-line mb-10 max-w-md mx-auto">
					<button
						type="button"
						class="flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer"
						class:bg-primary={activeTab === 'kegiatan'}
						class:text-white={activeTab === 'kegiatan'}
						class:text-muted={activeTab !== 'kegiatan'}
						onclick={() => activeTab = 'kegiatan'}
					>
						Kegiatan
					</button>
					<button
						type="button"
						class="flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer"
						class:bg-primary={activeTab === 'penghargaan'}
						class:text-white={activeTab === 'penghargaan'}
						class:text-muted={activeTab !== 'penghargaan'}
						onclick={() => activeTab = 'penghargaan'}
					>
						Penghargaan
					</button>
				</div>

				<!-- Tab Contents -->
				<div use:reveal={{ from: 'up', delay: 100 }}>
					{#if activeTab === 'kegiatan'}
						<div class="space-y-4">
							{#each (showAllKegiatan ? kegiatan : kegiatan.slice(0, 8)) as item, i}
								<div class="flex gap-4 p-5 rounded-2xl bg-white border border-line shadow-sm items-start hover:border-primary/20 transition-all duration-300">
									<span class="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
										{item.tahun}
									</span>
									<p class="text-ink text-sm md:text-base leading-relaxed pt-0.5">
										{item.deskripsi}
									</p>
								</div>
							{/each}

							{#if kegiatan.length > 8}
								<div class="text-center mt-8">
									<button
										type="button"
										class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-line bg-white hover:bg-slate-50 font-bold text-sm text-ink transition-colors duration-300 cursor-pointer"
										onclick={() => showAllKegiatan = !showAllKegiatan}
									>
										{showAllKegiatan ? 'Tampilkan Lebih Sedikit' : `Lihat Semua Kegiatan (${kegiatan.length})`}
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class:rotate-180={showAllKegiatan} class="transition-transform duration-300"><path d="m6 9 6 6 6-6"/></svg>
									</button>
								</div>
							{/if}
						</div>
					{:else}
						<div class="space-y-4">
							{#each (showAllPenghargaan ? penghargaan : penghargaan.slice(0, 8)) as item, i}
								<div class="flex gap-4 p-5 rounded-2xl bg-white border border-line shadow-sm items-start hover:border-primary/20 transition-all duration-300">
									<span class="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
										{item.tahun}
									</span>
									<p class="text-ink text-sm md:text-base leading-relaxed pt-0.5">
										{item.deskripsi}
									</p>
								</div>
							{/each}

							{#if penghargaan.length > 8}
								<div class="text-center mt-8">
									<button
										type="button"
										class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-line bg-white hover:bg-slate-50 font-bold text-sm text-ink transition-colors duration-300 cursor-pointer"
										onclick={() => showAllPenghargaan = !showAllPenghargaan}
									>
										{showAllPenghargaan ? 'Tampilkan Lebih Sedikit' : `Lihat Semua Penghargaan (${penghargaan.length})`}
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class:rotate-180={showAllPenghargaan} class="transition-transform duration-300"><path d="m6 9 6 6 6-6"/></svg>
									</button>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</section>
	{/if}

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
			<!-- Layered decor for struktur section -->
			<div class="struktur-decor" aria-hidden="true">
				<div class="struktur-decor__hex struktur-decor__hex--1"></div>
				<div class="struktur-decor__hex struktur-decor__hex--2"></div>
				<div class="struktur-decor__orbit"></div>
				<div class="struktur-decor__scanline"></div>
				<div class="struktur-decor__corner struktur-decor__corner--tl"></div>
				<div class="struktur-decor__corner struktur-decor__corner--br"></div>
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
								<div class="sc-text__content" class:slide-next={slideDirection === 'next'} class:slide-prev={slideDirection === 'prev'}>
									<div class="sc-text__role">{current.role}</div>
									<h2 class="sc-text__name">{current.name}</h2>
									{#if current.nim}
										<div class="sc-text__nim">{formatNim(current.nim)}</div>
									{:else if current.description}
										<p class="sc-text__desc">{current.description}</p>
									{/if}

									{#if currentDivision && currentDivision.anggota.length > 0}
										<div class="sc-members-section mt-4 bg-white/40 backdrop-blur-sm rounded-2xl p-3 border border-line">
											<div class="text-[10px] font-bold uppercase tracking-wider text-primary/80 mb-2">Anggota Divisi:</div>
											<ul class="space-y-1 max-h-32 overflow-y-auto pr-1">
												{#each currentDivision.anggota as a}
													<li class="flex justify-between items-center text-xs text-muted">
														<span class="font-medium text-ink leading-tight">{a.name}</span>
														<span class="font-mono text-[10px] opacity-75 shrink-0 ml-2">{formatNim(a.nim)}</span>
													</li>
												{/each}
											</ul>
										</div>
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
						<!-- Decorative background — MAPFLOFA logo -->
						<div class="sc-backdrop" aria-hidden="true">
							<img src="/logo.png" alt="" class="sc-backdrop__logo" />
						</div>

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
										<img src={current.imageUrl} alt={current.name} class="sc-portrait__img" class:slide-next={slideDirection === 'next'} class:slide-prev={slideDirection === 'prev'} />
									{/key}
								</div>
								<span class="sc-person__hint">
									<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>
									Lihat detail
								</span>
							</button>
						</div>

						<!-- Navigation + Biodata cards -->
						<div class="sc-bios">
							{#if orgMembers.length > 1}
								<button type="button" class="sc-nav-btn sc-nav-btn--prev" onclick={goPrev} aria-label="Sebelumnya">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 19l-7-7 7-7"/></svg>
								</button>
							{/if}
							<div class="sc-bio sc-bio--current">
								<span class="sc-bio__label">Biodata</span>
								<span class="sc-bio__name">{current.name}</span>
							</div>
							{#if orgMembers.length > 1}
								<button type="button" class="sc-nav-btn sc-nav-btn--next" onclick={goNext} aria-label="Selanjutnya">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
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
								<div class="sc-detail__nim">{formatNim(current.nim)}</div>
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

							{#if currentDivision && currentDivision.anggota.length > 0}
								<div class="sc-detail__label mt-6">Anggota {currentDivision.name}</div>
								<ul class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
									{#each currentDivision.anggota as a}
										<li class="flex items-center justify-between p-3 rounded-2xl bg-surface-3 border border-line text-xs">
											<span class="font-semibold text-ink leading-tight">{a.name}</span>
											<span class="font-mono text-muted shrink-0 ml-2">{formatNim(a.nim)}</span>
										</li>
									{/each}
								</ul>
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
						<button
							type="button"
							use:reveal={{ from: 'up', delay: i * 80 }}
							class="div-card text-left w-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
							class:active-div={currentDivision && currentDivision.name.toLowerCase() === div.name.toLowerCase()}
							onclick={() => selectDivision(div.name)}
						>
							<h3 class="div-title">{div.name}</h3>

							{#if div.koordinator}
								<div class="div-koord">
									<span class="div-koord-badge">Koordinator</span>
									<div class="div-koord-name">{div.koordinator.name}</div>
									{#if div.koordinator.nim}
										<div class="div-nim">{formatNim(div.koordinator.nim)}</div>
									{/if}
								</div>
							{/if}

							{#if div.anggota.length > 0}
								<div class="div-members-label">Anggota</div>
								<ul class="div-members">
									{#each div.anggota as a (a.id)}
										<li class="div-member">
											<span class="div-member-name">{a.name}</span>
											{#if a.nim}<span class="div-member-nim">{formatNim(a.nim)}</span>{/if}
										</li>
									{/each}
								</ul>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- ===== CTA ===== -->
	<section class="relative py-16 md:py-24 px-4 md:px-8 overflow-hidden">
		<!-- CTA decor -->
		<div class="cta-decor" aria-hidden="true">
			<div class="cta-decor__ring"></div>
			<div class="cta-decor__ray cta-decor__ray--1"></div>
			<div class="cta-decor__ray cta-decor__ray--2"></div>
			<div class="cta-decor__ray cta-decor__ray--3"></div>
		</div>
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
	/* ===== Nilai Kami — hover effects ===== */
	.nilai-card:hover .nilai-icon {
		background: var(--color-primary, #6eaee8) !important;
		color: #fff !important;
		box-shadow: 0 4px 16px rgba(110, 174, 232, 0.35);
	}

	.nilai-card:hover .nilai-title {
		color: var(--color-primary, #6eaee8) !important;
	}

	.nilai-card:hover {
		border-color: rgba(110, 174, 232, 0.4);
	}
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
		animation: scSlideInNext 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
		min-height: 9.5rem;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		padding-bottom: 1rem;
	}

	@media (min-width: 768px) { .sc-text__content { min-height: 11.5rem; } }
	@media (min-width: 1024px) { .sc-text__content { min-height: 13.5rem; } }

	.sc-text__content.slide-prev {
		animation: scSlideInPrev 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	@keyframes scSlideInNext {
		from { opacity: 0; transform: translateX(40px); }
		to   { opacity: 1; transform: translateX(0); }
	}

	@keyframes scSlideInPrev {
		from { opacity: 0; transform: translateX(-40px); }
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
		word-break: break-word;
		overflow-wrap: break-word;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@media (min-width: 768px) { .sc-text__name { font-size: 2.5rem; } }
	@media (min-width: 1024px) { .sc-text__name { font-size: 3rem; } }

	.sc-text__desc {
		font-size: 0.9375rem;
		color: var(--color-muted, #64748b);
		margin-top: 0.75rem;
		line-height: 1.5;
	}

	.sc-text__nim {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-primary, #6eaee8);
		margin-top: 0.75rem;
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
		margin-bottom: 3rem;
	}

	@media (min-width: 768px) { .sc-right { height: 28rem; margin-bottom: 3.5rem; } }
	@media (min-width: 1024px) { .sc-right { height: 32rem; } }

	/* ===== Bold Decorative Backdrop — behind person ===== */
	.sc-backdrop {
		position: absolute;
		inset: 0;
		border-radius: 1.5rem;
		overflow: hidden;
		pointer-events: none;
		background: var(--color-surface-3, #f0f8ff);
		border: 1px solid var(--color-line, #e2e8f0);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sc-backdrop__logo {
		width: 65%;
		height: 65%;
		object-fit: contain;
		opacity: 0.35;
	}

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
		overflow: visible;
	}

	.sc-person:focus-visible {
		outline: 2px solid var(--color-primary, #6eaee8);
		outline-offset: 4px;
		border-radius: 1.5rem;
	}

	.sc-person__frame {
		position: relative;
		z-index: 2;
		width: 15rem;
		height: 22rem;
		overflow: hidden;
		border-radius: 1.25rem;
	}

	/* ===== Slide Decor removed — using bold backdrop instead ===== */

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
		animation: scPersonSlideNext 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.sc-portrait__img.slide-prev {
		animation: scPersonSlidePrev 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	@keyframes scPersonSlideNext {
		from { opacity: 0; transform: translateX(60px); }
		to   { opacity: 1; transform: translateX(0); }
	}

	@keyframes scPersonSlidePrev {
		from { opacity: 0; transform: translateX(-60px); }
		to   { opacity: 1; transform: translateX(0); }
	}

	/* Hover hint badge */
	.sc-person__hint {
		position: absolute;
		bottom: 4rem;
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
		border: 1px solid rgba(255, 255, 255, 0.2);
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
		/* fade left + bottom so only the right slice shows */
		-webkit-mask-image: linear-gradient(to right, transparent, #000 70%), linear-gradient(to bottom, #000 80%, transparent);
		-webkit-mask-composite: source-in;
		mask-image: linear-gradient(to right, transparent, #000 70%), linear-gradient(to bottom, #000 80%, transparent);
		mask-composite: intersect;
	}

	@media (min-width: 768px) {
		.sc-peek__frame { width: 9rem; height: 22rem; }
	}

	/* Biodata cards — anchored below the person in sc-right */
	.sc-bios {
		position: absolute;
		bottom: -2.5rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		z-index: 5;
	}

	.sc-bio {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		background: #1e293b;
		border: 1px solid rgba(110, 174, 232, 0.3);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
		min-width: 8rem;
		width: 12rem;
		text-align: left;
		flex-shrink: 0;
	}

	.sc-bio--next {
		cursor: pointer;
		padding-right: 1rem;
		position: relative;
		transition: all 200ms ease;
	}

	.sc-bio--next:hover {
		border-color: var(--color-primary, #6eaee8);
		transform: translateY(-2px);
		box-shadow: 0 6px 24px rgba(110, 174, 232, 0.2);
	}

	/* Nav buttons (prev / next) */
	.sc-nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(110, 174, 232, 0.3);
		background: #1e293b;
		color: var(--color-primary, #6eaee8);
		cursor: pointer;
		transition: all 200ms ease;
		flex-shrink: 0;
	}

	.sc-nav-btn:hover {
		background: var(--color-primary, #6eaee8);
		color: #fff;
		border-color: var(--color-primary, #6eaee8);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(110, 174, 232, 0.3);
	}

	.sc-nav-btn:focus-visible {
		outline: 2px solid var(--color-primary, #6eaee8);
		outline-offset: 2px;
	}

	.sc-bio--next:focus-visible {
		outline: 2px solid var(--color-primary, #6eaee8);
		outline-offset: 2px;
	}

	.sc-bio__label {
		font-size: 0.5625rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgba(255, 255, 255, 0.5);
		font-weight: 600;
	}

	.sc-bio--current .sc-bio__label {
		color: var(--color-primary, #6eaee8);
	}

	.sc-bio__name {
		font-size: 0.75rem;
		font-weight: 700;
		color: #fff;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 10rem;
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
		.sc-left { order: 2; align-self: stretch; }
		.sc-right { order: 1; height: 20rem; margin-bottom: 2rem; }
		.sc-dots { display: none; }
		.sc-text__name { font-size: 1.75rem; }
		.sc-peek { display: none; }
		.sc-backdrop { border-radius: 1rem; }
		.sc-person__frame { width: 12rem; height: 18rem; }
		.sc-bios { position: relative; bottom: auto; left: auto; transform: none; justify-content: center; margin-top: 0.5rem; flex-wrap: wrap; }
		.sc-bio { width: 10.5rem; }
		.sc-detail { grid-template-columns: 1fr; }
		.sc-detail__visual { min-height: 16rem; }
		.sc-detail__role { font-size: 1.5rem; }
	}

	/* ==========================================================
	   PAGE DECOR — Header multi-layer decoration
	   ========================================================== */
	.page-decor {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.page-decor__ring {
		position: absolute;
		border-radius: 50%;
		border: 1px solid var(--color-primary, #6eaee8);
	}

	.page-decor__ring--1 {
		width: 28rem;
		height: 28rem;
		top: -8rem;
		right: -6rem;
		opacity: 0.12;
	}

	.page-decor__ring--2 {
		width: 18rem;
		height: 18rem;
		top: -2rem;
		right: -1rem;
		opacity: 0.08;
		border-style: dashed;
	}

	.page-decor__line {
		position: absolute;
		background: var(--color-primary, #6eaee8);
	}

	.page-decor__line--1 {
		width: 1px;
		height: 6rem;
		top: 2rem;
		right: 12rem;
		opacity: 0.15;
	}

	.page-decor__line--2 {
		width: 4rem;
		height: 1px;
		bottom: 3rem;
		right: 8rem;
		opacity: 0.12;
	}

	.page-decor__dot {
		position: absolute;
		border-radius: 50%;
		background: var(--color-primary, #6eaee8);
	}

	.page-decor__dot--1 {
		width: 6px;
		height: 6px;
		top: 30%;
		right: 20%;
		opacity: 0.25;
	}

	.page-decor__dot--2 {
		width: 4px;
		height: 4px;
		top: 60%;
		right: 35%;
		opacity: 0.18;
	}

	.page-decor__dot--3 {
		width: 8px;
		height: 8px;
		bottom: 20%;
		right: 15%;
		opacity: 0.12;
	}

	.page-decor__cross {
		position: absolute;
		width: 1rem;
		height: 1rem;
		opacity: 0.18;
	}

	.page-decor__cross::before,
	.page-decor__cross::after {
		content: '';
		position: absolute;
		background: var(--color-primary, #6eaee8);
	}

	.page-decor__cross::before {
		width: 100%;
		height: 1px;
		top: 50%;
		left: 0;
	}

	.page-decor__cross::after {
		width: 1px;
		height: 100%;
		left: 50%;
		top: 0;
	}

	.page-decor__cross--1 {
		top: 25%;
		right: 28%;
	}

	.page-decor__cross--2 {
		bottom: 30%;
		right: 10%;
		transform: rotate(45deg);
	}

	.page-decor__logo {
		position: absolute;
		top: 50%;
		right: 3%;
		transform: translateY(-50%);
		width: 20rem;
		height: 20rem;
		opacity: 0.06;
	}

	@media (min-width: 768px) {
		.page-decor__logo { width: 28rem; height: 28rem; right: 5%; }
	}

	@media (min-width: 1024px) {
		.page-decor__logo { width: 34rem; height: 34rem; }
	}

	/* ==========================================================
	   SECTION DECOR — Visi & Misi
	   ========================================================== */
	.section-decor {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.section-decor__diamond {
		position: absolute;
		width: 3rem;
		height: 3rem;
		border: 1px solid var(--color-primary, #6eaee8);
		transform: rotate(45deg);
		opacity: 0.08;
	}

	.section-decor__diamond--1 {
		top: 15%;
		left: 5%;
		width: 2rem;
		height: 2rem;
		opacity: 0.15;
	}

	.section-decor__diamond--2 {
		bottom: 20%;
		right: 8%;
		width: 3.5rem;
		height: 3.5rem;
		border-style: dashed;
		opacity: 0.1;
	}

	.section-decor__stripe {
		position: absolute;
		background: var(--color-primary, #6eaee8);
		opacity: 0.07;
	}

	.section-decor__stripe--1 {
		width: 100%;
		height: 1px;
		top: 30%;
		left: 0;
	}

	.section-decor__stripe--2 {
		width: 60%;
		height: 1px;
		top: 70%;
		right: 0;
	}

	.section-decor__stripe--3 {
		width: 1px;
		height: 40%;
		top: 20%;
		left: 8%;
		opacity: 0.06;
	}

	/* ==========================================================
	   SEJARAH DECOR
	   ========================================================== */
	.sejarah-decor {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.sejarah-decor__arc {
		position: absolute;
		border-radius: 50%;
		border: 1px solid var(--color-primary, #6eaee8);
	}

	.sejarah-decor__arc--1 {
		width: 40rem;
		height: 40rem;
		bottom: -20rem;
		left: -10rem;
		opacity: 0.08;
	}

	.sejarah-decor__arc--2 {
		width: 24rem;
		height: 24rem;
		top: -10rem;
		right: -8rem;
		opacity: 0.06;
		border-style: dashed;
	}

	.sejarah-decor__grid {
		position: absolute;
		top: 10%;
		right: 5%;
		width: 6rem;
		height: 6rem;
		opacity: 0.08;
		background-image:
			linear-gradient(var(--color-primary, #6eaee8) 1px, transparent 1px),
			linear-gradient(90deg, var(--color-primary, #6eaee8) 1px, transparent 1px);
		background-size: 1rem 1rem;
	}

	.sejarah-decor__accent {
		position: absolute;
		bottom: 15%;
		left: 3%;
		width: 3rem;
		height: 3rem;
		border-left: 2px solid var(--color-primary, #6eaee8);
		border-bottom: 2px solid var(--color-primary, #6eaee8);
		opacity: 0.15;
	}

	/* ==========================================================
	   STRUKTUR DECOR
	   ========================================================== */
	.struktur-decor {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.struktur-decor__hex {
		position: absolute;
		width: 5rem;
		height: 5rem;
		opacity: 0.12;
	}

	.struktur-decor__hex::before {
		content: '';
		position: absolute;
		inset: 0;
		clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
		background: var(--color-primary, #6eaee8);
		opacity: 0.25;
	}

	.struktur-decor__hex::after {
		content: '';
		position: absolute;
		inset: 4px;
		clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
		background: var(--color-surface-2, #f8fafc);
	}

	.struktur-decor__hex--1 {
		top: 8%;
		right: 10%;
		width: 5rem;
		height: 5rem;
	}

	.struktur-decor__hex--2 {
		bottom: 12%;
		left: 6%;
		width: 3.5rem;
		height: 3.5rem;
		opacity: 0.08;
	}

	.struktur-decor__orbit {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 36rem;
		height: 36rem;
		border-radius: 50%;
		border: 1.5px dashed var(--color-primary, #6eaee8);
		opacity: 0.08;
	}

	.struktur-decor__scanline {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0.03;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 4px,
			var(--color-primary, #6eaee8) 4px,
			var(--color-primary, #6eaee8) 5px
		);
	}

	.struktur-decor__corner {
		position: absolute;
		width: 4rem;
		height: 4rem;
	}

	.struktur-decor__corner--tl {
		top: 2rem;
		left: 2rem;
		border-top: 2.5px solid var(--color-primary, #6eaee8);
		border-left: 2.5px solid var(--color-primary, #6eaee8);
		opacity: 0.2;
	}

	.struktur-decor__corner--br {
		bottom: 2rem;
		right: 2rem;
		border-bottom: 2.5px solid var(--color-primary, #6eaee8);
		border-right: 2.5px solid var(--color-primary, #6eaee8);
		opacity: 0.2;
	}

	/* ==========================================================
	   CTA DECOR
	   ========================================================== */
	.cta-decor {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.cta-decor__ring {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 32rem;
		height: 32rem;
		border-radius: 50%;
		border: 1.5px solid var(--color-primary, #6eaee8);
		opacity: 0.08;
	}

	.cta-decor__ray {
		position: absolute;
		top: 50%;
		left: 50%;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--color-primary, #6eaee8), transparent);
		opacity: 0.1;
		transform-origin: left center;
	}

	.cta-decor__ray--1 {
		width: 20rem;
		transform: translate(-50%, -50%) rotate(-20deg);
	}

	.cta-decor__ray--2 {
		width: 16rem;
		transform: translate(-50%, -50%) rotate(15deg);
	}

	.cta-decor__ray--3 {
		width: 24rem;
		transform: translate(-50%, -50%) rotate(45deg);
		opacity: 0.07;
	}

	/* Hide heavy decor on mobile for performance */
	@media (max-width: 767px) {
		.page-decor__ring--1 { width: 16rem; height: 16rem; top: -6rem; right: -6rem; }
		.page-decor__ring--2 { display: none; }
		.page-decor__logo { width: 14rem; height: 14rem; opacity: 0.04; }
		.struktur-decor__orbit { width: 20rem; height: 20rem; }
		.struktur-decor__scanline { display: none; }
		.sejarah-decor__arc--1 { width: 24rem; height: 24rem; }
		.sejarah-decor__grid { display: none; }
	}

	:global(.div-card.active-div) {
		border-color: var(--color-primary, #6eaee8);
		box-shadow: 0 10px 25px -5px rgba(110, 174, 232, 0.25), 0 8px 10px -6px rgba(110, 174, 232, 0.25);
		background: linear-gradient(to bottom right, #ffffff, var(--color-surface-3, #f0f8ff)) !important;
		transform: scale(1.03);
	}
</style>
