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
export default html;
