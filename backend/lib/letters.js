const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const File = require("../models/File");
const { isVisible } = require("./validate");

// Colours and page sizes used by every letter
const C = {
  navy: "#17408B",
  red: "#C8102E",
  ink: "#1b1f2a",
  gray: "#5b6472",
  light: "#F3F6FB",
  line: "#D5DBE5",
  good: "#1f7a3d",
  goodSoft: "#E8F5EC",
  bad: "#a4141f",
  badSoft: "#FDECEE",
  warnSoft: "#FFF6E0",
  warn: "#9a6a00",
};
const M = 56; // left and right margin
const BOTTOM = 72; // space kept free for the footer

// Images for the letters live in backend/assets. A missing file is simply left out.
function asset(name) {
  const p = path.join(__dirname, "..", "assets", name);
  return fs.existsSync(p) ? p : null;
}

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
  return new PDFDocument({
    size: "A4",
    margins: { top: M, bottom: BOTTOM, left: M, right: M },
    bufferPages: true,
    info: { Title: "Formy letter", Author: "Formy", Producer: "Formy" },
  });
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

const width = (doc) => doc.page.width - 2 * M;
const limit = (doc) => doc.page.height - BOTTOM;

// Starts a new page when the next block of height h would not fit
function ensure(doc, h) {
  if (doc.y + h > limit(doc)) {
    doc.addPage();
    doc.x = M;
  }
}

// ---------- Letterhead and footer ----------

function letterhead(doc, app) {
  const top = 40;
  const logo = asset("logo.png");
  if (logo) doc.image(logo, M, top, { width: 52 });
  const tx = logo ? M + 64 : M;
  doc.font("Helvetica-Bold").fontSize(23).fillColor(C.navy).text("Formy", tx, top + 4, { lineBreak: false });
  doc.font("Helvetica").fontSize(9).fillColor(C.gray).text("E-Governance Service Portal", tx, top + 33, { lineBreak: false });

  const w = width(doc);
  doc.font("Helvetica").fontSize(8.5).fillColor(C.gray).text("Reference no.", M, top + 6, { width: w, align: "right", lineBreak: false });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.ink).text(app.ref, M, top + 17, { width: w, align: "right", lineBreak: false });
  doc.font("Helvetica").fontSize(9).fillColor(C.gray).text(`Date: ${fmtDate(new Date())}`, M, top + 34, { width: w, align: "right", lineBreak: false });

  const y = top + 62;
  doc.rect(M, y, w, 2.5).fill(C.navy);
  doc.rect(M, y + 4, w, 0.8).fill(C.red);
  doc.x = M;
  doc.y = y + 15;
  doc.fillColor(C.ink);
}

// Draws the footer on every page once the whole letter is built
function footers(doc, app) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const w = width(doc);
    const y = doc.page.height - 50;
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.rect(M, y - 8, w, 0.6).fill(C.line);
    doc.font("Helvetica").fontSize(8).fillColor(C.gray);
    doc.text(`Formy E-Governance Service Portal   |   Ref. ${app.ref}`, M, y, { width: w * 0.75, lineBreak: false });
    doc.text(`Page ${i + 1} of ${range.count}`, M, y, { width: w, align: "right", lineBreak: false });
    doc.text("Computer generated letter issued through Formy", M, y + 11, { width: w, lineBreak: false });
    doc.page.margins.bottom = bottom;
  }
}

// ---------- Building blocks ----------

function heading(doc, text) {
  ensure(doc, 40);
  doc.moveDown(0.4);
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(C.navy).text(text, M, doc.y);
  const y = doc.y + 3;
  doc.rect(M, y, width(doc), 0.7).fill(C.line);
  doc.y = y + 6;
  doc.x = M;
  doc.fillColor(C.ink);
}

function paragraph(doc, text, opts = {}) {
  doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica").fontSize(10.5).fillColor(C.ink);
  doc.text(text, M, doc.y, { width: width(doc), align: opts.align || "justify", lineGap: 3 });
  doc.moveDown(opts.gap === undefined ? 0.5 : opts.gap);
}

// Two column table: grey label, dark value, light stripes
function table(doc, rows, labelW = 175) {
  const w = width(doc);
  const padX = 9;
  const padY = 3.4;
  doc.rect(M, doc.y, w, 1).fill(C.navy);
  doc.y += 1;
  rows.forEach(([label, value], i) => {
    const text = String(value);
    doc.font("Helvetica").fontSize(9.5);
    const vh = doc.heightOfString(text, { width: w - labelW - padX });
    const lh = doc.font("Helvetica-Bold").fontSize(8.5).heightOfString(String(label), { width: labelW - padX * 2 });
    const h = Math.max(vh, lh, 11) + padY * 2;
    ensure(doc, h);
    const y = doc.y;
    if (i % 2 === 0) doc.rect(M, y, w, h).fill(C.light);
    doc.fillColor(C.gray).font("Helvetica-Bold").fontSize(8.5).text(String(label), M + padX, y + padY + 0.5, { width: labelW - padX * 2 });
    doc.fillColor(C.ink).font("Helvetica").fontSize(9.5).text(text, M + labelW, y + padY, { width: w - labelW - padX });
    doc.rect(M, y + h - 0.4, w, 0.4).fill(C.line);
    doc.y = y + h;
  });
  doc.x = M;
  doc.moveDown(0.5);
}

// Coloured box with a bar on the left. lines: [{ text, bold, size, color }]
function noteBox(doc, { fillColor, barColor, lines, extra = 0, rightPad = 0 }) {
  const w = width(doc);
  const padX = 14;
  const padY = 8;
  let h = padY * 2 + extra;
  for (const l of lines) {
    doc.font(l.bold ? "Helvetica-Bold" : "Helvetica").fontSize(l.size || 10);
    h += doc.heightOfString(l.text, { width: w - padX * 2 - 6 - (l.narrow ? rightPad : 0) }) + (l.gap === undefined ? 3 : l.gap);
  }
  ensure(doc, h + 6);
  const y = doc.y;
  doc.rect(M, y, w, h).fill(fillColor);
  doc.rect(M, y, 4, h).fill(barColor);
  let cy = y + padY;
  for (const l of lines) {
    doc.font(l.bold ? "Helvetica-Bold" : "Helvetica").fontSize(l.size || 10).fillColor(l.color || C.ink);
    doc.text(l.text, M + padX + 4, cy, { width: w - padX * 2 - 6 - (l.narrow ? rightPad : 0) });
    cy = doc.y + (l.gap === undefined ? 3 : l.gap);
  }
  doc.x = M;
  doc.y = y + h;
  return { y, h };
}

function addressBlock(doc, d) {
  doc.font("Helvetica").fontSize(10.5).fillColor(C.gray).text("To,", M, doc.y);
  doc.font("Helvetica-Bold").fillColor(C.ink).text(d.fullName || "");
  doc.font("Helvetica").text(`${d.municipality || ""}-${d.ward || ""}, ${d.district || ""}`);
  if (d.phone) doc.text(`Phone: ${d.phone}`);
  doc.moveDown(0.6);
}

function subject(doc, text) {
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.ink).text(`Subject: ${text}`, M, doc.y, { width: width(doc) });
  const y = doc.y + 2;
  doc.rect(M, y, width(doc), 0.7).fill(C.ink);
  doc.y = y + 9;
  doc.x = M;
}

// Signature, optional stamp, then the signer's name and title
function signBlock(doc, { name, title, stamp }) {
  ensure(doc, 110);
  const y = doc.y + 4;
  const sign = asset("signature.png");
  const stampImg = stamp ? asset("stamp-approved.png") : null;
  if (sign) doc.image(sign, M, y, { width: 120 });
  if (stampImg) doc.image(stampImg, doc.page.width - M - 190, y - 8, { width: 190 });
  doc.x = M;
  doc.y = y + 44;
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(C.ink).text(name, M, doc.y);
  doc.font("Helvetica").fillColor(C.gray).fontSize(9.5).text(title);
  doc.y = Math.max(doc.y, y + (stampImg ? 84 : 60));
  doc.x = M;
  doc.fillColor(C.ink);
}

// ---------- Letter to the customer ----------

async function buildCustomerLetter(app, service) {
  const d = app.data;
  const approved = app.status === "approved";
  const doc = newDoc();
  letterhead(doc, app);
  addressBlock(doc, d);
  subject(doc, `Decision on your application for ${service.title}`);

  const decided = app.decidedAt ? fmtDate(app.decidedAt) : fmtDate(new Date());

  noteBox(doc, {
    fillColor: approved ? C.goodSoft : C.badSoft,
    barColor: approved ? C.good : C.bad,
    lines: [
      { text: approved ? "Application approved" : "Application not approved", bold: true, size: 12, color: approved ? C.good : C.bad },
      { text: `Decision date: ${decided}`, size: 9.5, color: C.gray, gap: 0 },
    ],
  });
  doc.moveDown(1);

  paragraph(doc, `Dear ${d.fullName},`, { align: "left", gap: 0.4 });

  if (approved) {
    paragraph(
      doc,
      `We are happy to inform you that your application (${app.ref}) for ${service.title} has been verified and approved on ${decided}.`
    );
    paragraph(
      doc,
      `Your application and documents have been sent to the concerned government office. The officer will contact you directly on your phone number (${d.phone}) for the next steps.`
    );
  } else {
    paragraph(doc, `We are sorry to inform you that your application (${app.ref}) for ${service.title} was not approved on ${decided}.`);
    noteBox(doc, {
      fillColor: C.badSoft,
      barColor: C.bad,
      lines: [
        { text: "Reason", bold: true, size: 9.5, color: C.bad, gap: 2 },
        { text: app.rejectionReason || "No reason was given.", size: 10.5, gap: 0 },
      ],
    });
    doc.moveDown(0.9);
    paragraph(
      doc,
      "You can fix the problem and send the application again from your Formy dashboard. Open the application and choose Edit and resubmit."
    );
  }

  heading(doc, "Application summary");
  table(doc, [
    ["Reference no.", app.ref],
    ["Service", service.title],
    ["Applicant", d.fullName],
    ["Phone number", d.phone],
    ["Submitted on", app.createdAt ? fmtDate(app.createdAt) : "-"],
    ["Decision", approved ? "Approved" : "Not approved"],
  ]);

  doc.moveDown(0.5);
  paragraph(doc, "Thank you for using Formy.", { align: "left", gap: 0.4 });
  paragraph(doc, "Yours sincerely,", { align: "left", gap: 0 });

  if (approved) {
    const decision = (app.history || []).find((h) => h.action === "Approved by officer");
    signBlock(doc, { name: decision ? decision.actor : "Government Officer", title: "Verifying Officer, Formy", stamp: true });
  } else {
    const rej = (app.history || []).slice().reverse().find((h) => /^Rejected by/.test(h.action));
    doc.moveDown(2.2);
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(C.ink).text(rej ? rej.actor : "Formy", M, doc.y);
    doc.font("Helvetica").fillColor(C.gray).fontSize(9.5).text(rej && rej.role === "officer" ? "Government Officer, Formy" : "Admin, Formy");
  }

  footers(doc, app);
  return toBuffer(doc);
}

// ---------- Formal letter to the officer ----------

async function buildOfficerLetter(app, service) {
  const d = app.data;
  const doc = newDoc();
  letterhead(doc, app);

  doc.font("Helvetica").fontSize(10.5).fillColor(C.gray).text("To,", M, doc.y);
  doc.font("Helvetica-Bold").fillColor(C.ink).text("The Officer In Charge");
  doc.font("Helvetica").text("Concerned Government Office");
  doc.moveDown(0.6);

  subject(doc, `Request to process my application for ${service.title}`);

  paragraph(doc, "Respected Sir/Madam,", { align: "left", gap: 0.4 });
  const child = d.gender === "Male" ? "son" : d.gender === "Female" ? "daughter" : "child";
  paragraph(
    doc,
    `I, ${d.fullName}, ${child} of ${d.fatherName} and ${d.motherName}, a resident of ${d.municipality}-${d.ward}, ${d.district}, born on ${d.dob}, respectfully request you to ${fill(service.requestText, d)}.`
  );
  paragraph(doc, "My details are given below, and all the required documents are attached to this letter.");

  // Details and attachments
  const details = [];
  const attachments = [];
  for (const f of service.fields) {
    if (!isVisible(f, d)) continue;
    const v = d[f.name];
    if (v === undefined || v === null || v === "") continue;
    if (f.type === "file") attachments.push({ label: f.label, fileId: v });
    else details.push([f.label.replace(/\?$/, ""), String(v)]);
  }

  heading(doc, "Applicant details");
  table(doc, details);

  heading(doc, "Attached documents");
  table(
    doc,
    attachments.map((a, i) => [`Annexure ${i + 1}`, a.label]),
    110
  );

  const forwardEntry = (app.history || []).find((h) => h.action === "Forwarded to officer");
  // keep the request, the signature and the verification box on the same page
  ensure(doc, forwardEntry ? 140 : 100);
  paragraph(doc, "I request you to kindly verify the information and take the necessary action.");
  paragraph(doc, "Yours faithfully,", { align: "left", gap: 0.3 });
  doc.moveDown(0.3);
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(C.ink).text(d.fullName, M, doc.y);
  doc.font("Helvetica").text(`Phone: ${d.phone}`);
  doc.font("Helvetica-Oblique").fontSize(9).fillColor(C.gray).text("Signed digitally through Formy");
  doc.moveDown(0.7);

  // Verification by the admin
  if (forwardEntry) {
    const sign = asset("signature.png");
    const lines = [
      { text: "Verification by Formy admin", bold: true, size: 9.5, color: C.navy, gap: 2, narrow: true },
      { text: `Verified against citizen records by ${forwardEntry.actor} (Formy admin) on ${fmtDate(forwardEntry.at)}.`, size: 9.5, gap: 2, narrow: true },
    ];
    if (forwardEntry.note) lines.push({ text: forwardEntry.note, size: 8.5, color: C.gray, gap: 0 });
    const box = noteBox(doc, { fillColor: C.light, barColor: C.navy, lines, rightPad: sign ? 100 : 0 });
    if (sign) doc.image(sign, M + width(doc) - 84, box.y + 4, { width: 64 });
    doc.y = box.y + box.h;
  } else {
    noteBox(doc, {
      fillColor: C.warnSoft,
      barColor: C.warn,
      lines: [{ text: "DRAFT: not yet verified by the Formy admin.", bold: true, size: 9.5, color: C.warn, gap: 0 }],
    });
  }

  // Annexure pages
  const total = attachments.length;
  for (let i = 0; i < total; i++) {
    const a = attachments[i];
    doc.addPage();
    const w = width(doc);
    doc.rect(M, M - 14, w, 26).fill(C.navy);
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#fff").text(`Annexure ${i + 1} of ${total}`, M + 10, M - 7, { lineBreak: false });
    doc.font("Helvetica").fontSize(10.5).text(a.label, M, M - 7, { width: w - 10, align: "right", lineBreak: false });
    doc.fillColor(C.ink);
    const top = M + 22;
    doc.x = M;
    doc.y = top;

    let file = null;
    try {
      file = await File.findById(a.fileId);
    } catch (e) {
      file = null;
    }
    if (!file) {
      doc.font("Helvetica").fontSize(10).text("File not found.", M, top);
      continue;
    }
    try {
      const maxH = limit(doc) - top;
      doc.image(file.data, M, top, { fit: [w, maxH], align: "center" });
    } catch (e) {
      doc.font("Helvetica").fontSize(10).text("This image could not be embedded.", M, top);
    }
  }

  footers(doc, app);
  return toBuffer(doc);
}

module.exports = { buildCustomerLetter, buildOfficerLetter };
