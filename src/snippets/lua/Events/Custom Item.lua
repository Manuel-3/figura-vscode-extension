--? Replace a minecraft item with a custom model.
--? Make sure the model part
--?     1) is a group,
--?     2) has a name starting with `Item` (eg ItemSword) and
--?     3) is ideally not inside any other group.
function events.ITEM_RENDER(item)
	if item.id == "minecraft:$1" then
		return models.${2:model}.Item$3
	end
end
