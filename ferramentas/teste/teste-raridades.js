// Raridades novas da pescaria: Mítico (5) e Cósmico (6). Confere sorteio, XP, desenho dos peixes novos e a janela "Pegou!".
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-raridades.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { window.PRACA_HORA_TESTE = 23; window.PESCA_CLIMA_TESTE = "sol"; G.perfil = "Andre"; G.historias = { vistas: historiasAgora().map(h => h.id) }; salvar(); ir("lobby"); });
  await pg.click('[data-a="praca"]'); await pg.waitForTimeout(1500); const r = {};
  r.raridades = await pg.evaluate(() => RARIDADES.map(x => x[0]));
  r.sorteio = await pg.evaluate(() => { const c = {}; for (let i = 0; i < 40000; i++) { const p = sortearPeixe("mar", .5); c[p.r] = (c[p.r] || 0) + 1; } return c; });
  r.xp = await pg.evaluate(() => [5, 6].map(n => xpDoPeixe({ r: n })));
  r.cadaLugarTemMitico = await pg.evaluate(() => ["lago", "mar", "porto", "recife", "pantano", "gelo", "vulcao", "caverna"].every(z => PEIXES.some(p => p.z === z && p.r === 5)));
  await pg.evaluate(() => { G.peixes = G.peixes || {}; const aq = G.peixes.Andre = G.peixes.Andre || {}; PEIXES.filter(p => p.r >= 5).forEach(p => (aq[p.k] = 1)); abrirPainelPraca("📖 Livro", aquarioHTML); });
  await pg.waitForTimeout(400); await pg.evaluate(() => { const g = document.querySelectorAll('.aq-card'); g[g.length - 1].scrollIntoView(); }); await pg.waitForTimeout(200); await pg.screenshot({ path: S + '/rr-livro.png' });
  await pg.evaluate(() => fecharPainelPraca());
  await pg.evaluate(() => mostrarPegou(PEIXES.find(p => p.k === "galaxia"), 90, null, "teste")); await pg.waitForTimeout(500); await pg.screenshot({ path: S + '/rr-cosmico.png' });
  r.classe = await pg.evaluate(() => $("pp-pegou").className);
  r.errs = errs; console.log(JSON.stringify(r, null, 1)); await b.close(); })();
