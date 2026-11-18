// Mini jogos (Futebol e Basquete): partida contra robôs (gol/cesta, placar, fim e moedas) e online com dois celulares (sala, começar, controle e fim).
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-esportes.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abrir = async nome => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(n => { G.perfil = n; G.banco[n] = 100; G.inv = G.inv || {}; G.inv[n] = G.inv[n] || { vidas: 0 }; salvar(); ir("lobby"); }, nome); await pg.waitForTimeout(300); return pg; };
  const a = await abrir("Andre");
  await a.screenshot({ path: S + '/es-lobby.png' });
  await a.click('[data-a="esportes"]'); await a.waitForTimeout(300); await a.screenshot({ path: S + '/es-escolha.png', fullPage: true });
  const res = {};
  for (const tipo of ["futebol", "basquete"]) {
    await a.click(`[data-a="espTipo"][data-k="${tipo}"]`); await a.click('[data-a="espTam"][data-n="2"]'); await a.click('[data-a="espJogar"]'); await a.waitForTimeout(600);
    // eu ando para frente com a bola e chuto/arremesso várias vezes; robôs jogam sozinhos
    for (let k = 0; k < 6; k++) { await a.keyboard.down('w'); await a.waitForTimeout(500); await a.keyboard.up('w'); await a.keyboard.press(' '); await a.waitForTimeout(300); }
    await a.screenshot({ path: S + `/es-${tipo}.png` });
    const meio = await a.evaluate(() => ({ placar: ESP.E.placar.slice(), t: Math.round(ESP.E.t), bola: ESP.E.b.dono }));
    // força o fim
    const antes = await a.evaluate(() => G.banco.Andre);
    await a.evaluate(() => { ESP.E.t = .01; ESP.E.pausa = 0; ESP.E.depois = null; ESP.E.msg = ''; }); await a.waitForTimeout(500);
    await a.screenshot({ path: S + `/es-${tipo}-fim.png` });
    const fim = await a.evaluate(() => ({ fim: ESP.E.fim, txt: $("es-fim").innerText.split("\n").slice(0, 3).join(" | ") }));
    res[tipo] = { meio, fim, moedas: +(await a.evaluate(() => G.banco.Andre) - antes).toFixed(1) };
    await a.click('#es-sair2'); await a.waitForTimeout(300);
  }
  // simulação longa só com robôs: sai gol/cesta?
  res.robos = await a.evaluate(() => { const r = {}; for (const tipo of ["futebol", "basquete"]) { const E = espNovaPartida(tipo, [], 3); for (let i = 0; i < 60 * 120; i++) espPasso(E, 1 / 60); r[tipo] = E.placar; } return r; });
  // online
  await a.click('[data-a="espTipo"][data-k="futebol"]'); await a.click('[data-a="espCriarSala"]'); await a.waitForTimeout(800);
  const code = await a.evaluate(() => espOnline.code);
  const m = await abrir("Maria"); await m.click('[data-a="esportes"]'); await m.fill('#es-code', code); await m.click('[data-a="espEntrarForm"] button'); await m.waitForTimeout(1200);
  await a.screenshot({ path: S + '/es-sala.png' });
  const sala = { a: await a.evaluate(() => espOnline.lista.map(x => x.nome)), m: await m.evaluate(() => [G.tela, espOnline.lista.map(x => x.nome)]) };
  await a.click('[data-a="espComecarOnline"]'); await a.waitForTimeout(1200);
  const mEu = await m.evaluate(() => ({ eu: ESP.eu, nome: ESP.E.P[ESP.eu].nome, n: ESP.E.P.length }));
  const y0 = await a.evaluate(() => ESP.E.P.find(p => p.nome === "Maria").y);
  await m.keyboard.down(await m.evaluate(() => ESP.E.P[ESP.eu].time === 0 ? 'w' : 's')); await m.waitForTimeout(700); await m.keyboard.up('w'); await m.keyboard.up('s');
  const y1 = await a.evaluate(() => ESP.E.P.find(p => p.nome === "Maria").y);
  await m.waitForTimeout(400); await m.screenshot({ path: S + '/es-online-amigo.png' });
  const vê = await m.evaluate(() => ({ tempo: $("es-tempo").textContent, pos: [Math.round(ESP.E.P[ESP.eu].y)] }));
  await a.evaluate(() => { ESP.E.t = .01; }); await a.waitForTimeout(800);
  const fimM = await m.evaluate(() => ({ fim: !!ESP.E.fim, txt: $("es-fim").hidden ? null : $("es-fim").innerText.split("\n")[1] }));
  await a.click('#es-denovo'); await a.waitForTimeout(800);
  const denovo = await m.evaluate(() => ({ fim: ESP.E.fim, t: Math.round(ESP.E.t), fimHidden: $("es-fim").hidden }));
  await a.click('#es-sair'); await a.waitForTimeout(800);
  const fechou = await m.evaluate(() => ({ tela: G.tela, aberto: !!ESP.E }));
  console.log(JSON.stringify({ res, code, sala, mEu, andou: Math.round(y1 - y0), vê, fimM, denovo, fechou, errs }, null, 1)); await b.close(); })();
