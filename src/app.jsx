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
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useInvitation } from "@/features/invitation";
import staticConfig from "@/config/config";

// Lazy load components for better performance
const Layout = lazy(() => import("@/components/layout/layout"));
const MainContent = lazy(
  () => import("@/features/invitation/components/main-content"),
);
const LandingPage = lazy(
  () => import("@/features/invitation/components/landing-page"),
);

/**
 * App component serves as the root of the application.
 *
 * It manages the state to determine whether the invitation content should be shown.
 * Initially, the invitation is closed and the LandingPage component is rendered.
 * Once triggered, the Layout component containing MainContent is displayed.
 *
 * This component also uses HelmetProvider and Helmet to set up various meta tags:
 *   - Primary meta tags: title and description.
 *   - Open Graph tags for Facebook.
 *   - Twitter meta tags for summary and large image preview.
 *   - Favicon link and additional meta tags for responsive design and theme color.
 *
 * @component
 * @example
 * // Renders the App component
 * <App />
 */
function App() {
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const { config, isLoading, error } = useInvitation();

  // Use config from API if available, otherwise fall back to static config
  const activeConfig = config || staticConfig.data;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat undangan...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-rose-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-serif text-gray-800 mb-2">
            Undangan Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Silakan periksa URL Anda atau hubungi penyelenggara.
          </p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{activeConfig.title}</title>
        <meta name="title" content={activeConfig.title} />
        <meta name="description" content={activeConfig.description} />
        {/* Prevent Wayback Machine and Web Archiving */}
        <meta name="robots" content="noindex, nofollow, noarchive, nocache" />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
        <meta name="bingbot" content="noindex, nofollow, noarchive" />
        <meta name="archive" content="no" />
        <meta
          name="cache-control"
          content="no-cache, no-store, must-revalidate"
        />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={activeConfig.title} />
        <meta property="og:description" content={activeConfig.description} />
        <meta property="og:image" content={activeConfig.ogImage} />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={activeConfig.title} />
        <meta
          property="twitter:description"
          content={activeConfig.description}
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
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat...</p>
            </div>
          </div>
        }
      >
        <AnimatePresence mode="wait">
          {!isInvitationOpen ? (
            <LandingPage onOpenInvitation={() => setIsInvitationOpen(true)} />
          ) : (
            <Layout>
              <MainContent />
            </Layout>
          )}
        </AnimatePresence>
      </Suspense>
    </HelmetProvider>
  );
}

export default App;
