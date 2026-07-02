do
  local skulls = {}
  local function serialize(vec)
    return vec.x .. "," .. vec.y .. "," .. vec.z
  end

  function events.skull_render(delta,block,item,entity,type)
    if not block then return end
    local k = serialize(block:getPos())
    if not skulls[k] then
      skulls[k] = {}
      skulls[k].pos = block:getPos()
      skulls[k].myCustomDataReplaceMe = "something" -- example, put your own stuff
    end
  end

  function events.tick() -- can be replaced with world_tick if needed
    for k, data in pairs(skulls) do
      if world.getBlockState(data.pos).id:find("head") then
        print(data.pos) -- example print, replace with your own code
        print(data.myCustomDataReplaceMe) -- example print, replace with your own code
      else
        skulls[k] = nil
      end
    end
  end

end