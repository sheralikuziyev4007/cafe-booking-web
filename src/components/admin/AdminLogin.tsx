import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Coffee, Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/PageLoader";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { loginSchema, type LoginFormData } from "@/schemas/login";
import { codeOf } from "@/schemas/zodErrors";
import { errorMessage } from "@/utils/formatters";
import type { LoginResult } from "@/services";

export function AdminLogin() {
  const { status, identifierType, login } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  // ProtectedRoute remembers the admin page that was requested; only /admin/* paths are accepted
  const from = (location.state as { from?: unknown } | null)?.from;
  const redirectTo = typeof from === "string" && from.startsWith("/admin") && !from.startsWith("/admin/login") ? from : "/admin";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema), defaultValues: { identifier: "", password: "" } });
  const [failure, setFailure] = useState<Exclude<LoginResult, "ok"> | null>(null);

  if (status === "loading") return <PageLoader />;
  if (status === "authenticated") return <Navigate to={redirectTo} replace />;

  const isEmail = identifierType === "email";
  const failureText = {
    invalid: isEmail ? t.admin.wrongEmailCredentials : t.admin.wrongCredentials,
    forbidden: t.admin.noAccess,
    error: t.states.serverError,
  };

  const onSubmit = handleSubmit(async ({ identifier, password }) => {
    setFailure(null);
    const result = await login(identifier, password);
    // On success the status becomes "authenticated" and the redirect above takes over
    if (result !== "ok") setFailure(result);
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-espresso">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <LanguageSwitcher />
        </div>
        <div className="flex items-center gap-2 mb-8 justify-center text-cream">
          <Lock size={20} className="text-brass" aria-hidden="true" />
          <h1 className="text-xl italic font-display">
            <Coffee size={18} className="inline mr-1 -mt-1" aria-hidden="true" />
            {t.admin.loginTitle}
          </h1>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-4 p-8 rounded-md bg-espressoDark shadow-2xl">
          <Input
            tone="dark"
            label={isEmail ? t.admin.email : t.admin.login}
            type={isEmail ? "email" : "text"}
            autoComplete={isEmail ? "email" : "username"}
            {...register("identifier")}
            error={errorMessage(t, codeOf(errors.identifier))}
          />
          <Input
            tone="dark"
            label={t.admin.password}
            type="password"
            autoComplete="current-password"
            {...register("password")}
            error={errorMessage(t, codeOf(errors.password))}
          />

          {failure && (
            <p role="alert" className="text-xs text-clayLight font-body">
              {failureText[failure]}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full focus-visible:ring-offset-espressoDark">
            {isSubmitting ? t.states.signingIn : t.admin.signIn}
          </Button>

          {!isEmail && <p className="text-xs text-center text-cream/60 font-body">{t.admin.demoAccess}</p>}
        </form>

        <Link to="/" className="block w-full text-center text-xs mt-6 text-cream/70 hover:text-cream font-body">
          {t.admin.backToSite}
        </Link>
      </div>
    </div>
  );
}
