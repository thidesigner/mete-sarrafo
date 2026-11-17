// Poderes do ADM na Praça: super velocidade, gigante, teleporte e rastro de brilho (o amigo vê gigante e brilho).
// Uso: na raiz do repositório, rode `python3 -m http.server 8767` e depois `node ferramentas/teste/teste-poderes.js <pasta-para-fotos>`.
const { chromium } = require('playwright'); const fs = require('fs'); const T = '/home/user/mete-sarrafo/ferramentas/teste/';
(async () => { const S = process.argv[2]; const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await ctx.route('**/peerjs.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'mockpeer.js'), contentType: 'application/javascript' }));
  await ctx.route('**/three.min.js', r => r.fulfill({ body: fs.readFileSync(T + 'vendor/three.min.js'), contentType: 'application/javascript' }));
  await ctx.route(u => u.pathname.endsWith('/avisos.json'), r => r.fulfill({ contentType: 'application/json', body: '{"avisos":[]}' }));
  const errs = [], abrir = async (nome, adm) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(nome + ': ' + e.message));
    await pg.goto('http://localhost:8767/teste/'); { const ab = await pg.$('#abertura'); if (ab) await ab.click(); }
    await pg.evaluate(([n, v]) => { G.perfil = n; G.banco[n] = 100; G.inv = G.inv || {}; G.inv[n] = G.inv[n] || { vidas: 0 }; G.historias = { vistas: historiasAgora().map(h => h.id) }; if (v) { ajustesAbertos = true; ADM.aba = "moedas"; ir("adm"); } else ir("lobby"); salvar(); }, [nome, adm]); await pg.waitForTimeout(300); return pg; };
  const a = await abrir("Andre", true);
  await a.click('[data-a="admAba"]:has-text("Poderes")'); await a.waitForTimeout(200);
  for (const k of ["voar", "veloz", "gigante", "teleporte", "brilho"]) { await a.click(`[data-a="admPoder"][data-k="${k}"]`); await a.waitForTimeout(150); }
  await a.screenshot({ path: S + '/pod-adm.png', fullPage: true });
  const liberados = await a.evaluate(() => PODERES.map(x => x.k + ":" + temPoder(x.k, "Andre")));
  await a.evaluate(() => ir("lobby")); await a.waitForTimeout(200); await a.click('[data-a="praca"]'); await a.waitForTimeout(1500);
  const m = await abrir("Maria", false); await m.click('[data-a="praca"]'); await m.waitForTimeout(1500);
  const botoesA = await a.$$eval('#pr-poderes [data-pod]', l => l.map(x => x.dataset.pod)), botoesM = await m.$$eval('#pr-poderes [data-pod]', l => l.map(x => x.dataset.pod));
  // velocidade
  const andar = async () => { const z0 = await a.evaluate(() => PRACA.eu.z); await a.keyboard.down('w'); await a.waitForTimeout(400); await a.keyboard.up('w'); return +(z0 - await a.evaluate(() => PRACA.eu.z)).toFixed(2); };
  await a.evaluate(() => { PRACA.eu.x = 6; PRACA.eu.z = 14; PRACA.yaw = 0; }); const normal = await andar();
  await a.click('#pr-p-veloz', { force: true }); await a.evaluate(() => { PRACA.eu.x = 6; PRACA.eu.z = 14; }); const rapido = await andar();
  await a.click('#pr-p-veloz', { force: true });
  // gigante + brilho
  await a.click('#pr-p-gigante', { force: true }); await a.click('#pr-p-brilho', { force: true }); await a.waitForTimeout(800);
  await a.evaluate(() => { PRACA.eu.x = 0; PRACA.eu.z = 10; PRACA.yaw = 0; PRACA.alt = .4; }); await a.keyboard.down('a'); await a.waitForTimeout(600); await a.keyboard.up('a');
  await a.screenshot({ path: S + '/pod-gigante.png' });
  const escA = await a.evaluate(() => +PRACA.eu.esc.toFixed(2)), faiscas = await a.evaluate(() => PRACA.faiscas.length);
  await a.keyboard.down('d'); await m.evaluate(() => { PRACA.eu.x = 0; PRACA.eu.z = 18; PRACA.yaw = 0; PRACA.alt = .3; }); await m.waitForTimeout(1500); await a.keyboard.up('d');
  const mVe = await m.evaluate(() => [...PRACA.outros.values()].map(o => ({ esc: +(o.esc || 1).toFixed(2), e: o.alvo && o.alvo.e })));
  const mFaiscas = await m.evaluate(() => (PRACA.faiscas || []).length);
  await m.screenshot({ path: S + '/pod-amigo.png' });
  // teleporte
  await a.click('#pr-p-teleporte', { force: true }); await a.waitForTimeout(400); await a.screenshot({ path: S + '/pod-tele.png' });
  const opcoes = await a.$$eval('#pr-painel [data-a="pracaTele"]', l => l.map(x => x.textContent.trim()));
  const ip = opcoes.findIndex(t => /Partida|porta/i.test(t));
  await a.click(`#pr-painel [data-a="pracaTele"][data-i="${ip < 0 ? 0 : ip}"]`); await a.waitForTimeout(500);
  const depoisTele = await a.evaluate(() => ({ x: +PRACA.eu.x.toFixed(1), z: +PRACA.eu.z.toFixed(1), painel: !!PRACA.painel, acao: $("pr-acao").hidden ? null : $("pr-acao").textContent }));
  console.log(JSON.stringify({ liberados, botoesA, botoesM, normal, rapido, escA, faiscas, mVe, mFaiscas, opcoes, depoisTele, errs })); await b.close(); })();
