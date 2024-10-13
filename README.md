# Figura VSCode Extension

Disclaimer: This is an unofficial extension and is not affiliated with the Figura Minecraft mod or their development team.

This extension aims to help in making lua scripts for the Figura Minecraft mod.

## Features

- Autocompletion support for Blockbench files, including model part paths, animation names, and texture names.
- Autocompletion for .ogg sound files.
- Can set up the lua language server at the press of a button.
- Library folder for quick access to frequently used Lua scripts.
- Code snippets for common Figura boilerplate code.
- Also adds icons for avatar.json and bbmodel files if you have [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme) installed.

## Getting started

### Settings
After installing the extension, click the newly added icon on the left sidebar.

### Lua Language Support and Figura Documentation

You can choose to install third party lua language server, and third party Figura documentation. While this is highly recommended to provide the best user experience, they are also not affiliated with this extension, and are made and maintained by third parties, so use them at your own risk! Always make sure to trust the sources before intalling anything!

### Libraries

You can also set up a library folder and put lua scripts in there.

Put lua files in the libraries folder, which can then be imported to your avatar by typing "import" or "require" and then the file name of the library.

Require will copy the file to your avatar folder or a subfolder you can specify in the settings.

Import will copy the contents of the library file into the currently open file.

### Snippets

This extension includes snippets for things that are commonly used when making Figura avatars.

You can turn them on or off depending on your needs.

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
