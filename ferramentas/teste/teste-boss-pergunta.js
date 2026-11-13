// Com o boss vivo, quem pergunta é ele (palavras do tema) e todos os jogadores chutam.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-boss-pergunta.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 380, height: 800 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abrir = async (nome, fp) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(([n, fp]) => { G.perfil = n; G.banco[n] = 300; G.visaoOnline = fp; salvar(); ir("lobby"); }, [nome, fp]); await pg.waitForTimeout(300); return pg; };
  const host = await abrir("Andre", false); await host.evaluate(() => acoes.entrarEvento()); await host.waitForTimeout(900);
  const amigo = await abrir("Maria", false); await amigo.evaluate(() => acoes.entrarEvento()); await amigo.waitForTimeout(900);
  await host.evaluate(() => { ON.fp = false; }); await host.click('[data-a="comecarOnline"]'); await host.waitForTimeout(1200);
  const segredoPedido = !!(await host.$('#ov-go')) || !!(await amigo.$('#ov-go'));
  const p1 = await host.evaluate(() => ({ k: A.ph.k, perg: A.ph.perg && A.ph.perg.nome, boss: A.ph.perg && A.ph.perg.boss, tema: A.ph.tema, ordem: A.ph.ordem.map(p => p.nome), fase: $("a-phase").textContent }));
  await amigo.waitForTimeout(400);
  const c1 = await amigo.evaluate(() => ({ k: A.ph.k, perg: A.ph.perg, fase: $("a-phase").textContent, tema: $("a-tema").textContent }));
  await (await amigo.$('#a-game')).screenshot({ path: S + '/bp-amigo.png' });
  // alguém acerta -> bola -> fim da rodada -> o boss pergunta de novo
  await host.evaluate(() => { const ph = A.ph; chuteA(ph.ordem[ph.idx], true, ph.palavra, false); });
  await host.waitForFunction(() => A.ph.k === "bola" && A.ph.pronto, null, { timeout: 15000 });
  await host.evaluate(() => fimRodadaA(true)); const msgTroca = await host.evaluate(() => $("a-sub").textContent);
  await host.waitForFunction(() => A.ph.k === "pergunta", null, { timeout: 20000 });
  const p2 = await host.evaluate(() => ({ perg: A.ph.perg.nome, boss: A.ph.perg.boss }));
  console.log(JSON.stringify({ segredoPedido, p1, c1, msgTroca, p2, errs })); await b.close(); })();
