/**
 * Template de email de confirmação de cadastro
 */
function getConfirmationEmailTemplate(volunteerName: string, volunteerEmail: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(to right, #53245c, #33b9cb); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .button { background: linear-gradient(to right, #53245c, #33b9cb); color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bem-vindo ao Health Army!</h1>
      <p>Obrigado por se voluntariar</p>
    </div>
    <div class="content">
      <h2>Olá ${volunteerName},</h2>
      <p>Seu cadastro foi realizado com sucesso! Estamos muito felizes em tê-lo como voluntário do Health Army.</p>
      
      <h3>Próximos Passos:</h3>
      <ul>
        <li>Nossa equipe entrará em contato em breve para confirmar seus dados</li>
        <li>Você receberá um convite para acessar o Google Agenda</li>
        <li>Poderá gerenciar sua disponibilidade de horários</li>
      </ul>
      
      <p>Se tiver dúvidas, não hesite em entrar em contato conosco.</p>
      
      <p><strong>Dados do Cadastro:</strong></p>
      <p>Email: ${volunteerEmail}</p>
      
      <p>Obrigado por contribuir para transformar vidas através da saúde!</p>
      
      <p>Atenciosamente,<br><strong>Equipe Health Army</strong></p>
    </div>
    <div class="footer">
      <p>© 2025 Health Army. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Template de email para notificação ao admin
 */
function getAdminNotificationTemplate(volunteerName: string, specialization: string, project: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(to right, #53245c, #33b9cb); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; border-left: 4px solid #33b9cb; padding: 15px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Novo Voluntário Cadastrado</h1>
      <p>Notificação do Sistema Health Army</p>
    </div>
    <div class="content">
      <h2>Um novo voluntário se cadastrou!</h2>
      
      <div class="info-box">
        <p><strong>Nome:</strong> ${volunteerName}</p>
        <p><strong>Especialidade:</strong> ${specialization}</p>
        <p><strong>Projeto:</strong> ${project}</p>
      </div>
      
      <p>Acesse o painel administrativo para visualizar todos os detalhes e gerenciar o cadastro.</p>
      
      <p>Atenciosamente,<br><strong>Sistema Health Army</strong></p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Enviar email de confirmação de cadastro
 */
export async function sendConfirmationEmail(
  volunteerName: string,
  volunteerEmail: string
): Promise<boolean> {
  try {
    // Usar a API de notificação do Manus para enviar email
    const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/notification/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
      },
      body: JSON.stringify({
        to: volunteerEmail,
        subject: "Bem-vindo ao Health Army - Cadastro Confirmado",
        html: getConfirmationEmailTemplate(volunteerName, volunteerEmail),
      }),
    });

    if (!response.ok) {
      console.error("[Email] Erro ao enviar email de confirmação:", response.statusText);
      return false;
    }

    console.log("[Email] Email de confirmação enviado para:", volunteerEmail);
    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar email:", error);
    return false;
  }
}

/**
 * Enviar notificação ao admin sobre novo voluntário
 */
export async function sendAdminNotification(
  volunteerName: string,
  specialization: string,
  project: string,
  adminEmail: string
): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/notification/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
      },
      body: JSON.stringify({
        to: adminEmail,
        subject: `[Health Army] Novo Voluntário Cadastrado: ${volunteerName}`,
        html: getAdminNotificationTemplate(volunteerName, specialization, project),
      }),
    });

    if (!response.ok) {
      console.error("[Email] Erro ao enviar notificação ao admin:", response.statusText);
      return false;
    }

    console.log("[Email] Notificação enviada ao admin:", adminEmail);
    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar notificação:", error);
    return false;
  }
}
