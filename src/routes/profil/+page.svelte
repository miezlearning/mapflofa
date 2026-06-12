<script lang="ts">
	import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Button from '$lib/components/Button.svelte';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * Profil MAPFLOFA — Visi, Misi, Sejarah, Struktur Organisasi.
	 */
	const misi = [
		'Melaksanakan kegiatan konservasi flora dan fauna secara berkelanjutan.',
		'Mengedukasi mahasiswa dan masyarakat tentang pentingnya menjaga lingkungan.',
		'Melakukan pendataan dan pelestarian satwa serta tumbuhan endemik.',
		'Membangun kolaborasi dengan komunitas, kampus, dan lembaga konservasi.',
		'Menumbuhkan rasa cinta terhadap alam melalui aksi nyata dan ekspedisi.'
	];

	const nilai: { icon: IconName; title: string; desc: string }[] = [
		{ icon: 'sprout', title: 'Lestari', desc: 'Menjaga alam untuk generasi mendatang' },
		{ icon: 'users', title: 'Gotong Royong', desc: 'Bergerak bersama, berdampak lebih besar' },
		{ icon: 'book', title: 'Edukatif', desc: 'Berbagi ilmu dan kesadaran lingkungan' },
		{ icon: 'shield', title: 'Integritas', desc: 'Jujur dan bertanggung jawab pada bumi' }
	];

	// ===== Struktur Organisasi — Synchronized Carousel Data =====
	type OrgMember = {
		id: number;
		role: string;
		description: string;
		name: string;
		imageUrl: string;
	};

	const orgMembers: OrgMember[] = [
		{ id: 1, role: 'Ketua Umum', description: 'Pemimpin organisasi', name: 'Ahmad Fauzan', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
		{ id: 2, role: 'Wakil Ketua', description: 'Pendamping ketua', name: 'Rizki Pratama', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop' },
		{ id: 3, role: 'Sekretaris', description: 'Administrasi & surat', name: 'Siti Nurhaliza', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=600&auto=format&fit=crop' },
		{ id: 4, role: 'Bendahara', description: 'Keuangan organisasi', name: 'Dewi Anggraini', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop' },
		{ id: 5, role: 'Divisi Konservasi', description: 'Penanaman & pelestarian', name: 'Budi Santoso', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop' },
		{ id: 6, role: 'Divisi Edukasi', description: 'Sosialisasi & kampanye', name: 'Anisa Putri', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
		{ id: 7, role: 'Divisi Ekspedisi', description: 'Pendataan satwa & alam', name: 'Reza Mahendra', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop' },
		{ id: 8, role: 'Divisi Humas & Media', description: 'Publikasi & kerja sama', name: 'Maya Sari', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop' }
	];

	let activeIndex = $state(0);
	let isTransitioning = $state(false);

	const current = $derived(orgMembers[activeIndex]);
	const nextIndex = $derived((activeIndex + 1) % orgMembers.length);
	const nextMember = $derived(orgMembers[nextIndex]);

	function goTo(index: number) {
		if (index === activeIndex || isTransitioning) return;
		isTransitioning = true;
		activeIndex = index;
		setTimeout(() => (isTransitioning = false), 400);
	}

	function goNext() {
		goTo(nextIndex);
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
	<section class="bg-surface-2 pt-32 md:pt-40 pb-16 md:pb-20 px-4 md:px-8">
		<div class="max-w-7xl mx-auto">
			<div use:reveal={{ from: 'up' }} class="max-w-2xl">
				<div class="text-xs font-bold uppercase tracking-widest text-primary">Profil Organisasi</div>
				<h1 class="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl text-ink leading-[1.05]">
					Tentang MAPFLOFA
				</h1>
				<p class="mt-5 text-muted text-base md:text-lg leading-relaxed">
					Mahasiswa Penyayang Flora Fauna (MAPFLOFA) adalah organisasi mahasiswa pecinta alam
					yang berfokus pada konservasi flora, fauna, dan kelestarian lingkungan.
				</p>
			</div>
		</div>
	</section>

	<!-- ===== Visi & Misi ===== -->
	<section class="py-16 md:py-24 px-4 md:px-8">
		<div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
			<!-- Visi -->
			<div
				use:reveal={{ from: 'left' }}
				class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-700 text-white p-8 md:p-12 shadow-xl shadow-primary/20"
			>
				<div aria-hidden="true" class="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl"></div>
				<div class="relative">
					<div class="text-xs font-bold uppercase tracking-widest text-white/70">Visi</div>
					<p class="mt-4 font-display font-extrabold text-2xl md:text-3xl leading-snug">
						Menjadi wadah mahasiswa yang aktif menjaga keanekaragaman hayati dan
						menumbuhkan budaya cinta lingkungan yang berkelanjutan.
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

	<!-- ===== Sejarah ===== -->
	<section class="py-16 md:py-24 px-4 md:px-8">
		<div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
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
				<p class="mt-5 text-muted text-base md:text-lg leading-relaxed">
					MAPFLOFA lahir dari sekelompok mahasiswa yang resah melihat kerusakan lingkungan dan
					menyusutnya habitat satwa di sekitar kampus. Berawal dari kegiatan penanaman pohon
					kecil-kecilan, organisasi ini tumbuh menjadi komunitas konservasi yang aktif.
				</p>
				<p class="mt-4 text-muted text-base md:text-lg leading-relaxed">
					Kini MAPFLOFA rutin menggelar aksi penghijauan, edukasi lingkungan, dan ekspedisi
					pendataan flora fauna bersama berbagai mitra.
				</p>
			</div>
		</div>
	</section>

	<!-- ===== Struktur Organisasi — Synchronized Hero Carousel ===== -->
	<section id="struktur" class="sc-section scroll-mt-24">
		<div class="sc-container">
			<!-- LEFT COLUMN: Text Info + Pagination -->
			<div class="sc-left">
				<!-- Vertical Pagination Dots -->
				<div class="sc-pagination" aria-label="Navigasi pengurus">
					<div class="sc-pagination__track"></div>
					{#each orgMembers as member, i (member.id)}
						<button
							type="button"
							class="sc-pagination__dot"
							class:active={i === activeIndex}
							onclick={() => goTo(i)}
							aria-label={`Lihat ${member.role}`}
							aria-current={i === activeIndex ? 'true' : undefined}
						>
							<span class="sc-pagination__dot-inner"></span>
						</button>
					{/each}
				</div>

				<!-- Text Content -->
				<div class="sc-info">
					<div class="sc-info__label">PENGURUS MAPFLOFA</div>

					{#key activeIndex}
						<div class="sc-info__content">
							<h2 class="sc-info__role">{current.role}</h2>
							<p class="sc-info__desc">{current.description}</p>
							<div class="sc-info__name">{current.name}</div>
						</div>
					{/key}

					<div class="sc-info__counter">
						<span class="sc-info__counter-current">{String(activeIndex + 1).padStart(2, '0')}</span>
						<span class="sc-info__counter-sep">/</span>
						<span class="sc-info__counter-total">{String(orgMembers.length).padStart(2, '0')}</span>
					</div>

					<button type="button" class="sc-cta" onclick={goNext}>
						Profil Lengkap
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M5 12h14M13 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			</div>

			<!-- RIGHT COLUMN: Visual Carousel -->
			<div class="sc-right">
				<!-- Decorative elements -->
				<div class="sc-decor sc-decor--circle" aria-hidden="true"></div>
				<div class="sc-decor sc-decor--ring" aria-hidden="true"></div>

				<!-- Main image -->
				<div class="sc-visual">
					{#each orgMembers as member, i (member.id)}
						<div
							class="sc-visual__slide"
							class:active={i === activeIndex}
						>
							<img
								src={member.imageUrl}
								alt={member.name}
								loading={i < 2 ? 'eager' : 'lazy'}
							/>
						</div>
					{/each}
				</div>

				<!-- Next/Mini Card -->
				<button type="button" class="sc-next-card" onclick={goNext}>
					<div class="sc-next-card__img">
						<img src={nextMember.imageUrl} alt={nextMember.name} />
					</div>
					<div class="sc-next-card__info">
						<div class="sc-next-card__label">Selanjutnya</div>
						<div class="sc-next-card__name">{nextMember.name}</div>
					</div>
					<div class="sc-next-card__arrow">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<path d="M5 12h14M13 5l7 7-7 7" />
						</svg>
					</div>
				</button>
			</div>
		</div>
	</section>

	<!-- ===== CTA ===== -->
	<section class="py-16 md:py-24 px-4 md:px-8">
		<div class="max-w-7xl mx-auto text-center">
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
	   Synchronized Hero Carousel — Struktur Organisasi
	   ----------------------------------------------------------
	   Color variables used (swap to match your brand):
	   --color-primary     : #6eaee8  (links, accents)
	   --color-primary-600 : #4f97d6  (hover)
	   --color-ink         : #1e293b  (headings)
	   --color-muted       : #64748b  (secondary text)
	   --color-line        : #e2e8f0  (borders)
	   --color-surface-2   : #f8fafc  (section bg)
	   --color-surface-3   : #f1f5f9  (card bg)
	   ========================================================== */

	.sc-section {
		background: var(--color-surface, #ffffff);
		padding: 5rem 1.5rem;
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.sc-section {
			padding: 6rem 2rem;
		}
	}

	.sc-container {
		max-width: 72rem;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
		align-items: center;
		min-height: 28rem;
	}

	@media (min-width: 768px) {
		.sc-container {
			grid-template-columns: 1fr 1.1fr;
			gap: 3rem;
			min-height: 32rem;
		}
	}

	@media (min-width: 1024px) {
		.sc-container {
			gap: 4rem;
			min-height: 36rem;
		}
	}

	/* ===== LEFT COLUMN ===== */
	.sc-left {
		display: flex;
		gap: 2rem;
		align-items: stretch;
	}

	/* --- Pagination --- */
	.sc-pagination {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
	}

	.sc-pagination__track {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;
		width: 2px;
		background: var(--color-line, #e2e8f0);
		transform: translateX(-50%);
		z-index: 0;
	}

	.sc-pagination__dot {
		position: relative;
		z-index: 1;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		border: 0;
		background: transparent;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		transition: transform 200ms ease;
	}

	.sc-pagination__dot:hover {
		transform: scale(1.2);
	}

	.sc-pagination__dot:focus-visible {
		outline: 2px solid var(--color-primary, #6eaee8);
		outline-offset: 2px;
		border-radius: 50%;
	}

	.sc-pagination__dot-inner {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--color-line, #e2e8f0);
		transition: all 250ms ease;
	}

	.sc-pagination__dot.active .sc-pagination__dot-inner {
		width: 0.625rem;
		height: 0.625rem;
		background: var(--color-primary, #6eaee8);
		box-shadow: 0 0 0 4px rgba(110, 174, 232, 0.15);
	}

	/* --- Info Text --- */
	.sc-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-width: 0;
	}

	.sc-info__label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-primary, #6eaee8);
		margin-bottom: 1.25rem;
	}

	.sc-info__content {
		animation: sc-fadeIn 350ms ease-out;
	}

	@keyframes sc-fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.sc-info__role {
		font-family: var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif);
		font-size: 2rem;
		font-weight: 800;
		color: var(--color-ink, #1e293b);
		letter-spacing: -0.02em;
		line-height: 1.15;
		margin: 0;
	}

	@media (min-width: 768px) {
		.sc-info__role {
			font-size: 2.5rem;
		}
	}

	.sc-info__desc {
		font-size: 1rem;
		color: var(--color-muted, #64748b);
		margin: 0.5rem 0 0;
		line-height: 1.5;
	}

	.sc-info__name {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-primary, #6eaee8);
		margin-top: 1.5rem;
	}

	.sc-info__counter {
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
		margin-top: 2rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.8125rem;
		color: var(--color-muted, #64748b);
	}

	.sc-info__counter-current {
		font-weight: 700;
		font-size: 1.125rem;
		color: var(--color-ink, #1e293b);
	}

	/* --- CTA Button --- */
	.sc-cta {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 0.75rem;
		border: 1px solid var(--color-primary, #6eaee8);
		background: transparent;
		color: var(--color-primary, #6eaee8);
		font-weight: 700;
		font-size: 0.8125rem;
		cursor: pointer;
		transition: all 200ms ease;
		width: fit-content;
	}

	.sc-cta:hover {
		background: var(--color-primary, #6eaee8);
		color: #fff;
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(110, 174, 232, 0.25);
	}

	.sc-cta:focus-visible {
		outline: 2px solid var(--color-primary, #6eaee8);
		outline-offset: 2px;
	}

	/* ===== RIGHT COLUMN ===== */
	.sc-right {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 20rem;
	}

	@media (min-width: 768px) {
		.sc-right {
			min-height: 28rem;
		}
	}

	/* --- Decorative elements --- */
	.sc-decor {
		position: absolute;
		pointer-events: none;
	}

	.sc-decor--circle {
		width: 85%;
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--color-surface-2, #f8fafc);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.sc-decor--ring {
		width: 70%;
		aspect-ratio: 1;
		border-radius: 50%;
		border: 2px dashed var(--color-line, #e2e8f0);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		opacity: 0.6;
	}

	/* --- Main Visual --- */
	.sc-visual {
		position: relative;
		width: 70%;
		aspect-ratio: 3/4;
		border-radius: 1.5rem;
		overflow: hidden;
		box-shadow: 0 20px 50px -16px rgba(0, 0, 0, 0.12);
		z-index: 2;
	}

	.sc-visual__slide {
		position: absolute;
		inset: 0;
		opacity: 0;
		transform: scale(1.04);
		transition: opacity 400ms ease, transform 400ms ease;
	}

	.sc-visual__slide.active {
		opacity: 1;
		transform: scale(1);
	}

	.sc-visual__slide img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* --- Next/Mini Card --- */
	.sc-next-card {
		position: absolute;
		bottom: 1rem;
		right: 0;
		z-index: 3;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: #fff;
		border: 1px solid var(--color-line, #e2e8f0);
		border-radius: 1rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
		cursor: pointer;
		transition: all 200ms ease;
		max-width: 14rem;
	}

	.sc-next-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
		border-color: var(--color-primary, #6eaee8);
	}

	.sc-next-card:focus-visible {
		outline: 2px solid var(--color-primary, #6eaee8);
		outline-offset: 2px;
	}

	.sc-next-card__img {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.625rem;
		overflow: hidden;
		flex-shrink: 0;
	}

	.sc-next-card__img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.sc-next-card__info {
		flex: 1;
		min-width: 0;
	}

	.sc-next-card__label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted, #64748b);
		font-weight: 600;
	}

	.sc-next-card__name {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--color-ink, #1e293b);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sc-next-card__arrow {
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 50%;
		background: var(--color-surface-3, #f1f5f9);
		color: var(--color-primary, #6eaee8);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: background 200ms ease, color 200ms ease;
	}

	.sc-next-card:hover .sc-next-card__arrow {
		background: var(--color-primary, #6eaee8);
		color: #fff;
	}

	/* ===== Mobile: Stack vertically ===== */
	@media (max-width: 767px) {
		.sc-left {
			order: 2;
		}
		.sc-right {
			order: 1;
			min-height: 18rem;
		}
		.sc-pagination {
			display: none;
		}
		.sc-next-card {
			bottom: 0.5rem;
			right: 0.5rem;
		}
		.sc-visual {
			width: 80%;
		}
		.sc-info__role {
			font-size: 1.75rem;
		}
	}
</style>
