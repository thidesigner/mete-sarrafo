// Tela de entrar numa sala: mostra em qual passo parou (servidor ou celular de quem abriu) e o motivo, com Cancelar.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-entrar.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch(); const out = {};
  for (const caso of ["servidor", "celular"]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
    // imitação do PeerJS: "servidor" nunca responde; "celular" acha o servidor mas não liga no outro celular
    const stub = caso === "servidor" ? `window.Peer = class { constructor(){ this.h={}; } on(e,f){ (this.h[e]=this.h[e]||[]).push(f); } destroy(){} };`
      : `window.Peer = class { constructor(){ this.h={}; setTimeout(()=> (this.h.open||[]).forEach(f=>f("x")), 200); } on(e,f){ (this.h[e]=this.h[e]||[]).push(f); } connect(){ return { on(){}, open:false }; } destroy(){} };`;
    await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: stub, contentType: 'application/javascript' }));
    await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
    await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('http://localhost:8767/teste/?sala=ABCD'); await pg.waitForTimeout(800);
    await pg.fill('#en-nome', 'Maria'); await pg.click('.lb-jogar'); await pg.waitForTimeout(2500);
    const etapa = await pg.evaluate(() => ON.etapa); await pg.screenshot({ path: S + `/entrar-${caso}.png` });
    await pg.waitForTimeout(18500);
    const fim = await pg.evaluate(() => ({ conectando: ON.conectando, toast: ($("toast") || {}).textContent }));
    out[caso] = { etapa, fim, errs }; await ctx.close();
  }
  console.log(JSON.stringify(out)); await b.close(); })();
