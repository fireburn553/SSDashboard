const fs = require("fs");
const path = require("path");

const logoBase64 = fs
  .readFileSync(path.join(__dirname, "../../assets/logoBase64.txt"), "utf8")
  .trim();
const safetyServicesLogoBase64 = fs.readFileSync(
  path.join(__dirname, "../../assets/safetyservice.svg"),
  "base64"
);

const footerBackgroundBase64 = fs.readFileSync(
  path.join(__dirname, "../../assets/wave-haikei.svg"),
  "base64"
);

function buildCertificateHTML(classData, participant) {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const conductDate = formatDate(classData.class_final_evaluation_date);
  const expiryDate = new Date(classData.class_final_evaluation_date);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const validUntilDate = formatDate(expiryDate);

  const supervisorName = "MR. CHRISTIAN LESTER TRINIDAD";
  const supervisorTitle = "CSR-234";
  const chapterAdminName = "FERDINAND SALVADOR Q. FERRER";

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; }

    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 0;
      margin: 0;
    }

    .certificate-page {
      position: relative;
      width: 100%;
      min-height: 100vh;
      padding: 40px;
    }

    .certificate-page:not(:last-child) {
      page-break-after: always;
    }

    .header {
      margin-bottom: 20px;
      text-align: left;
      display: grid;
      grid-template-columns: 100px auto;
    }

    .header img {
      grid-column: 1/2;
      grid-row: 1/6;
      align-self: center;
    }

    .header h2, h3, p { margin: 0; }

    .certificate-number { text-align: right; }

    .content {
      margin-top: 50px;
      line-height: 1.8;
      font-size: 16px;
      margin: 0 4rem;
    }

    .content p {
      text-indent: 10%;
      text-align: justify;
      font-size: 16px;
    }

    .participant-name {
      font-family: 'Times New Roman', Times, serif;
      font-size: 28px;
      font-weight: bold;
      margin: 20px 0;
    }

    .course-name { font-weight: bold; }

.footer {
  position: absolute;
  bottom: 2in;
  left: 4rem;              /* match .content margins */
  right: 4rem;
  width: auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}


    .signature-line {
      text-align: center;
      grid-column: 3/4;
      border-top: 1px solid rgb(0, 0, 0);
      width: 300px;
      margin: 0 auto;
      padding-top: 5px;
    }

    /* ====== Wave Gradient Footer ====== */
    .background-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      text-align: center;
      height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      overflow: hidden;
    }

    .background-footer .tagline {
      color: rgb(0, 0, 0);
      font-family: 'Times New Roman', serif;
      font-style: italic;
      font-size: 18px;
      margin: 0;
      padding-bottom: 5px;
      z-index: 1;
    }

    .background-footer .safety-logo {
      height: 40px;
      width: auto;
      opacity: 0.8;
      z-index: 1;
    }
  </style>
</head>
<body>
  <div class="certificate-page">
    <div class="header">
      <img src="${logoBase64}" width="80" alt="Logo" />
      <h2><strong>Philippine Red Cross</strong></h2>
      <h3>Camarines Norte Chapter</h3>
      <p>Provincial Hospital Compound Bagasbas Rd. Daet, Camarines Norte</p>
      <p>Telephone No. (054) 8875 - 4137</p>
      <p>E-mail Add: camarines.norte@redcross.org.ph</p>
    </div>

    <div class="certificate-number">
      <p><strong>CC-0825-0216</strong></p>
    </div>

    <h1>CERTIFICATION OF COMPLETION</h1>

    <div class="content">
      <p>This is to certify <strong>${participant.pax_fname.toUpperCase()} ${
    participant.pax_mname ? participant.pax_mname.toUpperCase() + "." : ""
  } ${participant.pax_lname.toUpperCase()}</strong> that has successfully graduated in the
      <span class="course-name">${classData.course_name}</span> conducted on
      ${conductDate}, at ${
    classData.establishment_name
  }, and passed the evaluation examination
      under the supervision of <strong>${supervisorName} ${supervisorTitle}.</strong></p>
<br>
      <p>This certification is being issued for <strong>REFERENCE</strong> purposes only and shall be valid up to
        <strong>${validUntilDate},</strong> only.</p>
    </div>

    <div class="footer">
      <div class="signature-line">
        <strong>${chapterAdminName}</strong><br>
        Chapter Administrator
      </div>
    </div>

    <div class="background-footer">
      <img src="data:image/svg+xml;base64,${safetyServicesLogoBase64}" alt="Safety Services" class="safety-logo" />
      <p class="tagline">Always First, Always Ready, Always There</p>
    </div>
  </div>
</body>
</html>
  `;
}

module.exports = { buildCertificateHTML };
