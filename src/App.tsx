import React from 'react';
import { BarChart2, MessageCircle, Gift, Stamp, Coins, Store, Check, ArrowRight, Mail, Lock, Menu, X } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import { Navigation } from './components/landing/Navigation';
import { Hero } from './components/landing/Hero';
import { Problems } from './components/landing/Problems';
import { Solution } from './components/landing/Solution';
import { Features } from './components/landing/Features';
import { Testimonials } from './components/landing/Testimonials';
import { Pricing } from './components/landing/Pricing';
import { CTA } from './components/landing/CTA';
import { Footer } from './components/landing/Footer';
import { Dashboard } from './components/Dashboard';
import { Tools } from './components/tools/Tools';
import { DatabaseView } from './components/database/DatabaseView';
import { SettingsView } from './components/settings/SettingsView';
import { CustomerView } from './components/customer/CustomerView';
import { Dock } from './components/navigation/Dock';
import toast from 'react-hot-toast';

export default function App() {
  const [showLogin, setShowLogin] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const { user, login, isLoading } = useAuth();
  const [activeView, setActiveView] = React.useState<string>('home');
  const [loginData, setLoginData] = React.useState({
    email: '',
    password: ''
  });

  React.useEffect(() => {
    // Reset to dashboard view whenever user logs in
    if (user) {
      setActiveView('home');
      setShowLogin(false);
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!loginData.email || !loginData.password) {
      toast.error('Please enter both email and password');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const success = await login(loginData.email, loginData.password);
      if (!success) {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again later.');
    }
  };

  if (user) {
    return (
      <>
        {activeView === 'tools' && <Tools onNavigate={setActiveView} />}
        {activeView === 'database' && <DatabaseView />}
        {activeView === 'settings' && <SettingsView />}
        {activeView === 'customer' && <CustomerView />}
        {activeView === 'home' && <Dashboard />}
        <Dock onNavigate={setActiveView} activeItem={activeView} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Toaster position="top-right" />

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-gray-600 mt-2">Sign in to your account</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowLogin(false)}
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <Navigation onShowLogin={() => setShowLogin(true)} />
      <Hero />
      <Problems />
      <Solution />
      <Features />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}