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

    const host = import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999';

    const socket = new PartySocket({ host, room, query: { userId } })

    socket.addEventListener('message', (event) => {
        try {
            const message: PartyMessage = JSON.parse(event.data)
            if (message.type === 'stroke') onStroke(message.stroke);
            if (message.type === 'cursor') onCursor(message)
        } catch (e) {
            console.error('Failed to send party message', e)
        }


    })

    function sendStroke(stroke: Stroke) {
        socket.send(JSON.stringify({ type: 'stroke', stroke } satisfies PartyMessage));
    }

    function sendCursor(x: number, y: number) {
        socket.send(JSON.stringify({ type: 'cursor', userId, x, y } satisfies PartyMessage));
    }

    return { sendStroke, sendCursor }
}
