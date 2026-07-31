import type { NextAuthConfig } from "next-auth";

// Kept free of Prisma-dependent providers so it can run in the Edge
// middleware runtime, which doesn't support the Prisma driver adapter.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPath = nextUrl.pathname.startsWith("/login");

      if (isLoggedIn && isPublicPath) {
        return Response.redirect(new URL("/", nextUrl));
      }
      if (!isLoggedIn && !isPublicPath) {
        return false;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.departmentId = user.departmentId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.departmentId = token.departmentId;
      return session;
    },
  },
};
