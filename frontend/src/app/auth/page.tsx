"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Eye, EyeOff, Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithEmail, registerWithEmail, loginWithGoogle } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "register") {
        setMode("register");
      }
    }
  }, []);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res =
        mode === "login"
          ? await loginWithEmail(form.email, form.password)
          : await registerWithEmail(form.name, form.email, form.password);

      localStorage.setItem("nexus_token", res.token);
      setUser({ id: res.user.id, name: res.user.name, email: res.user.email, role: res.user.role });
      toast.success(mode === "login" ? "Welcome back!" : "Account created!");
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse: any) {
    if (!credentialResponse.credential) {
      toast.error("Google login failed: No credential received");
      return;
    }
    
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      localStorage.setItem("nexus_token", res.token);
      setUser({ id: res.user.id, name: res.user.name, email: res.user.email, role: res.user.role });
      toast.success("Signed in with Google!");
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleGoogleError() {
    toast.error("Google sign-in was unsuccessful");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Fixed animated background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern background */}
        <div className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.05) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-100/20 blur-3xl animate-pulse animation-delay-2000" />
        
        {/* Interactive mouse-tracking gradient */}
        <div 
          className="absolute w-64 h-64 rounded-full bg-blue-300/15 blur-3xl transition-transform duration-300 ease-out pointer-events-none"
          style={{
            left: `${mousePosition.x - 128}px`,
            top: `${mousePosition.y - 128}px`,
            boxShadow: '0 0 60px rgba(59, 130, 246, 0.2)'
          }}
        />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg border border-blue-400 animate-float">
            <LogIn className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {mode === "login"
              ? "Sign in to your NexusEstate account"
              : "Join thousands of property seekers"}
          </p>
        </div>

        {/* Card with glass morphism */}
        <div className="rounded-3xl border border-blue-200/50 bg-white/70 backdrop-blur-xl p-8 shadow-xl relative before:absolute before:inset-0 before:pointer-events-none before:rounded-3xl before:bg-gradient-to-br before:from-blue-400/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
          {/* Mode toggle */}
          <div className="mb-6 flex rounded-2xl bg-slate-100/50 p-1 border border-blue-200/30">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all ${
                mode === "login"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all ${
                mode === "register"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Arjun Sharma"
                  className="w-full rounded-2xl border border-blue-200/50 bg-blue-50/30 px-4 py-3 text-slate-900 placeholder-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 backdrop-blur-sm"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-blue-200/50 bg-blue-50/30 px-4 py-3 text-slate-900 placeholder-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 backdrop-blur-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-blue-200/50 bg-blue-50/30 px-4 py-3 text-slate-900 placeholder-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 backdrop-blur-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 shadow-md hover:shadow-lg hover:shadow-blue-500/30"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-blue-200/30" />
            <span className="text-xs text-slate-500">or continue with</span>
            <div className="flex-1 border-t border-blue-200/30" />
          </div>

          {/* Google */}
          <div className="flex justify-center w-full">
            {googleLoading ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950">
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="pill"
                width="100%"
              />
            )}
          </div>

          <p className="mt-5 text-center text-xs text-slate-600">
            By continuing, you agree to NexusEstate&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}
