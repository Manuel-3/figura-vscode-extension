-- Source: https://discord.com/channels/1129805506354085959/1234218592187453452/1405878281164558407
do
  local _idx=figuraMetatables.ModelPart.__index
  function figuraMetatables.ModelPart.__index(self, idx)
    if idx=="getOBB" then
      return function(cube)
        assert(cube:getType()=="CUBE","CUBE expected, got "..cube:getType())
        local obb, pivot = {}, cube:getPivot()
        for _, verts in pairs(cube:getAllVertices()) do
          assert(#verts==24,"All 6 sides must use the same texture")
          for i=1,8 do
            table.insert(obb,cube:partToWorldMatrix():apply(verts[i]:getPos()-pivot))
          end
        end
        return obb
      end
    end
    return _idx(self,idx)
  end
  ---@class RaycastAPI
  local rcst = figuraMetatables.RaycastAPI.__index
  ---@return table? obb
  ---@return Vector3? hitpos
  ---@return Entity.blockSide? side
  ---@return integer? index
  function rcst:obb(startpos, endpos, obbs)
    local hits={}
    for i,obb in ipairs(obbs) do
      local cntr=vec(0,0,0)
      for _,corner in ipairs(obb) do
        cntr=cntr+corner
      end
      cntr=cntr/8
      local min,max,x,y,z = obb[2],obb[7],(obb[1]-obb[2]):normalized(),(obb[3]-obb[2]):normalized(),(obb[5]-obb[2]):normalized()
      local lclToWrld = matrices.mat4(x.xyz_,y.xyz_,z.xyz_,cntr:augmented())
      local wrldToLcl = lclToWrld:inverted()
      local _,hit,side = self:aabb(wrldToLcl:apply(startpos),wrldToLcl:apply(endpos),{{wrldToLcl:apply(min),wrldToLcl:apply(max)}})
      if hit then table.insert(hits, {obb, hit and lclToWrld:apply(hit), side, i}) end
    end
    table.sort(hits, function(a, b)
      if not a[2] then return false end
      if not b[2] then return true end
      local da=(a[2]-startpos):length()
      local db=(b[2]-startpos):length()
      return da<db
    end)
    ---@diagnostic disable-next-line
    if hits[1] then return table.unpack(hits[1]) end
  end
end

-- Example
-- local obb,hitpos,side,i = raycast:obb(startpos, endpos, {cube:getOBB()})
