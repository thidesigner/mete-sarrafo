// Mini história dos eventos na Praça Central: a nave dos robôs Bip e Bop conta cada evento (moedas, promoção, vidas e presente).
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-historia.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  const fim = "2026-11-14T23:59:59-03:00", de = "2026-11-01T00:00:00-03:00";
  const av = { avisos: [], eventos: [{ id: "e1", mult: 2, de, ate: fim }], promos: [{ id: "p1", alvo: "skin", desc: 30, de, ate: fim }], presentes: [], brindes: [{ id: "b1", moedas: 100, de, ate: fim }], voltas: [], vidas: [{ id: "x1", extra: 1, de, ate: fim }] };
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(av) }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { G.perfil = "Andre"; G.banco.Andre = 300; salvar(); ir("lobby"); }); await pg.waitForTimeout(1500);
  await pg.evaluate(() => abrirPraca());
  const espera = async (cond) => pg.waitForFunction(cond, null, { timeout: 30000 });
  const n = [];
  for (let k = 0; k < 4; k++) {
    await espera(() => PRACA.hist && PRACA.hist.fase === "chega" && PRACA.hist.t > 1.6); if (k === 0) { await pg.screenshot({ path: S + '/hh-chega.png' }); }
    await espera(() => PRACA.hist && PRACA.hist.fase === "fala" && PRACA.hist.fala === 1); await pg.waitForTimeout(1800);
    const id = await pg.evaluate(() => PRACA.hist.h.id); n.push(id); await pg.screenshot({ path: S + `/hh-${k}.png` });
    await pg.click('#pr-pulahist');
  }
  console.log(JSON.stringify({ n, errs })); await b.close(); })();
