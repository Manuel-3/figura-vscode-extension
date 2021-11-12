# Figura Lua Scripts Helper

Autocomplete (and documentation) for Figura API and code snippets for commonly used things when making Figura avatars.

## Standalone Mode and Full Documentation Mode

You can use this extension by itself for basic autocomplete, or it can download a complete documentation if you are using it in combination with a lua language server. This can be enabled in the settings.

## Standalone

### Autocompletion

For the following global figura variables and the API functions they provide:

<details>
    <summary>Click to expand</summary>

    vanilla_model
    armor_model
    elytra_model
    held_item_model
    model
    particle
    sound
    player
    world
    vectors
    renderer
    network
    item_stack
    action_wheel
    keybind
    chat
    meta
    parrot_model
    nameplate
</details>

### Snippets

Snippets for things that are commonly used when making Figura avatars:

<details>
    <summary>Click to expand</summary>

    Hide Model
    Warnings
    Sine Wave
    Smooth Animation
    Lerp
    Clamp
    Timer
    tick()
    render()
    player_init()
    Player Velocity
</details>

### Blockbench Model Reader

The extension will automatically look for a Blockbench model named either ``model.bbmodel`` or ``player_model.bbmodel`` to read its structure and provide autocompletion for the names of your custom model parts.

### Libraries

You can put libraries (just lua files) into ``.minecraft/figura/model_files/libraries/``. These can then be used in your script by typing ``import``. This is useful if you end up using some things in most of your avatars. Instead of copying the code from another avatar, you can just make a library out of it and import it directly while writing your script in vscode.

## Lua Language Server + Figura Documentation

If you have a lua language server, you can enable full documentation in the settings. (There is also a popup asking you to enable it if sumneko's language server is detected.)
It will then automatically download the documentation from https://github.com/GrandpaScout/Figura-VSCode-Documentation into the workspace root folder.

To enable either click the popup that shows up or change the settings like so:

1. Go to ``File -> Preferences -> Settings``
2. In the menu to the left go to ``Extensions -> Figura``
3. Check ``Use Language Server`` to enable compatibility, and if you want to automatically download the Documentation then also enable ``Check For New Documentation Version``