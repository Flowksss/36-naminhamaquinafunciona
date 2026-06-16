// Teste de integração do fluxo de auth contra o banco real.
// Não faz parte do app — roda manual via tsx. Limpa o que cria.
import { createHash, randomBytes } from "crypto";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { registerUser, requestPasswordReset, resetPassword } from "../src/lib/auth-actions";

const db = new PrismaClient();
const hashToken = (raw: string) => createHash("sha256").update(raw).digest("hex");
const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.append(k, v);
  return f;
};

const EMAIL = `smoke_${Date.now()}@teste.local`;
let pass = 0;
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) pass++; else process.exitCode = 1;
};

async function main() {
  // 1. cadastro cria org + user ADMIN (atômico)
  const orgsBefore = await db.organizacao.count();
  const r1 = await registerUser(fd({ organizacao: "Smoke Org", name: "Smoke", email: EMAIL, password: "senha12345", confirm: "senha12345" }));
  ok("registro retorna ok", r1.ok);
  const user = await db.user.findUnique({ where: { email: EMAIL } });
  ok("user criado como ADMIN", user?.role === "ADMIN");
  ok("org vinculada criada", !!user?.organizacaoId);
  ok("uma org a mais", (await db.organizacao.count()) === orgsBefore + 1);

  // 2. e-mail duplicado não cria org órfã
  const orgsNow = await db.organizacao.count();
  const r2 = await registerUser(fd({ organizacao: "Dup", name: "Dup", email: EMAIL, password: "senha12345", confirm: "senha12345" }));
  ok("registro duplicado rejeitado", !r2.ok && !!r2.errors?.email);
  ok("nenhuma org órfã criada", (await db.organizacao.count()) === orgsNow);

  // 3. senha fraca / divergente rejeitadas
  const r3 = await registerUser(fd({ organizacao: "X", name: "X", email: `x_${Date.now()}@t.local`, password: "123", confirm: "123" }));
  ok("senha curta rejeitada", !r3.ok && !!r3.errors?.password);

  // 4. forgot: resposta genérica + token criado (e-mail inexistente também é genérico)
  const fr = await requestPasswordReset({ ok: false }, fd({ email: EMAIL }));
  ok("forgot resposta genérica ok", fr.ok && !!fr.message);
  ok("token persistido (apenas hash)", (await db.passwordResetToken.count({ where: { userId: user!.id } })) === 1);
  const frUnknown = await requestPasswordReset({ ok: false }, fd({ email: "naoexiste@t.local" }));
  ok("e-mail inexistente também genérico", frUnknown.ok && frUnknown.message === fr.message);

  // 5. reset com token válido troca a senha e invalida o token (uso único)
  const raw = randomBytes(32).toString("hex");
  await db.passwordResetToken.deleteMany({ where: { userId: user!.id } });
  await db.passwordResetToken.create({ data: { userId: user!.id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + 3600_000) } });
  const rp = await resetPassword({ ok: false }, fd({ token: raw, password: "novasenha99", confirm: "novasenha99" }));
  ok("reset com token válido ok", rp.ok);
  const updated = await db.user.findUnique({ where: { email: EMAIL } });
  ok("senha nova confere (bcrypt)", await compare("novasenha99", updated!.password));
  ok("token consumido (single-use)", (await db.passwordResetToken.count({ where: { userId: user!.id } })) === 0);

  // 6. reutilizar o mesmo token falha
  const reuse = await resetPassword({ ok: false }, fd({ token: raw, password: "outrasenha11", confirm: "outrasenha11" }));
  ok("token reutilizado é rejeitado", !reuse.ok);

  // 7. token expirado falha
  const rawExp = randomBytes(32).toString("hex");
  await db.passwordResetToken.create({ data: { userId: user!.id, tokenHash: hashToken(rawExp), expiresAt: new Date(Date.now() - 1000) } });
  const exp = await resetPassword({ ok: false }, fd({ token: rawExp, password: "qualquer123", confirm: "qualquer123" }));
  ok("token expirado é rejeitado", !exp.ok);

  // cleanup
  await db.passwordResetToken.deleteMany({ where: { userId: user!.id } });
  await db.user.delete({ where: { email: EMAIL } });
  await db.organizacao.delete({ where: { id: user!.organizacaoId } });

  console.log(`\n${pass} checks passed`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => db.$disconnect());
