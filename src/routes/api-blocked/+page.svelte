<svelte:head>
	<title>API Access Blocked</title>
</svelte:head>

<section class="page">
	<div class="stack">
		<div class="gif-wrap">
			<div
				class="tenor-gif-embed"
				data-postid="25603936"
				data-share-method="host"
				data-aspect-ratio="1.56863"
				data-width="100%"
			>
				<a href="https://tenor.com/view/tom-and-jerry-searching-gif-25603936">
					Tom And Jerry Searching GIF
				</a>
				from
				<a href="https://tenor.com/search/tom+and+jerry+searching-gifs">
					Tom And Jerry Searching GIFs
				</a>
			</div>
			<script type="text/javascript" async src="https://tenor.com/embed.js"></script>
		</div>
		<div class="caption">Me looking for API that I can use for backdoor</div>
	</div>
</section>

<style>
	:global(body) {
		margin: 0;
		font-family: "Plus Jakarta Sans", "Poppins", sans-serif;
		background: radial-gradient(circle at 20% 20%, #ffe4e6, transparent 50%),
			radial-gradient(circle at 80% 10%, #cffafe, transparent 45%),
			radial-gradient(circle at 30% 80%, #fde68a, transparent 40%),
			#f8fafc;
		color: #0f172a;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.page {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 2rem;
		position: relative;
	}

	.stack {
		width: min(720px, 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 2.75rem 2.25rem;
		border-radius: 28px;
		border: 1px solid rgba(15, 23, 42, 0.08);
		box-shadow: 0 30px 70px rgba(15, 23, 42, 0.16);
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.85));
		position: relative;
		text-align: center;
		overflow: hidden;
	}

	.stack::before {
		content: "";
		position: absolute;
		inset: -40% 30% auto -30%;
		height: 220px;
		background: radial-gradient(circle, rgba(99, 102, 241, 0.22), transparent 70%);
		transform: rotate(-12deg);
		pointer-events: none;
	}

	.stack::after {
		content: "";
		position: absolute;
		right: -120px;
		bottom: -120px;
		width: 240px;
		height: 240px;
		background: conic-gradient(from 120deg, rgba(251, 146, 60, 0.25), rgba(45, 212, 191, 0.2), transparent 70%);
		border-radius: 999px;
		filter: blur(6px);
		pointer-events: none;
	}

	.gif-wrap {
		width: min(520px, 100%);
		border-radius: 22px;
		padding: 1rem;
		background: rgba(15, 23, 42, 0.03);
		border: 1px dashed rgba(15, 23, 42, 0.12);
	}

	.caption {
		color: #0f172a;
		font-size: clamp(1rem, 2.2vw, 1.2rem);
		line-height: 1.7;
		font-weight: 700;
		letter-spacing: 0.02em;
		background: linear-gradient(90deg, #0f172a, #f97316 45%, #0f172a 90%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	@media (max-width: 600px) {
		.stack {
			padding: 2rem 1.5rem;
			gap: 1.25rem;
		}
	}
</style>
