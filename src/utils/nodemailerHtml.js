const html = (otp) => `
<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Verify your email</title>
  <!-- Preheader (hidden preview text) -->
  <style>
    .preheader { display:none!important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; }
    @media (prefers-color-scheme: dark) {
      body, .email-body { background:#0b1220 !important; }
      .card { background:#121a2b !important; border-color:#24304a !important; }
      .muted { color:#a8b3cf !important; }
      .otp { background:#0d234a !important; color:#e6eeff !important; }
      .btn { background:#3b82f6 !important; color:#ffffff !important; }
      .title { color:#e6eeff !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f5f9;">

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f3f5f9;">
    <tr>
      <td align="center" style="padding:24px;">
        <!-- Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;" class="email-body">
          <tr>
            <td style="padding:0 12px 24px 12px;">
              <!-- Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;">
                <tr>
                  <td align="center" style="padding:16px 0 8px 0;">
                    <!-- Logo (optional) -->
                    <div style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:#111827;letter-spacing:.3px;">
                      Meet in the Middle
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;" class="card">
                <tr>
                  <td style="padding:28px 24px 8px 24px;">
                    <div class="title" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:20px;line-height:28px;color:#111827;font-weight:700;">
                      Verify your email
                    </div>
                    <div class="muted" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#6b7280;margin-top:6px;">
                      Use the one-time password below to complete your sign in.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:16px 24px 4px 24px;">
                    <!-- OTP Box -->
                    <div class="otp" style="display:inline-block;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-size:28px;letter-spacing:6px;line-height:1;border:2px dashed #d1d5db;border-radius:12px;padding:16px 22px;background:#f8fafc;color:#111827;">
                      ${otp}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:8px 24px 20px 24px;">
                    <div class="muted" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#6b7280;">
                      This code expires in <strong>10 minutes</strong>.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px 24px 24px;">
                    <div class="muted" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:19px;color:#9ca3af;">
                      If you didn’t request this, you can safely ignore this email.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px;">
                <tr>
                  <td align="center" style="padding:8px 0 0 0;">
                    <div class="muted" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:19px;color:#9ca3af;">
                      © ${new Date().getFullYear()} Meet in the Middle • You’re receiving this because someone used your email to sign in.
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
        <!-- /Container -->
      </td>
    </tr>
  </table>
</body>
</html>
`;

const welCOmeMail = () => `
<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Welcome to Meet in the Middle</title>
  <style>
    .preheader { display:none!important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; }
    @media (prefers-color-scheme: dark) {
      body, .email-body { background:#0b1220 !important; }
      .card { background:#121a2b !important; border-color:#24304a !important; }
      .muted { color:#a8b3cf !important; }
      .btn { background:#3b82f6 !important; color:#ffffff !important; }
      .title { color:#e6eeff !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f5f9;">

  <span class="preheader">Welcome to Meet in the Middle! Let’s get you started 🚀</span>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f3f5f9;">
    <tr>
      <td align="center" style="padding:24px;">
        <!-- Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;" class="email-body">
          <tr>
            <td style="padding:0 12px 24px 12px;">
              
              <!-- Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;">
                <tr>
                  <td align="center" style="padding:16px 0 8px 0;">
                    <div style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#111827;letter-spacing:.3px;">
                      🎉 Meet in the Middle
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;" class="card">
                <tr>
                  <td style="padding:28px 24px 8px 24px;">
                    <div class="title" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:22px;line-height:30px;color:#111827;font-weight:700;">
                      Welcome to Meet in the Middle 🚀
                    </div>
                    <div class="muted" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#6b7280;margin-top:6px;">
                      We’re excited to have you on board! Meet in the Middle helps you connect, collaborate, and find the perfect common ground effortlessly.
                    </div>
                  </td>
                </tr>

                <!-- Hero Banner -->
                <tr>
                  <td align="center" style="padding:16px 24px;">
                    <img src="https://i.imgur.com/khH5G5n.png" alt="Welcome" width="100%" style="max-width:480px;border-radius:12px;" />
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:16px 24px;">
                    <a href="https://your-app-link.com" target="_blank" class="btn" style="display:inline-block;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;text-decoration:none;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:10px;">
                      Get Started
                    </a>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 24px 24px 24px;">
                    <div class="muted" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:22px;color:#6b7280;">
                      Need help? Check out our <a href="https://your-app-link.com/help" style="color:#2563eb;text-decoration:none;">Help Center</a> or reply directly to this email. Our team is always here for you 🤝
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px;">
                <tr>
                  <td align="center" style="padding:8px 0 0 0;">
                    <div class="muted" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:19px;color:#9ca3af;">
                      © ${new Date().getFullYear()} Meet in the Middle • Thank you for joining us on this journey.
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
        <!-- /Container -->
      </td>
    </tr>
  </table>
</body>
</html>
`;
const userDeleteTemplete = () => `
<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Account Deletion Scheduled</title>
  <style>
    .preheader { display:none!important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; }
    @media (prefers-color-scheme: dark) {
      body, .email-body { background:#0b1220 !important; }
      .card { background:#121a2b !important; border-color:#24304a !important; }
      .muted { color:#a8b3cf !important; }
      .notice { background:#0d234a !important; color:#e6eeff !important; }
      .title { color:#e6eeff !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f5f9;">

  <span class="preheader">Your account deletion has been scheduled. It will be permanently deleted after 30 days unless you log in to cancel it.</span>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f3f5f9;">
    <tr>
      <td align="center" style="padding:24px;">
        <!-- Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;" class="email-body">
          <tr>
            <td style="padding:0 12px 24px 12px;">
              <!-- Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;">
                <tr>
                  <td align="center" style="padding:16px 0 8px 0;">
                    <div style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:#111827;letter-spacing:.3px;">
                      Meet in the Middle
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;" class="card">
                <tr>
                  <td style="padding:28px 24px 8px 24px;">
                    <div class="title" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:20px;line-height:28px;color:#111827;font-weight:700;">
                      Account Deletion Scheduled
                    </div>
                    <div class="muted" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#6b7280;margin-top:6px;">
                      You have opted to delete your account. Your account is scheduled for <strong>permanent deletion after 30 days</strong>.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:16px 24px 20px 24px;">
                    <div class="notice" style="display:inline-block;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;border:2px dashed #d1d5db;border-radius:12px;padding:16px 22px;background:#fef2f2;color:#991b1b;">
                      If you want to cancel the deletion, simply log in to your account once before the 30-day period ends.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px 24px 24px;">
                    <div class="muted" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:19px;color:#9ca3af;">
                      If you don’t take any action, your account and all associated data will be permanently deleted after 30 days.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px;">
                <tr>
                  <td align="center" style="padding:8px 0 0 0;">
                    <div class="muted" style="font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:19px;color:#9ca3af;">
                      © ${new Date().getFullYear()} Meet in the Middle • You’re receiving this because you requested to delete your account.
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
        <!-- /Container -->
      </td>
    </tr>
  </table>
</body>
</html>
`;
const accountDeletedMail = () => `
<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Account Permanently Deleted</title>
  <style>
    .preheader { 
      display:none!important; 
      visibility:hidden; 
      opacity:0; 
      color:transparent; 
      height:0; 
      width:0; 
      overflow:hidden; 
      mso-hide:all; 
    }

    body {
      margin:0;
      padding:0;
      background:#f3f5f9;
      font-family: Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    }

    .email-body {
      border-radius: 16px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(90deg, #e63946, #d62828);
      color: #fff;
      padding: 20px;
      text-align: center;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: .5px;
    }

    .card {
      background:#ffffff;
      border:1px solid #e5e7eb;
      border-radius:0 0 16px 16px;
      overflow:hidden;
    }

    .title {
      font-size:22px;
      line-height:30px;
      color:#d62828;
      font-weight:700;
      text-align: center;
    }

    .muted {
      font-size:15px;
      line-height:22px;
      color:#555;
      margin-top:8px;
      text-align:center;
    }

    .footer {
      margin-top:16px;
      text-align:center;
      font-size:12px;
      line-height:19px;
      color:#9ca3af;
    }

    /* Dark mode styles */
    @media (prefers-color-scheme: dark) {
      body, .email-body { background:#0b1220 !important; }
      .card { background:#121a2b !important; border-color:#24304a !important; }
      .muted { color:#a8b3cf !important; }
      .title { color:#ff6b6b !important; }
      .header { background: linear-gradient(90deg,#9b2226,#ae2012) !important; }
    }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f3f5f9;">
    <tr>
      <td align="center" style="padding:24px;">
        <!-- Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;" class="email-body">
          <tr>
            <td>
              <!-- Header -->
              <div class="header">
                Meet in the Middle
              </div>

              <!-- Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="card">
                <tr>
                  <td style="padding:28px 24px 8px 24px;">
                    <div class="title">
                      Account Permanently Deleted
                    </div>
                    <div class="muted">
                      Your account has been permanently deleted from our system after the <strong>30-day grace period</strong>. 
                      All of your data has been removed and <strong>cannot be recovered</strong>.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:16px 24px 24px 24px;">
                    <div class="muted">
                      If you wish to use our services again, you may create a new account anytime.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <div class="footer">
                © ${new Date().getFullYear()} Meet in the Middle • You’re receiving this because your account has been permanently deleted.
              </div>

            </td>
          </tr>
        </table>
        <!-- /Container -->
      </td>
    </tr>
  </table>
</body>
</html>
`;
const magicLinkMail = (magicLink) => {
  return `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
    <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #333; text-align: center;">🔑 Magic Login</h2>
      <p style="color: #555; font-size: 16px;">
        Hi there,<br/><br/>
        Click the button below to securely log in. This link is valid for only <b>10 minutes</b>.
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${magicLink}" 
           style="background-color: #4f46e5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
          🔗 Login Now
        </a>
      </div>
    </div>
  </div>
  `;
};

export {
  welCOmeMail,
  html,
  userDeleteTemplete,
  accountDeletedMail,
  magicLinkMail,
};
