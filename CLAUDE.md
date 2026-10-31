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
- Tudo vale só no aparelho onde foi feito (não há servidor). Skin limitada nova ou mudança para todos: no código.
- Não descreva o toque escondido em textos para as crianças. O segredo de verdade é o código de 5 números.

## Avisos do ADM para todo mundo

`avisos.json` na raiz do site: `{"avisos": [{"id", "texto" (até 200 letras), "de", "ate"}]}` (datas ISO). Todo jogo aberto no site (oficial e teste) lê o arquivo ao abrir e a cada minuto; aviso novo aparece uma vez numa janela "📢 Aviso do ADM" e, enquanto vale, numa faixa que corre na tela inicial. Dentro do Claude não chega.
- Quando o pai pedir "manda o aviso: …": acrescente um aviso com `id` novo (ex.: `a` + data), `de` agora e `ate` (padrão 1 dia), apague os vencidos, commit e push direto na `main`. Em ~1 minuto chega em todos.
- O pai também publica sozinho pela aba "Aviso" do Painel de ADM. Com a **chave do GitHub** guardada no celular dele (token fino, só o repositório `mete-sarrafo`, só Contents leitura e escrita), o botão "Publicar para todo mundo" grava `avisos.json` direto pela API do GitHub. A chave fica só em `localStorage["ms-adm-chave"]` daquele aparelho, fora do estado do jogo (`ms-festa`). **Nunca peça, guarde, escreva ou faça commit dessa chave.** Sem chave, a aba monta o arquivo para colar no editor do GitHub.
- Só o pai pede aviso. Texto curto, para crianças, sem dados pessoais, sem links.
- O mesmo arquivo também guarda os **eventos** da aba "Eventos" do ADM: `eventos` (`{id, mult: 2|3, de, ate}`, moedas multiplicadas em `ganhar`/`aGanhar`), `promos` (`{id, alvo, desc: 10|20|30|50, de, ate}`, aplicada em `aplicarPromo`) e `presentes` (`{id, h, moedas | item: "tipo:k", de, ate}`). Ao mexer no arquivo (por exemplo, "manda o aviso"), **mantenha essas chaves**. Código de presente: no arquivo vai só o hash (`hashPresente`, SHA-256 com o sal `mete-sarrafo-presente:`); **nunca escreva o texto do código no repositório**. Gravação pelo celular do pai: `gravarSite`.

## Testes

- Sintaxe: extraia os `<script>` de `teste/index.html` e rode `node --check`.
- Partida online de ponta a ponta: `ferramentas/teste/teste-online.js` (Playwright). Ele serve a raiz do repositório em `localhost:8765`, troca o PeerJS pela imitação `mockpeer.js` e precisa do three.js em `ferramentas/teste/vendor/three.min.js` (fora do git; baixe com `npm pack three@0.128.0` e copie `package/build/three.min.js`).
- Amigos (pedido, aceitar, online, convite e entrar na sala): `ferramentas/teste/teste-amigos.js`.
- Em nuvens com rede restrita, `cdnjs` pode estar bloqueado: o teste já substitui o que precisa.

## Artefatos no Claude (só abrem em sessões do claude.ai com a conta do pai)

Os endereços não ficam no repositório. Ache cada um pelo nome na lista de artefatos da conta.

- **Ideias do Jogo do Andre** (caderno de ideias): banco `ideias` (fichas com etapas, chat com o Claude e diário) e `simulacoes/mete-sarrafo` (ajustes da simulação). Código em `fonte/caderno-de-ideias.html`.
- **Mete Sarrafo: Modo Festa** (jogo dentro do Claude, sem modo online): banco `sugestoes`, `partidas`, `placar/moedas` e `personagens`. Capacidades: db, user, sample, downloads. Publicado a partir de `fonte/jogo.html`.
- **Oficina 3D do Andre**: banco `preparo/checklist`, `impressoes` (diário) e `pendencias` (correções e dúvidas). Capacidades: db, user. Publicado a partir de `fonte/oficina-3d.html`.

Nos arquivos de `fonte/`, o endereço do Modo Festa aparece como `https://claude.ai/artifact/PENDENTE`. Ao publicar um desses artefatos, troque só na cópia publicada, sem gravar o endereço aqui.

## Pendências

- Formulário Google para as sugestões do site chegarem numa planilha do Drive (o pai vai criar; depois ligar em `fonte/online.js` e no fim de partida).
- Dúvidas de regra em aberto: veja `ideias/mete-sarrafo.md`.
