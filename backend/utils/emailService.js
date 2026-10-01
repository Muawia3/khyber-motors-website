import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Create transporter
// If SMTP_HOST is not provided, we will just log the email (fallback mode)
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials missing in .env. Emails will only be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendLeadEmail = async (lead) => {
  const transporter = createTransporter();
  
  // Decide who gets the email based on the department
  let toEmail = process.env.ADMIN_EMAIL || 'muawiakhan000@gmail.com';
  
  // If the user selected 'hawad khan' as department (case-insensitive check)
  if (lead.department && lead.department.toLowerCase().includes('hawad')) {
    // We send it to hawad khan's direct email if we have it, else fallback to a placeholder/admin
    // You can change this email to Hawad Khan's actual email
    toEmail = process.env.HAWAD_EMAIL || 'hawadkhan@khybermotors.com'; 
  }

  const subject = `New Inquiry from ${lead.name} (${lead.city || 'Unknown Location'})`;
  
  const htmlContent = `
    <h2>New Lead Submission</h2>
    <p><strong>Name:</strong> ${lead.name}</p>
    <p><strong>Phone:</strong> ${lead.phone}</p>
    <p><strong>Email:</strong> ${lead.email || 'N/A'}</p>
    <p><strong>City:</strong> ${lead.city || 'N/A'}</p>
    <p><strong>Department:</strong> ${lead.type || 'N/A'}</p>
    <hr />
    <h3>Message:</h3>
    <p>${lead.message || 'No message provided.'}</p>
  `;

  if (!transporter) {
    console.log('--- MOCK EMAIL SENT ---');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${htmlContent}`);
    console.log('-----------------------');
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Khyber Motors Website" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};
