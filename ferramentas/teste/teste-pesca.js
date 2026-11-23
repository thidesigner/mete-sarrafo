// Pescaria nova: barra de força (lançamento perfeito), chacoalhar, barrinha de puxar, escapar, mar e noite, peixes especiais,
// mochila e Loja de pesca (vender, varas, iscas) e o Livro dos peixes com o aquário.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-pesca.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { window.PRACA_HORA_TESTE = 12; G.perfil = "Andre"; G.banco.Andre = 3000; G.peixes = {}; G.mochila = {}; G.historias = { vistas: historiasAgora().map(h => h.id) }; salvar(); ir("lobby"); });
  await pg.click('[data-a="praca"]'); await pg.waitForTimeout(1500); const r = {};
  const espera = f => pg.waitForFunction(f, null, { timeout: 15000 });
  const lancar = async perfeito => { await pg.click('#pr-acao', { force: true }); await espera(() => PRACA.pesca && PRACA.pesca.fase === 'carrega');
    await pg.evaluate(p => { PRACA.pescaSegura = true; if (p) PRACA.pesca.tc = .81; }, perfeito); await pg.waitForTimeout(perfeito ? 30 : 300); await pg.evaluate(() => { PRACA.pescaSegura = false; }); await espera(() => PRACA.pesca && PRACA.pesca.fase === 'espera'); };
  const puxar = async (jogar) => { await pg.evaluate(() => { PRACA.pesca.t = .01; }); await espera(() => PRACA.pesca && PRACA.pesca.fase === 'briga'); let shot = false;
    for (let i = 0; i < 600; i++) { const st = await pg.evaluate(j => { const P = PRACA.pesca; if (!P || P.fase !== "briga") return null; PRACA.pescaSegura = j ? P.peixe > P.bar + P.vara.controle * .5 : false; return P.prog; }, jogar);
      if (st === null) break; if (!shot && st > .5) { shot = true; await pg.screenshot({ path: S + '/pe-briga.png' }); } await pg.waitForTimeout(40); }
    await pg.evaluate(() => { PRACA.pescaSegura = false; }); return pg.evaluate(() => (document.querySelector(".toast") || {}).textContent); };
  // lago: barra de força
  await pg.evaluate(() => { PRACA.eu.x = PESCA_LUGAR.x; PRACA.eu.z = PESCA_LUGAR.z; PRACA.yaw = .5; PRACA.alt = .45; }); await pg.waitForTimeout(400);
  r.botao = await pg.evaluate(() => $("pr-acao").textContent);
  await pg.click('#pr-acao', { force: true }); await espera(() => PRACA.pesca && PRACA.pesca.fase === 'carrega'); await pg.evaluate(() => { PRACA.pescaSegura = true; }); await pg.waitForTimeout(500);
  await pg.screenshot({ path: S + '/pe-forca.png' }); await pg.evaluate(() => { PRACA.pescaSegura = false; }); await espera(() => PRACA.pesca && PRACA.pesca.fase === 'espera');
  // chacoalhar
  const t0 = await pg.evaluate(() => PRACA.pesca.t); await pg.click('#pp-chac'); await pg.click('#pp-chac'); await pg.click('#pp-chac');
  r.chacoalhar = await pg.evaluate(t0 => ({ menos: +(t0 - PRACA.pesca.t).toFixed(1), vezes: PRACA.pesca.chac }), t0); await pg.screenshot({ path: S + '/pe-chacoalhar.png' });
  r.peixe1 = await puxar(true); r.mochila = await pg.evaluate(() => mochilaDe("Andre").length);
  // lançamento perfeito
  await lancar(true); r.perfeito = await pg.evaluate(() => PRACA.pesca.perfeito); r.peixe2 = await puxar(true);
  // escapa se não segurar
  await lancar(false); r.escapou = await puxar(false);
  // mar e noite
  r.mar = await pg.evaluate(() => { const c = {}; for (let i = 0; i < 400; i++) { const p = sortearPeixe("mar", 0); c[p.z] = (c[p.z] || 0) + 1; } return c; });
  r.noite = await pg.evaluate(() => { window.PRACA_HORA_TESTE = 23; let n = 0; for (let i = 0; i < 600; i++) if (sortearPeixe("lago", 0).noite) n++; window.PRACA_HORA_TESTE = 12; let d = 0; for (let i = 0; i < 600; i++) if (sortearPeixe("lago", 0).noite) d++; return { noite: n, dia: d }; });
  r.sorte = await pg.evaluate(() => { const raros = s => { let n = 0; for (let i = 0; i < 2000; i++) if (sortearPeixe("mar", s).r >= 3) n++; return n; }; return { sem: raros(0), com: raros(.5) }; });
  r.especial = await pg.evaluate(() => { let n = 0; for (let i = 0; i < 2000; i++) if (sortearEspecial(1)) n++; return n; });
  await pg.evaluate(() => { PRACA.pesca = null; PRACA.eu.x = PESCA_MAR.x; PRACA.eu.z = PIER_MAR.z1 - 1; PRACA.yaw = 0; PRACA.alt = .3; }); await pg.keyboard.down('w'); await pg.waitForTimeout(1200); await pg.keyboard.up('w');
  r.pierMar = await pg.evaluate(() => ({ z: +PRACA.eu.z.toFixed(1), botao: $("pr-acao").textContent, agua: pracaLivre(-35, -30) }));
  await pg.evaluate(() => { PRACA.yaw = .6; PRACA.alt = .5; }); await lancar(false); r.zona = await pg.evaluate(() => PRACA.pesca.zona); await pg.screenshot({ path: S + '/pe-mar.png' }); r.peixeMar = await puxar(true);
  // Loja de pesca
  await pg.evaluate(() => { PRACA.pesca = null; PRACA.eu.x = LOJA_PESCA.x; PRACA.eu.z = LOJA_PESCA.z + 1.6; PRACA.yaw = Math.PI; PRACA.alt = .3; }); await pg.waitForTimeout(500);
  r.botaoLoja = await pg.evaluate(() => $("pr-acao").textContent); await pg.screenshot({ path: S + '/pe-loja3d.png' });
  await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(400); await pg.screenshot({ path: S + '/pe-vender.png' });
  const m0 = await pg.evaluate(() => G.banco.Andre); await pg.click('[data-a="pescaVenderTudo"]'); await pg.waitForTimeout(300);
  r.vendeu = await pg.evaluate(m => ({ ganhou: G.banco.Andre - m, mochila: mochilaDe("Andre").length }), m0);
  await pg.click('[data-a="pescaAba"][data-k="varas"]'); await pg.waitForTimeout(200); await pg.click('[data-a="pescaVara"][data-k="bambu"]'); await pg.waitForTimeout(200); await pg.screenshot({ path: S + '/pe-varas.png' });
  await pg.click('[data-a="pescaAba"][data-k="iscas"]'); await pg.waitForTimeout(200); await pg.click('[data-a="pescaIsca"][data-k="minhoca"]'); await pg.waitForTimeout(200); await pg.screenshot({ path: S + '/pe-iscas.png' });
  r.inv = await pg.evaluate(() => ({ vara: G.inv.Andre.vara, varas: G.inv.Andre.varas, iscas: G.inv.Andre.iscas, isca: G.inv.Andre.isca }));
  await pg.click('#pr-fechar');
  // isca gasta ao lançar
  await pg.evaluate(() => { PRACA.eu.x = PESCA_LUGAR.x; PRACA.eu.z = PESCA_LUGAR.z; }); await pg.waitForTimeout(400); await lancar(false); r.iscaGasta = await pg.evaluate(() => G.inv.Andre.iscas.minhoca); await puxar(true);
  // Livro dos peixes
  await pg.evaluate(() => { PRACA.pesca = null; PRACA.eu.x = AQUARIO.x; PRACA.eu.z = AQUARIO.z; }); await pg.waitForTimeout(400); await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(800);
  r.livro = await pg.evaluate(() => ({ cards: document.querySelectorAll(".aq-card").length, faltam: document.querySelectorAll(".aq-falta").length }));
  await pg.screenshot({ path: S + '/pe-livro.png' });
  r.erros = errs; console.log(JSON.stringify(r, null, 1)); await b.close(); })();
