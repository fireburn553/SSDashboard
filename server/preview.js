const fs = require("fs");
const { buildReportHTML } = require("./src/utils/reportTemplate");

const classData = {
  course_name: "Standard First Aid Training",
  establishment_name: "SM City Daet",
  address: "Camarines Norte",
  cso_name: "Red Cross Youth",
  class_start_date: "2024-05-24",
  class_end_date: "2024-05-25",
  class_final_evaluation_date: "2024-05-25",
  user_fname: "Juan",
  user_lname: "Dela Cruz",
  user_authority_number: "AUTH-1234",
  class_number: "CL-0001",
  city_mun: "Daet",
  province: "Camarines Norte",
  class_hour: 8,
  class_days: 1,
  class_total_hours: 8,
};

const participants = [
  {
    pax_lname: "ABLETIA",
    pax_fname: "TRISHIA",
    pax_mname: "",
    pax_address: "Brgy. Manguisoc, Mercedes, Camarines Norte",
    pax_number: "09385165246",
    pax_bday: "2003-05-10",
    hea_initial: "HG",
    pax_knowledge: 80,
    pax_skills: 78,
    pax_remarks: "passed",
    certificate_number: "CC-0525-2401",
    pax_gender: "Female",
  },
  {
    pax_lname: "ABLETIA",
    pax_fname: "LORIO",
    pax_mname: "",
    pax_address: "Brgy. Manguisoc, Mercedes, Camarines Norte",
    pax_number: "09385165246",
    pax_bday: "2003-05-10",
    hea_initial: "HG",
    pax_knowledge: 80,
    pax_skills: 78,
    pax_remarks: "passed",
    certificate_number: "CC-0525-2401",
    pax_gender: "Male",
  },
];

const instructors = [
  {
    instructor_fname: "Juan",
    instructor_mname: "L.",
    instructor_lname: "Dela Cruz",
    instructor_auth_num: 1234,
    instructor_address: "Daet, Camarines Norte",
  },
  {
    instructor_fname: "Juan",
    instructor_mname: "L.",
    instructor_lname: "Dela Cruz",
    instructor_auth_num: 1234,
    instructor_address: "Daet, Camarines Norte",
  },
];

const html = buildReportHTML(classData, participants, instructors);
fs.writeFileSync("reportPreview.html", html);
console.log("✅ Preview generated: reportPreview.html");
