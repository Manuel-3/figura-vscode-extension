# Change Log

## 0.0.1

- Autocompletion for figura global variables

## 0.0.2

- Bugfixes

## 0.0.3

- Bugfixes

## 0.0.4

- Variable name completion

## 0.1.0

- Code snippets
- Improved variable name completion

## 0.1.1

- Added missing functions for Player API

## 0.2.0

- Now loads model.bbmodel or player_model.bbmodel to allow for Blockbench suggestions

## 0.2.1

- Fix accessing model parts with spaces in the name

## 0.3.0

- Compatibility for sumneko's Language Server + figura documentation (can be turned on in settings)
- Option to automatically download latest figura documentation from https://github.com/GrandpaScout/Figura-VSCode-Documentation
- Added missing functions to some APIs
- Fix snippets only showing up when pressing ctrl+space

## 0.3.1

- Adjust to change in the .version file

## 0.3.2

- Now installs the documentation in the current workspace

## 0.3.3

- Shows a button to click on which opens the settings when a new documentation has been installed

## 0.4.0

- Libraries

## 0.4.1

- Fix crash at startup

## 0.4.2

- Setting for libraries folder name
- Now checks current workspace for libraries as well

## 0.4.3

- Keep docs up to date is now enabled by default
- Lua Language Server support will be automatically enabled, if sumneko language server is detected

# 0.4.4

- Bugfix: No longer shows language server enabled message if it was already enabled

# 0.4.5

- Edited README

# 0.4.6

- Add API autocomplete for Figura-0.0.7

# 0.4.7

- Edited README

# 0.5.0

- Target Figura version in settings for internal autocomplete
- Therefore adding back Figura-0.0.6 autocomplete as an option
- Now checks if a .vscode folder is present to enable or disable language server support
- Allow custom documentation download url
- Allow local documentation path
- Entire library folder path can now be changed

# 0.5.1

- Fix bug with multiplying model part suggestions

# 0.5.2

- Add Figura-0.0.8 (animations only) target

# 0.5.3

- Instead of checking for a .vscode folder now uses the enable documentation setting to enable or disable language server compatibility mode
- Add Figura-0.0.8-rc.6 target
- Fix bug with showing workspace notification

# 0.5.4

- Can now autocomplete after a method call
- Add Figura-0.0.8-rc.7 target
- Fix Figura-0.0.8-rc.6 target

# 0.5.5

- Add Figura-0.0.8-rc.9 target

# 0.5.6

- Changed documentation source settings to allow different sources per target version

# 0.5.7

- Fix sometimes not showing "documentation now installed" popup

# 0.5.8

- Removed redundancy in setting description
