// Coleção Tempestade (Raio, Furacão e Tempestade): troca automática no domingo (campo "de"), loja, skins, pets e o relâmpago do Raio contra o Furacão.
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-tempestade.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const mk = async (quando) => { const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
    await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
    await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
    await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
    if (quando) await ctx.addInitScript(q => { const d = Date.parse(q) - Date.now(); const n = Date.now; Date.now = () => n() + d; }, quando);
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(() => { G.perfil = "Andre"; G.banco.Andre = 9000; salvar(); ir("lobby"); }); await pg.waitForTimeout(500); return { pg, errs }; };
  // hoje (sexta): Tempestade ainda não aparece
  const H = await mk(null);
  const hoje = await H.pg.evaluate(() => ({ boss: bossDaLoja(), tempestade: naVenda(SKINS.find(s => s.k === "tempestade")), sol: naVenda(SKINS.find(s => s.k === "sol")), pacotes: PACOTES.filter(p => pacoteInfo("Andre", p.id).aVenda).map(p => p.id) }));
  // domingo
  const D = await mk("2026-11-15T10:00:00-03:00"), pg = D.pg;
  const dom = await pg.evaluate(() => ({ boss: bossDaLoja(), tempestade: naVenda(SKINS.find(s => s.k === "tempestade")), sol: naVenda(SKINS.find(s => s.k === "sol")), pacotes: PACOTES.filter(p => pacoteInfo("Andre", p.id).aVenda).map(p => p.id) }));
  await pg.evaluate(() => { G.lojaAba = "destaques"; ir("loja"); }); await pg.waitForTimeout(400);
  for (const id of ["raio", "furacao", "tempestade"]) { const el = await pg.$(`.pacote-${id}`); await el.scrollIntoViewIfNeeded(); await pg.waitForTimeout(150); await el.screenshot({ path: S + `/tp-pacote-${id}.png` }); await pg.click(`.pacote-${id} [data-a="comprarPacote"]`); const c2 = await pg.$(`.pacote-${id} [data-a="comprarPacote"]`); if (c2) await c2.click(); await pg.waitForTimeout(150); }
  const tem = await pg.evaluate(() => ({ skins: ["raio", "furacao", "tempestade"].map(k => temSkin("Andre", k)), pets: G.inv.Andre.pets }));
  for (const k of ["raio", "furacao", "tempestade"]) { await pg.evaluate(k => { usarSkin("Andre", k); G.fundo = k; G.inv.Andre.pet = { raio: "gatoraio", furacao: "coelhovento", tempestade: "caotempestade" }[k]; G.inv.Andre.arremesso = k; salvar(); ir("lobby"); }, k); await pg.waitForTimeout(900); await pg.screenshot({ path: S + `/tp-lobby-${k}.png`, clip: { x: 0, y: 280, width: 390, height: 360 } }); }
  await pg.evaluate(() => { G.lojaAba = "gestos"; ir("loja"); }); await pg.waitForTimeout(300);
  for (const k of ["raio", "furacao", "tempestade"]) { const ge = await pg.$(`canvas.ge-prev[data-g="${k}"]`); if (ge) { await ge.scrollIntoViewIfNeeded(); await pg.waitForTimeout(700); await ge.screenshot({ path: S + `/tp-gesto-${k}.png` }); } }
  // partida: robôs Raio x Furacão (efeito) e 3D
  await pg.evaluate(() => { usarSkin("Andre", "raio"); G.nomes = ["Andre"]; G.modo = "cima"; salvar(); ir("lobby"); });
  await pg.click('[data-a="jogar"]'); await pg.click('#as-mais'); await pg.click('#as-start'); await pg.waitForTimeout(400);
  const choque = await pg.evaluate(() => { fecharOv(); A.ov = true; const eu = A.P.find(p => p.humano), alvo = A.P.find(p => !p.humano); vestir(alvo, "furacao"); A.P.filter(p => !p.humano && p !== alvo)[0] && vestir(A.P.filter(p => !p.humano && p !== alvo)[0], "tempestade");
    A.ph = { k: "bola", atir: eu, cd: 9, atingidos: new Set(), pronto: true, t0: A.t }; A.fx.push({ x: alvo.x, y: alvo.y, txt: "-1", t: 0, cor: "#ff4d6d" }); return trovaoNaBolada({ x: alvo.x, y: alvo.y }); });
  await pg.waitForTimeout(250); await (await pg.$('#a-game .stage-wrap')).screenshot({ path: S + '/tp-choque.png' });
  console.log(JSON.stringify({ hoje, dom, tem, choque, errs: [...H.errs, ...D.errs] })); await b.close(); })();
