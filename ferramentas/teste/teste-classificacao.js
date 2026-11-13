// Classificação da Praça: não zera, partidas normais contam vitórias, tempo e moedas gastas contam em qualquer lugar, aba de bosses.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-classificacao.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  // tabela antiga de uma semana passada continua valendo
  await pg.evaluate(() => { G.perfil = "Andre"; G.nomes = ["Andre"]; G.modo = "cima"; G.evRank = { sem: "2026-11-02", j: { Leo: { g: 30, t: 300, v: 2, b: 1 } } }; salvar(); ir("lobby"); });
  await pg.click('[data-a="jogar"]'); await pg.click('#as-start'); await pg.waitForTimeout(500);
  await pg.evaluate(() => { fecharOv(); A.t = 95; terminarA(A.P.find(p => p.humano)); }); await pg.waitForTimeout(800);
  const r1 = await pg.evaluate(() => JSON.parse(JSON.stringify(G.evRank)));
  // compra na loja (fora de partida) conta em "Mais gastou"; ficar com o jogo aberto conta tempo
  await pg.evaluate(() => { fecharOv(); fecharArena(); }).catch(() => {}); await pg.waitForTimeout(300);
  await pg.evaluate(() => { G.banco.Andre = 500; salvar(); G.banco.Andre -= 150; salvar(); });
  await pg.waitForTimeout(10600);
  const r2 = await pg.evaluate(() => G.evRank.j.Andre);
  await pg.evaluate(() => { fecharOv(); fecharArena(); }).catch(() => {}); await pg.waitForTimeout(300);
  await pg.evaluate(() => { G.historias = { vistas: historiasAgora().map(h => h.id) }; ir("lobby"); abrirPraca(); }); await pg.waitForTimeout(1200);
  const abas = {};
  for (const k of ["v", "t", "b"]) { await pg.evaluate(k => { PRACA.rankAba = k; abrirPainelPraca("🏆 Classificação", () => rankingHTML()); }, k); await pg.waitForTimeout(200); abas[k] = await pg.$$eval('#pr-painel .ev-rank li', l => l.map(x => x.textContent.trim().replace(/\s+/g, ' '))); }
  await pg.screenshot({ path: S + '/rank-b.png' });
  console.log(JSON.stringify({ r1, r2, abas, errs })); await b.close(); })();
