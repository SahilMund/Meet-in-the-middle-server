import { transporter } from "../configs/nodeMailerTransporter.js";

import {
  accountDeletedMail,
  html,
  userDeleteTemplete,
  welCOmeMail,
} from "./nodemailerHtml.js";

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
    throw new Error("Failed to send email - " + error);
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
    throw new Error("Failed to send email - " + error);
  }
};

export const sendMeetingInvitationMail = async ({
  to = [],
  cc = [],
  subject,
  html,
}) => {
  try {
    const mailOptions = {
      from: process.env.NODE_MAILER_MAIL,
      to: Array.isArray(to) ? to.map((p) => p.email).join(",") : to,
      cc: Array.isArray(cc) ? cc.map((p) => p.email).join(",") : cc,
      subject: subject || "Meeting Invitation",
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error("Failed to send email - " + error.message);
  }
};
export const sendDeleteConformationMail = async (email) => {
  const mailOptions = {
    from: process.env.NODE_MAILER_MAIL,
    to: email,
    subject: "Account Deletion Requested and Scheduled and after 30 days",
    html: userDeleteTemplete(), // Use the HTML template for the email content
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info; // Return the info object for further processing if needed
  } catch (error) {
    throw new Error("Failed to send email - " + error);
  }
};
export const sendPermanentDeletionMail = async (email) => {
  const mailOptions = {
    from: process.env.NODE_MAILER_MAIL,
    to: email,
    subject: "Your Account has been deleted permantely",
    html: accountDeletedMail(), // Use the HTML template for the email content
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info; // Return the info object for further processing if needed
  } catch (error) {
    throw new Error("Failed to send email - " + error);
  }
};
