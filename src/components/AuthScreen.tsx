
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CustomInput } from '@/components/ui/CustomInput';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Mail, User, Lock, ArrowLeft } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

const AuthScreen: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (isSignUp && !formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(formData.name, formData.email, formData.password);
        toast.success("Account created successfully!");
      } else {
        await signIn(formData.email, formData.password);
        toast.success("Signed in successfully!");
      }
      navigate('/home');
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="py-4 px-6 flex items-center">
        <button
          onClick={() => navigate('/onboarding')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-parking-dark" />
        </button>
        <h1 className="text-xl font-semibold ml-2">
          {isSignUp ? 'Sign up' : 'Sign in'}
        </h1>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
          {isSignUp && (
            <CustomInput
              label="NAME"
              placeholder="Aryan Panjwani"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={<User size={18} />}
              autoComplete="name"
            />
          )}
          
          <CustomInput
            label="EMAIL"
            placeholder="aryanthedeveloper@gmail.com"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail size={18} />}
            autoComplete="email"
          />
          
          <CustomInput
            label="PASSWORD"
            placeholder="••••••••"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<Lock size={18} />}
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
          
          <Button
            type="submit"
            variant="default"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="bg-parking-dark text-white mt-6"
          >
            {isSignUp ? 'Sign up' : 'Sign in'}
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-parking-gray">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-parking-dark font-medium hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
