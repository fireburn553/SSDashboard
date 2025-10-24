// utils/reportGenerator.js
const puppeteer = require("puppeteer");
const { buildReportHTML } = require("./reportTemplate");

// ✅ Helper function to properly find Chrome in Render’s environment
async function getBrowser() {
  const executablePath = await puppeteer.executablePath();
  console.log("Using Chrome executable:", executablePath);

  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath,
  });
}

async function generateClassReport(classData) {
  // ✅ Use the helper to launch Chrome safely
  const browser = await getBrowser();
  const page = await browser.newPage();

  const html = buildReportHTML(classData);

  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generateClassReport };
