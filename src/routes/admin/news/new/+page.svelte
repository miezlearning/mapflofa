<script lang="ts">
	import type { ActionData } from './$types';
	import RichEditor from '$lib/components/admin/RichEditor.svelte';

	let { form }: { form: ActionData } = $props();

	type FormState = {
		values?: Record<string, unknown>;
		message?: string;
		fieldErrors?: Record<string, string[] | undefined>;
	};
	const f = $derived((form ?? null) as FormState | null);
</script>

<svelte:head>
	<title>New post — Admin</title>
</svelte:head>

<RichEditor form={f} submitLabel="Publish" cancelHref="/admin/news" />
