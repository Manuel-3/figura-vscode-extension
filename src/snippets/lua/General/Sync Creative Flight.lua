--? Sync player creative flight using pings
playerIsFlying = false -- Use anywhere, this variable will be synced
do
	local wasFlying = false
	function pings.setPlayerIsFlying(value)
		playerIsFlying = value
	end
	if host:isHost() then
		function events.tick()
			playerIsFlying = host:isFlying()
			if wasFlying ~= playerIsFlying then
				pings.setPlayerIsFlying(playerIsFlying)
			end
			wasFlying = playerIsFlying
		end
	end
end
