"use client";
import { useState, useTransition, useCallback, useMemo, useEffect } from "react";
import { signIn } from "next-auth/react";
import { X, User, Lock, Mail, Eye, EyeOff } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (mode === "signup" && (!name || !email || !username || !password)) {
      setError("All fields are required");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (mode === "signup" && !emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    startTransition(async () => {
      try {
        console.log('Attempting signup...', { name, username, email });
        const apiUrl = '/api/signup';
        
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, username, email, password }),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          const errorMessage = errorData.error || 'An unknown error occurred';
          console.error('Signup failed:', { status: res.status, error: errorMessage });
          throw new Error(errorMessage);
        }
        
        const data = await res.json();
        console.log('Signup response:', { status: res.status, data });
        setMode("login");
        setError(null); // Clear any previous errors
        // Show success message
        alert('Account created successfully! You can now log in.');
        
        // Clear form
        setName('');
        setUsername('');
        setEmail('');
        setPassword('');
        
      } catch (error) {
        console.error('Signup error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Network error';
        setError(`Signup failed: ${errorMessage}`);
      }
    });
  }, [mode, name, email, username, password]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }
    
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
          setError(null); // Clear any previous errors
          onClose();
        } else {
          const errorMsg = result?.error === 'CredentialsSignin' 
            ? 'Invalid username or password' 
            : result?.error || 'Login failed';
          setError(errorMsg);
        }
      } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Network error';
        setError(`Login failed: ${errorMessage}`);
      }
    });
  }, [username, password, onClose]);

  // Handle escape key press
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && allowClose) {
      onClose();
    }
  }, [allowClose, onClose]);

  // Add event listener for escape key
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Re-enable background scrolling when modal is closed
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Reset error when mode changes
  useEffect(() => {
    setError(null);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === "login" ? "signup" : "login");
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const modeButtonClass = useCallback((isActive: boolean) => {
    return `flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow"
        : "text-gray-300 hover:text-white"
    }`;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={allowClose ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md backdrop-blur-xl bg-black/90 border border-white/20 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button - only show if closing is allowed */}
        {allowClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-3 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10 z-10"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-gray-300">
              {mode === "login" ? "Log in to continue" : "Sign up to get started"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex mb-6 bg-white/10 rounded-xl p-1">
            <button
              onClick={toggleMode}
              className={modeButtonClass(mode === "login")}
              aria-pressed={mode === "login"}
            >
              Login
            </button>
            <button
              onClick={toggleMode}
              className={modeButtonClass(mode === "signup")}
              aria-pressed={mode === "signup"}
            >
              Sign Up
            </button>
          </div>

          <form
            className="grid gap-4"
            onSubmit={mode === "login" ? handleLogin : handleSignup}
          >
            {mode === "signup" && (
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required={mode === "signup"}
                    disabled={isPending}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={isPending}
                />
              </div>
            </div>
            
            {mode === "signup" && (
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required={mode === "signup"}
                    disabled={isPending}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl bg-white/10 border border-white/20 pl-10 pr-12 py-3 text-white placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  disabled={isPending}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-white" />
                  )}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Please wait...
                </span>
              ) : mode === "login" ? "Log in" : "Sign up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}