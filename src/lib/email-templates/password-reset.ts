
import { emailStyles, wrapHtml } from './base';

interface PasswordResetProps {
    resetLink: string;
}

export const getPasswordResetHtml = ({ resetLink }: PasswordResetProps) => {
    const content = `
    <h1 style="${emailStyles.h1}">Recuperação de Senha</h1>
    <p>Recebemos uma solicitação para redefinir a senha da sua conta no BeautyFlow.</p>
    <p>Se foi você, clique no botão abaixo para criar uma nova senha:</p>
    
    <p style="text-align: center;">
      <a href="${resetLink}" style="${emailStyles.button}">Redefinir Minha Senha</a>
    </p>
    
    <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
      Este link expira em 1 hora. Se você não solicitou a redefinição, pode ignorar este e-mail com segurança.
    </p>
  `;

    return wrapHtml('Redefinir Senha', content);
};
