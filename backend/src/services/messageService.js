const axios = require('axios');

class MessageService {
  constructor() {
    this.client = axios.create({
      timeout: 15000,
    });
  }

  isTwilioConfigured() {
    return Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  isSmsEnabled() {
    return this.isTwilioConfigured() && Boolean(process.env.TWILIO_SMS_FROM);
  }

  isWhatsAppEnabled() {
    return this.isTwilioConfigured() && Boolean(process.env.TWILIO_WHATSAPP_FROM);
  }

  normalizePhoneNumber(phone) {
    if (typeof phone !== 'string' || !phone.trim()) {
      return null;
    }

    const trimmed = phone.trim();
    const collapsed = trimmed.replace(/[\s\-()]/g, '');

    if (collapsed.startsWith('+')) {
      return collapsed;
    }

    if (collapsed.startsWith('00')) {
      return `+${collapsed.slice(2)}`;
    }

    const defaultCountryCode = (process.env.TWILIO_DEFAULT_COUNTRY_CODE || '+266').trim();
    const nationalNumber = collapsed.replace(/^0+/, '');

    return defaultCountryCode.startsWith('+')
      ? `${defaultCountryCode}${nationalNumber}`
      : `+${defaultCountryCode}${nationalNumber}`;
  }

  normalizeWhatsAppFrom(fromNumber) {
    if (!fromNumber) {
      return null;
    }

    return fromNumber.startsWith('whatsapp:')
      ? fromNumber
      : `whatsapp:${fromNumber}`;
  }

  async sendTwilioMessage({ to, from, body }) {
    if (!this.isTwilioConfigured()) {
      return {
        success: false,
        skipped: true,
        message: 'Twilio credentials are not configured.',
      };
    }

    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', from);
    params.append('Body', body);

    const response = await this.client.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN,
        },
      }
    );

    return {
      success: true,
      skipped: false,
      sid: response.data?.sid || null,
      status: response.data?.status || null,
    };
  }

  async sendSms({ to, body }) {
    if (!this.isSmsEnabled()) {
      return {
        success: false,
        skipped: true,
        message: 'SMS messaging is not configured.',
      };
    }

    const normalizedTo = this.normalizePhoneNumber(to);
    if (!normalizedTo) {
      return {
        success: false,
        skipped: true,
        message: 'Recipient phone number is missing or invalid.',
      };
    }

    return this.sendTwilioMessage({
      to: normalizedTo,
      from: process.env.TWILIO_SMS_FROM,
      body,
    });
  }

  async sendWhatsApp({ to, body }) {
    if (!this.isWhatsAppEnabled()) {
      return {
        success: false,
        skipped: true,
        message: 'WhatsApp messaging is not configured.',
      };
    }

    const normalizedTo = this.normalizePhoneNumber(to);
    if (!normalizedTo) {
      return {
        success: false,
        skipped: true,
        message: 'Recipient phone number is missing or invalid.',
      };
    }

    return this.sendTwilioMessage({
      to: `whatsapp:${normalizedTo}`,
      from: this.normalizeWhatsAppFrom(process.env.TWILIO_WHATSAPP_FROM),
      body,
    });
  }

  formatDonationRequestBody({ donorName, bloodType, shortageAmount, hospitalName }) {
    const safeDonorName = donorName || 'donor';
    const safeHospitalName = hospitalName || 'the blood bank';
    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return [
      `Blood Suite urgent donation request for ${safeDonorName}.`,
      `Blood type needed: ${bloodType}.`,
      `Estimated shortage: ${shortageAmount} unit(s).`,
      `Requesting facility: ${safeHospitalName}.`,
      `Log in to ${appUrl} to view the request and schedule your donation if you are available.`,
    ].join(' ');
  }

  async sendDonationRequestMessages({ phone, donorName, bloodType, shortageAmount, hospitalName }) {
    if (!phone) {
      return {
        success: false,
        sms: { success: false, skipped: true, message: 'No donor phone number provided.' },
        whatsapp: { success: false, skipped: true, message: 'No donor phone number provided.' },
      };
    }

    const body = this.formatDonationRequestBody({
      donorName,
      bloodType,
      shortageAmount,
      hospitalName,
    });

    const [sms, whatsapp] = await Promise.all([
      this.sendSms({ to: phone, body }),
      this.sendWhatsApp({ to: phone, body }),
    ]);

    return {
      success: Boolean(sms.success || whatsapp.success),
      sms,
      whatsapp,
    };
  }
}

module.exports = new MessageService();
