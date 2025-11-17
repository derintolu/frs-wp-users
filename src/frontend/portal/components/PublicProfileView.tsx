import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { FloatingInput } from '@/components/ui/floating-input';
import QRCodeStyling from 'qr-code-styling';
import {
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckSquare,
  User,
  QrCode,
  Camera,
  Save,
  X,
  Globe,
  Linkedin,
  Facebook,
  Smartphone,
  Edit,
  Link2,
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { parseServiceAreaForState } from '@/frontend/portal/utils/stateUtils';
import { useProfileEdit } from '@/frontend/portal/contexts/ProfileEditContext';

interface ProfileData {
  id: number;
  first_name: string;
  last_name: string;
  display_name?: string;
  email: string;
  phone_number?: string;
  mobile_number?: string;
  job_title?: string;
  headshot_url?: string;
  biography?: string;
  nmls_number?: string;
  nmls?: string;
  license_number?: string;
  dre_license?: string;
  specialties_lo?: string[];
  namb_certifications?: string[];
  service_areas?: string[];
  city_state?: string;
  region?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  website?: string;
  arrive?: string;
  brand?: string;
  office?: string;
  profile_slug?: string;
}

interface PublicProfileViewProps {
  userId?: string;
  slug?: string;
}

export function PublicProfileView({ userId, slug }: PublicProfileViewProps) {
  const { activeSection, setActiveSection, setIsSaving: setContextSaving, setHandleSave, setHandleCancel } = useProfileEdit();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [serviceAreaInput, setServiceAreaInput] = useState('');
  const [customLinkInput, setCustomLinkInput] = useState({ title: '', url: '' });

  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Check which section is being edited
  const isEditingPersonal = activeSection === 'personal';
  const isEditingProfessional = activeSection === 'professional';
  const isEditingSocial = activeSection === 'social';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('[PublicProfileView] Starting fetch with:', { userId, slug });

        // Determine API URL based on what's provided
        let apiUrl;
        if (slug) {
          // Public profile - fetch by slug
          apiUrl = `/wp-json/frs-users/v1/profiles/slug/${slug}`;
        } else if (userId) {
          // Portal profile - fetch by user ID
          apiUrl = `/wp-json/frs-users/v1/profiles/user/${userId}`;
        } else {
          throw new Error('No slug or user ID provided');
        }

        console.log('[PublicProfileView] Fetching from:', apiUrl);

        const response = await fetch(apiUrl, {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPublicProfileConfig?.restNonce || (window as any).frsPortalConfig?.restNonce || ''
          }
        });

        console.log('[PublicProfileView] Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[PublicProfileView] API Error:', errorText);
          throw new Error(`Failed to load profile: ${response.status}`);
        }

        const result = await response.json();
        console.log('[PublicProfileView] API Response:', result);

        const profileData = result.data || result;
        console.log('[PublicProfileView] Setting profile data:', profileData);

        setProfile(profileData);
        setOriginalProfile(profileData); // Save original for cancel functionality
      } catch (err) {
        console.error('[PublicProfileView] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, slug]);

  // Generate V-Card
  const generateVCard = () => {
    if (!profile) return;

    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.first_name} ${profile.last_name}`,
      `N:${profile.last_name};${profile.first_name};;;`,
      profile.job_title ? `TITLE:${profile.job_title}` : '',
      profile.office || profile.brand ? `ORG:${profile.office || profile.brand || '21st Century Lending'}` : 'ORG:21st Century Lending',
      profile.email ? `EMAIL:${profile.email}` : '',
      profile.phone_number ? `TEL;TYPE=WORK,VOICE:${profile.phone_number}` : '',
      profile.mobile_number ? `TEL;TYPE=CELL:${profile.mobile_number}` : '',
      profile.city_state ? `ADR;TYPE=WORK:;;${profile.city_state};;;;` : '',
      profile.website ? `URL:${profile.website}` : '',
      profile.linkedin_url ? `X-SOCIALPROFILE;TYPE=linkedin:${profile.linkedin_url}` : '',
      profile.biography ? `NOTE:${profile.biography.replace(/\n/g, '\\n')}` : '',
      'END:VCARD'
    ].filter(line => line !== '').join('\r\n');

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.first_name}_${profile.last_name}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate QR Code
  useEffect(() => {
    if (qrCodeRef.current && profile) {
      qrCodeRef.current.innerHTML = '';

      const siteUrl = window.location.origin;
      // Point to the actual profile page - use slug prop, profile_slug field, or construct from name
      const profileSlug = slug || (profile as any).profile_slug || `${profile.first_name?.toLowerCase()}-${profile.last_name?.toLowerCase()}`;
      const profileUrl = `${siteUrl}/profile/${profileSlug}`;

      const qrSize = 100;

      try {
        const qrCode = new QRCodeStyling({
          type: 'canvas',
          shape: 'square',
          width: qrSize,
          height: qrSize,
          data: profileUrl,
          margin: 0,
          qrOptions: {
            typeNumber: 0,
            mode: 'Byte',
            errorCorrectionLevel: 'L'
          },
          dotsOptions: {
            type: 'extra-rounded',
            roundSize: true,
            gradient: {
              type: 'linear',
              rotation: 0,
              colorStops: [
                { offset: 0, color: '#2563eb' },
                { offset: 1, color: '#2dd4da' }
              ]
            }
          },
          backgroundOptions: {
            color: '#ffffff'
          },
          cornersSquareOptions: {
            type: 'extra-rounded',
            gradient: {
              type: 'linear',
              rotation: 0,
              colorStops: [
                { offset: 0, color: '#2563ea' },
                { offset: 1, color: '#2dd4da' }
              ]
            }
          },
          cornersDotOptions: {
            type: '',
            gradient: {
              type: 'linear',
              rotation: 0,
              colorStops: [
                { offset: 0, color: '#2dd4da' },
                { offset: 1, color: '#2563e9' }
              ]
            }
          }
        });

        qrCode.append(qrCodeRef.current);

        setTimeout(() => {
          const canvas = qrCodeRef.current?.querySelector('canvas');
          if (canvas) {
            canvas.style.width = qrSize + 'px';
            canvas.style.height = qrSize + 'px';
            canvas.style.maxWidth = qrSize + 'px';
            canvas.style.maxHeight = qrSize + 'px';
          }
        }, 100);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    }
  }, [profile, showQRCode, slug]);

  // Register save and cancel handlers with context
  useEffect(() => {
    if (activeSection === 'personal' || activeSection === 'professional' || activeSection === 'social') {
      // Determine success message based on section
      const successMessages: Record<string, string> = {
        'personal': 'Personal information saved successfully!',
        'professional': 'Professional details saved successfully!',
        'social': 'Links & social media saved successfully!'
      };

      // Save handler
      setHandleSave(() => async () => {
        if (!profile) {
          console.error('No profile data to save');
          return;
        }

        console.log('Saving profile data:', profile);
        console.log('Service areas:', profile.service_areas);

        setIsSaving(true);
        setContextSaving(true);
        setError(null);

        try {
          const response = await fetch(`/wp-json/frs-users/v1/profiles/${profile.id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || ''
            },
            body: JSON.stringify(profile)
          });

          console.log('Response status:', response.status);

          if (response.ok) {
            const result = await response.json();
            console.log('Save result:', result);
            const updatedProfile = result.data || result;
            setProfile(updatedProfile);
            setOriginalProfile(updatedProfile); // Update original after successful save
            setActiveSection(null); // Exit edit mode

            const successMsg = document.createElement('div');
            successMsg.className = 'fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            successMsg.textContent = successMessages[activeSection] || 'Profile saved successfully!';
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 3000);
          } else {
            const errorData = await response.json();
            console.error('Save failed:', errorData);
            const errorMsg = document.createElement('div');
            errorMsg.className = 'fixed top-20 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            errorMsg.textContent = errorData.message || 'Failed to save profile changes';
            document.body.appendChild(errorMsg);
            setTimeout(() => errorMsg.remove(), 5000);
            setError(errorData.message || 'Failed to save profile changes');
          }
        } catch (error) {
          console.error('Failed to save profile:', error);
          const errorMsg = document.createElement('div');
          errorMsg.className = 'fixed top-20 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
          errorMsg.textContent = 'Network error - please try again';
          document.body.appendChild(errorMsg);
          setTimeout(() => errorMsg.remove(), 5000);
          setError('Failed to save profile changes');
        } finally {
          setIsSaving(false);
          setContextSaving(false);
        }
      });

      // Cancel handler
      setHandleCancel(() => () => {
        if (originalProfile) {
          setProfile(originalProfile); // Restore original data
        }
        setActiveSection(null); // Exit edit mode
        setError(null);
      });
    } else {
      // Clear handlers when section is not active
      setHandleSave(null);
      setHandleCancel(null);
    }
  }, [activeSection, profile, originalProfile, setHandleSave, setHandleCancel, setActiveSection, setContextSaving]);

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/wp-json/frs-users/v1/profiles/${profile.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || ''
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        setIsEditing(false);
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMsg.textContent = 'Profile saved successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
      } else {
        setError('Failed to save profile changes');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      setError('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="@container w-full max-w-[1290px] mx-auto px-4 py-6 animate-pulse">
        {/* Two Column Layout Skeleton */}
        <div className="grid grid-cols-1 @lg:!grid-cols-[65%,35%] gap-4 mb-4">
          {/* Profile Card Skeleton */}
          <div className="bg-white shadow-lg rounded border border-gray-200 p-8">
            {/* Header background */}
            <div className="h-[149px] bg-gradient-to-r from-blue-500 to-cyan-500 -mx-8 -mt-8 mb-4 rounded-t"></div>

            {/* Avatar skeleton */}
            <div className="w-[156px] h-[156px] bg-gray-300 rounded-full mx-auto @lg:mx-0 mb-4"></div>

            {/* Name skeleton */}
            <div className="h-10 bg-gray-300 rounded w-3/4 mb-4"></div>

            {/* Details skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>

            {/* Contact skeleton */}
            <div className="flex gap-4 mb-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-4">
            {/* Action Buttons Skeleton */}
            <div className="bg-white shadow-lg rounded border border-gray-200 p-6">
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Service Areas Skeleton */}
            <div className="bg-white shadow-lg rounded border border-gray-200 p-6">
              <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Biography Row Skeleton */}
        <div className="grid grid-cols-1 @lg:!grid-cols-[65%,35%] gap-4 mb-4">
          <div className="bg-white shadow-lg rounded border border-gray-200 p-6">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded border border-gray-200 p-6">
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const phoneNumber = profile.phone_number || profile.mobile_number;
  const gradientUrl = (window as any).frsPublicProfileConfig?.gradientUrl || (window as any).frsPortalConfig?.gradientUrl || (window as any).frsSidebarData?.gradientUrl || '';

  // Get content URL for custom icons
  const contentUrl = (window as any).frsPublicProfileConfig?.contentUrl || (window as any).frsPortalConfig?.contentUrl || '/wp-content';
  const iconPath = `${contentUrl}/plugins/frs-lrg/assets/images`;

  console.log('[PublicProfileView] gradientUrl:', gradientUrl);
  console.log('[PublicProfileView] contentUrl:', contentUrl);

  return (
    <div
      className="@container w-full max-w-[1290px] mx-auto px-4 py-6 animate-in fade-in duration-500"
      style={{
        opacity: loading ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out'
      }}
    >
      {/* Two Column Layout: Profile Card + Links & Social */}
      <div className="grid grid-cols-1 @lg:!grid-cols-[65%,35%] gap-4 mb-4">
        {/* Profile Card */}
        <Card className="@container shadow-lg max-md:rounded-none @lg:rounded border border-gray-200 h-full">
          <div
            className="p-8 relative overflow-hidden"
            style={{
              background: '#F4F4F5',
            }}
          >
            {/* Gradient Video Background - Blurred */}
            <div className="absolute top-0 left-0 right-0 w-full overflow-hidden" style={{ height: '149px' }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{
                  filter: 'blur(30px)',
                  transform: 'scale(1.2)'
                }}
              >
                <source src={gradientUrl} type="video/mp4" />
              </video>
            </div>

            {/* Avatar with Gradient Border - Flip Card */}
            <div className="mb-4 relative z-10 mx-auto @lg:!mx-0" style={{ perspective: '1000px', width: '156px' }}>
              <div
                className="relative transition-transform duration-700"
                style={{
                  width: '156px',
                  height: '156px',
                  transformStyle: 'preserve-3d',
                  transform: showQRCode ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front Side - Avatar */}
                <div
                  className="absolute inset-0 rounded-full overflow-visible"
                  style={{
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <div
                    className="w-full h-full rounded-full overflow-hidden"
                    style={{
                      border: '3px solid transparent',
                      backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                      backgroundOrigin: 'padding-box, border-box',
                      backgroundClip: 'padding-box, border-box',
                    }}
                  >
                    {profile.headshot_url ? (
                      <img src={profile.headshot_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-3xl text-gray-600 font-semibold">
                          {(profile.first_name?.[0] || '?')}{(profile.last_name?.[0] || '')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* QR Code button - flips with avatar, shows QR icon */}
                  <Button
                    size="sm"
                    className="absolute rounded-full w-10 h-10 p-0 bg-transparent hover:bg-transparent shadow-lg z-20 border-0"
                    style={{ top: '10px', right: '-5px' }}
                    onClick={() => setShowQRCode(!showQRCode)}
                    type="button"
                  >
                    <img src={`${iconPath}/Button.svg`} alt="QR Code" className="w-9 h-9" />
                  </Button>
                </div>

                {/* Back Side - QR Code */}
                <div
                  className="absolute inset-0 rounded-full overflow-visible"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div
                    className="w-full h-full rounded-full overflow-hidden"
                    style={{
                      border: '3px solid transparent',
                      backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                      backgroundOrigin: 'padding-box, border-box',
                      backgroundClip: 'padding-box, border-box',
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-white p-5">
                      <div
                        ref={qrCodeRef}
                        style={{
                          width: '130px',
                          height: '130px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      />
                    </div>
                  </div>

                  {/* Avatar button - flips with QR code, shows User icon */}
                  <Button
                    size="sm"
                    className="absolute rounded-full w-10 h-10 p-0 bg-black text-white hover:bg-gray-900 shadow-lg z-20"
                    style={{
                      top: '10px',
                      right: '-5px',
                      transform: 'scaleX(-1)' // Flip button content back so icon is readable
                    }}
                    onClick={() => setShowQRCode(!showQRCode)}
                    type="button"
                  >
                    <User className="h-5 w-5" style={{ transform: 'scaleX(-1)' }} />
                  </Button>
                </div>

                {/* Camera button - overlaps avatar at 10 o'clock (only when editing personal info) */}
                {isEditingPersonal && (
                  <>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle avatar upload
                          console.log('Upload avatar:', file);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      className="absolute rounded-full w-10 h-10 p-0 bg-black text-white hover:bg-gray-900 shadow-lg z-20"
                      style={{ top: '10px', left: '-5px' }}
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      type="button"
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Old Save/Cancel Buttons - REMOVED - Now in sidebar */}

            {/* Name */}
            {isEditingPersonal ? (
              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <FloatingInput
                  id="firstName-profile"
                  label="First Name"
                  value={profile.first_name}
                  onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                  className="bg-white/90"
                />
                <FloatingInput
                  id="lastName-profile"
                  label="Last Name"
                  value={profile.last_name}
                  onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                  className="bg-white/90"
                />
              </div>
            ) : (
              <div className="flex flex-col @lg:!flex-row items-center @lg:!items-start justify-center @lg:!justify-between mb-2 relative z-10 gap-4 text-center @lg:!text-left">
                <h3 className="text-[34px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Mona Sans Extended, sans-serif' }}>
                  {fullName}
                </h3>
                <Button
                  asChild
                  className="hidden @lg:!inline-flex text-white font-semibold px-6 py-2 shadow-lg whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  }}
                >
                  <a href={profile.arrive || '#'} target="_blank" rel="noopener noreferrer">
                    Apply Now
                  </a>
                </Button>
              </div>
            )}

            {/* Job Title, NMLS, and Location */}
            {!isEditingPersonal && (
              <div className="mb-4 relative z-10">
                <p className="text-base text-[#1D4FC4] flex flex-col @lg:!flex-row items-center @lg:!items-start justify-center @lg:!justify-start gap-2 @lg:!gap-6 text-center @lg:!text-left" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <span>
                    {profile.job_title || 'Loan Officer'}
                    {(profile.nmls || profile.nmls_number) && <span> | NMLS {profile.nmls || profile.nmls_number}</span>}
                  </span>
                  {profile.city_state && (
                    <span className="flex items-center justify-center @lg:!justify-start gap-2">
                      <MapPin className="h-4 w-4" />
                      {profile.city_state}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Social Media Icons Row */}
            {!isEditingPersonal && (profile.linkedin_url || profile.facebook_url || profile.instagram_url || profile.twitter_url || profile.youtube_url || profile.website) && (
              <div className="flex items-center justify-center @lg:!justify-start gap-3 mb-4 relative z-10">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                  </a>
                )}
                {profile.facebook_url && (
                  <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                  </a>
                )}
                {profile.instagram_url && (
                  <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer">
                    <Smartphone className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                  </a>
                )}
                {profile.twitter_url && (
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                  </a>
                )}
                {profile.youtube_url && (
                  <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                  </a>
                )}
              </div>
            )}

            {/* Contact Information - Always visible */}
            {!isEditingPersonal && (
              <div className="flex flex-col @lg:!flex-row items-center @lg:!items-start justify-center @lg:!justify-start gap-2 @lg:!gap-6 mb-6 relative z-10">
                {profile.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <img src={`${iconPath}/Email.svg`} alt="Email" className="w-6 h-6" />
                    <a href={`mailto:${profile.email}`} className="hover:text-[#1D4FC4] transition-colors">
                      {profile.email}
                    </a>
                  </div>
                )}
                {phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <img src={`${iconPath}/Phne.svg`} alt="Phone" className="w-6 h-6" />
                    <a href={`tel:${phoneNumber}`} className="hover:text-[#1D4FC4] transition-colors">
                      {phoneNumber}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Mobile only: Apply Now Button - Centered at bottom */}
            {!isEditingPersonal && (
              <div className="@lg:!hidden flex justify-center relative z-10">
                <Button
                  asChild
                  className="text-white font-semibold px-12 py-3 shadow-lg text-lg rounded-lg w-full"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  }}
                >
                  <a href={profile.arrive || '#'} target="_blank" rel="noopener noreferrer">
                    Apply Now
                  </a>
                </Button>
              </div>
            )}

            {/* Edit Mode Fields - Personal Information */}
            {isEditingPersonal && (
              <div className="space-y-4 relative z-10">
                <FloatingInput
                  id="display-name-profile"
                  label="Display Name"
                  value={profile.display_name || ''}
                  onChange={(e) => setProfile({...profile, display_name: e.target.value})}
                  className="bg-white/90"
                />
                <FloatingInput
                  id="email-profile"
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="bg-white/90"
                />
                <FloatingInput
                  id="phone-profile"
                  label="Phone"
                  type="tel"
                  value={phoneNumber || ''}
                  onChange={(e) => setProfile({...profile, phone_number: e.target.value})}
                  className="bg-white/90"
                />
                <FloatingInput
                  id="title-edit"
                  label="Job Title"
                  value={profile.job_title || ''}
                  onChange={(e) => setProfile({...profile, job_title: e.target.value})}
                  className="bg-white/90"
                />
                <FloatingInput
                  id="location-edit"
                  label="Location"
                  value={profile.city_state || ''}
                  onChange={(e) => setProfile({...profile, city_state: e.target.value})}
                  className="bg-white/90"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Action Buttons + Service Areas */}
        <div className="space-y-4 h-full flex flex-col" style={{ backgroundColor: 'white' }}>
          {/* Action Buttons Card */}
          {!isEditingPersonal && (
            <Card className="@container shadow-lg rounded-sm border border-gray-200">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    onClick={generateVCard}
                    className="font-semibold px-6 py-2 shadow-lg whitespace-nowrap bg-white hover:bg-gray-50 transition-all border-0 relative overflow-hidden w-full"
                    style={{
                      backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                      backgroundOrigin: 'padding-box, border-box',
                      backgroundClip: 'padding-box, border-box',
                      border: '2px solid transparent',
                    }}
                  >
                    <span
                      className="font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      Save to Contacts
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="font-semibold px-6 py-2 shadow-lg whitespace-nowrap bg-white hover:bg-gray-50 transition-all border-0 relative overflow-hidden w-full"
                    style={{
                      backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                      backgroundOrigin: 'padding-box, border-box',
                      backgroundClip: 'padding-box, border-box',
                      border: '2px solid transparent',
                    }}
                  >
                    <span
                      className="font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      Schedule Meeting
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="font-semibold px-6 py-2 shadow-lg whitespace-nowrap bg-white hover:bg-gray-50 transition-all border-0 relative overflow-hidden w-full"
                    style={{
                      backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                      backgroundOrigin: 'padding-box, border-box',
                      backgroundClip: 'padding-box, border-box',
                      border: '2px solid transparent',
                    }}
                  >
                    <span
                      className="font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      Call Me
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service Areas Card */}
          <Card className="@container shadow-lg rounded-sm border border-gray-200 flex-1" style={{ backgroundColor: 'white' }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
                <MapPin className="h-5 w-5" />
                Service Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 py-3">
              {/* Service Areas editing will be implemented in Professional Details section */}
              {isEditingProfessional ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <FloatingInput
                      id="service-state"
                      label="State"
                      value={serviceAreaInput}
                      onChange={(e) => setServiceAreaInput(e.target.value)}
                      className="bg-white flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => {
                        if (serviceAreaInput.trim() !== '') {
                          setProfile({
                            ...profile,
                            service_areas: [...(profile.service_areas || []), serviceAreaInput.trim()]
                          });
                          setServiceAreaInput('');
                        }
                      }}
                      className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                  </div>
                  {profile.service_areas && profile.service_areas.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">States Added</Label>
                      <div className="flex flex-wrap gap-2">
                        {profile.service_areas.map((area: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                            {area}
                            <button
                              onClick={() => {
                                setProfile({
                                  ...profile,
                                  service_areas: profile.service_areas?.filter((_: string, i: number) => i !== index)
                                });
                              }}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {profile.service_areas && profile.service_areas.length > 0 ? (
                    profile.service_areas.map((area: string, index: number) => {
                      const stateInfo = parseServiceAreaForState(area);

                      if (stateInfo) {
                        // Display as state card with SVG
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center justify-center pt-2 pb-3 px-2 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer aspect-square"
                          >
                            <img
                              src={stateInfo.svgUrl}
                              alt={stateInfo.abbr}
                              className="w-16 h-16 mb-1 object-contain"
                            />
                            <span className="text-sm font-semibold text-gray-700">{stateInfo.abbr}</span>
                          </div>
                        );
                      }

                      // Fallback for non-state service areas (cities, zip codes, etc.)
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center justify-center pt-2 pb-3 px-2 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all aspect-square"
                        >
                          <MapPin className="w-12 h-12 mb-1 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700 text-center break-words">{area}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 italic col-span-4">No service areas specified.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Second Row: Biography + Specialties & Credentials */}
      <div className="grid grid-cols-1 @lg:!grid-cols-[65%,35%] gap-4 mb-4">
        {/* Biography Card */}
        <Card className="@container shadow-lg rounded-sm border border-gray-200 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
            <FileText className="h-5 w-5" />
            Professional Biography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Biography editing will be implemented in Professional Details section */}
          {isEditingProfessional ? (
            <RichTextEditor
              value={profile.biography || ''}
              onChange={(value) => setProfile({...profile, biography: value})}
              placeholder="Share your professional background..."
            />
          ) : (
            <div
              className="text-sm text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: profile.biography || '<p class="text-gray-500 italic">No biography provided.</p>' }}
            />
          )}
        </CardContent>
      </Card>

        {/* Specialties & Credentials Card */}
        <Card className="@container shadow-lg rounded-sm border border-gray-200 h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
              <CheckSquare className="h-5 w-5" />
              Specialties & Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {/* Loan Officer Specialties */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Loan Officer Specialties</Label>
            {/* Specialties editing will be implemented in Professional Details section */}
            {isEditingProfessional ? (
              <div className="grid grid-cols-1 @lg:grid-cols-3 gap-2">
                {[
                  'Residential Mortgages',
                  'Consumer Loans',
                  'VA Loans',
                  'FHA Loans',
                  'Jumbo Loans',
                  'Construction Loans',
                  'Investment Property',
                  'Reverse Mortgages',
                  'USDA Rural Loans',
                  'Bridge Loans'
                ].map((specialty) => (
                  <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.specialties_lo?.includes(specialty) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProfile({
                            ...profile,
                            specialties_lo: [...(profile.specialties_lo || []), specialty]
                          });
                        } else {
                          setProfile({
                            ...profile,
                            specialties_lo: profile.specialties_lo?.filter(s => s !== specialty)
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{specialty}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.specialties_lo && profile.specialties_lo.length > 0 ? (
                  profile.specialties_lo.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">No specialties selected</p>
                )}
              </div>
            )}
          </div>

          {/* NAMB Certifications */}
          <div>
            <Label className="text-sm font-medium mb-2 block">NAMB Certifications</Label>
            {/* Certifications editing will be implemented in Professional Details section */}
            {isEditingProfessional ? (
              <div className="grid grid-cols-1 @lg:grid-cols-3 gap-2">
                {[
                  'CMC - Certified Mortgage Consultant',
                  'CRMS - Certified Residential Mortgage Specialist',
                  'GMA - General Mortgage Associate',
                  'CVLS - Certified Veterans Lending Specialist'
                ].map((cert) => (
                  <label key={cert} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.namb_certifications?.includes(cert) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProfile({
                            ...profile,
                            namb_certifications: [...(profile.namb_certifications || []), cert]
                          });
                        } else {
                          setProfile({
                            ...profile,
                            namb_certifications: profile.namb_certifications?.filter(c => c !== cert)
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{cert}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.namb_certifications && profile.namb_certifications.length > 0 ? (
                  profile.namb_certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                      {cert}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">No certifications selected</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Third Row: Custom Links + Links & Social */}
      <div className="grid grid-cols-1 @lg:!grid-cols-[65%,35%] gap-4 mb-4">
        {/* Custom Links Card */}
        <Card className="@container shadow-lg rounded-sm border border-gray-200 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
            <Link2 className="h-5 w-5" />
            Custom Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isEditingSocial ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <FloatingInput
                  id="link-title"
                  label="Link Title"
                  value={customLinkInput.title}
                  onChange={(e) => setCustomLinkInput({...customLinkInput, title: e.target.value})}
                  className="bg-white"
                />
                <div className="flex gap-2">
                  <FloatingInput
                    id="link-url"
                    label="URL"
                    type="url"
                    value={customLinkInput.url}
                    onChange={(e) => setCustomLinkInput({...customLinkInput, url: e.target.value})}
                    className="bg-white flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => {
                      if (customLinkInput.title.trim() !== '' && customLinkInput.url.trim() !== '') {
                        setProfile({
                          ...profile,
                          custom_links: [...(profile.custom_links || []), {
                            title: customLinkInput.title.trim(),
                            url: customLinkInput.url.trim()
                          }]
                        });
                        setCustomLinkInput({ title: '', url: '' });
                      }
                    }}
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              {profile.custom_links && profile.custom_links.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Links Added</Label>
                  <div className="space-y-2">
                    {profile.custom_links.map((link: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded border border-gray-200 bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{link.title}</p>
                          <p className="text-xs text-gray-500 truncate">{link.url}</p>
                        </div>
                        <button
                          onClick={() => {
                            setProfile({
                              ...profile,
                              custom_links: profile.custom_links?.filter((_: any, i: number) => i !== index)
                            });
                          }}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {profile.custom_links && Array.isArray(profile.custom_links) && profile.custom_links.length > 0 ? (
                profile.custom_links.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {link.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {link.url}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
                  </a>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-4">No custom links added yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

        {/* Links & Social Card */}
        <Card className="@container shadow-lg rounded-sm border border-gray-200 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
              <Globe className="h-5 w-5" />
              Links & Social
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 py-3">
            <div className="grid grid-cols-2 gap-2">
              {/* Links & Social editing will be implemented in Social Media section */}
              {isEditingSocial ? (
                <>
                  <FloatingInput
                    id="website"
                    label="Website"
                    type="url"
                    value={profile.website || ''}
                    onChange={(e) => setProfile({...profile, website: e.target.value})}
                  />
                  <FloatingInput
                    id="linkedin"
                    label="LinkedIn"
                    type="url"
                    value={profile.linkedin_url || ''}
                    onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})}
                  />
                  <FloatingInput
                    id="facebook"
                    label="Facebook"
                    type="url"
                    value={profile.facebook_url || ''}
                    onChange={(e) => setProfile({...profile, facebook_url: e.target.value})}
                  />
                  <FloatingInput
                    id="instagram"
                    label="Instagram"
                    type="url"
                    value={profile.instagram_url || ''}
                    onChange={(e) => setProfile({...profile, instagram_url: e.target.value})}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-2 rounded border">
                    <Globe className="h-4 w-4 text-gray-600" />
                    <span className="text-xs truncate">{profile.website || 'Website'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border">
                    <Linkedin className="h-4 w-4 text-gray-600" />
                    <span className="text-xs truncate">{profile.linkedin_url || 'LinkedIn'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border">
                    <Facebook className="h-4 w-4 text-gray-600" />
                    <span className="text-xs truncate">{profile.facebook_url || 'Facebook'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border">
                    <Smartphone className="h-4 w-4 text-gray-600" />
                    <span className="text-xs truncate">{profile.instagram_url || 'Instagram'}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
    </div>
  </div>
  );
}
