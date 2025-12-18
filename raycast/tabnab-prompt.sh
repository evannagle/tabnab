#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Apply Prompt to Tab
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab
# @raycast.argument1 { "type": "dropdown", "placeholder": "Prompt", "data": [{"title": "action-items", "value": "action-items"}, {"title": "extract-features", "value": "extract-features"}, {"title": "key-points", "value": "key-points"}, {"title": "simplify", "value": "simplify"}, {"title": "summarize", "value": "summarize"}] }

# Documentation:
# @raycast.description Apply a prompt template to the active tab
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Add common paths for node
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/v22.18.0/bin:$PATH"

PROMPT_NAME="$1"

# Apply the prompt
OUTPUT=$(tabnab prompt "$PROMPT_NAME" 2>&1)

if [ $? -eq 0 ]; then
    # Copy to clipboard
    echo "$OUTPUT" | pbcopy

    # Show the result
    echo "$OUTPUT"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✓ Applied prompt '$PROMPT_NAME' - Copied to clipboard!"
else
    echo "Error: Failed to apply prompt '$PROMPT_NAME'"
    echo ""
    echo "$OUTPUT"
    exit 1
fi
