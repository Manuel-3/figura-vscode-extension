# Figura VSCode Extension

This extension aims to help making lua scripts for the Figura Minecraft mod.

## Important! Read before installing!

This extension no longer provides autocomplete for Figura API!
For autocomplete, please install the EmmyLua notations from https://github.com/GrandpaScout/FiguraRewriteVSDocs

## Features

- BlockBench model reader to provide autocomplete for custom model part names as well as animation names.
- Lua library folder for easily importing lua files.
- Code snippets for a few useful Figura related things. 

## Libraries

You can change the location of your libraries folder in the settings.

Put lua files in the libraries folder, which can then be imported to your avatar by typing "import" or "require" and then the file name of the library.

Require will copy the file to your avatar folder or a subfolder you can specify in the settings.

Import will copy the contents of the library file into the currently open file.

## Snippets

Snippets for things that are commonly used when making Figura avatars.

(For Figura version 0.1.0, hopefully newer versions don't change syntax)

<details>
<summary>Click to expand</summary>

```
Hide a specific model
Event Chat Recive Message
Event Chat Send Message
Event Entity Init
Event Mouse Scroll
Event Mouse Move
Event Mouse Press
Event Key Press
Event Post Render
Event Post World Render
Event Render
Event Skull Render
Event Tick
Event Use Item
Event World Render
Event World Tick
Action Wheel Page
Action Wheel New Action
```

</details>
