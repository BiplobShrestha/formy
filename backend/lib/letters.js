const PDFDocument = require("pdfkit");
const File = require("../models/File");
const { isVisible } = require("./validate");

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kathmandu",
  });
}

function fill(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (data[k] !== undefined ? data[k] : ""));
}

function newDoc() {
  return new PDFDocument({ size: "A4", margin: 60, info: { Title: "Formy letter", Producer: "Formy" } });
}

function toBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function header(doc, app) {
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#000").text("Formy");
  doc.font("Helvetica").fontSize(9).fillColor("#555").text("E-Governance Service Portal");
  doc.moveDown(0.3);
  const y = doc.y;
  doc.strokeColor("#999").lineWidth(0.5).moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke();
  doc.moveDown(0.8);
  doc.fillColor("#000").font("Helvetica").fontSize(10);
  doc.text(`Reference no: ${app.ref}`);
  doc.text(`Date: ${fmtDate(new Date())}`);
  doc.moveDown();
}

function addressBlock(doc, d) {
  doc.font("Helvetica").fontSize(11).text("To,");
  doc.font("Helvetica-Bold").text(d.fullName || "");
  doc.font("Helvetica").text(`${d.municipality || ""}-${d.ward || ""}, ${d.district || ""}`);
  doc.moveDown();
}

// Short, friendly letter for the customer: approved or rejected
async function buildCustomerLetter(app, service) {
  const d = app.data;
  const doc = newDoc();
  header(doc, app);
  addressBlock(doc, d);

  doc.font("Helvetica-Bold").fontSize(11).text(`Subject: Decision on your application for ${service.title}`);
  doc.moveDown();
  doc.font("Helvetica").fontSize(11).text(`Dear ${d.fullName},`);
  doc.moveDown(0.5);

  const decided = app.decidedAt ? fmtDate(app.decidedAt) : fmtDate(new Date());
  if (app.status === "approved") {
    doc.text(
      `We are happy to inform you that your application (${app.ref}) for ${service.title} has been verified and approved on ${decided}.`,
      { align: "justify" }
    );
    doc.moveDown(0.5);
    doc.text(
      `Your application and documents have been sent to the concerned government office. The officer will contact you directly on your phone number (${d.phone}) for the next steps.`,
      { align: "justify" }
    );
  } else {
    doc.text(
      `We are sorry to inform you that your application (${app.ref}) for ${service.title} was not approved on ${decided}.`,
      { align: "justify" }
    );
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("Reason:");
    doc.font("Helvetica").text(app.rejectionReason || "No reason was given.", { align: "justify" });
    doc.moveDown(0.5);
    doc.text(
      "You can fix the problem and send the application again from your Formy dashboard. Open the application and choose Edit and resubmit.",
      { align: "justify" }
    );
  }

  doc.moveDown(2);
  doc.text("Thank you for using Formy.");
  doc.moveDown();
  doc.font("Helvetica-Oblique").fontSize(9).fillColor("#555").text("This letter was generated automatically by Formy.");
  return toBuffer(doc);
}

// Formal letter written as if from the applicant, with every document attached on the following pages
async function buildOfficerLetter(app, service) {
  const d = app.data;
  const doc = newDoc();
  header(doc, app);

  doc.font("Helvetica").fontSize(11);
  doc.text("To,");
  doc.font("Helvetica-Bold").text("The Officer In Charge");
  doc.font("Helvetica").text("Concerned Government Office");
  doc.moveDown();

  doc.font("Helvetica-Bold").text(`Subject: Request to process my application for ${service.title}`);
  doc.moveDown();
  doc.font("Helvetica").text("Respected Sir/Madam,");
  doc.moveDown(0.5);

  const child = d.gender === "Male" ? "son" : d.gender === "Female" ? "daughter" : "child";
  doc.text(
    `I, ${d.fullName}, ${child} of ${d.fatherName} and ${d.motherName}, a resident of ${d.municipality}-${d.ward}, ${d.district}, born on ${d.dob}, respectfully request you to ${fill(service.requestText, d)}.`,
    { align: "justify" }
  );
  doc.moveDown(0.5);
  doc.text("My details are given below, and all the required documents are attached to this letter.", { align: "justify" });
  doc.moveDown();

  // Details
  doc.font("Helvetica-Bold").text("Applicant details");
  doc.moveDown(0.3);
  const attachments = [];
  for (const f of service.fields) {
    if (!isVisible(f, d)) continue;
    const v = d[f.name];
    if (v === undefined || v === null || v === "") continue;
    if (f.type === "file") {
      attachments.push({ label: f.label, fileId: v });
      continue;
    }
    doc.font("Helvetica-Bold").fontSize(10).text(`${f.label.replace(/\?$/, "")}: `, { continued: true });
    doc.font("Helvetica").text(String(v));
  }
  doc.moveDown();

  doc.font("Helvetica-Bold").fontSize(11).text("Attached documents");
  doc.font("Helvetica").fontSize(10);
  attachments.forEach((a, i) => doc.text(`${i + 1}. ${a.label}`));
  doc.moveDown();

  doc.fontSize(11).text("I request you to kindly verify the information and take the necessary action.", { align: "justify" });
  doc.moveDown();
  doc.text("Yours faithfully,");
  doc.moveDown(1.5);
  doc.font("Helvetica-Bold").text(d.fullName);
  doc.font("Helvetica").text(`Phone: ${d.phone}`);
  doc.font("Helvetica-Oblique").fontSize(9).fillColor("#555").text("Signed digitally through Formy");
  doc.fillColor("#000");

  // Verification note
  const forwardEntry = (app.history || []).find((h) => h.action === "Forwarded to officer");
  doc.moveDown();
  doc.font("Helvetica").fontSize(9).fillColor("#333");
  if (forwardEntry) {
    doc.text(`Verified against citizen records by ${forwardEntry.actor} (Formy admin) on ${fmtDate(forwardEntry.at)}.`);
  } else {
    doc.text("DRAFT: not yet verified by the Formy admin.");
  }
  doc.fillColor("#000");

  // Attachment pages
  for (const a of attachments) {
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(12).text(`Attachment: ${a.label}`);
    doc.moveDown(0.5);
    let file = null;
    try {
      file = await File.findById(a.fileId);
    } catch (e) {
      file = null;
    }
    if (!file) {
      doc.font("Helvetica").fontSize(10).text("File not found.");
      continue;
    }
    try {
      const maxW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const maxH = doc.page.height - doc.y - doc.page.margins.bottom;
      doc.image(file.data, doc.page.margins.left, doc.y, { fit: [maxW, maxH], align: "center" });
    } catch (e) {
      doc.font("Helvetica").fontSize(10).text("This image could not be embedded.");
    }
  }

  return toBuffer(doc);
}

module.exports = { buildCustomerLetter, buildOfficerLetter };
