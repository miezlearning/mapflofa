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
				<div class="text-xs font-bold uppercase tracking-widest text-accent">Profil Organisasi</div>
				<h1 class="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl text-primary leading-[1.05]">
					Tentang MAPFLOFA
				</h1>
				<p class="mt-5 text-slate-600 text-base md:text-lg leading-relaxed">
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
				<div class="text-xs font-bold uppercase tracking-widest text-accent">Misi</div>
				<ul class="mt-5 space-y-4">
					{#each misi as m, i}
						<li class="flex gap-4">
							<span class="w-8 h-8 shrink-0 rounded-full bg-accent/10 text-accent grid place-items-center font-bold text-sm">
								{i + 1}
							</span>
							<span class="text-slate-600 text-base leading-relaxed pt-1">{m}</span>
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
				<div class="text-xs font-bold uppercase tracking-widest text-accent">Nilai Kami</div>
				<h2 class="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-primary">
					Prinsip yang kami pegang
				</h2>
			</div>
			<div class="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
				{#each nilai as n, i}
					<div
						use:reveal={{ from: 'up', delay: i * 80 }}
						class="rounded-3xl bg-white border border-slate-100 p-6 text-center shadow-sm
						       transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
					>
						<div class="w-12 h-12 mx-auto rounded-2xl bg-accent/10 text-accent grid place-items-center">
							<Icon name={n.icon} size={24} />
						</div>
						<div class="mt-3 font-display font-bold text-primary">{n.title}</div>
						<div class="mt-1 text-xs text-slate-500 leading-relaxed">{n.desc}</div>
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
				<div class="text-xs font-bold uppercase tracking-widest text-accent">Sejarah</div>
				<h2 class="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-primary leading-tight">
					Berawal dari kepedulian
				</h2>
				<p class="mt-5 text-slate-600 text-base md:text-lg leading-relaxed">
					MAPFLOFA lahir dari sekelompok mahasiswa yang resah melihat kerusakan lingkungan dan
					menyusutnya habitat satwa di sekitar kampus. Berawal dari kegiatan penanaman pohon
					kecil-kecilan, organisasi ini tumbuh menjadi komunitas konservasi yang aktif.
				</p>
				<p class="mt-4 text-slate-600 text-base md:text-lg leading-relaxed">
					Kini MAPFLOFA rutin menggelar aksi penghijauan, edukasi lingkungan, dan ekspedisi
					pendataan flora fauna bersama berbagai mitra.
				</p>
			</div>
		</div>
	</section>

	<!-- ===== Struktur Organisasi ===== -->
	<section id="struktur" class="bg-surface-2 py-16 md:py-24 px-4 md:px-8 scroll-mt-24">
		<div class="max-w-7xl mx-auto">
			<div use:reveal={{ from: 'up' }} class="text-center max-w-2xl mx-auto">
				<div class="text-xs font-bold uppercase tracking-widest text-accent">Struktur Organisasi</div>
				<h2 class="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-primary">
					Bagan kepengurusan
				</h2>
			</div>

			<!-- Bagan -->
			<div use:reveal={{ from: 'up', delay: 80 }} class="mt-14 flex flex-col items-center">
				<!-- Ketua -->
				<div class="org-node w-64 max-w-full">
					<div class="font-display font-bold text-primary">{ketua.name}</div>
					<div class="text-xs text-slate-500 mt-0.5">{ketua.sub}</div>
				</div>
				<div class="org-line"></div>

				<!-- Wakil -->
				<div class="org-node w-60 max-w-full">
					<div class="font-display font-bold text-primary">{wakil.name}</div>
					<div class="text-xs text-slate-500 mt-0.5">{wakil.sub}</div>
				</div>
				<div class="org-line"></div>

				<!-- Sekretaris & Bendahara -->
				<div class="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-md">
					{#each inti as p}
						<div class="org-node">
							<div class="font-display font-bold text-primary text-sm md:text-base">{p.name}</div>
							<div class="text-xs text-slate-500 mt-0.5">{p.sub}</div>
						</div>
					{/each}
				</div>
				<div class="org-line"></div>

				<!-- Divisi -->
				<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
					{#each divisi as d, i}
						<div use:reveal={{ from: 'up', delay: i * 70 }} class="org-node org-node--division">
							<div class="w-11 h-11 mx-auto rounded-xl bg-primary/5 text-primary grid place-items-center">
								<Icon name={d.icon} size={22} />
							</div>
							<div class="mt-2 font-display font-bold text-primary text-sm md:text-base">{d.name}</div>
							<div class="text-xs text-slate-500 mt-0.5">{d.sub}</div>
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
			<p class="mt-4 text-slate-600 text-base md:text-lg max-w-xl mx-auto">
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
	.org-node {
		background: #ffffff;
		border: 1px solid var(--color-line, #e3eef7);
		border-radius: 1.25rem;
		padding: 1rem 1.25rem;
		text-align: center;
		box-shadow: 0 8px 24px -16px rgba(62, 124, 184, 0.5);
	}
	.org-node--division {
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}
	.org-node--division:hover {
		transform: translateY(-4px);
		box-shadow: 0 16px 32px -18px rgba(62, 124, 184, 0.6);
	}
	.org-line {
		width: 2px;
		height: 2rem;
		background: var(--color-primary, #6eaee8);
		opacity: 0.4;
	}
</style>
