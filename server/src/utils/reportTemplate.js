const fs = require("fs");
const path = require("path");
const { numberToWords } = require("./usableFunction");

// read Base64 logo from external file
const logoBase64 = fs
  .readFileSync(path.join(__dirname, "../../assets/logoBase64.txt"), "utf8")
  .trim();

function buildReportHTML(classData) {
  const participants = classData.participants || [];
  const coInstructors = classData.co_instructors || [];

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  const participantRows = participants
    .map((p, idx) => {
      const age = p.pax_bday
        ? new Date().getFullYear() - new Date(p.pax_bday).getFullYear()
        : "";
      return `
      <tr>
        <td style="text-align:left;">
          <span class="bold">${idx + 1}. ${p.pax_lname.toUpperCase()}, ${
        p.pax_fname
      } ${p.pax_mname || ""}<br></span>
          ${p.pax_address || ""}<br>
          ${p.pax_number || ""}
        </td>
        <td>${age}</td>
        <td>${p.hea_initial?.trim() || ""}</td>
        <td>${p.pax_knowledge || ""}</td>
        <td>${p.pax_skills || ""}</td>
        <td>${p.pax_remarks?.toUpperCase() || ""}</td>
        <td>${p.certificate_number || ""}</td>
      </tr>`;
    })
    .join("");

  const mainInstructor = `
            <div><u class="bold">${classData.main_instructor_name}</u></div>
            <div><u class="bold">${classData.user_authority_number}</u></div>
            <div><u class="bold">${classData.main_instrcutor_address}</u></div>
  `;

  const instructorRows = coInstructors
    .map((i) => {
      return `
      <div><u class="bold">${i.instructor_fname} ${i.instructor_mname || ""} ${
        i.instructor_lname
      }</u></div>
      <div><u class="bold">${i.instructor_auth_num}</u></div>
      <div><u class="bold">${i.instructor_address}</u></div>
    `;
    })
    .join("");

  const maleCount = participants.filter(
    (p) => p.pax_gender === "Male" && p.pax_remarks === "passed"
  ).length;
  const femaleCount = participants.filter(
    (p) => p.pax_gender === "Female" && p.pax_remarks === "passed"
  ).length;

  const statement = `Recommending the issuance of Certificate of Completion to <span class="bold">
${numberToWords(femaleCount)} (${femaleCount}) FEMALE & 
${numberToWords(
  maleCount
)} (${maleCount}) MALE</span> graduates of <span class="bold">${
    classData.course_name
  }</span>.`;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Class Report</title>
    <style>
      body { font-family: Arial, sans-serif; color: #333; font-size: 11pt; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      .table th, .table td { border: 1px solid #000; padding: 6px; text-align: center; }
      .table th { background: #f5f5f5; }
      .legend { font-size: 10pt; margin-top: 10px;}
      .section { margin: 20px 0; }
      .no-margin { margin: 0; }
      hr.new2 {border-top: 1px dashed red;}
      .margin-top { margin-top: 20px; margin-bottom: 0; }
      .page-break { page-break-before: always; }
      .grid-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 20px;
        margin: 4px 0;
      }
      .grid-instructor {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 6px 20px;
        margin: 10px 0;
      }
      .grid div { text-align: left; }
      .indent { padding-left: 2em; }
    </style>
  </head>
  <body>
    <div class="center section">
      <img src="${logoBase64}" width="100" height="100" alt="Philippine Red Cross Logo" />
      <h2 class="bold no-margin">PHILIPPINE RED CROSS</h2>
      <h3 class="bold no-margin">SAFETY SERVICES</h3>
      <h4 class="no-margin">Examination Record for Non-Instructor’s Training Course</h4>
      <p class="bold margin-top"><u>${classData.course_name}</u></p>
      <p class="no-margin"><em>(COURSE)</em></p>
      <hr class="new2 margin-top">
    </div>

    <div class="section">
      <p class="center"><em>(To be filled in by the Instructor)</em></p>
      <div class="grid-details">
        <div>Class conducted at: <u class="bold">${
          classData.establishment_name
        }</u></div>
        <div>City/Province: <u class="bold">${classData.municipality_city}, ${
    classData.province
  }</u></div>
        <div>Organization: <u class="bold">${classData.cso_name}</u></div>
        <div>Number Enrolled: <u class="bold">${participants.length}</u></div>
        <div>Date of First Class Period: <u class="bold">${formatDate(
          classData.class_start_date
        )}</u></div>
        <div>Number Passed: <u class="bold">${
          participants.filter((p) => p.pax_remarks === "passed").length
        }</u></div>
        <div class="indent">Last Class Period: <u class="bold">${formatDate(
          classData.class_end_date
        )}</u></div>
        <div>Number Dropped: <u class="bold">${
          participants.filter((p) => p.pax_remarks === "drop").length
        }</u></div>
        <div class="indent">Final Evaluation: <u class="bold">${formatDate(
          classData.class_final_evaluation_date
        )}</u></div>
        <div>Number Failed: <u class="bold">${
          participants.filter((p) => p.pax_remarks === "failed").length
        }</u></div>
      </div>
      <p>Length of each class period: Number of class period:<u class="bold">${
        classData.class_hour || ""
      } hour/s</u> Total Number of Days:<u class="bold">${
    classData.class_total_days
  }</u> day/s</u> Total Number of Hours:<u class="bold">${
    classData.class_total_hours
  }</u> hour/s</p>
    </div>

    <div class="section">
      <div class="grid-instructor center">
              ${mainInstructor}
        ${instructorRows}
        <div>Signature over printed name of Instructor/s</div>
        <div>Authority Number</div>
        <div>Address</div>

      </div>
    </div>

    <hr class="new2">

    <p class="center"><em>(To be filled in by the Chapter Office)</em></p>
    <div class="section">
      <div class="grid-details">
        <div>Chapter Name: <u class="bold">Camarines Norte Chapter</u> </div>
        <div>City/Province: <u class="bold">Daet, Camarines Norte</u></div>
        <div>Class Number: <u class="bold">${classData.class_number}</u></div>
        <div>Date Forwarded: <u class="bold">xxx</u></div>
      </div>
      <p>Remarks:</p>
      <div class="center"><u>${statement}</u></div>
    </div>

    <div class="grid-details section">
      <div></div><div class="center"><u class="bold">Christian Lester Ahmad Trinidad</u></div>
      <div></div><div class="center">Chapter Service Representative</div>
      <div>Noted by:</div><div></div> 
      <div class="center"><u class="bold">Ferdinand Salvador Q. Ferrer</u></div><div></div>
      <div class="center">Chapter Administrator</div><div></div>
    </div>

    <hr class="new2 margin-top">
    <div class="section">
      <p class="center"><em>(To be filled in by the National Headquarters)</em></p>
      <div class="grid-details">
        <div>Certificates Issued: _________________________________ </div>
        <div>Sent To: _________________________________</div>
        <div>Statistics Recorded: _________________________________ </div>
        <div>Filed Under: _________________________________</div>
      </div>
      <p>Remarks: ________________________________________________________________________________________________</p>
      <p>_________________________________________________________________________________________________________</p>
      <p>_________________________________________________________________________________________________________</p>
    </div>

    <div class="page-break"></div>

    <div class="center section">
      <img src="${logoBase64}" width="100" height="100" alt="Philippine Red Cross Logo" />
      <h2 class="bold no-margin">PHILIPPINE RED CROSS</h2>
      <h3 class="bold no-margin">SAFETY SERVICES</h3>
      <h4 class="no-margin">Examination Record for Non-Instructor’s Training Course</h4>
      <p class="bold margin-top"><u>${classData.course_name}</u></p>
      <p class="no-margin"><em>(COURSE)</em></p>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Participant’s Name & Address</th>
          <th>Age</th>
          <th>Educ’l Qual.</th>
          <th>Knowledge<br>75/100</th>
          <th>Skills<br>75/100</th>
          <th>Remarks</th>
          <th>COC NUMBER</th>
        </tr>
      </thead>
      <tbody>
        ${participantRows}
      </tbody>
    </table>

    <div class="legend grid-instructor">
      <div><strong>Legend: </strong></div><div></div><div></div>
      <div>CG – College Graduate</div><div>HG – High School Graduate</div><div>VG – Vocational Graduate</div>
      <div>CL – College Level</div><div>HL – High School Level</div><div>VL – Vocational Level</div>
      <div>CS – College Student</div><div>HS – High School Student</div><div>CY – Community Youth</div>
    </div>
  </body>
  </html>
  `;
}

module.exports = { buildReportHTML };
