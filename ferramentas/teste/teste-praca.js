// Praça Central: dois jogadores se veem, placas, barraca (compra com confirmação), porta da partida e troca de dono.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-praca.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abrir = async (nome, banco, skin, ex) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(([n, bb, sk, ex]) => { G.perfil = n; G.banco[n] = bb; G.inv = G.inv || {}; G.inv[n] = G.inv[n] || { vidas: 0 }; if (sk) { G.inv[n].skins = [sk]; G.inv[n].skin = sk; } if (ex) G.evRank = { sem: semanaEvento().id, j: ex }; salvar(); ir("lobby"); }, [nome, banco, skin, ex]); await pg.waitForTimeout(300); return pg; };
  const a = await abrir("Andre", 900, "sol", { Andre: { g: 120, t: 600, v: 4 }, Leo: { g: 40, t: 900, v: 2 } });
  await a.click('[data-a="praca"]'); await a.waitForTimeout(1500);
  const m = await abrir("Maria", 400, "lua"); await m.click('[data-a="praca"]'); await m.waitForTimeout(1500);
  // Maria anda para frente um pouco, Andre gira a câmera para ver
  await m.keyboard.down('w'); await m.waitForTimeout(700); await m.keyboard.up('w');
  await a.evaluate(() => { PRACA.eu.x = 2; PRACA.eu.z = 3; PRACA.yaw = 0; }); await a.waitForTimeout(1200);
  const st = await a.evaluate(() => ({ outros: [...PRACA.outros.values()].map(o => o.info.nome), gente: $("pr-gente").textContent }));
  const st2 = await m.evaluate(() => ({ outros: [...PRACA.outros.values()].map(o => o.info.nome), rank: Object.keys(G.evRank.j), gente: $("pr-gente").textContent }));
  await a.screenshot({ path: S + '/pr-1.png' });
  // visão geral de cima/trás
  await a.evaluate(() => { PRACA.eu.x = 0; PRACA.eu.z = 17; PRACA.yaw = 0; PRACA.alt = .8; }); await a.waitForTimeout(600); await a.screenshot({ path: S + '/pr-geral.png' });
  // perto das placas
  await a.evaluate(() => { PRACA.eu.x = -1.8; PRACA.eu.z = -9.5; PRACA.yaw = 0; PRACA.alt = .3; }); await a.waitForTimeout(700); await a.screenshot({ path: S + '/pr-placas.png' });
  const acao1 = await a.evaluate(() => $("pr-acao").hidden ? null : $("pr-acao").textContent);
  await a.click('#pr-acao', { force: true }); await a.waitForTimeout(500); await a.screenshot({ path: S + '/pr-rank.png' });
  await a.click('#pr-painel [data-a="rankAba"][data-k="m"]'); await a.waitForTimeout(300);
  const abaM = await a.$$eval('#pr-painel .ev-rank li', l => l.map(x => x.textContent.trim().replace(/\s+/g, ' ')));
  await a.click('#pr-fechar');
  // barraca de pets
  await a.evaluate(() => { PRACA.eu.x = -9.4; PRACA.eu.z = 4; PRACA.yaw = Math.PI / 2; PRACA.alt = .35; }); await a.waitForTimeout(700); await a.screenshot({ path: S + '/pr-barraca.png' });
  const acao2 = await a.evaluate(() => $("pr-acao").hidden ? null : $("pr-acao").textContent);
  await a.click('#pr-acao', { force: true }); await a.waitForTimeout(700); await a.screenshot({ path: S + '/pr-pets.png' });
  const comprar = await a.$('#pr-painel [data-a="comprarPet"]'); let comprou = null;
  if (comprar) { const k = await comprar.getAttribute('data-k'); await comprar.click(); await a.waitForTimeout(400); const conf = await a.$eval(`#pr-painel [data-a="comprarPet"][data-k="${k}"]`, e => e.textContent.trim()); await a.click(`#pr-painel [data-a="comprarPet"][data-k="${k}"]`); await a.waitForTimeout(400); comprou = await a.evaluate(() => ({ pets: G.inv.Andre.pets, pet: G.inv.Andre.pet, banco: G.banco.Andre })); comprou.conf = conf; await a.screenshot({ path: S + '/pr-pets2.png' }); }
  await a.click('#pr-fechar').catch(() => {});
  // porta
  await a.evaluate(() => { PRACA.eu.x = 0; PRACA.eu.z = 12.6; PRACA.yaw = Math.PI; }); await a.waitForTimeout(600);
  const acao3 = await a.evaluate(() => $("pr-acao").hidden ? null : $("pr-acao").textContent);
  await a.screenshot({ path: S + '/pr-porta.png' });
  await a.click('#pr-acao', { force: true }); await a.waitForTimeout(1200);
  const depoisPorta = await a.evaluate(() => ({ tela: G.tela, code: ON.code, praca: PRACA.on }));
  await m.waitForTimeout(3500); const mOutros = await m.evaluate(() => ({ outros: PRACA.outros.size, gente: $("pr-gente").textContent }));
  console.log(JSON.stringify({ st, st2, acao1, abaM, acao2, comprou, acao3, depoisPorta, mOutros, errs })); await b.close(); })();
