"use server";

import { randomBytes, createHash } from "crypto";
import { hash } from "bcryptjs";
import { db } from "./db";
import { sendPasswordResetEmail } from "./email";
import type { FormState } from "./types";

const BCRYPT_COST = 12;
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN = 8;

function baseUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

// ---------------------------------------------------------------------------
// Cadastro: cria uma nova organização (tenant) e seu primeiro usuário ADMIN.
// Atômico — org + user na mesma transação, sem deixar org órfã.
// ---------------------------------------------------------------------------
export async function registerUser(formData: FormData): Promise<FormState> {
  const organizacao = String(formData.get("organizacao") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const errors: Record<string, string> = {};
  if (!organizacao) errors.organizacao = "Informe o nome da empresa/organização";
  if (!name) errors.name = "Informe seu nome";
  if (!EMAIL_RE.test(email)) errors.email = "E-mail inválido";
  if (password.length < SENHA_MIN) errors.password = `Mínimo de ${SENHA_MIN} caracteres`;
  if (password !== confirm) errors.confirm = "As senhas não conferem";
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { ok: false, errors: { email: "Este e-mail já está cadastrado" } };

  try {
    const senhaHash = await hash(password, BCRYPT_COST);
    await db.$transaction(async (tx) => {
      const org = await tx.organizacao.create({ data: { nome: organizacao, plano: "START" } });
      await tx.user.create({
        data: { name, email, password: senhaHash, role: "ADMIN", organizacaoId: org.id },
      });
    });
  } catch {
    return { ok: false, message: "Não foi possível concluir o cadastro. Tente novamente." };
  }

  return { ok: true, message: "Conta criada com sucesso" };
}

// ---------------------------------------------------------------------------
// Esqueci a senha: gera token de uso único (guardamos só o hash) e envia
// o link por e-mail. Resposta SEMPRE genérica — não revela se o e-mail existe.
// ---------------------------------------------------------------------------
export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const generico: FormState = {
    ok: true,
    message: "Se houver uma conta com este e-mail, enviamos um link de recuperação.",
  };

  if (!EMAIL_RE.test(email)) return { ok: false, errors: { email: "E-mail inválido" } };

  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return generico;

  const raw = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  try {
    await db.$transaction([
      db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      db.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(raw), expiresAt } }),
    ]);
    const link = `${baseUrl()}/reset-password?token=${raw}`;
    await sendPasswordResetEmail(email, link);
  } catch {
    // Falha silenciosa proposital: não vaza estado por mensagem diferente.
  }

  return generico;
}

// ---------------------------------------------------------------------------
// Redefinir senha: valida o token (hash + expiração), troca a senha e
// invalida TODOS os tokens do usuário (uso único).
// ---------------------------------------------------------------------------
export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const errors: Record<string, string> = {};
  if (password.length < SENHA_MIN) errors.password = `Mínimo de ${SENHA_MIN} caracteres`;
  if (password !== confirm) errors.confirm = "As senhas não conferem";
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (!token) return { ok: false, message: "Link inválido ou expirado. Solicite um novo." };

  const registro = await db.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!registro || registro.expiresAt < new Date()) {
    return { ok: false, message: "Link inválido ou expirado. Solicite um novo." };
  }

  try {
    const senhaHash = await hash(password, BCRYPT_COST);
    await db.$transaction([
      db.user.update({ where: { id: registro.userId }, data: { password: senhaHash } }),
      db.passwordResetToken.deleteMany({ where: { userId: registro.userId } }),
    ]);
  } catch {
    return { ok: false, message: "Não foi possível redefinir a senha. Tente novamente." };
  }

  return { ok: true, message: "Senha redefinida com sucesso" };
}
