-- Mete Sarrafo: monta a quadra com dois campos (vermelho e azul)
-- Como usar: no Studio, cole tudo na Barra de Comandos (Exibir > Barra de Comandos) e aperte Enter.
-- Se já existir uma quadra, ela é apagada e montada de novo.

-- Ajustes (o Andre pode mudar esses números!)
local COMPRIMENTO = 100  -- de uma ponta à outra (os dois campos juntos)
local LARGURA = 60       -- de um lado ao outro
local LINHA = 1          -- grossura das linhas brancas
local MURETA = 2         -- altura da mureta em volta (para a bola não fugir)

local VERMELHO = Color3.fromRGB(200, 55, 55)
local AZUL = Color3.fromRGB(55, 95, 210)
local BRANCO = Color3.fromRGB(245, 245, 245)

local velha = workspace:FindFirstChild("Quadra")
if velha then velha:Destroy() end

local quadra = Instance.new("Model")
quadra.Name = "Quadra"

local function bloco(nome, tamanho, posicao, cor, material)
	local p = Instance.new("Part")
	p.Name = nome
	p.Anchored = true
	p.Size = tamanho
	p.Position = posicao
	p.Color = cor
	p.Material = material or Enum.Material.SmoothPlastic
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.Parent = quadra
	return p
end

local function letreiro(parte, texto, cor)
	local g = Instance.new("SurfaceGui")
	g.Face = Enum.NormalId.Top
	g.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud
	g.PixelsPerStud = 20
	g.Parent = parte
	local t = Instance.new("TextLabel")
	t.Size = UDim2.new(1, 0, 1, 0)
	t.BackgroundTransparency = 1
	t.Text = texto
	t.TextScaled = true
	t.Font = Enum.Font.FredokaOne
	t.TextColor3 = cor
	t.TextTransparency = 0.35
	t.Parent = g
end

local metade = COMPRIMENTO / 2
local y = 0.1 -- o chão da quadra fica logo acima do Baseplate

-- os dois campos: vermelho (lado de trás, Z negativo) e azul (lado da frente, Z positivo)
local campoV = bloco("CampoVermelho", Vector3.new(LARGURA, 0.2, metade), Vector3.new(0, y, -metade / 2), VERMELHO)
local campoA = bloco("CampoAzul", Vector3.new(LARGURA, 0.2, metade), Vector3.new(0, y, metade / 2), AZUL)

-- nome pintado no chão (girado para ler de quem está no próprio campo)
local placaV = bloco("NomeVermelho", Vector3.new(LARGURA * 0.6, 0.05, 12), Vector3.new(0, 0.23, -metade / 2), VERMELHO)
placaV.Transparency = 1
placaV.CanCollide = false
placaV.Orientation = Vector3.new(0, 180, 0)
letreiro(placaV, "VERMELHO", BRANCO)
local placaA = bloco("NomeAzul", Vector3.new(LARGURA * 0.6, 0.05, 12), Vector3.new(0, 0.23, metade / 2), AZUL)
placaA.Transparency = 1
placaA.CanCollide = false
letreiro(placaA, "AZUL", BRANCO)

-- linhas brancas: a do meio e as de fora
local yl = 0.22
bloco("LinhaDoMeio", Vector3.new(LARGURA, 0.05, LINHA * 1.5), Vector3.new(0, yl, 0), BRANCO)
bloco("LinhaFundoVermelho", Vector3.new(LARGURA, 0.05, LINHA), Vector3.new(0, yl, -metade + LINHA / 2), BRANCO)
bloco("LinhaFundoAzul", Vector3.new(LARGURA, 0.05, LINHA), Vector3.new(0, yl, metade - LINHA / 2), BRANCO)
bloco("LinhaLadoEsquerdo", Vector3.new(LINHA, 0.05, COMPRIMENTO), Vector3.new(-LARGURA / 2 + LINHA / 2, yl, 0), BRANCO)
bloco("LinhaLadoDireito", Vector3.new(LINHA, 0.05, COMPRIMENTO), Vector3.new(LARGURA / 2 - LINHA / 2, yl, 0), BRANCO)

-- mureta baixinha em volta (dá para pular por cima)
local cinza = Color3.fromRGB(90, 90, 100)
local g = 1 -- grossura da mureta
local ym = MURETA / 2
bloco("MuretaFundoVermelho", Vector3.new(LARGURA + 2 * g, MURETA, g), Vector3.new(0, ym, -metade - g / 2), cinza)
bloco("MuretaFundoAzul", Vector3.new(LARGURA + 2 * g, MURETA, g), Vector3.new(0, ym, metade + g / 2), cinza)
bloco("MuretaEsquerda", Vector3.new(g, MURETA, COMPRIMENTO), Vector3.new(-LARGURA / 2 - g / 2, ym, 0), cinza)
bloco("MuretaDireita", Vector3.new(g, MURETA, COMPRIMENTO), Vector3.new(LARGURA / 2 + g / 2, ym, 0), cinza)

quadra.Parent = workspace

-- o lugar onde a gente nasce vai para a beira da quadra, do lado de fora
local nascer = workspace:FindFirstChild("SpawnLocation")
if nascer then
	nascer.Position = Vector3.new(-LARGURA / 2 - 10, 0.5, 0)
end

print("Quadra pronta!")
