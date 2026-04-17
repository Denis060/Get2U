import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    <div className="flex min-h-[100dvh] flex-col bg-background sm:bg-secondary/30">
      {/* Top gradient hero */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-orange-500 to-amber-400 pb-16 pt-16 sm:pb-32 sm:pt-24"
        style={{ minHeight: "38vh" }}>
        {/* Decorative circles */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -left-8 top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-1/3 h-20 w-20 rounded-full bg-white/10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col items-center gap-3"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-xl backdrop-blur-sm">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="font-bricolage text-3xl font-bold text-white drop-shadow">
              Get2u Errand
            </h1>
            <p className="mt-1 text-sm text-orange-100/90">Your errands, handled.</p>
          </div>
        </motion.div>
      </div>

      {/* Bottom sheet / Card form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="flex flex-1 sm:flex-none flex-col w-full sm:max-w-md sm:mx-auto rounded-t-3xl sm:rounded-3xl bg-background px-5 sm:px-8 pt-6 sm:pb-8 shadow-2xl -mt-6 sm:-mt-24 relative z-10 sm:border sm:border-border/50 sm:mb-12"
      >
        {/* Tab switcher */}
        <div className="mb-6 flex rounded-2xl bg-secondary p-1">
          {(["signin", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all",
                tab === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {t === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "signin" ? (
            <motion.form
              key="signin"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSignIn}
              className="space-y-4"
            >
              <div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Enter your email and we'll send a verification code.
                </p>
                <Label htmlFor="si-email" className="mb-2 block text-sm font-semibold">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="si-email"
                    type="email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder="you@example.com"
                    value={siEmail}
                    onChange={(e) => { setSiEmail(e.target.value); if (siError) setSiError(""); }}
                    className="h-12 rounded-xl pl-12"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>
              {siError ? <p className="text-sm text-destructive">{siError}</p> : null}
              <Button type="submit" disabled={siLoading} className="h-12 w-full rounded-xl text-base font-semibold gap-2">
                {siLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Send Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSignUp}
              className="space-y-4"
            >
              <div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create your account to start requesting errands.
                </p>
                <Label htmlFor="su-name" className="mb-2 block text-sm font-semibold">Full name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="su-name"
                    type="text"
                    inputMode="text"
                    autoCapitalize="words"
                    autoCorrect="off"
                    placeholder="John Kamara"
                    value={suName}
                    onChange={(e) => { setSuName(e.target.value); if (suError) setSuError(""); }}
                    className="h-12 rounded-xl pl-12"
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="su-email" className="mb-2 block text-sm font-semibold">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="su-email"
                    type="email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder="you@example.com"
                    value={suEmail}
                    onChange={(e) => { setSuEmail(e.target.value); if (suError) setSuError(""); }}
                    className="h-12 rounded-xl pl-12"
                    autoComplete="email"
                  />
                </div>
              </div>
              {suError ? <p className="text-sm text-destructive">{suError}</p> : null}
              <Button type="submit" disabled={suLoading} className="h-12 w-full rounded-xl text-base font-semibold gap-2">
                {suLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to our <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  );
}
