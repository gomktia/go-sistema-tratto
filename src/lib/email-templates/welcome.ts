
import { emailStyles, wrapHtml } from './base';

interface WelcomeProps {
    name: string;
    loginUrl: string;
}

export const getWelcomeHtml = ({ name, loginUrl }: WelcomeProps) => {
    const content = `
    <h1 style="${emailStyles.h1}">Bem-vindo(a), ${name}!</h1>
    <p>Estamos muito felizes em ter você no <strong>BeautyFlow</strong>.</p>
    <p>Agora você pode agendar seus horários com seus profissionais favoritos de forma rápida e fácil, tudo em um só lugar.</p>
    
    <p style="text-align: center;">
      <a href="${loginUrl}" style="${emailStyles.button}">Acessar Minha Conta</a>
    </p>
    
    <p style="margin-top: 24px;">
      Em sua conta você pode:
      <ul>
        <li>Ver histórico de agendamentos</li>
        <li>Reagendar serviços</li>
        <li>Descobrir novos salões parceiros</li>
      </ul>
    </p>
  `;

    return wrapHtml('Bem-vindo ao BeautyFlow', content);
};
