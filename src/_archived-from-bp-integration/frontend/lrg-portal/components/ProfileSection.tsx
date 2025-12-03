import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FloatingInput } from './ui/floating-input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
// Avatar components removed - using simple div implementations
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import QRCodeStyling from 'qr-code-styling';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Camera,
  Upload,
  Edit,
  Save,
  X,
  Globe,
  Linkedin,
  Facebook,
  Settings,
  Shield,
  Bell,
  FileText,
  ExternalLink,
  CheckSquare,
  Link,
  Smartphone,
  QrCode
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LoadingSpinner } from './ui/loading';
import { DataService } from '../utils/dataService';
import { ProfileTour, TourTrigger } from './ProfileTour';
import { RichTextEditor } from './ui/RichTextEditor';
import { BookingCalendarCard, LandingPagesCard, BrandGuideCard, PrintSocialMediaCard } from './features';
import { WelcomeBento } from './loan-officer-portal/WelcomeBento';
import { LeadTracking } from './loan-officer-portal/LeadTracking';
import { MortgageCalculator } from './loan-officer-portal/MortgageCalculator';
import { Settings } from './loan-officer-portal/Settings';
import { ProfileCompletionSection } from './loan-officer-portal/ProfileCompletionSection';

// Read-only field display component
const ReadOnlyField = ({ icon: Icon, value, label }: { icon: any, value: string, label?: string }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md border">
    <Icon className="h-4 w-4 text-[var(--brand-slate)] flex-shrink-0" />
    <span className="text-[var(--brand-dark-navy)]">{value}</span>
  </div>
);

const ReadOnlyTextarea = ({ icon: Icon, value }: { icon: any, value: string }) => (
  <div className="flex items-start space-x-3 py-2">
    <Icon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
    <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">{value}</div>
  </div>
);

interface ProfileSectionProps {
  userRole: 'loan-officer' | 'realtor';
  userId: string;
  autoEdit?: boolean;
  tourAttributes?: {
    announcements?: string;
    profileSummary?: string;
  };
}

export function ProfileSection({ userRole, userId, autoEdit = false, tourAttributes }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [serviceAreaInput, setServiceAreaInput] = useState({
    city: '',
    state: '',
    zip: ''
  });

  // Update editing state when autoEdit prop changes
  useEffect(() => {
    setIsEditing(autoEdit);
  }, [autoEdit]);

  // User profile data - initialize with empty values, load from WordPress
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobileNumber: '',
    title: '',
    company: '',
    nmls: '',
    nmls_number: '',
    license_number: '',
    dre_license: '',
    location: '',
    bio: '',
    website: '',
    linkedin: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    profileImage: '',
    specialtiesLo: [] as string[],
    specialties: [] as string[],
    languages: [] as string[],
    awards: [] as string[],
    nambCertifications: [] as string[],
    narDesignations: [] as string[],
    serviceAreas: [] as string[],
    brand: '',
    arrive: '',
    canvaFolderLink: '',
    nicheBioContent: '',
    username: ''
  });

  // Person CPT data
  const [personCPTData, setPersonCPTData] = useState<any>(null);
  const [hasPersonCPT, setHasPersonCPT] = useState(false);

  // Welcome tab data
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [customLinks, setCustomLinks] = useState<any[]>([]);

  // Tour state
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  // QR Code ref
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        // Load basic user data
        const user = await DataService.getCurrentUser();

        // Try to load Person CPT data
        try {
          const personResponse = await fetch('/wp-json/frs/v1/users/me/person-profile', {
            headers: {
              'X-WP-Nonce': (window as any).frsPortalData?.nonce || ''
            }
          });

          if (personResponse.ok) {
            const personData = await personResponse.json();
            setPersonCPTData(personData);
            setHasPersonCPT(personData.has_person_cpt);

            if (personData.has_person_cpt) {
              // Use Person CPT data when available
              const nameParts = personData.name?.split(' ') || [];
              setProfileData(prev => ({
                ...prev,
                firstName: nameParts[0] || prev.firstName,
                lastName: nameParts.slice(1).join(' ') || prev.lastName,
                email: personData.primary_business_email || prev.email,
                phone: personData.phone_number || prev.phone,
                title: personData.job_title || prev.title,
                bio: personData.biography || prev.bio,
                linkedin: personData.linkedin_url || prev.linkedin,
                facebook: personData.facebook_url || prev.facebook,
                profileImage: personData.headshot || prev.profileImage,
                company: '21st Century Lending', // Fixed company for all users
                specialtiesLo: Array.isArray(personData.specialties_lo) ? personData.specialties_lo : [],
                nambCertifications: Array.isArray(personData.namb_certifications) ? personData.namb_certifications : []
              }));
            }
          }
        } catch (personError) {
          console.log('Person CPT data not available:', personError);
        }

        // Set base user data
        if (user) {
          const nameParts = user.name?.split(' ') || [];
          setProfileData(prev => ({
            ...prev,
            firstName: prev.firstName || nameParts[0] || '',
            lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
            email: prev.email || user.email || '',
            phone: prev.phone || user.phone || '',
            mobileNumber: prev.mobileNumber || user.mobile_number || '',
            title: prev.title || user.title || user.job_title || '',
            company: user.company || user.office || '21st Century Lending',
            nmls: user.nmls || user.nmls_number || '',
            nmls_number: user.nmls_number || user.nmls || '',
            license_number: user.license_number || '',
            dre_license: user.dre_license || '',
            location: prev.location || user.location || user.city_state || '',
            bio: prev.bio || user.biography || '',
            website: user.website || '',
            linkedin: prev.linkedin || user.linkedin_url || '',
            facebook: prev.facebook || user.facebook_url || '',
            instagram: prev.instagram || user.instagram_url || '',
            twitter: prev.twitter || user.twitter_url || '',
            youtube: prev.youtube || user.youtube_url || '',
            tiktok: prev.tiktok || user.tiktok_url || '',
            profileImage: prev.profileImage || user.avatar || user.headshot_url || '',
            specialtiesLo: user.specialties_lo || prev.specialtiesLo || [],
            specialties: user.specialties || prev.specialties || [],
            languages: user.languages || prev.languages || [],
            awards: user.awards || prev.awards || [],
            nambCertifications: user.namb_certifications || prev.nambCertifications || [],
            narDesignations: user.nar_designations || prev.narDesignations || [],
            brand: user.brand || prev.brand || '',
            arrive: user.arrive || prev.arrive || '',
            canvaFolderLink: user.canva_folder_link || prev.canvaFolderLink || '',
            nicheBioContent: user.niche_bio_content || prev.nicheBioContent || '',
            username: user.username || user.user_nicename || ''
          }));
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, userRole]);

  // Load announcements and custom links
  useEffect(() => {
    const loadWelcomeData = async () => {
      try {
        // Load announcements
        const announcementsResponse = await fetch('/wp-json/frs/v1/announcements', {
          headers: {
            'X-WP-Nonce': (window as any).frsPortalData?.nonce || ''
          }
        });
        if (announcementsResponse.ok) {
          const announcementsData = await announcementsResponse.json();
          setAnnouncements(announcementsData);
        }

        // Load custom links
        const linksResponse = await fetch('/wp-json/frs/v1/custom-links', {
          headers: {
            'X-WP-Nonce': (window as any).frsPortalData?.nonce || ''
          }
        });
        if (linksResponse.ok) {
          const linksData = await linksResponse.json();
          setCustomLinks(linksData);
        }
      } catch (error) {
        console.error('Failed to load welcome data:', error);
      }
    };

    loadWelcomeData();
  }, []);

  // Generate QR Code with styling
  useEffect(() => {
    if (qrCodeRef.current) {
      // Clear previous QR code
      qrCodeRef.current.innerHTML = '';

      // Generate biolink URL dynamically
      const siteUrl = window.location.origin;
      const username = profileData.username || 'user';
      const biolinkUrl = `${siteUrl}/${username}/links`;

      const qrSize = 123;

      try {
        const qrCode = new QRCodeStyling({
          type: 'canvas',
          shape: 'square',
          width: qrSize,
          height: qrSize,
          data: biolinkUrl,
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

        // Constrain canvas size
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
  }, [profileData.username, loading, showQRCode]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      console.log('Saving profile data:', profileData);
      const success = await DataService.updateUserProfile(userId, profileData);
      console.log('Save result:', success);
      if (success) {
        setIsEditing(false);
        // Show success message briefly
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

  const handleAvatarUpload = async (file: File) => {
    try {
      const avatarUrl = await DataService.uploadAvatar(userId, file);
      if (avatarUrl) {
        setProfileData(prev => ({ ...prev, profileImage: avatarUrl }));
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setError('Failed to upload avatar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Map profileData to the format expected by ProfileCompletionSection
  const completionData = {
    first_name: profileData.firstName,
    last_name: profileData.lastName,
    email: profileData.email,
    phone: profileData.phone,
    job_title: profileData.title,
    company: profileData.company,
    nmls_id: profileData.nmls,
    bio: profileData.bio,
    linkedin_url: profileData.linkedin,
    facebook_url: profileData.facebook,
    instagram_url: profileData.instagram,
  };

  return (
    <div className="space-y-8 pb-8">
      {/* 1. EDIT PROFILE BUTTON (sticky at top) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex justify-end shadow-sm">
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white shadow-lg"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 2. WELCOME SECTION */}
      <section id="welcome" className="scroll-mt-20">
        <WelcomeBento userId={userId} />
      </section>

      {/* 3. PROFILE INFORMATION */}
      <section id="profile" className="scroll-mt-20 px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

        {/* Two Column Layout: Profile Card + Links & Social */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr] gap-4">
          {/* Profile Card */}
          <Card className="shadow-lg max-md:rounded-none md:rounded border border-gray-200 h-full">
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
                    <source src={(window as any).frsPortalConfig?.gradientUrl} type="video/mp4" />
                  </video>
                </div>

                {/* Avatar with Gradient Border - Flip Card */}
                <div className="mb-4 relative z-10" style={{ perspective: '1000px', width: '156px' }}>
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
                        {profileData.profileImage ? (
                          <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-3xl text-gray-600 font-semibold">
                              {(profileData.firstName?.[0] || '?')}{(profileData.lastName?.[0] || '')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* QR Code button - flips with avatar, shows QR icon */}
                      <Button
                        size="sm"
                        className="absolute rounded-full w-10 h-10 p-0 bg-black text-white hover:bg-gray-900 shadow-lg z-20"
                        style={{ top: '10px', right: '-5px' }}
                        onClick={() => setShowQRCode(!showQRCode)}
                        type="button"
                      >
                        <QrCode className="h-5 w-5" />
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

                    {/* Camera button - overlaps avatar at 10 o'clock (only in edit mode) */}
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleAvatarUpload(file);
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

                {/* Save/Cancel Buttons - Only show when editing */}
                {isEditing && (
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white"
                      disabled={isSaving}
                      size="sm"
                    >
                      {isSaving ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Name */}
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
                    <FloatingInput
                      id="firstName-profile"
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="bg-white/90"
                    />
                    <FloatingInput
                      id="lastName-profile"
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="bg-white/90"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <h3 className="text-[34px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Mona Sans Extended, sans-serif' }}>
                      {profileData.firstName} {profileData.lastName}
                    </h3>

                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                )}

                {/* Job Title, NMLS, and Location */}
                {!isEditing && (
                  <div className="mb-4 relative z-10">
                    <p className="text-base text-[#1D4FC4] flex items-center gap-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <span>
                        {profileData.title || (userRole === 'loan-officer' ? 'Loan Officer' : 'Realtor Partner')}
                        {(profileData.nmls || profileData.nmls_number) && <span> | NMLS {profileData.nmls || profileData.nmls_number}</span>}
                      </span>
                      {profileData.location && (
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {profileData.location}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Social Media Icons Row */}
                {!isEditing && (profileData.linkedin || profileData.facebook || profileData.instagram || profileData.twitter || profileData.youtube || profileData.website) && (
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    {profileData.linkedin && (
                      <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                      </a>
                    )}
                    {profileData.facebook && (
                      <a href={profileData.facebook} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                      </a>
                    )}
                    {profileData.instagram && (
                      <a href={profileData.instagram} target="_blank" rel="noopener noreferrer">
                        <Smartphone className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                      </a>
                    )}
                    {profileData.twitter && (
                      <a href={profileData.twitter} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                      </a>
                    )}
                    {profileData.youtube && (
                      <a href={profileData.youtube} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                      </a>
                    )}
                    {profileData.website && (
                      <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                      </a>
                    )}
                  </div>
                )}

                {/* Bio Preview - Only show if bio exists */}
                {!isEditing && profileData.bio && (
                  <div className="mb-4 relative z-10">
                    <p
                      className="text-base text-[#1E1E1E]"
                      style={{
                        fontFamily: 'Roboto, sans-serif',
                        lineHeight: '22.4px'
                      }}
                    >
                      {profileData.bio}
                    </p>
                  </div>
                )}

                {/* Contact Information - Always visible */}
                {!isEditing && (
                  <div className="flex items-center gap-6 relative z-10">
                    {profileData.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a href={`mailto:${profileData.email}`} className="hover:text-[#1D4FC4] transition-colors">
                          {profileData.email}
                        </a>
                      </div>
                    )}
                    {profileData.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a href={`tel:${profileData.phone}`} className="hover:text-[#1D4FC4] transition-colors">
                          {profileData.phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit Mode Fields */}
                {isEditing && (
                  <div className="space-y-3 relative z-10">
                    <FloatingInput
                      id="email-profile"
                      label="Email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="bg-white/90"
                    />
                    <FloatingInput
                      id="phone-profile"
                      label="Phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="bg-white/90"
                    />
                    <FloatingInput
                      id="title-edit"
                      label="Job Title"
                      value={profileData.title}
                      onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                      className="bg-white/90"
                    />
                    <FloatingInput
                      id="location-edit"
                      label="Location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      className="bg-white/90"
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Right Column: Links & Social + Service Areas */}
            <div className="space-y-4 h-full flex flex-col">
              {/* Links & Social Card */}
              <Card className="shadow-lg max-md:rounded-none md:rounded border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
                    <Globe className="h-5 w-5" />
                    Links & Social
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 py-3">
                  <div className="grid grid-cols-2 gap-2">
                    {isEditing ? (
                      <>
                        <FloatingInput
                          id="website"
                          label="Website"
                          type="url"
                          value={profileData.website}
                          onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                        />
                        <FloatingInput
                          id="linkedin"
                          label="LinkedIn"
                          type="url"
                          value={profileData.linkedin}
                          onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                        />
                        <FloatingInput
                          id="facebook"
                          label="Facebook"
                          type="url"
                          value={profileData.facebook}
                          onChange={(e) => setProfileData({...profileData, facebook: e.target.value})}
                        />
                        <FloatingInput
                          id="instagram"
                          label="Instagram"
                          type="url"
                          value={profileData.instagram}
                          onChange={(e) => setProfileData({...profileData, instagram: e.target.value})}
                        />
                        <FloatingInput
                          id="arrive"
                          label="Arrive (Scheduling)"
                          type="url"
                          value={profileData.arrive}
                          onChange={(e) => setProfileData({...profileData, arrive: e.target.value})}
                          className="col-span-2"
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 p-2 rounded border">
                          <Globe className="h-4 w-4 text-gray-600" />
                          <span className="text-xs truncate">{profileData.website || 'Website'}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded border">
                          <Linkedin className="h-4 w-4 text-gray-600" />
                          <span className="text-xs truncate">{profileData.linkedin || 'LinkedIn'}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded border">
                          <Facebook className="h-4 w-4 text-gray-600" />
                          <span className="text-xs truncate">{profileData.facebook || 'Facebook'}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded border">
                          <Smartphone className="h-4 w-4 text-gray-600" />
                          <span className="text-xs truncate">{profileData.instagram || 'Instagram'}</span>
                        </div>
                        {profileData.arrive && (
                          <div className="flex items-center gap-2 p-2 rounded border col-span-2">
                            <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs truncate">{profileData.arrive}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Service Areas Card */}
              <Card className="shadow-lg rounded-sm border border-gray-200 flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
                    <MapPin className="h-5 w-5" />
                    Service Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 py-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Add service areas by entering city, state, zip code, or any combination.</p>
                      <div className="grid grid-cols-3 gap-2">
                        <FloatingInput
                          id="service-city"
                          label="City (Optional)"
                          value={serviceAreaInput.city}
                          onChange={(e) => setServiceAreaInput({...serviceAreaInput, city: e.target.value})}
                          className="bg-white"
                        />
                        <FloatingInput
                          id="service-state"
                          label="State (Optional)"
                          value={serviceAreaInput.state}
                          onChange={(e) => setServiceAreaInput({...serviceAreaInput, state: e.target.value})}
                          className="bg-white"
                        />
                        <FloatingInput
                          id="service-zip"
                          label="Zip Code (Optional)"
                          value={serviceAreaInput.zip}
                          onChange={(e) => setServiceAreaInput({...serviceAreaInput, zip: e.target.value})}
                          className="bg-white"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        type="button"
                        onClick={() => {
                          // Build the service area string from non-empty inputs
                          const parts = [
                            serviceAreaInput.city,
                            serviceAreaInput.state,
                            serviceAreaInput.zip
                          ].filter(part => part.trim() !== '');

                          if (parts.length > 0) {
                            const newArea = parts.join(', ');
                            setProfileData({
                              ...profileData,
                              serviceAreas: [...(profileData.serviceAreas || []), newArea]
                            });
                            // Clear the inputs
                            setServiceAreaInput({ city: '', state: '', zip: '' });
                          }
                        }}
                      >
                        <span className="mr-2">+</span> Add Service Area
                      </Button>
                      {profileData.serviceAreas && profileData.serviceAreas.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Current Service Areas</Label>
                          <div className="flex flex-wrap gap-2">
                            {profileData.serviceAreas.map((area: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                                {area}
                                <button
                                  onClick={() => {
                                    setProfileData({
                                      ...profileData,
                                      serviceAreas: profileData.serviceAreas.filter((_: string, i: number) => i !== index)
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
                    <div className="flex flex-wrap gap-2">
                      {profileData.serviceAreas && profileData.serviceAreas.length > 0 ? (
                        profileData.serviceAreas.map((area: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No service areas specified.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Biography Card - Full Width Below */}
          <Card className="shadow-lg rounded-sm border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
                <FileText className="h-5 w-5" />
                Professional Biography
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isEditing ? (
                <RichTextEditor
                  value={profileData.bio}
                  onChange={(value) => setProfileData({...profileData, bio: value})}
                  placeholder="Share your professional background..."
                />
              ) : (
                <div
                  className="text-sm text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: profileData.bio || '<p class="text-gray-500 italic">No biography provided.</p>' }}
                />
              )}
            </CardContent>
          </Card>

          {/* Specialties Card */}
          <Card className="shadow-lg rounded-sm border border-gray-200">
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
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                          checked={profileData.specialtiesLo.includes(specialty)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfileData({
                                ...profileData,
                                specialtiesLo: [...profileData.specialtiesLo, specialty]
                              });
                            } else {
                              setProfileData({
                                ...profileData,
                                specialtiesLo: profileData.specialtiesLo.filter(s => s !== specialty)
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
                    {profileData.specialtiesLo.length > 0 ? (
                      profileData.specialtiesLo.map((specialty) => (
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
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      'CMC - Certified Mortgage Consultant',
                      'CRMS - Certified Residential Mortgage Specialist',
                      'GMA - General Mortgage Associate',
                      'CVLS - Certified Veterans Lending Specialist'
                    ].map((cert) => (
                      <label key={cert} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.nambCertifications.includes(cert)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfileData({
                                ...profileData,
                                nambCertifications: [...profileData.nambCertifications, cert]
                              });
                            } else {
                              setProfileData({
                                ...profileData,
                                nambCertifications: profileData.nambCertifications.filter(c => c !== cert)
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
                    {profileData.nambCertifications.length > 0 ? (
                      profileData.nambCertifications.map((cert) => (
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
      </section>

      {/* 4. MARKETING TOOLS */}
      <section id="marketing" className="scroll-mt-20 px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Marketing Tools</h2>

        {/* Feature Cards Grid - 3 column system with asymmetric layout */}
        <div className="space-y-6">
          {/* Row 1: Booking Calendar (2 cols) + Landing Pages (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BookingCalendarCard />
            </div>

            <div className="lg:col-span-1">
              <LandingPagesCard />
            </div>
          </div>

          {/* Row 2: Brand Guide (1 col) + Print & Social Media (2 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <BrandGuideCard />
            </div>

            <div className="lg:col-span-2">
              <PrintSocialMediaCard />
            </div>
          </div>
        </div>
      </section>

      {/* 5. LEAD TRACKING */}
      <section id="leads" className="scroll-mt-20 px-4">
        <LeadTracking userId={userId} />
      </section>

      {/* 6. TOOLS */}
      <section id="tools" className="scroll-mt-20 px-4">
        <MortgageCalculator />
      </section>

      {/* 7. SETTINGS (includes Notifications as a tab) */}
      <section id="settings" className="scroll-mt-20 px-4">
        <Settings userId={userId} />
      </section>

      {/* 9. PROFILE LINK SECTION */}
      <section id="profile-link" className="scroll-mt-20 px-4">
        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
              <QrCode className="h-5 w-5" />
              Your Profile Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Code Display */}
              <div className="flex flex-col items-center justify-center">
                <div
                  ref={qrCodeRef}
                  className="w-32 h-32 mb-3"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
                <p className="text-sm text-gray-600 text-center">Scan to visit your biolink</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowQRCode(!showQRCode)}
                >
                  {showQRCode ? 'Show Avatar' : 'Show QR Code'}
                </Button>
              </div>

              {/* Biolink URL */}
              <div className="flex flex-col justify-center">
                <Label className="text-sm font-medium mb-3">Biolink URL</Label>
                <div className="flex gap-2 mb-4">
                  <Input
                    readOnly
                    value={`${window.location.origin}/${profileData.username}/links`}
                    className="font-mono text-sm bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/${profileData.username}/links`);
                      const toast = document.createElement('div');
                      toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                      toast.textContent = 'Link copied to clipboard!';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 2000);
                    }}
                    title="Copy link"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Share this link to let people view your profile and contact information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 10. PROFILE COMPLETION */}
      <section id="completion" className="scroll-mt-20 px-4">
        <ProfileCompletionSection userData={completionData} />
      </section>

      {/* Announcement Modal */}
      {isAnnouncementModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--brand-dark-navy)]">
                  {selectedAnnouncement.title}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-[var(--brand-slate)]">
                  {new Date(selectedAnnouncement.date).toLocaleDateString()}
                </p>

                {selectedAnnouncement.thumbnail && (
                  <img
                    src={selectedAnnouncement.thumbnail}
                    alt={selectedAnnouncement.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                <div
                  className="prose max-w-none text-[var(--brand-dark-navy)]"
                  dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
                />
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}