-- Function to find a Chrome tab by URL and return its HTML source
on findChromeTabAndGetHTML(targetURL)
	tell application "Google Chrome"
		try
			-- Get all windows
			set chromeWindows to windows
			
			-- Iterate through each window
			repeat with aWindow in chromeWindows
				-- Get all tabs of the current window
				set tabsList to tabs of aWindow
				
				-- Iterate through each tab
				repeat with aTab in tabsList
					-- Check if the tab's URL matches the target URL 
					if (URL of aTab) contains targetURL then
						-- We found the tab! Execute JavaScript to get the HTML
						set sourceHTML to execute aTab javascript "document.documentElement.outerHTML"
						return sourceHTML -- Return the HTML content
					end if
				end repeat
			end repeat
			
			-- If we reach here, the tab was not found
			return "Tab not found!"
		on error errorMessage
			-- Handle errors gracefully
			return "Error: " & errorMessage
		end try
	end tell
end findChromeTabAndGetHTML -- Be sure to include this line

-- Example usage:
set targetURL to "{{target_url}}"
findChromeTabAndGetHTML(targetURL)

