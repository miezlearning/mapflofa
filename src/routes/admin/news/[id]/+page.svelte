<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import RichEditor from '$lib/components/admin/RichEditor.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const item = $derived(data.item);

	type FormState = {
		values?: Record<string, unknown>;
		message?: string;
		fieldErrors?: Record<string, string[] | undefined>;
		ok?: boolean;
		savedAt?: string;
	};
	const f = $derived((form ?? null) as FormState | null);

	// Re-mount the editor whenever the saved record changes (id stays same,
	// but updatedAt changes after save) so the editor's internal state
	// re-reads from `initial`. This avoids stale state and keeps the
	// "stay-on-page" UX clean.
	const editorKey = $derived(`${item.id}:${item.updatedAt}`);
</script>

<svelte:head>
	<title>Edit — {item.title}</title>
</svelte:head>

{#key editorKey}
	<RichEditor
		initial={item as unknown as Record<string, unknown>}
		form={f}
		submitLabel="Save changes"
		cancelHref="/admin/news"
		previewSlug={item.slug}
	/>
{/key}
