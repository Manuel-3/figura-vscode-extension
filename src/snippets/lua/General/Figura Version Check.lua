local requiredVersion = "${1:0.1.4}"
local figuraVersion = client.getFiguraVersion():match("^([^%+]*)")
if client.compareVersions(figuraVersion, requiredVersion) < 0 then
	error("Avatar needs at least Figura version "..requiredVersion.." or above!")
end
