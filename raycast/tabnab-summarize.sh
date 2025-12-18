#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Summarize Active Tab
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab
# @raycast.needsConfirmation false

# Documentation:
# @raycast.description Summarize the active Chrome tab using Claude AI
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Use specific node version
NODE_PATH="$HOME/.nvm/versions/node/v22.18.0/bin"
export PATH="$NODE_PATH:$PATH"

# Get output without clipboard first
OUTPUT=$(tabnab summarize 2>&1)

if [ $? -eq 0 ]; then
    # Copy to clipboard
    echo "$OUTPUT" | pbcopy

    # Show the output
    echo "$OUTPUT"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✓ Summary copied to clipboard!"
else
    echo "Error: Failed to summarize. Make sure ANTHROPIC_API_KEY is set."
    echo "$OUTPUT"
    exit 1
fi
