"use client";

import { useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Loader2, Github, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signIn, signUp, signInWithGitHub, signInWithGoogle } = useSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp(email, password);
        if (result.user && !result.session) {
          // Email confirmation required
          setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
        } else {
          setSuccess("Đăng ký thành công!");
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      } else {
        await signIn(email, password);
        setSuccess("Đăng nhập thành công!");
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      // Better error messages
      const error = err as { message?: string };
      console.error("Login error:", error);
      
      // Show the actual error message from Supabase
      const errorMessage = error.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 sm:pt-32">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal - Positioned lower */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative z-50 w-full max-w-md"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {isSignUp ? "Đăng ký" : "Đăng nhập"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium mb-2 block">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium mb-2 block">
                  Mật khẩu
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-md bg-green-500/10 text-green-500 text-sm">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  isSignUp ? "Đăng ký" : "Đăng nhập"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Hoặc</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              {/* GitHub OAuth Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={async () => {
                  setError(null);
                  setLoading(true);
                  try {
                    await signInWithGitHub();
                    // OAuth will redirect, so we don't need to close modal here
                  } catch (err) {
                    const error = err as { message?: string };
                    setError(error.message || "Không thể đăng nhập với GitHub");
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <Github className="mr-2 h-4 w-4" />
                Đăng nhập với GitHub
              </Button>

              {/* Google OAuth Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={async () => {
                  setError(null);
                  setLoading(true);
                  try {
                    await signInWithGoogle();
                    // OAuth will redirect, so we don't need to close modal here
                  } catch (err) {
                    const error = err as { message?: string };
                    setError(error.message || "Không thể đăng nhập với Google");
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Đăng nhập với Gmail
              </Button>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {isSignUp
                  ? "Đã có tài khoản? Đăng nhập"
                  : "Chưa có tài khoản? Đăng ký"}
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

