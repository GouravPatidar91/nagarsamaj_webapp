import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import "./i18n";
import LanguageWelcomeDialog from "@/components/LanguageWelcomeDialog";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";

// Lazy load pages for performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const News = lazy(() => import("./pages/News"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Matrimony = lazy(() => import("./pages/Matrimony"));
const Directory = lazy(() => import("./pages/Directory"));
const Chat = lazy(() => import("./pages/Chat"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-background">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LanguageWelcomeDialog />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="/news/:id" element={<ProtectedRoute><NewsDetail /></ProtectedRoute>} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
              <Route path="/matrimony" element={<ProtectedRoute><Matrimony /></ProtectedRoute>} />
              <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;