set urls to {}
set titles to {}
set activeTabs to {}
set output to ""

on registerUrl(theUrl, theTitle, isActive)
    global urls, titles, activeTabs
    
    if theUrl is in urls then return
    if theTitle is in titles then return
    if theTitle starts with "DevTools" then return
    
    set urls to urls & theUrl
    set titles to titles & theTitle
    set activeTabs to activeTabs & isActive
end registerUrl

tell application "Google Chrome"
    set theWindow to (get first window)
    tell theWindow
        set theTab to (get active tab)
        set theUrl to URL of theTab
        set theTitle to title of theTab
        my registerUrl(theUrl, theTitle, true)
    end tell
    
    repeat with theTab in tabs of windows
        set theUrl to URL of theTab
        set theTitle to title of theTab
        my registerUrl(theUrl, theTitle, false)
    end repeat
end tell

repeat with i from 1 to length of urls
    set theUrl to item i of urls
    set theTitle to item i of titles
    set isActive to item i of activeTabs
    set output to output & theUrl & " || " & theTitle & " || " & (isActive as string) & "
"
end repeat

output