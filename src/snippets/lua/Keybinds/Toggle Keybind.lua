local ${1:keybind}State = false -- This variable gets toggled at every key press
function pings.${1:keybind}Toggled(state)
	${1:keybind}State = state
	$0
end
local ${1:keybind} = keybinds:newKeybind("${2:Display Name}", "${3:key.keyboard.space}")
	:onPress(function()pings.${1:keybind}Toggled(not ${1:keybind}State)end)