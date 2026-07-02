-- Source: https://discord.com/channels/1129805506354085959/1129811275380162730/1281492746988818508

-- Creates a byte buffer for reading binary data
local buffer = data:createBuffer()
-- Opens "Texture.png" in figura/data as binary and reads it into the buffer
local stream = file:openReadStream("Texture.png")
buffer:readFromStream(stream)
-- Sets the buffer's "head" to the beginning of the newly-acquired binary data
buffer:setPosition(0)
-- Reads all binary data into a Base64 string and then turns it into a texture by feeding it into textures:read
local newTexture = textures:read("newTexture",buffer:readBase64(buffer:available()))
-- Closes the byte buffer and input stream so the resources it uses can be freed up
buffer:close()
stream:close()
-- You can use your new texture like this, once you're ready to
<Path to model>:setPrimaryTexture("custom",newTexture)