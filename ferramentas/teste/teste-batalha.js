// Histórias com batalha das coleções da semana (HIST_BATALHA): o boss aparece, batalha, foge, missão em 2 capítulos e batalha final com prêmio.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-batalha.js <pasta-para-fotos> [oceano|dinos|natal]`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2], TEMA = process.argv[3] || 'oceano', DIA = { oceano: '2026-11-23', dinos: '2026-11-30', natal: '2026-12-07' }[TEMA], GES = { oceano: 'heroimar', dinos: 'heroidino', natal: 'heroinatal' }[TEMA]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ avisos: [], historias: [{ id: "b" + TEMA, tema: TEMA, de: DIA + "T00:00:00-03:00", ate: DIA + "T23:00:00-03:00" }] }) }));
  await ctx.addInitScript(dia => { const d = Date.parse(dia + "T10:00:00-03:00") - Date.now(); const n = Date.now; Date.now = () => n() + d; }, DIA);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { G.perfil = "Andre"; G.banco.Andre = 100; salvar(); ir("lobby"); }); await pg.waitForTimeout(1500);
  await pg.evaluate(() => abrirPraca());
  const espera = c => pg.waitForFunction(c, null, { timeout: 90000 });
  await espera(() => PRACA.hist && PRACA.hist.fala === 2); await pg.waitForTimeout(2500); await pg.screenshot({ path: S + '/' + TEMA + '-1.png' });
  await espera(() => PRACA.hist && PRACA.hist.fala === 4); await pg.waitForTimeout(1500); await pg.screenshot({ path: S + '/' + TEMA + '-2.png' });
  await espera(() => !PRACA.hist);
  const m1 = await pg.evaluate(() => ({ frags: PRACA.frags.length, hud: $("pr-missao").textContent }));
  const pega = async () => { for (let k = 0; k < 10; k++) { await pg.evaluate(() => { const f = PRACA.frags[0]; if (f) { PRACA.eu.x = f.x; PRACA.eu.z = f.z; } }); await pg.waitForTimeout(260); } };
  await pega();
  await espera(() => PRACA.hist && PRACA.hist.h.id.startsWith("cap-")); await espera(() => PRACA.hist && PRACA.hist.fala === 1); await pg.waitForTimeout(1500); await pg.screenshot({ path: S + '/' + TEMA + '-cap.png' });
  await espera(() => !PRACA.hist); await pg.waitForTimeout(1800);
  const m2 = await pg.evaluate(() => ({ frags: PRACA.frags.length, hud: $("pr-missao").textContent }));
  await pg.evaluate(() => { PRACA.eu.x = 0; PRACA.eu.z = 9; PRACA.yaw = .4; PRACA.alt = .5; }); await pg.waitForTimeout(500); await pg.screenshot({ path: S + '/' + TEMA + '-m2.png' });
  await pega();
  await espera(() => PRACA.hist && PRACA.hist.h.id.startsWith("fim-")); await espera(() => PRACA.hist && PRACA.hist.fala === 2); await pg.waitForTimeout(1500); await pg.screenshot({ path: S + '/' + TEMA + '-fim.png' });
  await espera(() => !PRACA.hist); await pg.waitForTimeout(500); await pg.screenshot({ path: S + '/' + TEMA + '-premio.png' });
  const fim = await pg.evaluate(g => ({ premios: [...document.querySelectorAll('.pr-premios li')].map(x => x.textContent), gesto: temGesto("Andre", g), skin: G.inv.Andre.skin }), GES);
  console.log(JSON.stringify({ m1, m2, fim, errs })); await b.close(); })();
