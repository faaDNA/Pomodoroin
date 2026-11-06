/* eslint-disable */
// Runnable UI check: responsive overflow, settings state, timer countdown, tab title.
// Usage: node scripts/check-responsive.js <url> [width] [height]
const puppeteer = require("puppeteer-core");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--hide-scrollbars"],
  });
  const page = await browser.newPage();
  const url = process.argv[2] || "http://localhost:3000";
  const width = Number(process.argv[3] || 390);
  const height = Number(process.argv[4] || 844);
  await page.setViewport({ width, height });
  await page.goto(url, { waitUntil: "networkidle0" });

  const layout = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflowing: [...document.querySelectorAll("main *")]
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
      .map((el) => `${el.tagName}.${(el.className || "").toString().slice(0, 30)}`),
  }));

  await page.screenshot({
    path: `../.impeccable/review/width-${width}.png`,
    fullPage: true,
  });

  const settingsBtn = await page.$("button[aria-expanded]");
  if (settingsBtn) {
    await settingsBtn.click();
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({
      path: `../.impeccable/review/width-${width}-settings.png`,
      fullPage: true,
    });
    await settingsBtn.click();
  }

  const clock = () => page.$eval("span.font-mono", (el) => el.textContent);
  const before = await clock();
  await page.click("button.bg-emerald-500");
  await new Promise((r) => setTimeout(r, 2600));
  const during = await clock();
  const title = await page.title();

  console.log(
    JSON.stringify(
      {
        layout,
        timer: { before, during, title },
        ok:
          layout.scrollWidth === width &&
          layout.overflowing.length === 0 &&
          before !== during &&
          title.includes(during),
      },
      null,
      2,
    ),
  );
  await browser.close();
})();