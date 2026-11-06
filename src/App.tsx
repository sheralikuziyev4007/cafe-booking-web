import { lazy, Suspense, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthProvider";
import { I18nProvider } from "@/context/I18nProvider";
import { ServicesProvider } from "@/context/ServicesProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import { Landing } from "@/components/landing/Landing";
import { NotFound } from "@/components/NotFound";
import { StorageSync } from "@/components/StorageSync";
import { PageLoader } from "@/components/ui/PageLoader";
import { createQueryClient } from "@/lib/queryClient";
import { createDefaultServices, type Services } from "@/services";
import type { Lang } from "@/types";

// The admin panel is loaded only when visited, so landing page visitors don't download it
const AdminLogin = lazy(() => import("@/components/admin/AdminLogin").then((m) => ({ default: m.AdminLogin })));
const ProtectedRoute = lazy(() => import("@/components/admin/ProtectedRoute").then((m) => ({ default: m.ProtectedRoute })));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminMenuPage = lazy(() => import("@/components/admin/AdminMenuPage").then((m) => ({ default: m.AdminMenuPage })));
const AdminBookingsPage = lazy(() => import("@/components/admin/AdminBookingsPage").then((m) => ({ default: m.AdminBookingsPage })));
const AdminMessagesPage = lazy(() => import("@/components/admin/AdminMessagesPage").then((m) => ({ default: m.AdminMessagesPage })));

interface AppProps {
  initialLang?: Lang;
  /** Data layer. By default: Supabase if configured, otherwise the demo storage (tests pass fakes) */
  services?: Services;
  queryClient?: QueryClient;
}

export default function App({ initialLang, services: servicesProp, queryClient: queryClientProp }: AppProps) {
  const [services] = useState(() => servicesProp ?? createDefaultServices());
  const [queryClient] = useState(() => queryClientProp ?? createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ServicesProvider services={services}>
        <ThemeProvider>
          <I18nProvider initialLang={initialLang}>
            <AuthProvider>
              {services.mode === "local" && <StorageSync />}
              <div className="min-h-screen bg-page font-body">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<ProtectedRoute />}>
                      <Route element={<AdminLayout />}>
                        <Route index element={<AdminMenuPage />} />
                        <Route path="bookings" element={<AdminBookingsPage />} />
                        <Route path="messages" element={<AdminMessagesPage />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </ServicesProvider>
    </QueryClientProvider>
  );
}
