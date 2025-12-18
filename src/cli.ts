import { Command } from "commander";
import { getActiveChromeTab, getChromeTabs } from "./chrome-tab";
import { ChromeTab } from "./chrome-tab";
import type { CheerioAPI } from "cheerio";
import { Readability } from "@mozilla/readability";
import { Window } from "happy-dom";
import metascraper from "metascraper";
import metascraperAuthor from "metascraper-author";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperLogo from "metascraper-logo";
import metascraperPublisher from "metascraper-publisher";
import metascraperTitle from "metascraper-title";
import metascraperUrl from "metascraper-url";
import normalizeUrl from "normalize-url";
import * as AI from "./ai";

const program = new Command();

interface OutputOptions {
  format: "json" | "markdown" | "text" | "clipboard";
  selector?: string;
  property?: string;
  includeUrl?: boolean;
  includeTitle?: boolean;
}

/**
 * Format tabs based on the specified output format
 */
async function formatOutput(
  tabs: ChromeTab[],
  options: OutputOptions,
): Promise<string> {
  const { format, selector, property } = options;

  // If selector is provided, extract content from each tab
  if (selector) {
    const results = await Promise.all(
      tabs.map(async (tab) => {
        try {
          const $ = await tab.loadDom();
          const content = extractContent($, selector, property);
          return {
            title: tab.title,
            url: tab.url.toString(),
            content,
          };
        } catch (error) {
          return {
            title: tab.title,
            url: tab.url.toString(),
            content: null,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );

    return formatResults(results, format);
  }

  // Otherwise, just format the tab information
  return formatTabs(tabs, format, options);
}

/**
 * Extract content from DOM using selector
 */
function extractContent(
  $: CheerioAPI,
  selector: string,
  property?: string,
): string | null {
  const element = $(selector);

  if (!element.length) {
    return null;
  }

  if (property === "html") {
    return element.html();
  }

  if (property === "attr") {
    // Get all attributes as JSON
    const attrs = element.get(0)?.attribs || {};
    return JSON.stringify(attrs);
  }

  if (property?.startsWith("attr:")) {
    const attrName = property.replace("attr:", "");
    return element.attr(attrName) || null;
  }

  // Default to text content
  return element.text().trim();
}

/**
 * Format extraction results
 */
function formatResults(
  results: Array<{
    title: string;
    url: string;
    content: string | null;
    error?: string;
  }>,
  format: string,
): string {
  switch (format) {
    case "json":
      return JSON.stringify(results, null, 2);

    case "markdown":
      return results
        .map((r) => {
          let md = `## ${r.title}\n\n`;
          md += `**URL:** ${r.url}\n\n`;
          if (r.error) {
            md += `**Error:** ${r.error}\n\n`;
          } else if (r.content) {
            md += `**Content:**\n\`\`\`\n${r.content}\n\`\`\`\n\n`;
          } else {
            md += `**Content:** (not found)\n\n`;
          }
          return md;
        })
        .join("---\n\n");

    case "text":
    case "clipboard":
    default:
      return results
        .map((r) => {
          let text = `${r.title}\n`;
          text += `${r.url}\n`;
          if (r.error) {
            text += `Error: ${r.error}\n`;
          } else if (r.content) {
            text += `${r.content}\n`;
          } else {
            text += `(content not found)\n`;
          }
          return text;
        })
        .join("\n---\n\n");
  }
}

/**
 * Format tabs without content extraction
 */
function formatTabs(
  tabs: ChromeTab[],
  format: string,
  options: OutputOptions,
): string {
  const { includeUrl = true, includeTitle = true } = options;

  switch (format) {
    case "json":
      return JSON.stringify(
        tabs.map((tab) => ({
          title: tab.title,
          url: tab.url.toString(),
          isActive: tab.isActive,
        })),
        null,
        2,
      );

    case "markdown":
      return tabs
        .map((tab) => {
          const active = tab.isActive ? " (active)" : "";
          if (includeTitle && includeUrl) {
            return `- [${tab.title}](${tab.url.toString()})${active}`;
          } else if (includeTitle) {
            return `- ${tab.title}${active}`;
          } else {
            return `- ${tab.url.toString()}${active}`;
          }
        })
        .join("\n");

    case "text":
    case "clipboard":
    default:
      return tabs
        .map((tab) => {
          const parts: string[] = [];
          if (includeTitle) parts.push(tab.title);
          if (includeUrl) parts.push(tab.url.toString());
          return parts.join(" - ");
        })
        .join("\n");
  }
}

/**
 * Copy to clipboard (macOS)
 */
async function copyToClipboard(content: string): Promise<void> {
  const { spawn } = await import("child_process");

  return new Promise((resolve, reject) => {
    const pbcopy = spawn("pbcopy");

    pbcopy.stdin.write(content);
    pbcopy.stdin.end();

    pbcopy.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pbcopy exited with code ${code}`));
      }
    });

    pbcopy.on("error", reject);
  });
}

// Main program
program
  .name("tabnab")
  .description("Get and extract content from Chrome tabs")
  .version("1.0.1");

// List all tabs
program
  .command("list")
  .description("List all open Chrome tabs")
  .option(
    "-f, --format <format>",
    "Output format (json, markdown, text)",
    "text",
  )
  .option("--url-only", "Only output URLs")
  .option("--title-only", "Only output titles")
  .option("-c, --clipboard", "Copy output to clipboard")
  .option("--filter <pattern>", "Filter tabs by URL pattern (regex)")
  .option("--search <text>", "Search tabs by title (case-insensitive)")
  .action(async (options) => {
    try {
      let tabs = await getChromeTabs();

      // Apply filters
      if (options.filter) {
        const regex = new RegExp(options.filter, "i");
        tabs = tabs.filter((tab) => regex.test(tab.url.toString()));
      }

      if (options.search) {
        const searchLower = options.search.toLowerCase();
        tabs = tabs.filter((tab) =>
          tab.title.toLowerCase().includes(searchLower),
        );
      }

      const format = options.clipboard ? "clipboard" : options.format;

      const output = formatTabs(tabs, format, {
        format,
        includeUrl: !options.titleOnly,
        includeTitle: !options.urlOnly,
      });

      if (options.clipboard) {
        await copyToClipboard(output);
        console.log(`✓ Copied ${tabs.length} tab(s) to clipboard`);
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Get active tab
program
  .command("active")
  .description("Get the currently active Chrome tab")
  .option(
    "-f, --format <format>",
    "Output format (json, markdown, text)",
    "text",
  )
  .option("-c, --clipboard", "Copy output to clipboard")
  .action(async (options) => {
    try {
      const tab = await getActiveChromeTab();

      if (!tab) {
        console.error("No active Chrome tab found");
        process.exit(1);
      }

      const format = options.clipboard ? "clipboard" : options.format;
      const output = formatTabs([tab], format, {
        format,
        includeUrl: true,
        includeTitle: true,
      });

      if (options.clipboard) {
        await copyToClipboard(output);
        console.log("✓ Copied active tab to clipboard");
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Extract content from tabs
program
  .command("extract <selector>")
  .description("Extract content from Chrome tabs using CSS selector")
  .option(
    "-f, --format <format>",
    "Output format (json, markdown, text)",
    "text",
  )
  .option(
    "-p, --property <property>",
    "Property to extract (text, html, attr, attr:name)",
  )
  .option("-a, --active-only", "Only extract from active tab")
  .option("-c, --clipboard", "Copy output to clipboard")
  .option("--filter <pattern>", "Filter tabs by URL pattern (regex)")
  .option("--search <text>", "Search tabs by title (case-insensitive)")
  .action(async (selector, options) => {
    try {
      let tabs = options.activeOnly
        ? [await getActiveChromeTab()].filter((t): t is ChromeTab => t !== null)
        : await getChromeTabs();

      // Apply filters
      if (options.filter) {
        const regex = new RegExp(options.filter, "i");
        tabs = tabs.filter((tab) => regex.test(tab.url.toString()));
      }

      if (options.search) {
        const searchLower = options.search.toLowerCase();
        tabs = tabs.filter((tab) =>
          tab.title.toLowerCase().includes(searchLower),
        );
      }

      const format = options.clipboard ? "clipboard" : options.format;

      const output = await formatOutput(tabs, {
        format,
        selector,
        property: options.property || "text",
      });

      if (options.clipboard) {
        await copyToClipboard(output);
        console.log(
          `✓ Copied extracted content from ${tabs.length} tab(s) to clipboard`,
        );
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Get source of active tab
program
  .command("source")
  .description("Get HTML source of the active tab")
  .option("-c, --clipboard", "Copy source to clipboard")
  .option("--pretty", "Pretty print HTML")
  .action(async (options) => {
    try {
      const tab = await getActiveChromeTab();

      if (!tab) {
        console.error("No active Chrome tab found");
        process.exit(1);
      }

      let source = await tab.getHtmlSource();

      if (options.pretty) {
        const $ = await tab.loadDom();
        source = $.html();
      }

      if (options.clipboard) {
        await copyToClipboard(source);
        console.log("✓ Copied HTML source to clipboard");
      } else {
        console.log(source);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Extract all links from tab(s)
program
  .command("links")
  .description("Extract all links from Chrome tabs")
  .option(
    "-f, --format <format>",
    "Output format (json, markdown, text)",
    "text",
  )
  .option("-a, --active-only", "Only extract from active tab")
  .option("-c, --clipboard", "Copy output to clipboard")
  .option("--internal-only", "Only include internal links (same domain)")
  .option("--external-only", "Only include external links (different domain)")
  .option("--filter <pattern>", "Filter links by URL pattern (regex)")
  .option("--search <text>", "Search tabs by title (case-insensitive)")
  .action(async (options) => {
    try {
      let tabs = options.activeOnly
        ? [await getActiveChromeTab()].filter((t): t is ChromeTab => t !== null)
        : await getChromeTabs();

      if (options.search) {
        const searchLower = options.search.toLowerCase();
        tabs = tabs.filter((tab) =>
          tab.title.toLowerCase().includes(searchLower),
        );
      }

      const results = await Promise.all(
        tabs.map(async (tab) => {
          const $ = await tab.loadDom();
          const domain = tab.url.hostname;

          const links: Array<{ href: string; text: string }> = [];

          $("a[href]").each((_, el) => {
            const href = $(el).attr("href");
            const text = $(el).text().trim();

            if (!href) return;

            try {
              const linkUrl = new URL(href, tab.url.toString());
              const isInternal = linkUrl.hostname === domain;

              // Apply filters
              if (options.internalOnly && !isInternal) return;
              if (options.externalOnly && isInternal) return;
              if (
                options.filter &&
                !new RegExp(options.filter, "i").test(linkUrl.toString())
              )
                return;

              links.push({
                href: linkUrl.toString(),
                text: text || href,
              });
            } catch {
              // Skip invalid URLs
            }
          });

          return {
            tab: tab.title,
            url: tab.url.toString(),
            links,
          };
        }),
      );

      const format = options.clipboard ? "clipboard" : options.format;
      let output = "";

      if (format === "json") {
        output = JSON.stringify(results, null, 2);
      } else if (format === "markdown") {
        output = results
          .map((r) => {
            let md = `## ${r.tab}\n\n`;
            r.links.forEach((link) => {
              md += `- [${link.text}](${link.href})\n`;
            });
            return md;
          })
          .join("\n");
      } else {
        output = results
          .map((r) => {
            let text = `${r.tab}\n${"=".repeat(r.tab.length)}\n`;
            r.links.forEach((link) => {
              text += `${link.text}\n${link.href}\n\n`;
            });
            return text;
          })
          .join("\n");
      }

      if (options.clipboard) {
        await copyToClipboard(output);
        const totalLinks = results.reduce((sum, r) => sum + r.links.length, 0);
        console.log(
          `✓ Copied ${totalLinks} link(s) from ${results.length} tab(s) to clipboard`,
        );
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Extract metadata from tab(s)
program
  .command("metadata")
  .description("Extract metadata (Open Graph, Twitter Cards, etc) from tabs")
  .option("-a, --active-only", "Only extract from active tab")
  .option("-c, --clipboard", "Copy output to clipboard")
  .option("--filter <pattern>", "Filter tabs by URL pattern (regex)")
  .option("--search <text>", "Search tabs by title (case-insensitive)")
  .action(async (options) => {
    try {
      let tabs = options.activeOnly
        ? [await getActiveChromeTab()].filter((t): t is ChromeTab => t !== null)
        : await getChromeTabs();

      if (options.filter) {
        const regex = new RegExp(options.filter, "i");
        tabs = tabs.filter((tab) => regex.test(tab.url.toString()));
      }

      if (options.search) {
        const searchLower = options.search.toLowerCase();
        tabs = tabs.filter((tab) =>
          tab.title.toLowerCase().includes(searchLower),
        );
      }

      const scraper = metascraper([
        metascraperAuthor(),
        metascraperDate(),
        metascraperDescription(),
        metascraperImage(),
        metascraperLogo(),
        metascraperPublisher(),
        metascraperTitle(),
        metascraperUrl(),
      ]);

      const results = await Promise.all(
        tabs.map(async (tab) => {
          const html = await tab.getHtmlSource();
          const metadata = await scraper({
            html,
            url: tab.url.toString(),
          });

          return {
            tab: tab.title,
            url: tab.url.toString(),
            metadata,
          };
        }),
      );

      const output = JSON.stringify(results, null, 2);

      if (options.clipboard) {
        await copyToClipboard(output);
        console.log(
          `✓ Copied metadata from ${results.length} tab(s) to clipboard`,
        );
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Extract readable article content
program
  .command("readability")
  .description("Extract main article content using Mozilla Readability")
  .option(
    "-f, --format <format>",
    "Output format (json, markdown, text)",
    "text",
  )
  .option("-a, --active-only", "Only extract from active tab")
  .option("-c, --clipboard", "Copy output to clipboard")
  .option("--filter <pattern>", "Filter tabs by URL pattern (regex)")
  .option("--search <text>", "Search tabs by title (case-insensitive)")
  .action(async (options) => {
    try {
      let tabs = options.activeOnly
        ? [await getActiveChromeTab()].filter((t): t is ChromeTab => t !== null)
        : await getChromeTabs();

      if (options.filter) {
        const regex = new RegExp(options.filter, "i");
        tabs = tabs.filter((tab) => regex.test(tab.url.toString()));
      }

      if (options.search) {
        const searchLower = options.search.toLowerCase();
        tabs = tabs.filter((tab) =>
          tab.title.toLowerCase().includes(searchLower),
        );
      }

      const results = await Promise.all(
        tabs.map(async (tab) => {
          const html = await tab.getHtmlSource();
          const window = new Window();
          window.document.write(html);
          const reader = new Readability(window.document);
          const article = reader.parse();

          return {
            tab: tab.title,
            url: tab.url.toString(),
            article,
          };
        }),
      );

      const format = options.clipboard ? "clipboard" : options.format;
      let output = "";

      if (format === "json") {
        output = JSON.stringify(results, null, 2);
      } else if (format === "markdown") {
        output = results
          .map((r) => {
            if (!r.article)
              return `## ${r.tab}\n\n*Could not extract article content*\n\n`;
            let md = `# ${r.article.title}\n\n`;
            md += `**Author:** ${r.article.byline || "Unknown"}\n`;
            md += `**URL:** ${r.url}\n\n`;
            md += r.article.textContent;
            return md;
          })
          .join("\n\n---\n\n");
      } else {
        output = results
          .map((r) => {
            if (!r.article)
              return `${r.tab}\n\nCould not extract article content\n\n`;
            let text = `${r.article.title}\n${"=".repeat(r.article.title.length)}\n`;
            if (r.article.byline) text += `By ${r.article.byline}\n`;
            text += `\n${r.article.textContent}\n`;
            return text;
          })
          .join("\n---\n\n");
      }

      if (options.clipboard) {
        await copyToClipboard(output);
        console.log(
          `✓ Copied article content from ${results.length} tab(s) to clipboard`,
        );
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Generate citation/reference
program
  .command("cite")
  .description("Generate citation or reference for tab")
  .option(
    "-f, --format <format>",
    "Citation format (markdown, text, url)",
    "markdown",
  )
  .option("-c, --clipboard", "Copy output to clipboard")
  .action(async (options) => {
    try {
      const tab = await getActiveChromeTab();

      if (!tab) {
        console.error("No active Chrome tab found");
        process.exit(1);
      }

      const cleanUrl = normalizeUrl(tab.url.toString(), {
        removeQueryParameters: [/^utm_/i, "ref", "source", "fbclid", "gclid"],
      });

      let output = "";

      if (options.format === "markdown") {
        output = `[${tab.title}](${cleanUrl})`;
      } else if (options.format === "url") {
        output = cleanUrl;
      } else {
        output = `${tab.title}\n${cleanUrl}`;
      }

      if (options.clipboard) {
        await copyToClipboard(output);
        console.log("✓ Copied citation to clipboard");
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Summarize tab content with AI
program
  .command("summarize")
  .description("Summarize page content using Claude AI")
  .option("-a, --active-only", "Only summarize active tab (default)")
  .option("-c, --clipboard", "Copy output to clipboard")
  .option("--model <model>", "Claude model to use")
  .option("--temperature <temp>", "Temperature (0-1)", parseFloat)
  .action(async (options) => {
    try {
      const tab = await getActiveChromeTab();

      if (!tab) {
        console.error("No active Chrome tab found");
        process.exit(1);
      }

      console.error("Extracting article content...");
      const html = await tab.getHtmlSource();

      const window = new Window();
      window.document.write(html);
      const reader = new Readability(window.document);
      const article = reader.parse();

      if (!article) {
        console.error("Could not extract article content from page");
        process.exit(1);
      }

      console.error("Summarizing with Claude...");
      const summary = await AI.callClaude(
        article.textContent,
        "Summarize this webpage in 3-5 concise bullet points:\n\n{content}",
        {
          model: options.model,
          temperature: options.temperature,
        },
      );

      const output = `# ${article.title}\n\n${summary}\n\nSource: ${tab.url.toString()}`;

      if (options.clipboard) {
        await copyToClipboard(output);
        console.log("✓ Copied summary to clipboard");
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Ask a question about tab content
program
  .command("ask <question>")
  .description("Ask a question about the page content using Claude AI")
  .option("-a, --active-only", "Only analyze active tab (default)")
  .option("-c, --clipboard", "Copy output to clipboard")
  .option("--model <model>", "Claude model to use")
  .option("--temperature <temp>", "Temperature (0-1)", parseFloat)
  .action(async (question, options) => {
    try {
      const tab = await getActiveChromeTab();

      if (!tab) {
        console.error("No active Chrome tab found");
        process.exit(1);
      }

      console.error("Extracting page content...");
      const html = await tab.getHtmlSource();
      const window = new Window();
      window.document.write(html);
      const reader = new Readability(window.document);
      const article = reader.parse();

      if (!article) {
        console.error("Could not extract content from page");
        process.exit(1);
      }

      console.error("Asking Claude...");
      const answer = await AI.callClaude(
        article.textContent,
        `Answer this question about the following webpage content:\n\nQuestion: ${question}\n\nContent:\n{content}`,
        {
          model: options.model,
          temperature: options.temperature,
        },
      );

      const output = `Question: ${question}\n\n${answer}\n\nSource: ${tab.url.toString()}`;

      if (options.clipboard) {
        await copyToClipboard(output);
        console.log("✓ Copied answer to clipboard");
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Apply a prompt template
program
  .command("prompt <template>")
  .description("Apply a custom prompt template to page content")
  .option("-a, --active-only", "Only process active tab (default)")
  .option("-c, --clipboard", "Copy output to clipboard")
  .action(async (template, options) => {
    try {
      const tab = await getActiveChromeTab();

      if (!tab) {
        console.error("No active Chrome tab found");
        process.exit(1);
      }

      console.error("Extracting page content...");
      const html = await tab.getHtmlSource();
      const window = new Window();
      window.document.write(html);
      const reader = new Readability(window.document);
      const article = reader.parse();

      if (!article) {
        console.error("Could not extract content from page");
        process.exit(1);
      }

      console.error(`Applying prompt template '${template}'...`);
      const result = await AI.applyPromptTemplate(
        article.textContent,
        template,
      );

      const output = `${result}\n\nSource: ${tab.url.toString()}`;

      if (options.clipboard) {
        await copyToClipboard(output);
        console.log("✓ Copied result to clipboard");
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Manage configuration and prompts
const configCmd = program
  .command("config")
  .description("Manage tabnab configuration");

configCmd
  .command("set-api-key <key>")
  .description("Set Anthropic API key")
  .action((key) => {
    AI.setApiKey(key);
    console.log("✓ API key saved");
  });

configCmd
  .command("get-api-key")
  .description("Show current API key")
  .action(() => {
    const key = AI.getApiKey();
    if (key) {
      console.log(
        `Current API key: ${key.substring(0, 8)}...${key.substring(key.length - 4)}`,
      );
    } else {
      console.log("No API key set");
    }
  });

configCmd
  .command("init-prompts")
  .description("Initialize default prompt templates")
  .action(() => {
    AI.initializeDefaultPrompts();
    console.log(`✓ Initialized default prompts in ${AI.getPromptsDir()}`);
  });

configCmd
  .command("list-prompts")
  .description("List all available prompt templates")
  .action(() => {
    const prompts = AI.listPrompts();
    if (prompts.length === 0) {
      console.log(
        "No prompts found. Run 'tabnab config init-prompts' to create defaults.",
      );
    } else {
      console.log("Available prompt templates:\n");
      prompts.forEach((p) => {
        console.log(`  ${p.name}`);
        console.log(`    ${p.description}`);
        console.log();
      });
    }
  });

configCmd
  .command("show-prompt <name>")
  .description("Show a prompt template")
  .action((name) => {
    const prompt = AI.getPrompt(name);
    if (!prompt) {
      console.error(`Prompt '${name}' not found`);
      process.exit(1);
    }
    console.log(JSON.stringify(prompt, null, 2));
  });

configCmd
  .command("delete-prompt <name>")
  .description("Delete a prompt template")
  .action((name) => {
    const deleted = AI.deletePrompt(name);
    if (deleted) {
      console.log(`✓ Deleted prompt '${name}'`);
    } else {
      console.error(`Prompt '${name}' not found`);
      process.exit(1);
    }
  });

// Parse and run
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
