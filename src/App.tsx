import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Diet from "./pages/Diet";
import Log from "./pages/Log";
import Workout from "./pages/Workout";
import Profile from "./pages/Profile";
import Shop from "./pages/Shop";
import AskAI from "./pages/AskAI";
import Settings from "./pages/Settings";
import StrictMode from "./pages/StrictMode";
import NotFound from "./pages/NotFound";
import OAuthConsent from "./pages/OAuthConsent";
import PersonalisationDebug from "./pages/PersonalisationDebug";
import FoodHistory from "./pages/FoodHistory";
import { RouteSeo } from "./components/RouteSeo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteSeo />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/log" element={<Log />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/ask-ai" element={<AskAI />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/strict-mode" element={<StrictMode />} />
          <Route path="/personalisation-debug" element={<PersonalisationDebug />} />
          <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
