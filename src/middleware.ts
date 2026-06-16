import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

// Protege tudo, exceto: páginas públicas de auth, rotas de auth, assets estáticos.
export const config = {
  matcher: ["/((?!login|register|forgot-password|reset-password|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
