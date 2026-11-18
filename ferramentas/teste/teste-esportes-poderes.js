// Poderes dos Esportes: presente na 1ª vez, Caixa de poder (moedas), escolher, cada poder (fogo, turbo, gelo), robôs usando e o online.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-esportes-poderes.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abrir = async (nome, moedas) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(([n, m]) => { G.perfil = n; G.banco[n] = m; G.inv = G.inv || {}; G.inv[n] = { vidas: 0 }; if (G.espPresente) delete G.espPresente[n]; G.esp3d = true; salvar(); ir("lobby"); }, [nome, moedas]); await pg.waitForTimeout(300); return pg; };
  const a = await abrir("Andre", 1000), r = {};
  await a.click('[data-a="esportes"]'); await a.waitForTimeout(900); await a.screenshot({ path: S + '/ep-presente.png' });
  await a.click('#es-sort-ok', { timeout: 5000 }); await a.waitForTimeout(300);
  r.presente = await a.evaluate(() => espPoderesDe("Andre"));
  // presente só uma vez
  await a.evaluate(() => { ir("lobby"); }); await a.click('[data-a="esportes"]'); await a.waitForTimeout(600); r.presente2 = await a.evaluate(() => [!!document.querySelector('#es-sort'), espPoderesDe("Andre").length]);
  await a.click('[data-a="espCaixa"]'); await a.waitForTimeout(1900); await a.screenshot({ path: S + '/ep-caixa.png' }); await a.click('#es-sort-ok'); await a.waitForTimeout(300);
  r.caixa = await a.evaluate(() => ({ pods: espPoderesDe("Andre"), banco: G.banco.Andre, usar: espPoderUsado("Andre") }));
  await a.screenshot({ path: S + '/ep-tela.png', fullPage: true });
  // cada poder na simulação
  r.sim = await a.evaluate(() => {
    const out = {}, mk = (tipo, pod) => { const E = espNovaPartida(tipo, [{ nome: "Andre", info: { ...espInfoJogador("Andre"), pod } }], 2); E.P.forEach(p => { if (!p.humano) p.pod = null; }); E.P[0].podCd = 0; return E; };
    let E = mk("futebol", "turbo"), p = E.P[0]; p.inp = { x: 1, y: 0 }; p.x = 100; E.b.dono = -1; E.b.x = 600; E.b.y = 50; for (const q of E.P) if (q !== p) { q.x = 600; q.y = 900; }
    for (let i = 0; i < 30; i++) espPasso(E, 1 / 60); const x0 = p.x; p.acao = "poder"; for (let i = 0; i < 30; i++) { p.inp = { x: 1, y: 0 }; espPasso(E, 1 / 60); } out.turbo = { antes: Math.round(x0 - 100), depois: Math.round(p.x - x0), cd: Math.round(p.podCd) };
    E = mk("futebol", "gelo"); p = E.P[0]; const inim = E.P.find(q => q.time !== p.time); inim.x = p.x + 60; inim.y = p.y; E.b.dono = inim.i; p.acao = "poder"; espPasso(E, 1 / 60); out.gelo = { congelado: inim.gelo > 0, soltou: E.b.dono !== inim.i };
    const yy = inim.y; inim.inp = { x: 0, y: 1 }; for (let i = 0; i < 30; i++) espPasso(E, 1 / 60); out.gelo.parado = Math.abs(inim.y - yy) < 1;
    E = mk("futebol", "fogo"); p = E.P[0]; p.acao = "poder"; espPasso(E, 1 / 60); E.b.dono = p.i; p.dir = -Math.PI / 2; espChutar(E, p); out.fogo = { vel: Math.round(Math.hypot(E.b.vx, E.b.vy)), fogo: E.b.fogo > 0 };
    const ini = E.P.find(q => q.time !== p.time); ini.x = E.b.x; ini.y = E.b.y - 20; ini.cdPegar = 0; espPasso(E, 1 / 60); out.fogo.naoSegurou = E.b.dono !== ini.i;
    E = mk("basquete", "fogo"); p = E.P[0]; p.acao = "poder"; espPasso(E, 1 / 60); E.b.dono = p.i; p.x = 320; p.y = 700; let ok = 0; for (let k = 0; k < 20; k++) { p.fogo = 1; E.b.voo = null; E.b.dono = p.i; espArremessar(E, p); ok += E.b.voo.ok ? 1 : 0; } out.fogoBasquete = ok + "/20";
    // robôs usam poder numa partida só de robôs
    E = espNovaPartida("futebol", [], 3); let usos = 0; const orig = espUsarPoder; window.espUsarPoder = (E2, q) => { const r = orig(E2, q); if (r) usos++; return r; };
    for (let i = 0; i < 60 * 60; i++) espPasso(E, 1 / 60); window.espUsarPoder = orig; out.robosUsaram = usos;
    return out; });
  // partida 3D com poder: aperta Q
  await a.click('[data-a="espTipo"][data-k="futebol"]'); await a.click('[data-a="espJogar"]'); await a.waitForTimeout(1200);
  await a.evaluate(() => { const me = ESP.E.P[ESP.eu]; me.podCd = 0; me.pod = "gelo"; const q = ESP.E.P.find(x => x.time !== me.time); q.x = me.x + 50; q.y = me.y; }); await a.keyboard.press('q'); await a.waitForTimeout(500);
  await a.screenshot({ path: S + '/ep-gelo3d.png' });
  r.botao = await a.evaluate(() => ({ txt: $("es-podtxt").textContent, dis: $("es-poder").disabled }));
  await a.evaluate(() => { const me = ESP.E.P[ESP.eu]; me.podCd = 0; me.pod = "turbo"; }); await a.keyboard.press('q'); await a.keyboard.down('w'); await a.waitForTimeout(600); await a.keyboard.up('w'); await a.screenshot({ path: S + '/ep-turbo3d.png' });
  await a.click('#es-visao'); await a.evaluate(() => { const me = ESP.E.P[ESP.eu]; me.podCd = 0; me.pod = "fogo"; ESP.E.b.dono = me.i; }); await a.keyboard.press('q'); await a.waitForTimeout(100); await a.keyboard.press(' '); await a.waitForTimeout(250); await a.screenshot({ path: S + '/ep-fogo2d.png' });
  await a.click('#es-sair');
  // online: o amigo usa o poder
  await a.click('[data-a="espCriarSala"]'); await a.waitForTimeout(800); const code = await a.evaluate(() => espOnline.code);
  const m = await abrir("Maria", 0); await m.evaluate(() => { espDarPoder("Maria", "gelo"); salvar(); ir("esportes"); }); await m.waitForTimeout(300);
  await m.fill('#es-code', code); await m.click('[data-a="espEntrarForm"] button'); await m.waitForTimeout(1200);
  await a.click('[data-a="espComecarOnline"]'); await m.waitForTimeout(1500);
  r.online = { podAmigo: await a.evaluate(() => ESP.E.P.find(p => p.nome === "Maria").pod), botaoAmigo: await m.evaluate(() => !!$("es-poder")) };
  await a.evaluate(() => { const ma = ESP.E.P.find(p => p.nome === "Maria"); ma.podCd = 0; const q = ESP.E.P.find(x => x.time !== ma.time); q.x = ma.x + 40; q.y = ma.y; });
  await m.keyboard.press('q'); await m.waitForTimeout(600);
  r.online.usou = await a.evaluate(() => { const ma = ESP.E.P.find(p => p.nome === "Maria"); return { cd: Math.round(ma.podCd), alguemGelado: ESP.E.P.some(q => q.gelo > 0) }; });
  r.online.amigoVe = await m.evaluate(() => ({ cd: ESP.E.P[ESP.eu].podCd, gelado: ESP.E.P.some(q => q.gelo > 0) }));
  console.log(JSON.stringify({ r, errs }, null, 1)); await b.close(); })();
