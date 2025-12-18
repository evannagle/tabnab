#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Copy Tab Citation
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab
# @raycast.argument1 { "type": "dropdown", "placeholder": "Format", "data": [{"title": "Markdown", "value": "markdown"}, {"title": "Text", "value": "text"}, {"title": "Clean URL", "value": "url"}], "optional": true }

# Documentation:
# @raycast.description Copy a citation of the active Chrome tab
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Use specific node version
NODE_PATH="$HOME/.nvm/versions/node/v22.18.0/bin"
export PATH="$NODE_PATH:$PATH"

FORMAT="${1:-markdown}"

tabnab cite --format "$FORMAT" --clipboard

if [ $? -eq 0 ]; then
    echo "Copied citation to clipboard"
else
    echo "Error: Failed to generate citation"
    exit 1
fi
