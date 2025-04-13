
import { User as SupabaseUser } from '@supabase/supabase-js';

declare global {
  interface User extends SupabaseUser {
    name?: string;
    profilePicture?: string;
    phone?: string;
  }
}
