function pings.${1:keybind}Pressed()
	$0
end
local ${1:keybind} = keybinds:newKeybind("${2:Display Name}", "${3:key.keyboard.space}")
	:onPress(pings.${1:keybind}Pressed)