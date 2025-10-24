const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const { buildReportHTML } = require("./reportTemplate");

async function generateReportPDF(reportData) {
  const htmlContent = buildReportHTML(reportData);
  let browser = null;

  console.log("🧠 Launching server-compatible Chromium for report...");

  try {
    // This is the critical fix for Render
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: false,
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

    console.log("✅ Report PDF generated successfully.");
    return { success: true, pdfBuffer };
  } catch (error) {
    console.error("🚨 Puppeteer failed to generate report:", error);
    return { success: false, message: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { generateReportPDF };
