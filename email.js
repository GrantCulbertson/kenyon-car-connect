//This file holds all functions for emailing users, similar to how the db.js file works.
const nodemailer = require("nodemailer");
require('dotenv').config();


// Create reusable transporter object using Brevo SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_USER, // My Brevo Email
        pass: process.env.BREVO_SMTP_KEY // My Brevo account SMTP key
      }
    });
  };

//Function to send a email to a user with their verification code:
// Function to send a verification email
async function sendVerificationEmail(userEmail, verificationCode) {
    console.log(process.env.BREVO_USER);
    console.log(process.env.BREVO_SMTP_KEY);
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: userEmail,
        subject: "Kenyon Car Connect Verification Code",
        text: `Welcome to Kenyon Car Connect! Your verification code is: ${verificationCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Kenyon Car Connect!</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #4a90e2; font-size: 32px; letter-spacing: 2px;">${verificationCode}</h1>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  };

module.exports = {sendVerificationEmail};