function pings.${2:action}Toggled(state)
	$0
end

local ${2:action} = ${1:page}:newAction()
	:title("$3")
	:item("minecraft:$4")
	:toggleItem("minecraft:$5")
	:onToggle(function(state)
		pings.${2:action}Toggled(state)
	end)
