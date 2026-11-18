# Ranking online (classificação igual para todo mundo)

Pedido do Andre: na Praça, a classificação mostra qualquer pessoa, mesmo quem nunca jogou com você.
O jogo não tem servidor, então a lista fica num **Realtime Database do Firebase** (gratuito, conta do pai).
Vai para lá só o **apelido** e os números da classificação (vitórias, tempo jogando, moedas gastas, bosses e moedas).

## Como o pai liga (uma vez só, uns 10 minutos)

1. Entre em https://console.firebase.google.com com a conta Google e toque em **Criar projeto** (pode desligar o Google Analytics).
2. No menu da esquerda: **Criação** → **Realtime Database** → **Criar banco de dados**. Local: Estados Unidos. Comece no **modo bloqueado**.
3. Na aba **Regras**, apague tudo, cole o conteúdo de `regras.json` (desta pasta) e toque em **Publicar**.
4. Na aba **Dados**, copie o endereço que aparece no alto (parece `https://nome-do-projeto-default-rtdb.firebaseio.com/`).
5. Mande esse endereço no chat do Claude: "liga o ranking online: <endereço>".

O endereço não é senha: as regras é que protegem. Elas só deixam ler a lista e **aumentar** os números
(ninguém consegue apagar ou diminuir os de outra pessoa). Não precisa de chave nem de login.

## Cuidados

- Use só apelido no jogo (nada de nome completo). A lista é pública para quem tiver o endereço.
- Para apagar alguém da lista: no console do Firebase, aba Dados, toque no nome e na lixeira.
- Para desligar: no código, deixe `RANK_ONLINE = ""` em `fonte/online.js`.
