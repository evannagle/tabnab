import Anthropic from "@anthropic-ai/sdk";
import Conf from "conf";
import fs from "fs";
import path from "path";
import os from "os";

interface PromptTemplate {
  name: string;
  description: string;
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AIConfig {
  anthropicApiKey?: string;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
}

const config = new Conf<AIConfig>({
  projectName: "tabnab",
  defaults: {
    defaultModel: "claude-sonnet-4-20250514",
    defaultTemperature: 0.7,
    defaultMaxTokens: 4096,
  },
});

/**
 * Get Anthropic API key from config or environment
 */
export function getApiKey(): string | null {
  return (
    config.get("anthropicApiKey") ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.CLAUDE_API_KEY ||
    null
  );
}

/**
 * Set Anthropic API key in config
 */
export function setApiKey(apiKey: string): void {
  config.set("anthropicApiKey", apiKey);
}

/**
 * Get prompts directory path
 */
export function getPromptsDir(): string {
  const promptsDir = path.join(os.homedir(), ".tabnab", "prompts");
  if (!fs.existsSync(promptsDir)) {
    fs.mkdirSync(promptsDir, { recursive: true });
  }
  return promptsDir;
}

/**
 * List all available prompt templates
 */
export function listPrompts(): PromptTemplate[] {
  const promptsDir = getPromptsDir();
  const files = fs.readdirSync(promptsDir).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const filePath = path.join(promptsDir, file);
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content) as PromptTemplate;
  });
}

/**
 * Get a specific prompt template by name
 */
export function getPrompt(name: string): PromptTemplate | null {
  const promptsDir = getPromptsDir();
  const filePath = path.join(promptsDir, `${name}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content) as PromptTemplate;
}

/**
 * Save a prompt template
 */
export function savePrompt(template: PromptTemplate): void {
  const promptsDir = getPromptsDir();
  const filePath = path.join(promptsDir, `${template.name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(template, null, 2));
}

/**
 * Delete a prompt template
 */
export function deletePrompt(name: string): boolean {
  const promptsDir = getPromptsDir();
  const filePath = path.join(promptsDir, `${name}.json`);

  if (!fs.existsSync(filePath)) {
    return false;
  }

  fs.unlinkSync(filePath);
  return true;
}

/**
 * Initialize default prompt templates
 */
export function initializeDefaultPrompts(): void {
  const defaults: PromptTemplate[] = [
    {
      name: "summarize",
      description: "Summarize page in 3-5 bullet points",
      prompt:
        "Summarize this webpage in 3-5 concise bullet points:\n\n{content}",
    },
    {
      name: "extract-features",
      description: "Extract product features as structured data",
      prompt:
        'Extract key product features as a JSON array from this page. Return ONLY the JSON array.\n\n{content}\n\nReturn format: ["feature 1", "feature 2", ...]',
    },
    {
      name: "simplify",
      description: "Explain content in simple terms",
      prompt:
        "Explain this content in simple terms that a beginner could understand:\n\n{content}",
    },
    {
      name: "action-items",
      description: "Extract action items and tasks",
      prompt:
        "Extract all action items, tasks, or to-dos from this content:\n\n{content}",
    },
    {
      name: "key-points",
      description: "Extract key points and main ideas",
      prompt:
        "Extract the key points and main ideas from this content:\n\n{content}",
    },
  ];

  defaults.forEach((template) => {
    const existing = getPrompt(template.name);
    if (!existing) {
      savePrompt(template);
    }
  });
}

/**
 * Call Claude API with content and prompt
 */
export async function callClaude(
  content: string,
  promptText: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {},
): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      "No Anthropic API key found. Set ANTHROPIC_API_KEY environment variable or run: tabnab config set-api-key <key>",
    );
  }

  const client = new Anthropic({ apiKey });

  const model = options.model || config.get("defaultModel")!;
  const temperature = options.temperature ?? config.get("defaultTemperature")!;
  const maxTokens = options.maxTokens || config.get("defaultMaxTokens")!;

  // Replace {content} placeholder in prompt
  const fullPrompt = promptText.replace("{content}", content);

  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [
      {
        role: "user",
        content: fullPrompt,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}

/**
 * Apply a prompt template to content
 */
export async function applyPromptTemplate(
  content: string,
  templateName: string,
): Promise<string> {
  const template = getPrompt(templateName);

  if (!template) {
    throw new Error(`Prompt template '${templateName}' not found`);
  }

  return callClaude(content, template.prompt, {
    model: template.model,
    temperature: template.temperature,
    maxTokens: template.maxTokens,
  });
}
