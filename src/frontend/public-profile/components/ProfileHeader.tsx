/**
 * Profile Header Component
 *
 * Matches FRS profile styling with BuddyPress cover image support
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QRCodeStyling from 'qr-code-styling';
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Linkedin,
  Facebook,
  Smartphone,
} from 'lucide-react';

interface ProfileHeaderProps {
  profile: {
    first_name: string;
    last_name: string;
    email?: string;
    phone_number?: string;
    mobile_number?: string;
    job_title?: string;
    headshot_url?: string;
    nmls_id?: string;
    nmls_number?: string;
    city_state?: string;
    linkedin_url?: string;
    facebook_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    youtube_url?: string;
    website?: string;
    profile_slug?: string;
    arrive?: string;
  };
  coverImageUrl?: string;
  gradientUrl: string;
  iconPath: string;
  bpPluginUrl: string;
  showBPStats?: boolean;
  lastActivity?: { timediff: string };
  friendCount?: number;
  groupCount?: number;
  isOwnProfile?: boolean;
}

export function ProfileHeader({
  profile,
  coverImageUrl,
  gradientUrl,
  iconPath,
  bpPluginUrl,
  showBPStats = false,
  lastActivity,
  isOwnProfile = true,
  friendCount = 0,
  groupCount = 0,
}: ProfileHeaderProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const phoneNumber = profile.phone_number || profile.mobile_number;

  // Generate QR Code
  useEffect(() => {
    if (qrCodeRef.current && profile) {
      qrCodeRef.current.innerHTML = '';

      const siteUrl = window.location.origin;
      const profileSlug = profile.profile_slug || `${profile.first_name?.toLowerCase()}-${profile.last_name?.toLowerCase()}`;
      const profileUrl = `${siteUrl}/profile/${profileSlug}`;

      const qrCode = new QRCodeStyling({
        type: 'canvas',
        width: 85,
        height: 85,
        data: profileUrl,
        dotsOptions: {
          type: 'extra-rounded',
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
              { offset: 0, color: '#2563eb' },
              { offset: 1, color: '#2dd4da' }
            ]
          }
        },
        cornersDotOptions: {
          type: 'dot',
          gradient: {
            type: 'linear',
            rotation: 0,
            colorStops: [
              { offset: 0, color: '#2563eb' },
              { offset: 1, color: '#2dd4da' }
            ]
          }
        }
      });

      qrCode.append(qrCodeRef.current);
    }
  }, [profile, showQRCode]);

  return (
    <Card className="@container shadow-lg rounded border border-gray-200">
      <CardContent className="p-8 relative overflow-hidden bg-gray-50">
        {/* Background - Use cover image if available, otherwise gradient */}
        <div className="absolute top-0 left-0 right-0 w-full overflow-hidden" style={{ height: '149px', zIndex: 0 }}>
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : gradientUrl ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ filter: 'blur(30px)', transform: 'scale(1.2)' }}
            >
              <source src={gradientUrl} type="video/mp4" />
            </video>
          ) : null}
        </div>

        {/* Avatar with Gradient Border - Flip Card */}
        <div className="mb-4 relative z-10 mx-auto @lg:!mx-0" style={{ perspective: '1000px', width: '148px' }}>
          <div
            className="relative transition-transform duration-700"
            style={{
              width: '148px',
              height: '148px',
              transformStyle: 'preserve-3d',
              transform: showQRCode ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front Side - Avatar */}
            <div
              className="absolute inset-0 rounded-full overflow-visible"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div
                className="w-full h-full rounded-full overflow-hidden"
                style={{
                  border: '3px solid transparent',
                  borderRadius: '50%',
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
                      {profile.first_name?.[0] || '?'}{profile.last_name?.[0] || ''}
                    </span>
                  </div>
                )}
              </div>

              {/* QR Code button */}
              <Button
                size="sm"
                className="absolute rounded-full w-10 h-10 p-0 bg-transparent hover:bg-transparent shadow-lg z-20 border-0"
                style={{
                  top: '5px',
                  right: '5px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none'
                }}
                onClick={() => setShowQRCode(!showQRCode)}
                type="button"
              >
                <img src={`${bpPluginUrl}assets/images/qr-flip.svg`} alt="QR Code" className="w-10 h-10" />
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
                  borderRadius: '50%',
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  backgroundOrigin: 'padding-box, border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
              >
                <div className="w-full h-full flex items-center justify-center bg-white p-5">
                  <div
                    ref={qrCodeRef}
                    style={{
                      width: '85px',
                      height: '85px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                </div>
              </div>

              {/* Avatar button - flips back */}
              <Button
                size="sm"
                className="absolute rounded-full w-10 h-10 p-0 bg-transparent hover:bg-transparent shadow-lg z-20 border-0"
                style={{
                  top: '5px',
                  right: '5px',
                  transform: 'scaleX(-1)',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none'
                }}
                onClick={() => setShowQRCode(!showQRCode)}
                type="button"
              >
                <img src={`${bpPluginUrl}assets/images/profile-flip.svg`} alt="Profile" className="w-10 h-10" style={{ transform: 'scaleX(-1)' }} />
              </Button>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="flex flex-col @lg:!flex-row items-center @lg:!items-start justify-center @lg:!justify-between mb-2 relative z-10 gap-4 text-center @lg:!text-left">
          <h3 className="text-[34px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Mona Sans Extended, sans-serif' }}>
            {fullName}
          </h3>
          {isOwnProfile ? (
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
          ) : (
            <Button
              className="hidden @lg:!inline-flex text-white font-semibold px-6 py-2 shadow-lg whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
              }}
            >
              Connect
            </Button>
          )}
        </div>

        {/* Job Title, NMLS, and Location */}
        <div className="mb-4 relative z-10">
          <p className="text-base text-[#1D4FC4] flex flex-col @lg:!flex-row items-center @lg:!items-start justify-center @lg:!justify-start gap-2 @lg:!gap-6 text-center @lg:!text-left" style={{ fontFamily: 'Roboto, sans-serif' }}>
            <span>
              {profile.job_title || 'Loan Officer'}
              {(profile.nmls_id || profile.nmls_number) && <span> | NMLS {profile.nmls_id || profile.nmls_number}</span>}
            </span>
            {profile.city_state && (
              <span className="flex items-center justify-center @lg:!justify-start gap-2">
                <MapPin className="h-4 w-4" />
                {profile.city_state}
              </span>
            )}
          </p>
        </div>

        {/* Social Media Icons Row */}
        {(profile.linkedin_url || profile.facebook_url || profile.instagram_url || profile.twitter_url || profile.youtube_url || profile.website) && (
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
            {(profile.twitter_url || profile.youtube_url || profile.website) && (
              <a href={profile.twitter_url || profile.youtube_url || profile.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-6 w-6 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
              </a>
            )}
          </div>
        )}

        {/* Contact Information */}
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

        {/* Mobile only: Apply Now / Connect Button */}
        <div className="@lg:!hidden flex justify-center relative z-10">
          {isOwnProfile ? (
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
          ) : (
            <Button
              className="text-white font-semibold px-12 py-3 shadow-lg text-lg rounded-lg w-full"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
              }}
            >
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
