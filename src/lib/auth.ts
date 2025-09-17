import NextAuth, { type DefaultSession, type NextAuthOptions } from "next-auth";
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

// Initialize providers array with only Credentials provider
const providers = [
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
  })
];

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  providers,
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
    async redirect({ url, baseUrl }) {
      // Handle OAuth callbacks properly
      if (url.startsWith("/dashboard")) return `${baseUrl}/dashboard`;
      if (url.startsWith("/auth")) return `${baseUrl}${url}`;
      
      // For OAuth callbacks, redirect to dashboard
      if (url.includes("callback")) return `${baseUrl}/dashboard`;
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Handle sign in errors
      if (account?.provider) {
        console.log(`User signed in with ${account.provider}`);
      }
    },
    async signOut() {
      // Clear any additional session data if needed
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
    signOut: "/",
  },
};

export default NextAuth(authOptions);
export { authOptions };