// Teste dos Amigos: dois celulares (Andre e Leo) com conexão imitada.
// Uso: na raiz do repositório, rode `python3 -m http.server 8765` e depois `node ferramentas/teste/teste-amigos.js`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => {
  const S = __dirname;
  const b = await chromium.launch({ args: ['--use-gl=swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 400, height: 860 } });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ body: '', contentType: 'application/javascript' }));
  const errs = [];
  const abre = async (pref, nome) => {
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(pref + e.message));
    await pg.addInitScript(p => { for (const m of ['getItem', 'setItem', 'removeItem']) { const o = Storage.prototype[m]; Storage.prototype[m] = function (k, ...r) { return o.call(this, p + k, ...r); }; } }, pref);
    await pg.goto('http://localhost:8765/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); } await pg.evaluate(n => { G.perfil = n; salvar(); render(); }, nome); await pg.waitForTimeout(600);
    return pg;
  };
  const A = await abre('A:', 'Andre'); let B = await abre('B:', 'Leo');
  const codA = await A.evaluate(() => meuCodigoAmigo()), codB = await B.evaluate(() => meuCodigoAmigo());
  await B.click('[data-a="amigos"]'); await B.fill('#am-cod', codA); await B.click('#am-cod + button'); await B.waitForTimeout(900);
  const pedidoEmA = await A.evaluate(() => (G.amigoPedidos || []).map(p => p.nome));
  await A.click('[data-a="amigos"]'); await A.waitForTimeout(300);
  await A.screenshot({ path: S + '/saida-am-pedido.png' });
  await A.click('[data-a="aceitarAmigo"]'); await A.waitForTimeout(900);
  const amigosA = await A.evaluate(() => G.amigos.map(a => a.nome)), amigosB = await B.evaluate(() => G.amigos.map(a => a.nome));
  await A.click('[data-a="atualizarAmigos"]'); await A.waitForTimeout(900);
  // chat de frases prontas: Andre manda "Bora jogar?" e 👍, Leo responde "Já vou!"
  await A.click('[data-a="abrirConversa"]'); await A.waitForTimeout(300);
  await A.click('[data-a="mandarFrase"][data-f="1"]'); await A.waitForTimeout(1000);
  await A.click('[data-a="mandarEmojiChat"][data-e="joinha"]'); await A.waitForTimeout(1000);
  const chatEmB = await B.evaluate(() => conversa(G.amigos[0].codigo).map(textoMsg));
  const avisoB = await B.evaluate(() => document.getElementById('toast').textContent);
  await B.evaluate(() => abrirConversa(G.amigos[0].codigo)); await B.waitForTimeout(300);
  await B.click('[data-a="mandarFrase"][data-f="3"]'); await B.waitForTimeout(1000);
  const chatEmA = await A.evaluate(() => conversa(G.amigos[0].codigo).map(m => (m.ele ? 'Leo: ' : 'eu: ') + textoMsg(m)));
  await A.evaluate(() => window.scrollTo(0, 0)); await A.screenshot({ path: S + '/saida-am-chat.png', fullPage: true });
  // Leo fecha o jogo; Andre manda "Revanche?" (fica esperando); Leo abre de novo e recebe
  await B.close(); await A.waitForTimeout(300);
  await A.click('[data-a="mandarFrase"][data-f="8"]'); await A.waitForTimeout(9000);
  const esperando = await A.evaluate(() => conversa(G.amigos[0].codigo).filter(m => m.pendente).map(textoMsg));
  B = await abre('B:', 'Leo'); await B.waitForTimeout(1500);
  await A.evaluate(() => verQuemEstaOnline()); await A.waitForTimeout(2500);
  const entregue = await B.evaluate(() => conversa(G.amigos[0].codigo).slice(-1).map(textoMsg)[0]);
  await A.evaluate(() => ir('amigos')); await A.waitForTimeout(300);
  await A.screenshot({ path: S + '/saida-am-lista.png' });
  // Andre chama o Leo: abre a sala e manda o convite
  await A.click('[data-a="chamarAmigo"]'); await A.waitForTimeout(1500);
  const telaA = await A.evaluate(() => [G.tela, ON.code]);
  const convite = await B.evaluate(() => { const e = document.getElementById('convite-amigo'); return e && !e.hidden ? e.textContent : null; });
  await B.screenshot({ path: S + '/saida-am-convite.png' });
  await B.click('#cv-sim'); await B.waitForTimeout(1200);
  const salaA = await A.evaluate(() => ON.sala.map(s => s.nome + ':' + s.codigo));
  const telaB = await B.evaluate(() => G.tela);
  await A.screenshot({ path: S + '/saida-am-sala.png' });
  console.log({ codA, codB, pedidoEmA, amigosA, amigosB, chatEmB, avisoB, chatEmA, esperando, entregue, telaA, convite, salaA, telaB, errs });
  await b.close();
})();
