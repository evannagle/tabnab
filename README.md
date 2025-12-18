# Tabnab

Extract and process content from Chrome tabs via CLI - scrape, summarize, and analyze web pages.

**Tabnab** is both a powerful CLI tool and a TypeScript library for interacting with Chrome browser tabs on macOS. Extract links, clean article content, generate citations, or use AI to summarize and analyze web pages.

## Features

- **Content Extraction**: Links, metadata, article text, code blocks, tables
- **AI-Powered**: Summarize pages, ask questions, apply custom prompts (via Claude)
- **Multiple Formats**: Output as JSON, Markdown, or plain text
- **Clipboard Integration**: Copy results directly to clipboard
- **Raycast Support**: Pre-built Raycast scripts for quick access
- **TypeScript Library**: Use programmatically in your projects

## Installation

### Global CLI Installation

```bash
npm install -g tabnab
```

### Development Installation

```bash
git clone https://github.com/yourusername/tabnab.git
cd tabnab
npm install
npm link
```

## CLI Usage

### Basic Commands

#### List All Tabs
```bash
# List all Chrome tabs
tabnab list

# Output as markdown
tabnab list --format markdown

# Copy to clipboard
tabnab list --clipboard

# Filter by URL pattern
tabnab list --filter "github.com"

# Search by title
tabnab list --search "documentation"
```

#### Get Active Tab
```bash
# Get currently active tab
tabnab active

# Copy as markdown reference
tabnab active --format markdown --clipboard
```

#### Generate Citation
```bash
# Create markdown citation
tabnab cite

# Get clean URL (removes tracking params)
tabnab cite --format url

# Plain text format
tabnab cite --format text --clipboard
```

### Content Extraction

#### Extract Links
```bash
# Extract all links from active tab
tabnab links --active-only

# Internal links only
tabnab links --active-only --internal-only

# External links only
tabnab links --active-only --external-only

# Filter by URL pattern
tabnab links --active-only --filter "github.com"

# Output as JSON
tabnab links --active-only --format json
```

#### Extract with CSS Selector
```bash
# Extract text content
tabnab extract "h1"

# Extract HTML
tabnab extract "article" --property html

# Extract attribute
tabnab extract "img" --property "attr:src"

# From active tab only
tabnab extract ".post-content" --active-only
```

#### Get Page Metadata
```bash
# Extract Open Graph, Twitter Cards, etc.
tabnab metadata --active-only

# From all tabs matching pattern
tabnab metadata --filter "blog"
```

#### Extract Readable Article Content
```bash
# Get clean article text (uses Mozilla Readability)
tabnab readability --active-only

# Output as markdown
tabnab readability --active-only --format markdown

# Copy to clipboard
tabnab readability --active-only --clipboard
```

#### Get HTML Source
```bash
# Get raw HTML
tabnab source

# Pretty-printed HTML
tabnab source --pretty

# Copy to clipboard
tabnab source --clipboard
```

### AI-Powered Commands

**Note**: AI commands require an Anthropic API key. Set it once:

```bash
# Set API key
tabnab config set-api-key sk-ant-...

# Or use environment variable
export ANTHROPIC_API_KEY=sk-ant-...
```

#### Summarize Page
```bash
# Summarize active tab
tabnab summarize

# Copy summary to clipboard
tabnab summarize --clipboard

# Use specific model
tabnab summarize --model claude-opus-4-20250514

# Adjust creativity
tabnab summarize --temperature 0.3
```

#### Ask Questions
```bash
# Ask about page content
tabnab ask "What are the main features?"

# Copy answer to clipboard
tabnab ask "Summarize the pricing" --clipboard
```

#### Custom Prompts
```bash
# Initialize default prompt templates
tabnab config init-prompts

# List available prompts
tabnab config list-prompts

# Apply a prompt template
tabnab prompt summarize
tabnab prompt extract-features
tabnab prompt action-items
tabnab prompt key-points

# View prompt template
tabnab config show-prompt summarize

# Copy output
tabnab prompt summarize --clipboard
```

### Configuration

```bash
# Set API key
tabnab config set-api-key sk-ant-...

# View API key (masked)
tabnab config get-api-key

# Initialize default prompts
tabnab config init-prompts

# List prompts
tabnab config list-prompts

# Show specific prompt
tabnab config show-prompt summarize

# Delete prompt
tabnab config delete-prompt my-custom-prompt
```

## Raycast Integration

Tabnab includes pre-built Raycast scripts for quick access. See [raycast/README.md](raycast/README.md) for details.

**Available Raycast Commands:**
- Copy Tab Citation
- Extract Links from Tab
- List All Chrome Tabs
- Extract Article Content
- Summarize Active Tab (AI)
- Ask About Active Tab (AI)

## TypeScript Library Usage

### Simple Example

```typescript
import { getActiveChromeTab } from 'tabnab';

const activeTab = await getActiveChromeTab();
const $ = await activeTab.loadDom();

console.log($('title').text());
```

### Extract Data from Page

```typescript
import { getChromeTabs } from 'tabnab';

const tabs = await getChromeTabs();
const hackerNews = tabs.find(
    (tab) => tab.url.hostname === "news.ycombinator.com"
);

if (!hackerNews) {
    console.error("No Hacker News tab found.");
    process.exit(1);
}

console.log(hackerNews.title);

const $ = await hackerNews.loadDom();

$(".titleline a").each((i, el) => {
    console.log(`- [${$(el).text()}](${$(el).attr("href")})`);
});
```

## Custom Prompt Templates

Create custom prompt templates in `~/.tabnab/prompts/`:

```json
{
  "name": "my-prompt",
  "description": "My custom prompt",
  "prompt": "Do something with this content:\n\n{content}",
  "model": "claude-sonnet-4-20250514",
  "temperature": 0.7,
  "maxTokens": 4096
}
```

Then use it:
```bash
tabnab prompt my-prompt
```

## Examples

### Quick Markdown Reference
```bash
# Copy active tab as markdown link
tabnab cite --clipboard
```

### Extract All Links from Documentation
```bash
# Get internal links from docs site
tabnab links --active-only --internal-only --format markdown --clipboard
```

### Summarize Article
```bash
# Get AI summary of current article
tabnab summarize --clipboard
```

### Extract Code Examples
```bash
# Extract all code blocks
tabnab extract "pre code" --active-only
```

### Research Workflow
```bash
# 1. List all research tabs
tabnab list --search "research" --format markdown > research-tabs.md

# 2. Extract article content
tabnab readability --search "research" --format markdown > research-content.md

# 3. Summarize with AI
tabnab ask "What are the common themes across these research papers?"
```

## Requirements

- macOS (uses AppleScript to communicate with Chrome)
- Google Chrome
- Node.js 18+
- Anthropic API key (for AI commands)

## License

GNU GPLv3

## Contributing

Contributions welcome! Please open an issue or PR.
