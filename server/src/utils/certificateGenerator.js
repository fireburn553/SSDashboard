const puppeteer = require("puppeteer");
const { buildCertificateHTML } = require("./certificateTemplate");

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

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      (await puppeteer.executablePath()),
  });
  const page = await browser.newPage();

  await page.setContent(combinedHTML, { waitUntil: "domcontentloaded" });
  const pdfBuffer = await page.pdf({
    format: "Letter", // Standard certificate size
    landscape: false, // Certificates are often landscape
    printBackground: true,
    margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generateCertificatesPDF };
