import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Providers
import { AuthProvider } from "@/context/AuthContext";
import { ParkingProvider } from "@/context/ParkingContext";

// Auth and Onboarding Pages
import SplashScreen from "@/components/SplashScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import AuthScreen from "@/components/AuthScreen";
import LoginPage from "@/components/LoginPage";
import SignupPage from "@/components/SignupPage";

// Main App Pages
import MapScreen from "@/components/MapScreen";
import ParkingDetails from "@/components/ParkingDetails";
import FloorSelection from "@/components/FloorSelection";
import BookingDetails from "@/components/BookingDetails";
import ConfirmationScreen from "@/components/ConfirmationScreen";
import ProfilePage from "@/components/ProfilePage";
import FeedbackPage from "@/components/FeedbackPage";
import ReservationsPage from "@/components/ReservationsPage";
import PaymentsPage from "@/components/PaymentsPage";

// Other Pages
import NotFound from "./pages/NotFound";
import BookingsPage from "./pages/BookingsPage";
import SettingsPage from "./pages/SettingsPage";

// Route Protection Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('parkitUser');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

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
              {/* Public Routes */}
              <Route path="/" element={<SplashScreen />} />
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected Routes */}
              <Route path="/home" element={<ProtectedRoute><MapScreen /></ProtectedRoute>} />
              <Route path="/parking-details" element={<ProtectedRoute><ParkingDetails /></ProtectedRoute>} />
              <Route path="/floor-selection" element={<ProtectedRoute><FloorSelection /></ProtectedRoute>} />
              <Route path="/booking-details" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
              <Route path="/confirmation" element={<ProtectedRoute><ConfirmationScreen /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
              <Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ParkingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
