-- Mete Sarrafo (Roblox): pegar e arremessar a bola
-- Onde fica no Studio: ServerScriptService > Script
-- Quem encosta na bola pega; clique / toque / gatilho RT arremessa.
-- Só queima se a bola acertar alguém ainda voando (antes de bater no chão).
local Players = game:GetService("Players")

-- Ajustes (o Andre pode mudar esses números!)
local VELOCIDADE = 90   -- força do arremesso
local SUBIDA = 20       -- quanto a bola sobe
local INICIO = Vector3.new(0, 5, -15)  -- onde a bola aparece

local bola
local quemJogou = nil
local voando = false
local segurando = false

local function mostrarQueimado(personagem)
	local cabeca = personagem:FindFirstChild("Head")
	if not cabeca or cabeca:FindFirstChild("PlacaQueimado") then return end
	local placa = Instance.new("BillboardGui")
	placa.Name = "PlacaQueimado"
	placa.Size = UDim2.new(0, 200, 0, 50)
	placa.StudsOffset = Vector3.new(0, 3, 0)
	placa.AlwaysOnTop = true
	local texto = Instance.new("TextLabel")
	texto.Size = UDim2.new(1, 0, 1, 0)
	texto.BackgroundTransparency = 1
	texto.Text = "QUEIMADO!"
	texto.TextScaled = true
	texto.TextColor3 = Color3.fromRGB(255, 60, 60)
	texto.Font = Enum.Font.FredokaOne
	texto.Parent = placa
	placa.Parent = cabeca
	task.delay(2, function() placa:Destroy() end)
end

local function arremessar(jogador, ferramenta)
	local personagem = jogador.Character
	local raiz = personagem and personagem:FindFirstChild("HumanoidRootPart")
	if not raiz or not segurando then return end
	segurando = false
	quemJogou = personagem
	voando = true
	-- tira a bola da mão
	ferramenta.Parent = nil
	for _, coisa in ipairs(personagem:GetDescendants()) do
		if coisa:IsA("JointInstance") and coisa.Part1 == bola then coisa:Destroy() end
	end
	bola.Name = "Bola"
	bola.Parent = workspace
	ferramenta:Destroy()
	-- lança para a frente
	bola.CFrame = raiz.CFrame * CFrame.new(0, 1.5, -4)
	bola.AssemblyLinearVelocity = raiz.CFrame.LookVector * VELOCIDADE + Vector3.new(0, SUBIDA, 0)
	bola:SetNetworkOwner(nil)
end

local function darBola(jogador, personagem)
	segurando = true
	voando = false
	local ferramenta = Instance.new("Tool")
	ferramenta.Name = "Bola"
	ferramenta.CanBeDropped = false
	bola.Name = "Handle"
	bola.Parent = ferramenta
	ferramenta.Parent = personagem
	ferramenta.Activated:Connect(function()
		arremessar(jogador, ferramenta)
	end)
end

local function aoTocar(parte)
	if segurando then return end
	local personagem = parte:FindFirstAncestorOfClass("Model")
	local humanoide = personagem and personagem:FindFirstChildOfClass("Humanoid")
	local jogador = personagem and Players:GetPlayerFromCharacter(personagem)

	if voando then
		if personagem == quemJogou then return end
		voando = false
		if jogador and humanoide and humanoide.Health > 0 then
			mostrarQueimado(personagem)
		end
		return
	end

	if jogador and humanoide and humanoide.Health > 0 then
		darBola(jogador, personagem)
	end
end

local function criarBola()
	bola = Instance.new("Part")
	bola.Name = "Bola"
	bola.Shape = Enum.PartType.Ball
	bola.Size = Vector3.new(3, 3, 3)
	bola.Color = Color3.fromRGB(230, 40, 40)
	bola.Material = Enum.Material.SmoothPlastic
	bola.Position = INICIO
	bola.Parent = workspace
	bola.Touched:Connect(aoTocar)
	segurando = false
	voando = false
	quemJogou = nil
end

-- se a bola sumir (caiu do mapa, ou quem segurava saiu), cria outra
criarBola()
while true do
	task.wait(1)
	if not bola:IsDescendantOf(game) then
		criarBola()
	end
end
