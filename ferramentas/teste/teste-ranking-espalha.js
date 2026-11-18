// Classificação espalhando sem servidor: passa entre amigos online, nas salas normais e nas salas de Esportes (além da Praça).
// Uso: na raiz do repositório, rode `python3 -m http.server 8765` e depois `node ferramentas/teste/teste-ranking-espalha.js`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 400, height: 860 } });
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  const errs = [];
  const abre = async (pref, nome, v) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(pref + e.message));
    await pg.addInitScript(p => { for (const m of ['getItem', 'setItem', 'removeItem']) { const o = Storage.prototype[m]; Storage.prototype[m] = function (k, ...r) { return o.call(this, p + k, ...r); }; } }, pref);
    await pg.goto('http://localhost:8765/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(([n, v]) => { G.perfil = n; G.nomes = [n]; G.banco = { [n]: 10 }; G.evRank = { sem: "sempre", j: { [n]: { g: 0, t: 100, v, b: 0 } } }; salvar(); render(); }, [nome, v]); await pg.waitForTimeout(700); return pg; };
  const nomes = pg => pg.evaluate(() => Object.keys(rankAtual().j).sort().join(","));
  const r = {};
  // 1) amigos online
  const A = await abre('A:', 'Andre', 5), B = await abre('B:', 'Leo', 2);
  const cA = await A.evaluate(() => meuCodigoAmigo()), cB = await B.evaluate(() => meuCodigoAmigo());
  await A.evaluate(c => { guardarAmigo(c, "Leo"); }, cB); await B.evaluate(c => { guardarAmigo(c, "Andre"); }, cA);
  await A.evaluate(() => verQuemEstaOnline()); await A.waitForTimeout(1200);
  r.amigos = { A: await nomes(A), B: await nomes(B) };
  // 2) sala normal do Jogo de Pergunta (não é a do evento)
  const C = await abre('C:', 'Bia', 4), D = await abre('D:', 'Caio', 1);
  await C.evaluate(() => { G.modo = "online"; salvar(); criarSala(false); }); await C.waitForTimeout(900); const code = await C.evaluate(() => ON.code);
  await D.evaluate(c => entrarSala(c, "Caio"), code); await D.waitForTimeout(1500);
  r.sala = { C: await nomes(C), D: await nomes(D) };
  // 3) sala de Esportes
  const E = await abre('E:', 'Duda', 3), F = await abre('F:', 'Gabi', 6);
  await E.evaluate(() => { ir("esportes"); acoes.espCriarSala(); }); await E.waitForTimeout(900); const ce = await E.evaluate(() => espOnline.code);
  await F.evaluate(c => { ir("esportes"); espEntrarSala(c); }, ce); await F.waitForTimeout(1500);
  r.esportes = { E: await nomes(E), F: await nomes(F) };
  // e passa adiante: Leo (que só conhece Andre) encontra a Bia numa sala e leva o Andre junto
  await B.evaluate(c => entrarSala(c, "Leo"), code); await B.waitForTimeout(1500);
  r.passaAdiante = { Bia: await nomes(C) };
  console.log(JSON.stringify({ r, errs })); await b.close(); })();
