import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
// Avatar components removed - using simple div implementations
import { Switch } from '@/components/ui/switch';
import QRCodeStyling from 'qr-code-styling';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
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
  CheckSquare,
  Smartphone,
  QrCode
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';
import { DataService } from '../utils/dataService';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

// Read-only field display component
const ReadOnlyField = ({ icon: Icon, label, value }: { icon: any, label?: string, value: string }) => (
  <div className="flex items-center space-x-3 rounded-md border bg-gray-50 p-3">
    <Icon className="size-4 shrink-0 text-[var(--brand-slate)]" />
    <span className="text-[var(--brand-dark-navy)]">{value}</span>
  </div>
);

const ReadOnlyTextarea = ({ icon: Icon, value }: { icon: any, value: string }) => (
  <div className="flex items-start space-x-3 py-2">
    <Icon className="mt-1 size-4 shrink-0 text-blue-600" />
    <div className="whitespace-pre-wrap leading-relaxed text-gray-900">{value}</div>
  </div>
);

interface ProfileSectionProps {
  activeTab?: 'welcome' | 'personal' | 'settings';
  autoEdit?: boolean;
  tourAttributes?: {
    announcements?: string;
    profileSummary?: string;
  };
  userId: string;
  userRole: 'loan-officer' | 'realtor';
}

export function ProfileSection({ activeTab: externalActiveTab, autoEdit = false, tourAttributes, userId, userRole }: ProfileSectionProps) {
  const [activeTab, setActiveTab] = useState(externalActiveTab || 'welcome');
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
    arrive: '',
    awards: [] as string[],
    bio: '',
    brand: '',
    canvaFolderLink: '',
    company: '',
    dre_license: '',
    email: '',
    facebook: '',
    firstName: '',
    instagram: '',
    languages: [] as string[],
    lastName: '',
    license_number: '',
    linkedin: '',
    location: '',
    mobileNumber: '',
    nambCertifications: [] as string[],
    narDesignations: [] as string[],
    nicheBioContent: '',
    nmls: '',
    nmls_number: '',
    phone: '',
    profileImage: '',
    serviceAreas: [] as string[],
    specialties: [] as string[],
    specialtiesLo: [] as string[],
    tiktok: '',
    title: '',
    twitter: '',
    username: '',
    website: '',
    youtube: ''
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
                bio: personData.biography || prev.bio,
                company: '21st Century Lending',
                email: personData.primary_business_email || prev.email,
                facebook: personData.facebook_url || prev.facebook,
                firstName: nameParts[0] || prev.firstName,
                lastName: nameParts.slice(1).join(' ') || prev.lastName,
                linkedin: personData.linkedin_url || prev.linkedin,
                nambCertifications: Array.isArray(personData.namb_certifications) ? personData.namb_certifications : [],
                phone: personData.phone_number || prev.phone,
                profileImage: personData.headshot || prev.profileImage, 
                // Fixed company for all users
specialtiesLo: Array.isArray(personData.specialties_lo) ? personData.specialties_lo : [],
                
title: personData.job_title || prev.title
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
            arrive: user.arrive || prev.arrive || '',
            awards: user.awards || prev.awards || [],
            bio: prev.bio || user.biography || '',
            brand: user.brand || prev.brand || '',
            canvaFolderLink: user.canva_folder_link || prev.canvaFolderLink || '',
            company: user.company || user.office || '21st Century Lending',
            dre_license: user.dre_license || '',
            email: prev.email || user.email || '',
            facebook: prev.facebook || user.facebook_url || '',
            firstName: prev.firstName || nameParts[0] || '',
            instagram: prev.instagram || user.instagram_url || '',
            languages: user.languages || prev.languages || [],
            lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
            license_number: user.license_number || '',
            linkedin: prev.linkedin || user.linkedin_url || '',
            location: prev.location || user.location || user.city_state || '',
            mobileNumber: prev.mobileNumber || user.mobile_number || '',
            nambCertifications: user.namb_certifications || prev.nambCertifications || [],
            narDesignations: user.nar_designations || prev.narDesignations || [],
            nicheBioContent: user.niche_bio_content || prev.nicheBioContent || '',
            nmls: user.nmls || user.nmls_number || '',
            nmls_number: user.nmls_number || user.nmls || '',
            phone: prev.phone || user.phone || '',
            profileImage: prev.profileImage || user.avatar || user.headshot_url || '',
            specialties: user.specialties || prev.specialties || [],
            specialtiesLo: user.specialties_lo || prev.specialtiesLo || [],
            tiktok: prev.tiktok || user.tiktok_url || '',
            title: prev.title || user.title || user.job_title || '',
            twitter: prev.twitter || user.twitter_url || '',
            username: user.username || user.user_nicename || '',
            website: user.website || '',
            youtube: prev.youtube || user.youtube_url || ''
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
          backgroundOptions: {
            color: '#ffffff'
          },
          cornersDotOptions: {
            gradient: {
              colorStops: [
                { color: '#2dd4da', offset: 0 },
                { color: '#2563e9', offset: 1 }
              ],
              rotation: 0,
              type: 'linear'
            },
            type: ''
          },
          cornersSquareOptions: {
            gradient: {
              colorStops: [
                { color: '#2563ea', offset: 0 },
                { color: '#2dd4da', offset: 1 }
              ],
              rotation: 0,
              type: 'linear'
            },
            type: 'extra-rounded'
          },
          data: biolinkUrl,
          dotsOptions: {
            gradient: {
              colorStops: [
                { color: '#2563eb', offset: 0 },
                { color: '#2dd4da', offset: 1 }
              ],
              rotation: 0,
              type: 'linear'
            },
            roundSize: true,
            type: 'extra-rounded'
          },
          height: qrSize,
          margin: 0,
          qrOptions: {
            errorCorrectionLevel: 'L',
            mode: 'Byte',
            typeNumber: 0
          },
          shape: 'square',
          type: 'canvas',
          width: qrSize
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
        document.body.append(successMsg);
        setTimeout(() => successMsg.remove(), 3000);

        // Reload the page to fetch latest data from server
        setTimeout(() => window.location.reload(), 500);
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
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }



  // Use external activeTab if provided, otherwise use internal state
  const currentTab = externalActiveTab || activeTab;



  // Map profileData to the format expected by ProfileCompletionSection
  const completionData = {
    bio: profileData.bio,
    company: profileData.company,
    email: profileData.email,
    facebook_url: profileData.facebook,
    first_name: profileData.firstName,
    instagram_url: profileData.instagram,
    job_title: profileData.title,
    last_name: profileData.lastName,
    linkedin_url: profileData.linkedin,
    nmls_id: profileData.nmls,
    phone: profileData.phone,
  };

  return (
    <div className="space-y-4" style={{ marginTop: '-30px' }}>
      {/* Tab Content - Show based on currentTab */}
      {currentTab === 'welcome' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Profile Details Card */}
            <Card className="border-[var(--brand-powder-blue)] max-md:rounded-none md:rounded" data-tour={tourAttributes?.profileSummary}>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-start space-x-4">
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-full" style={{
                      background: 'linear-gradient(135deg, #5ce1e6, #3851DD)',
                      padding: '2px'
                    }}>
                      <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-[var(--brand-pale-blue)]">
                        {profileData.profileImage ? (
                          <img alt="Profile" className="size-full object-cover" src={profileData.profileImage} />
                        ) : (
                          <span className="text-xl font-semibold text-[var(--brand-dark-navy)]">
                            {(profileData.firstName?.[0] || '?')}{(profileData.lastName?.[0] || '')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-[var(--brand-dark-navy)]">
                        {profileData.firstName} {profileData.lastName}
                      </h3>
                      <p className="mb-1 text-[var(--brand-slate)]">{profileData.title}</p>
                      <p className="text-sm text-[var(--brand-slate)]">
                        {profileData.company}
                        {profileData.nmls && <span className="ml-2">• NMLS #{profileData.nmls}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                      <Mail className="size-4 shrink-0 text-blue-600" />
                      <span className="truncate text-sm font-medium">{profileData.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                      <Phone className="size-4 shrink-0 text-green-600" />
                      <span className="text-sm font-medium">{profileData.phone || 'Not provided'}</span>
                    </div>
                    {profileData.location && (
                      <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                        <MapPin className="size-4 shrink-0 text-red-600" />
                        <span className="text-sm font-medium">{profileData.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Arrive Link as text */}
                  {personCPTData?.arrive && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="mb-1 flex items-center space-x-2">
                        <Globe className="size-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Arrive Registration</span>
                      </div>
                      <p className="ml-6 break-all text-xs text-blue-700">{personCPTData.arrive}</p>
                    </div>
                  )}

                  {/* Professional Links */}
                  {(profileData.linkedin || profileData.facebook || profileData.website) && (
                    <div className="flex space-x-2">
                      {profileData.linkedin && (
                        <Button onClick={() => window.open(profileData.linkedin, '_blank')} size="sm" variant="outline">
                          <Linkedin className="size-4" />
                        </Button>
                      )}
                      {profileData.facebook && (
                        <Button onClick={() => window.open(profileData.facebook, '_blank')} size="sm" variant="outline">
                          <Facebook className="size-4" />
                        </Button>
                      )}
                      {profileData.website && (
                        <Button onClick={() => window.open(profileData.website, '_blank')} size="sm" variant="outline">
                          <Globe className="size-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Announcements Card */}
            <Card className="border-[var(--brand-powder-blue)] max-md:rounded-none md:rounded" data-tour={tourAttributes?.announcements}>
              <CardHeader className="flex h-12 items-center px-4 max-md:rounded-t-none md:rounded-t" style={{ backgroundColor: '#B6C7D9' }}>
                <CardTitle className="flex items-center gap-1 text-sm text-gray-700">
                  <Bell className="size-3" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {announcements.length > 0 ? (
                  <div className="space-y-3">
                    {announcements.slice(0, 3).map((announcement) => (
                      <div
                        className="cursor-pointer rounded-lg border-l-4 border-l-blue-500 bg-gray-50 p-4 transition-all hover:bg-gray-100 hover:shadow-md"
                        key={announcement.id}
                        onClick={() => {
                          setSelectedAnnouncement(announcement);
                          setIsAnnouncementModalOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-[var(--brand-dark-navy)]">
                                {announcement.title}
                              </h4>
                              {announcement.priority === 'high' && (
                                <Badge className="px-2 py-1 text-xs" variant="destructive">
                                  Priority
                                </Badge>
                              )}
                            </div>
                            <p className="mb-2 line-clamp-2 text-xs text-[var(--brand-slate)]">
                              {announcement.excerpt}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-[var(--brand-slate)]">
                                {new Date(announcement.date).toLocaleDateString()}
                              </p>
                              <div className={`size-2 rounded-full ${
                                announcement.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'
                              }`}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {announcements.length > 3 && (
                      <div className="pt-2 text-center">
                        <p className="text-xs text-[var(--brand-slate)]">
                          +{announcements.length - 3} more announcements
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Bell className="mx-auto mb-2 size-8 text-gray-300" />
                    <p className="text-sm text-[var(--brand-slate)]">
                      No announcements at this time
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Custom Links Section */}
          {customLinks.length > 0 && (
            <Card className="border-[var(--brand-powder-blue)] max-md:rounded-none md:rounded">
              <CardHeader className="flex h-12 items-center px-4 max-md:rounded-t-none md:rounded-t" style={{ backgroundColor: '#B6C7D9' }}>
                <CardTitle className="flex items-center gap-1 text-sm text-gray-700">
                  <Globe className="size-3" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {customLinks.map((link) => (
                    <div
                      className="group cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
                      key={link.id}
                      onClick={() => window.open(link.url, '_blank')}
                      style={{ backgroundColor: link.color + '05', borderColor: link.color + '20' }}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className="flex size-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                          style={{ backgroundColor: link.color + '15' }}
                        >
                          <span style={{ color: link.color }}>🔗</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-medium text-[var(--brand-dark-navy)]">
                            {link.title}
                          </h4>
                          <p className="mt-1 line-clamp-2 text-xs text-[var(--brand-slate)]">
                            {link.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Personal Information Tab */}
      {currentTab === 'personal' && (
        <div className="space-y-4" style={{ paddingTop: '30px' }}>

          {/* Two Column Layout: Profile Card + Links & Social */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr,1fr]">
            {/* Profile Card */}
            <Card className="h-full border border-gray-200 shadow-lg max-md:rounded-none md:rounded">
              <div
                className="relative overflow-hidden p-8"
                style={{
                  background: '#F4F4F5',
                }}
              >
                {/* Gradient Video Background - Blurred */}
                <div className="absolute inset-x-0 top-0 w-full overflow-hidden" style={{ height: '149px' }}>
                  <video
                    autoPlay
                    className="size-full object-cover"
                    loop
                    muted
                    playsInline
                    style={{
                      filter: 'blur(30px)',
                      transform: 'scale(1.2)'
                    }}
                  >
                    <source src={(window as any).frsPortalConfig?.gradientUrl} type="video/mp4" />
                  </video>
                </div>

                {/* Avatar with Gradient Border - Flip Card */}
                <div className="relative z-10 mb-4" style={{ perspective: '1000px', width: '156px' }}>
                  <div
                    className="relative transition-transform duration-700"
                    style={{
                      height: '156px',
                      transform: showQRCode ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transformStyle: 'preserve-3d',
                      width: '156px'
                    }}
                  >
                    {/* Front Side - Avatar */}
                    <div
                      className="absolute inset-0 overflow-visible rounded-full"
                      style={{
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      <div
                        className="size-full overflow-hidden rounded-full"
                        style={{
                          backgroundClip: 'padding-box, border-box',
                          backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                          backgroundOrigin: 'padding-box, border-box',
                          border: '3px solid transparent',
                        }}
                      >
                        {profileData.profileImage ? (
                          <img alt="Profile" className="size-full object-cover" src={profileData.profileImage} />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-gray-100">
                            <span className="text-3xl font-semibold text-gray-600">
                              {(profileData.firstName?.[0] || '?')}{(profileData.lastName?.[0] || '')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* QR Code button - flips with avatar, shows QR icon */}
                      <Button
                        className="absolute z-20 size-10 rounded-full bg-black p-0 text-white shadow-lg hover:bg-gray-900"
                        onClick={() => setShowQRCode(!showQRCode)}
                        size="sm"
                        style={{ right: '-5px', top: '10px' }}
                        type="button"
                      >
                        <QrCode className="size-5" />
                      </Button>
                    </div>

                    {/* Back Side - QR Code */}
                    <div
                      className="absolute inset-0 overflow-visible rounded-full"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <div
                        className="size-full overflow-hidden rounded-full"
                        style={{
                          backgroundClip: 'padding-box, border-box',
                          backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                          backgroundOrigin: 'padding-box, border-box',
                          border: '3px solid transparent',
                        }}
                      >
                        <div className="flex size-full items-center justify-center bg-white p-5">
                          <div
                            ref={qrCodeRef}
                            style={{
                              alignItems: 'center',
                              display: 'flex',
                              height: '130px',
                              justifyContent: 'center',
                              width: '130px'
                            }}
                          />
                        </div>
                      </div>

                      {/* Avatar button - flips with QR code, shows User icon */}
                      <Button
                        className="absolute z-20 size-10 rounded-full bg-black p-0 text-white shadow-lg hover:bg-gray-900"
                        onClick={() => setShowQRCode(!showQRCode)}
                        size="sm"
                        style={{
                          right: '-5px',
                          top: '10px',
                          transform: 'scaleX(-1)' // Flip button content back so icon is readable
                        }}
                        type="button"
                      >
                        <User className="size-5" style={{ transform: 'scaleX(-1)' }} />
                      </Button>
                    </div>

                    {/* Camera button - overlaps avatar at 10 o'clock (only in edit mode) */}
                    {isEditing && (
                      <>
                        <input
                          accept="image/*"
                          className="hidden"
                          id="avatar-upload"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleAvatarUpload(file);
                            }
                          }}
                          type="file"
                        />
                        <Button
                          className="absolute z-20 size-10 rounded-full bg-black p-0 text-white shadow-lg hover:bg-gray-900"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          size="sm"
                          style={{ left: '-5px', top: '10px' }}
                          type="button"
                        >
                          <Camera className="size-5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Save/Cancel Buttons - Only show when editing */}
                {isEditing && (
                  <div className="relative z-10 mb-4 flex items-center gap-2">
                    <Button
                      disabled={isSaving}
                      onClick={() => setIsEditing(false)}
                      size="sm"
                      variant="outline"
                    >
                      <X className="mr-2 size-4" />
                      Cancel
                    </Button>
                    <Button
                      className="hover:bg-[var(--brand-electric-blue)]/90 bg-[var(--brand-electric-blue)] text-white"
                      disabled={isSaving}
                      onClick={handleSave}
                      size="sm"
                    >
                      {isSaving ? (
                        <>
                          <LoadingSpinner className="mr-2" size="sm" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 size-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Name */}
                {isEditing ? (
                  <div className="relative z-10 mb-4 grid grid-cols-2 gap-2">
                    <FloatingInput
                      className="bg-white/90"
                      id="firstName-profile"
                      label="First Name"
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      value={profileData.firstName}
                    />
                    <FloatingInput
                      className="bg-white/90"
                      id="lastName-profile"
                      label="Last Name"
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      value={profileData.lastName}
                    />
                  </div>
                ) : (
                  <div className="relative z-10 mb-2 flex items-center justify-between">
                    <h3 className="text-[34px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Mona Sans Extended, sans-serif' }}>
                      {profileData.firstName} {profileData.lastName}
                    </h3>

                    <Button
                      className="text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                      onClick={() => setIsEditing(true)}
                      size="sm"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      <Edit className="mr-2 size-4" />
                      Edit Profile
                    </Button>
                  </div>
                )}

                {/* Job Title, NMLS, and Location */}
                {!isEditing && (
                  <div className="relative z-10 mb-4">
                    <p className="flex items-center gap-6 text-base text-[#1D4FC4]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <span>
                        {profileData.title || (userRole === 'loan-officer' ? 'Loan Officer' : 'Realtor Partner')}
                        {(profileData.nmls || profileData.nmls_number) && <span> | NMLS {profileData.nmls || profileData.nmls_number}</span>}
                      </span>
                      {profileData.location && (
                        <span className="flex items-center gap-2">
                          <MapPin className="size-4" />
                          {profileData.location}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Social Media Icons Row */}
                {!isEditing && (profileData.linkedin || profileData.facebook || profileData.instagram || profileData.twitter || profileData.youtube || profileData.website) && (
                  <div className="relative z-10 mb-4 flex items-center gap-3">
                    {profileData.linkedin && (
                      <a href={profileData.linkedin} rel="noopener noreferrer" target="_blank">
                        <Linkedin className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
                      </a>
                    )}
                    {profileData.facebook && (
                      <a href={profileData.facebook} rel="noopener noreferrer" target="_blank">
                        <Facebook className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
                      </a>
                    )}
                    {profileData.instagram && (
                      <a href={profileData.instagram} rel="noopener noreferrer" target="_blank">
                        <Smartphone className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
                      </a>
                    )}
                    {profileData.twitter && (
                      <a href={profileData.twitter} rel="noopener noreferrer" target="_blank">
                        <Globe className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
                      </a>
                    )}
                    {profileData.youtube && (
                      <a href={profileData.youtube} rel="noopener noreferrer" target="_blank">
                        <Globe className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
                      </a>
                    )}
                    {profileData.website && (
                      <a href={profileData.website} rel="noopener noreferrer" target="_blank">
                        <Globe className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
                      </a>
                    )}
                  </div>
                )}

                {/* Bio Preview - Only show if bio exists */}
                {!isEditing && profileData.bio && (
                  <div className="relative z-10 mb-4">
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
                  <div className="relative z-10 flex items-center gap-6">
                    {profileData.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="size-4 text-gray-500" />
                        <a className="transition-colors hover:text-[#1D4FC4]" href={`mailto:${profileData.email}`}>
                          {profileData.email}
                        </a>
                      </div>
                    )}
                    {profileData.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="size-4 text-gray-500" />
                        <a className="transition-colors hover:text-[#1D4FC4]" href={`tel:${profileData.phone}`}>
                          {profileData.phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit Mode Fields */}
                {isEditing && (
                  <div className="relative z-10 space-y-3">
                    <FloatingInput
                      className="bg-white/90"
                      id="email-profile"
                      label="Email"
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      type="email"
                      value={profileData.email}
                    />
                    <FloatingInput
                      className="bg-white/90"
                      id="phone-profile"
                      label="Phone"
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      type="tel"
                      value={profileData.phone}
                    />
                    <FloatingInput
                      className="bg-white/90"
                      id="title-edit"
                      label="Job Title"
                      onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                      value={profileData.title}
                    />
                    <FloatingInput
                      className="bg-white/90"
                      id="location-edit"
                      label="Location"
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      value={profileData.location}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Right Column: Links & Social + Service Areas */}
            <div className="flex h-full flex-col space-y-4">
              {/* Links & Social Card */}
              <Card className="border border-gray-200 shadow-lg max-md:rounded-none md:rounded">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                    <Globe className="size-5" />
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
                          onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                          type="url"
                          value={profileData.website}
                        />
                        <FloatingInput
                          id="linkedin"
                          label="LinkedIn"
                          onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                          type="url"
                          value={profileData.linkedin}
                        />
                        <FloatingInput
                          id="facebook"
                          label="Facebook"
                          onChange={(e) => setProfileData({...profileData, facebook: e.target.value})}
                          type="url"
                          value={profileData.facebook}
                        />
                        <FloatingInput
                          id="instagram"
                          label="Instagram"
                          onChange={(e) => setProfileData({...profileData, instagram: e.target.value})}
                          type="url"
                          value={profileData.instagram}
                        />
                        <FloatingInput
                          className="col-span-2"
                          id="arrive"
                          label="Arrive (Scheduling)"
                          onChange={(e) => setProfileData({...profileData, arrive: e.target.value})}
                          type="url"
                          value={profileData.arrive}
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 rounded border p-2">
                          <Globe className="size-4 text-gray-600" />
                          <span className="truncate text-xs">{profileData.website || 'Website'}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded border p-2">
                          <Linkedin className="size-4 text-gray-600" />
                          <span className="truncate text-xs">{profileData.linkedin || 'LinkedIn'}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded border p-2">
                          <Facebook className="size-4 text-gray-600" />
                          <span className="truncate text-xs">{profileData.facebook || 'Facebook'}</span>
                        </div>
                        <div className="flex items-center gap-2 rounded border p-2">
                          <Smartphone className="size-4 text-gray-600" />
                          <span className="truncate text-xs">{profileData.instagram || 'Instagram'}</span>
                        </div>
                        {profileData.arrive && (
                          <div className="col-span-2 flex items-center gap-2 rounded border p-2">
                            <svg className="size-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                            </svg>
                            <span className="truncate text-xs">{profileData.arrive}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Service Areas Card */}
              <Card className="flex-1 rounded-sm border border-gray-200 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                    <MapPin className="size-5" />
                    Service Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 py-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Add service areas by entering city, state, zip code, or any combination.</p>
                      <div className="grid grid-cols-3 gap-2">
                        <FloatingInput
                          className="bg-white"
                          id="service-city"
                          label="City (Optional)"
                          onChange={(e) => setServiceAreaInput({...serviceAreaInput, city: e.target.value})}
                          value={serviceAreaInput.city}
                        />
                        <FloatingInput
                          className="bg-white"
                          id="service-state"
                          label="State (Optional)"
                          onChange={(e) => setServiceAreaInput({...serviceAreaInput, state: e.target.value})}
                          value={serviceAreaInput.state}
                        />
                        <FloatingInput
                          className="bg-white"
                          id="service-zip"
                          label="Zip Code (Optional)"
                          onChange={(e) => setServiceAreaInput({...serviceAreaInput, zip: e.target.value})}
                          value={serviceAreaInput.zip}
                        />
                      </div>
                      <Button
                        className="w-full"
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
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <span className="mr-2">+</span> Add Service Area
                      </Button>
                      {profileData.serviceAreas && profileData.serviceAreas.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Current Service Areas</Label>
                          <div className="flex flex-wrap gap-2">
                            {profileData.serviceAreas.map((area: string, index: number) => (
                              <Badge className="flex items-center gap-1 text-xs" key={index} variant="secondary">
                                {area}
                                <button
                                  className="ml-1 hover:text-red-600"
                                  onClick={() => {
                                    setProfileData({
                                      ...profileData,
                                      serviceAreas: profileData.serviceAreas.filter((_: string, i: number) => i !== index)
                                    });
                                  }}
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
                          <Badge className="text-xs" key={index} variant="secondary">
                            {area}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm italic text-gray-500">No service areas specified.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Biography Card - Full Width Below */}
          <Card className="rounded-sm border border-gray-200 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <FileText className="size-5" />
                Professional Biography
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isEditing ? (
                <RichTextEditor
                  onChange={(value) => setProfileData({...profileData, bio: value})}
                  placeholder="Share your professional background..."
                  value={profileData.bio}
                />
              ) : (
                <div
                  className="prose prose-sm max-w-none text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: profileData.bio || '<p class="text-gray-500 italic">No biography provided.</p>' }}
                />
              )}
            </CardContent>
          </Card>

          {/* Specialties Card */}
          <Card className="rounded-sm border border-gray-200 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <CheckSquare className="size-5" />
                Specialties & Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Loan Officer Specialties */}
              <div>
                <Label className="mb-2 block text-sm font-medium">Loan Officer Specialties</Label>
                {isEditing ? (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
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
                      <label className="flex cursor-pointer items-center space-x-2" key={specialty}>
                        <input
                          checked={profileData.specialtiesLo.includes(specialty)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                          type="checkbox"
                        />
                        <span className="text-sm text-gray-700">{specialty}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.specialtiesLo.length > 0 ? (
                      profileData.specialtiesLo.map((specialty) => (
                        <Badge className="text-xs" key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs italic text-gray-500">No specialties selected</p>
                    )}
                  </div>
                )}
              </div>

              {/* NAMB Certifications */}
              <div>
                <Label className="mb-2 block text-sm font-medium">NAMB Certifications</Label>
                {isEditing ? (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    {[
                      'CMC - Certified Mortgage Consultant',
                      'CRMS - Certified Residential Mortgage Specialist',
                      'GMA - General Mortgage Associate',
                      'CVLS - Certified Veterans Lending Specialist'
                    ].map((cert) => (
                      <label className="flex cursor-pointer items-center space-x-2" key={cert}>
                        <input
                          checked={profileData.nambCertifications.includes(cert)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                          type="checkbox"
                        />
                        <span className="text-sm text-gray-700">{cert}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.nambCertifications.length > 0 ? (
                      profileData.nambCertifications.map((cert) => (
                        <Badge className="bg-purple-100 text-xs text-purple-800" key={cert} variant="secondary">
                          {cert}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs italic text-gray-500">No certifications selected</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Settings Tab */}
      {currentTab === 'settings' && (
        <div className="space-y-4">
          <Card className="border-[var(--brand-powder-blue)] max-md:rounded-none md:rounded">
            <CardHeader>
              <CardTitle className="flex items-center text-[var(--brand-dark-navy)]">
                <Settings className="mr-2 size-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-[var(--brand-dark-navy)]">Email Notifications</h4>
                  <p className="text-sm text-[var(--brand-slate)]">Receive notifications for new leads and partnerships</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-[var(--brand-dark-navy)]">SMS Notifications</h4>
                  <p className="text-sm text-[var(--brand-slate)]">Get text messages for urgent updates</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-[var(--brand-dark-navy)]">Profile Visibility</h4>
                  <p className="text-sm text-[var(--brand-slate)]">Make your profile visible to potential partners</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--brand-powder-blue)] max-md:rounded-none md:rounded">
            <CardHeader>
              <CardTitle className="flex items-center text-[var(--brand-dark-navy)]">
                <Shield className="mr-2 size-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Bell className="mr-2 size-4" />
                Change Password
              </Button>

              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 size-4" />
                Download My Data
              </Button>

              <div className="border-t pt-4">
                <Button className="w-full" variant="destructive">
                  Delete Account
                </Button>
                <p className="mt-2 text-center text-xs text-[var(--brand-slate)]">
                  This action cannot be undone. All your data will be permanently removed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Announcement Modal */}
      {isAnnouncementModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <h2 className="text-xl font-semibold text-[var(--brand-dark-navy)]">
                  {selectedAnnouncement.title}
                </h2>
                <Button
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-[var(--brand-slate)]">
                  {new Date(selectedAnnouncement.date).toLocaleDateString()}
                </p>

                {selectedAnnouncement.thumbnail && (
                  <img
                    alt={selectedAnnouncement.title}
                    className="h-48 w-full rounded-lg object-cover"
                    src={selectedAnnouncement.thumbnail}
                  />
                )}

                <div
                  className="prose max-w-none text-[var(--brand-dark-navy)]"
                  dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
                />
              </div>

              <div className="mt-6 flex justify-end border-t pt-4">
                <Button
                  className="hover:bg-[var(--brand-electric-blue)]/90 bg-[var(--brand-electric-blue)] text-white"
                  onClick={() => setIsAnnouncementModalOpen(false)}
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