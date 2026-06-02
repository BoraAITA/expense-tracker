import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || "noreply@expense.local";

function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export interface SubscriptionReminderData {
  name: string;
  amount: string;
  nextDueDate: Date;
  interval: string;
}

export async function sendSubscriptionReminder(
  email: string,
  subscription: SubscriptionReminderData
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP not configured, skipping email");
    return false;
  }

  const dueDate = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(subscription.nextDueDate);

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Abonelik Hatırlatması</h2>
      <p>Merhaba,</p>
      <p><strong>${subscription.name}</strong> aboneliğinizin ödeme tarihi yaklaşıyor.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Tutar</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${subscription.amount} TRY</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Periyot</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${subscription.interval}</td>
        </tr>
        <tr>
          <td style="padding: 8px;"><strong>Sonraki ödeme</strong></td>
          <td style="padding: 8px;">${dueDate}</td>
        </tr>
      </table>
      <p style="color: #6b7280; font-size: 14px;">Expense Tracker</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: `Abonelik hatırlatması: ${subscription.name}`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send subscription reminder:", error);
    return false;
  }
}

export async function sendTestEmail(to: string): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP not configured");
    return false;
  }

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: "Expense Tracker - Test E-postası",
      html: "<p>SMTP bağlantısı başarılı!</p>",
    });
    return true;
  } catch (error) {
    console.error("Failed to send test email:", error);
    return false;
  }
}
