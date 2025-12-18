#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Extract Article Content
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab
# @raycast.argument1 { "type": "dropdown", "placeholder": "Format", "data": [{"title": "Markdown", "value": "markdown"}, {"title": "Text", "value": "text"}, {"title": "JSON", "value": "json"}], "optional": true }

# Documentation:
# @raycast.description Extract clean article content from active tab
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Use specific node version
NODE_PATH="$HOME/.nvm/versions/node/v22.18.0/bin"
export PATH="$NODE_PATH:$PATH"

FORMAT="${1:-markdown}"

# Get full content without clipboard first
OUTPUT=$(tabnab readability --active-only --format "$FORMAT" 2>&1)

if [ $? -eq 0 ]; then
    # Copy full content to clipboard
    echo "$OUTPUT" | pbcopy

    # Show excerpt and stats
    WORD_COUNT=$(echo "$OUTPUT" | wc -w | tr -d ' ')
    CHAR_COUNT=$(echo "$OUTPUT" | wc -c | tr -d ' ')

    # Extract first 500 characters for preview
    EXCERPT=$(echo "$OUTPUT" | head -c 500)

    echo "Article Preview:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$EXCERPT"

    # Add ellipsis if content is longer
    if [ ${#OUTPUT} -gt 500 ]; then
        echo "..."
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Stats: $WORD_COUNT words, $CHAR_COUNT characters"
    echo "✓ Full article content copied to clipboard!"
else
    echo "Error: Failed to extract article content"
    echo "$OUTPUT"
    exit 1
fi
