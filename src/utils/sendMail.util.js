import { transporter } from "../configs/nodeMailerTransporter.js"; 
import {html,welCOmeMail} from "./nodemailerHtml.js";
export const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.NODE_MAILER_MAIL,
    to: email,
    subject: "Verify your email for Meet in the Middle",
    html: html(otp), // Use the HTML template for the email content
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info; // Return the info object for further processing if needed
  } catch (error) {
    throw new Error("Failed to send email - "+error);
  }
};
export const sendWelComeMail = async (email) => {
  const mailOptions = {
    from: process.env.NODE_MAILER_MAIL,
    to: email,
    subject: "Verify your email for Meet in the Middle",
    html: welCOmeMail(), // Use the HTML template for the email content
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info; // Return the info object for further processing if needed
  } catch (error) {
    throw new Error("Failed to send email - "+error);
  }
};
