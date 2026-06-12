<script lang="ts">
	import FloatingNavbar from '$lib/components/FloatingNavbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Button from '$lib/components/Button.svelte';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * Profil MAPFLOFA — Visi, Misi, Sejarah, Struktur Organisasi.
	 *
	 * Static for now; the content maps to `site_content` (visi/misi/sejarah)
	 * and `members` (struktur organisasi) in src/lib/db/schema.ts. Wire to a
	 * `+page.server.ts` load + admin forms to make it editable.
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

	// Struktur organisasi (bagan sederhana)
	const ketua = { name: 'Ketua Umum', sub: 'Pemimpin organisasi' };
	const wakil = { name: 'Wakil Ketua', sub: 'Pendamping ketua' };
	const inti = [
		{ name: 'Sekretaris', sub: 'Administrasi & surat' },
		{ name: 'Bendahara', sub: 'Keuangan organisasi' }
	];
	const divisi: { name: string; sub: string; icon: IconName }[] = [
		{ name: 'Divisi Konservasi', sub: 'Penanaman & pelestarian', icon: 'tree' },
		{ name: 'Divisi Edukasi', sub: 'Sosialisasi & kampanye', icon: 'megaphone' },
		{ name: 'Divisi Ekspedisi', sub: 'Pendataan satwa & alam', icon: 'compass' },
		{ name: 'Divisi Humas & Media', sub: 'Publikasi & kerja sama', icon: 'camera' }
	];
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

	<!-- ===== Struktur Organisasi ===== -->
	<section id="struktur" class="bg-surface-2 py-16 md:py-24 px-4 md:px-8 scroll-mt-24">
		<div class="max-w-5xl mx-auto">
			<div use:reveal={{ from: 'up' }} class="text-center max-w-2xl mx-auto">
				<div class="text-xs font-bold uppercase tracking-widest text-primary">Struktur Organisasi</div>
				<h2 class="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-ink">
					Bagan Kepengurusan
				</h2>
				<p class="mt-3 text-muted text-sm">Periode kepengurusan aktif MAPFLOFA</p>
			</div>

			<!-- Org Chart -->
			<div use:reveal={{ from: 'up', delay: 80 }} class="org-chart">
				<!-- Level 1: Ketua -->
				<div class="org-level">
					<div class="org-card org-card--lead">
						<div class="org-card__icon">
							<Icon name="shield" size={20} />
						</div>
						<div class="org-card__info">
							<div class="org-card__role">{ketua.name}</div>
							<div class="org-card__desc">{ketua.sub}</div>
						</div>
					</div>
				</div>

				<!-- Connector -->
				<div class="org-connector">
					<div class="org-connector__line"></div>
				</div>

				<!-- Level 2: Wakil -->
				<div class="org-level">
					<div class="org-card">
						<div class="org-card__icon">
							<Icon name="users" size={18} />
						</div>
						<div class="org-card__info">
							<div class="org-card__role">{wakil.name}</div>
							<div class="org-card__desc">{wakil.sub}</div>
						</div>
					</div>
				</div>

				<!-- Connector with branch -->
				<div class="org-connector">
					<div class="org-connector__line"></div>
					<div class="org-connector__branch"></div>
				</div>

				<!-- Level 3: Sekretaris & Bendahara -->
				<div class="org-level org-level--dual">
					{#each inti as p, i}
						<div class="org-card">
							<div class="org-card__icon">
								<Icon name={i === 0 ? 'book' : 'sprout'} size={18} />
							</div>
							<div class="org-card__info">
								<div class="org-card__role">{p.name}</div>
								<div class="org-card__desc">{p.sub}</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Connector with branch -->
				<div class="org-connector">
					<div class="org-connector__line"></div>
					<div class="org-connector__branch org-connector__branch--wide"></div>
				</div>

				<!-- Level 4: Divisi -->
				<div class="org-level org-level--divisions">
					{#each divisi as d, i}
						<div use:reveal={{ from: 'up', delay: 120 + i * 60 }} class="org-card org-card--division">
							<div class="org-card__icon org-card__icon--div">
								<Icon name={d.icon} size={20} />
							</div>
							<div class="org-card__info">
								<div class="org-card__role">{d.name}</div>
								<div class="org-card__desc">{d.sub}</div>
							</div>
						</div>
					{/each}
				</div>
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
	/* ===== Org Chart: Clean hierarchical layout ===== */
	.org-chart {
		margin-top: 3rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
	}

	/* Levels */
	.org-level {
		display: flex;
		justify-content: center;
		gap: 1rem;
		width: 100%;
	}

	.org-level--dual {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		max-width: 28rem;
	}

	.org-level--divisions {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		width: 100%;
	}

	@media (min-width: 768px) {
		.org-level--divisions {
			grid-template-columns: repeat(4, 1fr);
			gap: 1rem;
		}
	}

	/* Connector lines */
	.org-connector {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0;
	}

	.org-connector__line {
		width: 2px;
		height: 1.5rem;
		background: var(--color-primary, #6eaee8);
		opacity: 0.3;
	}

	.org-connector__branch {
		width: 14rem;
		height: 2px;
		background: var(--color-primary, #6eaee8);
		opacity: 0.2;
		position: relative;
	}

	.org-connector__branch::before,
	.org-connector__branch::after {
		content: '';
		position: absolute;
		top: 0;
		width: 2px;
		height: 1.5rem;
		background: var(--color-primary, #6eaee8);
		opacity: 1;
	}

	.org-connector__branch::before { left: 0; }
	.org-connector__branch::after { right: 0; }

	.org-connector__branch--wide {
		width: 100%;
		max-width: 48rem;
	}

	.org-connector__branch--wide::before { left: 12.5%; }
	.org-connector__branch--wide::after { right: 12.5%; }

	@media (min-width: 768px) {
		.org-connector__branch--wide::before { left: 12.5%; }
		.org-connector__branch--wide::after { right: 12.5%; }
	}

	/* Cards */
	.org-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: #ffffff;
		border: 1px solid var(--color-line, #e2e8f0);
		border-radius: 0.875rem;
		padding: 0.875rem 1.125rem;
		text-align: left;
		transition: border-color 200ms ease, box-shadow 200ms ease;
	}

	.org-card:hover {
		border-color: var(--color-primary, #6eaee8);
		box-shadow: 0 4px 16px rgba(110, 174, 232, 0.1);
	}

	.org-card--lead {
		padding: 1rem 1.5rem;
		border-color: var(--color-primary, #6eaee8);
		box-shadow: 0 4px 20px rgba(110, 174, 232, 0.12);
	}

	.org-card--division {
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1.25rem 1rem;
		gap: 0.5rem;
	}

	.org-card__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.625rem;
		background: var(--color-surface-3, #f1f5f9);
		color: var(--color-primary, #6eaee8);
		flex-shrink: 0;
	}

	.org-card--lead .org-card__icon {
		background: var(--color-primary, #6eaee8);
		color: #fff;
	}

	.org-card__icon--div {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.75rem;
	}

	.org-card__info {
		min-width: 0;
	}

	.org-card__role {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.875rem;
		color: var(--color-ink, #1e293b);
		line-height: 1.3;
	}

	.org-card--lead .org-card__role {
		font-size: 1rem;
	}

	.org-card__desc {
		font-size: 0.6875rem;
		color: var(--color-muted, #64748b);
		margin-top: 0.125rem;
	}
</style>
