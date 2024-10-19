local was${1:Thing} =false
function events.TICK()
	local is${1:Thing} = ${2:player:getPose() == "CROUCHING"}
	if was${1:Thing} ~= is${1:Thing} then
		-- code here is executed once whenever the state changes
        $0
	end
	was${1:Thing} = is${1:Thing}
end