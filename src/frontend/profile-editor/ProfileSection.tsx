import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FloatingInput } from '@/components/ui/floating-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ProfileEditorSidebar } from './components/profile-editor-sidebar';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
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
import { LoadingSpinner } from '@/components/ui/loading';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

// Read-only field display component
const ReadOnlyField = ({ icon: Icon, value, label }: { icon: any, value: string, label?: string }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md border">
    <Icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
    <span className="text-gray-900">{value}</span>
  </div>
);

const ReadOnlyTextarea = ({ icon: Icon, value }: { icon: any, value: string }) => (
  <div className="flex items-start space-x-3 py-2">
    <Icon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
    <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">{value}</div>
  </div>
);

interface ProfileSectionProps {
  profileId: number;
  userId: number;
  activeTab?: 'welcome' | 'personal' | 'settings';
  autoEdit?: boolean;
}

type PreviewMode = 'company' | 'personal';

export function ProfileSection({ profileId, userId, activeTab: externalActiveTab, autoEdit = false }: ProfileSectionProps) {
  const [activeTab, setActiveTab] = useState(externalActiveTab || 'personal');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('company');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [serviceAreaInput, setServiceAreaInput] = useState({
    city: '',
    state: '',
    zip: ''
  });

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

  // Welcome tab data
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [customLinks, setCustomLinks] = useState<any[]>([]);

  // Announcement modal state
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  // QR Code ref
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Load user profile data from frs-wp-users REST API
  useEffect(() => {
    const loadProfile = async () => {
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
        const profile = result.data || result;

        // Map API response to profileData state
        setProfileData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone_number || '',
          mobileNumber: profile.mobile_number || '',
          title: profile.job_title || '',
          company: profile.office || '',
          nmls: profile.nmls || profile.nmls_number || '',
          nmls_number: profile.nmls_number || profile.nmls || '',
          license_number: profile.license_number || '',
          dre_license: profile.dre_license || '',
          location: profile.city_state || '',
          bio: profile.biography || '',
          website: '',
          linkedin: profile.linkedin_url || '',
          facebook: profile.facebook_url || '',
          instagram: profile.instagram_url || '',
          twitter: profile.twitter_url || '',
          youtube: profile.youtube_url || '',
          tiktok: profile.tiktok_url || '',
          profileImage: profile.headshot_url || '',
          specialtiesLo: Array.isArray(profile.specialties_lo) ? profile.specialties_lo : [],
          specialties: Array.isArray(profile.specialties) ? profile.specialties : [],
          languages: Array.isArray(profile.languages) ? profile.languages : [],
          awards: Array.isArray(profile.awards) ? profile.awards : [],
          nambCertifications: Array.isArray(profile.namb_certifications) ? profile.namb_certifications : [],
          narDesignations: Array.isArray(profile.nar_designations) ? profile.nar_designations : [],
          serviceAreas: Array.isArray(profile.service_areas) ? profile.service_areas : [],
          brand: profile.brand || '',
          arrive: profile.arrive || '',
          canvaFolderLink: profile.canva_folder_link || '',
          nicheBioContent: profile.niche_bio_content || '',
          username: profile.first_name?.toLowerCase() || 'user'
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  // Generate QR Code with styling
  useEffect(() => {
    if (qrCodeRef.current) {
      // Clear previous QR code
      qrCodeRef.current.innerHTML = '';

      // Generate biolink URL dynamically
      const siteUrl = window.location.origin;
      const username = profileData.username || 'user';
      const biolinkUrl = `${siteUrl}/${username}`;

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
      const nonce = (window as any).wpApiSettings?.nonce || '';

      // Map profileData back to API format
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone_number: profileData.phone,
        mobile_number: profileData.mobileNumber,
        job_title: profileData.title,
        office: profileData.company,
        nmls: profileData.nmls,
        nmls_number: profileData.nmls_number,
        license_number: profileData.license_number,
        dre_license: profileData.dre_license,
        city_state: profileData.location,
        biography: profileData.bio,
        linkedin_url: profileData.linkedin,
        facebook_url: profileData.facebook,
        instagram_url: profileData.instagram,
        twitter_url: profileData.twitter,
        youtube_url: profileData.youtube,
        tiktok_url: profileData.tiktok,
        specialties_lo: profileData.specialtiesLo,
        specialties: profileData.specialties,
        languages: profileData.languages,
        awards: profileData.awards,
        namb_certifications: profileData.nambCertifications,
        nar_designations: profileData.narDesignations,
        service_areas: profileData.serviceAreas,
        brand: profileData.brand,
        arrive: profileData.arrive,
        canva_folder_link: profileData.canvaFolderLink,
        niche_bio_content: profileData.nicheBioContent
      };

      const response = await fetch(`/wp-json/frs-users/v1/profiles/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMsg.textContent = 'Profile saved successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setError('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      // TODO: Implement avatar upload via WordPress media API
      console.log('Avatar upload not yet implemented:', file);
      setError('Avatar upload feature coming soon');
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

  // Use external activeTab if provided, otherwise use internal state
  const currentTab = externalActiveTab || activeTab;

  return (
    <div className="overflow-hidden">
      {/* Tab Content - Show based on currentTab */}
      {currentTab === 'welcome' && (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Details Card */}
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0" style={{
                      background: 'linear-gradient(135deg, #5ce1e6, #3851DD)',
                      padding: '2px'
                    }}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-blue-50 flex items-center justify-center">
                        {profileData.profileImage ? (
                          <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl text-gray-900 font-semibold">
                            {(profileData.firstName?.[0] || '?')}{(profileData.lastName?.[0] || '')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {profileData.firstName} {profileData.lastName}
                      </h3>
                      <p className="text-gray-600 mb-1">{profileData.title}</p>
                      <p className="text-sm text-gray-600">
                        {profileData.company}
                        {profileData.nmls && <span className="ml-2">• NMLS #{profileData.nmls}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{profileData.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium">{profileData.phone || 'Not provided'}</span>
                    </div>
                    {profileData.location && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="text-sm font-medium">{profileData.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Professional Links */}
                  {(profileData.linkedin || profileData.facebook || profileData.website) && (
                    <div className="flex space-x-2">
                      {profileData.linkedin && (
                        <Button size="sm" variant="outline" onClick={() => window.open(profileData.linkedin, '_blank')}>
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      )}
                      {profileData.facebook && (
                        <Button size="sm" variant="outline" onClick={() => window.open(profileData.facebook, '_blank')}>
                          <Facebook className="h-4 w-4" />
                        </Button>
                      )}
                      {profileData.website && (
                        <Button size="sm" variant="outline" onClick={() => window.open(profileData.website, '_blank')}>
                          <Globe className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Announcements Placeholder */}
            <Card className="border-blue-200">
              <CardHeader className="h-12 flex items-center px-4" style={{ backgroundColor: '#B6C7D9' }}>
                <CardTitle className="flex items-center gap-1 text-gray-700 text-sm">
                  <Bell className="h-3 w-3" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    No announcements at this time
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Personal Information Tab - Profile Editor Interface */}
      {currentTab === 'personal' && (
        <>
          <SidebarProvider>
            <ResizablePanelGroup direction="horizontal" className="min-h-screen overflow-hidden bg-white">
              <ResizablePanel defaultSize={20} minSize={15} maxSize={40} className="bg-white">
                <ProfileEditorSidebar
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                >
                  {/* Contact Details Form */}
                  {activeSection === 'profile' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FloatingInput
                          id="firstName-edit"
                          label="First Name"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        />
                        <FloatingInput
                          id="lastName-edit"
                          label="Last Name"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        />
                      </div>
                      <FloatingInput
                        id="email-edit"
                        label="Email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FloatingInput
                          id="phone-edit"
                          label="Phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        />
                        <FloatingInput
                          id="mobile-edit"
                          label="Mobile"
                          type="tel"
                          value={profileData.mobileNumber}
                          onChange={(e) => setProfileData({...profileData, mobileNumber: e.target.value})}
                        />
                      </div>
                      <FloatingInput
                        id="title-edit"
                        label="Job Title"
                        value={profileData.title}
                        onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                      />
                      <FloatingInput
                        id="company-edit"
                        label="Company"
                        value={profileData.company}
                        onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                      />
                      <FloatingInput
                        id="location-edit"
                        label="Location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        placeholder="City, State"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FloatingInput
                          id="nmls-edit"
                          label="NMLS Number"
                          value={profileData.nmls}
                          onChange={(e) => setProfileData({...profileData, nmls: e.target.value})}
                        />
                        <FloatingInput
                          id="license-edit"
                          label="License Number"
                          value={profileData.license_number}
                          onChange={(e) => setProfileData({...profileData, license_number: e.target.value})}
                        />
                      </div>

                      <div className="pt-4 border-t">
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-full"
                        >
                          {isSaving ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Saving...
                            </>
                          ) : (
                            'Save Contact Details'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Links & Social Form */}
                {activeSection === 'links' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <FloatingInput
                        id="website-edit"
                        label="Website"
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                      />
                      <FloatingInput
                        id="linkedin-edit"
                        label="LinkedIn"
                        type="url"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                      />
                      <FloatingInput
                        id="facebook-edit"
                        label="Facebook"
                        type="url"
                        value={profileData.facebook}
                        onChange={(e) => setProfileData({...profileData, facebook: e.target.value})}
                      />
                      <FloatingInput
                        id="instagram-edit"
                        label="Instagram"
                        type="url"
                        value={profileData.instagram}
                        onChange={(e) => setProfileData({...profileData, instagram: e.target.value})}
                      />
                      <FloatingInput
                        id="twitter-edit"
                        label="Twitter"
                        type="url"
                        value={profileData.twitter}
                        onChange={(e) => setProfileData({...profileData, twitter: e.target.value})}
                      />
                      <FloatingInput
                        id="youtube-edit"
                        label="YouTube"
                        type="url"
                        value={profileData.youtube}
                        onChange={(e) => setProfileData({...profileData, youtube: e.target.value})}
                      />
                      <FloatingInput
                        id="tiktok-edit"
                        label="TikTok"
                        type="url"
                        value={profileData.tiktok}
                        onChange={(e) => setProfileData({...profileData, tiktok: e.target.value})}
                      />

                      <div className="pt-4 border-t">
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-full"
                        >
                          {isSaving ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Saving...
                            </>
                          ) : (
                            'Save Links & Social'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Service Areas Form */}
                {activeSection === 'service-areas' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          id="service-city"
                          placeholder="City"
                          value={serviceAreaInput.city}
                          onChange={(e) => setServiceAreaInput({...serviceAreaInput, city: e.target.value})}
                        />
                        <Input
                          id="service-state"
                          placeholder="State"
                          value={serviceAreaInput.state}
                          onChange={(e) => setServiceAreaInput({...serviceAreaInput, state: e.target.value})}
                        />
                        <Input
                          id="service-zip"
                          placeholder="Zip"
                          value={serviceAreaInput.zip}
                          onChange={(e) => setServiceAreaInput({...serviceAreaInput, zip: e.target.value})}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        type="button"
                        onClick={() => {
                          const parts = [serviceAreaInput.city, serviceAreaInput.state, serviceAreaInput.zip].filter(p => p.trim());
                          if (parts.length > 0) {
                            setProfileData({...profileData, serviceAreas: [...(profileData.serviceAreas || []), parts.join(', ')]});
                            setServiceAreaInput({ city: '', state: '', zip: '' });
                          }
                        }}
                      >
                        + Add Service Area
                      </Button>
                      {profileData.serviceAreas && profileData.serviceAreas.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Current Service Areas</Label>
                          <div className="flex flex-wrap gap-2">
                            {profileData.serviceAreas.map((area: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                                {area}
                                <button
                                  onClick={() => setProfileData({...profileData, serviceAreas: profileData.serviceAreas.filter((_: string, i: number) => i !== index)})}
                                  className="ml-2 hover:text-red-600 font-bold"
                                  type="button"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-full"
                        >
                          {isSaving ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Saving...
                            </>
                          ) : (
                            'Save Service Areas'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Biography Form */}
                {activeSection === 'biography' && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Biography</Label>
                      <RichTextEditor
                        value={profileData.bio}
                        onChange={(value) => setProfileData({...profileData, bio: value})}
                        placeholder="Write your professional background, experience, and what makes you unique..."
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full"
                      >
                        {isSaving ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          'Save Biography'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Specialties Form */}
                {activeSection === 'specialties' && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Loan Officer Specialties</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Residential Mortgages', 'Consumer Loans', 'VA Loans', 'FHA Loans', 'Jumbo Loans', 'Construction Loans', 'Investment Property', 'Reverse Mortgages', 'USDA Rural Loans', 'Bridge Loans'].map((specialty) => (
                          <label key={specialty} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={profileData.specialtiesLo.includes(specialty)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProfileData({...profileData, specialtiesLo: [...profileData.specialtiesLo, specialty]});
                                } else {
                                  setProfileData({...profileData, specialtiesLo: profileData.specialtiesLo.filter(s => s !== specialty)});
                                }
                              }}
                              className="rounded h-4 w-4"
                            />
                            <span className="text-sm">{specialty}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full"
                      >
                        {isSaving ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          'Save Specialties'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Certifications Form */}
                {activeSection === 'certifications' && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">NAMB Certifications</Label>
                      <div className="space-y-2">
                        {['CMC - Certified Mortgage Consultant', 'CRMS - Certified Residential Mortgage Specialist', 'GMA - General Mortgage Associate', 'CVLS - Certified Veterans Lending Specialist'].map((cert) => (
                          <label key={cert} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={profileData.nambCertifications.includes(cert)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProfileData({...profileData, nambCertifications: [...profileData.nambCertifications, cert]});
                                } else {
                                  setProfileData({...profileData, nambCertifications: profileData.nambCertifications.filter(c => c !== cert)});
                                }
                              }}
                              className="rounded h-4 w-4"
                            />
                            <span className="text-sm">{cert}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full"
                      >
                        {isSaving ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          'Save Certifications'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                </ProfileEditorSidebar>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={80} minSize={60} className="bg-gray-50">
                <SidebarInset className="h-full">
                  <div className="h-full overflow-y-auto p-8">
                    <div className="space-y-6">
                      {/* Profile Header Card */}
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-start space-x-6">
                            <div className="flex-shrink-0">
                              {profileData.profileImage ? (
                                <img
                                  src={profileData.profileImage}
                                  alt={`${profileData.firstName} ${profileData.lastName}`}
                                  className="rounded-lg max-w-md object-cover"
                                  style={{ aspectRatio: '1/1', maxHeight: '300px' }}
                                />
                              ) : (
                                <div className="h-32 w-32 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <User className="h-16 w-16 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-4">
                              <div>
                                <h3 className="text-xl font-bold">
                                  {profileData.firstName} {profileData.lastName}
                                </h3>
                                {profileData.title && (
                                  <p className="text-sm text-gray-600">
                                    {profileData.title}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                {profileData.email && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">Email:</span>
                                    <a href={`mailto:${profileData.email}`} className="text-sm text-blue-600 hover:underline">
                                      {profileData.email}
                                    </a>
                                  </div>
                                )}
                                {profileData.phone && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">Phone:</span>
                                    <a href={`tel:${profileData.phone}`} className="text-sm text-blue-600 hover:underline">
                                      {profileData.phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList>
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="professional">Professional</TabsTrigger>
                          <TabsTrigger value="contact">Contact & Location</TabsTrigger>
                          <TabsTrigger value="social">Social Media</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">License & Professional Numbers</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">NMLS</div>
                                <div className="col-span-2">{profileData.nmls || '—'}</div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">License Number</div>
                                <div className="col-span-2">{profileData.license_number || '—'}</div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="professional" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Professional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">Job Title</div>
                                <div className="col-span-2">{profileData.title || '—'}</div>
                              </div>
                              {profileData.bio && (
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="font-medium text-gray-600">Biography</div>
                                  <div className="col-span-2 prose prose-sm" dangerouslySetInnerHTML={{ __html: profileData.bio }} />
                                </div>
                              )}
                              {profileData.specialtiesLo.length > 0 && (
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="font-medium text-gray-600">Specialties</div>
                                  <div className="col-span-2 flex flex-wrap gap-2">
                                    {profileData.specialtiesLo.map((specialty: string) => (
                                      <Badge key={specialty} variant="secondary">{specialty}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {profileData.languages.length > 0 && (
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="font-medium text-gray-600">Languages</div>
                                  <div className="col-span-2">{profileData.languages.join(', ')}</div>
                                </div>
                              )}
                              {profileData.nambCertifications.length > 0 && (
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="font-medium text-gray-600">NAMB Certifications</div>
                                  <div className="col-span-2 flex flex-wrap gap-2">
                                    {profileData.nambCertifications.map((cert: string) => (
                                      <Badge key={cert} variant="secondary">{cert}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="contact" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">Email</div>
                                <div className="col-span-2">
                                  {profileData.email ? (
                                    <a href={`mailto:${profileData.email}`} className="text-blue-600 hover:underline">
                                      {profileData.email}
                                    </a>
                                  ) : '—'}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">Phone</div>
                                <div className="col-span-2">
                                  {profileData.phone ? (
                                    <a href={`tel:${profileData.phone}`} className="text-blue-600 hover:underline">
                                      {profileData.phone}
                                    </a>
                                  ) : '—'}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">Mobile</div>
                                <div className="col-span-2">
                                  {profileData.mobileNumber ? (
                                    <a href={`tel:${profileData.mobileNumber}`} className="text-blue-600 hover:underline">
                                      {profileData.mobileNumber}
                                    </a>
                                  ) : '—'}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">Location</div>
                                <div className="col-span-2">{profileData.location || '—'}</div>
                              </div>
                            </CardContent>
                          </Card>

                          {profileData.serviceAreas && profileData.serviceAreas.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Service Areas</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {profileData.serviceAreas.map((area: string, index: number) => (
                                    <Badge key={index} variant="secondary">{area}</Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>

                        <TabsContent value="social" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Social Media</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">Website</div>
                                <div className="col-span-2">
                                  {profileData.website ? (
                                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {profileData.website}
                                    </a>
                                  ) : '—'}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">LinkedIn</div>
                                <div className="col-span-2">
                                  {profileData.linkedin ? (
                                    <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {profileData.linkedin}
                                    </a>
                                  ) : '—'}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">Facebook</div>
                                <div className="col-span-2">
                                  {profileData.facebook ? (
                                    <a href={profileData.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {profileData.facebook}
                                    </a>
                                  ) : '—'}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">Instagram</div>
                                <div className="col-span-2">
                                  {profileData.instagram ? (
                                    <a href={profileData.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {profileData.instagram}
                                    </a>
                                  ) : '—'}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">Twitter</div>
                                <div className="col-span-2">
                                  {profileData.twitter ? (
                                    <a href={profileData.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {profileData.twitter}
                                    </a>
                                  ) : '—'}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">YouTube</div>
                                <div className="col-span-2">
                                  {profileData.youtube ? (
                                    <a href={profileData.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {profileData.youtube}
                                    </a>
                                  ) : '—'}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">TikTok</div>
                                <div className="col-span-2">
                                  {profileData.tiktok ? (
                                    <a href={profileData.tiktok} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {profileData.tiktok}
                                    </a>
                                  ) : '—'}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </SidebarInset>
              </ResizablePanel>
            </ResizablePanelGroup>
          </SidebarProvider>
        </>
      )}

      {/* Settings Tab */}
      {currentTab === 'settings' && (
        <div className="space-y-4">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive notifications for new leads and partnerships</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
