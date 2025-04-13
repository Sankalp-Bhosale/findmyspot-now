
import React, { useState } from 'react';
import { useExtendedAuth } from '@/hooks/useExtendedAuth';
import { CustomInput } from '@/components/ui/CustomInput';
import { Button } from '@/components/ui/Button';
import { User, Mail, Phone, Camera } from 'lucide-react';
import NavBar from '@/components/ui/NavBar';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading } = useExtendedAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast.error('Name and email are required');
      return;
    }
    
    if (phone && !/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be 10 digits');
      return;
    }
    
    try {
      await updateProfile({ name, email, phone });
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 px-4 py-3 flex items-center border-b border-parking-lightgray">
        <NavigationDrawer />
        <h1 className="text-lg font-medium ml-4">My Profile</h1>
      </div>
      
      <div className="flex-1 pt-16 p-4">
        {/* Profile Avatar */}
        <div className="flex flex-col items-center mt-6 mb-8">
          {user?.profilePicture ? (
            <div className="relative">
              <img 
                src={user.profilePicture} 
                alt={user.name || 'User'}
                className="w-24 h-24 rounded-full object-cover border-2 border-parking-yellow"
              />
              <button className="absolute bottom-0 right-0 bg-parking-yellow text-white p-2 rounded-full">
                <Camera size={16} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-parking-yellow text-white flex items-center justify-center">
                <span className="text-3xl font-medium">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <button className="absolute bottom-0 right-0 bg-white text-parking-dark p-2 rounded-full shadow-md border border-parking-lightgray">
                <Camera size={16} />
              </button>
            </div>
          )}
          <h2 className="text-xl font-bold mt-4">{user?.name || 'User'}</h2>
          <p className="text-parking-gray">{user?.email}</p>
        </div>
        
        {/* Profile Form */}
        <div className="bg-white rounded-lg border border-parking-lightgray p-4 animate-scale-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Profile Information</h3>
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <CustomInput
              label="Full Name"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User size={18} />}
              disabled={!isEditing}
              required
            />
            
            <CustomInput
              label="Email Address"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              disabled={!isEditing}
              required
            />
            
            <CustomInput
              label="Phone Number"
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone size={18} />}
              disabled={!isEditing}
            />
            
            {isEditing && (
              <div className="flex space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setName(user?.name || '');
                    setEmail(user?.email || '');
                    setPhone(user?.phone || '');
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <NavBar type="bottom" />
    </div>
  );
};

export default ProfilePage;
