import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export async function sendEmail({
  to,
  subject,
  html,
  from = 'Курс Маркетингу <noreply@yourdomain.com>',
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const resend = getResendClient();

  if (!resend) {
    console.warn('RESEND_API_KEY not configured, skipping email send');
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}
