#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Paste URL
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab

# Documentation:
# @raycast.description Paste active tab URL into the current app
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Pure AppleScript - no Node overhead, clipboard paste instead of keystroke
osascript <<'EOF'
tell application "Google Chrome"
    set tabURL to URL of active tab of front window
end tell
set the clipboard to tabURL
tell application "System Events" to keystroke "v" using command down
EOF
