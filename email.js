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


//Function to send an email that someone has requested to join your ride:
async function sendRideRequestEmail(userEmail, tripName, acceptUrl, rejectUrl) {
  try {
      const transporter = createTransporter();      
      const mailOptions = {
          from: process.env.FROM_EMAIL,
          to: userEmail,
          subject: "KCC - Someone wants to join your ride!",
          text: `Someone has requested to join your ride. Trip: "${tripName}". Accept: ${acceptUrl} Reject: ${rejectUrl}`,
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Ride Request</h2>
                  <p>Someone has requested to join your ride:</p>
                  <p>${tripName}</p>
                  <p>Click below to accept or reject the request:</p>
                  <p>
                      <a href="${acceptUrl}" style="padding:10px 20px; background-color:green; color:white; text-decoration:none;">Accept</a>
                      &nbsp;&nbsp;
                      <a href="${rejectUrl}" style="padding:10px 20px; background-color:red; color:white; text-decoration:none;">Reject</a>
                  </p>
                  <p>Thanks,</p>
                  <p>Kenyon Car-Connect</p>
              </div>
          `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
  } catch (error) {
      console.error('Error sending ride request email:', error);
      return false;
  }
}


module.exports = {sendVerificationEmail, sendRideRequestEmail};