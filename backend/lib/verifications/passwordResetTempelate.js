export const passwordResetEmailTemplate = ({
  name,
  email,
  resetLink,
}) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
    <style>
      body {
        font-family: 'Helvetica', Arial, sans-serif;
        background-color: #f0f2f5;
        margin: 0;
        padding: 0;
      }

      .wrapper {
        width: 100%;
        padding: 40px 0;
        background-color: #f0f2f5;
      }

      .container {
        max-width: 500px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border: 1px solid #e0e0e0;
      }

      .header {
        background-color: #dc2626;
        color: #ffffff;
        text-align: center;
        padding: 20px;
        font-size: 24px;
        font-weight: bold;
      }

      .content {
        padding: 30px 25px;
        color: #333333;
        font-size: 16px;
        line-height: 1.5;
      }

      .btn {
        display: inline-block;
        margin-top: 20px;
        padding: 12px 25px;
        background-color: #dc2626;
        color: #ffffff !important;
        text-decoration: none;
        font-weight: bold;
        border-radius: 5px;
      }

      .footer {
        text-align: center;
        font-size: 12px;
        color: #888888;
        padding: 20px;
      }

      p {
        margin: 15px 0;
      }
    </style>
  </head>

  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          Reset Your Password
        </div>
        <div class="content">
          <p>Hello <strong>${name}</strong>,</p>

          <p>We received a request to reset your password.</p>

          <p><strong>Email:</strong> ${email}</p>

          <p>Click the button below to reset your password:</p>

          <a href="${resetLink}" class="btn">Reset Password</a>

          <p>
            This link will expire soon. If you didn’t request a password reset,
            you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
        </div>
      </div>
    </div>
  </body>
</html>
`;
