// Mini jogos em 3D: abre futebol e basquete em 3D, confere câmera/controle do time Vermelho, gol com confete, troca 2D/3D e o amigo online em 3D.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-esportes3d.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abrir = async nome => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(n => { G.perfil = n; G.banco[n] = 100; G.inv = G.inv || {}; G.inv[n] = G.inv[n] || { vidas: 0 }; G.esp3d = true; salvar(); ir("esportes"); }, nome); await pg.waitForTimeout(300); return pg; };
  const a = await abrir("Andre"); const res = {};
  await a.screenshot({ path: S + '/e3-escolha.png' });
  for (const tipo of ["futebol", "basquete"]) {
    await a.click(`[data-a="espTipo"][data-k="${tipo}"]`); await a.click('[data-a="espTam"][data-n="3"]'); await a.click('[data-a="espJogar"]'); await a.waitForTimeout(1500);
    await a.keyboard.down('w'); await a.waitForTimeout(900); await a.keyboard.up('w'); await a.waitForTimeout(300);
    await a.screenshot({ path: S + `/e3-${tipo}.png` });
    // força um ponto do meu time e fotografa a festa
    await a.evaluate(() => { const E = ESP.E; espPonto(E, E.P[ESP.eu].time, E.tipo === "basquete" ? 3 : 1); }); await a.waitForTimeout(500);
    await a.screenshot({ path: S + `/e3-${tipo}-ponto.png` });
    res[tipo] = await a.evaluate(() => ({ v3: ESP.v3, mods: E3.mods.length, confete: E3.confete.length, cv3: !!document.querySelector('.es-cv3') }));
    // arremesso no basquete: a bola sobe até o aro
    if (tipo === "basquete") res.arco = await a.evaluate(() => { const E = espNovaPartida("basquete", [], 1), p = E.P[0]; E.b.dono = p.i; p.x = 320; p.y = 400; espArremessar(E, p); let max = 0, fim = 0; for (let i = 0; i < 120 && E.b.voo; i++) { espPasso(E, 1 / 60); max = Math.max(max, E.b.h3); fim = E.b.h3; } return { max: Math.round(max), fimAprox: Math.round(fim) }; });
    // troca para 2D e volta
    await a.click('#es-visao'); await a.waitForTimeout(300); res[tipo + "2d"] = await a.evaluate(() => ({ v3: ESP.v3, cv3: !!document.querySelector('.es-cv3'), cv: !$("es-cv").hidden }));
    await a.click('#es-visao'); await a.waitForTimeout(300);
    await a.click('#es-sair'); await a.waitForTimeout(300);
  }
  // controle do time Vermelho no 3D: apertar "para cima" vai para o gol de baixo (que ele ataca)
  res.vermelho = await a.evaluate(() => { ESP.v3 = true; ESP.E = { P: [{ time: 1 }] }; ESP.eu = 0; ESP.keys = { w: true }; const v = espEntrada(); ESP.keys = {}; ESP.E = null; ESP.v3 = false; return v; });
  // online: o amigo também vê em 3D
  await a.click('[data-a="espTipo"][data-k="futebol"]'); await a.click('[data-a="espCriarSala"]'); await a.waitForTimeout(800);
  const code = await a.evaluate(() => espOnline.code);
  const m = await abrir("Maria"); await m.fill('#es-code', code); await m.click('[data-a="espEntrarForm"] button'); await m.waitForTimeout(1200);
  await a.click('[data-a="espComecarOnline"]'); await m.waitForTimeout(2000);
  await m.screenshot({ path: S + '/e3-online-amigo.png' });
  res.amigo = await m.evaluate(() => ({ v3: ESP.v3, mods: E3.mods.length, time: ESP.E.P[ESP.eu].time }));
  console.log(JSON.stringify({ res, errs })); await b.close(); })();
