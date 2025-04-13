
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
          setExtendedUser({
            ...auth.user,
            name: data.name || auth.user.email?.split('@')[0] || 'User',
            phone: data.phone || '',
            // You could add a placeholder image here if you need profilePicture
            profilePicture: undefined
          });
        } else {
          // If there's no profile, still provide a default name based on email
          setExtendedUser({
            ...auth.user,
            name: auth.user.email?.split('@')[0] || 'User',
            phone: '',
            profilePicture: undefined
          });
        }
      };
      
      getProfileData();
    } else {
      setExtendedUser(null);
    }
  }, [auth.user]);
  
  return { ...auth, user: extendedUser || auth.user };
};
