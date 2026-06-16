// Envio de e-mail transacional. Usa a API REST do Resend quando
// RESEND_API_KEY está configurada; caso contrário, em desenvolvimento,
// registra o link no console para facilitar testes. NUNCA loga o link em
// produção (evita vazar token nos logs do servidor).

type SendResult = { delivered: boolean };

const FROM = process.env.EMAIL_FROM ?? "CCT SINCRO <onboarding@resend.dev>";

async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[email:dev] RESEND_API_KEY ausente — e-mail não enviado.\n  para: ${to}\n  assunto: ${subject}`);
    }
    return { delivered: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    return { delivered: res.ok };
  } catch {
    return { delivered: false };
  }
}

export async function sendPasswordResetEmail(to: string, link: string): Promise<SendResult> {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#111">
      <h2 style="margin:0 0 12px">Recuperação de senha — CCT SINCRO</h2>
      <p>Recebemos um pedido para redefinir sua senha. O link abaixo expira em 1 hora e só pode ser usado uma vez.</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">
          Redefinir senha
        </a>
      </p>
      <p style="font-size:13px;color:#666">Se você não solicitou, ignore este e-mail — nada será alterado.</p>
    </div>`;

  // Em desenvolvimento sem provedor, mostra o link para permitir o teste do fluxo.
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
    console.warn(`[email:dev] Link de redefinição de senha para ${to}:\n  ${link}`);
  }

  return sendEmail(to, "Recuperação de senha — CCT SINCRO", html);
}
