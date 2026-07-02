--- Very basic http request function.
--- Not many features but super easy to use.
--- Note that it is asynchronous and thus shouldnt be called every tick or frame,
--- instead call it once and wait for the callback function.
--- 
--- Example:
--- 
--- ```lua
--- HttpRequest("https://pastebin.com/raw/h2X9G9XN", function(data)
---   log(data)
--- end)
--- ```
--- 
--- Source: https://discord.com/channels/1129805506354085959/1234218592187453452/1328069153105510421
---@param url string
---@param callback fun(data: string)
function HttpRequest(url, callback)
  if not host:isHost() then return end
  local stream, data, future
  local function await_download()
    if not future:isDone() then return end
    local value = future:getValue()
    if not value then callback(nil) events.world_render:remove(await_download) return end
    table.insert(data, value)
    if value == "" then
      callback(table.concat(data))
      events.world_render:remove(await_download)
    else
      future = stream:readAsync(2^20)
    end
  end
  local request = net.http:request(url):send()
  local function await_request()
    if not request:isDone() then return end
    local value = request:getValue()
    if not value then callback(nil) events.world_render:remove(await_request) return end
    stream, data = value:getData(), {}
    future = stream:readAsync(2^20)
    events.world_render:register(await_download)
    events.world_render:remove(await_request)
  end
  events.world_render:register(await_request)
end