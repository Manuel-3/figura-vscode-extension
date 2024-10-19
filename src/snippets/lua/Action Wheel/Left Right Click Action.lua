function pings.${2:action}Clicked()
	$0
end

function pings.${2:action}RightClicked()
	
end

local ${2:action} = ${1:page}:newAction()
	:title("$3")
	:item("minecraft:$4")
	:onLeftClick(function()
		pings.${2:action}Clicked()
	end)
	:onRightClick(function()
		pings.${2:action}RightClicked()
	end)
