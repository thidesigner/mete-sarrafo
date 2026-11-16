// Se o jogo foi fechado dentro da Praça ou de uma sala, ao abrir de novo ele volta para a tela inicial (antes ficava a tela vazia).
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-volta-inicio.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch(); const out = {};
  for (const tela of ["praca", "salaHost", "esperando", "criandoSala"]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } });
    await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
    await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
    await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(t => { G.perfil = "Andre"; G.tela = t; salvar(); }, tela);   // como se o Chrome tivesse fechado nessa tela
    await pg.reload(); await pg.waitForTimeout(1200); { const ab = await pg.$('#abertura'); if (ab) { await ab.click(); await pg.waitForTimeout(500); } }
    out[tela] = await pg.evaluate(() => ({ tela: G.tela, temJogar: !!document.querySelector('[data-a="jogar"]') })); out[tela].errs = errs;
    if (tela === "praca") await pg.screenshot({ path: S + '/volta-praca.png' });
    await ctx.close();
  }
  console.log(JSON.stringify(out)); await b.close(); })();
