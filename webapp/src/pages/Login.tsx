import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, ArrowRight, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Tab = "signin" | "signup";

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("signin");

  // Sign-in state
  const [siEmail, setSiEmail] = useState<string>("");
  const [siError, setSiError] = useState<string>("");
  const [siLoading, setSiLoading] = useState<boolean>(false);

  // Sign-up state
  const [suName, setSuName] = useState<string>("");
  const [suEmail, setSuEmail] = useState<string>("");
  const [suError, setSuError] = useState<string>("");
  const [suLoading, setSuLoading] = useState<boolean>(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siEmail.trim()) { setSiError("Please enter your email."); return; }
    setSiError(""); setSiLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({ email: siEmail.trim(), type: "sign-in" });
      if (result.error) { setSiError(result.error.message || "Failed to send code"); }
      else { navigate("/verify-otp", { state: { email: siEmail.trim() } }); }
    } catch { setSiError("Something went wrong. Please try again."); }
    finally { setSiLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suName.trim()) { setSuError("Please enter your name."); return; }
    if (!suEmail.trim()) { setSuError("Please enter your email."); return; }
    setSuError(""); setSuLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({ email: suEmail.trim(), type: "sign-in" });
      if (result.error) { setSuError(result.error.message || "Failed to send code"); }
      else { navigate("/verify-otp", { state: { email: suEmail.trim(), name: suName.trim(), isSignUp: true } }); }
    } catch { setSuError("Something went wrong. Please try again."); }
    finally { setSuLoading(false); }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
              <Package className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="font-syne text-3xl font-bold tracking-tight text-foreground">
            Get2u Errand
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Your errands, handled.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/5">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {(["signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 py-3.5 text-sm font-medium transition-colors",
                  tab === t
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {tab === "signin" ? (
                <motion.form
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignIn}
                  className="space-y-4"
                >
                  <div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Enter your email and we'll send a verification code.
                    </p>
                    <Label htmlFor="si-email" className="mb-1.5 block text-sm font-medium">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="si-email"
                        type="email"
                        placeholder="you@example.com"
                        value={siEmail}
                        onChange={(e) => { setSiEmail(e.target.value); if (siError) setSiError(""); }}
                        className="h-11 pl-10"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>
                  {siError ? <p className="text-sm text-destructive">{siError}</p> : null}
                  <Button type="submit" disabled={siLoading} className="h-11 w-full gap-2 font-medium">
                    {siLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Send Code</span><ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignUp}
                  className="space-y-4"
                >
                  <div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Create your account to start requesting errands.
                    </p>
                    <Label htmlFor="su-name" className="mb-1.5 block text-sm font-medium">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="su-name"
                        type="text"
                        placeholder="John Doe"
                        value={suName}
                        onChange={(e) => { setSuName(e.target.value); if (suError) setSuError(""); }}
                        className="h-11 pl-10"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="su-email" className="mb-1.5 block text-sm font-medium">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="su-email"
                        type="email"
                        placeholder="you@example.com"
                        value={suEmail}
                        onChange={(e) => { setSuEmail(e.target.value); if (suError) setSuError(""); }}
                        className="h-11 pl-10"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  {suError ? <p className="text-sm text-destructive">{suError}</p> : null}
                  <Button type="submit" disabled={suLoading} className="h-11 w-full gap-2 font-medium">
                    {suLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
