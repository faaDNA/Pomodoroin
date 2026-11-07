/* eslint-disable */
// Runnable UI check: responsive overflow, settings modal (Esc), cycle that
// must end on a long break, duration field that must stay empty while edited,
// timer countdown, hydration after edited localStorage duration.
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

  const consoleErrors = [];
  const IGNORE = ["CORS policy", "Failed to load resource", "ERR_FAILED"];
  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error" && !IGNORE.some((i) => text.includes(i))) {
      consoleErrors.push(text);
    }
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

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

  const settingsBtn = await page.$('button[aria-haspopup="dialog"]');
  let modalClosed = false;
  if (settingsBtn) {
    await settingsBtn.click();
    await new Promise((r) => setTimeout(r, 350));
    await page.screenshot({
      path: `../.impeccable/review/width-${width}-settings.png`,
      fullPage: true,
    });
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 350));
    modalClosed = await page.evaluate(
      () => !document.querySelector("dialog[open]"),
    );
  }

  // Sorot jam 7× lompat-lompat: putaran ke-4 harus berakhir di istirahat
  // panjang, dan field durasi harus boleh kosong dulu sebelum diketik ulang.
  await page.evaluate(() => {
    const real = Date.now.bind(Date);
    let off = 0;
    Date.now = () => real() + off;
    window.__jump = (ms) => (off += ms);
  });
  await page.click('button[aria-label="Suara"]'); // alarm mati dulu
  const caption = () =>
    page.$eval(
      "div.absolute.inset-0 > span:last-child",
      (el) => el.textContent,
    );
  const seq = [];
  for (let i = 0; i < 7; i++) {
    await page.click("[data-primary]");
    await page.evaluate(() => window.__jump(30 * 60_000));
    await new Promise((r) => setTimeout(r, 400));
    seq.push(await caption());
  }
  const longAfterFour = seq[6] === "Istirahat Panjang";

  await page.click('button[aria-haspopup="dialog"]');
  await new Promise((r) => setTimeout(r, 350));
  const input = await page.$("dialog[open] input");
  await input.click();
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyA");
  await page.keyboard.up("Control");
  await page.keyboard.press("Delete");
  const fieldEmpty = await page.$eval(
    "dialog[open] input",
    (el) => el.value,
  );
  await page.keyboard.type("45");
  await page.keyboard.press("Enter"); // Enter = blur = commit
  await new Promise((r) => setTimeout(r, 150));
  const edit = await page.evaluate(() => ({
    field: document.querySelector("dialog input").value,
    stored: JSON.parse(localStorage.getItem("pomodoroin.durations")).focus,
  }));

  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 400));

  const clock = () => page.$eval("span.font-mono", (el) => el.textContent);
  const before = await clock();
  await page.click("button[data-primary]");
  await new Promise((r) => setTimeout(r, 2600));
  const during = await clock();
  const title = await page.title();

  // bug repro: edited duration must hydrate cleanly and show the stored value
  await page.evaluate(() =>
    localStorage.setItem(
      "pomodoroin.durations",
      JSON.stringify({ focus: 10, short: 5, long: 15 }),
    ),
  );
  await page.reload({ waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));
  const afterRefresh = await clock();

  const report = {
    layout,
    timer: { before, during, title },
    modal: { openedAndEscClosed: modalClosed },
    cycle: { seq, longAfterFour },
    edit: { fieldEmpty, ...edit },
    hydration: { afterRefresh, consoleErrors },
    ok:
      layout.scrollWidth === width &&
      layout.overflowing.length === 0 &&
      modalClosed &&
      longAfterFour &&
      fieldEmpty === "" &&
      edit.field === "45" &&
      edit.stored === 45 &&
      before !== during &&
      title.includes(during) &&
      afterRefresh === "10:00" &&
      consoleErrors.length === 0,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
  await browser.close();
})();