// Criar Mundo: criar, pôr blocos tocando na tela, apagar, guardar, e jogar (pisar no bloco, pular, mola, lava, moeda e chegada com recorde).
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-mundo.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { G.perfil = "Andre"; G.mundos = {}; salvar(); ir("lobby"); }); const r = {};
  await pg.click('[data-a="mundos"]'); await pg.fill('#mb-nome', 'Pista do Andre'); await pg.click('[data-a="mundoNovo"] button'); await pg.waitForTimeout(1500);
  r.aberto = await pg.evaluate(() => ({ on: MB.on, modo: MB.modo, blocos: MB.blocos.size }));
  // tocar na tela põe bloco
  const n0 = await pg.evaluate(() => MB.blocos.size); await pg.mouse.click(195, 300); await pg.waitForTimeout(200); await pg.mouse.click(250, 300); await pg.waitForTimeout(200);
  r.tocou = await pg.evaluate(n => MB.blocos.size - n, n0);
  // apagar
  await pg.evaluate(() => { MB.apagar = true; mbPaleta(); }); const n1 = await pg.evaluate(() => MB.blocos.size); await pg.mouse.click(195, 300); await pg.waitForTimeout(200); r.apagou = await pg.evaluate(n => n - MB.blocos.size, n1); await pg.evaluate(() => { MB.apagar = false; mbPaleta(); });
  // monta uma pista: largada, degraus, mola, lava, moeda e chegada
  await pg.evaluate(() => { for (const b of [...MB.blocos.values()]) mbTirar(...b.p, false);
    mbPor(0, 0, 0, 1, 0); for (let i = 1; i <= 3; i++) mbPor(0, i - 1, -i * 2, 0, i % 8); for (let i = 0; i < i; i++);
    mbPor(0, 0, -8, 4, 0); mbPor(0, 0, -10, 3, 0); mbPor(3, 0, 0, 5, 0); mbPor(5, 3, 0, 0, 2); mbPor(5, 4, 0, 2, 0); mbPor(2, 0, 2, 7, 0); mbPor(-2, 0, 2, 6, 0); });
  await pg.evaluate(() => { MB.yaw = Math.PI * .85; MB.alt = .5; MB.eu.y = 4; MB.eu.z = 4; }); await pg.waitForTimeout(500); await pg.screenshot({ path: S + '/mb-construir.png' });
  // jogar
  await pg.click('#mb-modo'); await pg.waitForTimeout(800);
  r.largada = await pg.evaluate(() => ({ y: +MB.eu.y.toFixed(2), x: MB.eu.x, z: MB.eu.z, total: MB.jogo.total }));
  await pg.evaluate(() => { Object.assign(MB.eu, { x: 0, z: -4, y: 3 }); }); await pg.waitForTimeout(700); r.pisou = await pg.evaluate(() => +MB.eu.y.toFixed(2));   // degrau em y=1 -> fica em 2
  await pg.evaluate(() => { Object.assign(MB.eu, { x: 0, z: -8, y: 1.3, vy: 0 }); }); await pg.waitForTimeout(250); r.mola = await pg.evaluate(() => +MB.eu.vy.toFixed(1));
  await pg.evaluate(() => { Object.assign(MB.eu, { x: 0, z: -10, y: 1.2, vy: 0 }); }); await pg.waitForTimeout(400); r.lava = await pg.evaluate(() => ({ x: MB.eu.x, z: MB.eu.z }));
  await pg.evaluate(() => { Object.assign(MB.eu, { x: 3, z: 0, y: 0, vy: 0 }); }); await pg.waitForTimeout(300); r.moeda = await pg.evaluate(() => MB.jogo.moedas);
  await pg.evaluate(() => { Object.assign(MB.eu, { x: 5, z: 0, y: 5.4, vy: 0 }); }); await pg.waitForTimeout(500);
  r.chegada = await pg.evaluate(() => ({ fim: MB.jogo.fim, rec: MB.mundo.rec, txt: $("mb-fim").hidden ? null : $("mb-fim").innerText.split("\n").slice(0, 2).join(" | ") }));
  await pg.screenshot({ path: S + '/mb-chegou.png' });
  await pg.click('#mb-denovo'); await pg.waitForTimeout(400); await pg.evaluate(() => { MB.yaw = Math.PI; MB.alt = .35; }); await pg.waitForTimeout(400); await pg.screenshot({ path: S + '/mb-jogar.png' });
  // sai e volta: blocos guardados
  await pg.click('#mb-sair'); await pg.waitForTimeout(400);
  r.lista = await pg.evaluate(() => [G.tela, mundosDe("Andre").map(m => m.nome + ":" + m.b.length)]);
  await pg.click('[data-a="mundoAbrir"][data-modo="construir"]'); await pg.waitForTimeout(1000); r.reaberto = await pg.evaluate(() => MB.blocos.size);
  await pg.click('#mb-sair');
  console.log(JSON.stringify({ r, errs }, null, 1)); await b.close(); })();
