// Nadar, mergulhar e a Ilha da Montanha: sair do píer para o mar, mergulhar até o fundo, ar acabando, pérolas, baú do navio afundado,
// subir a montanha andando (altitude e prêmio no topo) e o bit 32 (nadando) na rede.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-mergulho.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { window.PRACA_HORA_TESTE = 12; window.PESCA_CLIMA_TESTE = "sol"; G.perfil = "Andre"; G.banco.Andre = 0; G.pescaXp = { Andre: xpPara(9) }; G.historias = { vistas: historiasAgora().map(h => h.id) }; salvar(); ir("lobby"); });
  await pg.click('[data-a="praca"]'); await pg.waitForTimeout(1500); const r = {};
  // do píer do mar para a água (andando para o lado)
  await pg.evaluate(() => { const e = PRACA.eu; e.x = PIER_MAR.x; e.z = -22; e.y = .1; PRACA.yaw = -Math.PI / 2; PRACA.alt = .4; }); await pg.waitForTimeout(300);
  await pg.keyboard.down('w'); await pg.waitForTimeout(900); await pg.keyboard.up('w'); await pg.waitForTimeout(500);
  r.entrou = await pg.evaluate(() => ({ nado: !!PRACA.nado, x: +PRACA.eu.x.toFixed(1), y: +PRACA.eu.y.toFixed(2), bit: efeitosPraca() & 32, hud: !$("pr-nado").hidden, botao: $("pr-acao").hidden }));
  await pg.screenshot({ path: S + '/mg-nadando.png' });
  // mergulhar
  await pg.evaluate(() => { const e = PRACA.eu; e.x = -36; e.z = -36; }); await pg.waitForTimeout(300);
  await pg.evaluate(() => { PRACA.nadoDesce = true; }); await pg.waitForTimeout(2500); await pg.evaluate(() => { PRACA.nadoDesce = false; }); await pg.waitForTimeout(300);
  r.fundo = await pg.evaluate(() => ({ y: +PRACA.eu.y.toFixed(1), fundo: +fundoEm(PRACA.eu.x, PRACA.eu.z).toFixed(1), ar: +PRACA.nado.ar.toFixed(1), embaixo: $("praca").classList.contains("pr-embaixo") }));
  await pg.screenshot({ path: S + '/mg-fundo.png' });
  // o ar acaba e sobe sozinho
  await pg.evaluate(() => { PRACA.nado.ar = .3; }); await pg.waitForTimeout(2500); r.semAr = await pg.evaluate(() => ({ prof: +PRACA.nado.prof.toFixed(1), toast: (document.querySelector(".toast") || {}).textContent }));
  // pérola
  r.perola = await pg.evaluate(() => { const p = perolasDoDia()[0]; const e = PRACA.eu; e.x = p.x; e.z = p.z; PRACA.nado.prof = Math.max(0, -p.y - 1); return { m0: G.banco.Andre }; }); await pg.waitForTimeout(2000);
  r.perola.pegas = await pg.evaluate(() => perolasPegas("Andre").length); r.perola.moedas = await pg.evaluate(() => G.banco.Andre);
  await pg.screenshot({ path: S + '/mg-perola.png' });
  // navio afundado
  await pg.evaluate(() => { const e = PRACA.eu; e.x = NAVIO.x + 1.5; e.z = NAVIO.z + 1.5; PRACA.nado.prof = Math.max(0, -fundoEm(e.x, e.z) - 1.5); PRACA.yaw = 2.3; }); await pg.waitForTimeout(800);
  r.navio = await pg.evaluate(() => ({ bau: (G.navioBau || {}).l, moedas: G.banco.Andre })); await pg.screenshot({ path: S + '/mg-navio.png' });
  // sair da água numa ilha
  await pg.evaluate(() => { const i = ILHAS.porto, e = PRACA.eu; PRACA.nado.prof = 0; e.x = i.x; e.z = i.z + i.r + .6; PRACA.yaw = 0; }); await pg.waitForTimeout(300);
  await pg.keyboard.down('w'); await pg.waitForTimeout(800); await pg.keyboard.up('w'); await pg.waitForTimeout(400);
  r.saiu = await pg.evaluate(() => ({ nado: !!PRACA.nado, y: +PRACA.eu.y.toFixed(2), naIlha: naIlha(PRACA.eu.x, PRACA.eu.z) }));
  // montanha: andar até o topo
  await pg.evaluate(() => { const i = ILHAS.montanha, e = PRACA.eu; e.x = i.x; e.z = i.z + 11; e.y = .2; PRACA.yaw = 0; PRACA.alt = .35; }); await pg.waitForTimeout(400);
  await pg.screenshot({ path: S + '/mg-montanha-pe.png' });
  await pg.keyboard.down('w'); await pg.waitForTimeout(1300); await pg.keyboard.up('w'); await pg.waitForTimeout(200);
  r.subindo = await pg.evaluate(() => ({ y: +PRACA.eu.y.toFixed(1), hud: $("pr-altura").textContent })); await pg.screenshot({ path: S + '/mg-subindo.png' });
  for (let i = 0; i < 8 && !(await pg.evaluate(() => topoHoje("Andre"))); i++) { await pg.evaluate(() => { const i = ILHAS.montanha, m = ILHA_CFG.montanha.morro, e = PRACA.eu; PRACA.yaw = Math.atan2(e.x - (i.x + m.dx), e.z - (i.z + m.dz)); }); await pg.keyboard.down('w'); await pg.waitForTimeout(500); await pg.keyboard.up('w'); }
  await pg.waitForTimeout(400);
  r.topo = await pg.evaluate(() => ({ y: +PRACA.eu.y.toFixed(1), premio: (G.topo || {}).por, moedas: G.banco.Andre })); await pg.screenshot({ path: S + '/mg-topo.png' });
  r.errs = errs; console.log(JSON.stringify(r, null, 1)); await b.close(); })();
