
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getBookingConfirmationHtml } from '@/lib/email-templates/booking-confirmation';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            customerEmail,
            customerName,
            serviceName,
            professionalName,
            date,
            tenantName,
            address
        } = body;

        // Validate if data is present
        if (!customerEmail || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const html = getBookingConfirmationHtml({
            customerName,
            serviceName,
            professionalName,
            date: new Date(date),
            tenantName,
            address
        });

        const result = await sendEmail({
            to: customerEmail,
            subject: `Agendamento Confirmado: ${serviceName} com ${professionalName}`,
            html
        });

        if (!result.success) {
            // We don't want to fail the whole booking process if email fails, but we should log it
            console.error('Failed to send confirmation email', result.error);
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
