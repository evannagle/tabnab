#!/bin/bash

# This script generates individual Raycast scripts for each prompt template
# Run this whenever you add/remove prompts

# Add common paths for node
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/v22.18.0/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPTS_JSON=$(tabnab config list-prompts 2>/dev/null)

# Get list of prompt names
PROMPT_NAMES=$(echo "$PROMPTS_JSON" | grep -E "^  [a-z-]+" | awk '{print $1}')

if [ -z "$PROMPT_NAMES" ]; then
    echo "No prompts found. Run: tabnab config init-prompts"
    exit 1
fi

# Generate main script with all prompts as dropdown
cat > "$SCRIPT_DIR/tabnab-prompt.sh" << 'SCRIPT_HEADER'
#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Apply Prompt to Tab
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab
SCRIPT_HEADER

# Build the dropdown data
echo -n '# @raycast.argument1 { "type": "dropdown", "placeholder": "Prompt", "data": [' >> "$SCRIPT_DIR/tabnab-prompt.sh"

FIRST=true
while IFS= read -r prompt_name; do
    if [ ! -z "$prompt_name" ]; then
        # Get description
        DESC=$(tabnab config show-prompt "$prompt_name" 2>/dev/null | grep '"description"' | cut -d'"' -f4)

        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            echo -n ', ' >> "$SCRIPT_DIR/tabnab-prompt.sh"
        fi

        echo -n "{\"title\": \"$prompt_name\", \"value\": \"$prompt_name\"}" >> "$SCRIPT_DIR/tabnab-prompt.sh"
    fi
done <<< "$PROMPT_NAMES"

cat >> "$SCRIPT_DIR/tabnab-prompt.sh" << 'SCRIPT_FOOTER'
] }

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
SCRIPT_FOOTER

chmod +x "$SCRIPT_DIR/tabnab-prompt.sh"

echo "✓ Generated tabnab-prompt.sh with dropdown"
echo ""
echo "Available prompts:"
echo "$PROMPT_NAMES"
echo ""
echo "Reload Raycast Script Directories to see changes!"
