const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  isEnabled() {
    return Boolean(
      process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD
    );
  }

  getTransporter() {
    if (!this.isEnabled()) {
      return null;
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    return this.transporter;
  }

  async sendEmail({ to, subject, text, html }) {
    const transporter = this.getTransporter();

    if (!transporter) {
      return {
        success: false,
        skipped: true,
        message: 'Email transport is not configured.',
      };
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });

    return {
      success: true,
      skipped: false,
    };
  }

  async sendDonationRequestEmail({ to, donorName, bloodType, shortageAmount, hospitalName }) {
    const subject = `Urgent blood donation request for ${bloodType}`;
    const safeHospitalName = hospitalName || 'the blood bank';
    const safeDonorName = donorName || 'donor';
    const text = [
      `Hello ${safeDonorName},`,
      '',
      `There is an urgent need for ${bloodType} blood.`,
      `Estimated shortage: ${shortageAmount} unit(s).`,
      `Requested by: ${safeHospitalName}.`,
      '',
      'Please log in to Blood Suite and consider donating if you are available.',
      '',
      'Thank you for helping save lives.',
    ].join('\n');

    const html = `
      <p>Hello ${safeDonorName},</p>
      <p>There is an urgent need for <strong>${bloodType}</strong> blood.</p>
      <p>Estimated shortage: <strong>${shortageAmount}</strong> unit(s).</p>
      <p>Requested by: <strong>${safeHospitalName}</strong>.</p>
      <p>Please log in to Blood Suite and consider donating if you are available.</p>
      <p>Thank you for helping save lives.</p>
    `;

    return this.sendEmail({ to, subject, text, html });
  }
}

module.exports = new EmailService();
