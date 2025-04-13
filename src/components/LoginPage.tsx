
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CustomInput } from '@/components/ui/CustomInput';
import { Button } from '@/components/ui/Button';
import { Mail, Key, LogIn, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, googleSignIn, resetPassword, isLoading, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Email and password are required');
      return;
    }
    
    try {
      await signIn(email, password);
      // Auth state change will handle navigation
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to sign in');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      // Redirection handled by OAuth
    } catch (error: any) {
      setErrorMessage(error.message || 'Google sign-in failed');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setErrorMessage('Please enter your email address');
      return;
    }
    
    try {
      await resetPassword(resetEmail);
      setIsResetDialogOpen(false);
      setResetEmail('');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-parking-dark">Welcome Back</h1>
            <p className="text-parking-gray mt-2">Sign in to continue to Park-It</p>
          </div>
          
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <CustomInput
              label="Email Address"
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />
            
            <CustomInput
              label="Password"
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Key size={18} />}
              required
            />
            
            <div className="flex justify-end">
              <button 
                type="button" 
                className="text-sm text-parking-dark hover:text-parking-yellow"
                onClick={() => setIsResetDialogOpen(true)}
              >
                Forgot password?
              </button>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              icon={<LogIn size={18} />}
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-parking-gray">Or continue with</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              fullWidth
              className="mt-4"
              onClick={handleGoogleSignIn}
              isLoading={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </Button>
            
            <div className="text-center mt-6">
              <p className="text-sm text-parking-gray">
                Don't have an account?{' '}
                <Link to="/signup" className="text-parking-dark font-medium hover:text-parking-yellow">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Password Reset Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleResetPassword} className="space-y-4 py-4">
            <CustomInput
              type="email"
              id="resetEmail"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              icon={<Mail size={18} />}
              label="Email Address"
              required
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Send Reset Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
