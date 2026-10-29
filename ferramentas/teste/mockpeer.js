// Imitação mínima do PeerJS usando BroadcastChannel (só para teste local)
(() => {
  class Emissor { constructor() { this._h = {}; } on(e, f) { (this._h[e] = this._h[e] || []).push(f); } _emit(e, ...a) { (this._h[e] || []).forEach(f => f(...a)); } }
  const bc = new BroadcastChannel("mockpeer");
  const peers = {}; const conns = {};
  bc.onmessage = ev => {
    const m = ev.data;
    if (m.type === "connect" && peers[m.to]) { const c = new Conn(m.connId, m.to, m.from); conns[m.connId + m.to] = c; peers[m.to]._emit("connection", c); setTimeout(() => { c.open = true; c._emit("open"); bc.postMessage({ type: "ack", connId: m.connId, to: m.from }); }, 5); }
    else if (m.type === "ack" && conns[m.connId + m.to]) { const c = conns[m.connId + m.to]; c.open = true; c._emit("open"); }
    else if (m.type === "data" && conns[m.connId + m.to]) { conns[m.connId + m.to]._emit("data", JSON.parse(JSON.stringify(m.payload))); }
    else if (m.type === "close" && conns[m.connId + m.to]) { const c = conns[m.connId + m.to]; c.open = false; c._emit("close"); }
    else if (m.type === "exists?" && peers[m.id]) bc.postMessage({ type: "exists!", id: m.id, asker: m.asker });
    else if (m.type === "exists!" && peers[m.asker] && peers[m.asker]._waiting) { peers[m.asker]._waiting(m.id); }
  };
  class Conn extends Emissor { constructor(id, self, peer) { super(); this.connId = id; this.self = self; this.peer = peer; this.open = false; }
    send(d) { bc.postMessage({ type: "data", connId: this.connId, to: this.peer, payload: d }); }
    close() { this.open = false; bc.postMessage({ type: "close", connId: this.connId, to: this.peer }); this._emit("close"); } }
  window.Peer = class extends Emissor {
    constructor(id) {
      super(); this.id = typeof id === "string" ? id : "anon-" + Math.random().toString(36).slice(2);
      if (typeof id !== "string") { peers[this.id] = this; setTimeout(() => this._emit("open", this.id), 20); return; }
      // como no servidor de verdade: um id que já está em uso devolve "unavailable-id"
      const eu = "chk-" + Math.random().toString(36).slice(2); let ocupado = false;
      peers[eu] = { _waiting: who => { if (who === id) ocupado = true; } };
      bc.postMessage({ type: "exists?", id, asker: eu });
      setTimeout(() => { delete peers[eu]; if (ocupado || (peers[id] && peers[id] !== this)) this._emit("error", { type: "unavailable-id" }); else { peers[this.id] = this; this._emit("open", this.id); } }, 80);
    }
    connect(to) {
      const id = Math.random().toString(36).slice(2), c = new Conn(id, this.id, to); conns[id + this.id] = c;
      let achou = false; this._waiting = who => { if (who === to) achou = true; };
      bc.postMessage({ type: "exists?", id: to, asker: this.id });
      setTimeout(() => { if (!achou) this._emit("error", { type: "peer-unavailable" }); else bc.postMessage({ type: "connect", to, from: this.id, connId: id }); }, 120);
      return c;
    }
    destroy() { delete peers[this.id]; }
  };
})();
