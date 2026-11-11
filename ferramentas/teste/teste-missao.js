// Missão do evento na Praça Central: história do Sol contra a Lua, fragmentos espalhados, história final e prêmios.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-missao.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  const SEM_ADM = process.env.SEM_ADM === '1';   // sem o ADM ligar, não pode aparecer história nem missão
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(SEM_ADM ? { avisos: [] } : { avisos: [], historias: [{ id: "m1", tema: "eclipse", de: "2026-11-01T00:00:00-03:00", ate: "2030-01-01T00:00:00-03:00" }] }) }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { G.perfil = "Andre"; G.banco.Andre = 100; salvar(); ir("lobby"); }); await pg.waitForTimeout(1200);
  await pg.evaluate(() => abrirPraca());
  if (SEM_ADM) { await pg.waitForTimeout(5000); console.log(JSON.stringify({ semAdm: await pg.evaluate(() => ({ hist: !!PRACA.hist, lista: historiasAgora().map(h => h.id), frags: PRACA.frags.length })) })); await b.close(); return; }
  const espera = c => pg.waitForFunction(c, null, { timeout: 60000 });
  await espera(() => PRACA.hist && PRACA.hist.fala === 4); await pg.waitForTimeout(1600); await pg.screenshot({ path: S + '/ms-quebra.png' });
  await espera(() => !PRACA.hist);
  const n0 = await pg.evaluate(() => ({ frags: PRACA.frags.length, hud: $("pr-missao").textContent }));
  await pg.evaluate(() => { PRACA.eu.x = 0; PRACA.eu.z = 9; PRACA.yaw = .6; PRACA.alt = .55; }); await pg.waitForTimeout(800); await pg.screenshot({ path: S + '/ms-frags.png' });
  // pega 9 andando até cada um
  for (let k = 0; k < 9; k++) { await pg.evaluate(() => { const f = PRACA.frags[0]; PRACA.eu.x = f.x; PRACA.eu.z = f.z; }); await pg.waitForTimeout(250); }
  const n1 = await pg.evaluate(() => ({ frags: PRACA.frags.length, hud: $("pr-missao").textContent }));
  await pg.evaluate(() => { const f = PRACA.frags[0]; PRACA.eu.x = f.x + 3; PRACA.eu.z = f.z; PRACA.yaw = Math.atan2(3, 0) ; PRACA.alt = .35; }); await pg.waitForTimeout(500); await pg.screenshot({ path: S + '/ms-perto.png' });
  await pg.evaluate(() => { const f = PRACA.frags[0]; PRACA.eu.x = f.x; PRACA.eu.z = f.z; });
  await espera(() => PRACA.hist && PRACA.hist.h.id.startsWith("fim-")); await espera(() => PRACA.hist && PRACA.hist.fala === 1); await pg.waitForTimeout(2600); await pg.screenshot({ path: S + '/ms-final.png' });
  await espera(() => !PRACA.hist); await pg.waitForTimeout(500); await pg.screenshot({ path: S + '/ms-premio.png' });
  const fim = await pg.evaluate(() => ({ banco: G.banco.Andre, skin: temSkin("Andre", "eclipse"), gesto: temGesto("Andre", "eclipsetotal"), premios: [...document.querySelectorAll('.pr-premios li')].map(x => x.textContent), frags: PRACA.frags.length, hud: $("pr-missao").hidden }));
  // gesto não aparece na loja para quem não tem
  console.log(JSON.stringify({ n0, n1, fim, errs })); await b.close(); })();
