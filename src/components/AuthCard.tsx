"use client";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For signup

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });
      if (res.ok) {
        setMode("login");
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await signIn("credentials", { username, password });
    });
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4">
      {/* Back to Home Button */}
      <motion.button
        onClick={() => router.push('/')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Home</span>
      </motion.button>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ rotateY: 0, opacity: 1, scale: 1 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          exit={{ rotateY: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0 }}
          className="w-full max-w-md backdrop-blur-xl bg-black/80 border border-gray-600 rounded-3xl shadow-[0_0_80px_rgba(123,47,247,0.25)]"
        >
          <div className="p-8">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-gray-300">
              {mode === "login" ? "Log in to continue" : "Sign up to get started"}
            </p>

            <form
              className="mt-6 grid gap-4"
              onSubmit={mode === "login" ? handleLogin : handleSignup}
            >
              {mode === "signup" && (
                <div>
                  <label className="text-sm text-gray-300">Name</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-[#7b2ff7] focus:ring-1 focus:ring-[#7b2ff7]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              )}
              <div>
                <label className="text-sm text-gray-300">Username</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-[#7b2ff7] focus:ring-1 focus:ring-[#7b2ff7]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  required
                />
              </div>
              {mode === "signup" && (
                <div>
                  <label className="text-sm text-gray-300">Email</label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-[#7b2ff7] focus:ring-1 focus:ring-[#7b2ff7]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              )}
              <div>
                <label className="text-sm text-gray-300">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl bg-gray-800 border border-gray-600 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-[#7b2ff7] focus:ring-1 focus:ring-[#7b2ff7]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#00f5d4] px-4 py-3 font-medium text-white shadow-md hover:shadow-[0_0_32px_rgba(0,245,212,0.35)] transition shadow-[#00f5d4]/20"
              >
                {isPending ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() =>
                  startTransition(() =>
                    setMode(mode === "login" ? "signup" : "login")
                  )
                }
                className="text-sm text-gray-300 hover:text-white underline decoration-dotted underline-offset-4"
                disabled={isPending}
              >
                {mode === "login"
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Log In"}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <button
                    onClick={() => signIn("google")}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-xl shadow-sm bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700"
                  >
                    Google
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => signIn("facebook")}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-xl shadow-sm bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700"
                  >
                    Facebook
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}