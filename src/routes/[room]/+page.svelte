<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import { generateId, getCanvasPoint, redrawAll, renderStroke } from '$lib/canvas';
	import type { Point, Stroke } from '../../types';
	import { history } from '$lib/history';
	import { createPartyClient, type RemoteCursor } from '$lib/party';
	import { SvelteMap } from 'svelte/reactivity';

	const room = $derived($page.params.room);
	const userId = generateId();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let isDrawing = false;
	let currentPoints: Point[] = [];

	let party: ReturnType<typeof createPartyClient> | null = null;

	let remoteCursors: Map<string, RemoteCursor> = new SvelteMap();
	let cursorsUpdate = $state(0);

	let color = $state('#c8f04a');
	let brushSize = $state(2);
	let copied = $state(false);

	const palette = ['#c8f04a', '#f0ede6', '#60a5fa', '#f87171', '#fb923c', '#a78bfa', '#34d399'];

	let unsubStrokes = history.strokes.subscribe((strokes) => {
		if (ctx) redrawAll(ctx, strokes);
	});

	onMount(() => {
		ctx = canvas.getContext('2d');
		resizeCanvas();

		if (!room) return;

		party = createPartyClient({
			room,
			userId,
			onStroke: (stroke) => history.addRemoteStroke(stroke),
			onCursor: (cursor) => {
				remoteCursors.set(cursor.userId, cursor);
				cursorsUpdate++;
			},

			onUndo: (strokeId) => history.removeStroke(strokeId)
		});

		window.addEventListener('resize', resizeCanvas);
	});

	onDestroy(() => {
		party?.destroy();
		unsubStrokes();
		window.removeEventListener('resize', resizeCanvas);
	});

	function handlePointerDown(e: PointerEvent) {
		canvas.setPointerCapture(e.pointerId);
		isDrawing = true;
		currentPoints = [getCanvasPoint(canvas, e)];
	}

	function handlePointerMove(e: PointerEvent) {
		const pt = getCanvasPoint(canvas, e);

		party?.sendCursor(pt.x, pt.y);

		if (!isDrawing) return;

		currentPoints = [...currentPoints, pt];

		const preview: Stroke = {
			id: 'preview',
			points: currentPoints,
			color,
			width: brushSize
		};

		let current: Stroke[] = [];
		const unsub = history.strokes.subscribe((s) => (current = s));
		unsub();
		redrawAll(ctx!, current);
		renderStroke(ctx!, preview);
	}

	function handlePointerUp() {
		if (!isDrawing || currentPoints.length < 2) {
			isDrawing = false;
			return;
		}
		isDrawing = false;

		const stroke: Stroke = {
			id: generateId(),
			points: currentPoints,
			color,
			width: brushSize,
			userId
		};

		history.addStroke(stroke);
		party?.sendStroke(stroke);
		currentPoints = [];
	}
	function resizeCanvas() {
		if (!canvas) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();

		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;

		ctx?.scale(dpr, dpr);

		const strokes = history.strokes;
		let current: Stroke[] = [];
		const unsub = strokes.subscribe((s) => (current = s));

		unsub();
		redrawAll(ctx!, current);
	}

	function undo() {
		const undone = history.undo();
		if (undone) party?.sendUndo(undone.id);
	}

	function copyLink() {
		navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	let canUndo = $derived(history.strokes.subscribe((strokes) => strokes.length > 0));
	let canRedo = $derived(history.redoStack.subscribe((redoStack) => redoStack.length > 0));
</script>

<div class="w-scren flex h-dvh w-screen flex-col overflow-hidden bg-neutral-950">
	<header class="absolute top-0 right-0 left-0 z-20 flex h-12 items-center gap-3 px-5">
		<a
			class="flex items-center gap-2 text-xs font-medium tracking-wider text-neutral-400 uppercase hover:text-neutral-200"
			href={resolve('/')}
		>
			<span class="h-2 w-2 rounded-full bg-emerald-700"></span>
			whiteboard
		</a>
		<div class="ml-auto flex items-center gap-2 rounded-md border border-neutral-600 px-2 py-1">
			<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
			<span class="text-[12px] text-neutral-200">{room}</span>
		</div>

		<button
			onclick={copyLink}
			class="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 transition-all {copied
				? 'text-emerald-500'
				: 'text-neutral-400'}"
		>
			{#if copied}
				<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
					<path
						d="M2 7L5 10L11 3"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				Copied!
			{:else}
				<svg width="13" height="13" viewBox="0 0 13 13" fill="none">
					<rect
						x="1"
						y="4"
						width="8"
						height="8"
						rx="1.5"
						stroke="currentColor"
						stroke-width="1.3"
					/>
					<path
						d="M4 4V2.5A1.5 1.5 0 0 1 5.5 1H10.5A1.5 1.5 0 0 1 12 2.5V7.5A1.5 1.5 0 0 1 10.5 9H9"
						stroke="currentColor"
						stroke-width="1.3"
						stroke-linecap="round"
					/>
				</svg>
				Invite
			{/if}
		</button>
	</header>
	<div class="relative flex-1 overflow-hidden">
		<canvas
			bind:this={canvas}
			onpointerdown={handlePointerDown}
			onpointerup={handlePointerUp}
			onpointermove={handlePointerMove}
			onpointerleave={handlePointerUp}
			class="h-full w-full cursor-crosshair bg-neutral-950"
		></canvas>

		{#key cursorsUpdate}
			{#each [...remoteCursors.values()] as cursor (cursor.userId)}
				{#if cursor.userId !== userId}
					<div
						class="pointer-events-none absolute flex items-end gap-1"
						style="left:{cursor.x}px; top:{cursor.y}px;"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M3 2L13 8L8 9L6 14L3 2Z" fill="#60a5fa" stroke="#0a0a0b" stroke-width="1" />
						</svg>
						<span class="rounded bg-blue-400 px-1.5 py-0.5 text-xs font-medium text-white">
							{cursor.userId.slice(0, 6)}
						</span>
					</div>
				{/if}
			{/each}
		{/key}
	</div>

	<div class="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
		<div class="flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-900 px-3 py-2">
			<div class="flex items-center gap-1">
				<button
					class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none
					       bg-transparent text-neutral-500 transition-all hover:bg-white/[0.07] hover:text-neutral-200
					       active:bg-white/10 active:text-white"
					title="Undo"
					onclick={undo}
					disabled={!canUndo}
				>
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

				<button
					title="Redo"
					onclick={history.redo}
					disabled={!canRedo}
					class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none
				       bg-transparent text-neutral-500 transition-all hover:bg-white/[0.07] hover:text-neutral-200
				       active:bg-white/10 active:text-white"
				>
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

			<div class="flex items-center gap-1">
				{#each palette as c (c)}
					<button
						class="h-5 w-5 rounded-full border-2"
						class:active={color === c}
						style="background:{c}"
						onclick={() => (color = c)}
						title={c}
					>
					</button>
				{/each}
			</div>

			<div class="flex items-center gap-0.5">
				{#each [2, 4, 6, 8, 10] as size (size)}
					<button
						class="flex h-9 w-9 items-center justify-center rounded-lg bg-transparent"
						class:active={brushSize === size}
						onclick={() => (brushSize = size)}
						title={`${size}px`}
					>
						<span
							class="block rounded-full"
							style="width:{size * 1.4}px; height:{size * 1.4}px; background:{color};"
						></span>
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background: #0a0a0b;
		overflow: hidden;
		margin: 0;
	}
</style>
