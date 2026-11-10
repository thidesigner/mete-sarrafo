// Partida do Evento: sala fixa, loja dentro da partida e classificação da semana.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-evento.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 380, height: 800 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abrir = async (nome, banco, extra) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(([n, bb, ex]) => { G.perfil = n; G.banco[n] = bb; G.visaoOnline = false; if (ex) G.evRank = { sem: semanaEvento().id, j: ex }; salvar(); ir("eventos"); }, [nome, banco, extra]); await pg.waitForTimeout(300); return pg; };
  const host = await abrir("Andre", 500); await host.click('[data-a="entrarEvento"]'); await host.waitForTimeout(900);
  const h1 = await host.evaluate(() => ({ tela: G.tela, code: ON.code, host: ON.host }));
  const amigo = await abrir("Maria", 300, { Maria: { g: 5, t: 100, v: 1 }, Leo: { g: 0, t: 50, v: 3 } }); await amigo.click('[data-a="entrarEvento"]'); await amigo.waitForTimeout(900);
  const a1 = await amigo.evaluate(() => ({ tela: G.tela, code: ON.codeEntrar }));
  const rankHost0 = await host.evaluate(() => G.evRank.j);
  await host.evaluate(() => { ON.fp = false; }); await host.click('[data-a="comecarOnline"]'); await host.waitForTimeout(900);
  // fecha o pedido de palavra secreta se aparecer
  for (const pg of [host, amigo]) if (await pg.$('#ov-go')) { await pg.fill('#ov-pal', 'BOLA'); await pg.dispatchEvent('#ov-pal', 'change'); await pg.click('[data-tema="Objetos"]'); await pg.click('[data-letra="B"]'); await pg.click('#ov-go'); }
  await amigo.waitForTimeout(500);
  const lojaAmigo = await amigo.$$eval('#a-act [data-ev]', l => l.map(b => b.dataset.ev));
  await (await amigo.$('#a-act')).screenshot({ path: S + '/evp-loja.png' });
  await amigo.click('#a-act [data-ev="escudo"]'); await amigo.waitForTimeout(500);
  await amigo.click('#a-act [data-ev="rapido"]'); await amigo.waitForTimeout(500);
  await host.click('#a-act [data-ev="vida"]'); await host.waitForTimeout(300);
  const h2 = await host.evaluate(() => { const m = A.P.find(p => p.nome === "Maria"), eu = A.P[ON.myIdx]; return { mEsc: m.escudo, mRap: m.rapidoAte > A.t, mGasto: m.evGasto, euVidas: eu.vidas, banco: G.banco.Andre }; });
  const a2 = await amigo.evaluate(() => ({ banco: G.banco.Maria, escVisto: A.P[ON.myIdx].escudo }));
  // dica fora da vez: recusa
  await amigo.evaluate(() => agir({ t: "lojaEv", k: "dica" })); await amigo.waitForTimeout(300);
  // bolada na Maria com escudo
  const h3 = await host.evaluate(() => { const m = A.P.find(p => p.nome === "Maria"), v = m.vidas; const ph0 = A.ph; A.ph = { k: "bola", atir: A.P[ON.myIdx], atingidos: new Set(), cd: 9 }; atingirA(m); const r = { antes: v, depois: m.vidas, esc: m.escudo }; A.ph = ph0; return r; });
  await host.waitForTimeout(300); await (await host.$('#a-game .stage-wrap')).screenshot({ path: S + '/evp-host.png' }).catch(() => {});
  // fim: Andre vence
  await host.evaluate(() => { A.t = 125; terminarA(A.P[ON.myIdx]); }); await host.waitForTimeout(1200);
  const rankHost = await host.evaluate(() => G.evRank.j), rankAmigo = await amigo.evaluate(() => G.evRank.j);
  await amigo.evaluate(() => { sairOnline(); ir("eventos"); }); await amigo.waitForTimeout(500);
  await amigo.screenshot({ path: S + '/evp-rank.png' });
  await amigo.click('[data-a="rankAba"][data-k="g"]'); await amigo.waitForTimeout(300);
  const abaG = await amigo.$$eval('.ev-rank li', l => l.map(x => x.textContent.trim().replace(/\s+/g, ' ')));
  console.log(JSON.stringify({ h1, a1, rankHost0, lojaAmigo, h2, a2, h3, rankHost, rankAmigo, abaG, errs }, null, 0)); await b.close(); })();
