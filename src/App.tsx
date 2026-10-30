import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { MenuProvider } from "@/context/MenuProvider";
import { InboxProvider } from "@/context/InboxProvider";
import { I18nProvider } from "@/context/I18nProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import { Landing } from "@/components/landing/Landing";
import { NotFound } from "@/components/NotFound";
import type { Lang } from "@/types";

// The admin panel is loaded only when visited, so landing page visitors don't download it
const AdminLogin = lazy(() => import("@/components/admin/AdminLogin").then((m) => ({ default: m.AdminLogin })));
const ProtectedRoute = lazy(() => import("@/components/admin/ProtectedRoute").then((m) => ({ default: m.ProtectedRoute })));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminMenuPage = lazy(() => import("@/components/admin/AdminMenuPage").then((m) => ({ default: m.AdminMenuPage })));
const AdminBookingsPage = lazy(() => import("@/components/admin/AdminBookingsPage").then((m) => ({ default: m.AdminBookingsPage })));
const AdminMessagesPage = lazy(() => import("@/components/admin/AdminMessagesPage").then((m) => ({ default: m.AdminMessagesPage })));

function PageLoader() {
  return <div className="min-h-screen bg-page" aria-busy="true" />;
}

export default function App({ initialLang }: { initialLang?: Lang }) {
  return (
    <ThemeProvider>
      <I18nProvider initialLang={initialLang}>
        <AuthProvider>
          <MenuProvider>
            <InboxProvider>
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
            </InboxProvider>
          </MenuProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
