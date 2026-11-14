-- Mete Sarrafo: cria os times Vermelho e Azul e o lugar onde cada um nasce
-- Como usar: monte a quadra antes (roblox/quadra.lua). Depois cole tudo na
-- Barra de Comandos do Studio e aperte Enter. Pode rodar de novo sem problema.
-- Quem entra no jogo cai sozinho no time que estiver com menos gente.

local Teams = game:GetService("Teams")

local TIMES = {
	{ nome = "Vermelho", cor = BrickColor.new("Bright red"), z = -40 },
	{ nome = "Azul", cor = BrickColor.new("Bright blue"), z = 40 },
}

-- apaga times e lugares de nascer antigos
for _, t in ipairs(Teams:GetChildren()) do t:Destroy() end
for _, s in ipairs(workspace:GetDescendants()) do
	if s:IsA("SpawnLocation") then s:Destroy() end
end

local quadra = workspace:FindFirstChild("Quadra") or workspace

for _, info in ipairs(TIMES) do
	local time = Instance.new("Team")
	time.Name = info.nome
	time.TeamColor = info.cor
	time.AutoAssignable = true
	time.Parent = Teams

	-- lugar de nascer no fundo do próprio campo
	local nascer = Instance.new("SpawnLocation")
	nascer.Name = "Nascer" .. info.nome
	nascer.Anchored = true
	nascer.Size = Vector3.new(10, 0.4, 6)
	nascer.Position = Vector3.new(0, 0.4, info.z)
	nascer.BrickColor = info.cor
	nascer.Material = Enum.Material.Neon
	nascer.Transparency = 0.4
	nascer.Neutral = false
	nascer.TeamColor = info.cor
	nascer.AllowTeamChangeOnTouch = false
	nascer.Duration = 0 -- sem escudo de proteção ao nascer
	nascer.Parent = quadra
end

print("Times prontos!")
