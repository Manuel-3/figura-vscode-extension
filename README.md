# Figura Lua Scripts Helper

Autocomplete (and documentation) for Figura API and code snippets for commonly used things when making Figura avatars.

## Standalone Mode and Full Documentation Mode

You can use this extension by itself for basic autocomplete, or it can download a complete documentation if you are using it in combination with a lua language server. This can be enabled in the settings.

## Standalone

### Autocompletion

Will provide autocomplete for global figura variables and their API functions.

### Snippets

Snippets for things that are commonly used when making Figura avatars:

<details>
<summary>Click to expand</summary>

```
Player Velocity
Hide Model
Warnings
Sine Wave
Smooth Animation
Lerp
Clamp
Timer
tick()
render()
world_render()
player_init()
```

</details>

### Blockbench Model Reader

The extension will automatically look for a Blockbench model named either `model.bbmodel` or `player_model.bbmodel` to read its structure and provide autocompletion for the names of your custom model parts.

### Libraries

You can put libraries (just normal .lua files) into `.minecraft/figura/model_files/libraries/` (path can be changed in the settings). These can then be used in your script by typing `import`. This is useful if you end up using some things in most of your avatars. Instead of copying the code from another avatar, you can just make a library out of it and import it directly while writing your script in vscode.

## Lua Language Server + Figura Documentation

If you have a lua language server, the extension can download lua docs automatically. By default it's going to download https://github.com/GrandpaScout/Figura-VSCode-Documentation and put it into the workspace root folder. You can put a custom download link or even a path to a local folder in the settings instead.
