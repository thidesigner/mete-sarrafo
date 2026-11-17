// Poder do ADM "Voar na Praça": o ADM libera só o Andre (aba Poderes); ele voa, sobe e desce, o amigo vê a altura e outro perfil não ganha o botão.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-voar.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abrir = async (nome, voar) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(([n, v]) => { G.perfil = n; G.banco[n] = 100; G.inv = G.inv || {}; G.inv[n] = G.inv[n] || { vidas: 0 }; G.historias = { vistas: historiasAgora().map(h => h.id) }; if (v) { ajustesAbertos = true; ADM.aba = "poderes"; ir("adm"); } else ir("lobby"); salvar(); }, [nome, voar]); await pg.waitForTimeout(300); return pg; };
  const a = await abrir("Andre", true);
  await a.screenshot({ path: S + '/voar-adm.png' });
  await a.click('[data-a="admPoder"][data-k="voar"]'); await a.waitForTimeout(200);
  const ligado = await a.evaluate(() => G.admVoar);
  await a.evaluate(() => ir("lobby")); await a.waitForTimeout(200);
  await a.click('[data-a="praca"]'); await a.waitForTimeout(1500);
  const m = await abrir("Maria", false); await m.click('[data-a="praca"]'); await m.waitForTimeout(1500);
  const temBotao = await a.$("#pr-voar") !== null, mSemBotao = await m.$("#pr-voar") === null;
  await a.click('#pr-voar', { force: true }); await a.waitForTimeout(300);
  const b0 = await a.$('#pr-pular').then(x => x.boundingBox());
  await a.mouse.move(b0.x + b0.width / 2, b0.y + b0.height / 2); await a.mouse.down(); await a.waitForTimeout(1200); await a.mouse.up();
  const alto = await a.evaluate(() => PRACA.eu.y);
  await a.evaluate(() => { PRACA.yaw = 0; PRACA.alt = .5; }); await a.waitForTimeout(500);
  await a.screenshot({ path: S + '/voar-alto.png' });
  await m.waitForTimeout(1500); const mVe = await m.evaluate(() => [...PRACA.outros.values()].map(o => +o.y.toFixed(1)));
  await m.evaluate(() => { PRACA.eu.x = 0; PRACA.eu.z = 16; PRACA.yaw = 0; PRACA.alt = .2; }); await m.waitForTimeout(600); await m.screenshot({ path: S + '/voar-amigo.png' });
  const d0 = await a.$('#pr-descer').then(x => x.boundingBox());
  await a.mouse.move(d0.x + d0.width / 2, d0.y + d0.height / 2); await a.mouse.down(); await a.waitForTimeout(700); await a.mouse.up();
  const baixo = await a.evaluate(() => PRACA.eu.y);
  await a.click('#pr-voar', { force: true }); await a.waitForTimeout(1500);
  const chao = await a.evaluate(() => ({ y: PRACA.eu.y, voando: PRACA.voando, descer: $("pr-descer").hidden }));
  console.log(JSON.stringify({ ligado, temBotao, mSemBotao, alto, mVe, baixo, chao, errs })); await b.close(); })();
