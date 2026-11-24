// Ilhas grandes e Pescaria 3: vila em cada ilha (casas que não deixam passar, morro para subir, morador com pedido, vendinha, baú escondido),
// Ilha do Porto com Loja, Avaliador e Vovô (história em capítulos), mutações, varas especiais e peixe chefe.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-ilhas.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { window.PRACA_HORA_TESTE = 12; window.PESCA_CLIMA_TESTE = "sol"; G.perfil = "Andre"; G.banco.Andre = 500; G.pescaXp = { Andre: xpPara(9) }; G.historias = { vistas: historiasAgora().map(h => h.id) }; salvar(); ir("lobby"); });
  await pg.click('[data-a="praca"]'); await pg.waitForTimeout(1500); const r = {};
  const botao = () => pg.evaluate(() => $("pr-acao").hidden ? null : $("pr-acao").textContent);
  const clicar = async () => { await pg.waitForSelector('#pr-acao:not([hidden])', { timeout: 5000 }); await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(400); };
  const ir = (x, z, yaw, alt) => pg.evaluate(([x, z, yaw, alt]) => { const e = PRACA.eu; e.x = x; e.z = z; e.y = .2 + alturaIlha(x, z); PRACA.yaw = yaw; if (alt != null) PRACA.alt = alt; }, [x, z, yaw, alt]);
  // fotos de cada ilha (chegando pelo cais)
  for (const k of ["porto", "recife", "pantano", "gelo", "vulcao", "caverna"]) {
    await pg.evaluate(k => { const c = chegadaIlha(k); const e = PRACA.eu; e.x = c.x; e.z = c.z + 1; e.y = .2; PRACA.yaw = 0; PRACA.alt = .5; }, k); await pg.waitForTimeout(900);
    await pg.screenshot({ path: `${S}/il-${k}.png` }); }
  // casa não deixa passar, morro deixa subir
  r.casa = await pg.evaluate(() => { const i = ILHAS.porto, h = ILHA_CFG.porto.casas[0]; return { dentro: pracaLivre(i.x + h[0], i.z + h[1]), fora: pracaLivre(i.x + h[0] + 3, i.z + h[1]) }; });
  r.morro = await pg.evaluate(() => { const i = ILHAS.porto, m = ILHA_CFG.porto.morro; return +alturaChaoPraca(i.x + m.dx, i.z + m.dz, 3).toFixed(2); });
  r.gruta = await pg.evaluate(() => { const i = ILHAS.caverna, g = ILHA_CFG.caverna.gruta; return { sala: pracaLivre(i.x + g.dx, i.z + g.dz), tunel: pracaLivre(i.x + g.dx + 3.5, i.z + g.dz), parede: pracaLivre(i.x + g.dx, i.z + g.dz + 3.5) }; });
  // Loja do Porto, Avaliador e Vovô
  await pg.evaluate(() => { const i = ILHAS.porto; const e = PRACA.eu; e.x = i.x + LOJA_PORTO.dx; e.z = i.z + LOJA_PORTO.dz + 1.8; e.y = .2; PRACA.yaw = 2.6; PRACA.alt = .45; }); await pg.waitForTimeout(500);
  r.botaoLoja = await botao(); await pg.screenshot({ path: S + '/il-porto-loja.png' });
  await pg.evaluate(() => { PRACA.eu.x = VOVO.x + 1; PRACA.eu.z = VOVO.z + 1; }); await pg.waitForTimeout(400); r.botaoVovo = await botao(); await clicar(); await pg.waitForTimeout(300);
  r.vovoPainel = await pg.evaluate(() => !!document.querySelector('.pp-hist')); await pg.screenshot({ path: S + '/il-vovo.png' });
  await pg.evaluate(() => fecharPainelPraca());
  // história do Vovô: 5 peixes e receber o prêmio
  r.vovo = await pg.evaluate(() => { const px = PEIXES.find(p => p.k === "tainha"); for (let i = 0; i < 5; i++) progressoVovo("Andre", "peixe", { px, zona: "porto" }); const pr = histVovo("Andre").pronta; const m0 = G.banco.Andre; acoes.vovoPremio(); return { pronta: pr, capitulo: histVovo("Andre").e, ganhou: G.banco.Andre - m0 }; });
  // morador da ilha e vendinha
  await pg.evaluate(() => { const p = posIlha("gelo", ILHA_CFG.gelo.npc); const e = PRACA.eu; e.x = p.x + .6; e.z = p.z + .6; e.y = .2; PRACA.yaw = 3; }); await pg.waitForTimeout(500);
  r.botaoNpc = await botao(); await clicar(); await pg.waitForTimeout(300); await pg.screenshot({ path: S + '/il-npc.png' }); await pg.evaluate(() => fecharPainelPraca());
  r.npc = await pg.evaluate(() => { const pd = pedidoIlha("gelo"); mochilaDe("Andre").push({ k: pd.p.k, tam: 40, esp: null, v: 10 }); const m0 = G.banco.Andre; acoes.npcEntregar({ dataset: { k: "gelo" } }); return { peixe: pd.p.k, ganhou: G.banco.Andre - m0 }; });
  // baú escondido (1 por dia)
  r.bau = await pg.evaluate(() => { const m0 = G.banco.Andre; abrirBauIlha("recife"); const g1 = G.banco.Andre - m0; abrirBauIlha("recife"); return { primeiro: g1 > 0, segundo: G.banco.Andre - m0 === g1 }; });
  // mutações: congelado só no gelo
  r.mut = await pg.evaluate(() => { PRACA.pesca = { zona: "gelo", vara: {} }; let gelo = 0, fogo = 0; for (let i = 0; i < 4000; i++) { const e = sortearEspecial(1); if (e && e.k === "congelado") gelo++; if (e && e.k === "queimado") fogo++; } PRACA.pesca = null; return { congelado: gelo, queimadoNoGelo: fogo }; });
  // varas especiais não se compram
  r.vara = await pg.evaluate(() => { const inv = invPesca("Andre"); acoes.pescaVara({ dataset: { k: "cristal" } }); return inv.varas.includes("cristal"); });
  // peixe chefe: fisgar, pegar e ganhar a vara
  await pg.evaluate(() => { window.PESCA_CHEFE_TESTE = "serpentecristal"; const p = pontoIlha("caverna"); const e = PRACA.eu; e.x = p.x; e.z = p.z; e.y = .2; PRACA.yaw = .5; PRACA.alt = .4; }); await pg.waitForTimeout(800);
  await pg.screenshot({ path: S + '/il-chefe-sombra.png' });
  r.chefeAviso = await pg.evaluate(() => $("pr-chefe").textContent);
  r.chefe = await pg.evaluate(() => { comecarPesca(); const P = PRACA.pesca; P.vara = varaDe("Andre"); P.alvo = new THREE.Vector3(PRACA.eu.x, .06, PRACA.eu.z - 3); P.isca = { sorte: 5 }; morderPeixe(P); return { px: P.px.k, chefe: !!P.chefe }; });
  await pg.waitForTimeout(500); await pg.screenshot({ path: S + '/il-chefe-briga.png' });
  r.chefePego = await pg.evaluate(() => { const m0 = G.banco.Andre; pegarPeixe(PRACA.pesca); return { vara: invPesca("Andre").varas.includes("cristal"), moedas: G.banco.Andre > m0 }; });
  await pg.waitForTimeout(600); await pg.screenshot({ path: S + '/il-chefe-pegou.png' });
  // livro dos peixes e loja de varas
  await pg.evaluate(() => { PRACA.pescaAba = "varas"; abrirPainelPraca("🏪 Loja", lojaPescaHTML); }); await pg.waitForTimeout(300); await pg.screenshot({ path: S + '/il-varas.png' });
  // bússola do barco com as 6 ilhas
  await pg.evaluate(() => { fecharPainelPraca(); pararPesca(); PRACA.eu.x = CAIS_PIER.x; PRACA.eu.z = CAIS_PIER.z; }); await pg.waitForTimeout(300);
  await pg.evaluate(() => entrarBarco({ x: BARCO_PIER.x, z: BARCO_PIER.z, r: 0 })); await pg.evaluate(() => { PRACA.eu.x = -40; PRACA.eu.z = -40; PRACA.eu.r = .8; PRACA.yaw = .8; }); await pg.waitForTimeout(800);
  r.bussola = await pg.evaluate(() => $("pr-bussola").querySelectorAll("span").length); await pg.screenshot({ path: S + '/il-barco.png' });
  r.aguaIlhas = await pg.evaluate(() => Object.entries(ILHAS).map(([k, i]) => naAgua(i.x, i.z + i.r + 2.2)).every(Boolean));
  r.errs = errs; console.log(JSON.stringify(r, null, 1)); await b.close(); })();
