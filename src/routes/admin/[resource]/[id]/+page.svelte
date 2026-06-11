<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import ResourceForm from '$lib/components/admin/ResourceForm.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const resource = $derived(data.resource);
	const item = $derived(data.item);

	type FormState = {
		values?: Record<string, unknown>;
		message?: string;
		fieldErrors?: Record<string, string[] | undefined>;
	};
	const f = $derived((form ?? null) as FormState | null);

	// Hydrate form values from the existing record on first load,
	// or from the validation echo on a failed submit.
	const values = $derived(f?.values ?? item);
</script>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Edit {resource.label}</h1>
		<p class="adm-sub">ID #{item.id}</p>
	</div>
	<a class="adm-btn" href={`/admin/${resource.slug}`}>← Back to list</a>
</div>

<div class="adm-card">
	<ResourceForm
		fields={resource.fields}
		values={values}
		fieldErrors={f?.fieldErrors ?? null}
		message={f?.message ?? null}
		submitLabel="Save changes"
		cancelHref={`/admin/${resource.slug}`}
	/>
</div>
