#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Paste Markdown Link
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🤖
# @raycast.packageName Tabnab

# Documentation:
# @raycast.description Paste active tab as markdown link: [Title](URL)
# @raycast.author Evan Nagle
# @raycast.authorURL https://github.com/evannagle

# Pure AppleScript - no Node overhead, clipboard paste instead of keystroke
osascript <<'EOF'
tell application "Google Chrome"
    set tabTitle to title of active tab of front window
    set tabURL to URL of active tab of front window
end tell
set mdLink to "[" & tabTitle & "](" & tabURL & ")"
set the clipboard to mdLink
tell application "System Events" to keystroke "v" using command down
EOF
