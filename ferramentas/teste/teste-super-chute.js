// Super chute (🔥 Chute de fogo) no futebol: escolher por cima (voa alto, ninguém alcança, passa a muralha) ou rasteiro; botões e online.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-super-chute.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abrir = async (nome) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(n => { G.perfil = n; G.banco[n] = 100; G.inv = G.inv || {}; G.inv[n] = { vidas: 0 }; G.espPresente = { [n]: true }; espDarPoder(n, "fogo"); G.esp3d = true; salvar(); ir("lobby"); }, nome); await pg.waitForTimeout(300); return pg; };
  const a = await abrir("Andre"), r = {};
  r.sim = await a.evaluate(() => {
    const o = window.espIA; window.espIA = () => {};
    const mk = () => { const E = espNovaPartida("futebol", [{ nome: "Andre", info: { ...espInfoJogador("Andre"), pod: "fogo" } }], 2); E.P.forEach(q => { q.inp = { x: 0, y: 0 }; if (!q.humano) q.pod = null; }); return E; };
    const chute = (alto, muro) => { const E = mk(), p = E.P[0], ini = E.P.find(q => q.time !== p.time), c = espAlvo(p.time); for (const q of E.P) { q.x = 40; q.y = 500; }
      p.x = ESP_W / 2; p.y = c.y < 500 ? 420 : 580; p.dir = c.y < 500 ? -Math.PI / 2 : Math.PI / 2; ini.x = ESP_W / 2; ini.y = c.y < 500 ? 250 : 750; ini.cdPegar = 0;
      if (muro) E.muros = [{ time: 1 - p.time, t: 9 }]; E.b.dono = p.i; p.fogo = 5; p.acao = alto ? "chuteAlto" : "chute"; let zmax = 0;
      const pl = E.placar[p.time]; for (let i = 0; i < 90; i++) { espPasso(E, 1 / 60); zmax = Math.max(zmax, E.b.z); if (E.pausa > 0) break; }
      return { gol: E.placar[p.time] > pl, zmax: Math.round(zmax), defensorPegou: E.b.dono === ini.i }; };
    const out = { alto: chute(true), rasteiro: chute(false), altoMuro: chute(true, true), rasteiroMuro: chute(false, true) };
    window.espIA = o; return out; });
  await a.evaluate(() => ir("esportes")); await a.waitForTimeout(300);
  await a.click('[data-a="espTipo"][data-k="futebol"]'); await a.click('[data-a="espJogar"]'); await a.waitForTimeout(1000);
  r.antes = await a.evaluate(() => ({ alto: $("es-alto").hidden, txt: $("es-chutetxt").textContent }));
  await a.evaluate(() => { const me = ESP.E.P[ESP.eu]; me.podCd = 0; ESP.E.b.dono = me.i; }); await a.keyboard.press('q'); await a.waitForTimeout(300);
  r.pronto = await a.evaluate(() => ({ alto: $("es-alto").hidden, txt: $("es-chutetxt").textContent }));
  await a.screenshot({ path: S + '/sc-botoes.png' });
  await a.click('#es-alto', { force: true }); await a.waitForTimeout(350); r.voou = await a.evaluate(() => Math.round(ESP.E.b.z)); await a.screenshot({ path: S + '/sc-alto3d.png' });
  await a.click('#es-sair');
  // online: o amigo chuta por cima
  await a.click('[data-a="espCriarSala"]'); await a.waitForTimeout(800); const code = await a.evaluate(() => espOnline.code);
  const m = await abrir("Maria"); await m.evaluate(() => ir("esportes")); await m.waitForTimeout(300);
  await m.fill('#es-code', code); await m.click('[data-a="espEntrarForm"] button'); await m.waitForTimeout(1200);
  await a.click('[data-a="espComecarOnline"]'); await m.waitForTimeout(1500);
  await a.evaluate(() => { const ma = ESP.E.P.find(p => p.nome === "Maria"); ma.fogo = 5; ESP.E.b.dono = ma.i; ESP.E.P.forEach(q => { if (q !== ma) { q.x = 40; q.y = 40; } }); });
  await m.waitForTimeout(400); r.amigoBotao = await m.evaluate(() => !$("es-alto").hidden);
  await m.click('#es-alto', { force: true }); await m.waitForTimeout(400);
  r.online = await a.evaluate(() => ({ alta: Math.round(ESP.E.b.z), alto: !!ESP.E.b.alto }));
  console.log(JSON.stringify({ r, errs }, null, 1)); await b.close(); })();
