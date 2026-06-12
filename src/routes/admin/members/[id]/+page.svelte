<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import MemberForm from '$lib/components/admin/MemberForm.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const item = $derived(data.item);

	type FormState = {
		values?: Record<string, unknown>;
		message?: string;
		fieldErrors?: Record<string, string[] | undefined>;
		ok?: boolean;
	};
	const f = $derived((form ?? null) as FormState | null);

	// Hydrate from the submitted echo on error, otherwise from the record.
	const values = $derived(f?.values ?? item);
</script>

<svelte:head>
	<title>Edit Pengurus · Admin</title>
</svelte:head>

<div class="adm-page-head">
	<div>
		<h1 class="adm-title">Edit Pengurus</h1>
		<p class="adm-sub">{item.name} · {item.position}</p>
	</div>
	<a class="adm-btn" href="/admin/members">← Kembali</a>
</div>

{#if f?.ok}
	<div class="adm-flash adm-flash-ok">{f.message}</div>
{/if}

<div class="adm-card">
	<MemberForm
		values={values}
		fieldErrors={f?.fieldErrors ?? null}
		message={f?.ok ? null : (f?.message ?? null)}
		submitLabel="Simpan Perubahan"
		cancelHref="/admin/members"
	/>
</div>
