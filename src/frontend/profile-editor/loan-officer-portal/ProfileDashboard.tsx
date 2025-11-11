import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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
  id: string;
  display_name: string;
  email: string;
  avatar: string;
  job_title?: string;
  company?: string;
  location?: string;
  phone?: string;
  biolink_url?: string;
  biography?: string;
  nmls_id?: string;
  specialties_lo?: string[];
}

interface ProfileDashboardProps {
  userId: string;
  autoEdit?: boolean;
}

export function ProfileDashboard({ userId, autoEdit = false }: ProfileDashboardProps) {
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
        const nonce = (window as any).frsPortalData?.nonce || (window as any).frsPortalConfig?.restNonce || '';

        const response = await fetch(`/wp-json/frs/v1/users/me/person-profile`, {
          headers: {
            'X-WP-Nonce': nonce
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();

        // Map the person CPT data to our profile structure
        if (data.has_person_cpt) {
          const nameParts = data.name?.split(' ') || [];
          const mappedProfile = {
            id: userId,
            display_name: data.name || '',
            email: data.primary_business_email || '',
            avatar: data.headshot || '',
            job_title: data.job_title || '',
            company: '21st Century Lending',
            location: data.location || '',
            phone: data.phone_number || '',
            biolink_url: data.biolink_url || `${window.location.origin}/${nameParts[0]?.toLowerCase() || 'user'}`,
            biography: data.biography || '',
            nmls_id: data.nmls_id || '',
            specialties_lo: Array.isArray(data.specialties_lo) ? data.specialties_lo : []
          };
          setProfile(mappedProfile);
          setFormData(mappedProfile);
        } else {
          // Fallback to basic user data if no Person CPT
          setProfile({
            id: userId,
            display_name: data.display_name || '',
            email: data.user_email || '',
            avatar: data.avatar_url || '',
            job_title: '',
            company: '21st Century Lending',
            location: '',
            phone: '',
            biolink_url: '',
            biography: '',
            nmls_id: '',
            specialties_lo: []
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const nonce = (window as any).frsPortalConfig?.restNonce || '';
      const response = await fetch(`/wp-json/frs/v1/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
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
    if (profile?.biolink_url) {
      try {
        await navigator.clipboard.writeText(profile.biolink_url);
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
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
      <div className="text-center p-12">
        <p className="text-muted-foreground">No profile data available</p>
      </div>
    );
  }

  const gradientStyle = {
    background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)'
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header with gradient background - similar to biolink header */}
      <div
        className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={gradientStyle}
      >
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <Avatar className="size-32 border-4 border-white shadow-xl">
            <AvatarImage src={profile.avatar} alt={profile.display_name} />
            <AvatarFallback className="bg-white text-blue-600 text-3xl font-semibold">
              {profile.display_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name */}
        <h1 className="text-3xl font-bold text-white mb-2">
          {profile.display_name}
        </h1>

        {/* Email */}
        <div className="flex items-center justify-center gap-2 text-white/90 mb-2">
          <Mail className="size-4" />
          <span className="text-sm">{profile.email}</span>
        </div>

        {/* NMLS if available */}
        {profile.nmls_id && (
          <div className="flex items-center justify-center gap-2 text-white/90 mb-4">
            <Briefcase className="size-4" />
            <span className="text-sm">NMLS #{profile.nmls_id}</span>
          </div>
        )}

        {/* Job Title */}
        <p className="text-white/80 text-lg">
          {profile.job_title || 'Loan Officer'}
        </p>

        {/* Edit Button */}
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="mt-6 bg-white text-blue-600 hover:bg-white/90"
            size="lg"
          >
            <Edit className="size-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-800 text-sm font-medium">Profile updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm font-medium">{saveError}</p>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Job Title Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <User className="size-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Job Title</h3>
                {isEditing ? (
                  <Input
                    value={formData.job_title || ''}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    placeholder="e.g., Director of Lending"
                    className="mt-1"
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
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Phone className="size-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Phone Number</h3>
                {isEditing ? (
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {profile.phone || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <MapPin className="size-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Location</h3>
                {isEditing ? (
                  <Input
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Murrietta, CA"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {profile.location || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Building className="size-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Company</h3>
                {isEditing ? (
                  <Input
                    value={formData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Company name"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {profile.company || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biolink URL Card - Full Width */}
        <Card className="md:col-span-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Globe className="size-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Biolink URL</h3>
                  <ExternalLink className="size-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Globe className="size-4 text-blue-600 flex-shrink-0" />
                  <a
                    href={profile.biolink_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex-1 truncate font-medium"
                  >
                    {profile.biolink_url}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyBiolinkUrl}
                    className="flex-shrink-0 h-8 px-3 text-blue-600 hover:bg-blue-100"
                  >
                    <Copy className="size-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.open(profile.biolink_url, '_blank')}
                    className="flex-shrink-0 h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Open
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biography Card - Full Width */}
        <Card className="md:col-span-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Briefcase className="size-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Professional Biography</h3>
                {isEditing ? (
                  <Textarea
                    value={formData.biography || ''}
                    onChange={(e) => handleInputChange('biography', e.target.value)}
                    placeholder="Tell us about your experience and expertise..."
                    className="min-h-[120px]"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {profile.biography || 'No biography provided.'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specialties Card - Full Width */}
        <Card className="md:col-span-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Briefcase className="size-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties_lo && profile.specialties_lo.length > 0 ? (
                    profile.specialties_lo.map((specialty: string, index: number) => (
                      <Badge
                        key={index}
                        className="px-4 py-2 text-sm font-medium"
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
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            size="lg"
            className="px-6"
          >
            <X className="size-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="px-6 text-white"
            style={gradientStyle}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
