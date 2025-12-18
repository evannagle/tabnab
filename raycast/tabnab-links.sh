#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Extract Links from Tab
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab
# @raycast.argument1 { "type": "dropdown", "placeholder": "Filter", "data": [{"title": "All Links", "value": "all"}, {"title": "Internal Only", "value": "internal"}, {"title": "External Only", "value": "external"}], "optional": true }
# @raycast.argument2 { "type": "dropdown", "placeholder": "Format", "data": [{"title": "Markdown", "value": "markdown"}, {"title": "Text", "value": "text"}, {"title": "JSON", "value": "json"}], "optional": true }

# Documentation:
# @raycast.description Extract all links from the active Chrome tab
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Use specific node version
NODE_PATH="$HOME/.nvm/versions/node/v22.18.0/bin"
export PATH="$NODE_PATH:$PATH"

FILTER="${1:-all}"
FORMAT="${2:-markdown}"

CMD="tabnab links --active-only --format $FORMAT"

case "$FILTER" in
    "internal")
        CMD="$CMD --internal-only"
        ;;
    "external")
        CMD="$CMD --external-only"
        ;;
esac

# First, get the output to show preview
OUTPUT=$($CMD 2>&1)

if [ $? -eq 0 ]; then
    # Copy to clipboard
    echo "$OUTPUT" | pbcopy

    # Count links and show preview
    LINK_COUNT=$(echo "$OUTPUT" | grep -c "^- \[")

    echo "$OUTPUT"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✓ Found $LINK_COUNT link(s) - Copied to clipboard!"
else
    echo "Error: Failed to extract links"
    echo "$OUTPUT"
    exit 1
fi
