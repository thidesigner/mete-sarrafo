const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const AQUI = __dirname;
// Uso: na raiz do repositório, rode `python3 -m http.server 8765` e depois `node ferramentas/teste/teste-online.js`.
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 400, height: 860 } });
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(path.join(AQUI, 'vendor/three.min.js')), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));   // avisos de verdade não atrapalham o teste
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(path.join(AQUI, 'mockpeer.js')), contentType: 'application/javascript' }));
  const errs = [];
  const host = await ctx.newPage(); host.on('pageerror', e => errs.push('host: ' + e.message));
  await host.goto('http://localhost:8765/teste/'); { const ab = await host.$('#abertura'); if (ab) await ab.click(); }   // passa da tela de abertura
  await host.evaluate(() => { G.modo = "online"; G.banco.Andre = 10; salvar(); render(); });
  await host.click('[data-a="jogar"]'); await host.waitForTimeout(300);
  const code = await host.evaluate(() => ON.code);
  const amigo = await ctx.newPage(); amigo.on('pageerror', e => errs.push('amigo: ' + e.message));
  await amigo.goto('http://localhost:8765/teste/?sala=' + code);
  await amigo.fill('#en-nome', 'Maria'); await amigo.click('[data-a="visaoCima"]'); await amigo.click('.lb-jogar');
  await amigo.waitForTimeout(600);
  const salaHost = await host.evaluate(() => ON.sala.map(s => s.nome));
  const telaAmigo = await amigo.evaluate(() => G.tela);
  await host.screenshot({ path: path.join(AQUI, 'saida-sala.png') });
  await host.click('[data-a="comecarOnline"]'); await host.waitForTimeout(800);
  // emoji: a amiga manda 👍 e o anfitrião vê em cima dela; o anfitrião manda e a amiga vê
  await amigo.click('#a-emo [data-emo="joinha"]').catch(() => {}); await host.waitForTimeout(400);
  const emojiNoHost = await host.evaluate(() => (A.emo || []).map(e => A.P[e.i].nome + ':' + e.k));
  await host.click('#a-emo [data-emo="joinha"]').catch(() => {}); await amigo.waitForTimeout(400);
  const emojiNoAmigo = await amigo.evaluate(() => (A.emo || []).map(e => A.P[e.i].nome + ':' + e.k));
  // gesto: a amiga faz o Pulinho (grátis) e o anfitrião vê
  await amigo.click('#a-emo [data-gesto="pulinho"]').catch(() => {}); await host.waitForTimeout(400);
  const gestoNoHost = await host.evaluate(() => (A.ges || []).map(e => A.P[e.i].nome + ':' + e.k));
  const gestoNoAmigo = await amigo.evaluate(() => (A.ges || []).map(e => A.P[e.i].nome + ':' + e.k));
  // joga ~40s: responde pedidos, chuta certo às vezes, atira e corre
  const t0 = Date.now(); let rodadas = 0, viuAmigoCorrer = false, amigoTiro = false;
  const passo = async (pg, nome) => {
    if (await pg.$('#ov-go')) { await pg.fill('#ov-pal', 'BOLA'); await pg.dispatchEvent('#ov-pal', 'change'); await pg.click('[data-tema="Objetos"]'); await pg.click('[data-letra="B"]'); await pg.click('#ov-go'); return; }
    if (await pg.$('#ov-usar')) { await pg.click('#ov-usar'); return; }
    if (await pg.$('#ov-nao') && !(await pg.$('#ov-usar'))) { await pg.click('#ov-nao'); return; }
    if (await pg.$('#v-sim')) { await pg.click('#v-sim'); return; }
    const chute = await pg.$('#a-chute:not([disabled])');
    if (chute) { await pg.fill('#a-chute', Math.random() < .5 ? 'BOLA' : 'TESTE'); await pg.click('#a-guess button'); return; }
    const st = await pg.evaluate(() => { const me = A.P[ON.myIdx]; return { ctrl: me && me.ctrl, atir: A.ph && A.ph.k === 'bola' && A.ph.atir === me }; });
    const box = await (await pg.$(nome === 'host' ? '#a-3d' : '#a-canvas')).boundingBox().catch(() => null);
    if (st.atir && box) { await pg.mouse.click(box.x + box.width * Math.random(), box.y + box.height * Math.random()); if (nome === 'amigo') amigoTiro = true; }
    if (st.ctrl && box && nome === 'amigo') { viuAmigoCorrer = true; await pg.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await pg.mouse.down(); await pg.mouse.move(box.x + box.width * .5, box.y + box.height * .95, { steps: 4 }); await pg.waitForTimeout(500); await pg.mouse.up(); }
    if (st.ctrl && nome === 'host') { await pg.keyboard.down('w'); await pg.waitForTimeout(400); await pg.keyboard.up('w'); }
  };
  let amigoShot = false;
  while (Date.now() - t0 < 45000) {
    await passo(host, 'host'); await passo(amigo, 'amigo');
    if (!amigoShot && await amigo.evaluate(() => A.ph && A.ph.k === 'bola')) { amigoShot = true; await amigo.waitForTimeout(400); await amigo.screenshot({ path: path.join(AQUI, 'saida-amigo.png') }); }
    if (await host.evaluate(() => !!A.fim)) break;
    await host.waitForTimeout(250);
  }
  const resumo = await host.evaluate(() => ({ t: A.t, st: { palavras: A.st.palavras, acertos: A.st.acertos, erros: A.st.erros, arremessos: A.st.arremessos, acertosBola: A.st.acertosBola, rodadas: A.st.rodadas }, maria: (() => { const m = A.P.find(p => p.nome === 'Maria'); return m && { vidas: m.vidas, remoto: m.remoto, x: Math.round(m.x), y: Math.round(m.y) }; })(), fim: !!A.fim }));
  const cliente = await amigo.evaluate(() => ({ on: ON.on, me: A.P[ON.myIdx] && A.P[ON.myIdx].nome, fase: A.ph && A.ph.k, ok: !!A.ph }));
  console.log(JSON.stringify({ code, salaHost, telaAmigo, resumo, cliente, viuAmigoCorrer, amigoTiro, emojiNoHost, emojiNoAmigo, gestoNoHost, gestoNoAmigo, errs: errs.slice(0, 8) }));
  await b.close();
})();
