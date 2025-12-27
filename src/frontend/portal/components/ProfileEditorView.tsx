import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { FloatingInput } from '@/components/ui/floating-input';
import QRCodeStyling from 'qr-code-styling';

/**
 * Forces all external links to open in a new tab
 * Works both in the main document and inside same-origin iframes
 */
const useExternalLinkHandler = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Check if a URL is external (different origin)
  const isExternalUrl = useCallback((url: string, baseOrigin: string): boolean => {
    try {
      const linkUrl = new URL(url, baseOrigin);
      return linkUrl.origin !== baseOrigin;
    } catch {
      return false;
    }
  }, []);

  // Handler for click events that forces external links to open in new tabs
  const handleLinkClick = useCallback((e: MouseEvent, doc: Document) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');

    if (anchor && anchor.href) {
      const origin = doc.location.origin;

      if (isExternalUrl(anchor.href, origin)) {
        e.preventDefault();
        e.stopPropagation();
        window.open(anchor.href, '_blank', 'noopener,noreferrer');
      }
    }
  }, [isExternalUrl]);

  // Set up handler for the main document
  useEffect(() => {
    const handler = (e: MouseEvent) => handleLinkClick(e, document);
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [handleLinkClick]);

  // Callback ref for iframe - sets up handler inside iframe
  const setIframeRef = useCallback((iframe: HTMLIFrameElement | null) => {
    iframeRef.current = iframe;

    if (!iframe) {return;}

    const setupIframeHandler = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          // Add <base target="_blank"> to make all links open in new tab by default
          let base = iframeDoc.querySelector('base');
          if (!base) {
            base = iframeDoc.createElement('base');
            iframeDoc.head.append(base);
          }
          base.setAttribute('target', '_blank');

          // Also add click handler as backup for dynamically created links
          const handler = (e: MouseEvent) => handleLinkClick(e, iframeDoc);
          iframeDoc.addEventListener('click', handler, true);

          // Set up a MutationObserver to handle dynamically added content
          const observer = new MutationObserver(() => {
            // Re-ensure base target is set
            const currentBase = iframeDoc.querySelector('base');
            if (currentBase) {
              currentBase.setAttribute('target', '_blank');
            }
          });

          observer.observe(iframeDoc.body, { childList: true, subtree: true });
        }
      } catch (error) {
        // Cross-origin iframe - can't access contentDocument
        console.warn('Could not set up external link handler in iframe (cross-origin):', error);
      }
    };

    // Try immediately and also on load
    setupIframeHandler();
    iframe.addEventListener('load', setupIframeHandler);
  }, [handleLinkClick]);

  return { setIframeRef };
};
import {
  Phone,
  MapPin,
  FileText,
  CheckSquare,
  Camera,
  Save,
  X,
  Globe,
  Linkedin,
  Facebook,
  Smartphone,
  Tablet,
  Monitor,
  Edit,
  Link2,
  ExternalLink,
  PlusCircle,
  Calendar,
  Settings,
  MessageSquare
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { parseServiceAreaForState } from '@/frontend/portal/utils/stateUtils';
import { useProfileEdit } from '@/frontend/portal/contexts/ProfileEditContext';

interface ProfileData {
  arrive?: string;
  biography?: string;
  brand?: string;
  calendar_id?: number;
  city_state?: string;
  directory_button_type?: 'schedule' | 'call' | 'contact';
  display_name?: string;
  dre_license?: string;
  email: string;
  facebook_url?: string;
  first_name: string;
  headshot_url?: string;
  id: number;
  instagram_url?: string;
  job_title?: string;
  last_name: string;
  license_number?: string;
  linkedin_url?: string;
  mobile_number?: string;
  namb_certifications?: string[];
  nmls?: string;
  nmls_number?: string;
  office?: string;
  phone_number?: string;
  profile_slug?: string;
  region?: string;
  scheduling_url?: string;
  service_areas?: string[];
  specialties_lo?: string[];
  tiktok_url?: string;
  twitter_url?: string;
  website?: string;
  youtube_url?: string;
}

interface ProfileEditorViewProps {
  slug?: string;
  userId?: string;
}

// Also export as PublicProfileView for backwards compatibility
export function ProfileEditorView({ slug, userId }: ProfileEditorViewProps) {
  const { activeSection, setActiveSection, setHandleCancel, setHandleSave, setIsSaving: setContextSaving } = useProfileEdit();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [serviceAreaInput, setServiceAreaInput] = useState('');
  const [customLinkInput, setCustomLinkInput] = useState({ title: '', url: '' });
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [showMeetingRequestForm, setShowMeetingRequestForm] = useState(false);
  const [meetingFormSubmitted, setMeetingFormSubmitted] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Determine if this is a public view (accessed via slug) vs portal view (accessed via userId)
  const isPublicView = !!slug && !userId;

  // Hook to force external links to open in new tabs (including in iframes)
  const { setIframeRef } = useExternalLinkHandler();

  // Unified edit mode - use single 'edit' section for all fields
  const isEditing = activeSection === 'edit';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('[PublicProfileView] Starting fetch with:', { slug, userId });

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
      } catch (error_) {
        console.error('[PublicProfileView] Error:', error_);
        setError(error_ instanceof Error ? error_.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, slug]);

  // Generate V-Card
  const generateVCard = () => {
    if (!profile) {return;}

    // Build NMLS info for note
    const nmlsInfo = (profile.nmls || profile.nmls_number) ? `NMLS #${profile.nmls || profile.nmls_number}` : '';
    const noteContent = [nmlsInfo, profile.biography?.replace(/\n/g, String.raw`\n`)].filter(Boolean).join(' - ');

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
      // Photo (headshot)
      profile.headshot_url ? `PHOTO;VALUE=URI:${profile.headshot_url}` : '',
      // Social Media
      profile.linkedin_url ? `X-SOCIALPROFILE;TYPE=linkedin:${profile.linkedin_url}` : '',
      profile.facebook_url ? `X-SOCIALPROFILE;TYPE=facebook:${profile.facebook_url}` : '',
      profile.instagram_url ? `X-SOCIALPROFILE;TYPE=instagram:${profile.instagram_url}` : '',
      profile.twitter_url ? `X-SOCIALPROFILE;TYPE=twitter:${profile.twitter_url}` : '',
      profile.youtube_url ? `X-SOCIALPROFILE;TYPE=youtube:${profile.youtube_url}` : '',
      profile.tiktok_url ? `X-SOCIALPROFILE;TYPE=tiktok:${profile.tiktok_url}` : '',
      // Note with NMLS and biography
      noteContent ? `NOTE:${noteContent}` : '',
      'END:VCARD'
    ].filter(line => line !== '').join('\r\n');

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.first_name}_${profile.last_name}.vcf`;
    document.body.append(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Determine the directory path based on person type (matches DirectoryProfileCard)
  const getDirectoryPath = () => {
    if (!profile) {return '/lo/';}
    const profileSlug = slug || (profile as any).profile_slug || `${profile.first_name?.toLowerCase()}-${profile.last_name?.toLowerCase()}`;
    const personType = (profile as any).select_person_type || 'loan_officer';

    switch (personType) {
      case 'loan_officer':
        return `/lo/${profileSlug}`;
      case 'agent':
        return `/agent/${profileSlug}`;
      case 'staff':
        return `/staff/${profileSlug}`;
      case 'leadership':
        return `/leadership/${profileSlug}`;
      case 'assistant':
        return `/assistant/${profileSlug}`;
      default:
        return `/lo/${profileSlug}`;
    }
  };

  // Generate QR Code
  useEffect(() => {
    if (qrCodeRef.current && profile) {
      qrCodeRef.current.innerHTML = '';

      const siteUrl = window.location.origin;
      // QR code points to directory hash route for embeddable widget compatibility
      const directoryPath = getDirectoryPath();
      const qrProfileUrl = `${siteUrl}/directory#${directoryPath}`;

      const qrSize = 100;

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
          data: qrProfileUrl,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getDirectoryPath uses profile and slug which are already in deps
  }, [profile, showQRCode, slug]);

  // Register save and cancel handlers with context
  useEffect(() => {
    if (activeSection === 'edit') {
      const successMessage = 'Profile saved successfully!';

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
            body: JSON.stringify(profile),
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || ''
            },
            method: 'PUT'
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
            successMsg.textContent = successMessage;
            document.body.append(successMsg);
            setTimeout(() => successMsg.remove(), 3000);
          } else {
            const errorData = await response.json();
            console.error('Save failed:', errorData);
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
    if (!profile) {return;}

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/wp-json/frs-users/v1/profiles/${profile.id}`, {
        body: JSON.stringify(profile),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || ''
        },
        method: 'PUT'
      });

      if (response.ok) {
        setActiveSection(null);
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMsg.textContent = 'Profile saved successfully!';
        document.body.append(successMsg);
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
      <div className="mx-auto w-full max-w-[1290px] animate-pulse px-4 py-6 @container">
        {/* Two Column Layout Skeleton */}
        <div className="mb-4 grid grid-cols-1 gap-4 @lg:!grid-cols-[65%,35%]">
          {/* Profile Card Skeleton */}
          <div className="rounded border border-gray-200 bg-white p-8 shadow-lg">
            {/* Header background */}
            <div className="-mx-8 -mt-8 mb-4 h-[149px] rounded-t bg-gradient-to-r from-blue-500 to-cyan-500"></div>

            {/* Avatar skeleton */}
            <div className="mx-auto mb-4 size-[156px] rounded-full bg-gray-300 @lg:mx-0"></div>

            {/* Name skeleton */}
            <div className="mb-4 h-10 w-3/4 rounded bg-gray-300"></div>

            {/* Details skeleton */}
            <div className="mb-4 space-y-2">
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="h-4 w-2/3 rounded bg-gray-200"></div>
            </div>

            {/* Contact skeleton */}
            <div className="mb-4 flex gap-4">
              <div className="h-6 w-32 rounded bg-gray-200"></div>
              <div className="h-6 w-32 rounded bg-gray-200"></div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-4">
            {/* Action Buttons Skeleton */}
            <div className="rounded border border-gray-200 bg-white p-6 shadow-lg">
              <div className="space-y-3">
                <div className="h-10 rounded bg-gray-200"></div>
                <div className="h-10 rounded bg-gray-200"></div>
                <div className="h-10 rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Service Areas Skeleton */}
            <div className="rounded border border-gray-200 bg-white p-6 shadow-lg">
              <div className="mb-4 h-6 w-1/2 rounded bg-gray-300"></div>
              <div className="space-y-2">
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Biography Row Skeleton */}
        <div className="mb-4 grid grid-cols-1 gap-4 @lg:!grid-cols-[65%,35%]">
          <div className="rounded border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-4 h-6 w-1/3 rounded bg-gray-300"></div>
            <div className="space-y-2">
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 w-5/6 rounded bg-gray-200"></div>
              <div className="h-4 w-4/6 rounded bg-gray-200"></div>
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-4 h-6 w-1/2 rounded bg-gray-300"></div>
            <div className="space-y-3">
              <div className="h-8 rounded bg-gray-200"></div>
              <div className="h-8 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-red-600">{error || 'Profile not found'}</p>
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
  const iconPath = `${contentUrl}/plugins/frs-wp-users/assets/images`;

  console.log('[PublicProfileView] gradientUrl:', gradientUrl);
  console.log('[PublicProfileView] contentUrl:', contentUrl);

  // Viewport width mapping
  const viewportMaxWidth = {
    desktop: '1290px',
    tablet: '768px',
    mobile: '375px'
  };

  return (
    <div
      className="h-full min-h-screen w-full"
      style={{ backgroundColor: '#f0f4f8', width: '100%', height: '100%', minHeight: '100vh' }}
    >
    <div
      className="mx-auto w-full px-4 py-6 pb-24 duration-300 animate-in fade-in @container"
      style={{
        maxWidth: viewportMaxWidth[viewport],
        opacity: loading ? 0 : 1,
        transition: 'max-width 0.3s ease-in-out, opacity 0.5s ease-in-out'
      }}
    >
      {/* Two Column Layout: Profile Card + Links & Social */}
      <div className="mb-4 grid grid-cols-1 gap-4 @lg:!grid-cols-[65%,35%]">
        {/* Profile Card */}
        <Card className="h-full border border-gray-200 shadow-lg @container @lg:rounded max-md:rounded-none">
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
                <source src={gradientUrl} type="video/mp4" />
              </video>
            </div>

            {/* Avatar with Gradient Border - Flip Card */}
            <div className="relative z-10 mx-auto mb-4 @lg:!mx-0" style={{ perspective: '1000px', width: '156px' }}>
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
                    {profile.headshot_url ? (
                      <img alt="Profile" className="size-full object-cover" src={profile.headshot_url} />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-gray-100">
                        <span className="text-3xl font-semibold text-gray-600">
                          {(profile.first_name?.[0] || '?')}{(profile.last_name?.[0] || '')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* QR Code button - flips with avatar, shows QR icon */}
                  <button
                    className="absolute right-[-5px] top-2 z-20 flex size-[35px] items-center justify-center"
                    onClick={() => setShowQRCode(!showQRCode)}
                    type="button"
                  >
                    <img
                      alt="Toggle QR"
                      className="size-[35px]"
                      src={`${iconPath}/qr-flip.svg`}
                    />
                  </button>
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

                  {/* Avatar button - flips with QR code, shows profile icon */}
                  <button
                    className="absolute right-[-5px] top-2 z-20 flex size-[35px] items-center justify-center"
                    onClick={() => setShowQRCode(!showQRCode)}
                    style={{ transform: 'scaleX(-1)' }}
                    type="button"
                  >
                    <img
                      alt="Show Profile"
                      className="size-[35px]"
                      src={`${iconPath}/profile flip.svg`}
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  </button>
                </div>

                {/* Camera button - overlaps avatar at 10 o'clock (only when editing) */}
                {isEditing && (
                  <>
                    <input
                      accept="image/*"
                      className="hidden"
                      id="avatar-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle avatar upload
                          console.log('Upload avatar:', file);
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

            {/* Name */}
            {isEditing ? (
              <div className="relative z-10 mb-6 grid grid-cols-2 gap-4">
                <FloatingInput
                  className="bg-white/90"
                  id="firstName-profile"
                  label="First Name"
                  onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                  value={profile.first_name}
                />
                <FloatingInput
                  className="bg-white/90"
                  id="lastName-profile"
                  label="Last Name"
                  onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                  value={profile.last_name}
                />
              </div>
            ) : (
              <div className="relative z-10 mb-2 flex flex-col items-center justify-center gap-4 text-center @lg:!flex-row @lg:!items-start @lg:!justify-between @lg:!text-left">
                <h3 className="text-[34px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Mona Sans Extended, sans-serif' }}>
                  {fullName}
                </h3>
                <Button
                  asChild
                  className="hidden whitespace-nowrap px-6 py-2 font-semibold text-white shadow-lg @lg:!inline-flex"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  }}
                >
                  <a href={profile.arrive || '#'} rel="noopener noreferrer" target="_blank">
                    Apply Now
                  </a>
                </Button>
              </div>
            )}

            {/* Job Title, NMLS, and Location */}
            {!isEditing && (
              <div className="relative z-10 mb-4">
                <p className="flex flex-col items-center justify-center gap-2 text-center text-base text-[#1D4FC4] @lg:!flex-row @lg:!items-start @lg:!justify-start @lg:!gap-6 @lg:!text-left" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <span>
                    {profile.job_title || 'Loan Officer'}
                    {(profile.nmls || profile.nmls_number) && <span> | NMLS {profile.nmls || profile.nmls_number}</span>}
                  </span>
                  {profile.city_state && (
                    <span className="flex items-center justify-center gap-2 @lg:!justify-start">
                      <MapPin className="size-4" />
                      {profile.city_state}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Social Media Icons Row */}
            {!isEditing && (profile.linkedin_url || profile.facebook_url || profile.instagram_url || profile.twitter_url || profile.youtube_url || profile.website) && (
              <div className="relative z-10 mb-4 flex items-center justify-center gap-3 @lg:!justify-start">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} rel="noopener noreferrer" target="_blank">
                    <Linkedin className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
                  </a>
                )}
                {profile.facebook_url && (
                  <a href={profile.facebook_url} rel="noopener noreferrer" target="_blank">
                    <Facebook className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
                  </a>
                )}
                {profile.instagram_url && (
                  <a href={profile.instagram_url} rel="noopener noreferrer" target="_blank">
                    <Smartphone className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
                  </a>
                )}
                {profile.twitter_url && (
                  <a href={profile.twitter_url} rel="noopener noreferrer" target="_blank">
                    <Globe className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
                  </a>
                )}
                {profile.youtube_url && (
                  <a href={profile.youtube_url} rel="noopener noreferrer" target="_blank">
                    <Globe className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website} rel="noopener noreferrer" target="_blank">
                    <Globe className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
                  </a>
                )}
              </div>
            )}

            {/* Contact Information - Always visible */}
            {!isEditing && (
              <div className="relative z-10 mb-6 flex flex-col items-center justify-center gap-2 @lg:!flex-row @lg:!items-start @lg:!justify-start @lg:!gap-6">
                {profile.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <img alt="Email" className="size-6" src={`${iconPath}/Email.svg`} />
                    <a className="transition-colors hover:text-[#1D4FC4]" href={`mailto:${profile.email}`}>
                      {profile.email}
                    </a>
                  </div>
                )}
                {phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <img alt="Phone" className="size-6" src={`${iconPath}/Phne.svg`} />
                    <a className="transition-colors hover:text-[#1D4FC4]" href={`tel:${phoneNumber}`}>
                      {phoneNumber}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Mobile only: Apply Now Button - Centered at bottom */}
            {!isEditing && (
              <div className="relative z-10 flex justify-center @lg:!hidden">
                <Button
                  asChild
                  className="w-full rounded-lg px-12 py-3 text-lg font-semibold text-white shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  }}
                >
                  <a href={profile.arrive || '#'} rel="noopener noreferrer" target="_blank">
                    Apply Now
                  </a>
                </Button>
              </div>
            )}

            {/* Edit Mode Fields - Personal Information */}
            {isEditing && (
              <div className="relative z-10 space-y-4">
                <FloatingInput
                  className="bg-white/90"
                  id="display-name-profile"
                  label="Display Name"
                  onChange={(e) => setProfile({...profile, display_name: e.target.value})}
                  value={profile.display_name || ''}
                />
                <FloatingInput
                  className="bg-white/90"
                  id="email-profile"
                  label="Email"
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  type="email"
                  value={profile.email}
                />
                <FloatingInput
                  className="bg-white/90"
                  id="phone-profile"
                  label="Phone"
                  onChange={(e) => setProfile({...profile, phone_number: e.target.value})}
                  type="tel"
                  value={phoneNumber || ''}
                />
                <FloatingInput
                  className="bg-white/90"
                  id="title-edit"
                  label="Job Title"
                  onChange={(e) => setProfile({...profile, job_title: e.target.value})}
                  value={profile.job_title || ''}
                />
                <FloatingInput
                  className="bg-white/90"
                  id="location-edit"
                  label="Location"
                  onChange={(e) => setProfile({...profile, city_state: e.target.value})}
                  value={profile.city_state || ''}
                />

                {/* Directory Button Settings */}
                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-medium">Directory Card Button</Label>
                  <p className="text-xs text-gray-500">
                    Choose which button appears on your profile card in the team directory
                  </p>
                  <div className="space-y-2">
                    <label
                      className="flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors hover:bg-gray-50"
                      style={{
                        backgroundColor: profile.directory_button_type === 'schedule' ? '#eff6ff' : 'white',
                        borderColor: profile.directory_button_type === 'schedule' ? '#2563eb' : '#e5e7eb'
                      }}
                    >
                      <input
                        checked={profile.directory_button_type === 'schedule'}
                        className="size-4"
                        name="directory_button"
                        onChange={(e) => setProfile({...profile, directory_button_type: e.target.value as 'schedule' | 'call' | 'contact'})}
                        type="radio"
                        value="schedule"
                      />
                      <span className="text-sm font-medium">Schedule a Meeting</span>
                    </label>
                    <label
                      className="flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors hover:bg-gray-50"
                      style={{
                        backgroundColor: profile.directory_button_type === 'call' ? '#eff6ff' : 'white',
                        borderColor: profile.directory_button_type === 'call' ? '#2563eb' : '#e5e7eb'
                      }}
                    >
                      <input
                        checked={profile.directory_button_type === 'call'}
                        className="size-4"
                        name="directory_button"
                        onChange={(e) => setProfile({...profile, directory_button_type: e.target.value as 'schedule' | 'call' | 'contact'})}
                        type="radio"
                        value="call"
                      />
                      <span className="text-sm font-medium">Call Me</span>
                    </label>
                    <label
                      className="flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors hover:bg-gray-50"
                      style={{
                        backgroundColor: profile.directory_button_type === 'contact' ? '#eff6ff' : 'white',
                        borderColor: profile.directory_button_type === 'contact' ? '#2563eb' : '#e5e7eb'
                      }}
                    >
                      <input
                        checked={profile.directory_button_type === 'contact'}
                        className="size-4"
                        name="directory_button"
                        onChange={(e) => setProfile({...profile, directory_button_type: e.target.value as 'schedule' | 'call' | 'contact'})}
                        type="radio"
                        value="contact"
                      />
                      <span className="text-sm font-medium">Contact Form</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Action Buttons + Service Areas */}
        <div className="flex h-full flex-col space-y-4" style={{ backgroundColor: 'white' }}>
          {/* Action Buttons Card */}
          {!isEditing && (
            <Card className="rounded-sm border border-gray-200 shadow-lg @container">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-3">
                  <Button
                    className="relative w-full overflow-hidden whitespace-nowrap border-0 bg-white px-6 py-2 font-semibold shadow-lg transition-all hover:bg-gray-50"
                    onClick={generateVCard}
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
                    onClick={() => {
                      if (profile?.scheduling_url) {
                        // If scheduling is set up, open the scheduling page
                        window.open(profile.scheduling_url, '_blank');
                      } else if (isPublicView) {
                        // Public view without scheduling - show meeting request form
                        setShowMeetingRequestForm(true);
                      } else {
                        // Portal view - open the setup modal
                        setShowSchedulingModal(true);
                      }
                    }}
                    style={{
                      backgroundClip: 'padding-box, border-box',
                      backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                      backgroundOrigin: 'padding-box, border-box',
                      border: '2px solid transparent',
                    }}
                    variant="outline"
                  >
                    <span
                      className="flex items-center gap-2 font-semibold"
                      style={{
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                        backgroundClip: 'text',
                      }}
                    >
                      {profile?.scheduling_url ? (
                        <>
                          <Calendar className="size-4" style={{ color: '#2563eb' }} />
                          Schedule Meeting
                        </>
                      ) : isPublicView ? (
                        <>
                          <MessageSquare className="size-4" style={{ color: '#2563eb' }} />
                          Request Meeting
                        </>
                      ) : (
                        <>
                          <Settings className="size-4" style={{ color: '#2563eb' }} />
                          Set Up Scheduling
                        </>
                      )}
                    </span>
                  </Button>
                  <Button
                    className="relative w-full overflow-hidden whitespace-nowrap border-0 bg-white px-6 py-2 font-semibold shadow-lg transition-all hover:bg-gray-50"
                    onClick={() => {
                      if (phoneNumber) {
                        window.location.href = `tel:${phoneNumber}`;
                      }
                    }}
                    style={{
                      backgroundClip: 'padding-box, border-box',
                      backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                      backgroundOrigin: 'padding-box, border-box',
                      border: '2px solid transparent',
                    }}
                    variant="outline"
                  >
                    <span
                      className="flex items-center gap-2 font-semibold"
                      style={{
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                        backgroundClip: 'text',
                      }}
                    >
                      <Phone className="size-4" style={{ color: '#2563eb' }} />
                      Call Me
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service Areas Card */}
          <Card className="flex-1 rounded-sm border border-gray-200 shadow-lg @container" style={{ backgroundColor: 'white' }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <MapPin className="size-5" />
                Service Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 py-3">
              {/* Service Areas editing will be implemented in Professional Details section */}
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <FloatingInput
                      className="flex-1 bg-white"
                      id="service-state"
                      label="State"
                      onChange={(e) => setServiceAreaInput(e.target.value)}
                      value={serviceAreaInput}
                    />
                    <Button
                      className="text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => {
                        if (serviceAreaInput.trim() !== '') {
                          setProfile({
                            ...profile,
                            service_areas: [...(profile.service_areas || []), serviceAreaInput.trim()]
                          });
                          setServiceAreaInput('');
                        }
                      }}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <PlusCircle className="size-5" />
                    </Button>
                  </div>
                  {profile.service_areas && profile.service_areas.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">States Added</Label>
                      <div className="flex flex-wrap gap-2">
                        {profile.service_areas.map((area: string, index: number) => (
                          <Badge className="flex items-center gap-1 text-xs" key={index} variant="secondary">
                            {area}
                            <button
                              className="ml-1 hover:text-red-600"
                              onClick={() => {
                                setProfile({
                                  ...profile,
                                  service_areas: profile.service_areas?.filter((_: string, i: number) => i !== index)
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
                <div className="grid grid-cols-4 gap-3">
                  {profile.service_areas && profile.service_areas.length > 0 ? (
                    profile.service_areas.map((area: string, index: number) => {
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Second Row: Biography + Specialties & Credentials */}
      <div className="mb-4 grid grid-cols-1 gap-4 @lg:!grid-cols-[65%,35%]">
        {/* Biography Card */}
        <Card className="h-full rounded-sm border border-gray-200 shadow-lg @container">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <FileText className="size-5" />
            Professional Biography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Biography editing will be implemented in Professional Details section */}
          {isEditing ? (
            <RichTextEditor
              onChange={(value) => setProfile({...profile, biography: value})}
              placeholder="Share your professional background..."
              value={profile.biography || ''}
            />
          ) : (
            <div
              className="prose prose-sm max-w-none text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: profile.biography || '<p class="text-gray-500 italic">No biography provided.</p>' }}
            />
          )}
        </CardContent>
      </Card>

        {/* Specialties & Credentials Card */}
        <Card className="h-full rounded-sm border border-gray-200 shadow-lg @container">
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
            {/* Specialties editing will be implemented in Professional Details section */}
            {isEditing ? (
              <div className="grid grid-cols-1 gap-2 @lg:grid-cols-3">
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
                      checked={profile.specialties_lo?.includes(specialty) || false}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                      type="checkbox"
                    />
                    <span className="text-sm text-gray-700">{specialty}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.specialties_lo && profile.specialties_lo.length > 0 ? (
                  profile.specialties_lo.map((specialty) => (
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
            {/* Certifications editing will be implemented in Professional Details section */}
            {isEditing ? (
              <div className="grid grid-cols-1 gap-2 @lg:grid-cols-3">
                {[
                  'CMC - Certified Mortgage Consultant',
                  'CRMS - Certified Residential Mortgage Specialist',
                  'GMA - General Mortgage Associate',
                  'CVLS - Certified Veterans Lending Specialist'
                ].map((cert) => (
                  <label className="flex cursor-pointer items-center space-x-2" key={cert}>
                    <input
                      checked={profile.namb_certifications?.includes(cert) || false}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                      type="checkbox"
                    />
                    <span className="text-sm text-gray-700">{cert}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.namb_certifications && profile.namb_certifications.length > 0 ? (
                  profile.namb_certifications.map((cert) => (
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

      {/* Third Row: Custom Links + Links & Social */}
      <div className="mb-4 grid grid-cols-1 gap-4 @lg:!grid-cols-[65%,35%]">
        {/* Custom Links Card */}
        <Card className="h-full rounded-sm border border-gray-200 shadow-lg @container">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Link2 className="size-5" />
            Custom Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr,1fr,auto] items-center gap-2">
                <FloatingInput
                  className="bg-white"
                  id="link-title"
                  label="Link Title"
                  onChange={(e) => setCustomLinkInput({...customLinkInput, title: e.target.value})}
                  value={customLinkInput.title}
                />
                <FloatingInput
                  className="bg-white"
                  id="link-url"
                  label="URL"
                  onChange={(e) => setCustomLinkInput({...customLinkInput, url: e.target.value})}
                  type="url"
                  value={customLinkInput.url}
                />
                <Button
                  className="-mt-1.5 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
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
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <PlusCircle className="size-5" />
                </Button>
              </div>
              {profile.custom_links && profile.custom_links.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Links Added</Label>
                  <div className="space-y-2">
                    {profile.custom_links.map((link: any, index: number) => (
                      <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2" key={index}>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{link.title}</p>
                          <p className="truncate text-xs text-gray-500">{link.url}</p>
                        </div>
                        <button
                          className="px-2 text-red-500 hover:text-red-700"
                          onClick={() => {
                            setProfile({
                              ...profile,
                              custom_links: profile.custom_links?.filter((_: any, i: number) => i !== index)
                            });
                          }}
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
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {link.url}
                      </p>
                    </div>
                    <ExternalLink className="ml-2 size-4 shrink-0 text-gray-400 group-hover:text-blue-600" />
                  </a>
                ))
              ) : (
                <p className="py-4 text-center text-sm italic text-gray-500">No custom links added yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

        {/* Links & Social Card */}
        <Card className="h-full rounded-sm border border-gray-200 shadow-lg @container">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Globe className="size-5" />
              Links & Social
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 py-3">
            <div className="grid grid-cols-2 gap-2">
              {/* Links & Social editing will be implemented in Social Media section */}
              {isEditing ? (
                <>
                  <FloatingInput
                    id="website"
                    label="Website"
                    onChange={(e) => setProfile({...profile, website: e.target.value})}
                    type="url"
                    value={profile.website || ''}
                  />
                  <FloatingInput
                    id="linkedin"
                    label="LinkedIn"
                    onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})}
                    type="url"
                    value={profile.linkedin_url || ''}
                  />
                  <FloatingInput
                    id="facebook"
                    label="Facebook"
                    onChange={(e) => setProfile({...profile, facebook_url: e.target.value})}
                    type="url"
                    value={profile.facebook_url || ''}
                  />
                  <FloatingInput
                    id="instagram"
                    label="Instagram"
                    onChange={(e) => setProfile({...profile, instagram_url: e.target.value})}
                    type="url"
                    value={profile.instagram_url || ''}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 rounded border p-2">
                    <Globe className="size-4 text-gray-600" />
                    <span className="truncate text-xs">{profile.website || 'Website'}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded border p-2">
                    <Linkedin className="size-4 text-gray-600" />
                    <span className="truncate text-xs">{profile.linkedin_url || 'LinkedIn'}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded border p-2">
                    <Facebook className="size-4 text-gray-600" />
                    <span className="truncate text-xs">{profile.facebook_url || 'Facebook'}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded border p-2">
                    <Smartphone className="size-4 text-gray-600" />
                    <span className="truncate text-xs">{profile.instagram_url || 'Instagram'}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
    </div>

      {/* Bottom Bar - Device Preview + Edit or Save/Cancel */}
      {!isPublicView && (
        <div className="fixed bottom-0 right-0 left-[var(--workspace-sidebar-width,280px)] z-[999] border-t border-gray-200 bg-white shadow-lg">
          <div className="mx-auto flex max-w-[1290px] items-center justify-between gap-3 px-4 py-3">
            {/* Device Preview Buttons - Left Side */}
            <div className="flex items-center gap-1">
              <span className="mr-2 text-xs font-medium uppercase tracking-wider text-gray-500">Preview</span>
              <Button
                className="size-9 p-0"
                onClick={() => setViewport('desktop')}
                size="sm"
                style={viewport === 'desktop' ? {
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  color: 'white'
                } : {}}
                variant={viewport === 'desktop' ? 'default' : 'outline'}
              >
                <Monitor className="size-4" />
              </Button>
              <Button
                className="size-9 p-0"
                onClick={() => setViewport('tablet')}
                size="sm"
                style={viewport === 'tablet' ? {
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  color: 'white'
                } : {}}
                variant={viewport === 'tablet' ? 'default' : 'outline'}
              >
                <Tablet className="size-4" />
              </Button>
              <Button
                className="size-9 p-0"
                onClick={() => setViewport('mobile')}
                size="sm"
                style={viewport === 'mobile' ? {
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  color: 'white'
                } : {}}
                variant={viewport === 'mobile' ? 'default' : 'outline'}
              >
                <Smartphone className="size-4" />
              </Button>
            </div>

            {/* Edit/Save Buttons - Right Side */}
            <div className="flex items-center gap-3">
            {!activeSection ? (
              <Button
                className="px-8 py-2 font-semibold text-white"
                onClick={() => setActiveSection('edit')}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                }}
              >
                <Edit className="mr-2 size-4" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  className="px-6"
                  disabled={isSaving}
                  onClick={() => {
                    if (originalProfile) {
                      setProfile(originalProfile);
                    }
                    setActiveSection(null);
                    setError(null);
                  }}
                  variant="outline"
                >
                  <X className="mr-2 size-4" />
                  Cancel
                </Button>
                <Button
                  className="px-6 text-white"
                  disabled={isSaving}
                  onClick={async () => {
                    if (!profile) {return;}

                    setIsSaving(true);
                    setContextSaving(true);
                    setError(null);

                    try {
                      const response = await fetch(`/wp-json/frs-users/v1/profiles/${profile.id}`, {
                        body: JSON.stringify(profile),
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json',
                          'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || ''
                        },
                        method: 'PUT'
                      });

                      if (response.ok) {
                        const result = await response.json();
                        const updatedProfile = result.data || result;
                        setProfile(updatedProfile);
                        setOriginalProfile(updatedProfile);
                        setActiveSection(null);

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
                    } catch {
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
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  }}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner className="mr-2 size-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 size-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Scheduling Setup Modal (Portal View Only) */}
      {showSchedulingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex h-[80vh] w-[90vw] max-w-4xl flex-col rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="size-5" />
                Set Up Your Scheduling Calendar
              </h2>
              <Button
                className="size-8 p-0"
                onClick={() => setShowSchedulingModal(false)}
                size="sm"
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                className="size-full border-0"
                ref={setIframeRef}
                src={`/my-bookings#/calendars/${profile?.calendar_id || 6}/settings/remote-calendars`}
                title="Calendar Setup"
              />
            </div>
            <div className="flex items-center justify-end gap-3 border-t p-4">
              <p className="flex-1 text-sm text-gray-500">
                Connect your calendar to enable scheduling. Click &quot;Done&quot; when finished.
              </p>
              <Button
                onClick={() => setShowSchedulingModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="text-white"
                onClick={() => {
                  setShowSchedulingModal(false);
                  // Show success message
                  const successMsg = document.createElement('div');
                  successMsg.className = 'fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                  successMsg.textContent = 'Calendar setup complete!';
                  document.body.append(successMsg);
                  setTimeout(() => successMsg.remove(), 3000);
                }}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Request Form (Public View - FluentForms via iframe) */}
      {showMeetingRequestForm && !meetingFormSubmitted && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          {/* Back Button */}
          <button
            className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-base text-gray-600 backdrop-blur-sm hover:text-gray-900"
            onClick={() => setShowMeetingRequestForm(false)}
          >
            ← Back to Profile
          </button>

          {/* FluentForms Iframe - Form ID 7 is Schedule Appointment */}
          <div className="w-full flex-1">
            <iframe
              className="size-full border-0"
              ref={(iframe) => {
                if (iframe) {
                  // Set up external link handler
                  setIframeRef(iframe);

                  // Listen for FluentForms submission success inside iframe (same-origin)
                  const setupFluentFormListener = () => {
                    try {
                      const iframeWindow = iframe.contentWindow;
                      const iframeJQuery = iframeWindow && (iframeWindow as any).jQuery;

                      if (iframeJQuery) {
                        iframeJQuery(iframeWindow?.document.body).on(
                          'fluentform_submission_success',
                          () => {
                            console.log('FluentForm submission detected in iframe');
                            setMeetingFormSubmitted(true);
                          }
                        );
                        console.log('FluentForm listener attached to iframe');
                      }
                    } catch (error_) {
                      console.log('Could not attach FluentForm listener:', error_);
                    }
                  };

                  // Try on load
                  iframe.addEventListener('load', () => {
                    // Wait a bit for jQuery to be available
                    setTimeout(setupFluentFormListener, 500);
                  });
                }
              }}
              src={`/?fluent-form=7&loan_officer_id=${profile?.user_id || ''}`}
              title="Schedule Appointment Form"
            />
          </div>
        </div>
      )}

      {/* Thank You Screen (after form submission) - matches biolink style */}
      {showMeetingRequestForm && meetingFormSubmitted && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            className="absolute inset-0 size-full object-cover"
            loop
            muted
            playsInline
          >
            <source src={gradientUrl} type="video/mp4" />
          </video>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-lg text-center">
              <h2
                className="mb-6 text-4xl font-bold text-white md:text-5xl"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
              >
                Thank You!
              </h2>

              <p
                className="mb-10 text-lg leading-relaxed text-white md:text-xl"
                style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}
              >
                Thanks for reaching out! {profile?.first_name} will personally review your information and get back to you soon.
              </p>

              <div className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
                <button
                  className="flex-1 rounded-xl px-8 py-4 font-medium text-gray-900 transition-all hover:-translate-y-1"
                  onClick={() => {
                    setShowMeetingRequestForm(false);
                    setMeetingFormSubmitted(false);
                  }}
                  style={{
                    background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  Return to Profile
                </button>

                <button
                  className="flex-1 rounded-xl px-8 py-4 font-medium text-gray-900 transition-all hover:-translate-y-1"
                  onClick={() => window.close()}
                  style={{
                    background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  Close Tab
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}

// Backwards compatibility export
export const PublicProfileView = ProfileEditorView;
