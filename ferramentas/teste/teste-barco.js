// Barco de verdade: pegar no píer do mar, navegar (só na água), bússola, sinais das ilhas, descer na ilha (nível), pegar o barco na ilha, pescar do barco e voltar ao píer.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-barco.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { window.PRACA_HORA_TESTE = 12; window.PESCA_CLIMA_TESTE = "sol"; G.perfil = "Andre"; G.banco.Andre = 500; G.pescaXp = {}; G.historias = { vistas: historiasAgora().map(h => h.id) }; salvar(); ir("lobby"); });
  await pg.click('[data-a="praca"]'); await pg.waitForTimeout(1500); const r = {};
  const botao = () => pg.evaluate(() => $("pr-acao").hidden ? null : $("pr-acao").textContent);
  const clicar = async () => { await pg.waitForSelector('#pr-acao:not([hidden])', { timeout: 5000 }); await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(400); };
  await pg.evaluate(() => { PRACA.eu.x = CAIS_PIER.x; PRACA.eu.z = CAIS_PIER.z; PRACA.yaw = .6; PRACA.alt = .45; }); await pg.waitForTimeout(500);
  r.botaoPier = await botao(); await pg.screenshot({ path: S + '/bc-pier.png' }); await clicar();
  r.noBarco = await pg.evaluate(() => ({ barco: !!PRACA.barco, bussola: !$("pr-bussola").hidden, bit: efeitosPraca() & 16 }));
  await pg.keyboard.down('w'); await pg.waitForTimeout(2500); await pg.keyboard.up('w');
  r.andou = await pg.evaluate(() => ({ x: Math.round(PRACA.eu.x), z: Math.round(PRACA.eu.z), agua: naAgua(PRACA.eu.x, PRACA.eu.z), v: +PRACA.barco.v.toFixed(1) }));
  await pg.screenshot({ path: S + '/bc-navegando.png' });
  // perto do Recife (nível 1: trancada)
  await pg.evaluate(() => { const i = ILHAS.recife; PRACA.eu.x = i.x + 1; PRACA.eu.z = i.z + i.r + 3; PRACA.eu.r = 0; PRACA.yaw = 0; PRACA.barco.v = 0; }); await pg.waitForTimeout(700);
  r.botaoIlha = await botao(); await pg.screenshot({ path: S + '/bc-chegando.png' }); await clicar(); r.trancada = await pg.evaluate(() => ({ barco: !!PRACA.barco, toast: (document.querySelector(".toast") || {}).textContent }));
  await pg.evaluate(() => { G.pescaXp.Andre = xpPara(2); }); await clicar();
  r.desceu = await pg.evaluate(() => ({ barco: !!PRACA.barco, naIlha: naIlha(PRACA.eu.x, PRACA.eu.z) }));
  await pg.evaluate(() => { PRACA.yaw = 2.5; PRACA.alt = .45; }); await pg.waitForTimeout(500); await pg.screenshot({ path: S + '/bc-ilha.png' });
  // pegar o barco no cais da ilha
  await pg.evaluate(() => { const c = chegadaIlha("recife"); PRACA.eu.x = c.x; PRACA.eu.z = c.z; }); await pg.waitForTimeout(400); r.botaoCais = await botao(); await clicar();
  r.saiuIlha = await pg.evaluate(() => ({ barco: !!PRACA.barco, agua: naAgua(PRACA.eu.x, PRACA.eu.z) }));
  // pescar do barco perto da ilha
  await pg.evaluate(() => { PRACA.eu.z = ILHAS.recife.z + ILHAS.recife.r + 9; PRACA.barco.v = 0; }); await pg.waitForTimeout(400); r.botaoPescar = await botao(); await clicar(); r.zonaBarco = await pg.evaluate(() => PRACA.pesca && PRACA.pesca.zona);
  await pg.evaluate(() => { PRACA.pescaSegura = true; }); await pg.waitForTimeout(300); await pg.evaluate(() => { PRACA.pescaSegura = false; }); await pg.waitForFunction(() => PRACA.pesca && PRACA.pesca.fase === 'espera');
  await pg.evaluate(() => { PRACA.pesca.t = .01; }); await pg.waitForFunction(() => PRACA.pesca && PRACA.pesca.fase === 'briga'); await pg.evaluate(() => { PRACA.pesca.prog = .995; PRACA.pesca.peixe = PRACA.pesca.bar + .05; });
  await pg.waitForFunction(() => PRACA.pesca && PRACA.pesca.fase === 'fim'); r.pegouNoBarco = await pg.evaluate(() => ({ txt: $("pp-pegou").textContent, barco: !!PRACA.barco })); await pg.screenshot({ path: S + '/bc-pesca.png' });
  r.botaoDeNovo = await botao(); await pg.evaluate(() => { PRACA.pesca = null; mostrarHudPesca(); });
  // voltar ao píer
  await pg.evaluate(() => { PRACA.eu.x = BARCO_PIER.x - 1; PRACA.eu.z = BARCO_PIER.z - 2; }); await pg.waitForTimeout(400); r.botaoVolta = await botao(); await clicar();
  r.voltou = await pg.evaluate(() => ({ barco: !!PRACA.barco, x: PRACA.eu.x, z: PRACA.eu.z, livre: pracaLivre(PRACA.eu.x, PRACA.eu.z) }));
  r.erros = errs; console.log(JSON.stringify(r, null, 1)); await b.close(); })();
