local timer = 0
function events.tick()
    timer = timer - 1
    if timer <= 0 then
        timer = math.random(${1:100},${2:200})
        $0
    end
end