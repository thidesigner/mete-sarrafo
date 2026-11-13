# Jogos do Andre

Ambiente onde o Andre (uma criança) cria e testa jogos com a ajuda do pai e do Claude.
O primeiro jogo é o **Jogo de Pergunta** (antes chamado Mete Sarrafo): forca misturada com queimada.
O nome mudou só no que o jogador vê. Endereço do site, nome do repositório, arquivos, sala online (`metesarrafo-v1-`) e dados guardados (`ms-festa`) continuam com o nome antigo de propósito, para nada quebrar.
Este repositório é a fonte única: sessões do Claude Code na nuvem e no desktop trabalham aqui.

## Como conversar

- Responda em português do Brasil, com linguagem simples. Quem pede pode ser o Andre ou o pai.
- As ideias são do Andre: ajude a pensar e a testar, sem trocar a ideia dele pela sua. Antes de mudar uma regra do jogo, confirme.
- Moedas são só do jogo. Nunca crie compra com dinheiro de verdade.

## Privacidade (o repositório é público)

Qualquer pessoa pode ler tudo o que estiver aqui, inclusive o histórico. Por isso:

- Nunca coloque nome completo, sobrenome, escola, endereço, telefone, e-mail ou fotos do Andre, dos amigos ou da família. Nos textos, use só o primeiro nome ou apelido.
- Ao salvar sugestões em `sugestoes/`, guarde só o primeiro nome ou apelido de quem sugeriu.
- Nunca coloque senhas, chaves, tokens ou links privados. Do Formulário Google, use só o link de **responder** (nunca o de editar o formulário nem o da planilha).
- Se algo assim já tiver sido enviado, avise o pai: apagar o arquivo não basta, porque continua no histórico.

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | **Versão oficial**, a que os amigos jogam (gerada, não edite à mão) |
| `teste/index.html` | **Versão de teste**, com a faixa "VERSÃO DE TESTE" (gerada) |
| `fonte/jogo.html` | Código do jogo (mesma página do artefato "Mete Sarrafo: Modo Festa" no Claude) |
| `fonte/online.js` | Modo online: cada um no seu celular, via PeerJS (só no site, não funciona dentro do Claude) |
| `fonte/oficina-3d.html` | Código do artefato "Oficina 3D do Andre" (fluxo da impressão, checklist, diário e correções) |
| `fonte/central-de-eventos.html` | Código do artefato "Central de Eventos" (publica eventos sem abrir o GitHub) |
| `fonte/caderno-de-ideias.html` | Código do artefato "Ideias do Jogo do Andre" (caderno + simulação) |
| `ferramentas/montar.py` | Gera a versão de teste e promove para a oficial |
| `ferramentas/teste/` | Teste automático do modo online (dois navegadores com conexão imitada) |
| `ferramentas/blender/` | Script que prepara o personagem baixado do jogo para a impressora 3D |
| `ideias/` | Regras combinadas e dúvidas em aberto de cada jogo |
| `sugestoes/` | Sugestões dos amigos (coladas ou lidas do formulário) |
| `materiais/` | Coisas para imprimir, como o convite com o QR code da Sala do Andre |

## Fluxo de trabalho

1. Comece com `git pull` (o desktop e a nuvem mexem no mesmo repositório).
2. Edite `fonte/jogo.html` e/ou `fonte/online.js`.
3. `python3 ferramentas/montar.py` gera `teste/index.html`.
4. Teste (abaixo), faça commit e push. Em ~1 minuto a versão de teste está no ar.
5. Só promova para a oficial quando o pai ou o Andre pedirem: `python3 ferramentas/montar.py --oficial`, commit e push.
6. Ao terminar, registre em `ideias/` o que mudou nas regras.

Sites (GitHub Pages, branch `main`, pasta raiz):
- Oficial: https://thidesigner.github.io/mete-sarrafo/
- Teste: https://thidesigner.github.io/mete-sarrafo/teste/

## Sala do Andre

O modo online tem uma sala de código fixo, `ANDREK7Q` (`SALA_DO_ANDRE` em `fonte/online.js`). O QR do convite impresso (`materiais/convite-sala-do-andre.pdf`) aponta para `teste/?sala=ANDREK7Q`. Não troque esse código sem refazer o convite. No celular com o perfil "Andre", criar sala usa esse código automaticamente.
O Andre não precisa estar: quem entra pelo QR e acha a sala fechada abre a sala no próprio celular e comanda a partida; quem chega depois (inclusive o Andre) entra nela.

## Amigos (só no site)

Botão "Amigos" na tela inicial (código em `fonte/online.js`, bloco "Amigos").
- Cada aparelho tem um código de amigo de 6 letras e números (`G.amigoCodigo`). Enquanto o site está aberto, o aparelho fica ligado no PeerJS como `metesarrafo-v1-amigo-<código>`: é assim que se vê quem está online.
- Adicionar: digitar o código do amigo, abrir o link/QR `?amigo=<código>` ou tocar em "+ amigo" na sala. Se o amigo estiver online, ele recebe um pedido para aceitar.
- "Chamar": abre a sala (se ainda não estiver aberta) e manda um convite; o amigo vê "Fulano te chamou para jogar!" e entra com um toque. Convite só vale de quem já é amigo.
- Guarda só apelido e código (`G.amigos`, `G.amigoPedidos`). Não há servidor nem lista pública: ninguém acha ninguém sem ter o código.
- Chat dos amigos: **só frases prontas e emojis** (escolha do pai, porque não há moderador). Pela rede vai só o número da frase (`FRASES`) ou a chave do emoji; frases novas entram **só no fim** da lista. Mensagens ficam em `G.chat` nos dois aparelhos; se o amigo está fora, ficam "esperando" e são entregues quando os dois estiverem online. Não troque por texto livre sem o pai pedir.
- Foto de perfil: só ícone (`AV_ICONES`) e cor (`AV_CORES`), guardados em `G.inv[nome].avatar` e enviados aos amigos como `av`. **Não aceite foto de verdade** (câmera ou galeria): é jogo de crianças e a foto iria para outros aparelhos.
- Teste: `ferramentas/teste/teste-amigos.js`.

## Personagens e impressão 3D

Botão "Criar" na tela inicial: editor de personagens (arrastar peças). Cada personagem é uma "ficha" JSON (`tipo: "personagem-jogos-do-andre"`, `versao: 1`) guardada em `G.personagens`. Ela viaja no modo online e é limpa por `limparFicha`.
- Desenho: `desenharPersonagem2D` e `construirPersonagem3D` em `fonte/jogo.html`. Peça nova: entra em `PECAS` com um encaixe e ganha desenho nas duas funções.
- Dentro do Claude (Modo Festa) os personagens ficam no banco `personagens` (doc = id da ficha, com `em`; apagado vira `{apagado:true}`) e sincronizam entre aparelhos. No site ficam só no aparelho.
- A aba "Imprimir 3D" fica **escondida** para as crianças (teste interno do pai). Só aparece se ligar nos Ajustes trancados ("Mostrar a aba Imprimir 3D", `G.imprimir3d`, vale só naquele aparelho). O trabalho de impressão vai seguir num repositório separado; aqui o jogo só cria e guarda os personagens.
- Downloads (no site direto; no Claude pela capacidade `downloads`, com STL e GLB dentro de um .zip): STL para a impressora (`fichaParaSTL`), GLB colorido para o Blender (`fichaParaGLB`) e a ficha JSON.
- `ferramentas/blender/personagem_para_stl.py`: GLB → peça única fechada, em pé, na altura em mm.
- Plano, cuidados (venda, Inmetro, segurança, LGPD) e dúvidas: `ideias/personagens-e-impressao-3d.md`. Venda de bonecos é sempre fora do jogo, entre adultos.

## Times

`TIMES`, `mesmoTime`, `sortearTimes` em `fonte/jogo.html`. Cada jogador tem `time` (índice) ou `null`. Bonequinhos: `A.setup.time` e `A.times`; online: `ON.time` (vai no `start` como `times` e no `P` estático); bola de verdade: `G.timeTam` e `G.comTimes`. Regras: o time de quem pergunta fica fora da `ordem`, o time de quem atira não corre nem leva bolada (`aCorrendo`), e ganha o time que sobrar.

## Ajustes trancados

Os Ajustes do jogo (engrenagem na tela inicial) pedem um código de 5 números que só o pai sabe.
- Nunca escreva esse código em arquivos, commits, testes guardados aqui ou respostas que fiquem no repositório. No código fica só a "impressão digital" (`PIN_PADRAO`, PBKDF2-SHA256 com o sal `mete-sarrafo-ajustes` e 100 000 voltas).
- Para trocar o código padrão, gere a nova impressão fora do repositório e substitua `PIN_PADRAO`. Dentro do jogo, quem sabe o código pode trocá-lo só naquele aparelho ("Trocar o código").

## Painel de ADM (só o pai)

Abre com **5 toques rápidos no título "Jogo de Pergunta"** da tela inicial e depois o mesmo código dos Ajustes (`pinDestino = "adm"`). A tela do código diz só "Código", para não chamar atenção.
- Edições limitadas: skins com `limitada: true, ate` em `SKINS`, emojis e gestos do mesmo jeito em `EMOJIS` e `GESTOS`, fotos de perfil especiais em `AV_ESPECIAIS`, arremessos em `ARREMESSOS` e fundos em `FUNDOS_LIM` (mais `FUNDOS`/`PRECO_FUNDO`). Depois do prazo somem da loja para quem não tem.
- Abas: Moedas (dar/tirar/definir), Itens (dar ou tirar skins, fundos, emojis, gestos e vidas extras de qualquer jogador do aparelho), Limitadas (todos os itens limitados: prazo +1/+7 dias, encerrar, preço; fica em `G.admLim` com a chave `tipo-k`, por exemplo `emoji-galactico`, e vale só naquele aparelho) e Números (vitórias, moedas, palavras mais usadas, skins mais compradas, últimas partidas de `G.historico`).
- Arremessos (aparência do que se joga): `ARREMESSOS`, escolhido em `G.inv[nome].arremesso`; cada bola leva a chave `k` (vai no estado online, índice 6 de `B`).
- Selo de colecionador e Cantinho Secreto: `nivelSelo` (conta os limitados que o jogador tem; 1 bronze, 5 prata, 10 ouro), `p.selo` na partida e no online, `cantinhoHTML` na loja. Itens com `secreto: true` (em `SKINS`, `EMOJIS`, `ARREMESSOS`) só aparecem e só podem ser comprados no Cantinho.
- Presente diário e Missões (botão "Missões", `TELAS.missoes`): `G.diario[nome] = {ultimo, seq}` com `PRESENTE_DIAS`; `G.missoes = {dia, por: {nome: {jogar, vencer, moedas, emojis, gestos, pegou}}}`, missões de `MISSOES_POOL` sorteadas pela data em `missoesDoDia`. Contam em `fimDePartidaMissao` (fim de `terminarA`, `terminar` e no cliente online) e nos cliques de emoji e gesto. Contagem regressiva das limitadas: `contagemFaixa`.
- Pets: `PETS` (com `poder` e o número do poder em `acerto`, `sobreviver`, `fim` ou `vel`), guardados em `G.inv[nome].pets` e o escolhido em `G.inv[nome].pet`; `p.pet` na partida e no online (`hello`, `P` estático). Poderes em `poderPet` (moedas) e no começo da partida (`vel`). Desenho: `desenharPet2D` e `pet3D`, que recebem a skin de quem usa: `visualPet` escolhe o tema (`PET_TEMA` do próprio pet, senão `SKIN_TEMA` da skin) ou um enfeite (`SKIN_ENFEITE`). Skin nova com tema ou enfeite: acrescente nesses mapas. Ovo surpresa: `chocarOvo` (`PRECO_OVO`, só pets normais: sem `limitada` nem `heroi`). Pets heróis têm fantasia em `PET_TRAJE`; bichos novos precisam de desenho próprio nas duas funções e cores em `CORES_PET`.
- Skins Neon: entradas em `SKINS` com `variante: true`, `base` (a skin original) e `neon`/`neon2` (cor da luz). São uma compra extra (`preco`) no quadro da skin original: só para quem tem a `base` e enquanto a `base` estiver à venda (checado em `acoes.comprarSkin`). Depois de comprada aparece "✨ Usar Neon". Enfeites, efeitos e pets usam `skinBase(k)`; o contorno de luz é desenhado em `desenharBoneco2` e no 3D (cascas brilhando em cada parte).
- Skins de código: `codigo: true` em `SKINS` (ex.: `cristal`). Não aparecem na loja para quem não tem, `acoes.comprarSkin` recusa, os robôs não usam; só chegam por código de presente ou presente para todos (aparecem em `opcoesPremio` e na lista `PREMIOS` da Central).
- Loja em abas: `ABAS_LOJA`, `G.lojaAba`, cada parte num `.loja-sec[data-sec]`; Destaques junta as limitadas por coleção (`limitadasDestaqueHTML`). Parte nova da loja: crie a aba e o bloco `loja-sec`.
- Tudo vale só no aparelho onde foi feito (não há servidor). Skin limitada nova ou mudança para todos: no código.
- Não descreva o toque escondido em textos para as crianças. O segredo de verdade é o código de 5 números.

## Praça Central (ideia do Andre)

Botão "Praça" na tela inicial: lugar 3D para andar com o bonequinho (`abrirPraca`, bloco "Praça Central" em `fonte/jogo.html`; fica num `div#praca` por cima do `#app`, como a arena).
- Tem 5 placas de classificação (`PRACA_PLACAS`: vitórias, tempo, bosses, gastou e moedas), barraquinhas da loja (`PRACA_BARRACAS`, mostram um pedaço da loja com `lojaSecHTML`), mural de eventos, destaques e a porta da Partida do Evento. Chegando perto aparece um botão; o painel por cima usa as mesmas ações da loja (`atualizarPainelPraca` refaz o painel depois de cada toque).
- Controles: círculo à esquerda para andar, arrastar a tela para olhar, botão de pular; no PC, WASD/setas e espaço.
- Bonequinho: `modeloBoneco3D` (o mesmo da partida) em `pracaModelo`.
- Ver os amigos (só no site, `fonte/online.js`, bloco "Praça Central"): o primeiro que entra vira o dono (PeerJS com id fixo `PRACA_ID`) e repassa as posições; se o dono sai, quem fica se reconecta e alguém vira o novo dono. Vai pela rede só apelido, skin, pet, selo, personagem, moedas, posição e a classificação. Máximo de 20 na praça.
- Classificação: `G.evRank` (semana, Partida do Evento) e `G.pracaMoedas` (moedas vistas na praça), juntadas por `mesclarRank`.
- Mini história dos eventos (ideia do Andre): quando há evento do ADM que a pessoa ainda não viu, a nave dos robôs Bip e Bop desce na praça e conta o evento com balões de fala e uma surpresa (moedas caindo, faixa da promoção, corações, caixa da coleção ou do presente, "?" do código). `historiasAgora` (falas de cada tipo), `iniciarHistoria`/`passoHistoria`/`acabarHistoria`; vistas em `G.historias.vistas` (uma vez por evento em cada aparelho). Botão "Pular" e "Ver a história de novo" no mural. Tipo de evento novo: acrescente uma história em `historiasAgora`. A história e a missão de coleção **só aparecem quando o ADM liga** (lista `historias` do `avisos.json`, `{id, tema: "eclipse"|"gelofogo", de, ate}`; aba Eventos do ADM, "🎬 História e missão", ou aba "🎬 Missão" da Central). A história combina com o tema (`HIST_TEMAS`: Bip e Bop vestem as skins; Sol, Lua e Eclipse fazem um eclipse no céu, Gelo e Fogo fazem bola de neve contra bola de fogo). Coleção nova com história própria: acrescente em `HIST_TEMAS` (cols, skins, efeito, efeitoEm, falas) e o efeito em `efeitoHistoria`/`passoHistoria`.
- Missão do evento (ideia do Andre): na história da coleção, o eclipse (ou o vapor) se quebra (`quebraEm`) e 10 fragmentos (`FRAG_POS`, 5 de cada lado) aparecem na praça. Quem pega todos vê a história final (`fimFalas`) e ganha (`premiarMissao`): moedas, um item da coleção que ainda não tem (a skin da coleção combinada primeiro) e o item só da missão (`exclusivo`, ex.: gesto `eclipsetotal`, com `missao: true`: não aparece na loja e não se compra). Estado por jogador em `G.missaoEv[nome][id] = {pegos, feito}`; configuração em `HIST_TEMAS[...].missao`; progresso no mural (`missaoMuralHTML`) e no alto da tela (`#pr-missao`).
- Teste: `ferramentas/teste/teste-praca.js`, `ferramentas/teste/teste-historia.js` e `ferramentas/teste/teste-missao.js`.

## Avisos do ADM para todo mundo

`avisos.json` na raiz do site: `{"avisos": [{"id", "texto" (até 200 letras), "de", "ate"}]}` (datas ISO). Todo jogo aberto no site (oficial e teste) lê o arquivo ao abrir e a cada minuto; aviso novo aparece uma vez numa janela "📢 Aviso do ADM" e, enquanto vale, numa faixa que corre na tela inicial. Dentro do Claude não chega.
- Quando o pai pedir "manda o aviso: …": acrescente um aviso com `id` novo (ex.: `a` + data), `de` agora e `ate` (padrão 1 dia), apague os vencidos, commit e push direto na `main`. Em ~1 minuto chega em todos.
- O pai também publica sozinho pela aba "Aviso" do Painel de ADM. Com a **chave do GitHub** guardada no celular dele (token fino, só o repositório `mete-sarrafo`, só Contents leitura e escrita), o botão "Publicar para todo mundo" grava `avisos.json` direto pela API do GitHub. A chave fica só em `localStorage["ms-adm-chave"]` daquele aparelho, fora do estado do jogo (`ms-festa`). **Nunca peça, guarde, escreva ou faça commit dessa chave.** Sem chave, a aba monta o arquivo para colar no editor do GitHub.
- Mural de eventos (`muralEventosHTML`, dentro da Praça Central): mostra o que vale agora (`eventosAgora`) e as coleções limitadas à venda (`colecoesNaLoja`). Só leitura; o número do botão Praça (`qtdEventos`) conta só os eventos do ADM. Tipo de evento novo: acrescente também em `eventosAgora`.
- Partida do Evento (só no site, em `fonte/online.js`, bloco "Partida do Evento"): sala fixa `SALA_EVENTO` (`EVENTOS1`), aberta pelo primeiro que chega. Loja dentro da partida `LOJA_EV` (mensagem `lojaEv`; o anfitrião confere em `comprarEvento` e responde `lojaOk`/`lojaNao`). Classificação da semana em `G.evRank = {sem, j: {nome: {g, t, v, b}}}` (gastou, segundos, vitórias, bosses): o anfitrião soma no fim (`mostrarFimOnline`) e manda `rank`; o `hello` e a `sala` também levam a tabela, juntada por `mesclarRank` (o maior número vale). Teste: `ferramentas/teste/teste-evento.js`.
- Boss do jogo todo (ideia do Andre): sempre que há coleção com boss na loja (`BOSSES` em `fonte/jogo.html`, escolhido por `bossDaLoja`; hoje o Rei Eclipse do Sol, Lua e Eclipse), ele aparece em toda Partida do Evento e **a vida é uma só para todo mundo** (`BOSS_VIDA_GLOBAL` = 1000). Cada aparelho guarda `G.bossG = {id, k, dano: {nome: dano}, fim, meus, premiados}` (`id` = boss + fim da coleção); o anfitrião soma o dano de cada pessoa na partida (palavra certa 25 `BOSS_PALAVRA`, bola nele 8 `BOSS_BOLA`) e manda `bossDano` (para a pessoa somar no próprio aparelho) e `bossG` (a tabela de todos); `hello`/`sala` do evento e `ola`/`rk` da Praça também levam a tabela, juntada por `mesclarBossG` (o maior número vale). Sem servidor, cada celular só sabe do dano de quem jogou junto. Quando a soma passa da vida (`checarBossGlobal`), cada perfil do aparelho que lutou (`meus`) ganha uma vez: moedas, o item só do boss (`item`, ex.: arremesso `coroaeclipse` com `boss: true`, fora da loja) e +1 em `b` (placa 👾 Bosses). Clima de batalha enquanto ele vive: chão e céu do tema (`climaBoss2D`, `climaBoss3D`), música de batalha (`tocarPassoBoss`, música "boss"), alerta antes do ataque (`B.alerta`, sirene e barra piscando) e tremor (`tremorBoss`, torcida gritando). Na hora da bola ele joga bolas do tema em quem corre (`passoBoss`, bolas com `boss: true`; o escudo segura). O boss também aparece no céu da Praça com a vida de todo mundo (`pracaBossCeu`) e no mural. Coleção nova com boss: entrada em `BOSSES`. Teste: `ferramentas/teste/teste-boss.js`.
- Só o pai pede aviso. Texto curto, para crianças, sem dados pessoais, sem links.
- Pelo chat também vale para eventos: "manda o evento: moedas em dobro até domingo", "promoção de 30% nas skins por 1 dia", "código de presente FESTA com 200 moedas" (no arquivo vai só o hash) ou "encerra a promoção". Faça igual ao aviso: edite `avisos.json`, commit e push direto na `main`.
- O mesmo arquivo também guarda os **eventos** da aba "Eventos" do ADM: `eventos` (`{id, mult: 2|3, de, ate}`, moedas multiplicadas em `ganhar`/`aGanhar`), `promos` (`{id, alvo, desc: 10|20|30|50, de, ate}`, aplicada em `aplicarPromo`) e `presentes` (`{id, h, moedas | item: "tipo:k", de, ate}`). Também: `brindes` (`{id, moedas | item, de, ate}`, presente para todos, entregue uma vez por jogador na tela inicial em `entregarBrindes`, guardado em `G.brindesRecebidos`), `voltas` (`{id, col, de, ate}`, uma coleção de `COLECOES` volta para a loja com o pacote, aplicada em `aplicarLimitadas`) e `vidas` (`{id, extra: 1|2, de, ate}`, vidas a mais no começo de cada partida, `vidaExtraEvento`) e `historias` (`{id, tema, de, ate}`, liga a história e a missão de uma coleção na Praça; `tema` é uma chave de `HIST_TEMAS`). Ao mexer no arquivo (por exemplo, "manda o aviso"), **mantenha essas chaves**. Código de presente: no arquivo vai só o hash (`hashPresente`, SHA-256 com o sal `mete-sarrafo-presente:`); **nunca escreva o texto do código no repositório**. Gravação pelo celular do pai: `gravarSite`.

## Testes

- Sintaxe: extraia os `<script>` de `teste/index.html` e rode `node --check`.
- Partida online de ponta a ponta: `ferramentas/teste/teste-online.js` (Playwright). Ele serve a raiz do repositório em `localhost:8765`, troca o PeerJS pela imitação `mockpeer.js` e precisa do three.js em `ferramentas/teste/vendor/three.min.js` (fora do git; baixe com `npm pack three@0.128.0` e copie `package/build/three.min.js`).
- Amigos (pedido, aceitar, online, convite e entrar na sala): `ferramentas/teste/teste-amigos.js`.
- Em nuvens com rede restrita, `cdnjs` pode estar bloqueado: o teste já substitui o que precisa.

## Artefatos no Claude (só abrem em sessões do claude.ai com a conta do pai)

Os endereços não ficam no repositório. Ache cada um pelo nome na lista de artefatos da conta.

- **Ideias do Jogo do Andre** (caderno de ideias): banco `ideias` (fichas com etapas, chat com o Claude e diário) e `simulacoes/mete-sarrafo` (ajustes da simulação). Código em `fonte/caderno-de-ideias.html`.
- **Mete Sarrafo: Modo Festa** (jogo dentro do Claude, sem modo online): banco `sugestoes`, `partidas`, `placar/moedas` e `personagens`. Capacidades: db, user, sample, downloads. Publicado a partir de `fonte/jogo.html`.
- **Central de Eventos** (só do pai): publica avisos, evento de moedas, promoção, código de presente e encerramentos sem abrir o GitHub. Código em `fonte/central-de-eventos.html` (o endereço da própria Central aparece como `ARTEFATO_PENDENTE`; troque só na cópia publicada). Capacidades: `mcp` com o conector "Claude Code Remote", ferramenta `create_session`, e `db` (coleção `pedidos`: histórico igual em todos os aparelhos; cada doc tem `em`, `t1`, `t2`, `acao`, `aparelho` e `status` enviado/publicado/erro, com `obs`). Cada "Publicar" abre uma sessão nova do Claude Code com `source_url` deste repositório e um prompt com as regras + `PEDIDO_JSON: {acao, …, pedido_id}`; ela grava `avisos.json`, faz commit e push na `main` (testado: cerca de 1 a 2 minutos) e, se puder, marca o status do pedido. Não use tarefa agendada (trigger) para isso: sessões de tarefa não recebem o repositório e o push dá 403. As duas tarefas antigas ficaram desligadas.
- **Oficina 3D do Andre**: banco `preparo/checklist`, `impressoes` (diário) e `pendencias` (correções e dúvidas). Capacidades: db, user. Publicado a partir de `fonte/oficina-3d.html`.

Nos arquivos de `fonte/`, o endereço do Modo Festa aparece como `https://claude.ai/artifact/PENDENTE`. Ao publicar um desses artefatos, troque só na cópia publicada, sem gravar o endereço aqui.

## Pendências

- Formulário Google para as sugestões do site chegarem numa planilha do Drive (o pai vai criar; depois ligar em `fonte/online.js` e no fim de partida).
- Dúvidas de regra em aberto: veja `ideias/mete-sarrafo.md`.
