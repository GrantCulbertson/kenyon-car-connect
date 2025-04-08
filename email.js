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
async function sendRideRequestEmail(userEmail, tripName) {
  try {
      const transporter = createTransporter();      
      const mailOptions = {
          from: process.env.FROM_EMAIL,
          to: userEmail,
          subject: "KCC - Someone wants to join your ride!",
          text: `Someone has requested to join your ride. Trip: "${tripName}".`,
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Ride Request</h2>
                  <p>Someone has requested to join your ride:</p>
                  <p>${tripName}</p>
                  <p>Please go to the your trips page on the site to handle their request.</p>
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

//Function to send an email letting a user know that their request to join a ride has been accepted:
async function sendRequestAcceptedEmail(userEmail, tripName) {
  try {
      const transporter = createTransporter();      
      const mailOptions = {
          from: process.env.FROM_EMAIL,
          to: userEmail,
          subject: "KCC - Your request to join a ride has been accepted!",
          text: `Your request to join the ride "${tripName}" has been accepted!`,
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Ride Request Accepted</h2>
                  <p>Your request to join the ride:</p>
                  <p>"${tripName}"</p>
                  <p>Has been accepted!</p>
                  <p>Congrats!</p>
                  <p>Kenyon Car-Connect</p>
              </div>
          `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
  } catch (error) {
      console.error('Error sending ride accepted email:', error);
      return false;
  }
}

//Function to send an email letting a user know that their request to join a ride has been denied:
async function sendRequestDeniedEmail(userEmail, tripName) {
  try {
      const transporter = createTransporter();      
      const mailOptions = {
          from: process.env.FROM_EMAIL,
          to: userEmail,
          subject: "KCC - Your request to join a ride has been denied!",
          text: `Your request to join the ride "${tripName}" has been denied!`,
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Ride Request Denied</h2>
                  <p>Your request to join the ride:</p>
                  <p>"${tripName}"</p>
                  <p>Has been denied.</p>
                  <p>Sorry,</p>
                  <p>Kenyon Car-Connect</p>
              </div>
          `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
  } catch (error) {
      console.error('Error sending ride denied email:', error);
      return false;
  }
}

//Function to send an email letting them know they have been removed from a trip:
async function sendPassengerDeletedEmail(userEmail, tripName) {
  try {
      const transporter = createTransporter();      
      const mailOptions = {
          from: process.env.FROM_EMAIL,
          to: userEmail,
          subject: "KCC - You have been removed from a ride!",
          text: `You have been removed from the ride "${tripName}".`,
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Removed from Ride</h2>
                  <p>You have been removed from the ride:</p>
                  <p>"${tripName}"</p>
                  <p>Sorry,</p>
                  <p>Kenyon Car-Connect</p>
              </div>
          `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
  } catch (error) {
      console.error('Error sending ride denied email:', error);
      return false;
  }
}

//Function to send an email letting passengers know that the trip they were in was canceled
async function sendTripDeletedEmail(userEmail, tripName){
  try {
      const transporter = createTransporter();      
      const mailOptions = {
          from: process.env.FROM_EMAIL,
          to: userEmail,
          subject: "KCC - A ride you were in has been canceled!",
          text: `The ride "${tripName}" has been canceled.`,
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Ride Canceled</h2>
                  <p>The ride:</p>
                  <p>"${tripName}"</p>
                  <p>Has been canceled by its driver.</p>
                  <p>Sorry,</p>
                  <p>Kenyon Car-Connect</p>
              </div>
          `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
  } catch (error) {
      console.error('Error sending ride denied email:', error);
      return false;
  }
}

//Function to send an email to the trip driver letting them know that a passenger has left their trip:
async function sendPassengerLeftEmail(userEmail, tripName){
  try {
      const transporter = createTransporter();      
      const mailOptions = {
          from: process.env.FROM_EMAIL,
          to: userEmail,
          subject: "KCC - A passenger has left your ride!",
          text: `A passenger has left your ride "${tripName}".`,
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Passenger Left Ride</h2>
                  <p>A passenger has left your ride:</p>
                  <p>"${tripName}"</p>
                  <p>Sorry,</p>
                  <p>Kenyon Car-Connect</p>
              </div>
          `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
  } catch (error) {
      console.error('Error sending ride denied email:', error);
      return false;
  }
}


module.exports = {sendVerificationEmail, sendRideRequestEmail, sendRequestAcceptedEmail, sendRequestDeniedEmail, sendPassengerDeletedEmail, sendTripDeletedEmail, sendPassengerLeftEmail};