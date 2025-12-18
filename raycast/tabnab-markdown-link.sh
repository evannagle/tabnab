#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Copy Markdown Link
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab

# Documentation:
# @raycast.description Copy active tab as markdown link: [Title](URL)
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Use specific node version
NODE_PATH="$HOME/.nvm/versions/node/v22.18.0/bin"
export PATH="$NODE_PATH:$PATH"

tabnab cite --format markdown --clipboard

if [ $? -eq 0 ]; then
    echo "Copied markdown link to clipboard"
else
    echo "Error: Failed to generate markdown link"
    exit 1
fi
