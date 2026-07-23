const clients = new Set();

function broadcast(event) {
  const payload = `data: ${JSON.stringify({
    ...event,
    at: Date.now(),
  })}\n\n`;

  for (const res of clients) {
    try {
      res.write(payload);
    } catch {
      clients.delete(res);
    }
  }
}

function addClient(res) {
  clients.add(res);
}

function removeClient(res) {
  clients.delete(res);
}

function notify(entity, action = "update") {
  broadcast({ type: "change", entity, action });
}

module.exports = { addClient, removeClient, notify, broadcast };
