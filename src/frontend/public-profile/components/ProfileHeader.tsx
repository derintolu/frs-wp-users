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
  MapPin,
  Globe,
  Linkedin,
  Facebook,
  Smartphone,
} from 'lucide-react';

interface ProfileHeaderProps {
  bpPluginUrl: string;
  coverImageUrl?: string;
  friendCount?: number;
  gradientUrl: string;
  groupCount?: number;
  iconPath: string;
  isOwnProfile?: boolean;
  lastActivity?: { timediff: string };
  profile: {
    arrive?: string;
    city_state?: string;
    email?: string;
    facebook_url?: string;
    first_name: string;
    headshot_url?: string;
    instagram_url?: string;
    job_title?: string;
    last_name: string;
    linkedin_url?: string;
    mobile_number?: string;
    nmls_id?: string;
    nmls_number?: string;
    phone_number?: string;
    profile_slug?: string;
    twitter_url?: string;
    website?: string;
    youtube_url?: string;
  };
  showBPStats?: boolean;
}

export function ProfileHeader({
  bpPluginUrl,
  coverImageUrl,
  friendCount = 0,
  gradientUrl,
  groupCount = 0,
  iconPath,
  isOwnProfile = true,
  lastActivity,
  profile,
  showBPStats = false,
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
        backgroundOptions: {
          color: '#ffffff'
        },
        cornersDotOptions: {
          gradient: {
            colorStops: [
              { color: '#2563eb', offset: 0 },
              { color: '#2dd4da', offset: 1 }
            ],
            rotation: 0,
            type: 'linear'
          },
          type: 'dot'
        },
        cornersSquareOptions: {
          gradient: {
            colorStops: [
              { color: '#2563eb', offset: 0 },
              { color: '#2dd4da', offset: 1 }
            ],
            rotation: 0,
            type: 'linear'
          },
          type: 'extra-rounded'
        },
        data: profileUrl,
        dotsOptions: {
          gradient: {
            colorStops: [
              { color: '#2563eb', offset: 0 },
              { color: '#2dd4da', offset: 1 }
            ],
            rotation: 0,
            type: 'linear'
          },
          type: 'extra-rounded'
        },
        height: 85,
        type: 'canvas',
        width: 85
      });

      qrCode.append(qrCodeRef.current);
    }
  }, [profile, showQRCode]);

  return (
    <Card className="rounded border border-gray-200 shadow-lg @container">
      <CardContent className="relative overflow-hidden bg-gray-50 p-8">
        {/* Background - Use cover image if available, otherwise gradient */}
        <div className="absolute inset-x-0 top-0 w-full overflow-hidden" style={{ height: '149px', zIndex: 0 }}>
          {coverImageUrl ? (
            <img
              alt="Cover"
              className="size-full object-cover"
              src={coverImageUrl}
            />
          ) : gradientUrl ? (
            <video
              autoPlay
              className="size-full object-cover"
              loop
              muted
              playsInline
              style={{ filter: 'blur(30px)', transform: 'scale(1.2)' }}
            >
              <source src={gradientUrl} type="video/mp4" />
            </video>
          ) : null}
        </div>

        {/* Avatar with Gradient Border - Flip Card */}
        <div className="relative z-10 mx-auto mb-4 @lg:!mx-0" style={{ perspective: '1000px', width: '148px' }}>
          <div
            className="relative transition-transform duration-700"
            style={{
              height: '148px',
              transform: showQRCode ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
              width: '148px'
            }}
          >
            {/* Front Side - Avatar */}
            <div
              className="absolute inset-0 overflow-visible rounded-full"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div
                className="size-full overflow-hidden rounded-full"
                style={{
                  backgroundClip: 'padding-box, border-box',
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  backgroundOrigin: 'padding-box, border-box',
                  border: '3px solid transparent',
                  borderRadius: '50%',
                }}
              >
                {profile.headshot_url ? (
                  <img alt="Profile" className="size-full object-cover" src={profile.headshot_url} />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gray-100">
                    <span className="text-3xl font-semibold text-gray-600">
                      {profile.first_name?.[0] || '?'}{profile.last_name?.[0] || ''}
                    </span>
                  </div>
                )}
              </div>

              {/* QR Code button */}
              <Button
                className="absolute z-20 size-10 rounded-full border-0 bg-transparent p-0 shadow-lg hover:bg-transparent"
                onClick={() => setShowQRCode(!showQRCode)}
                size="sm"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  boxShadow: 'none',
                  right: '5px',
                  top: '5px'
                }}
                type="button"
              >
                <img alt="QR Code" className="size-10" src={`${bpPluginUrl}assets/images/qr-flip.svg`} />
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
                  borderRadius: '50%',
                }}
              >
                <div className="flex size-full items-center justify-center bg-white p-5">
                  <div
                    ref={qrCodeRef}
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      height: '85px',
                      justifyContent: 'center',
                      width: '85px'
                    }}
                  />
                </div>
              </div>

              {/* Avatar button - flips back */}
              <Button
                className="absolute z-20 size-10 rounded-full border-0 bg-transparent p-0 shadow-lg hover:bg-transparent"
                onClick={() => setShowQRCode(!showQRCode)}
                size="sm"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  boxShadow: 'none',
                  right: '5px',
                  top: '5px',
                  transform: 'scaleX(-1)'
                }}
                type="button"
              >
                <img alt="Profile" className="size-10" src={`${bpPluginUrl}assets/images/profile-flip.svg`} style={{ transform: 'scaleX(-1)' }} />
              </Button>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="relative z-10 mb-2 flex flex-col items-center justify-center gap-4 text-center @lg:!flex-row @lg:!items-start @lg:!justify-between @lg:!text-left">
          <h3 className="text-[34px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Mona Sans Extended, sans-serif' }}>
            {fullName}
          </h3>
          {isOwnProfile ? (
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
          ) : (
            <Button
              className="hidden whitespace-nowrap px-6 py-2 font-semibold text-white shadow-lg @lg:!inline-flex"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
              }}
            >
              Connect
            </Button>
          )}
        </div>

        {/* Job Title, NMLS, and Location */}
        <div className="relative z-10 mb-4">
          <p className="flex flex-col items-center justify-center gap-2 text-center text-base text-[#1D4FC4] @lg:!flex-row @lg:!items-start @lg:!justify-start @lg:!gap-6 @lg:!text-left" style={{ fontFamily: 'Roboto, sans-serif' }}>
            <span>
              {profile.job_title || 'Loan Officer'}
              {(profile.nmls_id || profile.nmls_number) && <span> | NMLS {profile.nmls_id || profile.nmls_number}</span>}
            </span>
            {profile.city_state && (
              <span className="flex items-center justify-center gap-2 @lg:!justify-start">
                <MapPin className="size-4" />
                {profile.city_state}
              </span>
            )}
          </p>
        </div>

        {/* Social Media Icons Row */}
        {(profile.linkedin_url || profile.facebook_url || profile.instagram_url || profile.twitter_url || profile.youtube_url || profile.website) && (
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
            {(profile.twitter_url || profile.youtube_url || profile.website) && (
              <a href={profile.twitter_url || profile.youtube_url || profile.website} rel="noopener noreferrer" target="_blank">
                <Globe className="size-6 text-[#1A1A1A] transition-colors hover:text-[#2563eb]" />
              </a>
            )}
          </div>
        )}

        {/* Contact Information */}
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

        {/* Mobile only: Apply Now / Connect Button */}
        <div className="relative z-10 flex justify-center @lg:!hidden">
          {isOwnProfile ? (
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
          ) : (
            <Button
              className="w-full rounded-lg px-12 py-3 text-lg font-semibold text-white shadow-lg"
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
