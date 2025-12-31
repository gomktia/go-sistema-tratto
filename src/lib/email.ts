
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'BeautyFlow <nao-responda@beautyflow.app>'; // Você vai configurar isso no painel do Resend depois

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
    if (!process.env.RESEND_API_KEY) {
        console.log('⚠️ RESEND_API_KEY não configurada. Email não enviado.');
        console.log('--- EMAIL MOCK ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('--- END EMAIL MOCK ---');
        return { success: true, mock: true };
    }

    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        return { success: false, error };
    }
}
