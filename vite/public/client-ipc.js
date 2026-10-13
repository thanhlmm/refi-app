const replyHandlers = new Map();
const listeners = new Map();

window.ipc.onMessage((msg) => {
  if (window.IS_DEV) {
    console.log("Received from server", msg);
  }

  if (msg.type === "error") {
    const { id, message } = msg;

    const handler = replyHandlers.get(id);
    if (handler) {
      replyHandlers.delete(id);
      handler.reject(new Error(message || "Unknown error"));
    }
  } else if (msg.type === "reply") {
    const { id, result } = msg;

    const handler = replyHandlers.get(id);
    if (handler) {
      replyHandlers.delete(id);
      handler.resolve(result);
    }
  } else if (msg.type === "push") {
    const { name, args, option } = msg;

    const listens = listeners.get(name);
    if (listens) {
      listens.forEach((listener) => {
        listener(args, msg, option);
      });
    }
  } else {
    throw new Error("Unknown message type: " + JSON.stringify(msg));
  }
});

function send(name, args) {
  return new Promise((resolve, reject) => {
    let id = crypto.randomUUID();
    replyHandlers.set(id, { resolve, reject });
    window.ipc.request({ id, name, args });
  });
}

function listen(name, cb) {
  if (!listeners.get(name)) {
    listeners.set(name, []);
  }
  listeners.get(name).push(cb);

  return () => {
    let arr = listeners.get(name);
    listeners.set(
      name,
      arr.filter((cb_) => cb_ !== cb)
    );
  };
}

function unlisten(name) {
  listeners.set(name, []);
}
