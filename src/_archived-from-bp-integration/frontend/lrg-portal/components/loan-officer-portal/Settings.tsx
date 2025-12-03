import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { FloatingInput } from '../ui/floating-input';
import { User, Bell, Shield, Save, HelpCircle, Mail, MessageSquare, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface SettingsProps {
  userId: string;
}

interface WordPressUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  meta?: {
    wpo365_auth?: string;
    wpo365_upn?: string;
    wpo365_email?: string;
  };
}

export function Settings({ userId }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // WordPress account data
  const [wpUser, setWpUser] = useState<WordPressUser | null>(null);
  const [isMicrosoftUser, setIsMicrosoftUser] = useState(false);
  const [microsoftEmail, setMicrosoftEmail] = useState('');
  const [accountData, setAccountData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    displayName: '',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Account settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Notification settings
  const [leadNotifications, setLeadNotifications] = useState(true);
  const [partnershipNotifications, setPartnershipNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(true);

  // Load WordPress user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/wp-json/wp/v2/users/me?context=edit', {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': (window as any).frsPortalConfig?.restNonce || '',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWpUser(data);

          // Check if user is authenticated via WPO365/Microsoft
          // Only mark as Microsoft user if they have actual WPO365 meta data
          const wpo365Meta = data.meta?.wpo365_auth || data.meta?.wpo365_upn || data.meta?.wpo365_email;
          const isMSUser = !!wpo365Meta;

          setIsMicrosoftUser(isMSUser);
          setMicrosoftEmail(data.meta?.wpo365_email || data.meta?.wpo365_upn || '');

          setAccountData({
            email: data.email || '',
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            displayName: data.name || '',
          });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleAccountSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Build update object - exclude email for Microsoft users
      const updateData: any = {
        first_name: accountData.firstName,
        last_name: accountData.lastName,
        name: accountData.displayName,
      };

      // Only include email for non-Microsoft users
      if (!isMicrosoftUser) {
        updateData.email = accountData.email;
      }

      const response = await fetch('/wp-json/wp/v2/users/me', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': (window as any).frsPortalConfig?.restNonce || '',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setWpUser(updatedUser);
        setSaveMessage({ type: 'success', message: 'Account details updated successfully!' });
      } else {
        const error = await response.json();
        setSaveMessage({ type: 'error', message: error.message || 'Failed to update account details' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'An error occurred while saving' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setSaveMessage(null);

    // Validate passwords
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setSaveMessage({ type: 'error', message: 'Please fill in all password fields' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveMessage({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setSaveMessage({ type: 'error', message: 'Password must be at least 8 characters long' });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/wp-json/wp/v2/users/me', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': (window as any).frsPortalConfig?.restNonce || '',
        },
        body: JSON.stringify({
          password: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setSaveMessage({ type: 'success', message: 'Password updated successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const error = await response.json();
        setSaveMessage({ type: 'error', message: error.message || 'Failed to update password' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'An error occurred while changing password' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement save functionality for other settings
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Support
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="space-y-6">
            {saveMessage && (
              <Alert variant={saveMessage.type === 'error' ? 'destructive' : 'default'}>
                {saveMessage.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{saveMessage.message}</AlertDescription>
              </Alert>
            )}

            {/* WordPress Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Account Details
                  {isMicrosoftUser && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      <svg className="w-4 h-4" viewBox="0 0 23 23" fill="currentColor">
                        <rect x="0" y="0" width="11" height="11" fill="#F25022"/>
                        <rect x="12" y="0" width="11" height="11" fill="#7FBA00"/>
                        <rect x="0" y="12" width="11" height="11" fill="#00A4EF"/>
                        <rect x="12" y="12" width="11" height="11" fill="#FFB900"/>
                      </svg>
                      Microsoft Account
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {isMicrosoftUser
                    ? 'Your account is managed through Microsoft 365'
                    : 'Manage your WordPress account information'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading account details...</div>
                ) : (
                  <>
                    {isMicrosoftUser && (
                      <Alert>
                        <AlertDescription>
                          Your account uses Microsoft 365 authentication. Some settings are managed through your Microsoft account.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      {/* Username - Read Only */}
                      <div>
                        <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                        <div className="mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-sm">
                          {wpUser?.username || 'N/A'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Usernames cannot be changed</p>
                      </div>

                      {/* Email */}
                      <div>
                        <FloatingInput
                          id="email"
                          label="Email Address"
                          type="email"
                          value={accountData.email}
                          onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                          className="bg-white"
                          disabled={isMicrosoftUser}
                        />
                        {isMicrosoftUser && (
                          <p className="text-xs text-gray-500 mt-1">
                            Email is managed through your Microsoft account
                          </p>
                        )}
                      </div>

                      {/* First Name */}
                      <FloatingInput
                        id="firstName"
                        label="First Name"
                        value={accountData.firstName}
                        onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })}
                        className="bg-white"
                      />

                      {/* Last Name */}
                      <FloatingInput
                        id="lastName"
                        label="Last Name"
                        value={accountData.lastName}
                        onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })}
                        className="bg-white"
                      />

                      {/* Display Name */}
                      <FloatingInput
                        id="displayName"
                        label="Display Name"
                        value={accountData.displayName}
                        onChange={(e) => setAccountData({ ...accountData, displayName: e.target.value })}
                        className="bg-white"
                      />
                    </div>

                    <div className="pt-4">
                      <Button onClick={handleAccountSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Account Details'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  {isMicrosoftUser
                    ? 'Password is managed through Microsoft 365'
                    : 'Update your account password'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isMicrosoftUser ? (
                  <Alert>
                    <AlertDescription className="flex flex-col gap-3">
                      <p>
                        Your password is managed through Microsoft 365. To change your password, please visit your Microsoft account settings.
                      </p>
                      <a
                        href="https://account.microsoft.com/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Manage Microsoft Account Security
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-4">
                      <FloatingInput
                        id="newPassword"
                        label="New Password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="bg-white"
                      />

                      <FloatingInput
                        id="confirmPassword"
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="bg-white"
                      />

                      <p className="text-xs text-gray-500">
                        Password must be at least 8 characters long
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={handlePasswordChange}
                        disabled={isSaving || !passwordData.newPassword || !passwordData.confirmPassword}
                        variant="secondary"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {isSaving ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Email Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Email Preferences</CardTitle>
                <CardDescription>
                  Manage your email notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive email notifications about your account activity
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails">Marketing Emails</Label>
                      <p className="text-sm text-gray-500">
                        Receive emails about new features and updates
                      </p>
                    </div>
                    <Switch
                      id="marketing-emails"
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lead-notifications">Lead Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when you receive new leads
                    </p>
                  </div>
                  <Switch
                    id="lead-notifications"
                    checked={leadNotifications}
                    onCheckedChange={setLeadNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="partnership-notifications">Partnership Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Get notified about partnership invites and updates
                    </p>
                  </div>
                  <Switch
                    id="partnership-notifications"
                    checked={partnershipNotifications}
                    onCheckedChange={setPartnershipNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="system-notifications">System Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Get notified about system updates and maintenance
                    </p>
                  </div>
                  <Switch
                    id="system-notifications"
                    checked={systemNotifications}
                    onCheckedChange={setSystemNotifications}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your privacy and what information is visible to others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <p className="text-sm text-gray-500">
                      Make your profile visible to other users
                    </p>
                  </div>
                  <Switch
                    id="profile-visibility"
                    checked={profileVisibility}
                    onCheckedChange={setProfileVisibility}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-email">Show Email Address</Label>
                    <p className="text-sm text-gray-500">
                      Display your email address on your public profile
                    </p>
                  </div>
                  <Switch
                    id="show-email"
                    checked={showEmail}
                    onCheckedChange={setShowEmail}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-phone">Show Phone Number</Label>
                    <p className="text-sm text-gray-500">
                      Display your phone number on your public profile
                    </p>
                  </div>
                  <Switch
                    id="show-phone"
                    checked={showPhone}
                    onCheckedChange={setShowPhone}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support & Help</CardTitle>
              <CardDescription>
                Get help and contact our support team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Send us an email and we'll get back to you within 24 hours
                    </p>
                    <a
                      href="mailto:support@21stcenturylending.com"
                      className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                    >
                      support@21stcenturylending.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Live Chat</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Chat with our support team in real-time
                    </p>
                    <Button variant="link" className="text-sm p-0 h-auto mt-2">
                      Start a conversation
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Help Center</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Browse our knowledge base and FAQs
                    </p>
                    <Button variant="link" className="text-sm p-0 h-auto mt-2">
                      Visit Help Center
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>21st Century Lending</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Hours: Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
