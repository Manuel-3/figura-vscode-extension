-- Choice Action
-- Click or scroll to switch through the choices.
-- Icon and title automatically updates with the selected choice in bold.

-- Source: https://discord.com/channels/1129805506354085959/1234218592187453452/1464588873832333312

local figuraMetatablesPage__index = figuraMetatables.Page.__index
figuraMetatables.Page.__index = function(slf, key)
  if key == "newChoice" then
    ---@class Minecraft.RawJSONText.Component
    ---@field text string
    ---@field item ItemStack|Minecraft.itemID
    ---@class Page
    ---@field newChoice fun(self:Page,choices:Minecraft.RawJSONText.Component[],onChange:fun(idx:number,self:Action)):Action,setIndex:fun(index:integer)
    return function(self, choices, onChange)
      local cs = {}
      for _,c in ipairs(choices) do
        table.insert(cs,{text=c.text..'\n',item=c.item,bold=false})
      end
      cs[#cs].text = cs[#cs].text:gsub('\n$','')
      local i,action = #cs,self:newAction()
      local function prep(dir)
        cs[i].bold = false
        i = (i - 1 - math.sign(dir)) % #cs + 1
        cs[i].bold = true
        action:title(toJson(cs)):item(cs[i].item)
      end
      local function interact(dir)
        if player:isLoaded() then sounds:playSound("block.copper_bulb.turn_on",player:getPos(),1,1)end
        prep(dir)onChange(i,action)
      end
      prep(-1)
      action.rightClick=function()interact(1)end
      action.leftClick=function()interact(-1)end
      action.scroll=interact
      return action,function(j)for _=1,j-1 do prep(-1)end end
    end
  end
  return figuraMetatablesPage__index(slf, key)
end

-- Example: (note it's without a ping, and expects a mainPage to already exist)
-- local myChoices = {
--   {text="Choice 1", item="acacia_boat"},
--   {text="Choice 2", item="oak_boat"},
--   {text="Choice 3", item="spruce_boat"},
-- }
-- local action, action_setIndex = mainPage:newChoice(myChoices,function(index)
--   log("selected:", index)
-- end)