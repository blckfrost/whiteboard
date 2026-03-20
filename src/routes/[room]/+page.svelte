<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { getCanvasPoint } from '$lib/canvas';
	import Divider from '$lib/components/divider.svelte';
	import type { Point } from '../../types';

	const room = $page.params.room;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let isDrawing = false;
	let currentPoints: Point[] = [];

	let color = '#c8f04a';
	const palette = ['#c8f04a', '#f0ede6', '#60a5fa', '#f87171', '#fb923c', '#a78bfa', '#34d399'];

	function handlePointerDown(e: PointerEvent) {
		canvas.setPointerCapture(e.pointerId);
		isDrawing = true;
		currentPoints = [getCanvasPoint(canvas, e)];
	}

	function handlePointerUp() {
		if (!isDrawing || currentPoints.length < 2) {
			isDrawing = false;
			return;
		}
		isDrawing = false;

		currentPoints = [];
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
	});
</script>

<div>
	<header class="z-10 flex h-12 items-center gap-3 px-16">
		<a
			class="flex items-center gap-2 text-xs font-medium tracking-wider text-neutral-400 uppercase hover:text-neutral-200"
			href={resolve('/')}
		>
			<span class="h-2 w-2 rounded-[50%] bg-emerald-700"></span>
			whiteboard
		</a>
		<div class="ml-auto rounded-md border border-neutral-600 bg-emerald-800 px-2 py-1">
			<span class="text-[12px] text-neutral-200">{room}</span>
		</div>
	</header>
	<div class="canvas-wrap">
		<canvas
			bind:this={canvas}
			onpointerdown={handlePointerDown}
			onpointerup={handlePointerUp}
			class="block h-full w-full cursor-crosshair"
		></canvas>
	</div>

	<div class="flex h-8 shrink-0 items-center gap-1 border-t bg-emerald-600 px-4">
		<div class="tool-group">
			<button class="icon-btn" title="Undo">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path
						d="M3 7H10C11.7 7 13 8.3 13 10S11.7 13 10 13H7"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
					<path
						d="M6 4L3 7L6 10"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
			<button class="icon-btn" title="Redo">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path
						d="M13 7H6C4.3 7 3 8.3 3 10S4.3 13 6 13H9"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
					<path
						d="M10 4L13 7L10 10"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>
		<Divider />

		<div class="tool-group">
			{#each palette as c (c)}
				<button
					class="swatch"
					class:active={color === c}
					style="background:{c}"
					onclick={() => (color = c)}
					title={c}
				>
				</button>
			{/each}
		</div>
	</div>

	<div></div>
</div>

<style>
	:global(body) {
		background: #0a0a0b;
		overflow: hidden;
	}

	.canvas-wrap {
		flex: 1;
		position: relative;
		overflow: hidden;
		background: #0a0a0b;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
		background-size: 32px 32px;
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 8px;
		border: none;
		background: transparent;
		color: #666;
		cursor: pointer;
		transition:
			background 0.12s,
			color 0.12s;
	}

	.tool-group {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.swatch {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		transition:
			transform 0.1s,
			border-color 0.1s;
		padding: 0;
	}

	.swatch:hover {
		transform: scale(1.15);
	}
	.swatch.active {
		border-color: #fff;
		transform: scale(1.15);
	}
</style>
