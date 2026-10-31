/* ================= Online: cada um no seu celular =================
   O celular de quem cria a sala ("anfitrião") roda a partida e manda o estado para os outros.
   Os outros mandam só o que fazem: chute, palavra secreta, tiro, movimento, voto, compra e sugestão. */
const ON = { on: false, host: false, peer: null, code: "", sala: [], robos: 2, fp: true, timer: null, hostConn: null, myIdx: 0,
  meuNome: "", salaNomes: [], pedido: null, esperaTxt: "", actKey: "", fimVisto: false, movT: 0, movUlt: "", conectando: false };
const PREFIXO = "metesarrafo-v1-";
const SALA_DO_ANDRE = "ANDREK7Q";
ON.time = G.timeTam || 0;   // times no online (0 = cada um por si)   // código fixo: é o que está no QR impresso (materiais/)
const onHost = () => ON.on && ON.host;
const onCli = () => ON.on && !ON.host;
function gerarCodigo() { const L = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; let c = ""; for (let i = 0; i < 4; i++) c += L[Math.floor(Math.random() * L.length)]; return c; }
function linkSala(code) { return location.origin + location.pathname + "?sala=" + code; }
function enviar(conn, msg) { try { if (conn && conn.open) conn.send(msg); } catch {} }
function agir(msg) { if (onHost()) entrada(A.P[ON.myIdx], msg); else if (ON.hostConn) enviar(ON.hostConn, msg); }
TELAS_COM_MUSICA.push("salaHost", "esperando", "entrar", "criandoSala");

/* ---------- Anfitrião: criar sala ---------- */
function usarSalaFixa() { return G.salaFixa ?? (perfil().toLowerCase() === "andre"); }
/* auto: nome de quem chegou pelo QR e achou a sala fechada; essa pessoa abre a sala */
function criarSala(fixa = usarSalaFixa(), auto = null) {
  if (typeof Peer === "undefined") { toast("A conexão online não carregou. Confira a internet."); return; }
  if (ON.peer) { try { ON.peer.destroy(); } catch {} }
  ON.host = true; ON.on = false; ON.code = fixa ? SALA_DO_ANDRE : gerarCodigo(); ON.sala = [];
  const peer = new Peer(PREFIXO + ON.code, { debug: 0 });
  ON.peer = peer;
  ir("criandoSala");
  peer.on("open", () => {
    if (G.tela === "criandoSala") ir("salaHost");
    if (auto) toast("A sala estava fechada, então você abriu! Chame a turma e toque em Começar.");
  });
  peer.on("error", e => {
    if (e.type === "unavailable-id" && auto) { entrarSala(ON.code, auto, true); return; }   // alguém abriu ao mesmo tempo
    if (e.type === "unavailable-id") {
      if (fixa) { toast("A Sala do Andre já está aberta. Entrando nela…"); ON.codeEntrar = SALA_DO_ANDRE; entrarSala(SALA_DO_ANDRE, perfil(), true); return; }
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
  const codigos = { [perfil()]: meuCodigoAmigo() }; ON.sala.forEach(s => { if (s.codigo) codigos[s.nome] = s.codigo; });
  ON.sala.forEach(s => enviar(s.conn, { t: "sala", nomes, robos: ON.robos, code: ON.code, codigos }));
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
      <h3>Times</h3>
      <div class="seg2 time-pick" role="group" aria-label="Jogar em times">${[[0, "Cada um por si"], [2, "2 por time"], [3, "3 por time"], [4, "4 por time"]].map(([v, t]) => `<button type="button" data-a="timeOnline" data-v="${v}" aria-pressed="${(ON.time || 0) === v}">${t}</button>`).join("")}</div>
      ${ON.time ? `<p class="dim" style="font-size:14px">Os times são sorteados quando você tocar em Começar. Se faltar gente, robôs completam.</p>` : ""}
      <h3>Sua visão</h3>
      <span class="seg2" role="group" aria-label="Visão do jogo" style="align-self:flex-start">
        <button type="button" data-a="visaoFp" aria-pressed="${ON.fp !== false}">3D</button><button type="button" data-a="visaoCima" aria-pressed="${ON.fp === false}">De cima</button>
      </span>
      <p class="dim" style="font-size:14px">Total: ${total} jogadores (de 3 a 20). Cada amigo escolhe a visão no celular dele.</p>
    </div>
    <button class="lb-jogar" data-a="comecarOnline" ${ok ? "" : "disabled"} style="flex:none;min-height:70px">${ok ? "Começar" : "Precisa de 3"}</button>
  </section>`;
};
Object.assign(acoes, {
  encerrarSala() { encerrarOnline(); },
  trocarSala() { const fixa = ON.code !== SALA_DO_ANDRE; G.salaFixa = fixa; salvar(); criarSala(fixa); },
  timeOnline(el) { ON.time = +el.dataset.v; G.timeTam = ON.time; salvar(); render(); },
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
    ON.sala.push({ conn, nome, moedas: Math.max(0, +d.moedas || 0), vidasInv: Math.max(0, Math.floor(+d.vidas || 0)), skin: skinInfo(d.skin).k, ficha: limparFicha(d.ficha), codigo: limparCodigoAmigo(d.amigo), arremesso: arremessoInfo(String(d.arremesso || "")).k });
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
  const lista = [{ nome: perfil(), local: true }].concat(ON.sala.filter(s => s.conn.open).map(s => ({ nome: s.nome, conn: s.conn, moedas: s.moedas, vidasInv: s.vidasInv, skin: s.skin, ficha: s.ficha, arremesso: s.arremesso })));
  for (let k = 1; k <= ON.robos; k++) lista.push({ nome: "Robô " + k, robo: true });
  if (lista.length < 3) { toast("Precisa de pelo menos 3 jogadores"); return; }
  // times: sorteia e completa com robôs; cada time fica junto na roda
  const sorteada = sortearTimes(lista.map(o => ({ ...o, humano: !o.robo })), ON.time || 0, true).map(o => ({ ...o, robo: !o.humano }));
  lista.length = 0; lista.push(...sorteada); A.times = !!ON.time;
  const n = lista.length;
  A.cfg = { ...G.cfg };
  A.P = lista.map((o, i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / n;
    const home = { x: AC + AH * Math.cos(a), y: AC + AH * Math.sin(a) };
    return { i, nome: o.nome, humano: !o.robo, remoto: !!o.conn, conn: o.conn || null, vidasInv: o.vidasInv || 0, mov: { x: 0, y: 0 },
      cor: A_CORES[i % A_CORES.length], pele: A_PELE[i % A_PELE.length],
      vidas: A.cfg.vidas, vivo: true, moedas: 0, guardado: o.robo ? 0 : o.local ? (G.banco[o.nome] || 0) : (o.moedas || 0), ganho: 0, compradas: 0,
      home, x: home.x, y: home.y, alvo: null, modo: "casa", vel: A_VEL * aRnd(.88, 1.12), habil: aRnd(-.08, .08),
      flash: 0, passo: 0, ctrl: false, tocou: false, saiuEm: null, arremesso: o.robo ? "bola" : o.local ? arremessoDe(o.nome) : (o.arremesso || "bola"), time: o.time };
  });
  A.P.forEach((p, i) => { if (!p.humano) return; vestir(p, lista[i].local ? skinDe(p.nome) : lista[i].skin); const f = lista[i].local ? personagemDe(p.nome) : lista[i].ficha; if (f) p.ficha = f; });
  A.cel = ON.myIdx = Math.max(0, lista.findIndex(o => o.local)); A.balls = []; A.fx = []; A.t = 0; A.fim = null; A.ptr = null; A.inicio = Date.now();
  A.st = { palavras: 0, acertos: 0, erros: 0, timeouts: 0, votos: 0, votosOk: 0, arremessos: 0, acertosBola: 0, rodadas: 0, compras: 0, moedas: {}, eventos: [] };
  ON.on = true; ON.pedido = null; ON.esperaTxt = ""; ON.fimVisto = false;
  $("app").hidden = true; $("arena").hidden = false; $("a-setup").hidden = true; $("a-game").hidden = false;
  window.scrollTo(0, 0);
  const estatico = A.P.map(p => ({ nome: p.nome, cor: p.cor, pele: p.pele, skin: p.skin || "classico", ficha: p.ficha || null, arremesso: p.arremesso || "bola", time: p.time, humano: p.humano, hx: Math.round(p.home.x), hy: Math.round(p.home.y) }));
  A.P.forEach(p => { if (p.conn) enviar(p.conn, { t: "start", P: estatico, eu: p.i, cfg: A.cfg, times: A.times }); });
  A.fp = false;
  iniciarLoop();
  ligarVisao(ON.fp !== false);
  if (A.times) {
    abrirOv(`<h2>Times sorteados!</h2>${htmlTimes(A.P)}<p class="dim">A bola só acerta os outros times. Quem é do time de quem pergunta não chuta.</p><button class="btn" id="ov-ok" type="button">Começar</button>`,
      ov => ov.querySelector("#ov-ok").addEventListener("click", () => { fecharOv(); novaPalavraA(aPick(A.P)); }));
  } else novaPalavraA(aPick(A.P));
  clearInterval(ON.timer); ON.timer = setInterval(enviarEstado, 70);
}
function estadoAtual() {
  const ph = A.ph || {}, idx = p => (p ? p.i : -1);
  const masc = ph.palavra && ph.rev ? [...ph.palavra].map((c, i) => (c === " " ? " " : ph.rev.has(i) ? c : "_")).join("") : "";
  return {
    t: "st", tt: +A.t.toFixed(2), msg: $("a-sub").textContent, espera: ON.esperaTxt || "",
    fim: A.fim ? { v: A.fim.vencedor.i } : null,
    P: A.P.map(p => [Math.round(p.x), Math.round(p.y), p.vidas, p.vivo ? 1 : 0, Math.round(p.moedas * 10) / 10, +p.flash.toFixed(2), p.modo, p.ctrl ? 1 : 0, p.tocou ? 1 : 0, p.humano ? 1 : 0, Math.round(p.ganho * 10) / 10]),
    B: A.balls.map(b => [Math.round(b.from.x), Math.round(b.from.y), Math.round(b.to.x), Math.round(b.to.y), +b.t.toFixed(3), +b.T.toFixed(3), b.k || "bola"]),
    Gs: (A.ges || []).filter(e => e.ate > performance.now()).map(e => [e.i, e.k, Math.round(performance.now() - e.ini)]),
    E: (A.emo || []).filter(e => e.ate > performance.now()).map(e => [e.i, e.k, Math.round(e.ate - performance.now())]),
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
    case "gesto":
      if (p.vivo) fazerGesto(p, String(d.k || ""));
      break;
    case "emoji":
      if (p.vivo) mostrarEmoji(p, String(d.k || ""));
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
        } else if (d.escolha === "comprar" && saldoCompra(p) >= A.cfg.preco && p.compradas < A.cfg.maxCompra) comprarA(p);
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
    abrirOv(`<h2>Você perdeu a última vida</h2><p>Você tem <b class="coin">${fmtM(d.moedas)}</b> moedas guardadas${inv ? ` e <b class="hearts">${inv} ${inv === 1 ? "vida extra guardada" : "vidas extras guardadas"}</b>` : ""}.</p>
      ${inv && d.podeMais ? `<button class="btn ok" id="ov-usar" type="button">Usar vida extra guardada</button>` : ""}
      ${d.moedas >= d.preco && d.podeMais ? `<button class="btn ${inv ? "ghost" : "ok"}" id="ov-sim" type="button">Comprar vida extra agora (${d.preco})</button>` : ""}
      <button class="btn no" id="ov-nao" type="button">Sair do jogo</button>`, ov => {
      const usar = ov.querySelector("#ov-usar"), comprar = ov.querySelector("#ov-sim");
      if (usar) usar.addEventListener("click", () => { fecharOv(); mudarInv(nome, -1); if (onHost()) salvarPlacar(); else salvar(); agir({ t: "compra", escolha: "usar" }); });
      if (comprar) comprar.addEventListener("click", () => {
        fecharOv();
        if (!onHost()) { G.banco[nome] = Math.round(((G.banco[nome] || 0) - d.preco) * 10) / 10; salvar(); }   // o anfitrião desconta o dele em pagarVida
        agir({ t: "compra", escolha: "comprar" });
      });
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
  pedir(p, { tipo: "compra", moedas: Math.round(saldoCompra(p) * 10) / 10, preco: A.cfg.preco, podeMais: p.compradas < A.cfg.maxCompra });
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
    <p class="dim">${A.fim.cor ? "O time que sobrou" : "Quem sobrou por último"}</p><div class="big-name"${A.fim.cor ? ` style="color:${A.fim.cor}"` : ""}>${esc(A.fim.titulo || v.nome)}</div><h2>${(A.fim.ganhadores || [v]).includes(me) ? (A.fim.cor ? "Seu time venceu!" : "Você venceu!") : "venceu!"}</h2>
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
  ON.sala = A.P.filter(p => p.remoto && p.conn && p.conn.open).map(p => ({ conn: p.conn, nome: p.nome, moedas: Math.round(((p.guardado || 0) + Math.max(0, p.moedas)) * 10) / 10, vidasInv: p.vidasInv || 0, skin: p.skin || "classico", ficha: p.ficha || null, arremesso: p.arremesso || "bola" }));
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
        <button type="button" data-a="visaoFp" aria-pressed="${G.visaoOnline !== false}">3D</button><button type="button" data-a="visaoCima" aria-pressed="${G.visaoOnline === false}">De cima</button>
      </span>
      <button class="lb-jogar" type="submit" style="flex:none;min-height:64px;font-size:28px" ${ON.conectando ? "disabled" : ""}>${ON.conectando ? "Entrando…" : "Entrar"}</button>
    </form>
  </section>`;
TELAS.esperando = () => `
  <section data-fundo="${fundoAtual()}" class="bgf lobby" aria-label="Esperando começar">
    <div class="lb-top"><button class="lb-pill" data-a="sairSala">← Sair</button><span class="lb-pill">Sala <b style="font-family:var(--display);font-size:20px;margin-left:6px">${esc(ON.codeEntrar || "")}</b></span></div>
    <h1 class="lb-title" style="font-size:38px">Você entrou!</h1>
    <p class="lb-sub">Esperando ${esc(ON.salaNomes[0] || "quem abriu a sala")} começar a partida.</p>
    <div class="card" style="background:rgba(11,27,51,.6)">
      <h3>Na sala</h3>
      <div class="chips">${ON.salaNomes.map(n => `<span class="chip">${esc(n)}${n === ON.meuNome ? " (você)" : ""}</span>`).join("")}${ON.robos ? `<span class="chip">+ ${ON.robos} ${ON.robos === 1 ? "robô" : "robôs"}</span>` : ""}</div>
      <label>Sua visão</label>
      <span class="seg2" role="group" aria-label="Visão do jogo" style="align-self:flex-start">
        <button type="button" data-a="visaoFp" aria-pressed="${G.visaoOnline !== false}">3D</button><button type="button" data-a="visaoCima" aria-pressed="${G.visaoOnline === false}">De cima</button>
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
function entrarSala(code, nome, naoAbrir = false) {
  if (typeof Peer === "undefined") { toast("A conexão online não carregou. Confira a internet."); return; }
  if (ON.peer) { try { ON.peer.destroy(); } catch {} }
  ON.host = false; ON.conectando = true; render();
  const peer = new Peer({ debug: 0 }); ON.peer = peer;
  const desiste = setTimeout(() => { if (ON.conectando) { ON.conectando = false; toast("Não consegui entrar. Confira a internet e tente de novo."); render(); } }, 15000);
  peer.on("open", () => {
    const conn = peer.connect(PREFIXO + code, { reliable: true, serialization: "json" });
    ON.hostConn = conn;
    conn.on("open", () => { clearTimeout(desiste); ON.conectando = false; ON.meuNome = nome; enviar(conn, { t: "hello", nome, moedas: G.banco[nome] || 0, vidas: invVidas(nome), skin: skinDe(nome), ficha: personagemDe(nome), amigo: meuCodigoAmigo(), arremesso: arremessoDe(nome) }); });
    conn.on("data", cliRecebe);
    conn.on("close", () => { if (ON.peer === peer) { toast("A conexão com a sala caiu."); sairOnline(); } });
  });
  peer.on("error", e => {
    clearTimeout(desiste); ON.conectando = false;
    // a Sala do Andre está fechada: quem chegou primeiro abre a sala
    if (e.type === "peer-unavailable" && code === SALA_DO_ANDRE && !naoAbrir) { criarSala(true, nome); return; }
    toast(e.type === "peer-unavailable" ? "Sala não encontrada. Confira o código." : "Problema na conexão: " + e.type);
    if (G.tela === "entrar") render();
  });
}
function cliRecebe(d) {
  if (!d || typeof d !== "object") return;
  switch (d.t) {
    case "bemvindo": ON.meuNome = d.nome; ir("esperando"); break;
    case "sala": ON.salaNomes = Array.isArray(d.nomes) ? d.nomes.map(String) : []; ON.robos = +d.robos || 0; ON.salaCodigos = d.codigos && typeof d.codigos === "object" ? d.codigos : {}; if (G.tela === "esperando") render(); break;
    case "fora": toast(d.msg || "Não deu para entrar."); sairOnline(); break;
    case "start": iniciarCliente(d); break;
    case "st": if (ON.on) aplicarEstado(d); break;
    case "pede": if (ON.on) mostrarPedido(d); break;
    case "voltaSala": voltarEsperando(); break;
  }
}
function iniciarCliente(d) {
  A.cfg = { ...PADRAO, ...(d.cfg || {}) };
  A.P = d.P.map((o, i) => ({ i, nome: String(o.nome), cor: o.cor, pele: o.pele, skin: skinInfo(o.skin).k, ficha: o.ficha ? limparFicha(o.ficha) : null, arremesso: arremessoInfo(String(o.arremesso || "")).k, time: Number.isInteger(o.time) && TIMES[o.time] ? o.time : null, humano: !!o.humano, home: { x: o.hx, y: o.hy },
    x: o.hx, y: o.hy, tx: o.hx, ty: o.hy, vidas: A.cfg.vidas, vivo: true, moedas: 0, ganho: 0, compradas: 0,
    alvo: null, modo: "casa", vel: A_VEL, habil: 0, flash: 0, passo: 0, ctrl: false, tocou: false }));
  A.cel = d.eu; ON.myIdx = d.eu; ON.on = true; ON.host = false; ON.fimVisto = false; ON.actKey = "";
  A.times = !!d.times;
  if (A.times && A.P[d.eu] && timeDe(A.P[d.eu])) setTimeout(() => toast(`Você é do Time ${timeDe(A.P[d.eu]).nome}! A bola só vale nos outros times.`), 400);
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
  if (Array.isArray(s.Gs)) {
    const antes = A.ges || [], agora = performance.now();
    A.ges = s.Gs.filter(e => gestoInfo(e[1])).map(e => { const g = gestoInfo(e[1]), ini = agora - Math.max(0, +e[2] || 0); return { i: +e[0], k: e[1], ini, ate: ini + g.dura * 1000 }; });
    for (const e of A.ges) if (!antes.some(x => x.i === e.i && x.k === e.k && Math.abs(x.ini - e.ini) < 600)) tocarNotas(gestoInfo(e.k).som);
  }
  if (Array.isArray(s.E)) {
    const antes = A.emo || [];
    A.emo = s.E.filter(e => emojiInfo(e[1])).map(e => ({ i: +e[0], k: e[1], ate: performance.now() + Math.min(EMO_DURA, +e[2] || 0) }));
    // emoji novo (não estava na tela antes): toca o barulhinho dele
    for (const e of A.emo) if (!antes.some(x => x.i === e.i && x.k === e.k && Math.abs(x.ate - e.ate) < 600)) somEmoji(e.k);
  }
  A.balls = s.B.map(b => ({ from: { x: b[0], y: b[1] }, to: { x: b[2], y: b[3] }, t: b[4], T: b[5], k: arremessoInfo(String(b[6] || "")).k }));
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
    { const v = A.P[s.fim.v], tv = A.times ? timeDe(v) : null;
      A.fim = { vencedor: v, t: A.t, titulo: tv ? "Time " + tv.nome : v.nome, cor: tv ? tv.cor : null, ganhadores: tv ? A.P.filter(p => mesmoTime(p, v)) : [v] }; }
    if (me) {
      G.banco[ON.meuNome] = Math.round(((G.banco[ON.meuNome] || 0) + Math.max(0, me.moedas)) * 10) / 10;   // soma o que ganhou na partida
      if (A.fim.ganhadores.includes(me)) { G.vitorias = G.vitorias || {}; G.vitorias[ON.meuNome] = (G.vitorias[ON.meuNome] || 0) + 1; }
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
  return h.replace('<div class="lb-bottom">', '<button class="lb-cont lb-entrar" data-a="irEntrar">Entrar na sala de um amigo</button>\n    <div class="lb-bottom">');
};
acoes.irEntrar = () => { ON.codeEntrar = ""; ir("entrar"); };
ON.fp = G.visaoOnline !== false;

/* ================= Amigos =================
   Cada aparelho tem um código de amigo (G.amigoCodigo). Enquanto o jogo está aberto no site,
   o aparelho fica "ligado" no servidor do PeerJS como PREFIXO + "amigo-" + código, e assim
   os amigos conseguem ver quem está online, mandar pedido de amizade e chamar para a sala.
   Só guardamos o nome (apelido) e o código; nada de foto, telefone ou escola. */
const AMG = { peer: null, online: {}, ultimaVez: {}, buscando: false, convite: null, chamarDepois: [] };
const AMG_ID = c => PREFIXO + "amigo-" + c;
const limparCodigoAmigo = s => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
const limparNomeAmigo = s => String(s || "").replace(/\s+/g, " ").trim().slice(0, 20);
function meuCodigoAmigo() {
  if (!/^[A-Z0-9]{6}$/.test(G.amigoCodigo || "")) {
    const L = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; let c = ""; for (let i = 0; i < 6; i++) c += L[Math.floor(Math.random() * L.length)];
    G.amigoCodigo = c; salvar();
  }
  return G.amigoCodigo;
}
const amigos = () => (G.amigos = G.amigos || []);
const pedidos = () => (G.amigoPedidos = G.amigoPedidos || []);
const ehAmigo = c => amigos().some(a => a.codigo === c);
function linkAmigo() { return location.origin + location.pathname + "?amigo=" + meuCodigoAmigo(); }
function guardarAmigo(codigo, nome) {
  codigo = limparCodigoAmigo(codigo); if (codigo.length !== 6 || codigo === meuCodigoAmigo()) return false;
  const a = amigos().find(x => x.codigo === codigo);
  if (a) { if (nome) a.nome = limparNomeAmigo(nome) || a.nome; }
  else { if (amigos().length >= 50) return false; amigos().push({ codigo, nome: limparNomeAmigo(nome) || "Amigo " + codigo }); }
  G.amigoPedidos = pedidos().filter(p => p.codigo !== codigo);
  salvar(); return true;
}
function telaAmigosAberta() { return ["amigos", "lobby", "salaHost", "conversa"].includes(G.tela); }
function reRender() { if (telaAmigosAberta() && !$("app").hidden) { const y = window.scrollY; render(); window.scrollTo(0, y); } }

/* ---------- ligar o "telefone" de amigos ---------- */
function ligarAmigos() {
  if (typeof Peer === "undefined" || AMG.peer) return;
  const peer = new Peer(AMG_ID(meuCodigoAmigo()), { debug: 0 }); AMG.peer = peer;
  peer.on("open", () => verQuemEstaOnline());
  peer.on("connection", conn => conn.on("data", d => amigoRecebe(conn, d)));
  peer.on("error", e => {
    if (e.type === "peer-unavailable") { const m = /amigo-([A-Z0-9]{6})/.exec(e.message || ""); if (m) { AMG.online[m[1]] = false; reRender(); } return; }
    if (e.type === "unavailable-id") { AMG.peer = null; try { peer.destroy(); } catch {} }   // o jogo já está aberto em outra aba
  });
  peer.on("disconnected", () => { try { peer.reconnect(); } catch {} });
}
/* manda uma mensagem para um amigo; responde false se ele não estiver com o jogo aberto */
function falarComAmigo(codigo, msg) {
  return new Promise(ok => {
    if (!AMG.peer || !AMG.peer.open) { ok(false); return; }
    let feito = false; const fim = v => { if (!feito) { feito = true; clearTimeout(t); if (AMG.peer && AMG.peer.off) AMG.peer.off("error", verErro); ok(v); } };
    const t = setTimeout(() => { AMG.online[codigo] = false; fim(false); }, 8000);
    const conn = AMG.peer.connect(AMG_ID(codigo), { reliable: true, serialization: "json" });
    conn.on("open", () => {
      AMG.online[codigo] = true; AMG.ultimaVez[codigo] = Date.now();
      enviar(conn, { ...msg, de: meuCodigoAmigo(), nome: perfil(), av: avatarDe(perfil()) });
      conn.on("data", d => amigoRecebe(conn, d));
      setTimeout(() => { try { conn.close(); } catch {} }, 1500);
      fim(true);
    });
    conn.on("error", () => fim(false));
    function verErro(e) { if (e.type === "peer-unavailable" && (e.message || "").includes(codigo)) fim(false); }
    AMG.peer.on("error", verErro);
  });
}
async function verQuemEstaOnline() {
  if (AMG.buscando || !AMG.peer || !AMG.peer.open) return;
  AMG.buscando = true;
  await Promise.all(amigos().map(a => falarComAmigo(a.codigo, { t: "oi" })));
  AMG.buscando = false; reRender();
}
setInterval(() => { if (!document.hidden && telaAmigosAberta()) verQuemEstaOnline(); }, 25000);

function amigoRecebe(conn, d) {
  if (!d || typeof d !== "object") return;
  const de = limparCodigoAmigo(d.de), nome = limparNomeAmigo(d.nome);
  if (de.length !== 6 || de === meuCodigoAmigo()) return;
  AMG.online[de] = true; AMG.ultimaVez[de] = Date.now();
  const amigo = amigos().find(a => a.codigo === de);
  if (amigo && nome && amigo.nome !== nome) { amigo.nome = nome; salvar(); }
  // foto de perfil do amigo: só ícone e cor da lista do jogo
  const av = d.av && typeof d.av === "object" && avValido(d.av.i) && AV_CORES.includes(d.av.cor) ? { i: d.av.i, cor: d.av.cor } : null;
  if (amigo && av && JSON.stringify(amigo.av) !== JSON.stringify(av)) { amigo.av = av; salvar(); }
  if (d.t === "oi") { if (amigo) reRender(); return; }
  if (d.t === "pedido") {
    if (amigo) { enviar(conn, { t: "aceito", de: meuCodigoAmigo(), nome: perfil(), av: avatarDe(perfil()) }); return; }   // já somos amigos
    if (!pedidos().some(p => p.codigo === de)) { pedidos().unshift({ codigo: de, nome: nome || "Alguém", em: Date.now(), av }); G.amigoPedidos = pedidos().slice(0, 10); salvar(); }
    toast(`${nome || "Alguém"} quer ser seu amigo`, "Ver", () => ir("amigos")); bip(880, .08); reRender(); return;
  }
  if (d.t === "aceito") {
    if (amigo || AMG.esperandoAceite === de) { guardarAmigo(de, nome); toast(`${nome} agora é seu amigo!`); reRender(); }
    return;
  }
  if (d.t === "convite") {
    const sala = String(d.sala || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    if (!amigo || sala.length < 4 || ON.on || ON.peer) return;   // só aceita convite de amigo, e se não estiver jogando
    mostrarConvite(amigo.nome, sala);
  }
}
function mostrarConvite(nome, sala) {
  let el = $("convite-amigo");
  if (!el) { el = document.createElement("div"); el.id = "convite-amigo"; el.className = "convite-amigo"; el.setAttribute("role", "alertdialog"); document.body.append(el); }
  el.innerHTML = `<b>${esc(nome)} te chamou para jogar!</b><div class="row"><button type="button" class="lb-jogar" id="cv-sim">Entrar</button><button type="button" class="lb-pill" id="cv-nao">Agora não</button></div>`;
  el.hidden = false; bip(660, .1); setTimeout(() => bip(990, .12), 140); vibrar([80, 60, 80]);
  $("cv-sim").onclick = () => { el.hidden = true; ON.codeEntrar = sala; entrarSala(sala, perfil(), true); };
  $("cv-nao").onclick = () => { el.hidden = true; };
  clearTimeout(AMG.cvT); AMG.cvT = setTimeout(() => { el.hidden = true; }, 60000);
}
async function chamarAmigo(codigo) {
  const a = amigos().find(x => x.codigo === codigo); if (!a) return;
  if (!ON.host || !ON.code || !ON.peer || ON.on) { AMG.chamarDepois = [codigo]; criarSala(); return; }   // abre a sala e chama em seguida
  const ok = await falarComAmigo(codigo, { t: "convite", sala: ON.code });
  toast(ok ? `Chamado! Esperando ${a.nome} entrar…` : `${a.nome} não está com o jogo aberto agora`);
  reRender();
}

/* ---------- tela de amigos ---------- */
TELAS.amigos = () => {
  const lista = [...amigos()].sort((a, b) => (AMG.online[b.codigo] ? 1 : 0) - (AMG.online[a.codigo] ? 1 : 0) || a.nome.localeCompare(b.nome));
  depoisFn = () => {
    const box = $("qr-amigo"); if (!box) return; box.innerHTML = "";
    try { new QRCode(box, { text: linkAmigo(), width: 300, height: 300, colorDark: "#0f3057", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M }); } catch {}
  };
  const status = c => AMG.online[c] ? `<span class="am-on">● online</span>` : AMG.online[c] === false ? `<span class="am-off">● fora</span>` : `<span class="am-off">…</span>`;
  return `
  <section data-fundo="${fundoAtual()}" class="bgf lobby" aria-label="Amigos">
    <div class="lb-top"><button class="lb-pill" data-a="voltarLobby">← Voltar</button><button class="lb-pill" data-a="atualizarAmigos">Atualizar</button></div>
    <h1 class="lb-title" style="font-size:40px">Amigos</h1>
    ${pedidos().length ? `<div class="card" style="background:rgba(55,217,154,.18);border-color:#37d99a">
      <h3>Pedidos de amizade</h3>
      ${pedidos().map(p => `<div class="am-linha">${avatarHTML(p.av, p.nome)}<b>${esc(p.nome)}</b><span class="dim">${esc(p.codigo)}</span>
        <button class="lb-cont" data-a="aceitarAmigo" data-c="${esc(p.codigo)}">Aceitar</button><button class="lb-pill" data-a="recusarAmigo" data-c="${esc(p.codigo)}">Recusar</button></div>`).join("")}
    </div>` : ""}
    <div class="card" style="background:rgba(11,27,51,.6)">
      <h3>Meus amigos (${lista.length})</h3>
      ${lista.length ? lista.map(a => `<div class="am-linha">${avatarHTML(a.av, a.nome)}<button type="button" class="am-nome am-abrir" data-a="abrirConversa" data-c="${esc(a.codigo)}" aria-label="Conversar com ${esc(a.nome)}"><b>${esc(a.nome)} 💬${naoLidas(a.codigo) ? ` <i class="lb-badge am-badge">${naoLidas(a.codigo)}</i>` : ""}</b>${status(a.codigo)}</button>
        ${AMG.online[a.codigo] ? `<button class="lb-cont" data-a="chamarAmigo" data-c="${esc(a.codigo)}">Chamar</button>` : ""}
        <button class="lb-pill am-tirar" data-a="tirarAmigo" data-c="${esc(a.codigo)}" aria-label="Remover ${esc(a.nome)}">${AMG.tirar === a.codigo ? "Remover?" : "✕"}</button></div>`).join("")
        : `<p class="dim">Você ainda não tem amigos aqui. Mostre o seu código para um amigo ou digite o código dele embaixo.</p>`}
      <p class="dim" style="font-size:14px">Toque no nome para conversar. Online = está com o jogo aberto agora. Toque em Chamar e ele recebe um convite para a sua sala.</p>
    </div>
    <form class="card" data-a="addAmigo" autocomplete="off" style="background:rgba(11,27,51,.6)">
      <h3>Adicionar amigo</h3>
      <div class="row"><input id="am-cod" maxlength="6" autocapitalize="characters" spellcheck="false" placeholder="Código do amigo" aria-label="Código do amigo" value="${esc(AMG.codigoUrl || "")}"><button class="btn small" type="submit" style="flex:0 0 auto;width:auto">Adicionar</button></div>
      <p class="dim" style="font-size:14px">Só adicione quem você conhece de verdade.</p>
    </form>
    <div class="card" style="background:rgba(11,27,51,.6);align-items:center;text-align:center">
      <h3>Meu código de amigo</h3>
      <b class="am-codigo">${esc(meuCodigoAmigo())}</b>
      <div class="qr" id="qr-amigo" role="img" aria-label="QR code para me adicionar" style="max-width:200px"></div>
      <p class="dim" style="font-size:14px">O amigo escaneia o QR ou digita esse código no jogo dele.</p>
    </div>
  </section>`;
};
Object.assign(acoes, {
  amigos() { ligarAmigos(); ir("amigos"); verQuemEstaOnline(); },
  atualizarAmigos() { ligarAmigos(); verQuemEstaOnline(); toast("Procurando quem está online…"); },
  async addAmigo() {
    const c = limparCodigoAmigo($("am-cod").value);
    if (c.length !== 6) { toast("O código tem 6 letras e números"); return; }
    if (c === meuCodigoAmigo()) { toast("Esse é o seu próprio código"); return; }
    if (ehAmigo(c)) { toast("Vocês já são amigos"); return; }
    AMG.codigoUrl = ""; AMG.esperandoAceite = c;
    guardarAmigo(c, "");
    const ok = await falarComAmigo(c, { t: "pedido" });
    toast(ok ? "Pedido enviado! Quando ele aceitar, aparece o nome." : "Adicionado! Ele ainda precisa adicionar você também.");
    reRender();
  },
  aceitarAmigo(el) {
    const c = el.dataset.c, p = pedidos().find(x => x.codigo === c); if (!p) return;
    guardarAmigo(c, p.nome); const am = amigos().find(x => x.codigo === c); if (am && p.av) { am.av = p.av; salvar(); } falarComAmigo(c, { t: "aceito" }); toast(`${p.nome} agora é seu amigo!`); reRender();
  },
  recusarAmigo(el) { G.amigoPedidos = pedidos().filter(x => x.codigo !== el.dataset.c); salvar(); reRender(); },
  tirarAmigo(el) {
    const c = el.dataset.c;
    if (AMG.tirar !== c) { AMG.tirar = c; reRender(); setTimeout(() => { if (AMG.tirar === c) { AMG.tirar = null; reRender(); } }, 3000); return; }
    AMG.tirar = null; G.amigos = amigos().filter(a => a.codigo !== c); salvar(); reRender();
  },
  chamarAmigo(el) { chamarAmigo(el.dataset.c); },
  addAmigoSala(el) {
    const c = limparCodigoAmigo(el.dataset.c); if (ehAmigo(c)) return;
    AMG.esperandoAceite = c; guardarAmigo(c, el.dataset.n);
    falarComAmigo(c, { t: "pedido" }); toast(`Pedido de amizade enviado para ${limparNomeAmigo(el.dataset.n)}`); reRender();
  },
});
TELAS_COM_MUSICA.push("amigos");

/* botão Amigos na tela inicial, com aviso de pedido novo */
const _telaLobbyAmigos = TELAS.lobby;
TELAS.lobby = () => _telaLobbyAmigos().replace('<!--lado-direito-->',
  `<button class="lb-btn" data-a="amigos"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.4" fill="#ffd23f" stroke="#0b1b33" stroke-width="1.4"/><circle cx="16.5" cy="9" r="2.8" fill="#37d99a" stroke="#0b1b33" stroke-width="1.4"/><path d="M3 20v-1.5a6 6 0 0 1 12 0V20z" fill="#ffd23f" stroke="#0b1b33" stroke-width="1.4" stroke-linejoin="round"/><path d="M14.5 20v-1.2a5 5 0 0 1 7-4.5V20z" fill="#37d99a" stroke="#0b1b33" stroke-width="1.4" stroke-linejoin="round"/></svg><span>Amigos</span>${pedidos().length + totalNaoLidas() ? `<i class="lb-badge">${pedidos().length + totalNaoLidas()}</i>` : Object.values(AMG.online).some(Boolean) ? `<i class="lb-tag" style="background:#37d99a;color:#03281a">online</i>` : ""}</button>`);

/* sala: mostra amigos online para chamar, e "+ amigo" para quem entrou e ainda não é amigo */
const _telaSalaHost = TELAS.salaHost;
TELAS.salaHost = () => {
  if (AMG.chamarDepois.length && ON.peer && ON.peer.open && ON.code) {
    const lista = AMG.chamarDepois; AMG.chamarDepois = [];
    setTimeout(() => lista.forEach(c => chamarAmigo(c)), 50);
  }
  const on = amigos().filter(a => AMG.online[a.codigo] && !ON.sala.some(s => s.codigo === a.codigo));
  let h = _telaSalaHost();
  h = h.replace(/<span class="chip">([^<]*)<\/span>/g, (m, nome) => {
    const s = ON.sala.find(x => esc(x.nome) === nome);
    return s && s.codigo && !ehAmigo(s.codigo) ? `${m}<button class="chip am-mais" data-a="addAmigoSala" data-c="${esc(s.codigo)}" data-n="${esc(s.nome)}">+ amigo</button>` : m;
  });
  if (on.length) h = h.replace('<div class="qr" id="qr-sala"', `<div class="card" style="background:rgba(55,217,154,.15);border-color:#37d99a"><h3>Amigos online</h3>${on.map(a => `<div class="am-linha"><b>${esc(a.nome)}</b><button class="lb-cont" data-a="chamarAmigo" data-c="${esc(a.codigo)}">Chamar</button></div>`).join("")}</div>
    <div class="qr" id="qr-sala"`);
  return h;
};
/* quem está esperando também pode adicionar os outros da sala */
const _telaEsperando = TELAS.esperando;
TELAS.esperando = () => _telaEsperando().replace(/<span class="chip">([^<]*?)(?: \(você\))?<\/span>/g, (m, nome) => {
  const c = (ON.salaCodigos || {})[nome];
  return c && c !== meuCodigoAmigo() && !ehAmigo(c) && !m.includes("robô") ? `${m}<button class="chip am-mais" data-a="addAmigoSala" data-c="${esc(c)}" data-n="${nome}">+ amigo</button>` : m;
});

/* ao abrir o site: liga os amigos e trata o link ?amigo=CODIGO */
AMG.codigoUrl = limparCodigoAmigo(new URLSearchParams(location.search).get("amigo"));
if (AMG.codigoUrl && !codigoUrl) G.tela = "amigos";
if (typeof Peer !== "undefined") setTimeout(ligarAmigos, 300);

/* ================= Chat dos amigos: só frases prontas e emojis =================
   Escolha do pai: nada de texto livre (sem moderador). Pela rede vai só o número da frase
   ou a chave do emoji, então ninguém consegue mandar outra coisa.
   IMPORTANTE: só acrescente frases no FIM da lista. Mudar a ordem troca o que os outros leem. */
const FRASES = [
  "Oi! 👋", "Bora jogar?", "Me chama na sala!", "Já vou!", "Agora não posso", "GG! 🏆",
  "Boa jogada!", "Kkkkk 😂", "Revanche?", "Você é muito bom!", "Quase!", "Valeu!",
  "Tô online", "Partiu!", "Daqui a pouco", "Tchau! 👋",
];
const chats = () => (G.chat = G.chat || {});
const conversa = c => (chats()[c] = chats()[c] || []);
const naoLidas = c => conversa(c).filter(m => m.ele && !m.lida).length;
const totalNaoLidas = () => amigos().reduce((n, a) => n + naoLidas(a.codigo), 0);
function textoMsg(m) { return m.e ? (emojiInfo(m.e) || {}).e || "" : FRASES[m.f] || ""; }
function guardarMsg(c, m) { const l = conversa(c); l.push(m); if (l.length > 60) l.splice(0, l.length - 60); salvar(); }

/* entrega o que está esperando, quando o amigo está online */
async function entregarPendentes(c) {
  const pend = conversa(c).filter(m => !m.ele && m.pendente); if (!pend.length || AMG.entregando === c) return;
  AMG.entregando = c;
  const ok = await falarComAmigo(c, { t: "msg", itens: pend.map(m => (m.e ? { e: m.e } : { f: m.f })) });
  AMG.entregando = null;
  if (ok) { pend.forEach(m => delete m.pendente); salvar(); reRender(); }
}
async function mandarMsg(c, m) {
  const agora = Date.now();
  if (agora - (AMG.ultimaMsg || 0) < 900) return;   // sem enxurrada
  AMG.ultimaMsg = agora;
  guardarMsg(c, { ...m, em: agora, pendente: true }); reRender();
  await entregarPendentes(c);
}
function recebeMsgs(de, d) {
  if (!ehAmigo(de) || !Array.isArray(d.itens)) return;
  const a = amigos().find(x => x.codigo === de);
  let ultima = "";
  for (const it of d.itens.slice(0, 10)) {
    const m = it && typeof it === "object" ? it : {};
    if (Number.isInteger(m.f) && FRASES[m.f]) { guardarMsg(de, { ele: true, f: m.f, em: Date.now() }); ultima = FRASES[m.f]; }
    else if (typeof m.e === "string" && emojiInfo(m.e)) { guardarMsg(de, { ele: true, e: m.e, em: Date.now() }); ultima = emojiInfo(m.e).e; }
  }
  if (!ultima) return;
  if (G.tela === "conversa" && AMG.com === de && !$("app").hidden) { conversa(de).forEach(x => (x.lida = true)); salvar(); }
  else if (!ON.on) toast(`${a.nome}: ${ultima}`, "Responder", () => abrirConversa(de));
  bip(1046, .06); reRender();
}
function abrirConversa(c) { AMG.com = c; conversa(c).forEach(m => (m.lida = true)); salvar(); ir("conversa"); entregarPendentes(c); }

TELAS.conversa = () => {
  const a = amigos().find(x => x.codigo === AMG.com);
  if (!a) { setTimeout(() => ir("amigos"), 0); return ""; }
  const l = conversa(a.codigo), on = AMG.online[a.codigo];
  const meusEmojis = EMOJIS.filter(e => temEmoji(perfil(), e.k));
  depoisFn = () => { const box = $("cv-msgs"); if (box) box.scrollTop = box.scrollHeight; };
  return `
  <section data-fundo="${fundoAtual()}" class="bgf lobby" aria-label="Conversa com ${esc(a.nome)}">
    <div class="lb-top"><button class="lb-pill" data-a="amigos">← Amigos</button>${on ? `<button class="lb-cont" data-a="chamarAmigo" data-c="${esc(a.codigo)}">Chamar para jogar</button>` : ""}</div>
    <div class="cv-cab">${avatarHTML(a.av, a.nome)}<span class="am-nome"><b>${esc(a.nome)}</b>${on ? `<span class="am-on">● online</span>` : `<span class="am-off">● fora (a mensagem chega quando os dois estiverem online)</span>`}</span></div>
    <div class="cv-msgs" id="cv-msgs" aria-live="polite">${l.length ? l.map(m => `<div class="cv-msg${m.ele ? "" : " eu"}${m.e ? " emo" : ""}">${esc(textoMsg(m))}${m.pendente ? `<i class="cv-esp">esperando</i>` : ""}</div>`).join("")
      : `<p class="dim" style="text-align:center">Nenhuma mensagem ainda. Escolha uma frase embaixo.</p>`}</div>
    <div class="cv-frases" role="group" aria-label="Frases para mandar">${FRASES.map((t, i) => `<button type="button" class="chip" data-a="mandarFrase" data-f="${i}">${esc(t)}</button>`).join("")}</div>
    <div class="a-emo" role="group" aria-label="Emojis para mandar">${meusEmojis.map(e => `<button type="button" data-a="mandarEmojiChat" data-e="${e.k}" aria-label="Mandar ${esc(e.nome)}">${e.e}</button>`).join("")}</div>
    <p class="dim" style="font-size:13px;text-align:center">Mais emojis na Loja. As mensagens ficam só neste celular e no do seu amigo.</p>
  </section>`;
};
Object.assign(acoes, {
  abrirConversa(el) { abrirConversa(el.dataset.c); },
  mandarFrase(el) { const f = +el.dataset.f; if (FRASES[f] && AMG.com) mandarMsg(AMG.com, { f }); },
  mandarEmojiChat(el) { const k = el.dataset.e; if (temEmoji(perfil(), k) && AMG.com) mandarMsg(AMG.com, { e: k }); },
});
TELAS_COM_MUSICA.push("conversa");

/* recebe "msg" e entrega pendentes quando o amigo aparece */
const _amigoRecebe = amigoRecebe;
amigoRecebe = (conn, d) => {
  _amigoRecebe(conn, d);
  const de = limparCodigoAmigo(d && d.de);
  if (!ehAmigo(de)) return;
  if (d.t === "msg") recebeMsgs(de, d);
  if (conversa(de).some(m => m.pendente)) setTimeout(() => entregarPendentes(de), 300);
};
const _verOnline = verQuemEstaOnline;
verQuemEstaOnline = async () => { await _verOnline(); amigos().forEach(a => { if (AMG.online[a.codigo] && conversa(a.codigo).some(m => m.pendente)) entregarPendentes(a.codigo); }); };
