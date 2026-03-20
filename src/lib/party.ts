import PartySocket from "partysocket";
import type { Stroke } from "../types";


export type PartyMessage =
    | { type: 'stroke'; stroke: Stroke }
    | { type: 'undo'; strokeId: string }
    | { type: 'cursor'; userId: string; x: number; y: number };


export interface RemoteCursor {
    userId: string;
    x: number;
    y: number;
}

interface PartyClientOptions {
    room: string;
    userId: string;
    onStroke: (stroke: Stroke) => void;
    onCursor: (cursor: RemoteCursor) => void;
}

export function createPartyClient({ room, userId, onStroke, onCursor }: PartyClientOptions) {
    if (!room) {
        throw new Error("createPartyClient: `room is required`")
    }

    const host = import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999';
    const socket = new PartySocket({ host, room, query: { userId } })

    socket.addEventListener('open', () => {
        console.log('[party] connected')
    })

    socket.addEventListener('error', () => {
        console.log('[party] socket error')
    })

    socket.addEventListener('close', () => {
        console.log('[party] socket closed')
    })

    socket.addEventListener('message', (event) => {
        if (typeof event.data !== 'string') return
        if (!event.data.trim()) return

        try {
            const jsonStart = event.data.indexOf('{')
            if (jsonStart === -1) return

            const json = event.data.slice(jsonStart)


            const message: PartyMessage = JSON.parse(json)
            if (message.type === 'stroke') onStroke(message.stroke);
            if (message.type === 'cursor') onCursor(message)
        } catch (e) {
            console.error('[party] Failed to parse incoming message', event.data, e)
        }
    })

    function send(payload: PartyMessage) {
        if (socket.readyState !== WebSocket.OPEN) {
            console.warn('[]', {
                readyState: socket.readyState,
                payloadType: payload.type
            })
            return
        }
        socket.send(JSON.stringify(payload))
    }

    function sendStroke(stroke: Stroke) {
        send({ type: 'stroke', stroke })
    }

    function sendCursor(x: number, y: number) {
        send({ type: 'cursor', userId, x, y })
    }

    function destroy() {
        socket.close()
    }

    return { sendStroke, sendCursor, destroy }
}
