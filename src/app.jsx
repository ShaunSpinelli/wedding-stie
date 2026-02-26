/**
 * Copyright (c) 2024-present mrofisr
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// src/App.jsx
import { useState, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Heart, Settings } from "lucide-react";
import { useInvitation } from "@/features/invitation";
import { useLanguage } from "@/lib/language-context";
import { LanguageToggle } from "@/components/ui/language-toggle";
// import { useAudio } from "@/hooks/use-audio";
import { getAdminSecret } from "@/services/api";
import staticConfig from "@/config/config";

// Lazy load components for better performance
const Layout = lazy(() => import("@/components/layout/layout"));
const MainContent = lazy(
  () => import("@/features/invitation/components/main-content"),
);
const LandingPage = lazy(
  () => import("@/features/invitation/components/landing-page"),
);
const AdminDashboard = lazy(
  () => import("@/features/admin/components/admin-dashboard"),
);
const AdminLogin = lazy(
  () => import("@/features/admin/components/admin-login"),
);

/**
 * App component serves as the root of the application.
 */
function App() {
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] =
    useState(!!getAdminSecret());
  const { config, isLoading, error } = useInvitation();
  const { t } = useLanguage();
  const location = useLocation();

  const isAdminPath = location.pathname === "/admin";

  // Use config from API if available, otherwise fall back to static config
  const activeConfig = config || staticConfig.data;

  // Handle opening the invitation - this is called from a user click
  const handleOpenInvitation = async () => {
    setIsInvitationOpen(true);
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  // Show loading state
  if (isLoading && !isAdminPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-support-3">
        <div className="text-center">
          <Heart
            className="h-12 w-12 text-theme-main-2 mx-auto mb-4 animate-pulse"
            fill="currentColor"
          />
          <p className="text-theme-accent">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !isAdminPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-support-3">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-theme-main-3 text-6xl mb-4">!</div>
          <h1 className="text-2xl font-serif text-theme-accent mb-2">
            {t("error_not_found")}
          </h1>
          <p className="text-theme-accent/70 mb-4">{error}</p>
          <p className="text-sm text-theme-accent/50">{t("error_check_url")}</p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <LanguageToggle />

      {/* Admin Toggle Button */}
      {location.pathname !== "/admin" && (
        <Link
          to="/admin"
          className="fixed top-4 right-4 z-[100] flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-theme-support-1/30 shadow-lg text-theme-accent hover:bg-theme-main-1/50 transition-all text-xs font-bold"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{isAdminAuthenticated ? "DASHBOARD" : "ADMIN"}</span>
        </Link>
      )}

      <Helmet>
        {/* Primary Meta Tags */}
        <title>{t("wedding.title")}</title>
        <meta name="title" content={t("wedding.title")} />
        <meta name="description" content={t("wedding.description")} />
        {/* Prevent Wayback Machine and Web Archiving */}
        <meta name="robots" content="noindex, nofollow, noarchive, nocache" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
        <meta name="bingbot" content="noindex, nofollow, noarchive" />
        <meta name="archive" content="no" />
        <meta
          name="cache-control"
          content="no-cache, no-store, must-revalidate"
        />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={t("wedding.title")} />
        <meta property="og:description" content={t("wedding.description")} />
        <meta property="og:image" content={activeConfig.ogImage} />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={t("wedding.title")} />
        <meta
          property="twitter:description"
          content={t("wedding.description")}
        />
        <meta property="twitter:image" content={activeConfig.ogImage} />
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href={activeConfig.favicon} />
        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#FDA4AF" /> {/* Rose-300 color */}
      </Helmet>

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-theme-support-3">
            <div className="text-center">
              <Heart
                className="h-12 w-12 text-theme-main-2 mx-auto mb-4 animate-pulse"
                fill="currentColor"
              />
              <p className="text-theme-accent">{t("loading")}</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route
            path="/admin"
            element={
              isAdminAuthenticated ? (
                <AdminDashboard />
              ) : (
                <AdminLogin onLoginSuccess={handleAdminLogin} />
              )
            }
          />
          <Route
            path="/*"
            element={
              <AnimatePresence mode="wait">
                {!isInvitationOpen ? (
                  <LandingPage onOpenInvitation={handleOpenInvitation} />
                ) : (
                  <Layout>
                    <MainContent />
                  </Layout>
                )}
              </AnimatePresence>
            }
          />
        </Routes>
      </Suspense>
    </HelmetProvider>
  );
}

export default App;
