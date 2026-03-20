import type { Stroke, Point } from "../types";

export function generateId(): string {
    return Math.random().toString(36) + Date.now().toString(36)
}

export function getCanvasPoint(canvas: HTMLCanvasElement, e: PointerEvent): Point {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    }
}

export function renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 2) return

    ctx.save()
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width

    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
}


export function redrawAll(ctx: CanvasRenderingContext2D, strokes: Stroke[]) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    for (const stroke of strokes) {
        renderStroke(ctx, stroke)
    }
}
