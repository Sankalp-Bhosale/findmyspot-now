
// Global type declarations
import '@/types/supabase';
import '@/types/google-maps';

// Add additional window property declaration for Google Maps initialization callback
declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}
