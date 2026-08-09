import { DurableObject } from "cloudflare:workers";
import type { Env } from "./env";

/**
 * A close code we are allowed to put in a close frame.
 *
 * The runtime reports codes that may never be echoed back: 1005 when the peer
 * sent no status at all (a bare `close()`), 1006 when the socket died without
 * a frame, plus 1004 and 1015 which are reserved. Passing one of those to
 * `close()` throws, so anything not explicitly sendable becomes a plain 1000.
 */
function echoableCloseCode(code: number): number {
  const reserved = code === 1004 || code === 1005 || code === 1006 || code === 1015;
  const inRange = code >= 1000 && code <= 4999;
  return inRange && !reserved ? code : 1000;
}

/**
 * The head count for the ground.
 *
 * Everyone shares one instance, so the number is genuinely global. A client
 * holds an open WebSocket for as long as it is on the ground; the count is
 * simply how many are open. Nothing is stored — the connections *are* the
 * state, which is why this needs no database and survives no restarts.
 *
 * Sockets are accepted via the hibernation API, so an idle night evicts this
 * object from memory without dropping anyone.
 */
export class Presence extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    // Clients heartbeat so proxies don't reap a quiet socket. Letting the
    // runtime answer "ping" itself means we stay hibernated while they do.
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong")
    );
  }

  async fetch(request: Request): Promise<Response> {
    // The header is case-insensitive per spec, and not every client sends it
    // lowercase.
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("expected a websocket upgrade", { status: 426 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);

    // Includes the newcomer, so they get a number immediately rather than
    // waiting for the next person to arrive or leave.
    this.broadcast();

    return new Response(null, { status: 101, webSocket: client });
  }

  /**
   * Heartbeats are answered by the runtime and never arrive here. Nothing
   * else is part of the protocol, but the handler must exist — an accepted
   * hibernatable socket with no message handler errors on the first stray
   * frame, which would take the connection down with it.
   */
  webSocketMessage() {}

  webSocketClose(ws: WebSocket, code: number) {
    try {
      ws.close(echoableCloseCode(code));
    } finally {
      // In a finally because the count must survive a failed handshake. If a
      // throw here ever skipped the broadcast, everyone else would keep the
      // old number and the ground would only ever appear to fill up.
      this.broadcast(ws);
    }
  }

  webSocketError(ws: WebSocket) {
    this.broadcast(ws);
  }

  /**
   * `leaving` is passed explicitly: a socket can still be listed by
   * getWebSockets() while its own close handler is running, and counting it
   * would report one dancer too many until the next person moved.
   */
  private broadcast(leaving?: WebSocket) {
    const open = this.ctx
      .getWebSockets()
      .filter((ws) => ws !== leaving && ws.readyState === 1 /* OPEN */);

    const message = JSON.stringify({ dancing: open.length });
    for (const ws of open) {
      try {
        ws.send(message);
      } catch {
        // Died between the filter and the send. Its own close event will
        // fire and correct the count, so there is nothing to do here.
      }
    }
  }
}
