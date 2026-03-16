import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Submit OTP
  const submitOtp = useCallback(
    async (code: string) => {
      if (!email || code.length !== OTP_LENGTH) return;
      setError("");
      setIsLoading(true);

      try {
        const result = await authClient.signIn.emailOtp({
          email: email.trim(),
          otp: code,
        });
        if (result.error) {
          setError("Invalid code. Try again.");
          setOtp(Array(OTP_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
        } else {
          navigate("/dashboard");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, navigate]
  );

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (error) setError("");

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    const fullCode = newOtp.join("");
    if (fullCode.length === OTP_LENGTH && !newOtp.includes("")) {
      submitOtp(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    // Focus the next empty slot, or last one
    const nextEmpty = newOtp.findIndex((d) => !d);
    const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();

    // Auto-submit
    const fullCode = newOtp.join("");
    if (fullCode.length === OTP_LENGTH && !newOtp.includes("")) {
      submitOtp(fullCode);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;
    setIsResending(true);
    setError("");

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: "sign-in",
      });
      if (result.error) {
        setError(result.error.message || "Failed to resend code");
      } else {
        setCountdown(RESEND_COOLDOWN);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg shadow-black/20"
        >
          {/* Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>

          <h2 className="mb-1 text-lg font-semibold text-foreground">
            Check your email
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>

          {/* OTP Inputs */}
          <div className="mb-4 flex justify-center gap-2" onPaste={handlePaste}>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <motion.input
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className="h-12 w-12 rounded-lg border border-border bg-secondary/50 text-center text-lg font-semibold text-foreground outline-none transition-all
                  focus:border-primary focus:ring-2 focus:ring-primary/30
                  disabled:cursor-not-allowed disabled:opacity-50
                  sm:h-14 sm:w-14 sm:text-xl"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-center text-sm text-destructive"
            >
              {error}
            </motion.p>
          ) : null}

          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Verifying...</span>
            </div>
          ) : null}

          {/* Resend */}
          <div className="mt-4 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in{" "}
                <span className="font-medium text-foreground">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
