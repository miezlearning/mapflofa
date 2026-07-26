<script lang="ts">
	import { page } from '$app/state';

	type Props = {
		title?: string;
		description?: string;
		image?: string | null;
		imageAlt?: string;
		type?: 'website' | 'article' | 'profile';
		publishedTime?: string;
		modifiedTime?: string;
		author?: string;
		category?: string;
		jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
		noindex?: boolean;
	};

	let {
		title = 'MAPFLOFA — Mahasiswa Penyayang Flora Fauna',
		description = 'Website resmi MAPFLOFA (Mahasiswa Penyayang Flora Fauna). Komunitas mahasiswa pecinta alam yang bergerak untuk konservasi flora, fauna, dan pelestarian lingkungan.',
		image = '/logo.png',
		imageAlt = '',
		type = 'website',
		publishedTime,
		modifiedTime,
		author,
		category,
		jsonLd,
		noindex = false
	}: Props = $props();

	const siteName = 'MAPFLOFA';

	// Reactive page URL and origin from SvelteKit page state
	const pageUrl = $derived(page.url?.href ?? '');
	const origin = $derived(page.url?.origin ?? '');

	// Compute absolute image URL for link preview cards (WhatsApp, Facebook, Twitter, Telegram, etc.)
	const absoluteImageUrl = $derived.by(() => {
		if (!image) return `${origin}/logo.png`;
		if (image.startsWith('http://') || image.startsWith('https://')) {
			return image;
		}
		const path = image.startsWith('/') ? image : `/${image}`;
		return origin ? `${origin}${path}` : path;
	});

	const computedAlt = $derived(imageAlt || title);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	{#if pageUrl}
		<link rel="canonical" href={pageUrl} />
	{/if}

	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta
			name="robots"
			content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
		/>
	{/if}

	<!-- Open Graph / Facebook / WhatsApp / Telegram / LinkedIn -->
	<meta property="og:site_name" content={siteName} />
	<meta property="og:type" content={type} />
	{#if pageUrl}
		<meta property="og:url" content={pageUrl} />
	{/if}
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={absoluteImageUrl} />
	<meta property="og:image:secure_url" content={absoluteImageUrl} />
	<meta property="og:image:alt" content={computedAlt} />
	<meta property="og:locale" content="id_ID" />

	{#if type === 'article'}
		{#if publishedTime}
			<meta property="article:published_time" content={publishedTime} />
		{/if}
		{#if modifiedTime || publishedTime}
			<meta property="article:modified_time" content={modifiedTime || publishedTime} />
		{/if}
		{#if author}
			<meta property="article:author" content={author} />
		{/if}
		{#if category}
			<meta property="article:section" content={category} />
		{/if}
	{/if}

	<!-- Twitter Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={absoluteImageUrl} />
	<meta name="twitter:image:alt" content={computedAlt} />

	<!-- JSON-LD Structured Data -->
	{#if jsonLd}
		{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
	{/if}
</svelte:head>
