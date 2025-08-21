const sendInvitationEmailHtml = ({
  title,
  description,
  hostName,
  scheduledAt,
  meetingLink,
}) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Meeting Invitation</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f9fafb; color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; padding:20px;">
      <tr>
        <td style="background-color:#0ea5e9; color:#ffffff; padding:16px; font-weight:bold; font-size:18px; border-radius:8px 8px 0 0; font-family: Arial, sans-serif;">
          Meet in the Middle
        </td>
      </tr>

      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; padding:30px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
            
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h1 style="margin:12px 0; font-size:24px; color:#1f2937; font-family: Arial, sans-serif;">Meeting Invitation</h1>
              </td>
            </tr>

            <tr>
              <td style="padding-bottom:15px; font-size:16px; line-height:1.5; color:#374151; font-family: Arial, sans-serif;">
                Hello, <br /><br />
                You've been invited to a meeting.
              </td>
            </tr>

            <tr>
              <td style="padding-bottom:20px;">
                <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="background-color:#f3f4f6; border-radius:6px;">
                  <tr>
                    <td style="color:#111827; font-family: Arial, sans-serif;"><strong>Title:</strong> ${title}</td>
                  </tr>
                  <tr>
                    <td style="color:#111827; font-family: Arial, sans-serif;"><strong>Description:</strong> ${description}</td>
                  </tr>
                   <tr>
                  <td style="color:#111827; font-family: Arial, sans-serif;"><strong>Host:</strong> ${hostName}</td>
                  </tr>
                  <tr>
                    <td style="color:#111827; font-family: Arial, sans-serif;"><strong>Date &amp; Time:</strong> ${scheduledAt}</td>
                  </tr>
                  <tr>
                    <td style="color:#111827; font-family: Arial, sans-serif;"><strong>Location:</strong> Not yet decided</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-bottom:30px;">
                <a href="${meetingLink}"
                   style="display:inline-block; background-color:#3b82f6; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:6px; font-weight:bold; font-family: Arial, sans-serif;">
                  Join Meeting
                </a>
              </td>
            </tr>

            <tr>
              <td style="font-size:14px; color:#6b7280; text-align:center; font-family: Arial, sans-serif;">
                If the button doesn’t work, copy this link: <br />
                <a href="${meetingLink}" style="color:#3b82f6; text-decoration:none;">${meetingLink}</a>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
export default sendInvitationEmailHtml;
