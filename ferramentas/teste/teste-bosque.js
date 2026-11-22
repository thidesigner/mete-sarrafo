// Bosque da Praça: passagem a oeste, lago de pescaria, aquário, labirinto com baú, carrinho com corrida de arcos e pet andando junto.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-bosque.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { window.PRACA_HORA_TESTE = 12; G.perfil = "Andre"; G.banco.Andre = 100; G.inv = G.inv || {}; G.inv.Andre = { ...(G.inv.Andre || { vidas: 0 }), pets: ["cachorro"], pet: "cachorro" }; G.historias = { vistas: historiasAgora().map(h => h.id) }; salvar(); ir("lobby"); });
  await pg.click('[data-a="praca"]'); await pg.waitForTimeout(1500); const r = {};
  // passagem: anda para a esquerda até o Bosque
  await pg.evaluate(() => { PRACA.eu.x = -17; PRACA.eu.z = 0; PRACA.yaw = Math.PI / 2; }); await pg.keyboard.down("w"); await pg.waitForTimeout(1500); await pg.keyboard.up('w');
  r.passou = await pg.evaluate(() => Math.round(PRACA.eu.x)); r.livre = await pg.evaluate(() => ({ lago: pracaLivre(LAGO.x, LAGO.z), pier: pracaLivre(PESCA_LUGAR.x, PESCA_LUGAR.z), fora: pracaLivre(-50, 0), parede: pracaLivre(LAB_PAREDES[0].x, LAB_PAREDES[0].z), bau: pracaLivre(LAB_BAU.x, LAB_BAU.z), entrada: pracaLivre(LAB.x0 + 13.9, 9) }));
  await pg.evaluate(() => { PRACA.eu.x = -24; PRACA.eu.z = 1; PRACA.yaw = -Math.PI / 2 - 2.4; PRACA.alt = .75; }); await pg.waitForTimeout(800); await pg.screenshot({ path: S + '/bq-bosque.png' });
  // pet andando junto
  await pg.evaluate(() => { PRACA.eu.x = -22; PRACA.eu.z = 0; PRACA.yaw = Math.PI / 2 + .5; PRACA.alt = .35; }); await pg.keyboard.down("w"); await pg.waitForTimeout(700); await pg.keyboard.up('w'); await pg.waitForTimeout(100);
  r.pet = await pg.evaluate(() => { const p = PRACA.eu.m.pet, w = PRACA.eu.m.petW; return p ? { dist: +Math.hypot(w.x - PRACA.eu.x, w.z - PRACA.eu.z).toFixed(2) } : null; });
  await pg.screenshot({ path: S + '/bq-pet.png' });
  // pescaria
  await pg.evaluate(() => { PRACA.eu.x = PESCA_LUGAR.x; PRACA.eu.z = PESCA_LUGAR.z; PRACA.yaw = .3; PRACA.alt = .5; }); await pg.waitForTimeout(400);
  r.botaoPesca = await pg.evaluate(() => $("pr-acao").textContent);
  await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(300);
  await pg.evaluate(() => { PRACA.pesca.t = .05; }); await pg.waitForTimeout(300);
  r.morde = await pg.evaluate(() => ({ fase: PRACA.pesca.fase, botao: $("pr-acao").textContent }));
  await pg.screenshot({ path: S + '/bq-pesca.png' });
  const m0 = await pg.evaluate(() => G.banco.Andre);
  await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(400);
  r.pescou = await pg.evaluate(m => ({ peixes: G.peixes.Andre, ganhou: G.banco.Andre - m, hoje: G.pesca.por.Andre, toast: (document.querySelector(".toast") || {}).textContent }), m0);
  await pg.screenshot({ path: S + '/bq-peixe.png' });
  // aquário
  await pg.evaluate(() => { PRACA.pesca = null; PRACA.eu.x = AQUARIO.x; PRACA.eu.z = AQUARIO.z; }); await pg.waitForTimeout(400); await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(300);
  r.aquario = await pg.evaluate(() => $("pr-painel").textContent.slice(0, 80)); await pg.screenshot({ path: S + '/bq-aquario.png' }); await pg.click('#pr-fechar');
  // labirinto: entra pela entrada e vai até o baú
  await pg.evaluate(() => { PRACA.eu.x = LAB.x0 + 14.5; PRACA.eu.z = 9; }); await pg.waitForTimeout(200);
  await pg.evaluate(() => { PRACA.eu.x = LAB.x0 + 13; PRACA.eu.z = 9; PRACA.yaw = -Math.PI / 2; PRACA.alt = .6; }); await pg.waitForTimeout(900);
  r.labHud = await pg.evaluate(() => $("pr-lab").hidden ? null : $("pr-lab").textContent);
  await pg.screenshot({ path: S + '/bq-lab.png' });
  const m1 = await pg.evaluate(() => G.banco.Andre);
  await pg.evaluate(() => { PRACA.eu.x = LAB_BAU.x; PRACA.eu.z = LAB_BAU.z + .6; PRACA.yaw = 0; }); await pg.waitForTimeout(400);
  r.botaoBau = await pg.evaluate(() => $("pr-acao").textContent); await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(600);
  r.bau = await pg.evaluate(m => ({ ganhou: G.banco.Andre - m, rec: G.labRec }), m1); await pg.screenshot({ path: S + '/bq-bau.png' });
  await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(200); r.bau2 = await pg.evaluate(m => G.banco.Andre - m, m1);
  // carrinho: entra, dirige e faz uma volta pelos arcos
  await pg.evaluate(() => { PRACA.eu.x = KART_LUGAR.x; PRACA.eu.z = KART_LUGAR.z; }); await pg.waitForTimeout(400);
  r.botaoKart = await pg.evaluate(() => $("pr-acao").textContent); await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(300);
  await pg.keyboard.down("w"); await pg.waitForTimeout(1200); await pg.keyboard.up("w");
  r.dirigiu = await pg.evaluate(() => ({ x: +PRACA.eu.x.toFixed(1), v: +PRACA.kart.v.toFixed(1), bit: efeitosPraca() & 8 }));
  await pg.screenshot({ path: S + '/bq-kart.png' });
  const m2 = await pg.evaluate(() => G.banco.Andre);
  for (const i of [0, 1, 2, 3, 4, 5, 0]) { await pg.evaluate(i => { const a = KART_ARCOS[i]; PRACA.eu.x = a.x; PRACA.eu.z = a.z; }, i); await pg.waitForTimeout(250); }
  r.volta = await pg.evaluate(m => ({ rec: G.kartRec, ganhou: G.banco.Andre - m, hud: $("pr-kart").textContent }), m2);
  await pg.evaluate(() => { const a = KART_ARCOS[1]; PRACA.eu.x = a.x + 3; PRACA.eu.z = a.z + 1; PRACA.eu.r = PRACA.yaw = 2.2; }); await pg.waitForTimeout(600); await pg.screenshot({ path: S + '/bq-arco.png' });
  await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(300); r.saiu = await pg.evaluate(() => ({ kart: PRACA.kart, modelo: !!PRACA.eu.m.kartM }));
  r.erros = errs; console.log(JSON.stringify(r, null, 1)); await b.close(); })();
