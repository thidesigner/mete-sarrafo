# Jogos do Andre

Ambiente onde o Andre (uma criança) cria e testa jogos com a ajuda do pai e do Claude.
O primeiro jogo é o **Mete Sarrafo**: forca misturada com queimada.
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
| `fonte/caderno-de-ideias.html` | Código do artefato "Ideias do Jogo do Andre" (caderno + simulação) |
| `ferramentas/montar.py` | Gera a versão de teste e promove para a oficial |
| `ferramentas/teste/` | Teste automático do modo online (dois navegadores com conexão imitada) |
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

## Ajustes trancados

Os Ajustes do jogo (engrenagem na tela inicial) pedem um código de 5 números que só o pai sabe.
- Nunca escreva esse código em arquivos, commits, testes guardados aqui ou respostas que fiquem no repositório. No código fica só a "impressão digital" (`PIN_PADRAO`, PBKDF2-SHA256 com o sal `mete-sarrafo-ajustes` e 100 000 voltas).
- Para trocar o código padrão, gere a nova impressão fora do repositório e substitua `PIN_PADRAO`. Dentro do jogo, quem sabe o código pode trocá-lo só naquele aparelho ("Trocar o código").

## Testes

- Sintaxe: extraia os `<script>` de `teste/index.html` e rode `node --check`.
- Partida online de ponta a ponta: `ferramentas/teste/teste-online.js` (Playwright). Ele serve a raiz do repositório em `localhost:8765`, troca o PeerJS pela imitação `mockpeer.js` e precisa do three.js em `ferramentas/teste/vendor/three.min.js` (fora do git; baixe com `npm pack three@0.128.0` e copie `package/build/three.min.js`).
- Em nuvens com rede restrita, `cdnjs` pode estar bloqueado: o teste já substitui o que precisa.

## Artefatos no Claude (só abrem em sessões do claude.ai com a conta do pai)

Os endereços não ficam no repositório. Ache cada um pelo nome na lista de artefatos da conta.

- **Ideias do Jogo do Andre** (caderno de ideias): banco `ideias` (fichas com etapas, chat com o Claude e diário) e `simulacoes/mete-sarrafo` (ajustes da simulação). Código em `fonte/caderno-de-ideias.html`.
- **Mete Sarrafo: Modo Festa** (jogo dentro do Claude, sem modo online): banco `sugestoes`, `partidas` e `placar/moedas`. Publicado a partir de `fonte/jogo.html`.

Nos arquivos de `fonte/`, o endereço do Modo Festa aparece como `https://claude.ai/artifact/PENDENTE`. Ao publicar um desses artefatos, troque só na cópia publicada, sem gravar o endereço aqui.

## Pendências

- Formulário Google para as sugestões do site chegarem numa planilha do Drive (o pai vai criar; depois ligar em `fonte/online.js` e no fim de partida).
- Dúvidas de regra em aberto: veja `ideias/mete-sarrafo.md`.
