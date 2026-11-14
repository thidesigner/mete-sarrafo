# Mete Sarrafo no Roblox

Começamos uma versão do jogo no **Roblox Studio** (13/11/2026).

## Onde paramos

- O jogo foi salvo no Roblox, **privado**, no nome do pai. Criação em equipe ligada.
- Dispositivos: computador, telefone, tablet e console (Xbox). Para aparecer no Xbox, falta o questionário de conteúdo, que se responde na hora de publicar.
- Funciona: a bola vermelha aparece no chão, quem encosta **pega**, e com clique, toque ou RT **arremessa**. Se acertar alguém ainda voando, aparece **"QUEIMADO!"**.
- O script está em `roblox/bola.server.lua` (no Studio: ServerScriptService > Script).
- Ajustes que o Andre pode mexer: `VELOCIDADE`, `SUBIDA` e o tamanho da bola (`bola.Size`).

## Ligação do Claude com o Studio (MCP)

- No Studio: Configurações do Assistente > Servidores MCP > "Ativar o Studio como servidor MCP" ligado.
- No PC de casa, o arquivo `.mcp.json` (fora do git) liga o Claude ao Studio. Ele só carrega numa **conversa nova**, com o Studio aberto.
- Na nuvem não funciona, porque o Studio roda no PC.

## Próximos passos (o Andre escolhe a ordem)

1. Quadra com dois campos e uma linha no meio.
2. Times (vermelho contra azul).
3. Forca: como a palavra secreta entra na queimada (decisão do Andre).
4. Placar de queimados.

## Regras combinadas para o Roblox

- Nada pago com Robux (passes, itens) sem o pai mudar a regra.
- Se um dia der Robux: publicar num **grupo** para o pai poder repassar ao Andre.
