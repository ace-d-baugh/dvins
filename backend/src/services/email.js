const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS
  }
});

// Send verification email
const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'verify@dvins.app',
    to: email,
    subject: 'D'VINS - Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to D'VINS!</h1>
        <p>Thanks for registering for D'VINS - your Disney wait times tracker.</p>
        <p>Please click the button below to verify your email address:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>If you didn't sign up for D'VINS, you can ignore this email.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">D'VINS Team</p>
      </div>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error.message);
    throw error;
  }
};

// Send notification email (placeholder for future use)
const sendNotificationEmail = async (userEmail, attractionName, waitTime) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'notifications@dvins.app',
    to: userEmail,
    subject: `D'VINS - Wait Time Alert for ${attractionName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Wait Time Alert</h1>
        <p>The wait time for <strong>${attractionName}</strong> is now ${waitTime} minutes.</p>
        <p>Visit D'VINS to see all current wait times.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">D'VINS Team</p>
      </div>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to ${userEmail}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send notification email to ${userEmail}:`, error.message);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendNotificationEmail
};
