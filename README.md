# Tabnab

Get a list of open Chrome browser tabs with information on their title, URL, and source.

### Simple example

```typescript
import { getActiveChromeTab } from tabnab;

const activeTab = await getActiveChromeTab();
const $ = await activeTab.loadDom();

console.log($('title').text());
```

### Crawl the page

```typescript
import { getChromeTabs } from tabnab;

const tabs = await getChromeTabs();
const hackerNews = tabs.find(
    (tab) => tab.url.hostname === "news.ycombinator.com"
);

if (!hackerNews) {
    console.error("No Hacker News tab found.");
    return;
}

console.log(hackerNews.title);

const $ = await hackerNews.loadDom();

$(".titleline a").each((i, el) => {
    console.log(`- [${$(el).text()}](${$(el).attr("href")})`);
});
```
