// Coleções semanais (gerador COLS_SEMANA): Oceano 22/11, Dinossauros 29/11, Natal 06/12. Itens à venda na semana certa, pacote, boss e desenhos.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-colecoes-semana.js <pasta-para-fotos> [data ISO para imitar]`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2], DATA = process.argv[3]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  if (DATA) await ctx.addInitScript(d => { const t0 = Date.parse(d), r0 = Date.now(), D = Date; window.Date = class extends D { constructor(...a) { super(...(a.length ? a : [t0 + (D.now() - r0)])); } static now() { return t0 + (D.now() - r0); } }; }, DATA);
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
  await pg.evaluate(() => { G.perfil = "Andre"; G.banco.Andre = 5000; G.lojaAba = "destaques"; salvar(); ir("lobby"); });
  const r = await pg.evaluate(() => ({
    naLoja: colecoesNaLoja("Andre").map(c => c.id), boss: bossDaLoja(),
    semana: COLS_SEMANA.map(c => c.sets.map(s => s.k + ":" + todasLimitadas().filter(x => COLECOES[s.k].chaves.includes(chaveLim(x))).filter(naVenda).length + "/7").join(" ")),
    pacotes: COLS_SEMANA.flatMap(c => c.sets.map(s => { const p = pacoteInfo("Andre", s.k); return s.k + ":" + (p.aVenda ? p.preco : "-"); })), clima: climaDaColecao(), atual: colecoesNaLoja("Andre").map(c => c.id).find(k => SETS_SEMANA[k]) }));
  const atual = r.atual;
  if (atual) { // compra o pacote do primeiro conjunto à venda e confere que ganhou tudo
    await pg.evaluate(() => ir("loja")); await pg.waitForTimeout(300);
    await pg.screenshot({ path: S + '/cs-loja.png', fullPage: false });
    const antes = await pg.evaluate(() => G.banco.Andre);
    await pg.evaluate(k => { acoes.comprarPacote({ dataset: { p: k } }); acoes.comprarPacote({ dataset: { p: k } }); }, atual);
    r.compra = await pg.evaluate(([k, m]) => ({ gastou: m - G.banco.Andre, skin: G.inv.Andre.skin, pet: G.inv.Andre.pet, falta: colecoesNaLoja("Andre").find(c => c.id === k).faltam }), [atual, antes]);
    await pg.evaluate(() => ir("lobby")); await pg.waitForTimeout(500); await pg.screenshot({ path: S + '/cs-lobby.png' });
  }
  // desenha todos os conjuntos (2D e 3D) sem erro
  r.desenho = await pg.evaluate(() => { const cv = document.createElement("canvas"); cv.width = cv.height = 200; const c = cv.getContext("2d"); let n = 0;
    for (const k in SETS_SEMANA) { const s = SETS_SEMANA[k].s; desenharAcessorio2D(c, k, 100, 120); desenharPet2D(c, s.pet.k, 60, 150, 1, k); efeitoGesto2D(c, 100, 100, k, .5); poseGesto(k, .3); desenharArremesso2D(c, k, 50, 50, 0);
      const cab = new THREE.Group(); acessorio3D(cab, k); pet3D(s.pet.k, k); n++; } return n; });
  r.erros = errs; console.log(JSON.stringify(r, null, 1)); await b.close();
})();
