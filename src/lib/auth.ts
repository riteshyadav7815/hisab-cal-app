import NextAuth, { type DefaultSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db-optimized";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userNumber?: number | null;
    } & DefaultSession["user"];
  }
}

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('Auth attempt for:', credentials?.username);
        if (!credentials?.username || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }
        // Allow username OR email in the same field by checking both
        try {
          const users: any[] = await prisma.$queryRaw`
            SELECT id, email, name, image, "userNumber", password 
            FROM users 
            WHERE username = ${credentials.username} OR email = ${credentials.username}
          `;
          
          const user = users[0];
          console.log('User found:', user ? 'Yes' : 'No');
          if (!user || !user.password) {
            console.log('User not found or no password');
            return null;
          }
          const ok = await bcrypt.compare(credentials.password, user.password);
          console.log('Password match:', ok);
          if (!ok) return null;
          console.log('Login successful for:', user.email);
          return { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            image: user.image,
            userNumber: user.userNumber
          };
        } catch (error) {
          console.error('Database query error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userNumber = (user as any).userNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
        session.user.userNumber = token.userNumber as number | undefined;
      }
      return session;
    },
  },
  events: {
    async signOut() {
      // Clear any additional session data if needed
    },
  },
  pages: {
    signIn: "/", // Don't redirect to separate sign-in page
    error: "/", // Redirect to home page on auth errors
    signOut: "/", // Redirect to home page after sign out
  },
};

export default NextAuth(authOptions);
export { authOptions };