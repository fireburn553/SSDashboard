const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const { buildCertificateHTML } = require("./certificateTemplate");

async function generateCertificatesPDF(classData, passedParticipants) {
  let combinedHTML = "";
  for (const participant of passedParticipants) {
    combinedHTML += buildCertificateHTML(classData, participant);
    if (
      passedParticipants.indexOf(participant) <
      passedParticipants.length - 1
    ) {
      combinedHTML += '<div class="page-break"></div>';
    }
  }

  let browser = null;
  console.log("🧠 Launching server-compatible Chromium for certificates...");

  try {
    // This is the critical fix for Render
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(combinedHTML, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "Letter",
      landscape: false,
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

    console.log("✅ Certificates PDF generated successfully.");
    return pdfBuffer;
  } catch (error) {
    console.error("🚨 Puppeteer failed to generate certificates:", error);
    // Return an object that indicates failure, which the route can handle
    throw new Error("Failed to generate certificates PDF.");
  } finally {
    if (browser) {
      await browser.close();
    }
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

module.exports = { generateCertificatesPDF };
