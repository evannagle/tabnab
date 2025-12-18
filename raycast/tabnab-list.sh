#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title List All Chrome Tabs
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab
# @raycast.argument1 { "type": "dropdown", "placeholder": "Format", "data": [{"title": "Markdown", "value": "markdown"}, {"title": "Text", "value": "text"}, {"title": "JSON", "value": "json"}], "optional": true }

# Documentation:
# @raycast.description List all open Chrome tabs
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Use specific node version
NODE_PATH="$HOME/.nvm/versions/node/v22.18.0/bin"
export PATH="$NODE_PATH:$PATH"

FORMAT="${1:-markdown}"

tabnab list --format "$FORMAT" --clipboard

if [ $? -eq 0 ]; then
    echo "Tab list copied to clipboard!"
else
    echo "Error: Failed to list tabs"
    exit 1
fi
