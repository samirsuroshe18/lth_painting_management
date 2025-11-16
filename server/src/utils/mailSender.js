import { createTransport } from 'nodemailer';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { config } from '../config/env.js';

async function mailSender(email, emailType, password = "NA", userId = "") {
  try {
    let subject, htmlContent;
    // Create hashed token 
    const hashedToken = await bcrypt.hash(userId.toString(), 10);

    if (emailType === "user") {
      subject = "Welcome! Your Account Credentials";
      htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
          🙋 User Account Access
        </h1>
      </div>

      <div style="padding: 30px;">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">
          Welcome! Your Account Has Been Created
        </h2>

        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          You now have access to the Painting Management System. Please use the credentials below to log in.
        </p>

        <div style="background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #185a9d;">
          <h3 style="margin-top: 0; color: #003f5c; font-size: 18px;">
            🔑 Your Login Credentials
          </h3>
          <div style="background-color: rgba(255,255,255,0.95); padding: 15px; border-radius: 5px; margin-top: 15px;">
            <p style="margin: 8px 0; color: #333;"><strong>📧 Email:</strong> ${email}</p>
            <p style="margin: 8px 0; color: #333;"><strong>🔐 Password:</strong> <code style="background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password || 'Not provided'}</code></p>
          </div>
        </div>

        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h4 style="color: #856404; margin-top: 0;">
            ⚠️ Security Guidelines
          </h4>
          <ul style="color: #856404; margin: 10px 0; padding-left: 20px;">
            <li>Change your password after first login</li>
            <li>Keep your login details secure</li>
            <li>Use a strong, unique password</li>
          </ul>
        </div>

        <div style="background-color: #e0f7fa; border: 1px solid #81d4fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h4 style="color: #006064; margin-top: 0;">
            💡 What You Can Do
          </h4>
          <p style="color: #006064; margin: 10px 0;">
            • View and manage painting assets<br>
            • Submit feedback or audit results (if permitted)<br>
            • Access sector-level reports and dashboards (based on role)
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #888; font-size: 14px; margin: 5px 0;">
            Need help? Contact our support team.
          </p>
          <p style="color: #888; font-size: 12px; margin: 0;">
            This is an automated message. Please do not reply.
          </p>
        </div>
      </div>
    </div>
  `;
    }
    else if (emailType === "admin") {
      subject = "Welcome! Your Admin Account Credentials";
      htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #007991 0%, #78ffd6 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
          🛠️ Admin Account Access
        </h1>
      </div>

      <div style="padding: 30px;">
        <h2 style="color: #333; margin-top: 0; font-size: 22px;">
          Welcome! Your Admin Account Has Been Created
        </h2>

        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          You now have administrative access to the Painting Management System. Please find your login credentials below.
        </p>

        <div style="background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007991;">
          <h3 style="margin-top: 0; color: #003f5c; font-size: 18px;">
            🔑 Your Admin Credentials
          </h3>
          <div style="background-color: rgba(255,255,255,0.95); padding: 15px; border-radius: 5px; margin-top: 15px;">
            <p style="margin: 8px 0; color: #333;"><strong>📧 Email:</strong> ${email}</p>
            <p style="margin: 8px 0; color: #333;"><strong>🔐 Password:</strong> <code style="background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password || 'Not provided'}</code></p>
          </div>
        </div>

        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h4 style="color: #856404; margin-top: 0;">
            ⚠️ Security Guidelines
          </h4>
          <ul style="color: #856404; margin: 10px 0; padding-left: 20px;">
            <li>Change your password after first login</li>
            <li>Use two-factor authentication (if enabled)</li>
            <li>Never share your admin credentials</li>
          </ul>
        </div>

        <div style="background-color: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h4 style="color: #0d47a1; margin-top: 0;">
            📋 Your Admin Responsibilities
          </h4>
          <p style="color: #0d47a1; margin: 10px 0;">
            • Manage user accounts and permissions<br>
            • Oversee audit activity and reporting<br>
            • Ensure platform settings and configurations are accurate
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #888; font-size: 14px; margin: 5px 0;">
            For assistance, contact support.
          </p>
          <p style="color: #888; font-size: 12px; margin: 0;">
            This is an automated message. Please do not reply.
          </p>
        </div>
      </div>
    </div>
  `;
    }
    else if (emailType === "auditor") {
      subject = "Welcome! Your Auditor Account Credentials";
      htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
            🕵️ Auditor Account Access
          </h1>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-top: 0; font-size: 22px;">
            Hello! Your Auditor Account is Now Active
          </h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            You have been added as an Auditor to the Painting Management System. As an auditor, you are responsible for reviewing and verifying asset information during audits.
          </p>
          
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #764ba2;">
            <h3 style="margin-top: 0; color: #ffffff; font-size: 18px;">
              🔑 Your Auditor Credentials
            </h3>
            <div style="background-color: rgba(255,255,255,0.95); padding: 15px; border-radius: 5px; margin-top: 15px;">
              <p style="margin: 8px 0; color: #333;"><strong>📧 Email:</strong> ${email}</p>
              <p style="margin: 8px 0; color: #333;"><strong>🔐 Password:</strong> <code style="background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password || 'Not provided'}</code></p>
            </div>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #856404; margin-top: 0;">
              ⚠️ Security Guidelines
            </h4>
            <ul style="color: #856404; margin: 10px 0; padding-left: 20px;">
              <li>Change your password after first login</li>
              <li>Keep your credentials confidential</li>
              <li>Log out after completing audit tasks</li>
            </ul>
          </div>
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #0c5460; margin-top: 0;">
              🎯 Your Auditor Role
            </h4>
            <p style="color: #0c5460; margin: 10px 0;">
              • Access audit data via QR code scanning<br>
              • Verify and review painting asset information<br>
              • Submit detailed audit feedback securely
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #888; font-size: 14px; margin: 5px 0;">
              Need help? Reach out to our support team.
            </p>
            <p style="color: #888; font-size: 12px; margin: 0;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        </div>
      </div>`;
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + (1000 * 60 * 10) });
      subject = "Reset your password";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You have requested to reset your password. Click the button below to proceed.</p>
          <div style="margin: 30px 0;">
            <a href="${config.server.baseUrl}/api/v1/verify/reset-password?token=${hashedToken}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      `;
    }

    // Create a Transporter to send emails
    let transporter = createTransport({
      host: config.mail.host,
      port: config.mail.port,
      auth: {
        user: config.mail.user,
        pass: config.mail.pass,
      }
    });

    // Send emails to users
    let mailResponse = await transporter.sendMail({
      from: config.mail.user,
      to: email,
      subject: subject,
      html: htmlContent
    });

    return mailResponse;
  } catch (error) {
    console.log(error.message);
  }
};

export default mailSender;