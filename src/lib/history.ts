import type { Stroke } from "../types";
import { writable } from "svelte/store";

function createHistory() {
    const strokes = writable<Stroke[]>([])

    function addStroke(stroke: Stroke) {
        strokes.update((s) => [...s, stroke])

    }

    function addRemoteStroke(stroke: Stroke) {
        strokes.update((s) => [...s, stroke])
    }

    return { strokes, addStroke, addRemoteStroke }

}

export const history = createHistory()
