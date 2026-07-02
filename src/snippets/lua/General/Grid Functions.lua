-- Convert 2D xy or 3D xyz coordinates to 1D list index and vice versa.
-- NOTE: All coordinates here start at 0 and not at 1, even the list index!

function IndexToXy(index,width)
  return index%width,math.floor(index/width)
end

function XyToIndex(x,y,width)
  return x+y*width
end

function IndexToXyz(index, width, height)
    local x = index % width
    local y = math.floor(index / width) % height
    local z = math.floor(index / (width * height))
    return x, y, z
end

function XyzToIndex(x, y, z, width, height)
    return x + y * width + z * width * height
end