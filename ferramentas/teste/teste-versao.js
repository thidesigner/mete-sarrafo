// Aviso de versão nova: se o versao.json do site for diferente da página aberta, aparece a faixa com o botão Atualizar.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-versao.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  let nova = false; await ctx.route(u => u.pathname.endsWith('/versao.json'), async r => { if (nova) return r.fulfill({ contentType: 'application/json', body: '{"v":"nova123"}' }); const res = await r.fetch(); r.fulfill({ response: res }); });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); } await pg.waitForTimeout(5000);
  const semNova = await pg.evaluate(() => !!$("faixa-versao"));
  nova = true; await pg.evaluate(() => checarVersaoSite()); await pg.waitForTimeout(800); const comNova = await pg.evaluate(() => !!$("faixa-versao"));
  await pg.screenshot({ path: S + '/versao.png' });
  await Promise.all([pg.waitForNavigation(), pg.click('#faixa-versao button')]); const url = pg.url();
  console.log(JSON.stringify({ semNova, comNova, url, errs })); await b.close(); })();
