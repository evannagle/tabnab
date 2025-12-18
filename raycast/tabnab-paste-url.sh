#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Paste URL
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab

# Documentation:
# @raycast.description Paste active tab URL into the current app
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Use specific node version
NODE_PATH="$HOME/.nvm/versions/node/v22.18.0/bin"
export PATH="$NODE_PATH:$PATH"

# Get the URL
URL=$(tabnab cite --format url 2>/dev/null)

# Type it directly using keystroke (bypasses clipboard paste issues)
osascript -e "tell application \"System Events\" to keystroke \"$URL\""
