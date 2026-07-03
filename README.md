# Figura VSCode Extension

This extension aims to help in making lua scripts for the Figura Minecraft mod.

## Feature Overview

- Autocompletion support for Blockbench files, including model part paths, animation names, and texture names.
- Autocompletion for .ogg sound file names.
- Libraries folder for quick access to frequently used lua scripts.
- Code snippets for common Figura boilerplate code.
- Also adds icons for avatar.json and bbmodel files if you have [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme) installed.

## Getting started

Make sure to open a folder or workspace for this extension to work, and not a single lua file directly.

After installing the extension, click the newly added triangle icon on the left sidebar to open the menu.

### Libraries

Choose the `Open libraries folder` option in the menu.

Put lua files in the libraries folder, which can then be imported to your avatar by typing "import" or "require" and then the file name of the library.

Require will copy the file to your avatar folder or a subfolder you can specify in the settings.

Import will copy the contents of the library file into the currently open file.

### Snippets

This extension includes snippets for things that are commonly used when making Figura avatars.

You can turn them on or off depending on your needs in the menu.

## Disclaimer

This is an unofficial extension by a community member and is not affiliated with the Figura Minecraft mod or their development team.
