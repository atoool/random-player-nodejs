/* eslint-disable comma-dangle */
/* eslint-disable space-before-function-paren */
/* eslint-disable quotes */

const Express = require("express");
const path = require("path");
const pup = require("puppeteer-extra");
const userAgent = require("user-agents");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const dl = require("youtube-dl");
const fs = require("fs");

pup.use(AdblockerPlugin({ blockTrackers: true }));
pup.use(StealthPlugin());
const router = Express.Router();

const buildUrl = (req, subpath) =>
  req.protocol + "://" + path.join(req.get("host"), req.baseUrl, subpath);

/* cors */
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

router.get("/", (req, res) => {
  res.json({
    vid: buildUrl(req, "vid"),
  });
});

router.get("/vid/", async function (req, res, next) {
  try {
    const browser = await pup.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage(userAgent);
    const url = "https://random-ize.com/random-youtube/goo-f.php";
    await page.goto(url, { waitUntil: "domcontentloaded" });
    console.log("1");
    await page.waitForSelector("iframe");
    console.log("2");
    let dlLink = await page.evaluate('document.querySelector("iframe").src');
    console.log("3", dlLink);
    const video = dl(
      dlLink,
      // Optional arguments passed to youtube-dl.
      ["--format=18"],
      // Additional options can be given for calling `child_process.execFile()`.
      { cwd: __dirname }
    );

    // Will be called when the download starts.
    video.on("info", function (info) {});
    const media = fs.createWriteStream("./lib/myvideo.mp4");
    video.pipe(media);

    res.json({ result: __dirname + "/myvideo.mp4" });
  } catch (e) {
    res.json({ result: e + ", failed!" });
  }
});

function errorHandler(err, req, res, next) {
  res.status(400).json({ message: err.message });
  next();
}

router.use(errorHandler);

module.exports = router;
