import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Copy,
  Edit,
  Loader2,
  User,
  Briefcase,
  Building,
  ExternalLink,
  Save,
  X
} from 'lucide-react';

interface ProfileData {
  biography: string;
  city_state: string;
  dre_license: string;
  email: string;
  facebook_url?: string;
  first_name: string;
  headshot_id?: number;
  headshot_url?: string;
  id: number;
  instagram_url?: string;
  job_title: string;
  last_name: string;
  license_number: string;
  linkedin_url?: string;
  mobile_number: string;
  nmls: string;
  nmls_number: string;
  office: string;
  phone_number: string;
  specialties?: string[];
  specialties_lo?: string[];
  tiktok_url?: string;
  twitter_url?: string;
  youtube_url?: string;
}

interface ProfileDashboardProps {
  autoEdit?: boolean;
  profileId: number;
  userId: number;
}

export function ProfileDashboard({ autoEdit = false, profileId, userId }: ProfileDashboardProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const nonce = (window as any).wpApiSettings?.nonce || '';

        const response = await fetch(`/wp-json/frs-users/v1/profiles/${profileId}`, {
          headers: {
            'X-WP-Nonce': nonce
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const result = await response.json();
        const data = result.data || result;

        setProfile(data);
        setFormData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const nonce = (window as any).wpApiSettings?.nonce || '';
      const response = await fetch(`/wp-json/frs-users/v1/profiles/${profileId}`, {
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        method: 'PUT'
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      const updatedData = result.data || result;
      setProfile(updatedData);
      setIsEditing(false);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData(profile);
    }
    setIsEditing(false);
    setSaveError(null);
  };

  const copyBiolinkUrl = async () => {
    const biolink_url = `${window.location.origin}/${profile?.first_name?.toLowerCase() || 'user'}`;
    try {
      await navigator.clipboard.writeText(biolink_url);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">No profile data available</p>
      </div>
    );
  }

  const gradientStyle = {
    background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)'
  };

  const display_name = `${profile.first_name} ${profile.last_name}`;
  const biolink_url = `${window.location.origin}/${profile.first_name?.toLowerCase() || 'user'}`;

  return (
    <div className="space-y-4 p-4">
      {/* Header with gradient background - similar to biolink header */}
      <div
        className="relative overflow-hidden rounded-2xl p-8 text-center"
        style={gradientStyle}
      >
        {/* Avatar */}
        <div className="mb-4 flex justify-center">
          <Avatar className="size-32 border-4 border-white shadow-xl">
            <AvatarImage alt={display_name} src={profile.headshot_url} />
            <AvatarFallback className="bg-white text-3xl font-semibold text-blue-600">
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name */}
        <h1 className="mb-2 text-3xl font-bold text-white">
          {display_name}
        </h1>

        {/* Email */}
        <div className="mb-2 flex items-center justify-center gap-2 text-white/90">
          <Mail className="size-4" />
          <span className="text-sm">{profile.email}</span>
        </div>

        {/* NMLS if available */}
        {(profile.nmls || profile.nmls_number) && (
          <div className="mb-4 flex items-center justify-center gap-2 text-white/90">
            <Briefcase className="size-4" />
            <span className="text-sm">NMLS #{profile.nmls || profile.nmls_number}</span>
          </div>
        )}

        {/* Job Title */}
        <p className="text-lg text-white/80">
          {profile.job_title || 'Loan Officer'}
        </p>

        {/* Edit Button */}
        {!isEditing && (
          <Button
            className="mt-6 bg-white text-blue-600 hover:bg-white/90"
            onClick={() => setIsEditing(true)}
            size="lg"
          >
            <Edit className="mr-2 size-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">Profile updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {saveError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{saveError}</p>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Job Title Card */}
        <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gray-100 p-2">
                <User className="size-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-sm font-semibold text-gray-900">Job Title</h3>
                {isEditing ? (
                  <Input
                    className="mt-1"
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    placeholder="e.g., Director of Lending"
                    value={formData.job_title || ''}
                  />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {profile.job_title || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phone Number Card */}
        <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gray-100 p-2">
                <Phone className="size-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-sm font-semibold text-gray-900">Phone Number</h3>
                {isEditing ? (
                  <Input
                    className="mt-1"
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="(555) 123-4567"
                    value={formData.phone_number || ''}
                  />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {profile.phone_number || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gray-100 p-2">
                <MapPin className="size-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-sm font-semibold text-gray-900">Location</h3>
                {isEditing ? (
                  <Input
                    className="mt-1"
                    onChange={(e) => handleInputChange('city_state', e.target.value)}
                    placeholder="e.g., Murrietta, CA"
                    value={formData.city_state || ''}
                  />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {profile.city_state || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Card */}
        <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gray-100 p-2">
                <Building className="size-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-sm font-semibold text-gray-900">Company</h3>
                {isEditing ? (
                  <Input
                    className="mt-1"
                    onChange={(e) => handleInputChange('office', e.target.value)}
                    placeholder="Company name"
                    value={formData.office || ''}
                  />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {profile.office || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biolink URL Card - Full Width */}
        <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Globe className="size-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Biolink URL</h3>
                  <ExternalLink className="size-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <Globe className="size-4 shrink-0 text-blue-600" />
                  <a
                    className="flex-1 truncate text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    href={biolink_url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {biolink_url}
                  </a>
                  <Button
                    className="h-8 shrink-0 px-3 text-blue-600 hover:bg-blue-100"
                    onClick={copyBiolinkUrl}
                    size="sm"
                    variant="ghost"
                  >
                    <Copy className="mr-1 size-4" />
                    Copy
                  </Button>
                  <Button
                    className="h-8 shrink-0 bg-blue-600 px-3 text-white hover:bg-blue-700"
                    onClick={() => window.open(biolink_url, '_blank')}
                    size="sm"
                  >
                    Open
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biography Card - Full Width */}
        <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gray-100 p-2">
                <Briefcase className="size-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Professional Biography</h3>
                {isEditing ? (
                  <Textarea
                    className="min-h-[120px]"
                    onChange={(e) => handleInputChange('biography', e.target.value)}
                    placeholder="Tell us about your experience and expertise..."
                    value={formData.biography || ''}
                  />
                ) : (
                  <p className="leading-relaxed text-gray-700">
                    {profile.biography || 'No biography provided.'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specialties Card - Full Width */}
        <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gray-100 p-2">
                <Briefcase className="size-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties_lo && profile.specialties_lo.length > 0 ? (
                    profile.specialties_lo.map((specialty: string, index: number) => (
                      <Badge
                        className="px-4 py-2 text-sm font-medium"
                        key={index}
                        style={gradientStyle}
                      >
                        {specialty}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">No specialties added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Mode Action Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3 pt-4">
          <Button
            className="px-6"
            disabled={isSaving}
            onClick={handleCancel}
            size="lg"
            variant="outline"
          >
            <X className="mr-2 size-4" />
            Cancel
          </Button>
          <Button
            className="px-6 text-white"
            disabled={isSaving}
            onClick={handleSave}
            size="lg"
            style={gradientStyle}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
