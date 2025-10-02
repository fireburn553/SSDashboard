// utils/reportGenerator.js
const puppeteer = require("puppeteer");
const { buildReportHTML } = require("./reportTemplate");

async function generateClassReport(classData) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
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
