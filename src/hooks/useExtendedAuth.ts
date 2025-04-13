
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export const useExtendedAuth = () => {
  const auth = useAuth();
  const [extendedUser, setExtendedUser] = useState<User | null>(null);
  
  useEffect(() => {
    if (auth.user) {
      // Get the profile data from Supabase
      const getProfileData = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, phone')
          .eq('id', auth.user.id)
          .single();
          
        if (data && !error) {
          // Extend the user object with profile data
          const userWithProfile = {
            ...auth.user,
            name: data.name || auth.user.email?.split('@')[0] || 'User',
            phone: data.phone || '',
            profilePicture: undefined
          } as User;
          
          setExtendedUser(userWithProfile);
        } else {
          // If there's no profile, still provide a default name based on email
          const userWithDefaults = {
            ...auth.user,
            name: auth.user.email?.split('@')[0] || 'User',
            phone: '',
            profilePicture: undefined
          } as User;
          
          setExtendedUser(userWithDefaults);
        }
      };
      
      getProfileData();
    } else {
      setExtendedUser(null);
    }
  }, [auth.user]);
  
  return { 
    ...auth, 
    user: extendedUser || auth.user as User,
    updateProfile: async (userData: Partial<{ name: string; email: string; phone: string }>) => {
      if (!auth.user) return;
      
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', auth.user.id);
      
      if (error) throw error;
      
      // Update the local user state with the new data
      if (extendedUser) {
        setExtendedUser({
          ...extendedUser,
          ...userData
        });
      }
    }
  };
};
