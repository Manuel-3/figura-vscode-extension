-- Source: https://discord.com/channels/1129805506354085959/1234218592187453452/1399803469656756255
do
  local orig = {}
  local fmap = {north=0,south=1,east=2,west=3,up=4,down=5}
  local _idx = figuraMetatables.ModelPart.__index
  function figuraMetatables.ModelPart.__index(self, idx)
    if idx == "setFaceUV" or idx == "setFaceUVPixels" then
      return function(slf, u, v, ...)
        local fcs = {...}
        if type(u):match("^Vector%d$") then
          table.insert(fcs, v)
          v = u.y
          u = u.x
        end
        assert(#fcs>0, "No faces were given.")
        if slf:getType() == "GROUP" then
          for _, child in ipairs(slf:getChildren()) do
            child[idx](child, u, v, table.unpack(fcs))
          end
        end
        if slf:getType() ~= "CUBE" then return end
        local verts, dims
        for tex, vs in pairs(slf:getAllVertices()) do
          assert(verts == nil, "Face UV only works if there is only one texture on the cube.")
          dims = idx:find("Pixels") and vec(1,1) or textures[tex]:getDimensions()
          verts = vs
        end
        for _, face in ipairs(fcs) do
          assert(fmap[face], 'Face "'..face..'" does not exist. The available faces are: ['..(function()
            local s = ""
            for k in pairs(fmap) do s=s..'"'..k..'", 'end
            return string.sub(s,1,#s-2)
          end)()..']')
          local i = fmap[face]*4+1
          for j=0,3 do
            orig[verts[i+j]] = orig[verts[i+j]] or verts[i+j]:getUV()
            verts[i+j]:setUV(orig[verts[i+j]] + vec(u,v) * dims)
          end
        end
      end
    end
    return _idx(self, idx)
  end
end

-- Same as normal uv functions but with face names at the end
-- Examples
-- models:setFaceUVPixels(u, v, "north")
-- models:setFaceUV(u, v, "north", "east", "up")
-- models:setFaceUVPixels(vec(u, v), "down")
