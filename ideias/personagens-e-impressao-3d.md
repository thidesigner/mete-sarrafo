# Personagens próprios e impressão 3D

Ideia (30/out): no jogo, o Andre e os amigos montam personagens exclusivos arrastando peças. Depois, o personagem vira um boneco de verdade na impressora 3D do pai. No futuro pode ter uma lojinha de personagens dentro do jogo e venda dos bonecos impressos.

## O que já funciona (versão de teste)

- **31/out:** a aba Imprimir 3D foi escondida das crianças. Ela só aparece se o pai ligar nos Ajustes (com o código). A impressão 3D vai continuar num repositório separado, como teste interno.

- Artefato **Oficina 3D do Andre** no Claude: o fluxo, checklist de preparo, diário de impressões e lista de correções.
- No Modo Festa (Claude) os personagens ficam guardados na conta e aparecem em qualquer aparelho. Dá para baixar o STL lá também (vem num .zip).

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

## Passo a passo com a impressora do pai (Elegoo Neptune 4 Pro)

A impressora imprime uma cor por vez, com fio de plástico (filamento). A área de impressão é de 22,5 x 22,5 x 26,5 cm, então cabe qualquer tamanho do jogo (até 15 cm).

**Comprar uma vez:**
- filamento **PLA 1,75 mm** (1 kg, para começar; branco ou cinza é bom para pintar depois);
- alicate de corte pequeno para tirar os suportes (a espátula costuma vir com a impressora);
- tintas acrílicas e pincéis finos, se quiser pintar.

**Preparar uma vez:**
1. Montar a impressora seguindo o manual e o vídeo da Elegoo.
2. Rodar o nivelamento automático da mesa (menu da tela da impressora).
3. Imprimir um arquivo de teste que vem no pendrive da impressora, para saber que está tudo certo.
4. Instalar no computador o programa que "fatia" o boneco em camadas. Pode ser o **OrcaSlicer** (gratuito, já tem a Neptune 4 Pro na lista) ou o **Elegoo Cura** (vem no pendrive). Ao abrir, escolher a impressora "Elegoo Neptune 4 Pro", bico 0.4, e o filamento "PLA".

**Para cada boneco:**
1. O Andre cria o personagem no jogo, no site.
2. Na aba **Imprimir 3D**, escolher a altura (8 cm é um bom começo) e tocar em **Baixar arquivo da impressora (STL)**.
3. Abrir o STL no OrcaSlicer.
4. Ligar os **suportes** (tipo "árvore"), porque braços, espada e capa ficam no ar.
5. Clicar em **Fatiar**. O programa mostra o tempo e quantos gramas vai gastar.
6. Salvar o arquivo que ele gera (G-code) no pendrive.
7. Pôr o pendrive na impressora, escolher o arquivo na tela e imprimir.
8. Esperar esfriar, tirar da mesa, cortar os suportes e pintar se quiser.

Para começar não precisa do Blender. Ele serve depois, para caprichar (mais liso, pose, separar cores).

Um boneco de 8 cm gasta mais ou menos 15 a 25 g de PLA (poucos reais) e leva umas 1 a 3 horas. O número certo aparece no fatiador.

**Segurança:** o bico chega a 200 °C e a mesa a 60 °C. O Andre acompanha junto com um adulto, sem pôr a mão dentro enquanto imprime. Deixar num lugar ventilado. Nas primeiras vezes, não deixar a impressora sozinha.

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

1. ~~Qual é a impressora?~~ Elegoo Neptune 4 Pro (uma cor). Falta escolher o fatiador (sugestão: OrcaSlicer).
2. Tamanho preferido do boneco (o padrão é 80 mm)?
3. Quais peças e formas novas o Andre quer primeiro?
4. A lojinha vende peças, personagens prontos ou os dois? Quanto custam (em moedas do jogo)?
