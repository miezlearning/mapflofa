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

	// ===== Struktur Organisasi — Character Select + Detail Zoom =====
	type OrgMember = {
		id: number;
		role: string;
		description: string;
		name: string;
		imageUrl: string;
		tupoksi: string[];
	};

	const orgMembers: OrgMember[] = [
		{
			id: 1,
			role: 'Ketua Umum',
			description: 'Pemimpin organisasi',
			name: 'Ahmad Fauzan',
			imageUrl: 'https://diskominfo.samarindakota.go.id/storage/Personil/2025-09/29/ea6077b4-c49a-11eb-bf1d-b06ebf3af48c.png',
			tupoksi: [
				'Memimpin dan mengarahkan jalannya organisasi sesuai visi dan misi MAPFLOFA.',
				'Mengambil keputusan strategis terkait program kerja dan kebijakan organisasi.',
				'Mewakili organisasi dalam hubungan dengan kampus, mitra, dan lembaga konservasi.',
				'Mengkoordinasikan seluruh pengurus dan divisi agar berjalan selaras.',
				'Bertanggung jawab atas keberlangsungan dan perkembangan organisasi.'
			]
		},
		{
			id: 2,
			role: 'Wakil Ketua',
			description: 'Pendamping ketua',
			name: 'Rizki Pratama',
			imageUrl: 'https://diskominfo.samarindakota.go.id/storage/Personil/2021-06/27/ea60a888-c49a-11eb-9a31-b06ebf3af48c.png',
			tupoksi: [
				'Mendampingi dan membantu ketua dalam menjalankan tugas organisasi.',
				'Menggantikan peran ketua apabila berhalangan hadir.',
				'Mengawasi pelaksanaan program kerja tiap divisi.',
				'Menjadi penghubung antara ketua dan pengurus harian.'
			]
		},
		{
			id: 3,
			role: 'Sekretaris',
			description: 'Administrasi & surat',
			name: 'Siti Nurhaliza',
			imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=700&auto=format&fit=crop',
			tupoksi: [
				'Mengelola seluruh administrasi dan surat-menyurat organisasi.',
				'Menyusun notulen rapat dan mendokumentasikan kegiatan.',
				'Mengarsipkan dokumen penting organisasi secara rapi.',
				'Membantu ketua dalam penyusunan laporan kegiatan.'
			]
		},
		{
			id: 4,
			role: 'Bendahara',
			description: 'Keuangan organisasi',
			name: 'Dewi Anggraini',
			imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=700&auto=format&fit=crop',
			tupoksi: [
				'Mengelola dan mencatat seluruh pemasukan dan pengeluaran organisasi.',
				'Menyusun laporan keuangan secara transparan dan berkala.',
				'Mengatur anggaran untuk setiap kegiatan organisasi.',
				'Bertanggung jawab atas keamanan dana organisasi.'
			]
		},
		{
			id: 5,
			role: 'Divisi Konservasi',
			description: 'Penanaman & pelestarian',
			name: 'Budi Santoso',
			imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=700&auto=format&fit=crop',
			tupoksi: [
				'Merencanakan dan melaksanakan kegiatan penanaman pohon dan reboisasi.',
				'Melakukan pelestarian flora dan fauna endemik di sekitar kampus.',
				'Menjalin kerja sama dengan lembaga konservasi terkait.',
				'Memantau perkembangan area konservasi yang dikelola.'
			]
		},
		{
			id: 6,
			role: 'Divisi Edukasi',
			description: 'Sosialisasi & kampanye',
			name: 'Anisa Putri',
			imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=700&auto=format&fit=crop',
			tupoksi: [
				'Menyelenggarakan sosialisasi dan kampanye lingkungan.',
				'Membuat materi edukasi tentang konservasi flora dan fauna.',
				'Mengadakan kelas atau workshop untuk anggota dan masyarakat.',
				'Menumbuhkan kesadaran lingkungan di kalangan mahasiswa.'
			]
		},
		{
			id: 7,
			role: 'Divisi Ekspedisi',
			description: 'Pendataan satwa & alam',
			name: 'Reza Mahendra',
			imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=700&auto=format&fit=crop',
			tupoksi: [
				'Merencanakan dan memimpin ekspedisi pendataan flora dan fauna.',
				'Mendokumentasikan temuan spesies di alam liar.',
				'Menyusun laporan hasil ekspedisi dan pendataan.',
				'Memastikan keselamatan tim selama kegiatan lapangan.'
			]
		},
		{
			id: 8,
			role: 'Divisi Humas & Media',
			description: 'Publikasi & kerja sama',
			name: 'Maya Sari',
			imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=700&auto=format&fit=crop',
			tupoksi: [
				'Mengelola publikasi dan media sosial organisasi.',
				'Mendokumentasikan setiap kegiatan dalam bentuk foto dan video.',
				'Menjalin kerja sama dan komunikasi dengan pihak eksternal.',
				'Mempromosikan kegiatan dan citra positif organisasi.'
			]
		}
	];

	let activeIndex = $state(0);
	let detailOpen = $state(false);

	const current = $derived(orgMembers[activeIndex]);
	const nextIndex = $derived((activeIndex + 1) % orgMembers.length);
	const nextMember = $derived(orgMembers[nextIndex]);

	function goTo(index: number) {
		activeIndex = ((index % orgMembers.length) + orgMembers.length) % orgMembers.length;
	}

	function goNext() {
		goTo(activeIndex + 1);
	}

	function openDetail() {
		detailOpen = true;
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

	<!-- ===== Struktur Organisasi — Character Select + Detail Zoom ===== -->
	<section id="struktur" class="sc-section scroll-mt-24" class:is-detail={detailOpen}>
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
								class:active={i === activeIndex}
								onclick={() => goTo(i)}
								aria-label={`Lihat ${member.role}`}
								aria-current={i === activeIndex ? 'true' : undefined}
							></button>
						{/each}
					</div>

					<!-- Text info -->
					<div class="sc-text">
						<div class="sc-text__org">Pengurus MAPFLOFA</div>
						{#key activeIndex}
							<div class="sc-text__content">
								<div class="sc-text__role">{current.role}</div>
								<h2 class="sc-text__name">{current.name}</h2>
								<p class="sc-text__desc">{current.description}</p>
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

						<!-- Main person image (fixed frame) -->
						<button type="button" class="sc-person" onclick={openDetail} aria-label={`Lihat detail ${current.name}`}>
							<div class="sc-person__frame">
								{#key activeIndex}
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
						<button type="button" class="sc-bio sc-bio--next" onclick={goNext}>
							<span class="sc-bio__label">Selanjutnya</span>
							<span class="sc-bio__name">{nextMember.name}</span>
							<span class="sc-bio__arrow">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
							</span>
						</button>
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

						<div class="sc-detail__label">Tugas Pokok &amp; Fungsi</div>
						<ol class="sc-tupoksi">
							{#each current.tupoksi as task, i (i)}
								<li>{task}</li>
							{/each}
						</ol>
					</div>
				</div>
			{/if}
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
		.sc-right { order: 1; height: 22rem; }
		.sc-dots { display: none; }
		.sc-text__name { font-size: 1.75rem; }
		.sc-peek { display: none; }
		.sc-decor { transform: translateX(-50%); }
		.sc-bios { bottom: 0.5rem; }
		.sc-detail__visual { min-height: 18rem; }
	}
</style>
