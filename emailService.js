// emailService.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  logger: true,
  debug: true
});

// Verify transporter on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Transporter verification failed:', err);
  } else {
    console.log('✅ Email transporter is ready');
  }
});

// Main email sending function
const sendFormData = async (formData) => {
  try {
    console.log('📤 Sending email...');
    await transporter.sendMail({
      from: `"Capstone Project" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: 'New Form Submission',
      html: `<pre>${JSON.stringify(formData, null, 2)}</pre>`
    });
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw error;
  }
};

// NEW: Test email function
const sendTestEmail = async () => {
  console.log('\n🚀 Sending TEST email...');
  try {
    await transporter.sendMail({
      from: `"Test Sender" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: 'TEST Email from Capstone Project',
      text: 'This is a test email sent automatically when starting the email service.',
      html: `<h1>Test Successful!</h1>
             <p>This confirms your email service is working.</p>
             <p>Time sent: ${new Date().toLocaleString()}</p>`
    });
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
};

// NEW: Automatically send test email when this file is run directly
if (require.main === module) {
  (async () => {
    await sendTestEmail();
    process.exit(); // Exit after sending
  })();
}

module.exports = {
  sendFormData,
  sendTestEmail // Optional: Export if you want to call it elsewhere
};
