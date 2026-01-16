import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Bell,
  Shield,
  Save,
  HelpCircle,
  Mail,
  MessageSquare,
  Lock,
  AlertCircle,
  CheckCircle,
  Plug,
  ExternalLink,
  RefreshCw,
  Trash2,
} from 'lucide-react';

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

interface NotificationSettings {
  lead_notifications: boolean;
  meeting_notifications: boolean;
  marketing_emails: boolean;
  system_updates: boolean;
  weekly_digest: boolean;
}

interface PrivacySettings {
  profile_visible: boolean;
  show_phone: boolean;
  show_email: boolean;
  show_social_links: boolean;
  allow_contact_form: boolean;
  show_in_directory: boolean;
}

interface FUBStatus {
  connected: boolean;
  account_name: string;
  account_email: string;
  connected_at: string | null;
  masked_key?: string;
}

interface FUBStats {
  total_synced: number;
  last_sync: string | null;
  recent_errors: Array<{ message: string; timestamp: string }>;
}

// Get REST nonce from global config
const getRestNonce = () => {
  return (window as any).frsPortalConfig?.restNonce || '';
};

// Get REST URL base
const getRestUrl = () => {
  return (window as any).frsPortalConfig?.restUrl || '/wp-json';
};

export function Settings({ userId }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // WordPress account data
  const [wpUser, setWpUser] = useState<WordPressUser | null>(null);
  const [isMicrosoftUser, setIsMicrosoftUser] = useState(false);
  const [accountData, setAccountData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    displayName: '',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    lead_notifications: true,
    meeting_notifications: true,
    marketing_emails: true,
    system_updates: true,
    weekly_digest: false,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profile_visible: true,
    show_phone: true,
    show_email: true,
    show_social_links: true,
    allow_contact_form: true,
    show_in_directory: true,
  });

  // Follow Up Boss integration
  const [fubStatus, setFubStatus] = useState<FUBStatus>({
    connected: false,
    account_name: '',
    account_email: '',
    connected_at: null,
  });
  const [fubStats, setFubStats] = useState<FUBStats>({
    total_synced: 0,
    last_sync: null,
    recent_errors: [],
  });
  const [fubApiKey, setFubApiKey] = useState('');
  const [fubLoading, setFubLoading] = useState(false);

  // Load WordPress user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/wp-json/wp/v2/users/me?context=edit', {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': getRestNonce(),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWpUser(data);

          const wpo365Meta = data.meta?.wpo365_auth || data.meta?.wpo365_upn || data.meta?.wpo365_email;
          setIsMicrosoftUser(!!wpo365Meta);

          setAccountData({
            email: data.email || '',
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            displayName: data.name || '',
          });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Load settings from REST API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch user settings
        const settingsResponse = await fetch(`${getRestUrl()}/frs-users/v1/profiles/me/settings`, {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': getRestNonce(),
          },
        });

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          if (settingsData.success && settingsData.data) {
            if (settingsData.data.notifications) {
              setNotificationSettings(settingsData.data.notifications);
            }
            if (settingsData.data.privacy) {
              setPrivacySettings(settingsData.data.privacy);
            }
          }
        }

        // Fetch FUB status
        const fubResponse = await fetch(`${getRestUrl()}/frs-users/v1/profiles/me/integrations/followupboss`, {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': getRestNonce(),
          },
        });

        if (fubResponse.ok) {
          const fubData = await fubResponse.json();
          setFubStatus(fubData);
        }

        // Fetch FUB stats if connected
        const statsResponse = await fetch(`${getRestUrl()}/frs-users/v1/profiles/me/integrations/followupboss/stats`, {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': getRestNonce(),
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setFubStats(statsData);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleAccountSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const updateData: any = {
        first_name: accountData.firstName,
        last_name: accountData.lastName,
        name: accountData.displayName,
      };

      if (!isMicrosoftUser) {
        updateData.email = accountData.email;
      }

      const response = await fetch('/wp-json/wp/v2/users/me', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': getRestNonce(),
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
          'X-WP-Nonce': getRestNonce(),
        },
        body: JSON.stringify({
          password: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setSaveMessage({ type: 'success', message: 'Password updated successfully!' });
        setPasswordData({ newPassword: '', confirmPassword: '' });
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

  const handleNotificationsSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`${getRestUrl()}/frs-users/v1/profiles/me/settings/notifications`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': getRestNonce(),
        },
        body: JSON.stringify(notificationSettings),
      });

      if (response.ok) {
        setSaveMessage({ type: 'success', message: 'Notification settings saved!' });
      } else {
        const error = await response.json();
        setSaveMessage({ type: 'error', message: error.message || 'Failed to save notification settings' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'An error occurred while saving' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrivacySave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`${getRestUrl()}/frs-users/v1/profiles/me/settings/privacy`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': getRestNonce(),
        },
        body: JSON.stringify(privacySettings),
      });

      if (response.ok) {
        setSaveMessage({ type: 'success', message: 'Privacy settings saved!' });
      } else {
        const error = await response.json();
        setSaveMessage({ type: 'error', message: error.message || 'Failed to save privacy settings' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'An error occurred while saving' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFubConnect = async () => {
    if (!fubApiKey.trim()) {
      setSaveMessage({ type: 'error', message: 'Please enter your Follow Up Boss API key' });
      return;
    }

    setFubLoading(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`${getRestUrl()}/frs-users/v1/profiles/me/integrations/followupboss`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': getRestNonce(),
        },
        body: JSON.stringify({ api_key: fubApiKey }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSaveMessage({ type: 'success', message: data.message || 'Connected to Follow Up Boss!' });
        setFubStatus({
          connected: true,
          account_name: data.account_name || '',
          account_email: '',
          connected_at: new Date().toISOString(),
        });
        setFubApiKey('');
      } else {
        setSaveMessage({ type: 'error', message: data.message || 'Failed to connect to Follow Up Boss' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'An error occurred while connecting' });
    } finally {
      setFubLoading(false);
    }
  };

  const handleFubDisconnect = async () => {
    setFubLoading(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`${getRestUrl()}/frs-users/v1/profiles/me/integrations/followupboss`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-WP-Nonce': getRestNonce(),
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSaveMessage({ type: 'success', message: 'Disconnected from Follow Up Boss' });
        setFubStatus({
          connected: false,
          account_name: '',
          account_email: '',
          connected_at: null,
        });
        setFubStats({
          total_synced: 0,
          last_sync: null,
          recent_errors: [],
        });
      } else {
        setSaveMessage({ type: 'error', message: data.message || 'Failed to disconnect' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'An error occurred while disconnecting' });
    } finally {
      setFubLoading(false);
    }
  };

  const handleFubTest = async () => {
    setFubLoading(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`${getRestUrl()}/frs-users/v1/profiles/me/integrations/followupboss/test`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-WP-Nonce': getRestNonce(),
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSaveMessage({ type: 'success', message: 'Connection test successful!' });
      } else {
        setSaveMessage({ type: 'error', message: data.message || 'Connection test failed' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'An error occurred during the test' });
    } finally {
      setFubLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Support</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="space-y-6">
            {saveMessage && activeTab === 'account' && (
              <Alert variant={saveMessage.type === 'error' ? 'destructive' : 'default'}>
                {saveMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{saveMessage.message}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Account Details
                  {isMicrosoftUser && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Microsoft Account
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isMicrosoftUser ? 'Your account is managed through Microsoft 365' : 'Manage your WordPress account information'}
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
                      <div>
                        <Label htmlFor="username" className="text-sm font-medium">
                          Username
                        </Label>
                        <div className="mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-sm">
                          {wpUser?.username || 'N/A'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Usernames cannot be changed</p>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={accountData.email}
                          onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                          disabled={isMicrosoftUser}
                          className="mt-1.5"
                        />
                        {isMicrosoftUser && <p className="text-xs text-gray-500 mt-1">Email is managed through your Microsoft account</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={accountData.firstName}
                            onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={accountData.lastName}
                            onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={accountData.displayName}
                          onChange={(e) => setAccountData({ ...accountData, displayName: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>{isMicrosoftUser ? 'Password is managed through Microsoft 365' : 'Update your account password'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isMicrosoftUser ? (
                  <Alert>
                    <AlertDescription className="flex flex-col gap-3">
                      <p>Your password is managed through Microsoft 365. To change your password, please visit your Microsoft account settings.</p>
                      <a
                        href="https://account.microsoft.com/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Manage Microsoft Account Security
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
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
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose which notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {saveMessage && activeTab === 'notifications' && (
                <Alert variant={saveMessage.type === 'error' ? 'destructive' : 'default'}>
                  {saveMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription>{saveMessage.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lead-notifications">Lead Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified when you receive new leads</p>
                  </div>
                  <Switch
                    id="lead-notifications"
                    checked={notificationSettings.lead_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lead_notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="meeting-notifications">Meeting Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified about meeting requests and updates</p>
                  </div>
                  <Switch
                    id="meeting-notifications"
                    checked={notificationSettings.meeting_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, meeting_notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-sm text-gray-500">Receive emails about new features and updates</p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={notificationSettings.marketing_emails}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, marketing_emails: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="system-updates">System Updates</Label>
                    <p className="text-sm text-gray-500">Get notified about system updates and maintenance</p>
                  </div>
                  <Switch
                    id="system-updates"
                    checked={notificationSettings.system_updates}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, system_updates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-digest">Weekly Digest</Label>
                    <p className="text-sm text-gray-500">Receive a weekly summary of your activity</p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={notificationSettings.weekly_digest}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weekly_digest: checked })}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleNotificationsSave} disabled={isSaving}>
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
              <CardDescription>Control your privacy and what information is visible to others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {saveMessage && activeTab === 'privacy' && (
                <Alert variant={saveMessage.type === 'error' ? 'destructive' : 'default'}>
                  {saveMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription>{saveMessage.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                  </div>
                  <Switch
                    id="profile-visibility"
                    checked={privacySettings.profile_visible}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, profile_visible: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-in-directory">Show in Directory</Label>
                    <p className="text-sm text-gray-500">Appear in the public profile directory</p>
                  </div>
                  <Switch
                    id="show-in-directory"
                    checked={privacySettings.show_in_directory}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, show_in_directory: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-email">Show Email Address</Label>
                    <p className="text-sm text-gray-500">Display your email address on your public profile</p>
                  </div>
                  <Switch
                    id="show-email"
                    checked={privacySettings.show_email}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, show_email: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-phone">Show Phone Number</Label>
                    <p className="text-sm text-gray-500">Display your phone number on your public profile</p>
                  </div>
                  <Switch
                    id="show-phone"
                    checked={privacySettings.show_phone}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, show_phone: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-social">Show Social Links</Label>
                    <p className="text-sm text-gray-500">Display your social media links on your profile</p>
                  </div>
                  <Switch
                    id="show-social"
                    checked={privacySettings.show_social_links}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, show_social_links: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-contact">Allow Contact Form</Label>
                    <p className="text-sm text-gray-500">Let visitors contact you through your profile</p>
                  </div>
                  <Switch
                    id="allow-contact"
                    checked={privacySettings.allow_contact_form}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allow_contact_form: checked })}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handlePrivacySave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            {saveMessage && activeTab === 'integrations' && (
              <Alert variant={saveMessage.type === 'error' ? 'destructive' : 'default'}>
                {saveMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{saveMessage.message}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Follow Up Boss
                      {fubStatus.connected && <Badge className="bg-green-100 text-green-700">Connected</Badge>}
                    </CardTitle>
                    <CardDescription>Connect your Follow Up Boss CRM to automatically sync leads</CardDescription>
                  </div>
                  {fubStatus.connected && (
                    <div className="text-right text-sm text-gray-500">
                      {fubStatus.account_name && <p className="font-medium text-gray-700">{fubStatus.account_name}</p>}
                      {fubStats.total_synced > 0 && <p>{fubStats.total_synced} leads synced</p>}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {fubStatus.connected ? (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Status</span>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      {fubStatus.masked_key && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">API Key</span>
                          <span className="font-mono text-gray-700">{fubStatus.masked_key}</span>
                        </div>
                      )}
                      {fubStatus.connected_at && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Connected</span>
                          <span className="text-gray-700">{new Date(fubStatus.connected_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      {fubStats.last_sync && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Last Sync</span>
                          <span className="text-gray-700">{new Date(fubStats.last_sync).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleFubTest} disabled={fubLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${fubLoading ? 'animate-spin' : ''}`} />
                        Test Connection
                      </Button>
                      <Button variant="destructive" onClick={handleFubDisconnect} disabled={fubLoading}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fub-api-key">Follow Up Boss API Key</Label>
                        <Input
                          id="fub-api-key"
                          type="password"
                          value={fubApiKey}
                          onChange={(e) => setFubApiKey(e.target.value)}
                          placeholder="Enter your API key"
                          className="mt-1.5"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Find your API key in Follow Up Boss under Admin &gt; API.{' '}
                          <a
                            href="https://app.followupboss.com/2/api"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Get your API key
                          </a>
                        </p>
                      </div>
                    </div>

                    <Button onClick={handleFubConnect} disabled={fubLoading || !fubApiKey.trim()}>
                      <Plug className="h-4 w-4 mr-2" />
                      {fubLoading ? 'Connecting...' : 'Connect Follow Up Boss'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support & Help</CardTitle>
              <CardDescription>Get help and contact our support team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                    <p className="text-sm text-gray-500 mt-1">Send us an email and we'll get back to you within 24 hours</p>
                    <a href="mailto:support@21stcenturylending.com" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
                      support@21stcenturylending.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Live Chat</h3>
                    <p className="text-sm text-gray-500 mt-1">Chat with our support team in real-time</p>
                    <Button variant="link" className="text-sm p-0 h-auto mt-2">
                      Start a conversation
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Help Center</h3>
                    <p className="text-sm text-gray-500 mt-1">Browse our knowledge base and FAQs</p>
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
