<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let roomInput = $state('');

	function join() {
		const slug = roomInput.trim().toLowerCase() || randomRoom();
		goto(resolve(`/${slug}`));
	}

	function randomRoom() {
		const words = ['azure', 'obsidian', 'coolaid', 'slate', 'pokemon'];
		return words[Math.floor(Math.random() * words.length)] + Math.floor(Math.random() * 1000);
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter') join();
	}
</script>

<main>
	<div class="hero">
		<h1>Draw together, in real time</h1>
		<p class="sub">
			Create a room and share the link. Anyone with the link can draw with you instantly.
		</p>

		<div class="input-row">
			<input
				type="text"
				placeholder="room name (or leave blank for random)"
				bind:value={roomInput}
				onkeydown={handleKey}
				spellcheck="false"
			/>
			<button onclick={join} class="rounded-lg bg-green-700 px-5 py-2 text-white">Enter room</button
			>
		</div>
		<p class="hint">No sign-up. No storage.</p>
	</div>
</main>

<style>
	:global(body) {
		background: #0a0a0b;
		color: #e8e6e0;
	}
	main {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	h1 {
		font-size: clamp(2.4rem, 6vw, 3.6rem);
		font-weight: 400;
		line-height: 1.1;
		letter-spacing: -0.03em;
		color: #f0ede6;
		margin-bottom: 1.25rem;
	}
	.hero {
		position: relative;
		max-width: 560px;
		width: 100%;
		padding: 2rem;
		text-align: center;
	}
	.input-row {
		display: flex;
		gap: 8px;
		background: #141416;
		border: 1px solid #2a2a2e;
		border-radius: 12px;
		padding: 6px;
		margin-bottom: 1rem;
	}

	.sub {
		font-size: 1rem;
		color: #666;
		line-height: 1.6;
		margin-bottom: 2.5rem;
		max-width: 380px;
		margin-inline: auto;
		margin-bottom: 2.5rem;
	}
	input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: #e8e6e0;
		font-size: 0.95rem;
		padding: 10px 14px;
		font-family: inherit;
	}

	.hint {
		font-size: 0.78rem;
		color: #3a3a3f;
		letter-spacing: 0.02em;
	}
</style>
