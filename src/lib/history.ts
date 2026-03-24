import type { Stroke } from "../types";
import { writable } from "svelte/store";

function createHistory() {
    const strokes = writable<Stroke[]>([])
    const redoStack = writable<Stroke[]>([])

    function addStroke(stroke: Stroke) {
        strokes.update((s) => [...s, stroke])
        redoStack.update((s) => [...s, stroke])
    }

    function addRemoteStroke(stroke: Stroke) {
        strokes.update((s) => [...s, stroke])
    }

    function undo() {
        let undone: Stroke | undefined

        strokes.update((s) => {
            if (s.length === 0) return s
            undone = s[s.length - 1]
            return s.slice(0, -1)
        })

        if (undone) {
            redoStack.update((r) => [...r, undone!])
        }

        return undone
    }

    function redo() {
        let redone: Stroke | undefined

        redoStack.update((r) => {
            if (r.length === 0) return r
            redone = r[r.length - 1]
            return r.slice(0, -1)
        })

        if (redone) {
            strokes.update((r) => [...r, redone!])
        }

        return redone
    }

    return { strokes, addStroke, addRemoteStroke, undo, redo }

}

export const history = createHistory()
