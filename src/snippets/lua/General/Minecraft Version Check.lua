local requiredVersion = "${1:1.20.2}"
local gameVersion = client.getVersion()
if client.compareVersions(gameVersion, requiredVersion) < 0 then
	error("Avatar needs at least Minecraft version "..requiredVersion.." or above!")
end
