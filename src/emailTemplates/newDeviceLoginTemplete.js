export default function newDeviceLoginTemplate( deviceInfo,name ,resetPasswordLink="#") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Login Detected</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f9f9f9;
      margin: 0;
      padding: 30px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 30px;
    }
    h2 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 20px;
    }
    p {
      font-size: 15px;
      color: #555;
      line-height: 1.6;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 20px 0;
    }
    ul li {
      background: #f9fbfc;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #333;
      border-left: 4px solid #3498db;
    }
    ul li b {
      color: #2c3e50;
    }
    .alert {
      font-size: 15px;
      color: #e74c3c;
      margin-top: 20px;
    }
    .btn {
      display: inline-block;
      background: #3498db;
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 20px;
    }
    .footer {
      font-size: 13px;
      color: #888;
      margin-top: 30px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔐 New Login Detected</h2>

    <p>Hello <b>${name}</b>,</p>
    <p>A login was detected from a new device. Here are the details:</p>

    <ul>
      <li><b>Device:</b> ${deviceInfo.device}</li>
      <li><b>Browser:</b> ${deviceInfo.browser}</li>
      <li><b>OS:</b> ${deviceInfo.os}</li>
      <li><b>IP:</b> ${deviceInfo.ip}</li>
    </ul>

    <p class="alert">
      ⚠ If this wasn’t you, please 
      <a href="${resetPasswordLink}">reset your password</a> immediately.
    </p>

    <div style="text-align: center;">
      <a href="${resetPasswordLink}" class="btn">Reset Password</a>
    </div>

    <p class="footer">
      This is an automated security alert from <b>YourApp</b>.  
      If everything looks fine, you can ignore this message.
    </p>
  </div>
</body>
</html>`;
}
