--! player:getHealth() - Health Detection
local _health
function events.ENTITY_INIT()
    _health = player:getHealth()
end
function events.TICK()
    local health = player:getHealth()
    if health < _health then
        -- hurt
    elseif health > _health then
        -- healed
    elseif health <= 0 then
        -- died
    end
    _health = health
end