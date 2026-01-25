import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { OtpInput } from "@/components/OtpInput";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
});

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;
type ResetValues = z.infer<typeof resetSchema>;

type AuthMode = "login" | "forgot" | "otp" | "reset";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const verifyOtp = useCallback(
    async (token: string) => {
      if (!forgotEmail || token.length !== 6) return;
      setIsSubmitting(true);
      setOtpError(false);
      try {
        const { error } = await supabase.auth.verifyOtp({
          email: forgotEmail,
          token,
          type: "recovery",
        });
        if (error) throw error;
        toast.success("Code verified", {
          description: "Enter your new password below.",
        });
        setMode("reset");
        setOtp("");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Invalid or expired code";
        toast.error("Verification failed", { description: message });
        setOtpError(true);
        setOtp("");
      } finally {
        setIsSubmitting(false);
      }
    },
    [forgotEmail]
  );

  const onLogin = async (data: LoginValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      toast.success("Signed in successfully");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      toast.error("Sign in failed", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onForgot = async (data: ForgotValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email);
      if (error) throw error;
      toast.success("Check your email", {
        description: "We sent a 6-digit code. Enter it below.",
      });
      setForgotEmail(data.email);
      setOtp("");
      setOtpError(false);
      setMode("otp");
      forgotForm.reset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send code";
      toast.error("Failed to send code", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onReset = async (data: ResetValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
      toast.success("Password updated", {
        description: "You can now sign in with your new password.",
      });
      setMode("login");
      resetForm.reset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password";
      toast.error("Failed to update password", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="relative min-h-[calc(100vh-80px)] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 sharp-clip" />
          <div className="absolute bottom-20 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-accent/10 rotate-45 opacity-50" />
        </div>
        <Card className="w-full max-w-md relative z-10 border-border bg-card/95 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-primary">
              {mode === "login" && "Sign in"}
              {mode === "forgot" && "Forgot password"}
              {mode === "otp" && "Enter verification code"}
              {mode === "reset" && "Set new password"}
            </CardTitle>
            <CardDescription>
              {mode === "login" && "Sign in to your Hack@Davidson account."}
              {mode === "forgot" && "Enter your email and we'll send you a 6-digit code."}
              {mode === "otp" && `Enter the 6-digit code we sent to ${forgotEmail || "your email"}.`}
              {mode === "reset" && "Enter your new password below."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "login" && (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@davidson.edu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </button>
                </form>
              </Form>
            )}

            {mode === "forgot" && (
              <Form {...forgotForm}>
                <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-4">
                  <FormField
                    control={forgotForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@davidson.edu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send 6-digit code"
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Back to sign in
                  </button>
                </form>
              </Form>
            )}

            {mode === "otp" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <OtpInput
                    value={otp}
                    onChange={(v) => {
                      setOtp(v);
                      if (otpError) setOtpError(false);
                    }}
                    length={6}
                    disabled={isSubmitting}
                    error={otpError}
                    onComplete={verifyOtp}
                  />
                  {otpError && (
                    <p className="text-sm font-medium text-destructive">Invalid or expired code. Try again.</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMode("forgot");
                    setOtp("");
                    setOtpError(false);
                  }}
                  disabled={isSubmitting}
                >
                  Use a different email
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setOtp("");
                    setOtpError(false);
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            )}

            {mode === "reset" && (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save new password"
                    )}
                  </Button>
                </form>
              </Form>
            )}

            <p className="text-center text-sm text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">
                ← Back to home
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
