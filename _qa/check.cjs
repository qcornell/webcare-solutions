// WebCare Solutions QA harness — domain-honest "tests" for a visual single-file site.
// Run: node _qa/check.cjs <name>   (from the webcare-solutions project folder)
const path = require("path");
const { chromium } = require(path.resolve("C:/moltbot/node_modules/playwright"));
const ROOT = "file://" + path.resolve(__dirname, "..", "index.html");
const SHOTS = path.resolve(__dirname, "_shots");

async function loadPage({ width = 1440, height = 900, reduce = false, noFx = false } = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") {
      errors.push(m.text());
    }
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  if (reduce) {
    await page.emulateMedia({ reducedMotion: "reduce" });
  }
  if (noFx) {
    await page.addInitScript(() => {
      Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { value: () => null });
    });
  }
  await page.setViewportSize({ width, height });
  await page.goto(ROOT, { waitUntil: "networkidle" });
  await page.waitForTimeout(450); // deferred boot (load+60ms) + a couple frames
  return { browser, page, errors };
}

const checks = {
  baseline: async () => {
    for (const [w, h, name] of [
      [1440, 900, "desk"],
      [390, 844, "mob"],
      [768, 1024, "tab"],
    ]) {
      const { browser, page, errors } = await loadPage({ width: w, height: h });
      await page.screenshot({ path: `${SHOTS}/baseline-${name}.png`, fullPage: true });
      console.log(`baseline ${name}: ${errors.length} errors`);
      if (errors.length) {
        console.log(errors.join("\n"));
      }
      await browser.close();
    }
  },
  noerrors: async () => {
    let fail = false;
    for (const [w, h, name] of [
      [1440, 900, "desk"],
      [390, 844, "mob"],
    ]) {
      const { browser, page, errors } = await loadPage({ width: w, height: h });
      await page.mouse.wheel(0, 4000);
      await page.waitForTimeout(250);
      await page.mouse.wheel(0, 8000);
      await page.waitForTimeout(250);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      console.log(`${name}: errors=${errors.length} overflow=${overflow}`);
      if (errors.length) {
        console.log(errors.join("\n"));
        fail = true;
      }
      if (Math.abs(overflow) > 2) {
        console.log("overflow!");
        fail = true;
      }
      await browser.close();
    }
    if (fail) {
      process.exitCode = 1;
    }
  },
  favicon: async () => {
    const { browser, page } = await loadPage({ width: 1440, height: 200 });
    const icons = await page.$$eval('link[rel~="icon"], link[rel="apple-touch-icon"]', (els) =>
      els.map((e) => ({ rel: e.rel, href: e.href, sizes: e.sizes + "" })),
    );
    console.log(JSON.stringify(icons, null, 2));
    const ok =
      icons.some((i) => i.href.endsWith("favicon.svg")) &&
      icons.some((i) => i.sizes === "32x32") &&
      icons.some((i) => i.rel.includes("apple-touch-icon"));
    console.log("favicon set ok:", ok);
    if (!ok) {
      process.exitCode = 1;
    }
    await browser.close();
  },
  form: async () => {
    const { browser, page } = await loadPage({ width: 1440, height: 900 });
    await page.evaluate(() => document.getElementById("contact").scrollIntoView());
    await page.waitForTimeout(200);
    const has = await page.evaluate(() => {
      const f = document.getElementById("cform");
      return {
        netlify: f && f.getAttribute("data-netlify") === "true",
        name: f && f.getAttribute("name") === "webcare-contact",
        formNameInput: !!(f && f.querySelector('input[name="form-name"]')),
        honeypot: !!(f && f.querySelector('input[name="bot-field"]')),
      };
    });
    console.log("markup:", JSON.stringify(has));
    await page.fill("#f-name", "Jane Rivera");
    await page.fill("#f-contact", "jane@example.com");
    await page.fill("#f-need", "Need a site for our bakery");
    await page.click('#cform button[type="submit"]');
    await page.waitForTimeout(300);
    const done = await page.evaluate(() => {
      const h = document.querySelector("#form-done h3");
      return {
        heading: h ? h.textContent.trim() : null,
        panelHidden: document.getElementById("form-panel").hidden,
      };
    });
    console.log("success:", JSON.stringify(done));
    const ok =
      has.netlify &&
      has.name &&
      has.formNameInput &&
      has.honeypot &&
      /Jane/.test(done.heading || "") &&
      done.panelHidden;
    console.log("form ok:", ok);
    if (!ok) {
      process.exitCode = 1;
    }
    await browser.close();
  },
  tints: async () => {
    const { browser, page } = await loadPage({ width: 1440, height: 900 });
    const pure = await page.evaluate(() => {
      const out = [];
      const all = document.querySelectorAll("body *");
      for (const el of all) {
        if (el.checkVisibility && !el.checkVisibility()) {
          continue;
        } // skip hidden (honeypot, etc.)
        const bg = getComputedStyle(el).backgroundColor;
        if (bg === "rgb(255, 255, 255)") {
          out.push((el.className || el.tagName) + " :: " + bg);
        }
      }
      return out.slice(0, 25);
    });
    console.log("pure-white structural elements:", pure.length);
    if (pure.length) {
      console.log(pure.join("\n"));
    }
    if (pure.length) {
      process.exitCode = 1;
    }
    await browser.close();
  },
  proof: async () => {
    const { browser, page } = await loadPage({ width: 1440, height: 900 });
    await page.evaluate(() => document.getElementById("words").scrollIntoView());
    await page.waitForTimeout(200);
    const txt = await page.locator("#words").innerText();
    const hasReserved = /reserved|awaiting a real client/i.test(txt);
    const hasCase = /LOV|seedframes|DeedSlice|lov-cogic/i.test(txt);
    console.log({ hasReserved, hasCase });
    if (hasReserved || !hasCase) {
      process.exitCode = 1;
    }
    await page.screenshot({ path: `${SHOTS}/proof-words.png` });
    await browser.close();
  },
  atmosphere: async () => {
    const { browser, page } = await loadPage({ width: 1440, height: 900 });
    const info = await page.evaluate(() => {
      const want = ["mesh-d", "mottle", "vin-warm", "vin-edge", "r-feather"];
      const found = {};
      want.forEach((c) => {
        const el = document.querySelector("." + c);
        found[c] = el ? { pe: getComputedStyle(el).pointerEvents } : null;
      });
      return found;
    });
    console.log(JSON.stringify(info));
    const ok = Object.values(info).every((v) => v && v.pe === "none");
    console.log("atmosphere layers present + pointer-events:none:", ok);
    if (!ok) {
      process.exitCode = 1;
    }
    for (const id of ["process", "about", "contact"]) {
      await page.evaluate((s) => document.getElementById(s).scrollIntoView(), id);
      await page.waitForTimeout(180);
      await page.screenshot({ path: `${SHOTS}/atmos-${id}.png` });
    }
    await browser.close();
  },
  hero: async () => {
    for (const [w, h, n] of [
      [1440, 900, "desk"],
      [390, 844, "mob"],
    ]) {
      const { browser, page, errors } = await loadPage({ width: w, height: h });
      const cls = await page.evaluate(() => document.documentElement.className);
      const hasCanvas = await page.evaluate(() => !!document.getElementById("gl"));
      console.log(`${n}: class="${cls}" canvas=${hasCanvas} errors=${errors.length}`);
      if (errors.length) {
        console.log(errors.join("\n"));
        process.exitCode = 1;
      }
      if (n === "desk") {
        await page.screenshot({ path: `${SHOTS}/hero-idle.png` });
        await page.mouse.wheel(0, 620);
        await page.waitForTimeout(350);
        await page.screenshot({ path: `${SHOTS}/hero-formed.png` });
      }
      await browser.close();
    }
  },
  reduce: async () => {
    for (const [w, h, n] of [
      [1440, 900, "desk"],
      [390, 844, "mob"],
    ]) {
      const { browser, page, errors } = await loadPage({ width: w, height: h, reduce: true });
      const cls = await page.evaluate(() => document.documentElement.className);
      console.log(`reduce ${n}: class="${cls}" errors=${errors.length}`);
      if (errors.length) {
        console.log(errors.join("\n"));
        process.exitCode = 1;
      }
      await browser.close();
    }
  },
  nofx: async () => {
    for (const [w, h, n] of [
      [1440, 900, "desk"],
      [390, 844, "mob"],
    ]) {
      const { browser, page, errors } = await loadPage({ width: w, height: h, noFx: true });
      const cls = await page.evaluate(() => document.documentElement.className);
      console.log(`nofx ${n}: class="${cls}" errors=${errors.length}`);
      if (errors.length) {
        console.log(errors.join("\n"));
        process.exitCode = 1;
      }
      await browser.close();
    }
  },
};

(async () => {
  const name = process.argv[2];
  if (!checks[name]) {
    console.log("available:", Object.keys(checks).join(", "));
    process.exit(1);
  }
  require("fs").mkdirSync(SHOTS, { recursive: true });
  await checks[name]();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
