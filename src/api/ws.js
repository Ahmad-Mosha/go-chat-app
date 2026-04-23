/**
 * WebSocket service — real-time message delivery.
 *
 * Mock mode: no-op (messages appear via sendMessage API).
 * Real mode: connects to ws://host/api/ws with JWT.
 *
 * Usage:
 *   const disconnect = connectWebSocket(token, (message) => { ... });
 *   // later: disconnect();
 */

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
const USE_MOCK = false;

export function connectWebSocket(token, onMessage) {
  if (USE_MOCK) {
    // In mock mode, there's no real WebSocket — messages are added
    // directly via the sendMessage API. Return a no-op disconnect.
    return () => {};
  }

  // Real WebSocket connection
  const ws = new WebSocket(`${WS_BASE}/api/ws?token=${token}`);

  ws.onopen = () => {
    console.log('[WS] Connected');
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      onMessage(message);
    } catch (err) {
      console.error('[WS] Failed to parse message:', err);
    }
  };

  ws.onerror = (err) => {
    console.error('[WS] Error:', err);
  };

  ws.onclose = () => {
    console.log('[WS] Disconnected');
    // TODO: implement reconnection logic
  };

  // Return disconnect function
  return () => {
    ws.close();
  };
}

/**
 * Send a message through WebSocket (for real-time mode).
 * In mock mode, use the REST sendMessage API instead.
 */
export function sendWsMessage(ws, roomId, content) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    room_id: roomId,
    content,
  }));
}
