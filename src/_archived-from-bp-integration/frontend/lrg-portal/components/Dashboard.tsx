import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LoanOfficerDashboard } from './LoanOfficerDashboard';
import { RealtorDashboard } from './RealtorDashboard';
import { MarketingMaterials } from './MarketingMaterials';
import { ProfileSection } from './ProfileSection';
import { Button } from './ui/button';
import { User, Bell, Settings, LogOut, ChevronDown } from 'lucide-react';
import { DataService, type User as UserType } from '../utils/dataService';
import { APP_CONFIG } from '../config/appConfig';
import { LoadingSpinner } from './ui/loading';
import { ErrorAlert } from './ui/error';

export function Dashboard() {
  const [userRole, setUserRole] = useState<'loan-officer' | 'realtor'>('loan-officer');
  const [currentUser, setCurrentUser] = useState<UserType>({
    id: '',
    name: '',
    email: '',
    role: 'loan_officer',
    status: 'active',
    createdAt: new Date().toISOString(),
    company: '',
    location: ''
  });
  const [activeSection, setActiveSection] = useState<'dashboard' | 'marketing-materials' | 'profile'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get WordPress user with admin bar role switching support
    DataService.getCurrentUser()
      .then(wpUser => {
        console.log('Got WordPress user:', wpUser);
        setCurrentUser(wpUser);
        setUserRole(wpUser.role.replace('_', '-') as 'loan-officer' | 'realtor');
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
        setIsLoading(false);
      });
  }, []);

  // Listen for role changes from admin bar
  useEffect(() => {
    const handleRoleChange = () => {
      DataService.getCurrentUser()
        .then(wpUser => {
          console.log('Role changed to:', wpUser.role);
          setCurrentUser(wpUser);
          setUserRole(wpUser.role.replace('_', '-') as 'loan-officer' | 'realtor');
        })
        .catch(err => console.log('Role change error:', err));
    };

    // Listen for admin bar role switches
    window.addEventListener('frs-role-changed', handleRoleChange);
    
    return () => {
      window.removeEventListener('frs-role-changed', handleRoleChange);
    };
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserDropdownOpen]);

  const handleLogout = () => {
    // Use the WordPress logout URL provided by the server
    const logoutUrl = (window as any).frsPortalData?.logoutUrl;
    if (logoutUrl) {
      window.location.href = logoutUrl;
    } else {
      // Fallback logout URL
      window.location.href = '/wp-login.php?action=logout';
    }
  };

  return (
    <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as 'dashboard' | 'marketing-materials' | 'profile')} className="flex flex-col">
      <div className="min-h-screen bg-[var(--brand-page-background)]">
        {/* Header - Fixed Dark Navigation */}
        <header 
          className="fixed top-0 left-0 right-0 z-50 px-6 py-4 shadow-lg" 
          style={{
            backgroundColor: '#171A1F',
            borderBottom: '1px solid #263042'
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-4">
              {/* Site Logo */}
              {(window as any).frsPortalData?.siteLogo ? (
                <img 
                  src={(window as any).frsPortalData.siteLogo}
                  alt="Site Logo"
                  className="h-8 w-auto max-w-40"
                  onError={(e) => {
                    // Hide logo if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-2xl font-bold text-white">
                  {(window as any).frsPortalData?.siteName || APP_CONFIG.legal.companyName}
                </div>
              )}
              <div className="frs-portal-title text-sm" style={{color: '#C3D9F1'}}>Partnership Portal</div>
            </div>

            {/* User Controls - No navigation tabs in header */}
            <div className="flex items-center space-x-6">
              {/* Right side controls with consistent spacing */}
              <div className="flex items-center space-x-4">
                {/* User Role Display */}
                <div 
                  className="frs-user-role text-sm px-3 py-1 rounded-md" 
                  style={{color: '#C3D9F1', backgroundColor: '#263042'}}
                >
                  {userRole === 'loan-officer' ? 'Loan Officer' : 'Realtor'}
                </div>

                {/* Settings Button - opens Profile tab */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#C3D9F1] hover:text-white"
                  style={{backgroundColor: '#263042'}}
                  onClick={() => setActiveSection('profile')}
                >
                  <Settings className="h-5 w-5" />
                </Button>

                {/* User Avatar Dropdown - rightmost item */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 hover:bg-[#405C7A] rounded-lg px-3 py-2 transition-colors"
                    style={{backgroundColor: '#263042'}}
                  >
                    <img
                      src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2DD4DA&color=fff`}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full border-2 border-[#C3D9F1]"
                      onError={(e) => {
                        // Fallback to generated avatar
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2DD4DA&color=fff`;
                      }}
                    />
                    <ChevronDown className="w-4 h-4 text-[#C3D9F1]" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img
                            src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2DD4DA&color=fff`}
                            alt={currentUser.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {currentUser.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setActiveSection('profile');
                            setIsUserDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profile Settings
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation - Fixed and attached to header */}
        <div className="fixed top-[60px] left-0 right-0 z-50 bg-white border-b shadow-sm mt-3">
          <div className="px-6 tab-navigation-container">
            <TabsList className="bg-[var(--brand-pale-blue)] w-full grid grid-cols-3 h-14 gap-2" style={{ margin: 0, padding: '6px' }}>
              <TabsTrigger value="dashboard" className="text-sm font-medium px-4 py-2">Dashboard</TabsTrigger>
              <TabsTrigger value="marketing-materials" className="text-sm font-medium px-4 py-2">Marketing Materials</TabsTrigger>
              <TabsTrigger value="profile" className="text-sm font-medium px-4 py-2">Profile</TabsTrigger>
            </TabsList>
          </div>
        </div>

      {/* Main Content */}
      <main className="p-6">
        {error && (
          <div className="mb-6">
            <ErrorAlert
              type="error"
              title="Error Loading Dashboard"
              message={error}
              onDismiss={() => setError(null)}
            />
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-[var(--brand-slate)]">Loading dashboard...</span>
          </div>
        ) : currentUser ? (
          <>
            <TabsContent value="dashboard" className="mt-0">
              {userRole === 'loan-officer' ? (
                <LoanOfficerDashboard
                  userId={currentUser.id}
                  currentUser={currentUser}
                  onNavigateToProfile={() => setActiveSection('profile')}
                />
              ) : (
                <RealtorDashboard userId={currentUser.id} />
              )}
            </TabsContent>
            
            <TabsContent value="marketing-materials" className="mt-0">
              <MarketingMaterials userRole={userRole} userId={currentUser.id} currentUser={currentUser} />
            </TabsContent>
            
            <TabsContent value="profile" className="mt-0">
              <ProfileSection userRole={userRole} userId={currentUser.id} />
            </TabsContent>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--brand-slate)]">Unable to load dashboard. Please try again.</p>
          </div>
        )}
      </main>
      </div>
    </Tabs>
  );
}