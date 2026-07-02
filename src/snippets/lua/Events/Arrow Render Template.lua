local arrows = {}

function events.arrow_render(delta, arrow)
  arrows[arrow:getUUID()] = arrows[arrow:getUUID()] or {yourData = "goesHere"}
end

function events.tick()
  for uuid, data in pairs(arrows) do
    local arrow = world.getEntity(uuid)
    if arrow then
      -- arrow still exists here, runs every tick
      log(data.yourData)
    else
      arrows[uuid] = nil
      -- arrow despawned, runs once
      log("despawned", uuid)
    end
  end
end