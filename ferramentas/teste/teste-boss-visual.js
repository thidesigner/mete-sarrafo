// Visual dos bosses (Rei Eclipse e Senhor da Tempestade): normal, alerta, ferido e derrotado, de cima e em 3D.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-boss-visual.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  const shots = [];
  for (const modo of ["cima", "fp"]) {
    await pg.evaluate(m => { G.perfil = "Andre"; G.nomes = ["Andre"]; G.modo = m; salvar(); ir("lobby"); }, modo);
    await pg.click('[data-a="jogar"]'); await pg.click('#as-mais'); await pg.click('#as-start'); await pg.waitForTimeout(600);
    for (const k of ["eclipse", "tempestade"]) for (const est of ["normal", "alerta", "ferido"]) {
      await pg.evaluate(([k, est]) => { fecharOv(); A.ov = true; if (F.bossG) { F.scene.remove(F.bossG); F.bossG = null; } A.boss = { k, hp: est === "ferido" ? 300 : 900, max: 1000, partida: 0, morto: false, hit: 0, alerta: est === "alerta", n: 0 }; if (A.fp) { F.pitch = .05; } }, [k, est]);
      await pg.waitForTimeout(700); const n = `bv-${modo}-${k}-${est}.png`; await (await pg.$('#a-game .stage-wrap')).screenshot({ path: S + '/' + n }); shots.push(n);
    }
    await pg.evaluate(() => { A.boss.morto = true; }); await pg.waitForTimeout(350); await (await pg.$('#a-game .stage-wrap')).screenshot({ path: S + `/bv-${modo}-morte.png` });
    await pg.evaluate(() => { A.ov = false; fecharArena(); }).catch(() => {}); await pg.waitForTimeout(400);
  }
  console.log(JSON.stringify({ shots, errs })); await b.close(); })();
