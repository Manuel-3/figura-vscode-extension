# Figura VSCode Extension

This extension aims to help making lua scripts for the Figura Minecraft mod.

## Main Features

- Autocomplete for Figura globals
- BlockBench model reader to provide autocomplete for custom model part names as well as animation names.
- Lua library folder for easily importing lua files
- Code snippets for a few useful Figura related things
- Downloading EmmyLua Figura documentation to use with a lua language server extension

## Autocomplete / Documentation

You can use this extension by itself for basic autocomplete, or it can download a complete documentation if you are using it in combination with a lua language server. This can be enabled in the settings.

## Libraries

You can change the location of your libraries folder in the settings.

Put lua files in the libraries folder, which can then be imported to your avatar by typing "import" or "require" and then the file name of the library.

Import will copy the text contents into your script (for Figura 0.0.8 or lower, which only allowed one lua file).

Require will copy the file to your avatar folder (for Figura 0.1.0 or later).

## Snippets

Snippets for things that are commonly used when making Figura avatars:

<details>
<summary>Click to expand</summary>

```
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

## Lua Language Server + Figura Documentation

If you have a lua language server, the extension can download lua docs automatically. By default it's going to download https://github.com/GrandpaScout/Figura-VSCode-Documentation and put it into the workspace root folder. You can put a custom download link or even a path to a local folder in the settings instead.
