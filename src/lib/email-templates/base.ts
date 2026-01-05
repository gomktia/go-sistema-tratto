
export const emailStyles = {
    container: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
  `,
    header: `
    background-color: #111827;
    padding: 24px;
    text-align: center;
  `,
    headerText: `
    color: #ffffff;
    font-size: 20px;
    font-weight: bold;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 2px;
  `,
    content: `
    padding: 32px 24px;
    color: #374151;
    line-height: 1.6;
  `,
    button: `
    display: inline-block;
    padding: 12px 24px;
    background-color: #2563eb;
    color: #ffffff;
    text-decoration: none;
    border-radius: 6px;
    font-weight: bold;
    margin-top: 24px;
  `,
    footer: `
    background-color: #f9fafb;
    padding: 16px;
    text-align: center;
    font-size: 12px;
    color: #6b7280;
    border-top: 1px solid #e5e7eb;
  `,
    h1: `
    color: #111827;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 16px;
    margin-top: 0;
  `,
    label: `
    display: block;
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 16px;
    font-weight: 600;
  `,
    value: `
    display: block;
    font-size: 16px;
    color: #111827;
    font-weight: 500;
  `
};

export const wrapHtml = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f3f4f6;">
  <div style="${emailStyles.container}">
    <div style="${emailStyles.header}">
      <h1 style="${emailStyles.headerText}">BeautyFlow</h1>
    </div>
    <div style="${emailStyles.content}">
      ${content}
    </div>
    <div style="${emailStyles.footer}">
      <p>© ${new Date().getFullYear()} BeautyFlow SAAS. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`;
