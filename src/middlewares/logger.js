//logs all the incomeing requests to the log file
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, "../logs", "server.log");
export const logger = (req, res, next) => {
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | IP: ${req.ip} | User-Agent: ${req.get("User-Agent")} \n`;
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
  next();
};
