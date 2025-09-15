"use client";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  allowClose?: boolean; // New prop to control if modal can be closed
}

export default function LoginModal({ isOpen, onClose, allowClose = true }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For signup

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        console.log('Attempting signup...', { name, username, email });
        const apiUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000/api/signup'
          : '/api/signup';
        
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, username, email, password }),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Signup failed:', { status: res.status, error: errorText });
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        
        const data = await res.json();
        console.log('Signup response:', { status: res.status, data });
        setMode("login");
        alert('Account created successfully! You can now log in.');
        
        // Clear form
        setName('');
        setUsername('');
        setEmail('');
        setPassword('');
        
      } catch (error) {
        console.error('Signup error:', error);
        alert(`Signup failed: ${error instanceof Error ? error.message : 'Network error'}`);
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        console.log('Attempting login...', { username });
        const result = await signIn("credentials", { 
          username, 
          password, 
          redirect: false 
        });
        console.log('Login result:', result);
        if (result?.ok) {
          // Clear form on successful login
          setUsername('');
          setPassword('');
          onClose();
        } else {
          const errorMsg = result?.error === 'CredentialsSignin' 
            ? 'Invalid username or password' 
            : result?.error || 'Login failed';
          alert(`Login failed: ${errorMsg}`);
        }
      } catch (error) {
        console.error('Login error:', error);
        alert(`Login failed: ${error instanceof Error ? error.message : 'Network error'}`);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={allowClose ? onClose : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md backdrop-blur-xl bg-black/90 border border-white/20 rounded-3xl shadow-2xl"
        >
          {/* Close Button - only show if closing is allowed */}
          {allowClose && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-3 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          )}

          <div className="p-10">
            <motion.h1 
              key={mode}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-3xl font-semibold tracking-tight text-white"
            >
              {mode === "login" ? "Welcome back" : "Create your account"}
            </motion.h1>
            <p className="mt-1 text-sm text-gray-300">
              {mode === "login" ? "Log in to continue" : "Sign up to get started"}
            </p>

            <form
              className="mt-6 grid gap-4"
              onSubmit={mode === "login" ? handleLogin : handleSignup}
            >
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm text-gray-300">Name</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </motion.div>
              )}
              <div>
                <label className="text-sm text-gray-300">Username</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  required
                />
              </div>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm text-gray-300">Email</label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </motion.div>
              )}
              <div>
                <label className="text-sm text-gray-300">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <motion.button
                type="submit"
                disabled={isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50"
              >
                {isPending ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() =>
                  startTransition(() =>
                    setMode(mode === "login" ? "signup" : "login")
                  )
                }
                className="text-sm text-gray-300 hover:text-white underline decoration-dotted underline-offset-4 transition-colors"
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
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => signIn("google", { redirect: false })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 px-4 border border-white/20 rounded-xl bg-white/10 text-sm font-medium text-gray-300 hover:bg-white/20 transition-all"
                >
                  Google
                </motion.button>
                <motion.button
                  onClick={() => signIn("facebook", { redirect: false })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 px-4 border border-white/20 rounded-xl bg-white/10 text-sm font-medium text-gray-300 hover:bg-white/20 transition-all"
                >
                  Facebook
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}