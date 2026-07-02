-- Source: https://discord.com/channels/1129805506354085959/1234218592187453452/1304526475503861770

--- Direction to euler angles in model space
---@param dir Vector3
---@return Vector3
function directionToEuler(dir)
    local yaw = math.atan2(dir.x, dir.z)
    local pitch = math.atan2(dir.y, dir.xz:length())
    return vec(math.deg(pitch), 180+math.deg(yaw), 0)
end
