--?Replace Footstep sounds (or any sound for that matter)
-- Replace Footstep sounds (or any sound for that matter)
function events.ON_PLAY_SOUND(id, pos, vol, pitch, loop, cat, path)
	if not path then return end              --dont trigger if the sound was played by figura (prevent potential infinite loop)
	if not player:isLoaded() then return end -- dont do anything if the player isn't loaded

	local distance = (player:getPos() - pos):length()

	if distance > 0.2 then return end                                 -- make sure the sound is (most likely) played by *you*. Larger radius captures uncommon sounds with random placement
	if id:find(".eat") then                                           -- if sound contains ".eat"
		sounds:playSound("minecraft:entity.cat.eat", pos, vol, pitch) -- play a custom sound
		return true                                                   -- stop the actual eat sound
	end
	if id:find(".burp") then                                          -- if sound contains ".burp" then
		return true                                                   -- stops the actual burp sound
	end

	if distance > 0.05 then return end                                        -- make sure the sound is (most likely) played by *you*. Smaller radius captures common sounds with very precise placement
	if id:find(".step") then                                                  -- if sound contains ".step"
		sounds:playSound("minecraft:entity.iron_golem.step", pos, vol, pitch) -- play a custom sound
		return true                                                           -- stop the actual step sound
	end

	-- distance barriers need to be ordered from greatest distance to smallest distance
end
