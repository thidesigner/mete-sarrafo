// Posições nos Esportes: escolher antes de jogar, robôs nas que faltam, vantagem de cada uma, desenho 2D/3D e online.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-esportes-posicoes.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abrir = async (nome) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(n => { G.perfil = n; G.banco[n] = 100; G.inv = G.inv || {}; G.inv[n] = { vidas: 0 }; G.espPresente = { [n]: true }; G.esp3d = true; salvar(); ir("lobby"); }, nome); await pg.waitForTimeout(300); return pg; };
  const a = await abrir("Andre"), r = {};
  await a.click('[data-a="esportes"]'); await a.waitForTimeout(500); await a.click('[data-a="espTipo"][data-k="futebol"]'); await a.click('[data-a="espTam"][data-n="3"]');
  await a.click('[data-a="espPos"][data-k="gol"]'); await a.waitForTimeout(200);
  r.escolheu = await a.evaluate(() => G.inv.Andre.espPos); const sec = await a.$('[data-a="espPos"]'); await sec.scrollIntoViewIfNeeded(); await a.screenshot({ path: S + '/pos-tela.png' });
  r.sim = await a.evaluate(() => {
    const o = window.espIA; window.espIA = () => {}; const out = {};
    let E = espNovaPartida("futebol", [{ nome: "Andre" }], 3); out.futebol = E.P.map(p => `${p.time}:${p.pos}`).join(" ");
    E = espNovaPartida("basquete", [{ nome: "Andre" }], 3); out.basquete = E.P.map(p => `${p.time}:${p.pos}`).join(" ");
    // zagueiro rouba mais que o meio-campo
    const roubos = pos => { let n = 0; for (let k = 0; k < 400; k++) { const E = espNovaPartida("futebol", [{ nome: "Andre" }], 1); const q = E.P[0], d = E.P[1]; q.pos = pos; d.pos = "ata"; E.b.dono = d.i; q.x = d.x + 10; q.y = d.y; q.cdRoubo = 0; E.P.forEach(x => (x.inp = { x: 0, y: 0 })); espPasso(E, 1 / 60); if (E.b.dono === q.i) n++; } return n; };
    out.roubo = { zag: roubos("zag"), meio: roubos("meio") };
    // atacante chuta mais forte
    const chute = pos => { const E = espNovaPartida("futebol", [{ nome: "Andre" }], 1), p = E.P[0]; p.pos = pos; p.fogo = 0; E.b.dono = p.i; espChutar(E, p, false); return Math.round(Math.hypot(E.b.vx, E.b.vy)); };
    out.chute = { ata: chute("ata"), zag: chute("zag") };
    // goleiro segura o chute de fogo perto do gol
    E = espNovaPartida("futebol", [{ nome: "Andre" }], 1); let g = E.P[0], at = E.P[1]; g.pos = "gol"; const gol = espAlvo(1 - g.time); g.x = gol.x; g.y = gol.y + (gol.y < 500 ? 80 : -80); E.b.dono = -1; E.b.x = g.x + 40; E.b.y = g.y; E.b.vx = E.b.vy = 0; E.b.fogo = 1; E.b.fogoTime = at.time; at.x = 40; at.y = 500; g.cdPegar = 0;
    espPasso(E, 1 / 60); out.goleiroSegurou = E.b.dono === g.i;
    // ala acerta mais de 3
    const tres = pos => { let ok = 0; for (let k = 0; k < 400; k++) { const E = espNovaPartida("basquete", [{ nome: "Andre" }], 1), p = E.P[0]; p.pos = pos; const c = espAlvo(p.time); p.x = c.x; p.y = c.y + (c.y < 500 ? 360 : -360); E.P[1].x = 40; E.P[1].y = 500; E.b.dono = p.i; espArremessar(E, p); ok += E.b.voo.ok ? 1 : 0; } return ok; };
    out.tres = { ala: tres("ala"), arm: tres("arm") };
    window.espIA = o;
    // robôs: goleiro fica perto do gol numa partida só de robôs
    E = espNovaPartida("futebol", [], 3); let longe = 0; for (let i = 0; i < 60 * 40; i++) { espPasso(E, 1 / 60); const gk = E.P.find(p => p.time === 0 && p.pos === "gol"), meu = espAlvo(1); if (E.pausa <= 0 && espDist(gk.x, gk.y, meu.x, meu.y) > 400) longe++; } out.goleiroLonge = longe;
    return out; });
  await a.click('[data-a="espJogar"]'); await a.waitForTimeout(1300); await a.screenshot({ path: S + '/pos-3d.png' });
  r.minhaPos = await a.evaluate(() => ESP.E.P[ESP.eu].pos);
  await a.click('#es-visao'); await a.waitForTimeout(400); await a.screenshot({ path: S + '/pos-2d.png' }); await a.click('#es-visao'); await a.click('#es-sair');
  // online: a posição do amigo chega
  await a.click('[data-a="espTipo"][data-k="basquete"]'); await a.click('[data-a="espCriarSala"]'); await a.waitForTimeout(800); const code = await a.evaluate(() => espOnline.code);
  const m = await abrir("Maria"); await m.evaluate(() => { G.inv.Maria.espPos = { basquete: "piv" }; salvar(); ir("esportes"); }); await m.waitForTimeout(300);
  await m.fill('#es-code', code); await m.click('[data-a="espEntrarForm"] button'); await m.waitForTimeout(1200);
  await a.click('[data-a="espComecarOnline"]'); await m.waitForTimeout(1500);
  r.online = { host: await a.evaluate(() => ESP.E.P.find(p => p.nome === "Maria").pos), amigo: await m.evaluate(() => ESP.E.P.map(p => p.pos).join(",")) };
  console.log(JSON.stringify({ r, errs }, null, 1)); await b.close(); })();
