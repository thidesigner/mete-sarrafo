// Parque da Praça: passagem, corrida de obstáculos (tempo e recorde), roda-gigante, caça ao tesouro do dia e dia/noite.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-parque.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { window.PRACA_HORA_TESTE = 12; G.perfil = "Andre"; G.banco.Andre = 100; G.historias = { vistas: historiasAgora().map(h => h.id) }; salvar(); ir("lobby"); });
  await pg.click('[data-a="praca"]'); await pg.waitForTimeout(1500); const r = {};
  // passagem: anda para a direita até o parque
  await pg.evaluate(() => { PRACA.eu.x = 17; PRACA.eu.z = 0; PRACA.yaw = -Math.PI / 2; }); await pg.keyboard.down("w"); await pg.waitForTimeout(1500); await pg.keyboard.up('w');
  r.passou = await pg.evaluate(() => Math.round(PRACA.eu.x)); r.livre = await pg.evaluate(() => [pracaLivre(30, 0), pracaLivre(19.5, 6), pracaLivre(50, 0)]);
  await pg.evaluate(() => { PRACA.eu.x = 22; PRACA.eu.z = 0; PRACA.yaw = Math.PI / 2 + .35; PRACA.alt = .5; }); await pg.waitForTimeout(800); await pg.screenshot({ path: S + '/pq-parque.png' });
  // corrida: largada -> primeira plataforma (pulando) -> chegada
  await pg.evaluate(() => { const l = PK_PLAT[0]; Object.assign(PRACA.eu, { x: l.x, z: l.z, y: l.y, vy: 0 }); PRACA.yaw = -Math.PI / 2; }); await pg.waitForTimeout(300);
  await pg.evaluate(() => { const p = PK_PLAT[1]; Object.assign(PRACA.eu, { x: p.x, z: p.z, y: p.y + .5, vy: 0 }); }); await pg.waitForTimeout(700);
  r.emCima = await pg.evaluate(() => ({ y: +PRACA.eu.y.toFixed(2), crono: $("pr-corrida").textContent }));
  await pg.screenshot({ path: S + '/pq-corrida.png' });
  const moedas0 = await pg.evaluate(() => G.banco.Andre);
  await pg.evaluate(() => { const f = PK_PLAT[PK_PLAT.length - 1]; Object.assign(PRACA.eu, { x: f.x, z: f.z, y: f.y, vy: 0 }); }); await pg.waitForTimeout(400);
  r.chegou = await pg.evaluate(() => ({ rec: G.pkRec, crono: $("pr-corrida").textContent })); r.premioCorrida = await pg.evaluate(m => G.banco.Andre - m, moedas0);
  // cair reinicia
  await pg.evaluate(() => { const l = PK_PLAT[0]; Object.assign(PRACA.eu, { x: l.x, z: l.z, y: l.y }); }); await pg.waitForTimeout(200); await pg.evaluate(() => { Object.assign(PRACA.eu, { x: 27, z: 5, y: 0 }); }); await pg.waitForTimeout(700);
  r.caiu = await pg.evaluate(() => PRACA.pk);
  // roda-gigante
  await pg.evaluate(() => { PRACA.eu.x = RODA.x; PRACA.eu.z = RODA.z + 2.6; PRACA.eu.y = 0; }); await pg.waitForTimeout(400);
  r.botaoRoda = await pg.evaluate(() => $("pr-acao").hidden ? null : $("pr-acao").textContent);
  await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(400);
  await pg.evaluate(() => { PRACA.naRoda.t = 5; PRACA.rodaAng += 2; }); await pg.waitForTimeout(800);
  r.naRoda = await pg.evaluate(() => ({ y: +PRACA.eu.y.toFixed(1), botao: $("pr-acao").textContent }));
  await pg.evaluate(() => { PRACA.yaw = Math.PI; PRACA.alt = .3; }); await pg.waitForTimeout(400); await pg.screenshot({ path: S + '/pq-roda.png' });
  await pg.click('#pr-acao', { force: true }); await pg.waitForTimeout(300); r.desceu = await pg.evaluate(() => ({ y: PRACA.eu.y, roda: PRACA.naRoda }));
  // tesouro do dia
  r.tes0 = await pg.evaluate(() => ({ hud: $("pr-tesouro").textContent, n: PRACA.tesouros.length }));
  const m1 = await pg.evaluate(() => G.banco.Andre);
  await pg.evaluate(() => { const t = PRACA.tesouros[0]; PRACA.eu.x = t.x; PRACA.eu.z = t.z; PRACA.eu.y = 0; }); await pg.waitForTimeout(400);
  r.tes1 = await pg.evaluate(m => ({ hud: $("pr-tesouro").textContent, n: PRACA.tesouros.length, ganhou: G.banco.Andre - m }), m1);
  for (let i = 0; i < 4; i++) { await pg.evaluate(() => { const t = PRACA.tesouros[0]; PRACA.eu.x = t.x; PRACA.eu.z = t.z; }); await pg.waitForTimeout(300); }
  r.tes5 = await pg.evaluate(m => ({ hud: $("pr-tesouro").textContent, ganhou: G.banco.Andre - m }), m1);
  // noite
  await pg.evaluate(() => { window.PRACA_HORA_TESTE = 21; PRACA.tDia = 0; PRACA.eu.x = 23; PRACA.eu.z = -1; PRACA.eu.y = 0; PRACA.yaw = Math.PI / 2 + .5; PRACA.alt = .45; }); await pg.waitForTimeout(900);
  r.noite = await pg.evaluate(() => ({ n: PRACA.noite, op: PRACA.ceuNoite.material.opacity }));
  await pg.screenshot({ path: S + '/pq-noite.png' });
  await pg.evaluate(() => { PRACA.eu.x = 0; PRACA.eu.z = 8; PRACA.yaw = 0; PRACA.alt = .5; }); await pg.waitForTimeout(600); await pg.screenshot({ path: S + '/pq-noite-praca.png' });
  console.log(JSON.stringify({ r, errs }, null, 1)); await b.close(); })();
