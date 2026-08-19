import { API_URL } from "./api";

const CHANNEL = "as242-live-sync";

export function publishLocalChange(entity, action = "update") {
  if (typeof window === "undefined") return;
  const payload = { type: "change", entity, action, at: Date.now() };
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage(payload);
    bc.close();
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem("as242_sync_ping", JSON.stringify(payload));
    localStorage.removeItem("as242_sync_ping");
  } catch {
    /* ignore */
  }
}

/**
 * Listen for live changes (SSE + BroadcastChannel + storage).
 * Returns an unsubscribe function.
 */
export function subscribeLiveChanges(onChange) {
  if (typeof window === "undefined") return () => {};

  let es;
  let bc;
  let closed = false;
  let timer;

  const handle = (event) => {
    if (!event || event.type === "connected") return;
    onChange(event);
  };

  try {
    bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = (msg) => handle(msg.data);
  } catch {
    /* ignore */
  }

  const onStorage = (e) => {
    if (e.key !== "as242_sync_ping" || !e.newValue) return;
    try {
      handle(JSON.parse(e.newValue));
    } catch {
      /* ignore */
    }
  };
  window.addEventListener("storage", onStorage);

  const connect = () => {
    if (closed) return;
    try {
      es = new EventSource(`${API_URL}/api/events`);
      es.onmessage = (msg) => {
        try {
          handle(JSON.parse(msg.data));
        } catch {
          /* ignore */
        }
      };
      es.onerror = () => {
        es?.close();
        timer = setTimeout(connect, 2000);
      };
    } catch {
      timer = setTimeout(connect, 3000);
    }
  };

  connect();

  return () => {
    closed = true;
    clearTimeout(timer);
    es?.close();
    bc?.close();
    window.removeEventListener("storage", onStorage);
  };
}
