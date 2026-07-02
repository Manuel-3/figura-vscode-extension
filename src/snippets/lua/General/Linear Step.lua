---Linearly step towards a target without overshooting
--- `value = step(value, target, 1)`
---@param value number
---@param target number
---@param amount number
---@return number
function step(value, target, amount)
  if value < target then
    return math.min(value + amount, target)
  else
    return math.max(value - amount, target)
  end
end