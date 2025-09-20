// workers/reportWorker.js
import fs from "fs";
import fsPromises from "fs/promises";
import path, { dirname } from "path";
import os from "os";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import archiver from "archiver";
import { sendMail } from "../utils/sendMail.util.js"; // adjust path to mailer.js (relative)
// eslint-disable-next-line import/no-unresolved
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

import fse from "fs-extra";

/**
 * This file is intended to be forked using child_process.fork.
 * It listens for a single message: { jobId, email, meetings }
 * and then produces:
 *  - report.xlsx
 *  - report.pdf
 *  - notes.txt
 *  - meeting_reports.zip (contains all above)
 * Then emails the zip + individual files and removes temp files.
 */

// resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPORTS_DIR = path.join(__dirname, "../reports"); // ../reports at project root workers/reports
await fse.ensureDir(REPORTS_DIR);

/* Helpers */

const writePdf = async (meetings, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ autoFirstPage: true });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(18).text("Meetings Report", { underline: true });
    doc.moveDown();

    meetings.forEach((m, idx) => {
      doc.fontSize(14).text(`${idx + 1}. ${m.title}`);
      doc.fontSize(10).text(`Description: ${m.description || "-"}`);
      doc.text(
        `Creator: ${m.creator?.name || m.creator || "Unknown"} (${m.creator?.email || "-"})`
      );
      doc.text(`Meeting Link: ${m.meetingLink || "-"}`);
      doc.text(
        `Scheduled: ${m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : "-"}`
      );
      doc.text(`Ends At: ${m.endsAt ? new Date(m.endsAt).toLocaleString() : "-"}`);
      if (m.locationSuggestion) {
        doc.text(
          `Location Suggestion: ${m.locationSuggestion.placeName || ""} (${m.locationSuggestion.lat || ""}, ${m.locationSuggestion.lng || ""})`
        );
      }
      doc.moveDown();
    });

    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", (err) => reject(err));
  });
};

const writeExcel = async (meetings, outputPath) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Meetings");

  sheet.columns = [
    { header: "Title", key: "title", width: 40 },
    { header: "Description", key: "description", width: 50 },
    { header: "Creator", key: "creator", width: 25 },
    { header: "Creator Email", key: "creatorEmail", width: 30 },
    { header: "Participants", key: "participants", width: 40 },
    { header: "Meeting Link", key: "meetingLink", width: 40 },
    { header: "Scheduled At", key: "scheduledAt", width: 25 },
    { header: "Ends At", key: "endsAt", width: 25 },
    { header: "Location", key: "location", width: 40 },
  ];

  meetings.forEach((m) => {
    sheet.addRow({
      title: m.title || "",
      description: m.description || "",
      creator: m.creator?.name || "",
      creatorEmail: m.creator?.email || "",
      participants: (m.participants || []).map((p) => (p.name ? `${p.name} <${p.email || ""}>` : (p.email || ""))).join(", "),
      meetingLink: m.meetingLink || "",
      scheduledAt: m.scheduledAt ? new Date(m.scheduledAt).toISOString() : "",
      endsAt: m.endsAt ? new Date(m.endsAt).toISOString() : "",
      location: m.locationSuggestion?.placeName || "",
    });
  });

  // Streaming write to file (memory efficient)
  await workbook.xlsx.writeFile(outputPath);
};

const addNotesTxt = async (text, outputPath) => {
  await fsPromises.writeFile(outputPath, text, "utf8");
};

const zipFiles = (files, zipPath) =>
  new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));

    archive.pipe(output);

    files.forEach((f) => {
      // file name inside zip: basename
      archive.file(f, { name: path.basename(f) });
    });

    archive.finalize();
  });

const cleanup = async (files) => {
  await Promise.all(
    files.map(async (p) => {
      try {
        await fsPromises.unlink(p);
      } catch (err) {
        // ignore missing files
      }
    })
  );
};

/* Worker main */

process.on("message", async (payload) => {
  const { jobId, email, meetings } = payload;
  const id = jobId || uuidv4();

  const timestamp = Date.now();
  const baseName = `meeting_report_${id}_${timestamp}`;
  const pdfPath = path.join(REPORTS_DIR, `${baseName}.pdf`);
  const xlsxPath = path.join(REPORTS_DIR, `${baseName}.xlsx`);
  const notesPath = path.join(REPORTS_DIR, `${baseName}_notes.txt`);
  const zipPath = path.join(REPORTS_DIR, `${baseName}.zip`);

  try {
    process.send?.({ jobId: id, status: "started" });

    // 1) Generate PDF
    process.send?.({ jobId: id, status: "generating_pdf" });
    await writePdf(meetings, pdfPath);

    // 2) Generate Excel
    process.send?.({ jobId: id, status: "generating_excel" });
    await writeExcel(meetings, xlsxPath);

    // 3) Generate notes.txt
    process.send?.({ jobId: id, status: "writing_notes" });
    const notesText = `Report generated on ${new Date().toISOString()} for ${meetings.length} meetings.`;
    await addNotesTxt(notesText, notesPath);

    // 4) ZIP files
    process.send?.({ jobId: id, status: "zipping" });
    await zipFiles([pdfPath, xlsxPath, notesPath], zipPath);

    // 5) Send Email with attachments
    process.send?.({ jobId: id, status: "sending_email" });

    const mail = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Your meetings report (${meetings.length} meetings)`,
      text: "Attached: PDF, Excel, and ZIP report. Please find the reports attached.",
      attachments: [
        { filename: path.basename(pdfPath), path: pdfPath },
        { filename: path.basename(xlsxPath), path: xlsxPath },
        { filename: path.basename(zipPath), path: zipPath },
      ],
    };

    // sendMail imported from mailer.js
    await sendMail(mail);

    process.send?.({ jobId: id, status: "email_sent" });

    // 6) Cleanup generated files
    await cleanup([pdfPath, xlsxPath, notesPath, zipPath]);

    process.send?.({ jobId: id, status: "completed" });

    // exit cleanly
    process.exit(0);
  } catch (err) {
    console.error("Worker error:", err);
    process.send?.({ jobId: id, status: "failed", error: err.message || String(err) });

    // attempt cleanup
    try {
      await cleanup([pdfPath, xlsxPath, notesPath, zipPath]);
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
    }

    process.exit(1);
  }
});
