
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('parkitUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For demo purposes, we simulate the authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (password.length < 6) {
        throw new Error('Invalid credentials');
      }
      
      // Create dummy user
      const dummyUser = {
        id: '123',
        name: email.split('@')[0],
        email
      };
      
      setUser(dummyUser);
      localStorage.setItem('parkitUser', JSON.stringify(dummyUser));
      toast.success('Successfully signed in!');
    } catch (error) {
      toast.error('Failed to sign in: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string, phone?: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For demo purposes, we simulate the registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        phone
      };
      
      setUser(newUser);
      localStorage.setItem('parkitUser', JSON.stringify(newUser));
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Failed to create account: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would send a reset link
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error('Failed to send reset link: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would open Google OAuth
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful Google sign-in
      const googleUser = {
        id: 'google-' + Date.now().toString(),
        name: 'Google User',
        email: 'user@gmail.com',
        profilePicture: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70)
      };
      
      setUser(googleUser);
      localStorage.setItem('parkitUser', JSON.stringify(googleUser));
      toast.success('Signed in with Google');
    } catch (error) {
      toast.error('Failed to sign in with Google: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser as User);
      localStorage.setItem('parkitUser', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('parkitUser');
    toast.info('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      googleSignIn,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
