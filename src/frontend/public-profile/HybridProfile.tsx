/**
 * Hybrid BuddyPress + FRS Profile Component
 *
 * Combines the modern FRS profile layout with BuddyPress features.
 * Navigation controlled by unified sidebar (see BuddyPressLayout).
 *
 * FRS Features (Profile, Personal, Professional, Social sections):
 * - Gradient video header
 * - Avatar with flip-to-QR code
 * - Modern bento card-based layout
 * - Service areas with state SVGs
 * - Professional biography & credentials
 * - Custom links & social media
 * - Profile editing (triggered by sidebar)
 *
 * BuddyPress Features (Experience, Groups, Friends sections):
 * - Experience feed (BuddyPress activity)
 * - Group memberships
 * - Friend connections
 * - Member stats
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { FloatingInput } from '@/components/ui/floating-input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileHeader } from './components/ProfileHeader';
import { CustomizerPreview, type Breakpoint } from './components/CustomizerPreview';
import { parseServiceAreaForState } from './utils/stateUtils';
import { useProfileEdit } from '@/frontend/portal/contexts/ProfileEditContext';
import { ProfileEditorView } from './components/ProfileEditorView';
import {
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckSquare,
  User,
  QrCode,
  Users,
  MessageCircle,
  Activity,
  UserPlus,
  UserCheck,
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  Award,
  Globe,
  Linkedin,
  Facebook,
  ExternalLink,
  Zap,
  Smartphone,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';

// Interfaces
interface FRSProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  mobile_number?: string;
  job_title?: string;
  headshot_url?: string;
  biography?: string;
  nmls_id?: string;
  nmls_number?: string;
  specialties_lo?: string[];
  namb_certifications?: string[];
  service_areas?: string[];
  city_state?: string;
  linkedin_url?: string;
  facebook_url?: string;
  website?: string;
  profile_slug?: string;
  custom_links?: Array<{ title: string; url: string }>;
}

interface BPMember {
  id: number;
  name: string;
  mention_name: string;
  link: string;
  user_avatar: {
    full: string;
    thumb: string;
  };
  last_activity: {
    date: string;
    timediff: string;
  };
}

interface BPActivity {
  id: number;
  user_id: number;
  content: string;
  date: string;
  component: string;
  type: string;
  user_avatar?: string;
}

interface BPGroup {
  id: number;
  name: string;
  description: string;
  avatar_urls: {
    full: string;
    thumb: string;
  };
  status: string;
}

interface HybridProfileProps {
  userId?: string;
  slug?: string;
  activeTab?: string;
  onProfileLoaded?: (profile: FRSProfile) => void;
  isEditMode?: boolean;
  viewport?: Breakpoint;
  isOwnProfile?: boolean;
}

export function HybridProfile({ userId, slug, activeTab = 'profile', onProfileLoaded, isEditMode = false, viewport = 'desktop', isOwnProfile = true }: HybridProfileProps) {
  // Profile edit context for edit mode
  const { activeSection, setActiveSection, setIsSaving: setContextSaving, setHandleSave, setHandleCancel } = useProfileEdit();

  // Check which section is being edited
  const isEditingPersonal = activeSection === 'personal';
  const isEditingProfessional = activeSection === 'professional';
  const isEditingSocial = activeSection === 'social';

  const [frsProfile, setFrsProfile] = useState<FRSProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<FRSProfile | null>(null);
  const [bpMember, setBpMember] = useState<BPMember | null>(null);
  const [bpActivity, setBpActivity] = useState<BPActivity[]>([]);
  const [bpGroups, setBpGroups] = useState<BPGroup[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [serviceAreaInput, setServiceAreaInput] = useState('');
  const [customLinkInput, setCustomLinkInput] = useState({ title: '', url: '' });

  // Get config from window
  const config = (window as any).frsBPConfig || {};
  const gradientUrl = config.gradientUrl || '';
  const contentUrl = config.contentUrl || '/wp-content';
  const iconPath = `${contentUrl}/plugins/frs-lrg/assets/images`;
  const bpPluginUrl = `${contentUrl}/plugins/frs-buddypress-integration/`;

  useEffect(() => {
    fetchAllData();
  }, [userId, slug]);

  // Register save and cancel handlers with context
  useEffect(() => {
    if (activeSection === 'personal' || activeSection === 'professional' || activeSection === 'social') {
      // Save handler
      setHandleSave(() => async () => {
        if (!frsProfile) {
          console.error('No profile data to save');
          return;
        }

        setIsSaving(true);
        setContextSaving(true);
        setError(null);

        try {
          const response = await fetch(`/wp-json/frs-users/v1/profiles/${frsProfile.id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsBPConfig?.restNonce || ''
            },
            body: JSON.stringify(frsProfile)
          });

          if (response.ok) {
            const result = await response.json();
            const updatedProfile = result.data || result;
            setFrsProfile(updatedProfile);
            setOriginalProfile(updatedProfile); // Update original after successful save
            setActiveSection(null); // Exit edit mode

            const successMsg = document.createElement('div');
            successMsg.className = 'fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            successMsg.textContent = 'Profile saved successfully!';
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 3000);
          } else {
            const errorData = await response.json();
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
          setFrsProfile(originalProfile); // Restore original data
        }
        setActiveSection(null); // Exit edit mode
        setError(null);
      });
    } else {
      // Clear handlers when section is not active
      setHandleSave(null);
      setHandleCancel(null);
    }
  }, [activeSection, frsProfile, originalProfile, setHandleSave, setHandleCancel, setActiveSection, setContextSaving]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch FRS profile (now includes BuddyPress data)
      const frsData = await fetchFRSProfile(userId, slug);
      setFrsProfile(frsData);
      setOriginalProfile(frsData); // Save original for cancel functionality

      // Notify parent component that profile loaded
      if (onProfileLoaded) {
        onProfileLoaded(frsData);
      }

      // Extract BuddyPress data if available
      if (frsData.buddypress) {
        const bp = frsData.buddypress;

        // Set basic member data
        setBpMember({
          id: frsData.user_id,
          name: bp.display_name || `${frsData.first_name} ${frsData.last_name}`,
          mention_name: bp.display_name || frsData.first_name,
          link: bp.member_url || '#',
          user_avatar: bp.avatar_urls || { full: '', thumb: '' },
          last_activity: bp.last_activity || { date: '', timediff: '' }
        });

        // Set friend count
        setFriendCount(bp.friend_count || 0);

        // TODO: Fetch activity and groups via FRS API endpoints
        // For now, leaving empty until we add those endpoints
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="@container w-full max-w-[1290px] mx-auto px-4 pt-6 pb-6">
        <div className="grid grid-cols-1 @lg:!grid-cols-[65%,35%] gap-4 mb-4">
          {/* Profile Card Skeleton */}
          <Card className="@container shadow-lg rounded border border-gray-200">
            <CardContent className="pt-6">
              {/* Cover/Header Skeleton */}
              <Skeleton className="w-full h-48 mb-4 rounded-lg" />

              {/* Avatar Skeleton */}
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>

              {/* Bio Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons + Service Areas Skeleton */}
          <div className="space-y-4">
            <Card className="shadow-lg rounded border border-gray-200">
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded border border-gray-200">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-2 py-3">
                <div className="grid grid-cols-4 gap-3">
                  <Skeleton className="aspect-square" />
                  <Skeleton className="aspect-square" />
                  <Skeleton className="aspect-square" />
                  <Skeleton className="aspect-square" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Cards Skeleton */}
        <div className="grid grid-cols-1 @lg:!grid-cols-2 gap-4">
          <Card className="shadow-lg rounded border border-gray-200">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded border border-gray-200">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !frsProfile) {
    return <div className="text-center py-8 text-red-600">{error || 'Profile not found'}</div>;
  }

  const fullName = `${frsProfile.first_name} ${frsProfile.last_name}`;
  const phoneNumber = frsProfile.phone_number || frsProfile.mobile_number;

  // Determine which content section to show based on activeTab
  // This is a PUBLIC PROFILE VIEW - editing is done in frs-wp-users ProfileCustomizerLayout
  const showProfileCards = !activeTab || activeTab === 'profile' || activeTab === 'edit-profile';
  const showExperienceSection = activeTab === 'experience';
  const showGroupsSection = activeTab === 'organization';
  const showFriendsSection = activeTab === 'connections';
  const showMessagesSection = activeTab === 'messages'; // Own profile
  const showSettingsSection = activeTab === 'settings' || activeTab?.startsWith('settings-'); // Own profile - includes sub-sections
  const showNotificationsSection = activeTab === 'notifications'; // Own profile
  const showSendMessageSection = activeTab === 'send-message'; // Someone else's profile

  // Derive the active editing section for ProfileEditorView
  const getSettingsSection = (): 'personal' | 'professional' | 'social' | 'links' | null => {
    if (!activeTab) return 'personal';
    if (activeTab === 'settings') return 'personal'; // Default to personal when clicking Settings
    if (activeTab === 'settings-personal') return 'personal';
    if (activeTab === 'settings-professional') return 'professional';
    if (activeTab === 'settings-social') return 'social';
    if (activeTab === 'settings-directory') return 'links'; // Directory maps to 'links' in ProfileEditorView
    return 'personal';
  };

  // If in edit mode (activeSection is set), render ProfileEditorView
  if (activeSection) {
    return <ProfileEditorView userId={userId} slug={slug} />;
  }

  // Wrap profile cards in customizer preview when in edit mode
  const profileContent = (
    <div className="@container w-full max-w-[1290px] mx-auto px-4 pt-6 pb-6">
      {/* Profile Bento Cards - Shown for Profile and About tabs */}
      {showProfileCards && (activeTab === 'edit-profile' || !isEditMode) && (
        <>
          {/* Row 1: Profile Card + Action Buttons/Service Areas */}
          <div className="grid grid-cols-1 @lg:!grid-cols-[65%,35%] gap-4 mb-4">
            {/* Profile Card */}
            <ProfileHeader
              profile={frsProfile}
              coverImageUrl={bpMember?.cover_image_url}
              gradientUrl={gradientUrl}
              iconPath={iconPath}
              bpPluginUrl={bpPluginUrl}
              showBPStats={true}
              lastActivity={bpMember?.last_activity}
              friendCount={friendCount}
              groupCount={bpGroups.length}
              isOwnProfile={isOwnProfile}
            />

            {/* Right Column: Action Buttons + Service Areas */}
            <div className="space-y-4 h-full flex flex-col" style={{ backgroundColor: 'white' }}>
              {/* Action Buttons Card */}
              <Card className="@container shadow-lg rounded border border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-3">
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

              {/* Service Areas Card */}
              <Card className="@container shadow-lg rounded border border-gray-200 flex-1" style={{ backgroundColor: 'white' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
                    <MapPin className="h-5 w-5" />
                    Service Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 py-3">
                  <div className="grid grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-3">
                    {frsProfile.service_areas && frsProfile.service_areas.length > 0 ? (
                      frsProfile.service_areas.map((area, index) => {
                        const stateInfo = parseServiceAreaForState(area);

                        if (stateInfo) {
                          // Display as state card with SVG
                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center justify-center pt-0.5 pb-3 px-2 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer aspect-square"
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
                            className="flex flex-col items-center justify-center pt-0.5 pb-3 px-2 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all aspect-square"
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
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Row 2: Biography + Specialties & Credentials */}
          <div className="grid grid-cols-1 @lg:!grid-cols-[65%,35%] gap-4 mb-4">
            {/* Biography Card */}
            <Card className="@container shadow-lg rounded border border-gray-200 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
                  <FileText className="h-5 w-5" />
                  Professional Biography
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className="text-sm text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: frsProfile.biography || '<p class="text-gray-500 italic">No biography provided.</p>' }}
                />
              </CardContent>
            </Card>

            {/* Specialties & Credentials Card */}
            <Card className="@container shadow-lg rounded border border-gray-200 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
                  <CheckSquare className="h-5 w-5" />
                  Specialties & Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Loan Officer Specialties */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Loan Officer Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {frsProfile.specialties_lo && frsProfile.specialties_lo.length > 0 ? (
                      frsProfile.specialties_lo.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{specialty}</Badge>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic">No specialties selected</p>
                    )}
                  </div>
                </div>

                {/* NAMB Certifications */}
                <div>
                  <h4 className="text-sm font-medium mb-2">NAMB Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {frsProfile.namb_certifications && frsProfile.namb_certifications.length > 0 ? (
                      frsProfile.namb_certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-800">{cert}</Badge>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic">No certifications selected</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Custom Links + Links & Social */}
          <div className="grid grid-cols-1 @lg:!grid-cols-[65%,35%] gap-4 mb-4">
            {/* Custom Links Card */}
            <Card className="@container shadow-lg rounded border border-gray-200 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
                  <ExternalLink className="h-5 w-5" />
                  Custom Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {frsProfile.custom_links && Array.isArray(frsProfile.custom_links) && frsProfile.custom_links.length > 0 ? (
                    frsProfile.custom_links.map((link, index) => (
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
                          <p className="text-xs text-gray-500 truncate mt-0.5">{link.url}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">No custom links added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Links & Social Card */}
            <Card className="@container shadow-lg rounded border border-gray-200 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base font-semibold">
                  <Globe className="h-5 w-5" />
                  Links & Social
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 py-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded border">
                    <Globe className="h-4 w-4 text-gray-600" />
                    <span className="text-xs truncate">{frsProfile.website || 'Website'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border">
                    <Linkedin className="h-4 w-4 text-gray-600" />
                    <span className="text-xs truncate">{frsProfile.linkedin_url || 'LinkedIn'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border">
                    <Facebook className="h-4 w-4 text-gray-600" />
                    <span className="text-xs truncate">{frsProfile.facebook_url || 'Facebook'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border">
                    <Smartphone className="h-4 w-4 text-gray-600" />
                    <span className="text-xs truncate">{frsProfile.instagram_url || 'Instagram'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Experience Section (BuddyPress Activity) */}
      {showExperienceSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bpActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent experience</p>
            ) : (
              <div className="space-y-4">
                {bpActivity.map((activity) => (
                  <div key={activity.id} className="border-b pb-4 last:border-0">
                    <div
                      className="prose prose-sm max-w-none mb-2"
                      dangerouslySetInnerHTML={{ __html: activity.content }}
                    />
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                      <button className="flex items-center gap-1 hover:text-red-500">
                        <Heart className="h-3 w-3" />
                        Like
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500">
                        <MessageSquare className="h-3 w-3" />
                        Comment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Groups Section */}
      {showGroupsSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bpGroups.length === 0 ? (
            <Card className="col-span-2">
              <CardContent className="py-8">
                <p className="text-gray-500 text-center">Not a member of any groups yet</p>
              </CardContent>
            </Card>
          ) : (
            bpGroups.map((group) => (
              <Card key={group.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={group.avatar_urls.thumb} />
                      <AvatarFallback>{group.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                      <Badge variant="secondary" className="mt-2">{group.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Friends Section */}
      {showFriendsSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Connections ({friendCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">Friends list will be displayed here</p>
          </CardContent>
        </Card>
      )}

      {/* Messages Section (Own Profile) */}
      {showMessagesSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">Your messages will be displayed here</p>
          </CardContent>
        </Card>
      )}

      {/* Settings Section (Own Profile) - Handled by parent now */}
      {showSettingsSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">Settings content placeholder</p>
          </CardContent>
        </Card>
      )}

      {/* Notifications Section (Own Profile) */}
      {showNotificationsSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">Your notifications will be displayed here</p>
          </CardContent>
        </Card>
      )}

      {/* Send Message Section (Someone Else's Profile) */}
      {showSendMessageSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Send Message to {fullName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                  placeholder="Write your message..."
                />
              </div>
              <Button
                className="w-full"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                }}
              >
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Mode - Handled by parent now */}
    </div>
  );

  return profileContent;
}

// API Helper Functions (matching your existing patterns)
async function fetchFRSProfile(userId?: string, slug?: string): Promise<FRSProfile> {
  const config = (window as any).frsBPConfig || {};
  let apiUrl;

  if (slug) {
    apiUrl = `${config.apiUrl}${config.frsNamespace}/profiles/slug/${slug}`;
  } else if (userId) {
    apiUrl = `${config.apiUrl}${config.frsNamespace}/profiles/user/${userId}`;
  } else {
    throw new Error('No slug or user ID provided');
  }

  const response = await fetch(apiUrl, {
    headers: { 'X-WP-Nonce': config.nonce }
  });

  if (!response.ok) throw new Error('Failed to fetch FRS profile');

  const result = await response.json();
  return result.data || result;
}

async function fetchBPMember(userId: string | number): Promise<BPMember> {
  const config = (window as any).frsBPConfig || {};
  const url = `${config.apiUrl}${config.bpNamespace}/${config.bpSlugs?.members || 'members'}/${userId}`;

  const response = await fetch(url, {
    headers: { 'X-WP-Nonce': config.nonce }
  });

  if (!response.ok) throw new Error('Failed to fetch BuddyPress member');
  return response.json();
}

async function fetchBPActivity(userId: string | number): Promise<BPActivity[]> {
  const config = (window as any).frsBPConfig || {};
  const url = `${config.apiUrl}${config.bpNamespace}/${config.bpSlugs?.activity || 'activity'}?user_id=${userId}&per_page=10`;

  const response = await fetch(url, {
    headers: { 'X-WP-Nonce': config.nonce }
  });

  if (!response.ok) return [];
  return response.json();
}

async function fetchBPGroups(userId: string | number): Promise<BPGroup[]> {
  const config = (window as any).frsBPConfig || {};
  const url = `${config.apiUrl}${config.bpNamespace}/${config.bpSlugs?.groups || 'groups'}?user_id=${userId}`;

  const response = await fetch(url, {
    headers: { 'X-WP-Nonce': config.nonce }
  });

  if (!response.ok) return [];
  return response.json();
}

async function fetchFriendCount(userId: string | number): Promise<number> {
  // Placeholder - implement based on BP Friends API
  return 0;
}
