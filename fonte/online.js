/* ================= Online: cada um no seu celular =================
   O celular de quem cria a sala ("anfitrião") roda a partida e manda o estado para os outros.
   Os outros mandam só o que fazem: chute, palavra secreta, tiro, movimento, voto, compra e sugestão. */
const ON = { on: false, host: false, peer: null, code: "", sala: [], robos: 2, fp: true, timer: null, hostConn: null, myIdx: 0,
  meuNome: "", salaNomes: [], pedido: null, esperaTxt: "", actKey: "", fimVisto: false, movT: 0, movUlt: "", conectando: false };
const PREFIXO = "metesarrafo-v1-";
const SALA_DO_ANDRE = "ANDREK7Q";   // código fixo: é o que está no QR impresso (materiais/)
const onHost = () => ON.on && ON.host;
const onCli = () => ON.on && !ON.host;
function gerarCodigo() { const L = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; let c = ""; for (let i = 0; i < 4; i++) c += L[Math.floor(Math.random() * L.length)]; return c; }
function linkSala(code) { return location.origin + location.pathname + "?sala=" + code; }
function enviar(conn, msg) { try { if (conn && conn.open) conn.send(msg); } catch {} }
function agir(msg) { if (onHost()) entrada(A.P[ON.myIdx], msg); else if (ON.hostConn) enviar(ON.hostConn, msg); }
TELAS_COM_MUSICA.push("salaHost", "esperando", "entrar", "criandoSala");

/* ---------- Anfitrião: criar sala ---------- */
function usarSalaFixa() { return G.salaFixa ?? (perfil().toLowerCase() === "andre"); }
function criarSala(fixa = usarSalaFixa()) {
  if (typeof Peer === "undefined") { toast("A conexão online não carregou. Confira a internet."); return; }
  if (ON.peer) { try { ON.peer.destroy(); } catch {} }
  ON.host = true; ON.on = false; ON.code = fixa ? SALA_DO_ANDRE : gerarCodigo(); ON.sala = [];
  const peer = new Peer(PREFIXO + ON.code, { debug: 0 });
  ON.peer = peer;
  ir("criandoSala");
  peer.on("open", () => { if (G.tela === "criandoSala") ir("salaHost"); });
  peer.on("error", e => {
    if (e.type === "unavailable-id") {
      if (fixa) toast("A Sala do Andre já está aberta em outro aparelho ou aba. Abri uma sala com outro código.");
      criarSala(false); return;
    }
    if (e.type === "peer-unavailable") return;
    toast("Problema na conexão: " + e.type);
    if (G.tela === "criandoSala") ir("lobby");
  });
  peer.on("connection", conn => {
    conn.on("data", d => hostRecebe(conn, d));
    conn.on("close", () => hostSaiu(conn));
    conn.on("error", () => hostSaiu(conn));
  });
}
function enviarSala() {
  const nomes = [perfil(), ...ON.sala.map(s => s.nome)];
  ON.sala.forEach(s => enviar(s.conn, { t: "sala", nomes, robos: ON.robos, code: ON.code }));
}
TELAS.criandoSala = () => `
  <section data-fundo="${fundoAtual()}" class="bgf lobby"><h1 class="lb-title" style="font-size:40px">Criando sala…</h1><p class="lb-sub">Conectando ao servidor.</p>
  <button class="lb-pill" data-a="encerrarSala" style="align-self:center">Cancelar</button></section>`;
TELAS.salaHost = () => {
  const total = 1 + ON.sala.length + ON.robos;
  const ok = total >= 3 && total <= 20;
  depoisFn = () => {
    const box = $("qr-sala"); if (!box) return; box.innerHTML = "";
    try { new QRCode(box, { text: linkSala(ON.code), width: 400, height: 400, colorDark: "#0f3057", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M }); } catch { box.textContent = ON.code; }
  };
  return `
  <section data-fundo="${fundoAtual()}" class="bgf lobby" aria-label="Sala online">
    <div class="lb-top"><button class="lb-pill" data-a="encerrarSala">← Fechar sala</button><span class="lb-pill">Sala <b style="font-family:var(--display);font-size:20px;margin-left:6px">${esc(ON.code)}</b></span></div>
    <h1 class="lb-title" style="font-size:38px">Chame os amigos</h1>
    <p class="lb-sub">Eles escaneiam o QR code ou abrem o link no celular deles. Ninguém precisa de conta.</p>
    ${ON.sala.length ? "" : `<button class="lb-cont" data-a="trocarSala">${ON.code === SALA_DO_ANDRE ? "Usar um código sorteado" : "Usar a Sala do Andre (QR impresso)"}</button>`}
    <div class="qr" id="qr-sala" role="img" aria-label="QR code da sala"></div>
    <div class="url" style="color:#fff">${esc(linkSala(ON.code))}</div>
    <div class="card" style="background:rgba(11,27,51,.6)">
      <h3>Na sala (${1 + ON.sala.length} ${1 + ON.sala.length === 1 ? "pessoa" : "pessoas"})</h3>
      <div class="chips"><span class="chip">${esc(perfil())} (você)</span>${ON.sala.map(s => `<span class="chip">${esc(s.nome)}</span>`).join("")}</div>
      ${ON.sala.length ? "" : `<p class="dim">Esperando os amigos entrarem…</p>`}
      <h3>Robôs</h3>
      <div class="stepper"><button class="btn ghost" type="button" data-a="robosMenos" aria-label="Menos um robô">−</button><b>${ON.robos}</b><button class="btn ghost" type="button" data-a="robosMais" aria-label="Mais um robô">+</button></div>
      <h3>Sua visão</h3>
      <span class="seg2" role="group" aria-label="Visão do jogo" style="align-self:flex-start">
        <button type="button" data-a="visaoFp" aria-pressed="${ON.fp !== false}">1ª pessoa</button><button type="button" data-a="visaoCima" aria-pressed="${ON.fp === false}">De cima</button>
      </span>
      <p class="dim" style="font-size:14px">Total: ${total} jogadores (de 3 a 20). Cada amigo escolhe a visão no celular dele.</p>
    </div>
    <button class="lb-jogar" data-a="comecarOnline" ${ok ? "" : "disabled"} style="flex:none;min-height:70px">${ok ? "Começar" : "Precisa de 3"}</button>
  </section>`;
};
Object.assign(acoes, {
  encerrarSala() { encerrarOnline(); },
  trocarSala() { const fixa = ON.code !== SALA_DO_ANDRE; G.salaFixa = fixa; salvar(); criarSala(fixa); },
  robosMenos() { ON.robos = Math.max(0, ON.robos - 1); enviarSala(); render(); },
  robosMais() { if (1 + ON.sala.length + ON.robos < 20) ON.robos++; enviarSala(); render(); },
  visaoFp() { guardarDigitado(); ON.fp = true; G.visaoOnline = true; salvar(); render(); },
  visaoCima() { guardarDigitado(); ON.fp = false; G.visaoOnline = false; salvar(); render(); },
  comecarOnline() { comecarOnline(); },
});
function guardarDigitado() { const n = $("en-nome"), c = $("en-code"); if (n) ON.nomeDigitado = n.value; if (c) ON.codeDigitado = c.value; }
function hostRecebe(conn, d) {
  if (!d || typeof d !== "object") return;
  if (d.t === "hello") {
    if (ON.on) { enviar(conn, { t: "fora", msg: "A partida já começou. Espere a próxima rodada e entre de novo." }); return; }
    if (1 + ON.sala.length + ON.robos >= 20) { enviar(conn, { t: "fora", msg: "A sala está cheia." }); return; }
    if (ON.sala.some(s => s.conn === conn)) return;
    const base = String(d.nome || "Amigo").replace(/\s+/g, " ").trim().slice(0, 20) || "Amigo";
    const usados = [perfil(), ...ON.sala.map(s => s.nome)];
    let nome = base, k = 2; while (usados.some(u => u.toLowerCase() === nome.toLowerCase())) nome = base + " " + (k++);
    ON.sala.push({ conn, nome, moedas: Math.max(0, +d.moedas || 0), vidasInv: Math.max(0, Math.floor(+d.vidas || 0)) });
    enviar(conn, { t: "bemvindo", nome, code: ON.code });
    enviarSala(); toast(`${nome} entrou na sala`); bip(880, .08);
    if (G.tela === "salaHost") render();
    return;
  }
  if (!ON.on) return;
  const p = A.P.find(q => q.conn === conn);
  if (p) entrada(p, d);
}
function hostSaiu(conn) {
  if (!ON.host) return;
  if (!ON.on) {
    const s = ON.sala.find(x => x.conn === conn); if (!s) return;
    ON.sala = ON.sala.filter(x => x.conn !== conn); enviarSala(); toast(`${s.nome} saiu da sala`);
    if (G.tela === "salaHost") render();
    return;
  }
  const p = A.P.find(q => q.conn === conn); if (!p || !p.remoto) return;
  p.remoto = false; p.humano = false; p.conn = null; p.ctrl = false;
  if (p.vivo && p.modo !== "casa" && p.modo !== "mira") { p.alvo = { ...p.home }; p.modo = "voltando"; }
  toast(`${p.nome} saiu. Um robô joga no lugar.`);
  const ph = A.ph || {};
  if (ON.pedido && ON.pedido.idx === p.i) {
    const tipo = ON.pedido.tipo; ON.pedido = null; ON.esperaTxt = ""; fecharOv();
    if (tipo === "segredo") novaPalavraA(p); else eliminarA(p);
  }
  if (ph.k === "pergunta" && ph.ordem[ph.idx] === p) ph.pensa = 1;
}

/* ---------- Anfitrião: começar ---------- */
function comecarOnline() {
  const lista = [{ nome: perfil(), local: true }].concat(ON.sala.filter(s => s.conn.open).map(s => ({ nome: s.nome, conn: s.conn, moedas: s.moedas, vidasInv: s.vidasInv })));
  for (let k = 1; k <= ON.robos; k++) lista.push({ nome: "Robô " + k, robo: true });
  if (lista.length < 3) { toast("Precisa de pelo menos 3 jogadores"); return; }
  const n = lista.length;
  A.cfg = { ...G.cfg };
  A.P = lista.map((o, i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / n;
    const home = { x: AC + AH * Math.cos(a), y: AC + AH * Math.sin(a) };
    return { i, nome: o.nome, humano: !o.robo, remoto: !!o.conn, conn: o.conn || null, vidasInv: o.vidasInv || 0, mov: { x: 0, y: 0 },
      cor: A_CORES[i % A_CORES.length], pele: A_PELE[i % A_PELE.length],
      vidas: A.cfg.vidas, vivo: true, moedas: o.local ? (G.banco[o.nome] || 0) : (o.moedas || 0), ganho: 0, compradas: 0,
      home, x: home.x, y: home.y, alvo: null, modo: "casa", vel: A_VEL * aRnd(.88, 1.12), habil: aRnd(-.08, .08),
      flash: 0, passo: 0, ctrl: false, tocou: false, saiuEm: null };
  });
  A.cel = 0; ON.myIdx = 0; A.balls = []; A.fx = []; A.t = 0; A.fim = null; A.ptr = null; A.inicio = Date.now();
  A.st = { palavras: 0, acertos: 0, erros: 0, timeouts: 0, votos: 0, votosOk: 0, arremessos: 0, acertosBola: 0, rodadas: 0, compras: 0, moedas: {}, eventos: [] };
  ON.on = true; ON.pedido = null; ON.esperaTxt = ""; ON.fimVisto = false;
  $("app").hidden = true; $("arena").hidden = false; $("a-setup").hidden = true; $("a-game").hidden = false;
  window.scrollTo(0, 0);
  const estatico = A.P.map(p => ({ nome: p.nome, cor: p.cor, pele: p.pele, humano: p.humano, hx: Math.round(p.home.x), hy: Math.round(p.home.y) }));
  A.P.forEach(p => { if (p.conn) enviar(p.conn, { t: "start", P: estatico, eu: p.i, cfg: A.cfg }); });
  A.fp = false;
  novaPalavraA(aPick(A.P));
  iniciarLoop();
  ligarVisao(ON.fp !== false);
  clearInterval(ON.timer); ON.timer = setInterval(enviarEstado, 70);
}
function estadoAtual() {
  const ph = A.ph || {}, idx = p => (p ? p.i : -1);
  const masc = ph.palavra && ph.rev ? [...ph.palavra].map((c, i) => (c === " " ? " " : ph.rev.has(i) ? c : "_")).join("") : "";
  return {
    t: "st", tt: +A.t.toFixed(2), msg: $("a-sub").textContent, espera: ON.esperaTxt || "",
    fim: A.fim ? { v: A.fim.vencedor.i } : null,
    P: A.P.map(p => [Math.round(p.x), Math.round(p.y), p.vidas, p.vivo ? 1 : 0, Math.round(p.moedas * 10) / 10, +p.flash.toFixed(2), p.modo, p.ctrl ? 1 : 0, p.tocou ? 1 : 0, p.humano ? 1 : 0, Math.round(p.ganho * 10) / 10]),
    B: A.balls.map(b => [Math.round(b.from.x), Math.round(b.from.y), Math.round(b.to.x), Math.round(b.to.y), +b.t.toFixed(3), +b.T.toFixed(3)]),
    fx: A.fx.filter(f => !f.env).map(f => { f.env = true; return [Math.round(f.x), Math.round(f.y), f.txt, f.cor]; }),
    ph: { k: ph.k || "", perg: idx(ph.perg), atir: idx(ph.atir), ordem: (ph.ordem || []).map(p => p.i), idx: ph.idx || 0, voltas: ph.voltas || 0,
      tema: ph.tema || "", masc, palavra: ph.k === "bola" ? ph.palavra : "", prazo: ph.k === "pergunta" && ph.prazo ? Math.max(0, +(ph.prazo - A.t).toFixed(2)) : 0,
      espera: !!ph.espera, cd: +(ph.cd || 0).toFixed(2), pronto: !!ph.pronto, votou: !!ph.votou,
      voto: ph.voto ? { ate: Math.max(0, Math.ceil((ph.voto.ate - Date.now()) / 1000)), sim: ph.voto.sim.size + ph.voto.robos, total: ph.ordem.length, votaram: [...ph.voto.sim, ...ph.voto.nao] } : null },
  };
}
function enviarEstado() {
  if (!onHost()) return;
  const s = estadoAtual();
  A.P.forEach(p => { if (p.conn && p.remoto) enviar(p.conn, s); });
}

/* ---------- O que cada jogador faz (anfitrião confere tudo) ---------- */
function entrada(p, d) {
  if (!p || !d) return;
  const ph = A.ph || {};
  switch (d.t) {
    case "chute":
      if (ph.k === "pergunta" && !ph.voto && !A.ov && ph.ordem[ph.idx] === p) {
        const c = norm(String(d.texto || "").slice(0, 30));
        if (c) chuteA(p, c === norm(ph.palavra), c, false);
      }
      break;
    case "segredo":
      if (ON.pedido && ON.pedido.idx === p.i && ON.pedido.tipo === "segredo") {
        const pal = norm(String(d.palavra || "").slice(0, 24)), letra = norm(String(d.letra || "")).slice(0, 1);
        const tema = String(d.tema || "").replace(/\s+/g, " ").trim().slice(0, 30) || "Tema";
        if (pal && letra && pal.includes(letra)) { ON.pedido = null; ON.esperaTxt = ""; fecharOv(); comecarPerguntaA(p, tema, pal, letra); }
      }
      break;
    case "tiro":
      if (ph.k === "bola" && ph.pronto && ph.atir === p && p.modo === "mira" && ph.cd <= 0 && aCorrendo().length) {
        arremessarA({ x: Math.max(0, Math.min(AW, +d.x || 0)), y: Math.max(0, Math.min(AW, +d.y || 0)) });
      }
      break;
    case "mov":
      if (p.ctrl && p.remoto) { const x = +d.x || 0, y = +d.y || 0, m = Math.hypot(x, y); p.mov = m > 1 ? { x: x / m, y: y / m } : { x, y }; }
      break;
    case "dificil":
      if (ph.k === "pergunta" && !ph.votou && !ph.voto && !A.ov && ph.ordem.includes(p)) abrirVoto(false);
      break;
    case "voto":
      if (ph.voto && ph.ordem.includes(p) && p.humano) { ph.voto.sim.delete(p.i); ph.voto.nao.delete(p.i); (d.sim ? ph.voto.sim : ph.voto.nao).add(p.i); }
      break;
    case "compra":
      if (ON.pedido && ON.pedido.idx === p.i && ON.pedido.tipo === "compra") {
        ON.pedido = null; ON.esperaTxt = ""; fecharOv();
        if (d.escolha === "usar" && p.compradas < A.cfg.maxCompra && (!p.remoto || p.vidasInv > 0)) {
          if (p.remoto) p.vidasInv--;
          p.compradas++; p.vidas = 1; A.st.compras++;
          aEvento("usouVida", { quem: p.nome }); aFx(p.x, p.y - 60, "+1 vida", "#ffd23f"); aMsg(`${p.nome} usou uma vida extra.`);
        } else if (d.escolha === "comprar" && p.moedas >= A.cfg.preco && p.compradas < A.cfg.maxCompra) comprarA(p);
        else eliminarA(p);
      }
      break;
    case "sug": {
      const nota = [1, 2, 3, 4, 5].includes(d.nota) ? d.nota : null;
      const doc = { nome: p.nome, nota, legal: String(d.legal || "").slice(0, 500), mudaria: String(d.mudaria || "").slice(0, 800), em: Date.now(), partidaId: null, online: true };
      if (doc.nota || doc.legal.trim() || doc.mudaria.trim()) { guardarLocal(doc); if (p.i !== ON.myIdx) toast(`Sugestão de ${p.nome} recebida`); }
      break;
    }
  }
}
function pedir(p, dados) {
  ON.pedido = { idx: p.i, tipo: dados.tipo };
  if (p.i === ON.myIdx) { mostrarPedido(dados); return; }
  ON.esperaTxt = dados.tipo === "segredo" ? `${p.nome} está escolhendo a palavra secreta…` : `${p.nome} está decidindo se volta pro jogo…`;
  abrirOv(`<h2>Esperando…</h2><p class="dim">${esc(ON.esperaTxt)}</p>`);
  enviar(p.conn, { t: "pede", ...dados });
}

/* ---------- Telas de pedido (palavra secreta e última vida), iguais no anfitrião e nos amigos ---------- */
function mostrarPedido(d) {
  if (d.tipo === "segredo") {
    let tema = "", letra = "";
    const temas = Object.keys(AP).concat(["Times", "Filmes e desenhos", "Cores"]);
    const desenhar = () => {
      const palavra = norm(($("ov-pal") || {}).value || "");
      const letras = [...new Set(palavra.replace(/ /g, ""))];
      abrirOv(`
        <h2>Sua palavra secreta</h2>
        <p class="dim">Só você está vendo esta tela.</p>
        <div class="chips">${temas.map(t => `<button type="button" class="chip pick" data-tema="${esc(t)}" aria-pressed="${t === tema}">${esc(t)}</button>`).join("")}</div>
        <input id="ov-pal" maxlength="24" autocapitalize="characters" spellcheck="false" placeholder="Escreva a palavra" value="${esc(palavra)}" aria-label="Palavra secreta">
        ${letras.length ? `<p class="dim">Qual letra todo mundo vai ver?</p><div class="chips">${letras.map(l => `<button type="button" class="chip pick" data-letra="${l}" aria-pressed="${l === letra}">${l}</button>`).join("")}</div>` : `<p class="dim">Depois de escrever, escolha a letra que vai aparecer.</p>`}
        <button class="btn" id="ov-go" type="button" ${palavra && tema && letras.includes(letra) ? "" : "disabled"}>Pronto</button>`, ov => {
        const inp = ov.querySelector("#ov-pal");
        inp.addEventListener("input", () => { const pos = inp.selectionStart; inp.value = inp.value.toUpperCase(); try { inp.setSelectionRange(pos, pos); } catch {} });
        inp.addEventListener("change", desenhar);
        ov.querySelectorAll("[data-tema]").forEach(b => b.addEventListener("click", () => { tema = b.dataset.tema; desenhar(); }));
        ov.querySelectorAll("[data-letra]").forEach(b => b.addEventListener("click", () => { letra = b.dataset.letra; desenhar(); }));
        ov.querySelector("#ov-go").addEventListener("click", () => {
          const pal = norm(inp.value);
          if (!pal || !tema || !letra || !pal.includes(letra)) return;
          fecharOv(); agir({ t: "segredo", tema, palavra: pal, letra });
        });
      });
      setTimeout(() => { const i = $("ov-pal"); if (i && !i.value) i.focus(); }, 30);
    };
    desenhar();
    return;
  }
  if (d.tipo === "compra") {
    const nome = ON.meuNome || perfil(), inv = invVidas(nome);
    abrirOv(`<h2>Você perdeu a última vida</h2><p>Você tem <b class="coin">${fmtM(d.moedas)}</b> moedas${inv ? ` e <b class="hearts">${inv} ${inv === 1 ? "vida extra guardada" : "vidas extras guardadas"}</b>` : ""}.</p>
      ${inv && d.podeMais ? `<button class="btn ok" id="ov-usar" type="button">Usar vida extra guardada</button>` : ""}
      ${d.moedas >= d.preco && d.podeMais ? `<button class="btn ${inv ? "ghost" : "ok"}" id="ov-sim" type="button">Comprar vida extra agora (${d.preco})</button>` : ""}
      <button class="btn no" id="ov-nao" type="button">Sair do jogo</button>`, ov => {
      const usar = ov.querySelector("#ov-usar"), comprar = ov.querySelector("#ov-sim");
      if (usar) usar.addEventListener("click", () => { fecharOv(); mudarInv(nome, -1); if (onHost()) salvarPlacar(); else salvar(); agir({ t: "compra", escolha: "usar" }); });
      if (comprar) comprar.addEventListener("click", () => { fecharOv(); agir({ t: "compra", escolha: "comprar" }); });
      ov.querySelector("#ov-nao").addEventListener("click", () => { fecharOv(); agir({ t: "compra", escolha: "sair" }); });
    });
  }
}

/* ---------- Ganchos no motor da partida (só valem no modo online) ---------- */
const _prepararVez = prepararVez;
prepararVez = function () {
  if (!onHost()) return _prepararVez();
  const ph = A.ph, p = ph.ordem[ph.idx];
  ph.espera = false;
  if (!p.humano) ph.pensa = aRnd(1.5, 4); else ph.prazo = A.t + A.cfg.tempo;
  renderAct();
};
const _mostrarSegredo = mostrarSegredo;
mostrarSegredo = function () { if (!onHost()) return _mostrarSegredo(); pedir(A.ph.perg, { tipo: "segredo" }); };
const _iniciarBolaA = iniciarBolaA;
iniciarBolaA = function (atir) {
  if (!onHost()) return _iniciarBolaA(atir);
  A.ph = { k: "bola", atir, cd: .6, atingidos: new Set(), palavra: A.ph.palavra, pronto: true, t0: A.t };
  atir.alvo = { x: AC, y: AC }; atir.modo = "centro";
  for (const p of aVivos()) {
    if (p === atir) continue;
    p.tocou = false; p.mov = { x: 0, y: 0 };
    p.ctrl = p.humano;
    if (p.ctrl) { p.modo = "fugindo"; p.alvo = null; continue; }
    const a = Math.atan2(p.home.y - AC, p.home.x - AC) + Math.PI + aRnd(-.5, .5);
    p.alvo = { x: AC + AH * Math.cos(a), y: AC + AH * Math.sin(a) }; p.modo = "fugindo";
  }
  renderAct();
};
const _moverControlado = moverControlado;
moverControlado = function (p, dt) {
  if (!(onHost() && p.remoto)) return _moverControlado(p, dt);
  const m = p.mov || { x: 0, y: 0 }, v = A_VEL * 1.05;
  p.vx = m.x * v; p.vy = m.y * v;
  p.x = Math.min(AW - 30, Math.max(30, p.x + m.x * v * dt)); p.y = Math.min(AW - 30, Math.max(30, p.y + m.y * v * dt));
  if (m.x || m.y) p.passo += Math.hypot(m.x, m.y) * v * dt;
  const oposto = { x: 2 * AC - p.home.x, y: 2 * AC - p.home.y };
  if (!p.tocou && aDist(p, oposto) < 150) { p.tocou = true; p.modo = "voltando"; }
  if (p.tocou && aDist(p, p.home) < 34) { p.x = p.home.x; p.y = p.home.y; p.modo = "casa"; p.ctrl = false; p.mov = { x: 0, y: 0 }; }
};
const _mostrarCompra = mostrarCompra;
mostrarCompra = function (p) {
  if (!onHost()) return _mostrarCompra(p);
  pedir(p, { tipo: "compra", moedas: Math.round(p.moedas * 10) / 10, preco: A.cfg.preco, podeMais: p.compradas < A.cfg.maxCompra });
};
const _invVidas = invVidas;
invVidas = function (n) {
  if (onHost()) { const p = A.P.find(q => q.nome === n && q.remoto); if (p) return p.vidasInv || 0; }
  return _invVidas(n);
};
const _abrirVoto = abrirVoto;
abrirVoto = function (soRobos) {
  if (!onHost()) return _abrirVoto(soRobos);
  const ph = A.ph; ph.votou = true; A.st.votos++;
  const frac = ph.rev.size / ph.palavra.length;
  const robos = ph.ordem.filter(q => !q.humano && Math.random() < .8 - frac * .6).length;
  const humanos = ph.ordem.filter(q => q.humano);
  ph.voto = { sim: new Set(), nao: new Set(), robos, ate: Date.now() + (humanos.length ? 10000 : 0) };
  aMsg('Votação "tá difícil"! Cada um vota no seu celular.');
  renderAct();
};
function checarVoto() {
  const ph = A.ph; if (!ph || !ph.voto) return;
  const v = ph.voto, humanos = ph.ordem.filter(q => q.humano);
  const todos = humanos.every(q => v.sim.has(q.i) || v.nao.has(q.i));
  if (!todos && Date.now() < v.ate) return;
  ph.voto = null;
  const votos = v.sim.size + v.robos, total = ph.ordem.length, perg = ph.perg;
  if (votos > total / 2) {
    A.st.votosOk++;
    const perda = perg.moedas * A.cfg.perdaVoto / 100; perg.moedas -= perda; perg.ganho -= perda;
    aEvento("votoPassou", { votos, total, perg: perg.nome });
    const novo = aPick(aVivos().filter(q => q !== perg));
    aMsg(`Votação passou (${votos} de ${total}). ${perg.nome} perde ${fmtM(perda)} moedas e ${novo.nome} pergunta agora.`);
    novaPalavraA(novo);
  } else {
    aEvento("votoNaoPassou", { votos, total });
    const l = revelarMaisA(ph);
    aMsg(`Votação não passou (${votos} de ${total}).${l ? ` Dica: tem a letra ${l}.` : ""}`);
    prepararVez();
  }
  renderAct();
}
const _passoA = passoA;
passoA = function (dt) {
  if (onCli()) return passoCliente(dt);
  if (onHost() && A.ph && A.ph.voto) { checarVoto(); for (const f of A.fx) f.t += dt; A.fx = A.fx.filter(f => f.t < 1.4); return; }
  return _passoA(dt);
};
const _arremessarA = arremessarA;
arremessarA = function (to) {
  if (onCli()) { agir({ t: "tiro", x: Math.round(to.x), y: Math.round(to.y) }); bip(500, .06); return; }
  return _arremessarA(to);
};
const _renderAct = renderAct;
renderAct = function () { if (ON.on) return renderActOnline(); return _renderAct(); };
const _mostrarFim = mostrarFim;
mostrarFim = function () { if (ON.on) return mostrarFimOnline(); return _mostrarFim(); };
const _fecharArena = fecharArena;
fecharArena = function () { if (ON.on || ON.peer) { if (ON.host) encerrarOnline(); else sairOnline(); return; } return _fecharArena(); };

/* ---------- Painel de ações no modo online ---------- */
function renderActOnline() {
  const box = $("a-act"), ph = A.ph || {}, me = A.P[ON.myIdx];
  if (!me) return;
  if (A.fim) { box.innerHTML = `<p>${esc(A.fim.vencedor.nome)} venceu!</p>`; return; }
  const btnDificil = podeVotar => podeVotar ? `<button class="btn ghost small" id="a-dif" type="button">Tá difícil!</button>` : "";
  if (ph.k === "pergunta") {
    const vez = ph.ordem[ph.idx], souResp = ph.ordem.includes(me);
    if (ph.voto) {
      const votou = ph.voto.votaram ? ph.voto.votaram.includes(me.i) : (ph.voto.sim.has(me.i) || ph.voto.nao.has(me.i));
      box.innerHTML = `<h3>Votação: tá difícil?</h3>` + (souResp && !votou
        ? `<div class="grid2"><button class="btn no" id="v-sim" type="button">Tá difícil</button><button class="btn ok" id="v-nao" type="button">Dá pra acertar</button></div>`
        : `<p class="dim">${souResp ? "Voto enviado. Esperando os outros…" : "A turma está votando…"}</p>`);
      const vs = $("v-sim"), vn = $("v-nao");
      const votar = sim => { agir({ t: "voto", sim }); box.innerHTML = `<h3>Votação: tá difícil?</h3><p class="dim">Voto enviado. Esperando os outros…</p>`; };
      if (vs) vs.addEventListener("click", () => votar(true));
      if (vn) vn.addEventListener("click", () => votar(false));
      return;
    }
    if (vez === me && !ph.espera) {
      box.innerHTML = `
        <div class="top"><h3>Sua vez!</h3><b id="a-secs" style="font-family:var(--display);font-size:22px"></b></div>
        <form id="a-guess" class="row" autocomplete="off"><input id="a-chute" maxlength="30" autocapitalize="characters" spellcheck="false" placeholder="Seu chute" aria-label="Seu chute"><button class="btn small" style="flex:0 0 auto;width:auto" type="submit">Chutar</button></form>
        ${btnDificil(!ph.votou)}`;
      $("a-guess").addEventListener("submit", e => { e.preventDefault(); const inp = $("a-chute"), c = inp.value.trim(); if (!c) return; inp.value = ""; inp.disabled = true; agir({ t: "chute", texto: c }); });
      setTimeout(() => { const i = $("a-chute"); if (i) i.focus(); }, 30);
    } else if (ph.perg === me) {
      box.innerHTML = `<h3>Você está perguntando</h3><p class="dim">Agora é a vez de ${esc(vez ? vez.nome : "…")}. Cada erro te dá moedas!</p>`;
    } else {
      box.innerHTML = `<h3>Vez de ${esc(vez ? vez.nome : "…")}${vez && !vez.humano ? " 🤖" : ""}</h3>${btnDificil(souResp && !ph.votou)}`;
    }
    const d = $("a-dif"); if (d) d.addEventListener("click", () => { agir({ t: "dificil" }); d.disabled = true; });
    return;
  }
  if (ph.k === "bola") {
    const atir = ph.atir;
    if (atir === me) {
      box.innerHTML = A.fp ? `<h3>Você está com a bola!</h3><p class="dim">Arraste a tela para mirar. O círculo laranja mostra onde a bola cai. Toque em ATIRAR (no PC: espaço).</p>`
        : `<h3>Você está com a bola!</h3><div class="bar"><i id="a-rec"></i></div><p class="dim" id="a-rec-t"></p><p class="dim" style="font-size:14px">Toque na quadra para jogar. Mire na frente de quem corre.</p>`;
    } else if (me.vivo && me.ctrl) {
      box.innerHTML = A.fp ? `<h3>Corre!</h3><p class="dim">Polegar esquerdo: correr. Vá até o círculo amarelo do outro lado e volte pro seu lugar. No PC: WASD e mouse.</p>`
        : `<h3>Corre!</h3><p class="dim">Segure o dedo na quadra e o seu bonequinho vai atrás. Vá até a marca amarela e volte pro seu lugar. No PC: setas.</p>`;
    } else if (!me.vivo) box.innerHTML = `<h3>Você saiu desta partida</h3><p class="dim">Assistindo até o fim…</p>`;
    else box.innerHTML = `<h3>${esc(atir.nome)} está com a bola</h3><p class="dim">${me.modo === "casa" ? "Você está salvo no seu lugar." : "Olha a correria!"}</p>`;
    return;
  }
  if (ph.k === "segredo") { box.innerHTML = `<h3>${ph.perg === me ? "Escolha a palavra secreta" : esc(ph.perg ? ph.perg.nome : "Alguém") + " está escolhendo a palavra…"}</h3>`; return; }
  if (ph.k === "troca") { box.innerHTML = `<h3>${esc(ph.atir.nome)} vai perguntar agora</h3>`; return; }
  box.innerHTML = "";
}

/* ---------- Fim de partida online ---------- */
function mostrarFimOnline() {
  const v = A.fim.vencedor, me = A.P[ON.myIdx];
  const ord = [...A.P].sort((a, b) => (b.vivo - a.vivo) || (b.moedas - a.moedas));
  let nota = 0;
  const desenhar = enviado => abrirOv(`
    <p class="dim">Quem sobrou por último</p><div class="big-name">${esc(v.nome)}</div><h2>${v === me ? "Você venceu!" : "venceu!"}</h2>
    <table class="score"><thead><tr><th>Jogador</th><th class="num">Ganhou</th></tr></thead><tbody>${ord.map(p => `<tr class="${p.vivo ? "" : "out"}"><td style="text-align:left">${esc(p.nome)}${p.humano ? "" : " 🤖"}${p === me ? " (você)" : ""}</td><td class="num coin">+${fmtM(p.ganho || 0)}</td></tr>`).join("")}</tbody></table>
    ${enviado ? `<div class="card" style="background:var(--court-2)"><h3>Valeu pela ideia!</h3></div>` : `
    <div class="card" style="background:var(--court-2);text-align:left">
      <h3>Quão divertido foi?</h3>
      <div class="stars">${NOTAS.map(([e, t], i) => `<button type="button" data-n="${i + 1}" aria-pressed="${nota === i + 1}" aria-label="${t}">${e}<small>${t}</small></button>`).join("")}</div>
      <label for="fo-legal">O que foi mais legal?</label><textarea id="fo-legal" maxlength="500"></textarea>
      <label for="fo-mud">O que você mudaria no jogo?</label><textarea id="fo-mud" maxlength="800"></textarea>
      <button class="btn" id="fo-env" type="button">Enviar sugestão</button>
    </div>`}
    ${ON.host ? `<button class="btn ok" id="fo-nova" type="button">Nova partida com a mesma turma</button><button class="btn ghost small" id="fo-fim" type="button">Fechar a sala</button>`
      : `<p class="dim">Esperando quem criou a sala começar outra partida…</p><button class="btn ghost small" id="fo-sair" type="button">Sair da sala</button>`}`, ov => {
    const legal = ov.querySelector("#fo-legal"), mud = ov.querySelector("#fo-mud");
    ov.querySelectorAll("[data-n]").forEach(b => b.addEventListener("click", () => {
      nota = +b.dataset.n; ov.querySelectorAll("[data-n]").forEach(x => x.setAttribute("aria-pressed", String(+x.dataset.n === nota)));
    }));
    const env = ov.querySelector("#fo-env");
    if (env) env.addEventListener("click", () => {
      if (!nota && !legal.value.trim() && !mud.value.trim()) { toast("Toque numa carinha ou escreva alguma coisa"); return; }
      agir({ t: "sug", nota: nota || null, legal: legal.value, mudaria: mud.value }); desenhar(true);
    });
    const nova = ov.querySelector("#fo-nova"); if (nova) nova.addEventListener("click", novaRodadaSala);
    const fim = ov.querySelector("#fo-fim"); if (fim) fim.addEventListener("click", encerrarOnline);
    const sair = ov.querySelector("#fo-sair"); if (sair) sair.addEventListener("click", sairOnline);
  });
  desenhar(false);
}
function novaRodadaSala() {
  clearInterval(ON.timer); fecharOv(); pararLoop();
  ON.sala = A.P.filter(p => p.remoto && p.conn && p.conn.open).map(p => ({ conn: p.conn, nome: p.nome, moedas: Math.round(p.moedas * 10) / 10, vidasInv: p.vidasInv || 0 }));
  ON.sala.forEach(s => enviar(s.conn, { t: "voltaSala" }));
  ON.on = false; A.P = []; A.fim = null;
  $("arena").hidden = true; $("app").hidden = false;
  ir("salaHost"); enviarSala();
}
function limparOnline() {
  clearInterval(ON.timer); ON.timer = null;
  try { if (ON.hostConn) ON.hostConn.close(); } catch {}
  try { if (ON.peer) ON.peer.destroy(); } catch {}
  ON.peer = null; ON.hostConn = null; ON.on = false; ON.host = false; ON.sala = []; ON.pedido = null;
  pararLoop(); fecharOv(); A.fim = null;
  $("arena").hidden = true; $("app").hidden = false;
  if (location.search) { try { history.replaceState(null, "", location.pathname); } catch {} }
  ir("lobby");
}
function encerrarOnline() {
  (ON.on ? A.P.filter(p => p.conn).map(p => p.conn) : ON.sala.map(s => s.conn)).forEach(c => enviar(c, { t: "fora", msg: "A sala foi fechada. Valeu por jogar!" }));
  setTimeout(limparOnline, 150);
}
function sairOnline() { limparOnline(); }

/* ---------- Amigo: entrar numa sala ---------- */
const codigoUrl = (new URLSearchParams(location.search).get("sala") || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
if (codigoUrl) { ON.codeEntrar = codigoUrl; G.tela = "entrar"; }
TELAS.entrar = () => `
  <section data-fundo="${fundoAtual()}" class="bgf lobby" aria-label="Entrar na sala">
    <div class="lb-top"><button class="lb-pill" data-a="voltarLobby">← Início</button><span class="lb-pill">Sala <b style="font-family:var(--display);font-size:20px;margin-left:6px">${esc(ON.codeEntrar || "")}</b></span></div>
    <h1 class="lb-title" style="font-size:40px">Entrar no jogo</h1>
    <form class="card" data-a="entrarSala" autocomplete="off" style="background:rgba(11,27,51,.6)">
      <label for="en-nome">Seu nome</label>
      <input id="en-nome" maxlength="20" value="${esc(ON.nomeDigitado ?? G.perfil ?? "")}" placeholder="Como te chamam?" required>
      ${ON.codeEntrar ? "" : `<label for="en-code">Código da sala</label><input id="en-code" maxlength="8" autocapitalize="characters" placeholder="Ex.: K7QM" value="${esc(ON.codeDigitado || "")}">`}
      <label>Visão</label>
      <span class="seg2" role="group" aria-label="Visão do jogo" style="align-self:flex-start">
        <button type="button" data-a="visaoFp" aria-pressed="${G.visaoOnline !== false}">1ª pessoa</button><button type="button" data-a="visaoCima" aria-pressed="${G.visaoOnline === false}">De cima</button>
      </span>
      <button class="lb-jogar" type="submit" style="flex:none;min-height:64px;font-size:28px" ${ON.conectando ? "disabled" : ""}>${ON.conectando ? "Entrando…" : "Entrar"}</button>
    </form>
  </section>`;
TELAS.esperando = () => `
  <section data-fundo="${fundoAtual()}" class="bgf lobby" aria-label="Esperando começar">
    <div class="lb-top"><button class="lb-pill" data-a="sairSala">← Sair</button><span class="lb-pill">Sala <b style="font-family:var(--display);font-size:20px;margin-left:6px">${esc(ON.codeEntrar || "")}</b></span></div>
    <h1 class="lb-title" style="font-size:38px">Você entrou!</h1>
    <p class="lb-sub">Esperando ${esc(ON.salaNomes[0] || "o anfitrião")} começar a partida.</p>
    <div class="card" style="background:rgba(11,27,51,.6)">
      <h3>Na sala</h3>
      <div class="chips">${ON.salaNomes.map(n => `<span class="chip">${esc(n)}${n === ON.meuNome ? " (você)" : ""}</span>`).join("")}${ON.robos ? `<span class="chip">+ ${ON.robos} ${ON.robos === 1 ? "robô" : "robôs"}</span>` : ""}</div>
      <label>Sua visão</label>
      <span class="seg2" role="group" aria-label="Visão do jogo" style="align-self:flex-start">
        <button type="button" data-a="visaoFp" aria-pressed="${G.visaoOnline !== false}">1ª pessoa</button><button type="button" data-a="visaoCima" aria-pressed="${G.visaoOnline === false}">De cima</button>
      </span>
    </div>
  </section>`;
Object.assign(acoes, {
  entrarSala() {
    const nome = $("en-nome").value.replace(/\s+/g, " ").trim().slice(0, 20);
    if (!nome) { toast("Escreva seu nome"); return; }
    const code = ON.codeEntrar || ($("en-code") ? $("en-code").value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) : "");
    if (code.length < 4) { toast("Confira o código da sala"); return; }
    G.perfil = nome; salvar(); ON.codeEntrar = code;
    entrarSala(code, nome);
  },
  sairSala() { sairOnline(); },
});
function entrarSala(code, nome) {
  if (typeof Peer === "undefined") { toast("A conexão online não carregou. Confira a internet."); return; }
  if (ON.peer) { try { ON.peer.destroy(); } catch {} }
  ON.host = false; ON.conectando = true; render();
  const peer = new Peer({ debug: 0 }); ON.peer = peer;
  const desiste = setTimeout(() => { if (ON.conectando) { ON.conectando = false; toast("Não consegui entrar. Confira o código e se o Andre está com a sala aberta."); render(); } }, 15000);
  peer.on("open", () => {
    const conn = peer.connect(PREFIXO + code, { reliable: true, serialization: "json" });
    ON.hostConn = conn;
    conn.on("open", () => { clearTimeout(desiste); ON.conectando = false; ON.meuNome = nome; enviar(conn, { t: "hello", nome, moedas: G.banco[nome] || 0, vidas: invVidas(nome) }); });
    conn.on("data", cliRecebe);
    conn.on("close", () => { if (ON.peer === peer) { toast("A conexão com a sala caiu."); sairOnline(); } });
  });
  peer.on("error", e => {
    clearTimeout(desiste); ON.conectando = false;
    toast(e.type === "peer-unavailable" ? "Sala não encontrada. Confira o código." : "Problema na conexão: " + e.type);
    if (G.tela === "entrar") render();
  });
}
function cliRecebe(d) {
  if (!d || typeof d !== "object") return;
  switch (d.t) {
    case "bemvindo": ON.meuNome = d.nome; ir("esperando"); break;
    case "sala": ON.salaNomes = Array.isArray(d.nomes) ? d.nomes.map(String) : []; ON.robos = +d.robos || 0; if (G.tela === "esperando") render(); break;
    case "fora": toast(d.msg || "Não deu para entrar."); sairOnline(); break;
    case "start": iniciarCliente(d); break;
    case "st": if (ON.on) aplicarEstado(d); break;
    case "pede": if (ON.on) mostrarPedido(d); break;
    case "voltaSala": voltarEsperando(); break;
  }
}
function iniciarCliente(d) {
  A.cfg = { ...PADRAO, ...(d.cfg || {}) };
  A.P = d.P.map((o, i) => ({ i, nome: String(o.nome), cor: o.cor, pele: o.pele, humano: !!o.humano, home: { x: o.hx, y: o.hy },
    x: o.hx, y: o.hy, tx: o.hx, ty: o.hy, vidas: A.cfg.vidas, vivo: true, moedas: 0, ganho: 0, compradas: 0,
    alvo: null, modo: "casa", vel: A_VEL, habil: 0, flash: 0, passo: 0, ctrl: false, tocou: false }));
  A.cel = d.eu; ON.myIdx = d.eu; ON.on = true; ON.host = false; ON.fimVisto = false; ON.actKey = "";
  A.balls = []; A.fx = []; A.t = 0; A.fim = null; A.ptr = null; A.ph = { k: "segredo", perg: null };
  A.st = { palavras: 0, acertos: 0, erros: 0, timeouts: 0, votos: 0, votosOk: 0, arremessos: 0, acertosBola: 0, rodadas: 0, compras: 0, moedas: {}, eventos: [] };
  fecharOv();
  $("app").hidden = true; $("arena").hidden = false; $("a-setup").hidden = true; $("a-game").hidden = false;
  window.scrollTo(0, 0);
  A.fp = false; iniciarLoop(); ligarVisao(G.visaoOnline !== false);
}
function aplicarEstado(s) {
  A.t = s.tt;
  s.P.forEach((a, i) => {
    const p = A.P[i]; if (!p) return;
    const vidasAntes = p.vidas;
    [p.tx, p.ty, p.vidas] = a; p.vivo = !!a[3]; p.moedas = a[4]; if (a[5] > p.flash) p.flash = a[5];
    p.modo = a[6]; p.ctrl = !!a[7]; p.tocou = !!a[8]; p.humano = !!a[9]; p.ganho = a[10] || 0;
    if (!p.vivo) { p.x = p.tx; p.y = p.ty; }
    if (p.vidas < vidasAntes && i === ON.myIdx) vibrar([60, 40, 60]);
  });
  A.balls = s.B.map(b => ({ from: { x: b[0], y: b[1] }, to: { x: b[2], y: b[3] }, t: b[4], T: b[5] }));
  for (const f of s.fx) {
    A.fx.push({ x: f[0], y: f[1], txt: f[2], cor: f[3], t: 0 });
    if (f[2] === "-1") bip(300, .2); else if (f[2] === "ACERTOU!") bip(1100, .15);
  }
  const P = i => (i >= 0 ? A.P[i] : null), q = s.ph;
  A.ph = { k: q.k, perg: P(q.perg), atir: P(q.atir), ordem: q.ordem.map(P), idx: q.idx, voltas: q.voltas, tema: q.tema,
    palavra: q.k === "bola" ? q.palavra : q.masc, rev: new Set([...(q.masc || "")].map((c, i) => (c !== "_" ? i : -1)).filter(i => i >= 0)),
    prazo: A.t + q.prazo, espera: q.espera, cd: q.cd, pronto: q.pronto, votou: q.votou, voto: q.voto };
  aMsg(s.espera || s.msg);
  const me = A.P[ON.myIdx];
  const chave = [q.k, q.perg, q.atir, q.idx, q.voltas, q.votou ? 1 : 0, q.voto ? "v" + (q.voto.votaram.includes(ON.myIdx) ? 1 : 0) : "", me && me.ctrl ? 1 : 0, me && me.vivo ? 1 : 0, q.espera ? 1 : 0].join("|");
  if (chave !== ON.actKey) { ON.actKey = chave; renderAct(); }
  if (s.fim && !ON.fimVisto) {
    ON.fimVisto = true;
    A.fim = { vencedor: A.P[s.fim.v], t: A.t };
    if (me) {
      G.banco[ON.meuNome] = Math.round(me.moedas * 10) / 10;
      if (A.fim.vencedor === me) { G.vitorias = G.vitorias || {}; G.vitorias[ON.meuNome] = (G.vitorias[ON.meuNome] || 0) + 1; }
      salvar();
    }
    sfxVitoria(); mostrarFim();
  }
}
function passoCliente(dt) {
  A.t += dt;
  const k = 1 - Math.exp(-dt * 14);
  for (const p of A.P) {
    p.flash = Math.max(0, p.flash - dt);
    if (!p.vivo) continue;
    const nx = p.x + (p.tx - p.x) * k, ny = p.y + (p.ty - p.y) * k;
    p.passo += Math.hypot(nx - p.x, ny - p.y); p.x = nx; p.y = ny;
  }
  for (const b of A.balls) b.t = Math.min(b.T, b.t + dt);
  for (const f of A.fx) f.t += dt;
  A.fx = A.fx.filter(f => f.t < 1.4);
  // manda o movimento do meu bonequinho
  const me = A.P[ON.myIdx];
  if (!me || !me.ctrl || A.ov) return;
  let dx = 0, dy = 0;
  if (A.fp) { const m = A.mov || { x: 0, y: 0 }; dx = m.x; dy = m.y; }
  else {
    if (A.ptr) { const d = aDist(me, A.ptr); if (d > 8) { dx = (A.ptr.x - me.x) / d; dy = (A.ptr.y - me.y) / d; } }
    const kk = A.keys;
    const kx = (kk.ArrowRight || kk.d ? 1 : 0) - (kk.ArrowLeft || kk.a ? 1 : 0), ky = (kk.ArrowDown || kk.s ? 1 : 0) - (kk.ArrowUp || kk.w ? 1 : 0);
    if (kx || ky) { const m = Math.hypot(kx, ky); dx = kx / m; dy = ky / m; }
  }
  ON.movT += dt;
  const chave = dx.toFixed(2) + "," + dy.toFixed(2);
  if (ON.movT > .066 && (chave !== ON.movUlt || ON.movT > .25)) { ON.movT = 0; ON.movUlt = chave; agir({ t: "mov", x: +dx.toFixed(3), y: +dy.toFixed(3) }); }
}
function voltarEsperando() {
  ON.on = false; pararLoop(); fecharOv(); A.fim = null;
  $("arena").hidden = true; $("app").hidden = false;
  ir("esperando");
}

/* ---------- Tela inicial: modo online ---------- */
MODOS.online = "Online · cada um no seu celular";
const _jogar = acoes.jogar;
acoes.jogar = () => { if ((G.modo || "fp") === "online") { criarSala(); return; } _jogar(); };
const _telaLobby = TELAS.lobby;
TELAS.lobby = () => {
  const h = _telaLobby();
  return h.replace('<div class="lb-bottom">', '<button class="lb-cont" data-a="irEntrar">Entrar na sala de um amigo</button>\n    <div class="lb-bottom">');
};
acoes.irEntrar = () => { ON.codeEntrar = ""; ir("entrar"); };
ON.fp = G.visaoOnline !== false;
