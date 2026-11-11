// Boss da Partida do Evento: aparece com a coleção da loja, perde vida com palavra certa e bolada, ataca quem corre e dá prêmio a todos.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-boss.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 380, height: 800 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abrir = async (nome, banco, fp) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(([n, bb, fp]) => { G.perfil = n; G.banco[n] = bb; G.visaoOnline = fp; salvar(); ir("lobby"); }, [nome, banco, fp]); await pg.waitForTimeout(300); return pg; };
  const host = await abrir("Andre", 500, true); await host.evaluate(() => acoes.entrarEvento()); await host.waitForTimeout(900);
  const amigo = await abrir("Maria", 300, false); await amigo.evaluate(() => acoes.entrarEvento()); await amigo.waitForTimeout(900);
  await host.evaluate(() => { ON.fp = true; }); await host.click('[data-a="comecarOnline"]'); await host.waitForTimeout(1200);
  for (const pg of [host, amigo]) if (await pg.$('#ov-go')) { await pg.fill('#ov-pal', 'BOLA'); await pg.dispatchEvent('#ov-pal', 'change'); await pg.click('[data-tema="Objetos"]'); await pg.click('[data-letra="B"]'); await pg.click('#ov-go'); }
  await host.waitForTimeout(600);
  const b0 = await host.evaluate(() => ({ ...A.boss }));
  // acerto de palavra tira 25
  await host.evaluate(() => { const ph = A.ph; if (ph.k === "pergunta") chuteA(ph.ordem[ph.idx], true, ph.palavra, false); }); await host.waitForTimeout(400);
  const b1 = await host.evaluate(() => ({ hp: A.boss.hp, fase: A.ph.k }));
  // espera a fase da bola e o boss atacar
  await host.waitForFunction(() => A.ph.k === "bola" && A.ph.pronto, null, { timeout: 15000 }).catch(() => {});
  await host.waitForTimeout(4500);
  const ataques = await host.evaluate(() => A.boss.n || 0);
  await amigo.waitForTimeout(200); await (await amigo.$('#a-game .stage-wrap')).screenshot({ path: S + '/boss-2d.png' });
  await (await amigo.$('#a-boss')).screenshot({ path: S + '/boss-barra.png' });
  await (await host.$('#a-game .stage-wrap')).screenshot({ path: S + '/boss-3d.png' });
  // bola do jogador no boss
  await host.evaluate(() => { A.balls.push({ from: { x: 100, y: 100 }, to: { x: AC + 10, y: AC }, t: 0, T: .3, k: "bola" }); }); await host.waitForTimeout(700);
  const b2 = await host.evaluate(() => A.boss.hp);
  // golpe final
  await host.evaluate(() => { A.boss.hp = 5; bossDano(8, A.P[ON.myIdx]); }); await host.waitForTimeout(1200);
  const fimH = await host.evaluate(() => ({ morto: A.boss.morto, rank: G.evRank.j, item: temArremesso("Andre", "coroaeclipse"), moedasNaPartida: A.P[ON.myIdx].moedas }));
  const fimA = await amigo.evaluate(() => ({ morto: A.boss && A.boss.morto, item: temArremesso("Maria", "coroaeclipse"), rank: G.evRank.j }));
  await (await amigo.$('#a-game .stage-wrap')).screenshot({ path: S + '/boss-morto.png' });
  console.log(JSON.stringify({ b0, b1, ataques, b2, fimH, fimA, errs })); await b.close(); })();
