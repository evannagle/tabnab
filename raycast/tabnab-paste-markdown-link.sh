#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Paste Markdown Link
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab

# Documentation:
# @raycast.description Paste active tab as markdown link: [Title](URL)
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Use specific node version
NODE_PATH="$HOME/.nvm/versions/node/v22.18.0/bin"
export PATH="$NODE_PATH:$PATH"

# Get the markdown link
LINK=$(tabnab cite --format markdown 2>/dev/null)

# Type it directly using keystroke (bypasses clipboard paste issues)
osascript -e "tell application \"System Events\" to keystroke \"$LINK\""
