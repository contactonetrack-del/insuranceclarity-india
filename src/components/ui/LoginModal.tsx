"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import { LogIn, Mail, X, Loader2, ShieldCheck, MailQuestion } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

async function getCsrfToken(): Promise<string | null> {
    const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    try {
        const res = await fetch('/api/csrf');
        if (!res.ok) return null;
        const data = await res.json() as { csrfToken?: string };
        return data.csrfToken ?? null;
    } catch {
        return null;
    }
}

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [mounted, setMounted] = useState(false);

    // ensure document exists before trying to portal (avoids SSR mismatch)
    useEffect(() => {
        setMounted(true);
    }, []);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpPending, setOtpPending] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSendOtp(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const csrfToken = await getCsrfToken();
            if (!csrfToken) throw new Error('Security token missing. Please refresh and try again.');

            const res = await fetch("/api/auth/otp/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'x-csrf-token': csrfToken,
                },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to send OTP");

            setOtpPending(true);
            setStatus("idle");
        } catch (error: unknown) {
            setStatus("error");
            if (error instanceof Error) {
                setErrorMessage(error.message || "Failed to send OTP");
            } else {
                setErrorMessage("Failed to send OTP");
            }
        }
    }

    async function handleVerifyOtp(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const result = await signIn("email-otp", {
                email,
                otp,
                redirect: false,
                callbackUrl: "/dashboard",
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            // On success, forcefully redirect since we used redirect: false
            window.location.href = result?.url || "/dashboard";
        } catch (error: unknown) {
            setStatus("error");
            if (error instanceof Error) {
                setErrorMessage(error.message || "Invalid OTP code");
            } else {
                setErrorMessage("Invalid OTP code");
            }
        }
    }

    // early return on server / before mounted
    if (!mounted) return null;

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/75 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 40 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl ring-1 ring-accent/30 overflow-hidden shadow-2xl"
                    >
                        {/* Header / Brand */}
                        <div className="relative bg-gradient-to-br from-accent to-accent-dark p-8 pb-4 text-white">
                            <div className="absolute inset-0 opacity-20 blur-xl" />
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-7 h-7 text-white" />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-theme-muted"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <h2 className="text-3xl font-display font-bold">
                                Welcome <span className="text-gradient">Back</span>
                            </h2>
                            <p className="mt-2 text-sm">
                                Unlock premium tools, save quotes, and track your insurance advisor history.
                            </p>
                        </div>

                        <div className="p-8 pt-4 space-y-6">
                            {status === "success" ? (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MailQuestion className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-theme-primary">Check your email</h3>
                                    <p className="text-theme-secondary text-sm mt-2 leading-relaxed">
                                        We've sent a secure magic link to <strong>{email}</strong>.
                                        Click the link to sign in instantly.
                                    </p>
                                    <button
                                        onClick={() => setStatus("idle")}
                                        className="mt-6 text-accent font-medium hover:underline text-sm"
                                    >
                                        Use a different email
                                    </button>
                                </motion.div>
                            ) : (
                                <>
                                    {/* OAuth Buttons */}
                                    <button
                                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                                        className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 
                               font-semibold py-3 rounded-xl hover:bg-slate-100 transition-all 
                               shadow-md active:scale-[0.98]"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        Continue with Google
                                    </button>

                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-[#0f172a] px-2 text-theme-muted">Or email OTP</span>
                                        </div>
                                    </div>

                                    {/* Email / OTP Form */}
                                    <form onSubmit={otpPending ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="login-email" className="text-sm font-medium text-theme-secondary ml-1">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                                                <input
                                                    id="login-email"
                                                    type="email"
                                                    required
                                                    disabled={otpPending}
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="name@example.com"
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 
                                     text-sm outline-none focus:border-accent transition-all disabled:opacity-50"
                                                />
                                            </div>
                                        </div>

                                        {otpPending && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="space-y-2 overflow-hidden"
                                            >
                                                <div className="flex justify-between items-center ml-1">
                                                    <label htmlFor="login-otp" className="text-sm font-medium text-theme-secondary">
                                                        6-Digit Code
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setOtpPending(false); setOtp(""); setErrorMessage(""); }}
                                                        className="text-xs text-accent hover:underline"
                                                    >
                                                        Change email
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        id="login-otp"
                                                        type="text"
                                                        required
                                                        maxLength={6}
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        placeholder="123456"
                                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 
                                         text-center tracking-widest text-lg outline-none focus:border-accent transition-all"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        {status === "error" && (
                                            <p className="text-xs text-rose-500 font-medium ml-1">
                                                {errorMessage}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={status === "loading"}
                                            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 
                                 rounded-xl transition-all shadow-lg active:scale-[0.98]
                                 flex items-center justify-center gap-2 group disabled:opacity-70"
                                        >
                                            {status === "loading" ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    {otpPending ? "Verify & Sign In" : "Send Login Code"}
                                                    <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}

                            <p className="text-[10px] text-theme-muted text-center leading-relaxed">
                                By signing in, you agree to our Terms of Service and Privacy Policy.
                                We never share your data with insurance agents without your consent.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modal, document.body);
}
