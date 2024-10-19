local ${1:keybind}Holding = false -- This variable is true when holding the key, false when not
function pings.${1:keybind}Pressed()
    ${1:keybind}Holding = true
end
function pings.${1:keybind}Released()
    ${1:keybind}Holding = false
end
local ${1:keybind} = keybinds:newKeybind("${2:Display Name}", "${3:key.keyboard.space}")
	:onPress(pings.${1:keybind}Pressed)
	:onRelease(pings.${1:keybind}Released)
