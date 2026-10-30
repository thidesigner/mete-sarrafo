# Personagens próprios e impressão 3D

Ideia (30/out): no jogo, o Andre e os amigos montam personagens exclusivos arrastando peças. Depois, o personagem vira um boneco de verdade na impressora 3D do pai. No futuro pode ter uma lojinha de personagens dentro do jogo e venda dos bonecos impressos.

## O que já funciona (versão de teste)

- Botão **Criar** na tela inicial, depois **Criar personagem**.
- Abas:
  - **Corpo:** forma e cor.
  - **Cabeça:** forma, pele, olhos, boca, cabelo.
  - **Peças:** arrasta para o boneco ou toca.
  - **Imprimir 3D.**
- 14 peças com lugares de encaixe:
  - cabeça: boné, coroa, chifres, orelhas, capacete;
  - rosto: óculos, máscara;
  - mão direita: espada, martelo, varinha;
  - mão esquerda: escudo;
  - costas: capa, asas, mochila.
- Cada encaixe aceita uma peça (a nova troca a antiga).
- O personagem aparece na tela inicial, na partida de cima, em 1ª pessoa e no online. Os amigos veem o personagem de cada um.
- Até 30 personagens por aparelho.
- Na aba Imprimir 3D (só no site), escolhe a altura (40 a 150 mm) e baixa:
  - **Arquivo da impressora (STL):** de uma cor, em pé numa base, pronto para o fatiador.
  - **Modelo colorido (GLB):** peças e cores separadas, para abrir no Blender.
  - **Ficha do personagem (JSON):** a "receita" do boneco, em texto.

## Caminho até a impressora

1. No jogo, baixar o modelo colorido (.glb).
2. No Blender, rodar `ferramentas/blender/personagem_para_stl.py`. Ele junta tudo numa peça só, fecha os buracos, põe de pé e acerta a altura em mm.
   - Sem janela: `blender -b -P ferramentas/blender/personagem_para_stl.py -- boneco.glb boneco.stl 80`
   - No Claude desktop com o conector do Blender: pedir "importa este .glb e roda o script de preparar para impressão".
3. Abrir o STL no fatiador da impressora (Cura, PrusaSlicer, Bambu Studio...), com suporte ligado por causa dos braços e da espada.

O STL baixado direto do jogo já imprime. O caminho pelo Blender serve para caprichar: deixar mais liso, mudar a pose, pintar, separar cores.

Testado: o "Capitão Raio" saiu com 40 x 44 x 80 mm, peça fechada (0 arestas abertas).

## A ficha do personagem

Cada personagem é um texto pequeno (JSON) com `tipo: "personagem-jogos-do-andre"` e `versao: 1`:

- corpo (forma, cor), pernas (cor), cabeça (forma, pele);
- rosto (olhos, boca), cabelo (estilo, cor);
- peças (tipo, encaixe, cor);
- nome e criador (só o primeiro nome ou apelido).

A ficha guarda as escolhas, não o desenho. Por isso pesa pouco, viaja no modo online e serve de base para a futura lojinha e para refazer o 3D com mais qualidade depois.

## Próximas fases (ideias, nada combinado ainda)

1. **Mais formas e peças.** O Andre desenha no papel e a gente transforma em peça. Cores livres. Poses.
2. **Peças na loja do jogo, com moedas do jogo.** Algumas peças custam moedas, como as skins.
3. **Trocar personagens entre amigos.** Mandar a ficha por código ou QR.
4. **Lojinha de personagens (marketplace).** Só com moedas do jogo. Quem criou aparece como autor.
5. **Bonecos impressos.** Pedido feito fora do jogo, sempre por um adulto.

## Cuidados (negócio, lei e segurança)

Isto não é conselho jurídico. Antes de vender, vale conversar com um contador.

- **Dinheiro de verdade fica fora do jogo.** O jogo só tem moedas do jogo. Encomenda de boneco impresso é conversa entre adultos (pai com pai), fora do jogo.
- **Brinquedo para criança tem regra.** No Brasil, brinquedo para menores de 14 anos precisa de certificação do Inmetro. Até ter isso, vender como **colecionável/decorativo, não indicado para menores de 14** (ou de 3, por peças pequenas), e avisar isso na etiqueta.
- **Segurança da peça:**
  - peças pequenas que soltam são risco de engasgo; imprimir inteiro, sem partes de encaixe soltas;
  - espada e chifres com ponta arredondada (a ficha já usa formas grossas);
  - PLA comum não é para pôr na boca.
- **Só criações originais.** Personagens famosos (Naruto, Sonic etc.) têm dono: não dá para vender nem pôr na lojinha. Os heróis do jogo são originais, "inspirados".
- **Personagem do amigo é do amigo.** Para vender um boneco que outra criança criou, pedir autorização dos pais dela e combinar o que ela ganha (crédito no boneco, um boneco de presente, uma parte).
- **Dados das crianças (LGPD).** A ficha guarda só primeiro nome ou apelido. Nada de foto, escola ou contato. Encomenda só com dados do adulto, guardados fora deste repositório.
- **Dinheiro:**
  - preço = filamento (poucos reais por boneco de 80 mm) + energia + tempo de impressora + pintura + embalagem + margem;
  - vender com frequência pede formalizar (MEI ou outro), o que o contador indica.

## Dúvidas em aberto

1. Qual é a impressora e o fatiador? Uma cor ou várias (AMS / troca de filamento)?
2. Tamanho preferido do boneco (o padrão é 80 mm)?
3. Quais peças e formas novas o Andre quer primeiro?
4. A lojinha vende peças, personagens prontos ou os dois? Quanto custam (em moedas do jogo)?
