#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Copy URL
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab

# Documentation:
# @raycast.description Copy active tab URL to clipboard
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Use specific node version
NODE_PATH="$HOME/.nvm/versions/node/v22.18.0/bin"
export PATH="$NODE_PATH:$PATH"

tabnab cite --format url --clipboard
