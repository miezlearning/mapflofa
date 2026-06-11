<script lang="ts">
	import type { EndpointDoc } from '$lib/server/api/registry';
	import { authToken } from './auth-store.svelte';
	import { locale } from '$lib/i18n/locale.svelte';

	type Props = { endpoint: EndpointDoc };
	let { endpoint }: Props = $props();

	let open = $state(false);
	let trying = $state(false);

	let pathValues = $state<Record<string, string>>({});
	let queryValues = $state<Record<string, string>>({});
	let bodyDraft = $state('');

	let loading = $state(false);
	let response = $state<{
		status: number;
		ok: boolean;
		durationMs: number;
		headers: Record<string, string>;
		body: string;
		bodyParsed: unknown;
	} | null>(null);
	let errorMsg = $state<string | null>(null);

	function seedBody() {
		if (bodyDraft || !endpoint.requestBody?.length) return;
		const template: Record<string, unknown> = {};
		for (const f of endpoint.requestBody) {
			template[f.name] = exampleValue(f.type);
		}
		bodyDraft = JSON.stringify(template, null, 2);
	}

	function exampleValue(type: string): unknown {
		const t = type.toLowerCase();
		if (t.includes('integer')) return 1;
		if (t.includes('number')) return 1;
		if (t.includes('null')) return null;
		if (t.includes('url')) return 'https://example.com/image.jpg';
		return 'string';
	}

	function methodPillClass(m: string) {
		return `method-pill method-${m.toLowerCase()}`;
	}

	function buildUrl(): string {
		let path = endpoint.path;
		if (endpoint.pathParams) {
			for (const p of endpoint.pathParams) {
				const v = pathValues[p.name] ?? '';
				path = path.replace(`:${p.name}`, encodeURIComponent(v || `{${p.name}}`));
			}
		}
		const url = new URL(path, location.origin);
		if (endpoint.queryParams) {
			for (const q of endpoint.queryParams) {
				const v = queryValues[q.name];
				if (v && v.length > 0) url.searchParams.set(q.name, v);
			}
		}
		return url.toString();
	}

	function buildCurl(): string {
		const url = buildUrl();
		const lines: string[] = [`curl -X ${endpoint.method} '${url}'`];
		if (endpoint.auth === 'admin') {
			lines.push(`  -H 'Authorization: Bearer ${authToken.isSet ? '***' : '<TOKEN>'}'`);
		}
		if (endpoint.requestBody?.length) {
			lines.push(`  -H 'Content-Type: application/json'`);
			lines.push(`  -d '${bodyDraft.replace(/\n/g, ' ')}'`);
		}
		return lines.join(' \\\n');
	}

	async function execute() {
		errorMsg = null;
		response = null;

		if (endpoint.pathParams) {
			for (const p of endpoint.pathParams) {
				if (p.required !== false && !(pathValues[p.name] ?? '').trim()) {
					errorMsg = locale.t('ep.errPathRequired').replace('{name}', p.name);
					return;
				}
			}
		}

		const headers: Record<string, string> = { Accept: 'application/json' };
		if (endpoint.auth === 'admin') {
			if (!authToken.isSet) {
				errorMsg = locale.t('ep.errAuthRequired');
				return;
			}
			headers['Authorization'] = `Bearer ${authToken.value}`;
		}

		let body: string | undefined;
		if (endpoint.requestBody?.length) {
			headers['Content-Type'] = 'application/json';
			try {
				JSON.parse(bodyDraft);
			} catch (err) {
				errorMsg = `${locale.t('ep.errInvalidJson')} ${(err as Error).message}`;
				return;
			}
			body = bodyDraft;
		}

		const url = buildUrl();
		const start = performance.now();
		loading = true;
		try {
			const res = await fetch(url, { method: endpoint.method, headers, body });
			const text = await res.text();
			let parsed: unknown = null;
			try {
				parsed = text ? JSON.parse(text) : null;
			} catch {
				parsed = text;
			}
			const headerObj: Record<string, string> = {};
			res.headers.forEach((v, k) => (headerObj[k] = v));
			response = {
				status: res.status,
				ok: res.ok,
				durationMs: Math.round(performance.now() - start),
				headers: headerObj,
				body: text,
				bodyParsed: parsed
			};
		} catch (err) {
			errorMsg = `${locale.t('ep.errNetwork')} ${(err as Error).message}`;
		} finally {
			loading = false;
		}
	}

	function clearResponse() {
		response = null;
		errorMsg = null;
	}

	function statusClass(s: number) {
		if (s >= 200 && s < 300) return 'status-ok';
		if (s >= 300 && s < 400) return 'status-redirect';
		if (s >= 400 && s < 500) return 'status-client';
		return 'status-server';
	}
</script>

<article class="ep" id={endpoint.id} class:open>
	<button
		type="button"
		class="ep-head"
		onclick={() => (open = !open)}
		aria-expanded={open}
		aria-controls={`ep-body-${endpoint.id}`}
	>
		<span class={methodPillClass(endpoint.method)}>{endpoint.method}</span>
		<span class="ep-path">{endpoint.path}</span>
		<span class="ep-summary">{locale.tr(endpoint.summary)}</span>
		<span class="ep-spacer"></span>
		{#if endpoint.auth === 'admin'}
			<span class="auth-pill">🔐 {locale.t('ep.admin')}</span>
		{:else}
			<span class="auth-pill auth-public">{locale.t('ep.public')}</span>
		{/if}
		<span class="chev" aria-hidden="true">{open ? '▾' : '▸'}</span>
	</button>

	{#if open}
		<div id={`ep-body-${endpoint.id}`} class="ep-body">
			{#if endpoint.description}
				<p class="ep-desc">{locale.tr(endpoint.description)}</p>
			{/if}

			<div class="ep-meta">
				<span>
					{locale.t('ep.rateLimit')}
					<strong>{endpoint.rateLimit.limit}</strong>
					{locale.t('ep.requestsPer')}
					<strong>{endpoint.rateLimit.windowSec}s</strong>
				</span>
			</div>

			{#if endpoint.pathParams && endpoint.pathParams.length > 0}
				<h4 class="section">{locale.t('ep.pathParams')}</h4>
				<table class="param-table">
					<thead>
						<tr>
							<th>{locale.t('ep.colName')}</th>
							<th>{locale.t('ep.colType')}</th>
							<th>{locale.t('ep.colDescription')}</th>
							<th>{locale.t('ep.colValue')}</th>
						</tr>
					</thead>
					<tbody>
						{#each endpoint.pathParams as p (p.name)}
							<tr>
								<td>
									<code>{p.name}</code>
									{#if p.required !== false}<span class="req">*</span>{/if}
								</td>
								<td><code>{p.type}</code></td>
								<td>{locale.tr(p.description)}</td>
								<td>
									<input
										type="text"
										class="param-input"
										placeholder={p.name}
										bind:value={pathValues[p.name]}
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}

			{#if endpoint.queryParams && endpoint.queryParams.length > 0}
				<h4 class="section">{locale.t('ep.queryParams')}</h4>
				<table class="param-table">
					<thead>
						<tr>
							<th>{locale.t('ep.colName')}</th>
							<th>{locale.t('ep.colType')}</th>
							<th>{locale.t('ep.colDescription')}</th>
							<th>{locale.t('ep.colValue')}</th>
						</tr>
					</thead>
					<tbody>
						{#each endpoint.queryParams as p (p.name)}
							<tr>
								<td><code>{p.name}</code></td>
								<td><code>{p.type}</code></td>
								<td>{locale.tr(p.description)}</td>
								<td>
									<input
										type="text"
										class="param-input"
										placeholder="optional"
										bind:value={queryValues[p.name]}
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}

			{#if endpoint.requestBody && endpoint.requestBody.length > 0}
				<h4 class="section">{locale.t('ep.requestBody')}</h4>
				<table class="param-table">
					<thead>
						<tr>
							<th>{locale.t('ep.colField')}</th>
							<th>{locale.t('ep.colType')}</th>
							<th>{locale.t('ep.colDescription')}</th>
						</tr>
					</thead>
					<tbody>
						{#each endpoint.requestBody as p (p.name)}
							<tr>
								<td>
									<code>{p.name}</code>
									{#if p.required}<span class="req">*</span>{/if}
								</td>
								<td><code>{p.type}</code></td>
								<td>{locale.tr(p.description)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<textarea
					class="body-editor"
					rows={Math.max(6, bodyDraft.split('\n').length + 1)}
					spellcheck="false"
					bind:value={bodyDraft}
					placeholder={'{}'}
				></textarea>
			{/if}

			<div class="try-row">
				{#if !trying}
					<button
						type="button"
						class="btn btn-primary"
						onclick={() => {
							trying = true;
							seedBody();
						}}
					>
						{locale.t('ep.tryItOut')}
					</button>
				{:else}
					<button type="button" class="btn btn-primary" onclick={execute} disabled={loading}>
						{loading ? locale.t('ep.executing') : locale.t('ep.execute')}
					</button>
					<button
						type="button"
						class="btn btn-ghost"
						onclick={() => {
							trying = false;
							clearResponse();
						}}
					>
						{locale.t('ep.cancel')}
					</button>
				{/if}
				{#if response}
					<button type="button" class="btn btn-ghost" onclick={clearResponse}>
						{locale.t('ep.clear')}
					</button>
				{/if}
			</div>

			{#if trying}
				<h4 class="section">{locale.t('ep.curlHeading')}</h4>
				<pre class="codeblock"><code>{buildCurl()}</code></pre>
			{/if}

			{#if errorMsg}
				<div class="alert">{errorMsg}</div>
			{/if}

			{#if response}
				<h4 class="section">{locale.t('ep.responseHeading')}</h4>
				<div class="resp-meta">
					<span class={`status-pill ${statusClass(response.status)}`}>
						{response.status}
					</span>
					<span class="resp-info">
						{response.ok ? locale.t('ep.statusOk') : locale.t('ep.statusError')} · {response.durationMs}ms
					</span>
				</div>

				<div class="tabs">
					<details open>
						<summary>{locale.t('ep.bodyTab')}</summary>
						<pre class="codeblock"><code>{typeof response.bodyParsed === 'string'
								? response.body
								: JSON.stringify(response.bodyParsed, null, 2)}</code></pre>
					</details>
					<details>
						<summary>
							{locale.t('ep.headersTab')} ({Object.keys(response.headers).length})
						</summary>
						<pre class="codeblock"><code>{Object.entries(response.headers)
								.map(([k, v]) => `${k}: ${v}`)
								.join('\n')}</code></pre>
					</details>
				</div>
			{/if}
		</div>
	{/if}
</article>

<style>
	.ep {
		border-radius: 0.875rem;
		border: 1px solid rgba(148, 163, 184, 0.15);
		background: linear-gradient(180deg, rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.3));
		margin-bottom: 0.875rem;
		scroll-margin-top: 1.25rem;
		overflow: hidden;
	}

	.ep.open {
		border-color: rgba(56, 189, 248, 0.35);
		box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.18) inset, 0 8px 28px -10px rgba(2, 6, 23, 0.6);
	}

	.ep-head {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1.125rem;
		background: transparent;
		border: 0;
		width: 100%;
		text-align: left;
		cursor: pointer;
		color: #e5e7eb;
	}

	.ep-head:hover {
		background: rgba(56, 189, 248, 0.05);
	}

	.method-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 4rem;
		padding: 0.375rem 0.5rem;
		border-radius: 0.5rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.04em;
		flex: none;
	}

	.method-get {
		background: rgba(52, 211, 153, 0.14);
		color: #34d399;
		border: 1px solid rgba(52, 211, 153, 0.35);
	}

	.method-post {
		background: rgba(56, 189, 248, 0.14);
		color: #38bdf8;
		border: 1px solid rgba(56, 189, 248, 0.35);
	}

	.method-patch,
	.method-put {
		background: rgba(248, 113, 113, 0.14);
		color: #f87171;
		border: 1px solid rgba(248, 113, 113, 0.35);
	}

	.method-delete {
		background: rgba(251, 113, 133, 0.14);
		color: #fb7185;
		border: 1px solid rgba(251, 113, 133, 0.35);
	}

	.ep-path {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-weight: 700;
		color: #f1f5f9;
		font-size: 0.9rem;
	}

	.ep-summary {
		color: #94a3b8;
		font-size: 0.85rem;
	}

	.ep-spacer {
		flex: 1;
	}

	.auth-pill {
		font-size: 0.75rem;
		font-weight: 700;
		color: #c084fc;
		background: rgba(192, 132, 252, 0.1);
		border: 1px solid rgba(192, 132, 252, 0.25);
		padding: 0.125rem 0.5rem;
		border-radius: 0.375rem;
		flex: none;
	}

	.auth-public {
		color: #94a3b8;
		background: rgba(148, 163, 184, 0.08);
		border-color: rgba(148, 163, 184, 0.18);
	}

	.chev {
		font-size: 0.75rem;
		color: #94a3b8;
		flex: none;
	}

	.ep-body {
		padding: 1.25rem 1.25rem 1.5rem;
		border-top: 1px solid rgba(148, 163, 184, 0.12);
	}

	.ep-desc {
		color: #cbd5e1;
		font-size: 0.875rem;
		margin: 0 0 0.75rem;
		line-height: 1.6;
	}

	.ep-meta {
		font-size: 0.75rem;
		color: #64748b;
		margin-bottom: 1rem;
	}

	.ep-meta strong {
		color: #cbd5e1;
	}

	.section {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #94a3b8;
		font-weight: 700;
		margin: 1.25rem 0 0.5rem;
	}

	.param-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}

	.param-table th {
		text-align: left;
		font-weight: 700;
		color: #94a3b8;
		text-transform: uppercase;
		font-size: 0.6875rem;
		letter-spacing: 0.06em;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.15);
	}

	.param-table td {
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.08);
		color: #cbd5e1;
		vertical-align: middle;
	}

	.param-table code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.75rem;
		color: #e2e8f0;
		background: rgba(148, 163, 184, 0.08);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.req {
		color: #fb7185;
		margin-left: 0.25rem;
	}

	.param-input {
		width: 100%;
		padding: 0.375rem 0.5rem;
		border-radius: 0.375rem;
		background: rgba(2, 6, 23, 0.7);
		border: 1px solid rgba(148, 163, 184, 0.18);
		color: #f1f5f9;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.8125rem;
		outline: none;
	}

	.param-input:focus {
		border-color: rgba(56, 189, 248, 0.5);
	}

	.body-editor {
		width: 100%;
		padding: 0.75rem;
		border-radius: 0.5rem;
		background: rgba(2, 6, 23, 0.85);
		border: 1px solid rgba(148, 163, 184, 0.15);
		color: #e2e8f0;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.8125rem;
		line-height: 1.55;
		outline: none;
		resize: vertical;
		min-height: 8rem;
	}

	.body-editor:focus {
		border-color: rgba(56, 189, 248, 0.5);
	}

	.try-row {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
		flex-wrap: wrap;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		border: 1px solid rgba(148, 163, 184, 0.18);
		background: rgba(15, 23, 42, 0.6);
		color: #f1f5f9;
		transition: all 150ms ease;
	}

	.btn:hover {
		transform: translateY(-1px);
	}

	.btn-primary {
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(99, 102, 241, 0.22));
		border-color: rgba(56, 189, 248, 0.45);
		color: #e0f2fe;
	}

	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.32), rgba(99, 102, 241, 0.32));
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.codeblock {
		display: block;
		background: rgba(2, 6, 23, 0.85);
		border: 1px solid rgba(148, 163, 184, 0.15);
		border-radius: 0.625rem;
		padding: 0.875rem 1rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.8125rem;
		color: #cbd5e1;
		line-height: 1.6;
		overflow-x: auto;
		margin: 0.5rem 0 0;
		white-space: pre;
	}

	.alert {
		margin-top: 0.875rem;
		padding: 0.75rem 0.875rem;
		border-radius: 0.5rem;
		background: rgba(251, 113, 133, 0.1);
		border: 1px solid rgba(251, 113, 133, 0.3);
		color: #fda4af;
		font-size: 0.875rem;
	}

	.resp-meta {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		margin: 0.25rem 0 0.75rem;
	}

	.status-pill {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.875rem;
		font-weight: 800;
		padding: 0.25rem 0.625rem;
		border-radius: 0.375rem;
	}

	.status-ok {
		background: rgba(52, 211, 153, 0.15);
		color: #34d399;
		border: 1px solid rgba(52, 211, 153, 0.35);
	}

	.status-redirect {
		background: rgba(56, 189, 248, 0.15);
		color: #38bdf8;
		border: 1px solid rgba(56, 189, 248, 0.35);
	}

	.status-client {
		background: rgba(248, 113, 113, 0.14);
		color: #f87171;
		border: 1px solid rgba(248, 113, 113, 0.35);
	}

	.status-server {
		background: rgba(251, 113, 133, 0.14);
		color: #fb7185;
		border: 1px solid rgba(251, 113, 133, 0.35);
	}

	.resp-info {
		color: #94a3b8;
		font-size: 0.8125rem;
	}

	.tabs details {
		margin-top: 0.5rem;
		border: 1px solid rgba(148, 163, 184, 0.15);
		border-radius: 0.625rem;
		background: rgba(15, 23, 42, 0.4);
	}

	.tabs summary {
		padding: 0.625rem 0.875rem;
		cursor: pointer;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #cbd5e1;
		list-style: none;
	}

	.tabs summary::-webkit-details-marker {
		display: none;
	}

	.tabs details[open] summary {
		border-bottom: 1px solid rgba(148, 163, 184, 0.12);
	}

	.tabs details .codeblock {
		margin: 0;
		border: 0;
		border-radius: 0 0 0.625rem 0.625rem;
		max-height: 30rem;
	}
</style>
