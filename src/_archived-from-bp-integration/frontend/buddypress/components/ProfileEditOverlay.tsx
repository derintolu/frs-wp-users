/**
 * Profile Edit Overlay
 *
 * An inline overlay that covers the body content area when "Edit Profile" is clicked.
 * Contains all edit form fields organized in tabbed sections (Personal, Professional, Social).
 * Positioned to overlay the main content area, starting after the sidebar.
 */

import { useState, useEffect } from 'react';
import { X, User, Briefcase, Link, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FloatingInput } from '@/components/ui/floating-input';
import { Label } from '@/components/ui/label';
import { useProfileEdit } from '@/frontend/buddypress/contexts/ProfileEditContext';

interface ProfileData {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  mobile_number: string;
  job_title: string;
  city_state: string;
  biography: string;
  nmls_id: string;
  specialties_lo: string[];
  namb_certifications: string[];
  service_areas: string[];
  linkedin_url: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
  website: string;
}

const defaultProfileData: ProfileData = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  mobile_number: '',
  job_title: '',
  city_state: '',
  biography: '',
  nmls_id: '',
  specialties_lo: [],
  namb_certifications: [],
  service_areas: [],
  linkedin_url: '',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  youtube_url: '',
  website: '',
};

interface ProfileEditOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function ProfileEditOverlay({ isOpen, onClose, userId }: ProfileEditOverlayProps) {
  const { setActiveSection, setIsSaving: setContextSaving } = useProfileEdit();
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
  const [originalData, setOriginalData] = useState<ProfileData>(defaultProfileData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data when overlay opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchProfileData();
    }
  }, [isOpen, userId]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const config = (window as any).frsBPConfig || {};
      const nonce = config.restNonce || config.nonce || (window as any).wpApiSettings?.nonce || '';

      // Try to fetch from frs-users API first
      const response = await fetch(`/wp-json/frs-users/v1/profiles/user/${userId}`, {
        headers: {
          'X-WP-Nonce': nonce,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;

        const profile: ProfileData = {
          id: data.id,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          mobile_number: data.mobile_number || '',
          job_title: data.job_title || '',
          city_state: data.city_state || '',
          biography: data.biography || '',
          nmls_id: data.nmls_id || data.nmls_number || '',
          specialties_lo: data.specialties_lo || [],
          namb_certifications: data.namb_certifications || [],
          service_areas: data.service_areas || [],
          linkedin_url: data.linkedin_url || '',
          facebook_url: data.facebook_url || '',
          instagram_url: data.instagram_url || '',
          twitter_url: data.twitter_url || '',
          youtube_url: data.youtube_url || '',
          website: data.website || '',
        };

        setProfileData(profile);
        setOriginalData(profile);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle field changes
  const handleFieldChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!profileData.id) {
      setError('No profile ID found');
      return;
    }

    setIsSaving(true);
    setContextSaving(true);
    setError(null);

    try {
      const config = (window as any).frsBPConfig || {};
      const nonce = config.restNonce || config.nonce || (window as any).wpApiSettings?.nonce || '';

      const response = await fetch(`/wp-json/frs-users/v1/profiles/${profileData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedData = result.data || result;
        setOriginalData({ ...profileData, ...updatedData });

        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[200]';
        successMsg.textContent = 'Profile saved successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);

        // Close the overlay
        handleClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');

      // Show error message
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-20 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[200]';
      errorMsg.textContent = err.message || 'Failed to save profile';
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 5000);
    } finally {
      setIsSaving(false);
      setContextSaving(false);
    }
  };

  // Handle cancel/close
  const handleClose = () => {
    setProfileData(originalData); // Reset to original data
    setActiveSection(null);
    onClose();
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setActiveSection(value as 'personal' | 'professional' | 'social');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - covers the content area */}
      <div
        className="fixed inset-0 bg-black/40 z-[100] animate-in fade-in duration-200 md:left-[320px]"
        onClick={handleClose}
      />

      {/* Overlay Panel - covers the content area inline */}
      <div
        className="fixed inset-0 md:left-[320px] z-[101] animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
          }}
        >
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close edit profile"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Loading profile...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <div className="max-w-4xl mx-auto p-6">
            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-white shadow-sm border">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white py-3"
                >
                  <User className="h-4 w-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger
                  value="professional"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white py-3"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Professional
                </TabsTrigger>
                <TabsTrigger
                  value="social"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white py-3"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Social
                </TabsTrigger>
              </TabsList>

              {/* Personal Tab */}
              <TabsContent value="personal" className="mt-0">
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                    <p className="text-sm text-gray-600">
                      Update your name, contact details, and location.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <FloatingInput
                          id="first_name"
                          label="First Name"
                          value={profileData.first_name}
                          onChange={(e) => handleFieldChange('first_name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <FloatingInput
                          id="last_name"
                          label="Last Name"
                          value={profileData.last_name}
                          onChange={(e) => handleFieldChange('last_name', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <FloatingInput
                        id="email"
                        type="email"
                        label="Email Address"
                        value={profileData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                      />
                    </div>

                    {/* Phone Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone_number">Business Phone</Label>
                        <FloatingInput
                          id="phone_number"
                          type="tel"
                          label="Business Phone"
                          value={profileData.phone_number}
                          onChange={(e) => handleFieldChange('phone_number', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile_number">Mobile Phone</Label>
                        <FloatingInput
                          id="mobile_number"
                          type="tel"
                          label="Mobile Phone"
                          value={profileData.mobile_number}
                          onChange={(e) => handleFieldChange('mobile_number', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Job Title */}
                    <div className="space-y-2">
                      <Label htmlFor="job_title">Job Title</Label>
                      <FloatingInput
                        id="job_title"
                        label="Job Title"
                        value={profileData.job_title}
                        onChange={(e) => handleFieldChange('job_title', e.target.value)}
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="city_state">City, State</Label>
                      <FloatingInput
                        id="city_state"
                        label="City, State"
                        value={profileData.city_state}
                        onChange={(e) => handleFieldChange('city_state', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Professional Tab */}
              <TabsContent value="professional" className="mt-0">
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Professional Details</CardTitle>
                    <p className="text-sm text-gray-600">
                      Update your biography, credentials, and service areas.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* NMLS ID */}
                    <div className="space-y-2">
                      <Label htmlFor="nmls_id">NMLS ID</Label>
                      <FloatingInput
                        id="nmls_id"
                        label="NMLS ID"
                        value={profileData.nmls_id}
                        onChange={(e) => handleFieldChange('nmls_id', e.target.value)}
                      />
                    </div>

                    {/* Biography */}
                    <div className="space-y-2">
                      <Label htmlFor="biography">Professional Biography</Label>
                      <textarea
                        id="biography"
                        className="w-full min-h-[150px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                        placeholder="Write your professional biography..."
                        value={profileData.biography}
                        onChange={(e) => handleFieldChange('biography', e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        HTML formatting is supported.
                      </p>
                    </div>

                    {/* Specialties */}
                    <div className="space-y-2">
                      <Label htmlFor="specialties_lo">Loan Officer Specialties</Label>
                      <FloatingInput
                        id="specialties_lo"
                        label="Specialties (comma-separated)"
                        value={Array.isArray(profileData.specialties_lo) ? profileData.specialties_lo.join(', ') : ''}
                        onChange={(e) => handleFieldChange('specialties_lo', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      />
                      <p className="text-xs text-gray-500">
                        Enter specialties separated by commas (e.g., FHA Loans, VA Loans, Jumbo Loans)
                      </p>
                    </div>

                    {/* NAMB Certifications */}
                    <div className="space-y-2">
                      <Label htmlFor="namb_certifications">NAMB Certifications</Label>
                      <FloatingInput
                        id="namb_certifications"
                        label="Certifications (comma-separated)"
                        value={Array.isArray(profileData.namb_certifications) ? profileData.namb_certifications.join(', ') : ''}
                        onChange={(e) => handleFieldChange('namb_certifications', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      />
                    </div>

                    {/* Service Areas */}
                    <div className="space-y-2">
                      <Label htmlFor="service_areas">Service Areas</Label>
                      <FloatingInput
                        id="service_areas"
                        label="Service Areas (comma-separated)"
                        value={Array.isArray(profileData.service_areas) ? profileData.service_areas.join(', ') : ''}
                        onChange={(e) => handleFieldChange('service_areas', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      />
                      <p className="text-xs text-gray-500">
                        Enter states or regions (e.g., California, Texas, Florida)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Tab */}
              <TabsContent value="social" className="mt-0">
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Links & Social Media</CardTitle>
                    <p className="text-sm text-gray-600">
                      Add your website and social media profiles.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Website */}
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <FloatingInput
                        id="website"
                        type="url"
                        label="Website URL"
                        value={profileData.website}
                        onChange={(e) => handleFieldChange('website', e.target.value)}
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url">LinkedIn</Label>
                      <FloatingInput
                        id="linkedin_url"
                        type="url"
                        label="LinkedIn Profile URL"
                        value={profileData.linkedin_url}
                        onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
                      />
                    </div>

                    {/* Facebook */}
                    <div className="space-y-2">
                      <Label htmlFor="facebook_url">Facebook</Label>
                      <FloatingInput
                        id="facebook_url"
                        type="url"
                        label="Facebook Profile URL"
                        value={profileData.facebook_url}
                        onChange={(e) => handleFieldChange('facebook_url', e.target.value)}
                      />
                    </div>

                    {/* Instagram */}
                    <div className="space-y-2">
                      <Label htmlFor="instagram_url">Instagram</Label>
                      <FloatingInput
                        id="instagram_url"
                        type="url"
                        label="Instagram Profile URL"
                        value={profileData.instagram_url}
                        onChange={(e) => handleFieldChange('instagram_url', e.target.value)}
                      />
                    </div>

                    {/* Twitter */}
                    <div className="space-y-2">
                      <Label htmlFor="twitter_url">Twitter / X</Label>
                      <FloatingInput
                        id="twitter_url"
                        type="url"
                        label="Twitter Profile URL"
                        value={profileData.twitter_url}
                        onChange={(e) => handleFieldChange('twitter_url', e.target.value)}
                      />
                    </div>

                    {/* YouTube */}
                    <div className="space-y-2">
                      <Label htmlFor="youtube_url">YouTube</Label>
                      <FloatingInput
                        id="youtube_url"
                        type="url"
                        label="YouTube Channel URL"
                        value={profileData.youtube_url}
                        onChange={(e) => handleFieldChange('youtube_url', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Footer Actions - Fixed at bottom */}
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t shadow-lg mt-6 -mx-6 px-6 py-4 flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 text-white shadow-lg font-semibold h-12"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                onClick={handleClose}
                disabled={isSaving}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 font-semibold h-12"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
