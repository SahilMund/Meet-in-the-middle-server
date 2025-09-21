// workers/userReportWorker.js
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import archiver from "archiver";
import { sendMail } from "../utils/sendMail.util.js";
import { v4 as uuidv4 } from "uuid";
import fsPromises from "fs/promises";
import fse from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPORTS_DIR = path.join(__dirname, "../reports");
await fse.ensureDir(REPORTS_DIR);

// Helpers
const writePdf = (user, outputPath) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(20).text("User Report", { underline: true });
    doc.moveDown();

    doc.fontSize(14).text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Role: ${user.role || "N/A"}`);
    doc.text(`Created At: ${new Date(user.createdAt).toLocaleString()}`);
    doc.text(`Updated At: ${new Date(user.updatedAt).toLocaleString()}`);
    doc.text(`Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}`);

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

const writeExcel = async (user, outputPath) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("User Info");

  sheet.columns = [
    { header: "Field", key: "field", width: 25 },
    { header: "Value", key: "value", width: 50 },
  ];

  sheet.addRow({ field: "Name", value: user.name });
  sheet.addRow({ field: "Email", value: user.email });
  sheet.addRow({ field: "Role", value: user.role || "" });
  sheet.addRow({ field: "Created At", value: user.createdAt });
  sheet.addRow({ field: "Updated At", value: user.updatedAt });
  sheet.addRow({ field: "Last Login", value: user.lastLogin || "Never" });

  await workbook.xlsx.writeFile(outputPath);
};

const zipFiles = (files, zipPath) =>
  new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);

    files.forEach((f) => archive.file(f, { name: path.basename(f) }));
    archive.finalize();
  });

const cleanup = async (files) => {
  for (const f of files) {
    try {
      await fsPromises.unlink(f);
    } catch {}
  }
};

process.on("message", async (payload) => {
  const { jobId, email, user } = payload;
  const id = jobId || uuidv4();
  const ts = Date.now();
  const base = `user_report_${id}_${ts}`;

  const pdfPath = path.join(REPORTS_DIR, `${base}.pdf`);
  const xlsxPath = path.join(REPORTS_DIR, `${base}.xlsx`);
  const zipPath = path.join(REPORTS_DIR, `${base}.zip`);

  try {
    process.send?.({ jobId: id, status: "started" });

    await writePdf(user, pdfPath);
    await writeExcel(user, xlsxPath);
    await zipFiles([pdfPath, xlsxPath], zipPath);

    await sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Your User Report",
      text: "Attached is your user report in PDF, Excel, and ZIP format.",
      attachments: [
        { filename: path.basename(pdfPath), path: pdfPath },
        { filename: path.basename(xlsxPath), path: xlsxPath },
        { filename: path.basename(zipPath), path: zipPath },
      ],
    });

    await cleanup([pdfPath, xlsxPath, zipPath]);

    process.send?.({ jobId: id, status: "completed" });
    process.exit(0);
  } catch (err) {
    process.send?.({ jobId: id, status: "failed", error: err.message });
    await cleanup([pdfPath, xlsxPath, zipPath]);
    process.exit(1);
  }
});
