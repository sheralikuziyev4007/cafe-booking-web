import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Coffee, Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";

export function AdminLogin() {
  const { isAuthenticated, login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  // ProtectedRoute remembers the admin page that was requested; only /admin/* paths are accepted
  const from = (location.state as { from?: unknown } | null)?.from;
  const redirectTo = typeof from === "string" && from.startsWith("/admin") && !from.startsWith("/admin/login") ? from : "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (login(username, password)) {
      setError(false);
      navigate(redirectTo, { replace: true });
    } else {
      setError(true);
    }
  };

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

        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-8 rounded-md bg-espressoDark shadow-2xl">
          <Input
            tone="dark"
            label={t.admin.login}
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            tone="dark"
            label={t.admin.password}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p role="alert" className="text-xs text-clayLight font-body">
              {t.admin.wrongCredentials}
            </p>
          )}

          <Button type="submit" className="w-full focus-visible:ring-offset-espressoDark">
            {t.admin.signIn}
          </Button>

          <p className="text-xs text-center text-cream/60 font-body">{t.admin.demoAccess}</p>
        </form>

        <Link to="/" className="block w-full text-center text-xs mt-6 text-cream/70 hover:text-cream font-body">
          {t.admin.backToSite}
        </Link>
      </div>
    </div>
  );
}
