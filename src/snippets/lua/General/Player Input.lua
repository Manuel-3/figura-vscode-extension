--? Ask an input from the player that they can type in chat.
--? ```lua
--? input("Whats your name?", function(name)
--?     logJson("Hello "..name.."!")
--? end)
--? ```
function input(question, callback)
    logJson(question)
    local e = events.CHAT_SEND_MESSAGE
    local f f=function(m)callback(m)e:remove(f)return nil end
    e:register(f)
end
