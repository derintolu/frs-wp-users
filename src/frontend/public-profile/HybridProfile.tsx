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

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileHeader } from './components/ProfileHeader';
import { type Breakpoint } from './components/CustomizerPreview';
import { parseServiceAreaForState } from './utils/stateUtils';
import { useProfileEdit } from '@/frontend/portal/contexts/ProfileEditContext';
import { ProfileEditorView } from './components/ProfileEditorView';
import {
  MapPin,
  FileText,
  CheckSquare,
  UserCheck,
  Heart,
  MessageSquare,
  Calendar,
  Globe,
  Linkedin,
  Facebook,
  ExternalLink,
  Smartphone,
  Bell,
  Settings as SettingsIcon
} from 'lucide-react';

// Interfaces
interface FRSProfile {
  biography?: string;
  city_state?: string;
  custom_links?: Array<{ title: string; url: string }>;
  email: string;
  facebook_url?: string;
  first_name: string;
  headshot_url?: string;
  id: number;
  job_title?: string;
  last_name: string;
  linkedin_url?: string;
  mobile_number?: string;
  namb_certifications?: string[];
  nmls_id?: string;
  nmls_number?: string;
  phone_number?: string;
  profile_slug?: string;
  service_areas?: string[];
  specialties_lo?: string[];
  website?: string;
}

interface BPMember {
  id: number;
  last_activity: {
    date: string;
    timediff: string;
  };
  link: string;
  mention_name: string;
  name: string;
  user_avatar: {
    full: string;
    thumb: string;
  };
}

interface BPActivity {
  component: string;
  content: string;
  date: string;
  id: number;
  type: string;
  user_avatar?: string;
  user_id: number;
}

interface BPGroup {
  avatar_urls: {
    full: string;
    thumb: string;
  };
  description: string;
  id: number;
  name: string;
  status: string;
}

interface HybridProfileProps {
  activeTab?: string;
  isEditMode?: boolean;
  isOwnProfile?: boolean;
  onProfileLoaded?: (profile: FRSProfile) => void;
  slug?: string;
  userId?: string;
  viewport?: Breakpoint;
}

export function HybridProfile({ activeTab = 'profile', isEditMode = false, isOwnProfile = true, onProfileLoaded, slug, userId, viewport = 'desktop' }: HybridProfileProps) {
  // Profile edit context for edit mode
  const { activeSection, setActiveSection, setHandleCancel, setHandleSave, setIsSaving: setContextSaving } = useProfileEdit();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchAllData is intentionally not a dependency to avoid re-fetching on every render
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
            body: JSON.stringify(frsProfile),
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsBPConfig?.restNonce || ''
            },
            method: 'PUT'
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
            document.body.append(successMsg);
            setTimeout(() => successMsg.remove(), 3000);
          } else {
            const errorData = await response.json();
            const errorMsg = document.createElement('div');
            errorMsg.className = 'fixed top-20 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            errorMsg.textContent = errorData.message || 'Failed to save profile changes';
            document.body.append(errorMsg);
            setTimeout(() => errorMsg.remove(), 5000);
            setError(errorData.message || 'Failed to save profile changes');
          }
        } catch (error) {
          console.error('Failed to save profile:', error);
          const errorMsg = document.createElement('div');
          errorMsg.className = 'fixed top-20 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
          errorMsg.textContent = 'Network error - please try again';
          document.body.append(errorMsg);
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
          last_activity: bp.last_activity || { date: '', timediff: '' },
          link: bp.member_url || '#',
          mention_name: bp.display_name || frsData.first_name,
          name: bp.display_name || `${frsData.first_name} ${frsData.last_name}`,
          user_avatar: bp.avatar_urls || { full: '', thumb: '' }
        });

        // Set friend count
        setFriendCount(bp.friend_count || 0);

        // TODO: Fetch activity and groups via FRS API endpoints
        // For now, leaving empty until we add those endpoints
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to load profile');
      console.error('Profile fetch error:', error_);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1290px] px-4 py-6 @container">
        <div className="mb-4 grid grid-cols-1 gap-4 @lg:!grid-cols-[65%,35%]">
          {/* Profile Card Skeleton */}
          <Card className="rounded border border-gray-200 shadow-lg @container">
            <CardContent className="pt-6">
              {/* Cover/Header Skeleton */}
              <Skeleton className="mb-4 h-48 w-full rounded-lg" />

              {/* Avatar Skeleton */}
              <div className="mb-4 flex items-center gap-4">
                <Skeleton className="size-24 rounded-full" />
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
            <Card className="rounded border border-gray-200 shadow-lg">
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>

            <Card className="rounded border border-gray-200 shadow-lg">
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
        <div className="grid grid-cols-1 gap-4 @lg:!grid-cols-2">
          <Card className="rounded border border-gray-200 shadow-lg">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>

          <Card className="rounded border border-gray-200 shadow-lg">
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
    return <div className="py-8 text-center text-red-600">{error || 'Profile not found'}</div>;
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
    if (!activeTab) {return 'personal';}
    if (activeTab === 'settings') {return 'personal';} // Default to personal when clicking Settings
    if (activeTab === 'settings-personal') {return 'personal';}
    if (activeTab === 'settings-professional') {return 'professional';}
    if (activeTab === 'settings-social') {return 'social';}
    if (activeTab === 'settings-directory') {return 'links';} // Directory maps to 'links' in ProfileEditorView
    return 'personal';
  };

  // If in edit mode (activeSection is set), render ProfileEditorView
  if (activeSection) {
    return <ProfileEditorView slug={slug} userId={userId} />;
  }

  // Wrap profile cards in customizer preview when in edit mode
  const profileContent = (
    <div className="mx-auto w-full max-w-[1290px] px-4 py-6 @container">
      {/* Profile Bento Cards - Shown for Profile and About tabs */}
      {showProfileCards && (activeTab === 'edit-profile' || !isEditMode) && (
        <>
          {/* Row 1: Profile Card + Action Buttons/Service Areas */}
          <div className="mb-4 grid grid-cols-1 gap-4 @lg:!grid-cols-[65%,35%]">
            {/* Profile Card */}
            <ProfileHeader
              bpPluginUrl={bpPluginUrl}
              coverImageUrl={bpMember?.cover_image_url}
              friendCount={friendCount}
              gradientUrl={gradientUrl}
              groupCount={bpGroups.length}
              iconPath={iconPath}
              isOwnProfile={isOwnProfile}
              lastActivity={bpMember?.last_activity}
              profile={frsProfile}
              showBPStats={true}
            />

            {/* Right Column: Action Buttons + Service Areas */}
            <div className="flex h-full flex-col space-y-4" style={{ backgroundColor: 'white' }}>
              {/* Action Buttons Card */}
              <Card className="rounded border border-gray-200 shadow-lg @container">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-3">
                    <Button
                      className="relative w-full overflow-hidden whitespace-nowrap border-0 bg-white px-6 py-2 font-semibold shadow-lg transition-all hover:bg-gray-50"
                      style={{
                        backgroundClip: 'padding-box, border-box',
                        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                        backgroundOrigin: 'padding-box, border-box',
                        border: '2px solid transparent',
                      }}
                      variant="outline"
                    >
                      <span
                        className="font-semibold"
                        style={{
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                          backgroundClip: 'text',
                        }}
                      >
                        Save to Contacts
                      </span>
                    </Button>
                    <Button
                      className="relative w-full overflow-hidden whitespace-nowrap border-0 bg-white px-6 py-2 font-semibold shadow-lg transition-all hover:bg-gray-50"
                      style={{
                        backgroundClip: 'padding-box, border-box',
                        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                        backgroundOrigin: 'padding-box, border-box',
                        border: '2px solid transparent',
                      }}
                      variant="outline"
                    >
                      <span
                        className="font-semibold"
                        style={{
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                          backgroundClip: 'text',
                        }}
                      >
                        Schedule Meeting
                      </span>
                    </Button>
                    <Button
                      className="relative w-full overflow-hidden whitespace-nowrap border-0 bg-white px-6 py-2 font-semibold shadow-lg transition-all hover:bg-gray-50"
                      style={{
                        backgroundClip: 'padding-box, border-box',
                        backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                        backgroundOrigin: 'padding-box, border-box',
                        border: '2px solid transparent',
                      }}
                      variant="outline"
                    >
                      <span
                        className="font-semibold"
                        style={{
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
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
              <Card className="flex-1 rounded border border-gray-200 shadow-lg @container" style={{ backgroundColor: 'white' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                    <MapPin className="size-5" />
                    Service Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 py-3">
                  <div className="grid grid-cols-2 gap-3 @md:grid-cols-3 @lg:grid-cols-4">
                    {frsProfile.service_areas && frsProfile.service_areas.length > 0 ? (
                      frsProfile.service_areas.map((area, index) => {
                        const stateInfo = parseServiceAreaForState(area);

                        if (stateInfo) {
                          // Display as state card with SVG
                          return (
                            <div
                              className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white px-2 pb-3 pt-0.5 transition-all hover:border-blue-400 hover:shadow-md"
                              key={index}
                            >
                              <img
                                alt={stateInfo.abbr}
                                className="mb-1 size-16 object-contain"
                                src={stateInfo.svgUrl}
                              />
                              <span className="text-sm font-semibold text-gray-700">{stateInfo.abbr}</span>
                            </div>
                          );
                        }

                        // Fallback for non-state service areas (cities, zip codes, etc.)
                        return (
                          <div
                            className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white px-2 pb-3 pt-0.5 transition-all hover:border-blue-400 hover:shadow-md"
                            key={index}
                          >
                            <MapPin className="mb-1 size-12 text-gray-500" />
                            <span className="break-words text-center text-xs font-medium text-gray-700">{area}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="col-span-4 text-sm italic text-gray-500">No service areas specified.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Row 2: Biography + Specialties & Credentials */}
          <div className="mb-4 grid grid-cols-1 gap-4 @lg:!grid-cols-[65%,35%]">
            {/* Biography Card */}
            <Card className="h-full rounded border border-gray-200 shadow-lg @container">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <FileText className="size-5" />
                  Professional Biography
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className="prose prose-sm max-w-none text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: frsProfile.biography || '<p class="text-gray-500 italic">No biography provided.</p>' }}
                />
              </CardContent>
            </Card>

            {/* Specialties & Credentials Card */}
            <Card className="h-full rounded border border-gray-200 shadow-lg @container">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <CheckSquare className="size-5" />
                  Specialties & Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Loan Officer Specialties */}
                <div>
                  <h4 className="mb-2 text-sm font-medium">Loan Officer Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {frsProfile.specialties_lo && frsProfile.specialties_lo.length > 0 ? (
                      frsProfile.specialties_lo.map((specialty, index) => (
                        <Badge className="text-xs" key={index} variant="secondary">{specialty}</Badge>
                      ))
                    ) : (
                      <p className="text-xs italic text-gray-500">No specialties selected</p>
                    )}
                  </div>
                </div>

                {/* NAMB Certifications */}
                <div>
                  <h4 className="mb-2 text-sm font-medium">NAMB Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {frsProfile.namb_certifications && frsProfile.namb_certifications.length > 0 ? (
                      frsProfile.namb_certifications.map((cert, index) => (
                        <Badge className="bg-purple-100 text-xs text-purple-800" key={index} variant="secondary">{cert}</Badge>
                      ))
                    ) : (
                      <p className="text-xs italic text-gray-500">No certifications selected</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Custom Links + Links & Social */}
          <div className="mb-4 grid grid-cols-1 gap-4 @lg:!grid-cols-[65%,35%]">
            {/* Custom Links Card */}
            <Card className="h-full rounded border border-gray-200 shadow-lg @container">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <ExternalLink className="size-5" />
                  Custom Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {frsProfile.custom_links && Array.isArray(frsProfile.custom_links) && frsProfile.custom_links.length > 0 ? (
                    frsProfile.custom_links.map((link, index) => (
                      <a
                        className="group flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-all hover:border-blue-400 hover:bg-blue-50/50"
                        href={link.url}
                        key={index}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                            {link.title}
                          </h4>
                          <p className="mt-0.5 truncate text-xs text-gray-500">{link.url}</p>
                        </div>
                        <ExternalLink className="ml-2 size-4 shrink-0 text-gray-400 group-hover:text-blue-600" />
                      </a>
                    ))
                  ) : (
                    <p className="py-4 text-center text-sm italic text-gray-500">No custom links added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Links & Social Card */}
            <Card className="h-full rounded border border-gray-200 shadow-lg @container">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <Globe className="size-5" />
                  Links & Social
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 py-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 rounded border p-2">
                    <Globe className="size-4 text-gray-600" />
                    <span className="truncate text-xs">{frsProfile.website || 'Website'}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded border p-2">
                    <Linkedin className="size-4 text-gray-600" />
                    <span className="truncate text-xs">{frsProfile.linkedin_url || 'LinkedIn'}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded border p-2">
                    <Facebook className="size-4 text-gray-600" />
                    <span className="truncate text-xs">{frsProfile.facebook_url || 'Facebook'}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded border p-2">
                    <Smartphone className="size-4 text-gray-600" />
                    <span className="truncate text-xs">{frsProfile.instagram_url || 'Instagram'}</span>
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
              <Calendar className="size-5" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bpActivity.length === 0 ? (
              <p className="py-8 text-center text-gray-500">No recent experience</p>
            ) : (
              <div className="space-y-4">
                {bpActivity.map((activity) => (
                  <div className="border-b pb-4 last:border-0" key={activity.id}>
                    <div
                      className="prose prose-sm mb-2 max-w-none"
                      dangerouslySetInnerHTML={{ __html: activity.content }}
                    />
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                      <button className="flex items-center gap-1 hover:text-red-500">
                        <Heart className="size-3" />
                        Like
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500">
                        <MessageSquare className="size-3" />
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {bpGroups.length === 0 ? (
            <Card className="col-span-2">
              <CardContent className="py-8">
                <p className="text-center text-gray-500">Not a member of any groups yet</p>
              </CardContent>
            </Card>
          ) : (
            bpGroups.map((group) => (
              <Card key={group.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="size-12">
                      <AvatarImage src={group.avatar_urls.thumb} />
                      <AvatarFallback>{group.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="line-clamp-2 text-sm text-gray-600">{group.description}</p>
                      <Badge className="mt-2" variant="secondary">{group.status}</Badge>
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
              <UserCheck className="size-5" />
              Connections ({friendCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="py-8 text-center text-gray-500">Friends list will be displayed here</p>
          </CardContent>
        </Card>
      )}

      {/* Messages Section (Own Profile) */}
      {showMessagesSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="py-8 text-center text-gray-500">Your messages will be displayed here</p>
          </CardContent>
        </Card>
      )}

      {/* Settings Section (Own Profile) - Handled by parent now */}
      {showSettingsSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="size-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="py-8 text-center text-gray-500">Settings content placeholder</p>
          </CardContent>
        </Card>
      )}

      {/* Notifications Section (Own Profile) */}
      {showNotificationsSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="py-8 text-center text-gray-500">Your notifications will be displayed here</p>
          </CardContent>
        </Card>
      )}

      {/* Send Message Section (Someone Else's Profile) */}
      {showSendMessageSection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              Send Message to {fullName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Subject</label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject..."
                  type="text"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Message</label>
                <textarea
                  className="min-h-[200px] w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

  if (!response.ok) {throw new Error('Failed to fetch FRS profile');}

  const result = await response.json();
  return result.data || result;
}

async function fetchBPMember(userId: string | number): Promise<BPMember> {
  const config = (window as any).frsBPConfig || {};
  const url = `${config.apiUrl}${config.bpNamespace}/${config.bpSlugs?.members || 'members'}/${userId}`;

  const response = await fetch(url, {
    headers: { 'X-WP-Nonce': config.nonce }
  });

  if (!response.ok) {throw new Error('Failed to fetch BuddyPress member');}
  return response.json();
}

async function fetchBPActivity(userId: string | number): Promise<BPActivity[]> {
  const config = (window as any).frsBPConfig || {};
  const url = `${config.apiUrl}${config.bpNamespace}/${config.bpSlugs?.activity || 'activity'}?user_id=${userId}&per_page=10`;

  const response = await fetch(url, {
    headers: { 'X-WP-Nonce': config.nonce }
  });

  if (!response.ok) {return [];}
  return response.json();
}

async function fetchBPGroups(userId: string | number): Promise<BPGroup[]> {
  const config = (window as any).frsBPConfig || {};
  const url = `${config.apiUrl}${config.bpNamespace}/${config.bpSlugs?.groups || 'groups'}?user_id=${userId}`;

  const response = await fetch(url, {
    headers: { 'X-WP-Nonce': config.nonce }
  });

  if (!response.ok) {return [];}
  return response.json();
}

async function fetchFriendCount(userId: string | number): Promise<number> {
  // Placeholder - implement based on BP Friends API
  return 0;
}
