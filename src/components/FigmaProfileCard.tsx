import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import QRCodeStyling from 'qr-code-styling';

interface FigmaProfileCardProps {
  city_state?: string;
  email: string;
  first_name: string;
  headshot_url?: string;
  id?: number;
  job_title?: string;
  last_name: string;
  mobile_number?: string;
  nmls_number?: string;
  onApplyNow?: () => void;
  onMenuClick?: () => void;
  onScheduleMeeting?: () => void;
  phone_number?: string;
  profile_slug?: string;
  select_person_type?: 'loan_officer' | 'agent' | 'staff' | 'leadership' | 'assistant';
}

/**
 * FigmaProfileCard - Profile card matching Figma design specifications
 *
 * Features:
 * - 437px × 431px dimensions
 * - Blurred gradient background header
 * - Avatar with QR code flip functionality
 * - Gradient text for title/NMLS
 * - Contact info with icon badges
 * - Two action buttons (Schedule a Meeting, Apply Now)
 * - 3-dot menu in top right corner
 */
export function FigmaProfileCard({
  city_state = 'San Francisco, CA',
  email,
  first_name,
  headshot_url,
  id,
  job_title = 'Digital Director',
  last_name,
  mobile_number,
  nmls_number,
  onApplyNow,
  onMenuClick,
  onScheduleMeeting,
  phone_number,
  profile_slug,
  select_person_type = 'loan_officer'
}: FigmaProfileCardProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const fullName = `${first_name} ${last_name}`;
  const phoneNumber = phone_number || mobile_number || '';
  const gradientUrl = (window as any).frsPortalConfig?.gradientUrl || '';
  const contentUrl = (window as any).frsPortalConfig?.contentUrl || '/wp-content';
  const iconPath = `${contentUrl}/plugins/frs-wp-users/assets/images`;
  const siteUrl = window.location.origin;

  // Determine directory path based on person type (matches DirectoryProfileCard)
  const getDirectoryPath = () => {
    const slug = profile_slug || `${first_name.toLowerCase()}-${last_name.toLowerCase()}`;
    switch (select_person_type) {
      case 'loan_officer':
        return `/lo/${slug}`;
      case 'agent':
        return `/agent/${slug}`;
      case 'staff':
        return `/staff/${slug}`;
      case 'leadership':
        return `/leadership/${slug}`;
      case 'assistant':
        return `/assistant/${slug}`;
      default:
        return `/lo/${slug}`;
    }
  };

  const directoryPath = getDirectoryPath();
  const qrProfileUrl = `${siteUrl}/directory#${directoryPath}`;

  // Generate QR Code
  useEffect(() => {
    if (qrCodeRef.current && showQRCode) {
      qrCodeRef.current.innerHTML = '';

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
        height: 96,
        margin: 0,
        qrOptions: {
          errorCorrectionLevel: 'L',
          mode: 'Byte',
          typeNumber: 0
        },
        shape: 'square',
        type: 'canvas',
        width: 96
      });

      qrCode.append(qrCodeRef.current);
    }
  }, [showQRCode, qrProfileUrl]);

  return (
    <div
      className="relative h-[431px] w-[437px] overflow-hidden rounded border border-blue-600 bg-white"
      style={{ fontFamily: 'Mona Sans, sans-serif' }}
    >
      {/* Gradient Background Header - Blurred */}
      <div className="absolute inset-x-0 top-0 h-[139px] overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[227px] w-full"
          style={{ filter: 'blur(30px)' }}
        >
          <video
            autoPlay
            className="size-full object-cover"
            loop
            muted
            playsInline
          >
            <source src={gradientUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>

      {/* 3-Dot Menu Button - Top Right */}
      <button
        aria-label="Menu"
        className="absolute right-[10px] top-[10px] z-20 flex size-8 items-center justify-center rounded-full border-2 border-[#2dd4da] bg-white transition-colors hover:bg-gray-50"
        onClick={onMenuClick}
      >
        <svg fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
          <circle cx="12" cy="5" fill="currentColor" r="1.5" stroke="none"/>
          <circle cx="12" cy="12" fill="currentColor" r="1.5" stroke="none"/>
          <circle cx="12" cy="19" fill="currentColor" r="1.5" stroke="none"/>
        </svg>
      </button>

      {/* Avatar with QR Code Flip */}
      <div className="absolute left-[145px] top-[44px] z-10 w-[148px]">
        <div
          className="relative size-[148px]"
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative size-full transition-transform duration-700"
            style={{
              transform: showQRCode ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Front - Avatar */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div
                className="size-full overflow-hidden rounded-full border-4"
                style={{ borderColor: '#5ce1e6' }}
              >
                <img
                  alt={fullName}
                  className="size-full object-cover"
                  src={headshot_url || 'https://via.placeholder.com/148'}
                />
              </div>
            </div>

            {/* Back - QR Code */}
            <div
              className="absolute inset-0 rounded-full border border-gray-800 bg-white"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="flex size-full items-center justify-center p-[26px]">
                <div className="size-[96px]" ref={qrCodeRef} />
              </div>
            </div>
          </div>

          {/* QR Code Toggle Button */}
          <button
            aria-label="Toggle QR Code"
            className="absolute right-0 top-0 z-20 flex size-[35px] items-center justify-center rounded-full border border-[#2dd4da] bg-[#f3f3f3] transition-colors hover:bg-gray-100"
            onClick={() => setShowQRCode(!showQRCode)}
          >
            <svg fill="none" height="26" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="26">
              <rect height="7" rx="1.5" width="7" x="3" y="3"/>
              <rect height="7" rx="1.5" width="7" x="14" y="3"/>
              <rect height="7" rx="1.5" width="7" x="3" y="14"/>
              <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
              <path d="M21 21v.01"/>
              <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
              <path d="M3 12h.01"/>
              <path d="M12 3h.01"/>
              <path d="M12 16v.01"/>
              <path d="M16 12h1"/>
              <path d="M21 12v.01"/>
              <path d="M12 21v-1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content Area - Name, Title, Contact */}
      <div className="absolute inset-x-1 top-[216px] flex flex-col items-center gap-[9px] px-0 pb-0 pt-4">
        {/* Name */}
        <h3
          className="text-[30px] font-bold leading-[36px] text-[#020817]"
          style={{ fontFamily: 'Mona Sans, sans-serif' }}
        >
          {fullName}
        </h3>

        {/* Title and NMLS - Gradient Text */}
        <div className="flex h-6 flex-wrap items-center justify-center gap-1">
          <p
            className="text-base leading-6"
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              background: 'linear-gradient(90deg, #2dd4da 0%, #2563eb 100%)',
              backgroundClip: 'text',
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            {job_title}
            {nmls_number && ` | NMLS ${nmls_number}`}
          </p>
        </div>

        {/* Email */}
        <div className="flex h-[26px] items-center gap-2">
          <div className="flex size-[25px] items-center justify-center rounded-full border border-[#2dd4da] bg-[#f3f3f3]">
            <svg fill="none" height="16" stroke="#2dd4da" strokeWidth="2" viewBox="0 0 24 24" width="18">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <a
            className="text-[15.8px] leading-6 text-blue-600 hover:underline"
            href={`mailto:${email}`}
            style={{ fontFamily: 'Mona Sans, sans-serif', letterSpacing: '-0.32px' }}
          >
            {email}
          </a>
        </div>

        {/* Phone and Location */}
        <div className="flex items-center gap-1.5">
          {/* Phone */}
          <div className="flex items-center gap-2">
            <div className="flex size-[25px] items-center justify-center rounded-full border border-[#2dd4da] bg-[#f3f3f3]">
              <svg fill="none" height="18" stroke="#2dd4da" strokeWidth="2" viewBox="0 0 24 24" width="18">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </div>
            <a
              className="text-[15.8px] leading-6 text-blue-600 hover:underline"
              href={`tel:${phoneNumber.replaceAll(/[^\d+]/g, '')}`}
              style={{ fontFamily: 'Mona Sans, sans-serif', letterSpacing: '-0.32px' }}
            >
              {phoneNumber}
            </a>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <div className="flex size-[25px] items-center justify-center rounded-full border border-[#2dd4da] bg-[#f3f3f3]">
              <svg
                className="rotate-[282.794deg]"
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <circle cx="12" cy="12" r="10" stroke="#2dd4da" strokeWidth="2"/>
                <circle cx="12" cy="12" fill="#2dd4da" r="3"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#2dd4da" strokeLinecap="round" strokeWidth="2"/>
              </svg>
            </div>
            <span
              className="text-[15.8px] leading-6 text-[#1d4fc4]"
              style={{ fontFamily: 'Mona Sans, sans-serif', letterSpacing: '-0.32px' }}
            >
              {city_state}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute inset-x-10 top-[364px] flex gap-4">
        <Button
          className="h-[42px] flex-1 rounded border border-blue-600 bg-white text-[#4678eb] hover:bg-blue-50"
          onClick={onScheduleMeeting}
          style={{ fontFamily: 'Mona Sans, sans-serif' }}
          variant="outline"
        >
          <span className="text-[15.8px] leading-6" style={{ letterSpacing: '-0.32px' }}>
            Schedule a Meeting
          </span>
        </Button>
        <Button
          className="h-[42px] flex-1 rounded border-0 text-white"
          onClick={onApplyNow}
          style={{
            background: 'linear-gradient(90deg, #2dd4da 0%, #2563eb 100%)',
            fontFamily: 'Mona Sans, sans-serif'
          }}
        >
          <span className="text-[15.8px] font-bold leading-6" style={{ letterSpacing: '-0.32px' }}>
            Apply Now
          </span>
        </Button>
      </div>
    </div>
  );
}
