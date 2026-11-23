// Pescaria de verdade e aquário novo: vara na mão, lançar, beliscadas, fisgar, briga (tensão e distância), linha arrebentando, tamanho/recorde, tanque 3D e painel do aquário.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-pesca.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { window.PRACA_HORA_TESTE = 12; G.perfil = "Andre"; G.banco.Andre = 100; G.peixes = {}; G.historias = { vistas: historiasAgora().map(h => h.id) }; salvar(); ir("lobby"); });
  await pg.click('[data-a="praca"]'); await pg.waitForTimeout(1500); const r = {};
  const aoPier = () => pg.evaluate(() => { PRACA.eu.x = PESCA_LUGAR.x; PRACA.eu.z = PESCA_LUGAR.z; PRACA.yaw = .5; PRACA.alt = .45; });
  const lancar = async () => { await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(900); };
  await aoPier(); await pg.waitForTimeout(400); r.botao = await pg.evaluate(() => $("pr-acao").textContent);
  await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(250); r.lanca = await pg.evaluate(() => ({ fase: PRACA.pesca.fase, vara: !!(PRACA.eu.m.vara && PRACA.eu.m.vara.visible), acaoEscondida: $("pr-acao").hidden }));
  await pg.screenshot({ path: S + '/pe-lanca.png' }); await pg.waitForTimeout(700);
  r.espera = await pg.evaluate(() => PRACA.pesca.fase); await pg.screenshot({ path: S + '/pe-espera.png' });
  // puxar cedo = foge
  await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(200); r.cedo = await pg.evaluate(() => ({ fase: PRACA.pesca.fase, toast: (document.querySelector(".toast") || {}).textContent }));
  // fisgar e brigar com cuidado (solta quando a tensão sobe)
  const clicar = async () => { await pg.waitForSelector('#pr-acao:not([hidden])', { timeout: 8000 }).catch(async () => console.log('ESTADO', await pg.evaluate(() => ({ fase: PRACA.pesca && PRACA.pesca.fase, hist: !!PRACA.hist, painel: PRACA.painel, txt: $('pr-acao').textContent, x: PRACA.eu.x, z: PRACA.eu.z })))); await pg.click('#pr-acao', { force: true }); };
  const brigar = async (cuidado, forcar) => { await clicar(); await pg.waitForFunction(() => PRACA.pesca && PRACA.pesca.fase === 'espera'); await pg.evaluate(() => { PRACA.pesca.t = .05; PRACA.pesca.belisca = []; }); await pg.waitForFunction(() => PRACA.pesca && PRACA.pesca.fase === 'morde');
    if (forcar) await pg.evaluate(k => { window._sort = sortearPeixe; sortearPeixe = () => PEIXES.find(p => p.k === k); }, forcar);
    await clicar(); await pg.waitForTimeout(100); if (forcar) await pg.evaluate(() => { sortearPeixe = window._sort; });
    const fase0 = await pg.evaluate(() => PRACA.pesca.fase); let shot = false;
    for (let i = 0; i < 400; i++) { const st = await pg.evaluate(c => { const P = PRACA.pesca; if (!P || P.fase !== "briga") return null; PRACA.pescaSegura = c ? P.tensao < 60 : true; return { d: P.dist, t: P.tensao }; }, cuidado);
      if (!st) break; if (!shot && st.d < 75) { shot = true; await pg.screenshot({ path: S + (cuidado ? '/pe-briga.png' : '/pe-forca.png') }); } await pg.waitForTimeout(60); }
    await pg.evaluate(() => { PRACA.pescaSegura = false; }); return { fase0, toast: await pg.evaluate(() => (document.querySelector(".toast") || {}).textContent) }; };
  r.briga = await brigar(true, "palhaco"); r.peixes = await pg.evaluate(() => G.peixes.Andre);
  await pg.waitForTimeout(500); r.arrebenta = await brigar(false, "tubarao");
  r.briga2 = await brigar(true, "polvo");
  // aquário 3D e painel
  await pg.evaluate(() => { PRACA.pesca = null; PRACA.eu.x = TANQUE.x + 3.2; PRACA.eu.z = TANQUE.z; PRACA.yaw = Math.PI / 2; PRACA.alt = .25; }); await pg.waitForTimeout(800);
  r.tanque = await pg.evaluate(() => PRACA.bosque.tanquePeixes.children.length); await pg.screenshot({ path: S + '/pe-tanque.png' });
  await pg.evaluate(() => { PRACA.eu.x = AQUARIO.x; PRACA.eu.z = AQUARIO.z; }); await pg.waitForTimeout(400); await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(800);
  r.painel = await pg.evaluate(() => ({ cards: document.querySelectorAll(".aq-card").length, faltam: document.querySelectorAll(".aq-falta").length, canvas: !!$("aq-cv") }));
  await pg.screenshot({ path: S + '/pe-aquario.png' });
  r.erros = errs; console.log(JSON.stringify(r, null, 1)); await b.close(); })();
