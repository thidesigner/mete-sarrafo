// Skins Neon das coleções da semana: só compra com a original e enquanto ela está à venda; desenho com a fantasia e a luz.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-neon-semana.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { G.perfil = "Andre"; G.banco.Andre = 3000; G.lojaAba = "skins"; salvar(); ir("lobby"); });
  const compra = k => pg.evaluate(k => { acoes.comprarSkin({ dataset: { s: k } }); acoes.comprarSkin({ dataset: { s: k } }); return { tem: temSkin("Andre", k), banco: G.banco.Andre }; }, k);
  const r = { neons: await pg.evaluate(() => SKINS.filter(s => s.variante && SETS_SEMANA[s.base]).map(s => s.k)) };
  r.semOriginal = await compra("tubaraoneon");
  r.original = await compra("tubarao");
  r.neon = await compra("tubaraoneon");
  r.dinoFora = await (async () => { await pg.evaluate(() => darSkin("Andre", "trex")); return compra("trexneon"); })();
  await pg.evaluate(() => ir("loja")); await pg.waitForTimeout(400);
  const q = await pg.$('[data-s="tubaraoneon"]'); if (q) await q.scrollIntoViewIfNeeded(); await pg.waitForTimeout(300); await pg.screenshot({ path: S + '/neon-loja.png' });
  await pg.evaluate(() => ir("lobby")); await pg.waitForTimeout(600); await pg.screenshot({ path: S + '/neon-lobby.png' });
  r.erros = errs; console.log(JSON.stringify(r, null, 1)); await b.close(); })();
