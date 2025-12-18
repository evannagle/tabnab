#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Ask About Active Tab
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab
# @raycast.argument1 { "type": "text", "placeholder": "Question" }

# Documentation:
# @raycast.description Ask a question about the active tab content using Claude AI
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Use specific node version
NODE_PATH="$HOME/.nvm/versions/node/v22.18.0/bin"
export PATH="$NODE_PATH:$PATH"

QUESTION="$1"

if [ -z "$QUESTION" ]; then
    echo "Error: Please provide a question"
    exit 1
fi

# Get output without clipboard first
OUTPUT=$(tabnab ask "$QUESTION" 2>&1)

if [ $? -eq 0 ]; then
    # Copy to clipboard
    echo "$OUTPUT" | pbcopy

    # Show the output
    echo "$OUTPUT"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✓ Answer copied to clipboard!"
else
    echo "Error: Failed to get answer. Make sure ANTHROPIC_API_KEY is set."
    echo "$OUTPUT"
    exit 1
fi
