/**
 * Dashboard Component
 *
 * Main dashboard for profile management portal
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Settings, FileText, AlertCircle } from 'lucide-react';
import { profileService, type ProfileData } from '../utils/profileService';

export function Dashboard() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getCurrentUserProfile();
      setProfile(data);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">{error}</p>
            <Button onClick={loadProfile} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileCompleteness = calculateCompleteness(profile);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Welcome back, {profile?.first_name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Manage your profile and settings from this dashboard.
        </p>
      </div>

      {/* Profile Completeness Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Completeness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${profileCompleteness}%` }}
                ></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {profileCompleteness}%
            </span>
          </div>
          {profileCompleteness < 100 && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-gray-600">
                Complete your profile to increase your visibility and reach more clients.
              </p>
              <Link to="/profile">
                <Button size="sm">
                  Complete Profile
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <Link to="/profile">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="size-5 text-blue-600" />
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View and edit your profile information, biography, and professional details.
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <Link to="/settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="size-5 text-blue-600" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Manage your account settings, privacy preferences, and notifications.
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-5 text-blue-600" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Learn how to make the most of your profile and resources available to you.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Summary */}
      {profile && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{profile.first_name} {profile.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Job Title</p>
                <p className="font-medium">{profile.job_title || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">NMLS</p>
                <p className="font-medium">{profile.nmls || profile.nmls_number || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Calculate profile completeness percentage
 */
function calculateCompleteness(profile: ProfileData | null): number {
  if (!profile) {return 0;}

  const fields = [
    profile.first_name,
    profile.last_name,
    profile.email,
    profile.phone_number,
    profile.job_title,
    profile.biography,
    profile.nmls || profile.nmls_number,
    profile.city_state,
    profile.headshot_id,
    profile.linkedin_url || profile.facebook_url,
  ];

  const filledFields = fields.filter(field => field && field !== '').length;
  return Math.round((filledFields / fields.length) * 100);
}
