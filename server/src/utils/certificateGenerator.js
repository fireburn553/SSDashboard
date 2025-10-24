const puppeteer = require("puppeteer");
const { buildCertificateHTML } = require("./certificateTemplate");

// ✅ Helper to properly find Chrome executable
async function getBrowser() {
  const executablePath = await puppeteer.executablePath();
  console.log("Using Chrome executable:", executablePath);

  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath,
  });
}

async function generateCertificatesPDF(classData, passedParticipants) {
  let combinedHTML = "";

  // Loop through each passed participant and generate their certificate HTML
  for (const participant of passedParticipants) {
    combinedHTML += buildCertificateHTML(classData, participant);
    // Add a page break after each certificate, except for the last one
    if (
      passedParticipants.indexOf(participant) <
      passedParticipants.length - 1
    ) {
      combinedHTML += '<div class="page-break"></div>';
    }
  }

  // ✅ Use the helper to launch Chrome correctly on Render
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.setContent(combinedHTML, { waitUntil: "domcontentloaded" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    landscape: false,
    printBackground: true,
    margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generateCertificatesPDF };
