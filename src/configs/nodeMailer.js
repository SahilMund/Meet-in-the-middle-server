import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config({ quiet: true });

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAILER_MAIL,
    pass: process.env.NODE_MAILER_PASSWORD,
  },
});
