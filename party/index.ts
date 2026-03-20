import type * as Party from "partykit/server";

export default class Server implements Party.Server {
    constructor(readonly room: Party.Room) { }

    onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
        // A websocket just connected!
        console.log(

            `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`
        );
    }

    onMessage(message: string, sender: Party.Connection) {
        console.log(`connection ${sender.id} sent message: ${message}`);

        this.room.broadcast(message, [sender.id]);
    }
}

Server satisfies Party.Worker;
