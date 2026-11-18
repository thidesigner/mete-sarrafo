// Mais coisas na Praça: campinho (gol), trampolim, escorregador, palco de dança, casinha, fonte dos desejos, Bip e Bop (missão do dia),
// pega-pega (com o Bip e com um amigo pela rede), clima da coleção e máquina de foto.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-praca-mais.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, acceptDownloads: true });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abrir = async (nome, pref) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.addInitScript(p => { for (const m of ['getItem', 'setItem', 'removeItem']) { const o = Storage.prototype[m]; Storage.prototype[m] = function (k, ...r) { return o.call(this, p + k, ...r); }; } }, pref);
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(n => { window.PRACA_HORA_TESTE = 12; G.perfil = n; G.banco = { [n]: 200 }; G.inv = { [n]: { vidas: 0, pets: ["cachorro"] } }; G.vitorias = { [n]: 3 }; G.historias = { vistas: historiasAgora().map(h => h.id) }; salvar(); ir("lobby"); }, nome);
    await pg.click('[data-a="praca"]'); await pg.waitForTimeout(1500); return pg; };
  const a = await abrir("Andre", "A:"), r = {}, tp = (x, z, y = 0) => a.evaluate(([x, z, y]) => { Object.assign(PRACA.eu, { x, z, y, vy: 0 }); }, [x, z, y]);
  // campinho: chutar a bola para o gol
  await a.evaluate(() => { const b = PRACA.bola; b.position.set(28, .32, -14.6); PRACA.bolaV.x = 0; PRACA.bolaV.z = -4; }); await a.waitForTimeout(800);
  r.gol = await a.evaluate(() => +PRACA.bola.position.z.toFixed(1));
  await tp(28, -10); await a.evaluate(() => { PRACA.yaw = 0; PRACA.alt = .5; }); await a.waitForTimeout(500); await a.screenshot({ path: S + '/pm-campinho.png' });
  // trampolim
  await tp(25, 3.4, 1.5); await a.waitForTimeout(500); r.trampolim = await a.evaluate(() => +PRACA.eu.y.toFixed(1));
  // escorregador: sobe na plataforma e desliza
  await tp(37.6, 4.4, 3); await a.waitForTimeout(150); await tp(36.6, 4.4, 2.9); await a.waitForTimeout(900); r.escorregou = await a.evaluate(() => ({ x: +PRACA.eu.x.toFixed(1), y: +PRACA.eu.y.toFixed(1) }));
  // palco
  await tp(43.2, -.6, .5); await a.waitForTimeout(600); r.palco = await a.evaluate(() => noPalco()); await a.evaluate(() => { PRACA.yaw = -Math.PI / 2; PRACA.alt = .4; PRACA.eu.x = 41.5; }); await a.waitForTimeout(500); await a.screenshot({ path: S + '/pm-palco.png' });
  // casinha
  await a.evaluate(() => { Object.assign(PRACA.eu, { x: CASA.porta.x, z: CASA.porta.z, y: 0 }); }); await a.waitForTimeout(400);
  r.botaoCasa = await a.evaluate(() => $("pr-acao").textContent); await a.click('#pr-acao', { force: true }); await a.waitForTimeout(400);
  await a.click('#pr-painel [data-a="casaCor"][data-k="#c8f7dc"]'); await a.click('#pr-painel [data-a="casaPet"][data-k="cachorro"]'); await a.waitForTimeout(400); await a.click('#pr-fechar');
  await a.evaluate(() => { PRACA.eu.x = 37; PRACA.eu.z = -14.4; PRACA.yaw = -Math.PI / 2; PRACA.alt = .4; }); await a.waitForTimeout(600); await a.screenshot({ path: S + '/pm-casa.png' });
  r.casa = await a.evaluate(() => ({ casa: G.casa.Andre, enfeites: PRACA.casaEnfeites.children.length }));
  // fonte dos desejos
  await tp(0, 4); await a.waitForTimeout(400); r.botaoFonte = await a.evaluate(() => $("pr-acao").textContent); await a.click('#pr-acao', { force: true }); await a.waitForTimeout(300);
  for (let i = 0; i < 6; i++) { await a.click('#pr-painel [data-a="pracaDesejo"]').catch(() => {}); await a.waitForTimeout(150); }
  r.fonte = await a.evaluate(() => ({ feitos: desejosHoje(), res: PRACA.desejoRes, desab: $("pr-painel").querySelector('[data-a="pracaDesejo"]').disabled })); await a.click('#pr-fechar');
  // Bip e Bop: missão do dia
  const bip = await a.evaluate(() => { const n = PRACA.npcs[0]; return { x: n.x, z: n.z }; }); await tp(bip.x + .8, bip.z); await a.waitForTimeout(300);
  r.botaoBip = await a.evaluate(() => $("pr-acao").textContent); await a.click('#pr-acao', { force: true }); await a.waitForTimeout(300); await a.screenshot({ path: S + '/pm-bip.png' });
  await a.click('#pr-painel [data-a="npcAceitar"]'); await a.waitForTimeout(300); await a.click('#pr-fechar').catch(() => {});
  const m0 = await a.evaluate(() => G.banco.Andre); await a.evaluate(() => { const o = PRACA.objMissao; Object.assign(PRACA.eu, { x: o.x, z: o.z, y: 0 }); }); await a.waitForTimeout(400);
  r.missaoBip = await a.evaluate(m => ({ feita: missaoNpc("Bip").feita, ganhou: G.banco.Andre - m }), m0);
  // pega-pega com o Bip (sozinho)
  await a.evaluate(() => acoes.pegaComecar()); await a.waitForTimeout(200);
  await a.evaluate(() => { const n = PRACA.pegaNpc.npc; Object.assign(PRACA.eu, { x: n.x + .5, z: n.z }); }); await a.waitForTimeout(200);
  r.pegaBip = await a.evaluate(() => PRACA.pegaNpc && { bipPega: PRACA.pegaNpc.bipPega, t: Math.round(PRACA.pegaNpc.t) });
  await a.evaluate(() => { Object.assign(PRACA.eu, { x: -6, z: 16 }); PRACA.pegaNpc.npc.x = 14; PRACA.pegaNpc.npc.z = 0; PRACA.pegaNpc.t = .3; }); const m1 = await a.evaluate(() => G.banco.Andre); await a.waitForTimeout(800);
  r.fugiu = await a.evaluate(m => G.banco.Andre - m, m1);
  // clima
  r.clima = await a.evaluate(() => ({ clima: PRACA.clima, temPts: !!PRACA.climaPts }));
  // foto
  const dl = a.waitForEvent('download', { timeout: 8000 }).catch(() => null); await a.click('#pr-foto'); const d = await dl; r.foto = d ? d.suggestedFilename() : null;
  // pega-pega com um amigo pela rede
  const m = await abrir("Leo", "B:"); await a.waitForTimeout(1500);
  await a.evaluate(() => { PRACA.eu.x = 5; PRACA.eu.z = 5; PRACA.eu.y = 0; }); await m.evaluate(() => { PRACA.eu.x = 5.5; PRACA.eu.z = 5; }); await a.waitForTimeout(1500);
  r.veAmigo = await a.evaluate(() => PRACA.outros.size);
  await a.evaluate(() => { PRACA.pega = true; PRACA.pegaImune = 0; }); await a.waitForTimeout(1500);
  r.pegaRede = { andre: await a.evaluate(() => PRACA.pega), leo: await m.evaluate(() => PRACA.pega) };
  await m.waitForTimeout(800); r.andreVeLeoPegador = await a.evaluate(() => [...PRACA.outros.values()].some(o => o.alvo && o.alvo.e & 4));
  console.log(JSON.stringify({ r, errs }, null, 1)); await b.close(); })();
