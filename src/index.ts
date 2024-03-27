#! /usr/bin/env node

import fs from "fs";
import path from "path";
import { runAppleScript } from "run-applescript";
import got from "got";
import cheerio from "cheerio";

class ChromeTab {
  title: string;
  url: string;
  isActive: boolean;
  _source: string | null = null;
  _dom: cheerio.Root | null = null;

  constructor(title: string, url: string, isActive = false) {
    this.title = title;
    this.url = url;
    this.isActive = isActive;
  }

  /**
   * Get the source code of the tab.
   * Makes a request to the tab's URL and returns the HTML.
   */
  async getSource() {
    if (!this._source) {
      this._source = await got(this.url).text();
    }
    return this._source;
  }

  /**
   * Get data from the tab's source code.
   * @returns A queryable DOM object for the tab's source code.
   */
  async getDom() {
    if (!this._dom) {
      const html = await this.getSource();
      this._dom = cheerio.load(html);
    }
    return this._dom;
  }
}

async function _getRawChromeTabs() {
  const scriptPath = path.join(__dirname, "chrome-tabs.scpt");
  const scriptContents = fs.readFileSync(scriptPath, "utf8");
  return runAppleScript(scriptContents);
}

// Example output format:
/*
https://www.npmjs.com/package/run-applescript || run-applescript - npm || true
https://calendar.google.com/calendar/u/0/r/day/2024/4/8 || Google Calendar - Monday, April 8, 2024 || fals
*/

export {};

async function getChromeTabs(): Promise<ChromeTab[]> {
  const rawTabs = await _getRawChromeTabs();
  return rawTabs
    .split("\n")
    .filter((line) => line)
    .map((line) => {
      const [url, title, active] = line.split(" || ");
      return new ChromeTab(title, url, active === "true");
    });
}

(async () => {
  const allTabs = await getChromeTabs();
  const activeTab = allTabs.find((tab) => tab.isActive);
  if (!activeTab) {
    console.error("No active tab found.");
    return;
  }
  //   const source = await activeTab.getSource();

  const $ = await activeTab.getDom();
  const description = $("meta[name='description']").attr("content");
  console.log(description);
})();
