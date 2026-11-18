// Ranking online: dois celulares que nunca se encontraram aparecem um na classificação do outro (banco imitado, com as regras de só aumentar).
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-ranking-online.js`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
const URL_FALSA = "https://jogo-teste-default-rtdb.firebaseio.com";
(async () => { const b = await chromium.launch(); const banco = {}; const errs = [];
  const novo = async (nome, v, t) => { const ctx = await b.newContext();   // cada um no seu "celular" (sem nada em comum)
    await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
    await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
    await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
    await ctx.route('http://localhost:8767/teste/', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('const RANK_ONLINE = "";', `const RANK_ONLINE = "${URL_FALSA}";`) }); });
    await ctx.route(URL_FALSA + '/**', async r => { const q = r.request(), u = new URL(q.url()), path = u.pathname.replace(/\.json$/, '');
      if (q.method() === 'GET' && path === '/rank') return r.fulfill({ contentType: 'application/json', body: JSON.stringify(banco) });
      if (q.method() === 'PUT' && path.startsWith('/rank/')) { const k = path.slice(6), d = JSON.parse(q.postData()), old = banco[k] || {};
        const ok = ['v', 'g', 't', 'b'].every(c => d[c] >= (old[c] || 0)) && d.n && d.n.length <= 20;   // regra: só aumenta
        if (!ok) return r.fulfill({ status: 401, body: '{"error":"Permission denied"}' }); banco[k] = d; return r.fulfill({ contentType: 'application/json', body: JSON.stringify(d) }); }
      r.fulfill({ status: 404, body: 'null' }); });
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(([n, v, t]) => { G.perfil = n; G.banco = { [n]: 50 }; G.inv = { [n]: { vidas: 0 } }; G.nomes = [n]; G.evRank = { sem: "sempre", j: { [n]: { g: 0, t, v, b: 0 } } }; salvar(); }, [nome, v, t]);
    return pg; };
  const a = await novo("Andre", 7, 600), j = await novo("Joana", 3, 900);
  await a.evaluate(() => rankOnlineSincronizar()); await j.evaluate(() => rankOnlineSincronizar()); await a.evaluate(() => rankOnlineSincronizar());
  const vA = await a.evaluate(() => ({ ligado: rankOnlineLigado(), vitorias: listaPlaca("v").map(e => e.n + ":" + e.v) }));
  const vJ = await j.evaluate(() => listaPlaca("v").map(e => e.n + ":" + e.v));
  // alguém tenta diminuir as vitórias do Andre: o banco recusa
  const trapaca = await j.evaluate(async () => (await fetch(RANK_ONLINE + "/rank/andre.json", { method: "PUT", body: JSON.stringify({ n: "Andre", g: 0, t: 0, v: 0, b: 0, m: 0, em: 1 }) })).status);
  console.log(JSON.stringify({ banco: Object.keys(banco), vA, vJ, trapaca, errs })); await b.close(); })();
