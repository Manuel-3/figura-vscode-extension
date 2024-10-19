--? Minified version of the Scroll Action snippet
local ${2:action}Value = 0
local ${2:action}LastChangedTime = -1

function pings.${2:action}Scrolled(value)
	${2:action}Value = value
	$0
end

local ${2:action} = ${1:page}:newAction()
	:title("$3")
	:item("minecraft:$4")
	:onScroll(function(amount)${2:action}LastChangedTime=world.getTime()${2:action}Value=${2:action}Value+amount end)if host:isHost()then function events.TICK()if world.getTime()>${2:action}LastChangedTime + 5 and ${2:action}LastChangedTime ~= -1 then ${2:action}LastChangedTime = -1 pings.${2:action}Scrolled(${2:action}Value)end end end