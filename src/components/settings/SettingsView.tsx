import React, { useState } from 'react';
import {
  User,
  Store,
  Bell,
  Shield,
  LogOut,
  Key,
  MessageCircle,
  Building2,
  Link
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { SettingCategory } from './SettingCategory';
import { SettingCard } from './SettingCard';
import { StoreManagement } from './stores/StoreManagement';
import { ChangePasswordView } from './ChangePasswordView';
import { ProfileView } from './profile/ProfileView';
import { WhatsAppApiView } from './whatsapp/WhatsAppApiView';
import { WooCommerceIntegrationView } from './woocommerce/WooCommerceIntegrationView';

export function SettingsView() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState('main');

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (activeView === 'stores') {
    return <StoreManagement onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'change-password') {
    return <ChangePasswordView onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'profile') {
    return <ProfileView onBack={() => setActiveView('main')} />;
  }
  
  if (activeView === 'whatsapp-api') {
    return <WhatsAppApiView onBack={() => setActiveView('main')} />;
  }
  
  if (activeView === 'woocommerce') {
    return <WooCommerceIntegrationView onBack={() => setActiveView('main')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-7xl mx-auto p-8 pb-32">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
        
        <SettingCategory title="Account" icon={User}>
          <SettingCard
            title="Profile Information"
            description="Update your account details and preferences"
            icon={User}
            onClick={() => setActiveView('profile')}
          />
          <SettingCard
            title="Change Password"
            description="Update your password and security settings"
            icon={Key}
            onClick={() => setActiveView('change-password')}
          />
        </SettingCategory>

        <SettingCategory title="Store Management" icon={Store}>
          <SettingCard
            title="Manage Stores"
            description="Add, edit, or remove your store locations"
            icon={Building2}
            onClick={() => setActiveView('stores')}
          />
          <SettingCard
            title="WooCommerce Integration"
            description="Connect and manage your WooCommerce stores"
            icon={Link}
            onClick={() => setActiveView('woocommerce')}
          />
        </SettingCategory>

        <SettingCategory title="Notifications" icon={Bell}>
          <SettingCard
            title="WhatsApp API"
            description="Manage your WhatsApp API settings"
            icon={MessageCircle}
            onClick={() => setActiveView('whatsapp-api')}
          />
        </SettingCategory>

        <SettingCategory title="Security" icon={Shield}>
          <SettingCard
            title="Logout"
            description="Sign out of your account"
            icon={LogOut}
            onClick={handleLogout}
          />
        </SettingCategory>
      </div>
    </div>
  );
}