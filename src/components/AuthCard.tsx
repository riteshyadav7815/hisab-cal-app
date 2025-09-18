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
      try {
        console.log('Attempting signup with data:', { name, username, email: '[REDACTED]', password: '[REDACTED]' });
        
        // Log the full URL we're trying to fetch
        const url = `/api/signup`;
        console.log('Fetching URL:', url);
        
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, username, email, password }),
        });
        
        console.log('Signup response status:', res.status);
        console.log('Signup response headers:', [...res.headers.entries()]);
        
        if (res.ok) {
          console.log('Signup successful');
          const data = await res.json();
          console.log('Signup response data:', data);
          setMode("login");
        } else {
          const errorText = await res.text();
          console.log('Signup error response:', errorText);
          
          try {
            const data = JSON.parse(errorText);
            alert(`Signup failed: ${data.error || 'Unknown error'} (Status: ${res.status})`);
          } catch (parseError) {
            alert(`Signup failed: Server returned status ${res.status} with message: ${errorText}`);
          }
        }
      } catch (error) {
        console.error('Signup network error:', error);
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        
        if (error instanceof TypeError) {
          if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            // This is typically a CORS or network connectivity issue
            alert(`Signup failed: Network error - Unable to connect to server. This could be due to CORS restrictions or network connectivity issues. Please check your internet connection and try again.`);
            console.error('Possible CORS or network issue. Make sure the API endpoint is accessible and CORS is properly configured.');
          } else {
            alert(`Signup failed: ${error.message}`);
          }
        } else {
          alert(`Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}