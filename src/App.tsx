
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Providers
import { AuthProvider } from "@/context/AuthContext";
import { ParkingProvider } from "@/context/ParkingContext";

// Pages & Components
import SplashScreen from "@/components/SplashScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import AuthScreen from "@/components/AuthScreen";
import MapScreen from "@/components/MapScreen";
import ParkingDetails from "@/components/ParkingDetails";
import FloorSelection from "@/components/FloorSelection";
import BookingDetails from "@/components/BookingDetails";
import ConfirmationScreen from "@/components/ConfirmationScreen";
import NotFound from "./pages/NotFound";
import BookingsPage from "./pages/BookingsPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ParkingProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/home" element={<MapScreen />} />
              <Route path="/parking-details" element={<ParkingDetails />} />
              <Route path="/floor-selection" element={<FloorSelection />} />
              <Route path="/booking-details" element={<BookingDetails />} />
              <Route path="/confirmation" element={<ConfirmationScreen />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ParkingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
