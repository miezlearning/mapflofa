<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import ResourceForm from '$lib/components/admin/ResourceForm.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const resource = $derived(data.resource);

	type FormState = {
		values?: Record<string, unknown>;
		message?: string;
		fieldErrors?: Record<string, string[] | undefined>;
	};
	const f = $derived((form ?? null) as FormState | null);
</script>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Tambah {resource.label}</h1>
		<p class="adm-sub">Isi formulir di bawah, lalu klik Save untuk menyimpan.</p>
	</div>
	<a class="adm-btn" href={`/admin/${resource.slug}`}>← Back to list</a>
</div>

<div class="adm-card">
	<ResourceForm
		fields={resource.fields}
		values={f?.values ?? null}
		fieldErrors={f?.fieldErrors ?? null}
		message={f?.message ?? null}
		submitLabel="Create"
		cancelHref={`/admin/${resource.slug}`}
	/>
</div>
