--? Scroll action without anti spam. Note that this does not use a ping and is therefore not synced in multiplayer.
local ${2:action} = ${1:page}:newAction()
	:title("$3")
	:item("minecraft:$4")
	:onScroll(function(amount)
		$0
	end)
