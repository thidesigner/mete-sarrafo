// Pescaria 2: nível de pescador, barco e ilhas, avaliador, encantar a vara, clima e eventos, pedidos do Vovô, gaiolas e mapa do tesouro.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-pesca2.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const PESCA_MAR = { x: -27, z: -24.3 }, PIER_MAR = { z1: -16.5 }, LOJA_PESCA = { x: -31.5, z: -14.6 }, VOVO = { x: -39, z: -1.4 }, PESCA_LUGAR = { x: -36, z: -6.3 };
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { window.PRACA_HORA_TESTE = 12; window.PESCA_CLIMA_TESTE = "sol"; G.perfil = "Andre"; G.banco.Andre = 9000; G.peixes = {}; G.mochila = {}; G.pescaXp = {}; G.historias = { vistas: historiasAgora().map(h => h.id) }; salvar(); ir("lobby"); });
  await pg.click('[data-a="praca"]'); await pg.waitForTimeout(1500); const r = {};
  const ir = (x, z, yaw = 0, alt = .4) => pg.evaluate(([x, z, yaw, alt]) => { PRACA.pesca = null; Object.assign(PRACA.eu, { x, z, y: 0 }); PRACA.yaw = yaw; PRACA.alt = alt; }, [x, z, yaw, alt]);
  const botao = () => pg.evaluate(() => $("pr-acao").hidden ? null : $("pr-acao").textContent);
  const clicar = async () => { await pg.waitForSelector('#pr-acao:not([hidden])', { timeout: 5000 }); await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(350); };
  // nível
  r.nivel = await pg.evaluate(() => { const a = nivelPesca("Andre"); G.pescaXp.Andre = xpPara(3); const b = nivelPesca("Andre"); return { a, b, titulo: tituloPesca(b), xp6: xpPara(6), xp12: xpPara(12) }; });
  // barco: ilha travada no nível 3? (Recife nível 2 libera, Gelo 4 não)
  await ir(PESCA_MAR.x, PIER_MAR.z1 - 1.5); await pg.waitForTimeout(300); r.botaoBarco = await botao(); await clicar(); await pg.screenshot({ path: S + '/p2-barco.png' });
  r.travas = await pg.evaluate(() => [...document.querySelectorAll('[data-a="pescaViajar"]')].map(b => b.dataset.k + ":" + b.textContent));
  await pg.click('[data-a="pescaViajar"][data-k="recife"]'); await pg.waitForTimeout(1500);
  r.recife = await pg.evaluate(() => ({ x: Math.round(PRACA.eu.x), z: Math.round(PRACA.eu.z), livre: pracaLivre(PRACA.eu.x, PRACA.eu.z) }));
  await pg.evaluate(() => { PRACA.yaw = 2.6; PRACA.alt = .5; }); await pg.waitForTimeout(500); await pg.screenshot({ path: S + '/p2-recife.png' });
  // pescar na ilha
  await pg.evaluate(() => { const p = pontoIlha("recife"); PRACA.eu.x = p.x; PRACA.eu.z = p.z; PRACA.yaw = .4; }); await pg.waitForTimeout(400); r.botaoIlha = await botao(); await clicar();
  r.zonaIlha = await pg.evaluate(() => PRACA.pesca && PRACA.pesca.zona);
  r.peixesIlha = await pg.evaluate(() => { const c = {}; for (let i = 0; i < 300; i++) { const p = sortearPeixe("vulcao", 0); c[p.k] = (c[p.k] || 0) + 1; } return Object.keys(c); });
  await pg.evaluate(() => pararPesca());
  // Vulcão com nível 6
  await pg.evaluate(() => { G.pescaXp.Andre = xpPara(6); }); await pg.evaluate(() => { const c = chegadaIlha("recife"); PRACA.eu.x = c.x; PRACA.eu.z = c.z; }); await pg.waitForTimeout(300); await clicar();
  await pg.click('[data-a="pescaViajar"][data-k="vulcao"]'); await pg.waitForTimeout(1500); await pg.evaluate(() => { PRACA.yaw = 2.4; PRACA.alt = .45; }); await pg.waitForTimeout(500); await pg.screenshot({ path: S + '/p2-vulcao.png' });
  r.vulcao = await pg.evaluate(() => Math.round(Math.hypot(PRACA.eu.x - ILHAS.vulcao.x, PRACA.eu.z - ILHAS.vulcao.z)));
  // clima
  r.clima = await pg.evaluate(() => { const out = {}; window.PESCA_CLIMA_TESTE = "estrelas"; let n = 0; for (let i = 0; i < 400; i++) if (sortearPeixe("mar", 0).k === "cometa") n++; out.cometaEstrelas = n;
    window.PESCA_CLIMA_TESTE = "sol"; n = 0; for (let i = 0; i < 400; i++) if (sortearPeixe("mar", 0).k === "cometa") n++; out.cometaSol = n;
    window.PESCA_CLIMA_TESTE = "neblina"; n = 0; for (let i = 0; i < 400; i++) if (sortearPeixe("lago", 0).noite) n++; out.noturnosNaNeblina = n; return out; });
  await pg.evaluate(() => { window.PESCA_CLIMA_TESTE = "tempestade"; }); await pg.waitForTimeout(800); r.chuva = await pg.evaluate(() => !!PRACA.bosque.chuva); await pg.screenshot({ path: S + '/p2-tempestade.png' });
  await pg.evaluate(() => { window.PESCA_CLIMA_TESTE = "sol"; });
  // de volta, Loja: avaliador e encantar
  await pg.evaluate(() => { const mo = mochilaDe("Andre"); for (let i = 0; i < 6; i++) mo.push({ k: "palhaco", tam: 9, esp: null, v: 4 }); mo.push({ k: "lagosta", tam: 40, esp: null, v: 15 }); });
  await ir(LOJA_PESCA.x, LOJA_PESCA.z + 1.6, 0); await pg.waitForTimeout(400); await clicar();
  await pg.click('[data-a="pescaAba"][data-k="avaliar"]'); await pg.waitForTimeout(200);
  const res = []; for (let i = 0; i < 5; i++) { await pg.click('[data-a="pescaAvaliar"][data-i="0"]'); await pg.waitForTimeout(150); res.push(await pg.evaluate(() => (document.querySelector(".pp-res") || {}).textContent)); }
  r.avaliar = res; await pg.screenshot({ path: S + '/p2-avaliador.png' });
  await pg.click('[data-a="pescaAba"][data-k="encantar"]'); await pg.waitForTimeout(200); await pg.click('[data-a="pescaEncantar"]'); await pg.waitForTimeout(200);
  r.encanto = await pg.evaluate(() => { const v = varaDe("Andre"); return { enc: v.enc && v.enc.k, sorte: v.sorte }; }); await pg.screenshot({ path: S + '/p2-encantar.png' });
  await pg.click('[data-a="pescaAba"][data-k="varas"]'); await pg.waitForTimeout(200); r.varas = await pg.evaluate(() => [...document.querySelectorAll('[data-a="pescaVara"]')].map(b => b.textContent));
  await pg.click('[data-a="pescaAba"][data-k="gaiolas"]'); await pg.waitForTimeout(200); await pg.click('[data-a="pescaGaiola"]'); await pg.waitForTimeout(200); r.gaiolasCompradas = await pg.evaluate(() => G.inv.Andre.gaiolas);
  await pg.click('#pr-fechar');
  // gaiola no lago
  await pg.evaluate(() => { const p = lugarGaiola("lago"); PRACA.eu.x = p.x; PRACA.eu.z = p.z; PRACA.yaw = .5; }); await pg.waitForTimeout(400); r.botaoGaiola = await botao(); await clicar();
  r.gaiolaPosta = await pg.evaluate(() => !!gaiolasDe("Andre").lago); await pg.waitForTimeout(300); await pg.screenshot({ path: S + '/p2-gaiola.png' });
  await pg.evaluate(() => { gaiolasDe("Andre").lago.desde -= 5 * 60000; }); await pg.waitForTimeout(400); r.botaoCheia = await botao();
  const mo0 = await pg.evaluate(() => mochilaDe("Andre").length); await clicar(); r.gaiolaPegou = await pg.evaluate(m => mochilaDe("Andre").length - m, mo0);
  // pedidos do Vovô
  await ir(VOVO.x + 1, VOVO.z + 1, -.8); await pg.waitForTimeout(400); r.botaoVovo = await botao(); await pg.screenshot({ path: S + '/p2-vovo3d.png' }); await clicar();
  await pg.evaluate(() => { const pd = pedidosDoDia()[0]; mochilaDe("Andre").push({ k: pd.p.k, tam: 10, esp: null, v: 5 }); }); await pg.click('[data-a="pescaAba"]').catch(() => {});
  await pg.evaluate(() => atualizarPainelPraca()); await pg.waitForTimeout(200); const b0 = await pg.evaluate(() => G.banco.Andre);
  await pg.click('[data-a="pescaEntregar"][data-i="0"]'); await pg.waitForTimeout(300); r.entregou = await pg.evaluate(b => ({ ganhou: G.banco.Andre - b, feitos: pedidosFeitos("Andre") }), b0);
  await pg.screenshot({ path: S + '/p2-pedidos.png' }); await pg.click('#pr-fechar');
  // mapa do tesouro
  await pg.evaluate(() => { mapasDe("Andre").push(4); }); await ir(0, -5, 0); await pg.waitForTimeout(500); r.dicaLonge = await pg.evaluate(() => $("pr-mapa").textContent);
  await ir(0, -13.5, 0, .5); await pg.waitForTimeout(500); r.dicaPerto = await pg.evaluate(() => $("pr-mapa").textContent); await pg.screenshot({ path: S + '/p2-mapa.png' });
  await ir(0, -15.5); await pg.waitForTimeout(400); r.botaoCavar = await botao(); const b1 = await pg.evaluate(() => G.banco.Andre); await clicar();
  r.tesouro = await pg.evaluate(b => ({ ganhou: G.banco.Andre - b, mapas: mapasDe("Andre").length }), b1);
  // pescar e ganhar XP
  await pg.evaluate(() => { G.pescaXp.Andre = 0; }); await ir(PESCA_LUGAR.x, PESCA_LUGAR.z, .5); await pg.waitForTimeout(400); await clicar();
  await pg.evaluate(() => { PRACA.pescaSegura = true; }); await pg.waitForTimeout(300); await pg.evaluate(() => { PRACA.pescaSegura = false; }); await pg.waitForFunction(() => PRACA.pesca && PRACA.pesca.fase === 'espera');
  await pg.evaluate(() => { PRACA.pesca.t = .01; }); await pg.waitForFunction(() => PRACA.pesca && PRACA.pesca.fase === 'briga'); await pg.evaluate(() => { PRACA.pesca.prog = .995; PRACA.pesca.peixe = PRACA.pesca.bar + .05; });
  await pg.waitForFunction(() => PRACA.pesca && PRACA.pesca.fase === 'fim'); r.xpDepois = await pg.evaluate(() => xpPescaDe("Andre"));
  r.erros = errs; console.log(JSON.stringify(r, null, 1)); await b.close(); })();
