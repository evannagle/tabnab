import cheerio from "cheerio";
import path from "path";
import fs from "fs";
import { runAppleScript } from "spawn-applescript";

/**
 * Render an AppleScript template with a model.
 * @param relpath The relative path to the template file, e.g. chrome-tabs.scpt
 * @param model  A simple list of keys that should be replaced in the template file before running the script.
 * @returns The result of running the AppleScript.
 */
async function renderApplescript(
  relpath: string,
  model: { [key: string]: string },
) {
  const templatePath = path.join(__dirname, relpath);
  const template = fs.readFileSync(templatePath, "utf8");

  const scriptSource = Object.keys(model).reduce((acc, key) => {
    return acc.replace(`{{${key}}}`, model[key]);
  }, template);

  const applescriptResponse = await runAppleScript(scriptSource);
  return applescriptResponse;
}

/**
 * Represents a Chrome tab.
 * @property title - The title of the tab.
 * @property url - The URL of the tab.
 * @property isActive - Whether the tab is currently open in the window.
 */
export class ChromeTab {
  title: string;
  url: URL;
  isActive: boolean;
  isViewSource: boolean = false;
  isDevTools: boolean = false;

  _source: string | null = null;
  _dom: cheerio.Root | null = null;

  constructor(title: string, url: string, isActive = false) {
    this.title = title;
    this.url = new URL(url);
    this.isActive = isActive;
    this.isViewSource = url.startsWith("view-source:");
    this.isDevTools = url.startsWith("chrome-devtools:");
  }

  /**
   * Get the source code of the tab.
   */
  async getHtmlSource(): Promise<string> {
    if (!this._source) {
      this._source = await renderApplescript("chrome-tab-source.scpt", {
        target_url: this.url.toString(),
      });
    }

    return this._source;
  }

  /**
   * Get the DOM of the tab.
   * @returns The DOM of the tab.
   */
  async loadDom(): Promise<cheerio.Root> {
    if (!this._dom) {
      const source = await this.getHtmlSource();
      this._dom = cheerio.load(source);
    }

    return this._dom;
  }
}

/**
 * Get a list of Chrome tabs.
 * @returns A list of Chrome tabs.
 */
export async function getChromeTabs(): Promise<ChromeTab[]> {
  const rawTabs = await renderApplescript("chrome-tabs.scpt", {});

  return rawTabs
    .split("\n")
    .filter((line) => line)
    .map((line) => {
      const [url, title, active] = line.split(" || ");
      return new ChromeTab(title, url, active === "true");
    });
}

/**
 * Get the active Chrome tab.
 * @returns The active Chrome tab.
 */
export async function getActiveChromeTab(): Promise<ChromeTab | null> {
  const tabs = await getChromeTabs();
  return tabs.find((tab) => tab.isActive) || null;
}
