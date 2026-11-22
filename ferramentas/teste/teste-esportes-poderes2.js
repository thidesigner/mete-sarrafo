// Os 8 poderes novos dos Esportes (ímã, fantasma, teleporte, super pulo, super defesa, muralha, furacão, clone): simulação, robôs, desenho 2D/3D e online.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-esportes-poderes2.js <pasta-para-fotos>`.
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
  r.sim = await a.evaluate(() => {
    const out = {}, mk = (tipo, pod) => { const E = espNovaPartida(tipo, [{ nome: "Andre", info: { ...espInfoJogador("Andre"), pod } }], 2); E.P.forEach(p => { if (!p.humano) { p.pod = null; p.inp = { x: 0, y: 0 }; } }); E.P[0].podCd = 0; return E; };
    const parar = E => E.P.forEach(q => { if (!q.humano) q.virouRobo = false; });
    const semIA = E => { const o = window.espIA; window.espIA = () => {}; return () => (window.espIA = o); };
    let volta = semIA();
    // ímã: bola solta vem até você
    let E = mk("futebol", "ima"), p = E.P[0]; p.x = 320; p.y = 700; E.b.dono = -1; E.b.x = 320; E.b.y = 450; E.b.vx = E.b.vy = 0; for (const q of E.P) if (q !== p) { q.x = 50; q.y = 950; }
    p.acao = "poder"; for (let i = 0; i < 90; i++) espPasso(E, 1 / 60); out.ima = { pegou: E.b.dono === p.i };
    // fantasma: ninguém rouba
    E = mk("futebol", "fantasma"); p = E.P[0]; E.b.dono = p.i; p.acao = "poder"; espPasso(E, 1 / 60); let ini = E.P.find(q => q.time !== p.time); let roubou = false;
    for (let i = 0; i < 120; i++) { ini.x = p.x + 10; ini.y = p.y; ini.cdRoubo = 0; espPasso(E, 1 / 60); if (E.b.dono !== p.i) roubou = true; } out.fantasma = { roubou };
    // teleporte: perto do gol do outro time
    E = mk("futebol", "tele"); p = E.P[0]; E.b.dono = p.i; const y0 = p.y; p.acao = "poder"; espPasso(E, 1 / 60); out.tele = { de: Math.round(y0), para: Math.round(p.y), comBola: E.b.dono === p.i };
    // super pulo (basquete): enterrada
    E = mk("basquete", "pulo"); p = E.P[0]; E.b.dono = p.i; const c = espAlvo(p.time); p.x = c.x + 60; p.y = c.y + 300; for (const q of E.P) if (q !== p) { q.x = 50; q.y = 950; } const pl0 = E.placar[p.time];
    p.acao = "poder"; for (let i = 0; i < 70; i++) espPasso(E, 1 / 60); out.pulo = { pontos: E.placar[p.time] - pl0, msg: E.msg };
    // super defesa: rouba sempre
    E = mk("futebol", "defesa"); p = E.P[0]; ini = E.P.find(q => q.time !== p.time); E.b.dono = ini.i; p.acao = "poder"; espPasso(E, 1 / 60); ini.x = p.x + 20; ini.y = p.y; espPasso(E, 1 / 60); out.defesa = { roubou: E.b.dono === p.i };
    // muralha: bola chutada no gol volta
    E = mk("futebol", "muralha"); p = E.P[0]; p.acao = "poder"; espPasso(E, 1 / 60); out.muralha = { muros: (E.muros || []).length };
    ini = E.P.find(q => q.time !== p.time); for (const q of E.P) { q.x = 50; q.y = 500; } E.b.dono = -1; E.b.x = ESP_W / 2; const gy = espAlvo(1 - p.time).y; E.b.y = gy < 500 ? 250 : 750; E.b.vx = 0; E.b.vy = gy < 500 ? -700 : 700;
    const pl1 = E.placar.slice(); for (let i = 0; i < 60; i++) espPasso(E, 1 / 60); out.muralha.golContra = E.placar[1 - p.time] - pl1[1 - p.time];
    // furacão: empurra e solta a bola
    E = mk("futebol", "furacao"); p = E.P[0]; ini = E.P.find(q => q.time !== p.time); ini.x = p.x + 60; ini.y = p.y; E.b.dono = ini.i; p.acao = "poder"; espPasso(E, 1 / 60); out.furacao = { longe: Math.round(espDist(ini.x, ini.y, p.x, p.y)), soltou: E.b.dono !== ini.i };
    // clone: rouba e passa para você
    E = mk("futebol", "clone"); p = E.P[0]; ini = E.P.find(q => q.time !== p.time); E.b.dono = ini.i; ini.x = 320; ini.y = 300; p.x = 320; p.y = 800; p.acao = "poder"; espPasso(E, 1 / 60);
    let veio = false; for (let i = 0; i < 360; i++) { espPasso(E, 1 / 60); if (E.b.dono === p.i || (E.b.dono < 0 && E.b.ultimo === p.i)) veio = true; } out.clone = { veio, clones: (E.clones || []).length };
    volta();
    // robôs usam os poderes novos
    const novos = ["ima", "fantasma", "tele", "pulo", "defesa", "muralha", "furacao", "clone"], usos = {};
    for (const tipo of ["futebol", "basquete"]) { E = espNovaPartida(tipo, [], 3); E.P.forEach((q, i) => (q.pod = novos[(i + (tipo === "basquete" ? 4 : 0)) % novos.length])); const orig = espUsarPoder; window.espUsarPoder = (E2, q) => { const r = orig(E2, q); if (r) usos[q.pod] = (usos[q.pod] || 0) + 1; return r; };
      for (let i = 0; i < 60 * 90; i++) espPasso(E, 1 / 60); window.espUsarPoder = orig; }
    out.robos = usos; return out; });
  // desenho 2D e 3D com vários poderes ao mesmo tempo
  await a.evaluate(() => { ir("esportes"); }); await a.waitForTimeout(400);
  await a.click('[data-a="espTipo"][data-k="futebol"]'); await a.click('[data-a="espJogar"]'); await a.waitForTimeout(1200);
  const pose = async () => a.evaluate(() => { const E = ESP.E, me = E.P[ESP.eu]; E.t = 100; E.P.forEach(q => { q.pod = null; q.podCd = 99; }); me.pulo = 0; me.fant = 3; me.defesa = 3; me.ima = 3;
    E.muros = [{ time: 1 - me.time, t: 4 }, { time: me.time, t: 4 }]; const ini = E.P.find(q => q.time !== me.time); E.clones = [{ dono: me.i, x: me.x + 80, y: me.y - 60, dir: -1.5, t: 5 }];
    E.fxPod = [{ k: "furacao", x: me.x, y: me.y, t: .5 }, { k: "tele", x: me.x - 80, y: me.y, t: .5 }]; });
  await pose(); await a.waitForTimeout(250); await a.screenshot({ path: S + '/ep2-3d.png' });
  await a.click('#es-visao'); await pose(); await a.waitForTimeout(250); await a.screenshot({ path: S + '/ep2-2d.png' });
  await a.click('#es-sair');
  // online: o amigo vê a muralha e o clone
  await a.click('[data-a="espCriarSala"]'); await a.waitForTimeout(800); const code = await a.evaluate(() => espOnline.code);
  const m = await abrir("Maria"); await m.evaluate(() => { espDarPoder("Maria", "clone"); salvar(); ir("esportes"); }); await m.waitForTimeout(300);
  await m.fill('#es-code', code); await m.click('[data-a="espEntrarForm"] button'); await m.waitForTimeout(1200);
  await a.click('[data-a="espComecarOnline"]'); await m.waitForTimeout(1500);
  await a.evaluate(() => { const ma = ESP.E.P.find(p => p.nome === "Maria"); ma.podCd = 0; ESP.E.P[ESP.eu].fant = 3; ESP.E.muros = [{ time: 0, t: 4 }]; });
  await m.keyboard.press('q'); await m.waitForTimeout(700);
  r.online = { host: await a.evaluate(() => ({ clones: (ESP.E.clones || []).length })), amigo: await m.evaluate(() => ({ clones: (ESP.E.clones || []).length, muros: (ESP.E.muros || []).length, fant: ESP.E.P.some(q => q.fant > 0) })) };
  await m.screenshot({ path: S + '/ep2-amigo.png' });
  console.log(JSON.stringify({ r, errs }, null, 1)); await b.close(); })();
