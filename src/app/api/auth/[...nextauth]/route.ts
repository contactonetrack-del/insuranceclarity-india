import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";

export const dynamic = 'force-dynamic';

// Singleton cache — avoids rebuilding authOptions on every request
let _authOptions: NextAuthOptions | null = null;

export async function getAuthOptions(): Promise<NextAuthOptions> {
    if (_authOptions) return _authOptions;

    // Defer all server-only module evaluation to runtime via dynamic import.
    // This prevents Turbopack from evaluating Prisma/adapter during build.
    const [
        { PrismaAdapter },
        { prisma },
        { default: GoogleProvider },
        { default: EmailProvider },
    ] = await Promise.all([
        import("@auth/prisma-adapter"),
        import("@/lib/prisma"),
        import("next-auth/providers/google"),
        import("next-auth/providers/email"),
    ]);

    _authOptions = {
        adapter: PrismaAdapter(prisma),
        providers: [
            GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID || "",
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            }),
            EmailProvider({
                server: {
                    host: process.env.SMTP_HOST || "",
                    port: Number(process.env.SMTP_PORT) || 587,
                    auth: {
                        user: process.env.SMTP_USER || "",
                        pass: process.env.SMTP_PASSWORD || "",
                    },
                },
                from: process.env.SMTP_FROM || "no-reply@insuranceclarity.in",
            }),
        ],
        session: { strategy: "jwt" },
        callbacks: {
            async session({ session, token }) {
                if (session.user && token.sub) {
                    (session.user as { id?: string }).id = token.sub;
                }
                return session;
            },
        },
        secret: process.env.NEXTAUTH_SECRET,
        pages: { signIn: "/auth/signin" },
    };

    return _authOptions;
}

// Next.js App Router requires the second argument context.params to match
// the exact route segment type. For [...nextauth], it is Promise<{ nextauth: string[] }>.
type NextAuthContext = { params: Promise<{ nextauth: string[] }> };

export async function GET(req: Request, ctx: NextAuthContext) {
    const opts = await getAuthOptions();
    return NextAuth(opts)(req, ctx as Parameters<ReturnType<typeof NextAuth>>[1]);
}

export async function POST(req: Request, ctx: NextAuthContext) {
    const opts = await getAuthOptions();
    return NextAuth(opts)(req, ctx as Parameters<ReturnType<typeof NextAuth>>[1]);
}
