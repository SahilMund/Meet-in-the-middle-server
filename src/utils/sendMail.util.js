import { transporter } from "../configs/nodeMailer.js";
import cron from "node-cron";
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

export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.NODE_MAILER_MAIL,
    to: to,
    subject: subject,
    text,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:" + info.response);
  } catch (error) {
    throw new Error("Failed to send email - " + error);
  }
};

export const scheduleConfirmationRemainder = async (
  meeting,
  participants,
  startTime
) => {
  const task = cron.schedule("0 9 */2 * *", async () => {
    const now = new Date();
    if (now >= startTime) {
      task.stop();
      return;
    }
    for (let p of participants) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: p.email,
        subject: `Reminder: Respond to meeting "${meeting.title}"`,
        html: `
          <p>Hello ${p.name},</p>
          <p>You have a pending meeting scheduled at <b>${startTime.toLocaleString()}</b>.</p>
          
        `,
      };

      await transporter.sendMail(mailOptions);
    }
  });
  task.start();
};

export const sendMagicEmail = async (email, subject, html) => {
  const mailOptions = {
    from: process.env.NODE_MAILER_MAIL,
    to: email,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error("Failed to send email - " + error);
  }
};

export const sendResetPasswordMail = async (email, resetLink) => {
  const mailOptions = {
    from: process.env.NODE_MAILER_MAIL,
    to: email,
    subject: "Reset Your Password - Meet in the Middle",
    html: `
      <h2>Reset Password Request</h2>
      <p>Hello,</p>
      <p>You requested to reset your password. Please click the link below to reset your password:</p>
      <a href="${resetLink}" target="_blank" style="display:inline-block;margin-top:10px;padding:10px 20px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;">
        Reset Password
      </a>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error("Failed to send reset password email - " + error.message);
  }
};
export const sendMail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error("Failed to send email - " + error.message);
  }
};