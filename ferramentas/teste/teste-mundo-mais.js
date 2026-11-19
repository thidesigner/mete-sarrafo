// Criar Mundo (parte 2): formas livres (tamanho, giro, mover, rampa andável), blocos de poder, tipos de jogo (moedas, sobrevivência),
// loja do mundo, mandar o mundo para um amigo e o amigo comprar (as moedas chegam para quem criou).
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-mundo-mais.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abre = async (pref, nome, moedas) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(pref + e.message));
    await pg.addInitScript(p => { for (const m of ['getItem', 'setItem', 'removeItem']) { const o = Storage.prototype[m]; Storage.prototype[m] = function (k, ...r) { return o.call(this, p + k, ...r); }; } }, pref);
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(([n, m]) => { G.perfil = n; G.banco = { [n]: m }; G.mundos = {}; salvar(); ir("lobby"); }, [nome, moedas]); await pg.waitForTimeout(800); return pg; };
  const A = await abre('A:', 'Andre', 50), r = {};
  await A.click('[data-a="mundos"]'); await A.fill('#mb-nome', 'Mundo Teste'); await A.click('[data-a="mundoNovo"] button'); await A.waitForTimeout(1500);
  // formas: escolhe a rampa e toca na tela
  await A.click('#mb-paleta [data-f="3"]'); await A.mouse.click(195, 330); await A.waitForTimeout(300);
  r.forma = await A.evaluate(() => ({ n: MB.formas.length, sel: !!MB.sel, barra: !$("mb-sel").hidden }));
  await A.click('#mb-sel [data-e="0,1"]'); await A.click('#mb-sel [data-e="0,1"]'); await A.click('#mb-sel [data-e="1,1"]'); await A.click('#mb-sel [data-g="1"]'); await A.click('#mb-sel [data-g="1"]'); await A.click('#mb-sel [data-m="1,1"]');
  r.editou = await A.evaluate(() => ({ e: MB.sel.e, r: MB.sel.r, y: MB.sel.p[1] }));
  await A.click('#mb-sel [data-ok="1"]');
  // monta: esfera, cilindro, cone e placa para a foto
  await A.evaluate(() => { formaPor("esfera", [-3, 0, -2], 4).e = [2, 2, 2]; formaPor("cilindro", [3, 0, -3], 1); formaPor("cone", [0, 0, -6], 2); const p = formaPor("placa", [4, 2, 2], 5); p.e = [3, 1, 3]; MB.formas.forEach(formaRefazer); MB.sel = null; mbSelBarra(); mbGuardar(); MB.yaw = 0; MB.alt = .5; MB.eu.z = 6; MB.eu.y = 3; });
  await A.waitForTimeout(500); await A.screenshot({ path: S + '/mm-formas.png' });
  // rampa andável: altura sobe ao longo dela
  r.rampa = await A.evaluate(() => { const f = { s: "rampa", p: [10, 0, 10], e: [4, 2, 2], r: 0, c: 0 }; return [alturaRampa(f, 8.2, 10), alturaRampa(f, 10, 10), alturaRampa(f, 11.9, 10)].map(v => +v.toFixed(2)); });
  // ajustes: tipo Caça às moedas, 30 s, loja com turbo a 25
  await A.click('#mb-ajustes'); await A.click('#mb-painel [data-mb="modo"][data-v="moedas"]'); await A.click('#mb-painel [data-mb="tempo"][data-v="30"]'); await A.click('#mb-painel [data-mb="loja"][data-k="turbo"][data-v="25"]');
  await A.screenshot({ path: S + '/mm-ajustes.png' }); await A.click('#mb-fechar');
  r.ajustes = await A.evaluate(() => ({ modo: MB.mundo.modo, tempo: MB.mundo.tempo, loja: MB.mundo.loja }));
  // blocos de poder e moedas
  await A.evaluate(() => { mbPor(2, 0, 4, 8, 0); mbPor(-2, 0, 4, 5, 0); mbPor(-4, 0, 4, 5, 0); });
  await A.click('#mb-modo'); await A.waitForTimeout(400);
  await A.evaluate(() => { Object.assign(MB.eu, { x: 2, z: 4, y: 0 }); }); await A.waitForTimeout(300); r.poder = await A.evaluate(() => MB.jogo.pod);
  await A.evaluate(() => { Object.assign(MB.eu, { x: -2, z: 4, y: 0 }); }); await A.waitForTimeout(250); await A.evaluate(() => { Object.assign(MB.eu, { x: -4, z: 4, y: 0 }); }); await A.waitForTimeout(300);
  r.moedasGanhou = await A.evaluate(() => ({ fim: MB.jogo.fim, txt: $("mb-fim").hidden ? null : $("mb-fim").innerText.split("\n")[1] }));
  // sobrevivência: lava sobe e pega quem fica no chão
  await A.evaluate(() => { MB.mundo.modo = "sobreviver"; mbMudarModo("jogar"); MB.jogo.t = 20; Object.assign(MB.eu, { x: 10, z: 10, y: 0 }); }); await A.waitForTimeout(400);
  r.lava = await A.evaluate(() => ({ fim: MB.jogo.fim, txt: $("mb-fim").innerText.split("\n")[1] }));
  await A.evaluate(() => { MB.mundo.modo = "moedas"; mbMudarModo("construir"); mbGuardar(); }); await A.click('#mb-sair'); await A.waitForTimeout(300);
  // amigo
  const L = await abre('B:', 'Leo', 100);
  const cA = await A.evaluate(() => meuCodigoAmigo()), cL = await L.evaluate(() => meuCodigoAmigo());
  await A.evaluate(c => guardarAmigo(c, "Leo"), cL); await L.evaluate(c => guardarAmigo(c, "Andre"), cA);
  await A.evaluate(() => render()); await A.click('[data-a="mundoMandarAbrir"]'); await A.click('[data-a="mundoMandar"]'); await L.waitForTimeout(1500);
  r.recebeu = await L.evaluate(() => mundosAmigos().map(m => m.nome + " de " + m.autor.nome + " " + m.b.length + "b " + m.f.length + "f"));
  await L.evaluate(() => ir("mundos")); await L.waitForTimeout(300); await L.screenshot({ path: S + '/mm-amigo-lista.png', fullPage: true });
  await L.click('[data-a="mundoAbrir"]'); await L.waitForTimeout(1200);
  r.amigoJoga = await L.evaluate(() => ({ modo: MB.modo, loja: !$("mb-loja").hidden, construir: !$("mb-modo").hidden }));
  await L.click('#mb-loja'); await L.waitForTimeout(200); await L.screenshot({ path: S + '/mm-loja.png' });
  await L.click('#mb-painel [data-mb="comprar"]'); await L.waitForTimeout(1500);
  r.compra = { leo: await L.evaluate(() => G.banco.Leo), andre: await A.evaluate(() => G.banco.Andre), turbo: await L.evaluate(() => MB.jogo.pod.turbo > 0), pend: await L.evaluate(() => (G.pagPend || []).length) };
  // não paga duas vezes a mesma compra
  await L.evaluate(() => falarComAmigo(G.mundosAmigos[0].autor.codigo, { t: "pag", id: G.pagRecebidos ? "x" : "repetido", v: 25, k: "turbo", mundo: G.mundosAmigos[0].id })); await L.evaluate(() => falarComAmigo(G.mundosAmigos[0].autor.codigo, { t: "pag", id: "repetido", v: 25, k: "turbo", mundo: G.mundosAmigos[0].id })); await A.waitForTimeout(1200);
  r.semRepetir = await A.evaluate(() => G.banco.Andre);
  console.log(JSON.stringify({ r, errs }, null, 1)); await b.close(); })();
