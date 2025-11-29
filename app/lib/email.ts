import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
    try {
        // In development, log the email for debugging
        if (process.env.NODE_ENV === 'development') {
            console.log('📧 Sending email:', { to, subject });
        }

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev', // Use verified domain in production
            to,
            subject,
            text,
            html: html || `<p>${text}</p>`,
        });

        console.log('✅ Email sent successfully to:', to);
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        throw error;
    }
}
