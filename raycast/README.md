# Tabnab Raycast Scripts

This directory contains Raycast script commands for quick access to tabnab functionality.

## Installation

1. Install tabnab globally:
   ```bash
   npm install -g tabnab
   # or from this repo:
   npm link
   ```

2. Add scripts to Raycast:
   - Open Raycast Settings
   - Go to Extensions > Script Commands
   - Click "Add Script Directory"
   - Select the `raycast` directory from this repo

3. (Optional) For AI commands, set your Anthropic API key:
   ```bash
   tabnab config set-api-key sk-ant-...
   # or set environment variable:
   export ANTHROPIC_API_KEY=sk-ant-...
   ```

## Available Commands

### Copy Tab Citation
**Command:** `tabnab-cite.sh`
**Icon:** 🔗
**Mode:** Silent

Quickly copy a citation of the active Chrome tab to clipboard.

**Options:**
- Format: Markdown (default), Text, or Clean URL

**Usage:** Opens in Raycast, select format, copies to clipboard

### Extract Links from Tab
**Command:** `tabnab-links.sh`
**Icon:** 🔗
**Mode:** Full Output

Extract all links from the active Chrome tab.

**Options:**
- Filter: All Links (default), Internal Only, or External Only
- Format: Markdown (default), Text, or JSON

**Usage:** Select filter and format, links are copied to clipboard

### List All Chrome Tabs
**Command:** `tabnab-list.sh`
**Icon:** 📑
**Mode:** Full Output

List all open Chrome tabs with titles and URLs.

**Options:**
- Format: Markdown (default), Text, or JSON

**Usage:** Lists all tabs and copies to clipboard

### Extract Article Content
**Command:** `tabnab-readability.sh`
**Icon:** 📄
**Mode:** Full Output

Extract clean, readable article content from the active tab using Mozilla Readability.

**Options:**
- Format: Markdown (default), Text, or JSON

**Usage:** Extracts article and copies to clipboard

### Summarize Active Tab (AI)
**Command:** `tabnab-summarize.sh`
**Icon:** 📝
**Mode:** Full Output

Generate a concise summary of the active tab using Claude AI.

**Requirements:** `ANTHROPIC_API_KEY` must be set

**Usage:** Automatically summarizes page and copies to clipboard

### Ask About Active Tab (AI)
**Command:** `tabnab-ask.sh`
**Icon:** 💬
**Mode:** Full Output

Ask a question about the active tab content using Claude AI.

**Requirements:** `ANTHROPIC_API_KEY` must be set

**Options:**
- Question: Your question about the page content

**Usage:** Enter your question, get AI-generated answer copied to clipboard

## Tips

- All commands automatically copy output to clipboard for easy pasting
- Use keyboard shortcuts in Raycast for even faster access
- Combine with Raycast's clipboard history for powerful workflows
- AI commands work best on article/blog content (uses Readability extraction)

## Customization

You can edit these scripts to:
- Change default formats
- Add custom filters or options
- Create new commands combining multiple tabnab features
- Modify output formatting

## Troubleshooting

**Command not found:**
- Make sure tabnab is installed globally or linked
- Check that `/usr/local/bin` is in your PATH

**AI commands fail:**
- Verify `ANTHROPIC_API_KEY` is set:
  ```bash
  tabnab config get-api-key
  ```
- Or set it:
  ```bash
  tabnab config set-api-key sk-ant-...
  ```

**No Chrome tabs found:**
- Make sure Google Chrome is running
- Check that you have at least one tab open
