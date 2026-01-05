
import { emailStyles, wrapHtml } from './base';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingConfirmationProps {
    customerName: string;
    serviceName: string;
    professionalName: string;
    date: Date;
    tenantName: string;
    address?: string;
}

export const getBookingConfirmationHtml = ({
    customerName,
    serviceName,
    professionalName,
    date,
    tenantName,
    address
}: BookingConfirmationProps) => {
    const formattedDate = format(date, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR });
    const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(serviceName + ' - ' + tenantName)}&dates=${format(date, "yyyyMMdd'T'HHmmss")}/${format(new Date(date.getTime() + 60 * 60 * 1000), "yyyyMMdd'T'HHmmss")}&details=${encodeURIComponent('Com ' + professionalName)}&location=${encodeURIComponent(address || '')}`;

    const content = `
    <h1 style="${emailStyles.h1}">Olá, ${customerName}!</h1>
    <p>Seu agendamento foi confirmado com sucesso. Estamos te esperando!</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <span style="${emailStyles.label}">O QUE</span>
      <span style="${emailStyles.value}">${serviceName}</span>
      
      <span style="${emailStyles.label}">QUANDO</span>
      <span style="${emailStyles.value}" style="text-transform: capitalize;">${formattedDate}</span>
      
      <span style="${emailStyles.label}">COM QUEM</span>
      <span style="${emailStyles.value}">${professionalName}</span>
      
      <span style="${emailStyles.label}">ONDE</span>
      <span style="${emailStyles.value}">${tenantName}</span>
      ${address ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${address}</p>` : ''}
    </div>

    <p style="text-align: center;">
      <a href="${googleCalendarLink}" style="${emailStyles.button}" target="_blank">Adicionar à Agenda</a>
    </p>
    
    <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">
      Se precisar cancelar ou reagendar, entre em contato com o estabelecimento ou acesse seu perfil no nosso app.
    </p>
  `;

    return wrapHtml('Agendamento Confirmado', content);
};
