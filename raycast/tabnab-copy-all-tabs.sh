#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Copy All Tabs
# @raycast.mode compact

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab

# Documentation:
# @raycast.description Copy all open tabs as markdown list
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Use specific node version
NODE_PATH="$HOME/.nvm/versions/node/v22.18.0/bin"
export PATH="$NODE_PATH:$PATH"

# Get all tabs as markdown list
OUTPUT=$(tabnab list --format markdown 2>/dev/null)

# Copy to clipboard
echo "$OUTPUT" | pbcopy

# Count tabs
COUNT=$(echo "$OUTPUT" | wc -l | tr -d ' ')

echo "Copied $COUNT tabs to clipboard"
