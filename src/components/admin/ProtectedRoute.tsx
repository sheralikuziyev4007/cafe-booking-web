import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageLoader } from "@/components/ui/PageLoader";
import { useAuth } from "@/hooks/useAuth";

/** Lets only signed-in users through; everyone else is sent to /admin/login. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  // The saved session is still being checked: don't flash the login page at a signed-in owner
  if (status === "loading") return <PageLoader />;
  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
