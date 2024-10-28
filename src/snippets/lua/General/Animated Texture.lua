-- The amount of frames the texture has
local frameCount = $1
-- The amount of ticks it should wait before switching to the next frame
local ticksPerFrame = $2

function events.TICK()
    models.$0:setUV(0, math.floor(world.getTime()/ticksPerFrame)/frameCount)
end
-- Tutorial: https://manuel-3.github.io/animated-texture