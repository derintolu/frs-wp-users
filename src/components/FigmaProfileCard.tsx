import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import QRCodeStyling from 'qr-code-styling';

interface FigmaProfileCardProps {
  id?: number;
  first_name: string;
  last_name: string;
  job_title?: string;
  nmls_number?: string;
  email: string;
  phone_number?: string;
  mobile_number?: string;
  city_state?: string;
  headshot_url?: string;
  profile_slug?: string;
  select_person_type?: 'loan_officer' | 'agent' | 'staff' | 'leadership' | 'assistant';
  onScheduleMeeting?: () => void;
  onApplyNow?: () => void;
  onMenuClick?: () => void;
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
  first_name,
  last_name,
  job_title = 'Digital Director',
  nmls_number,
  email,
  phone_number,
  mobile_number,
  city_state = 'San Francisco, CA',
  headshot_url,
  profile_slug,
  select_person_type = 'loan_officer',
  id,
  onScheduleMeeting,
  onApplyNow,
  onMenuClick
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
        type: 'canvas',
        shape: 'square',
        width: 96,
        height: 96,
        data: qrProfileUrl,
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
    }
  }, [showQRCode, qrProfileUrl]);

  return (
    <div
      className="relative w-[437px] h-[431px] bg-white border border-blue-600 rounded overflow-hidden"
      style={{ fontFamily: 'Mona Sans, sans-serif' }}
    >
      {/* Gradient Background Header - Blurred */}
      <div className="absolute top-0 left-0 right-0 h-[139px] overflow-hidden">
        <div
          className="absolute w-full h-[227px] top-0 left-0 right-0"
          style={{ filter: 'blur(30px)' }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={gradientUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>

      {/* 3-Dot Menu Button - Top Right */}
      <button
        onClick={onMenuClick}
        className="absolute top-[10px] right-[10px] w-8 h-8 bg-white border-2 border-[#2dd4da] rounded-full flex items-center justify-center z-20 hover:bg-gray-50 transition-colors"
        aria-label="Menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
      </button>

      {/* Avatar with QR Code Flip */}
      <div className="absolute left-[145px] top-[44px] w-[148px] z-10">
        <div
          className="relative w-[148px] h-[148px]"
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative w-full h-full transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: showQRCode ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front - Avatar */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div
                className="w-full h-full rounded-full overflow-hidden border-4"
                style={{ borderColor: '#5ce1e6' }}
              >
                <img
                  src={headshot_url || 'https://via.placeholder.com/148'}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Back - QR Code */}
            <div
              className="absolute inset-0 rounded-full bg-white border border-gray-800"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="w-full h-full flex items-center justify-center p-[26px]">
                <div ref={qrCodeRef} className="w-[96px] h-[96px]" />
              </div>
            </div>
          </div>

          {/* QR Code Toggle Button */}
          <button
            onClick={() => setShowQRCode(!showQRCode)}
            className="absolute top-0 right-0 w-[35px] h-[35px] bg-[#f3f3f3] border border-[#2dd4da] rounded-full flex items-center justify-center z-20 hover:bg-gray-100 transition-colors"
            aria-label="Toggle QR Code"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
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
      <div className="absolute left-1 right-1 top-[216px] flex flex-col items-center gap-[9px] px-0 pb-0 pt-4">
        {/* Name */}
        <h3
          className="text-[30px] font-bold text-[#020817] leading-[36px]"
          style={{ fontFamily: 'Mona Sans, sans-serif' }}
        >
          {fullName}
        </h3>

        {/* Title and NMLS - Gradient Text */}
        <div className="flex flex-wrap gap-1 items-center justify-center h-6">
          <p
            className="text-base leading-6"
            style={{
              fontFamily: 'Roboto, sans-serif',
              background: 'linear-gradient(90deg, #2dd4da 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {job_title}
            {nmls_number && ` | NMLS ${nmls_number}`}
          </p>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 h-[26px]">
          <div className="w-[25px] h-[25px] bg-[#f3f3f3] border border-[#2dd4da] rounded-full flex items-center justify-center">
            <svg width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="#2dd4da" strokeWidth="2">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <a
            href={`mailto:${email}`}
            className="text-[15.8px] text-blue-600 leading-6 hover:underline"
            style={{ fontFamily: 'Mona Sans, sans-serif', letterSpacing: '-0.32px' }}
          >
            {email}
          </a>
        </div>

        {/* Phone and Location */}
        <div className="flex items-center gap-1.5">
          {/* Phone */}
          <div className="flex items-center gap-2">
            <div className="w-[25px] h-[25px] bg-[#f3f3f3] border border-[#2dd4da] rounded-full flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2dd4da" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </div>
            <a
              href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`}
              className="text-[15.8px] text-blue-600 leading-6 hover:underline"
              style={{ fontFamily: 'Mona Sans, sans-serif', letterSpacing: '-0.32px' }}
            >
              {phoneNumber}
            </a>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <div className="w-[25px] h-[25px] bg-[#f3f3f3] border border-[#2dd4da] rounded-full flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="rotate-[282.794deg]"
              >
                <circle cx="12" cy="12" r="10" stroke="#2dd4da" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" fill="#2dd4da"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#2dd4da" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span
              className="text-[15.8px] text-[#1d4fc4] leading-6"
              style={{ fontFamily: 'Mona Sans, sans-serif', letterSpacing: '-0.32px' }}
            >
              {city_state}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute left-10 right-10 top-[364px] flex gap-4">
        <Button
          variant="outline"
          onClick={onScheduleMeeting}
          className="flex-1 h-[42px] border border-blue-600 text-[#4678eb] bg-white hover:bg-blue-50 rounded"
          style={{ fontFamily: 'Mona Sans, sans-serif' }}
        >
          <span className="text-[15.8px] leading-6" style={{ letterSpacing: '-0.32px' }}>
            Schedule a Meeting
          </span>
        </Button>
        <Button
          onClick={onApplyNow}
          className="flex-1 h-[42px] text-white border-0 rounded"
          style={{
            fontFamily: 'Mona Sans, sans-serif',
            background: 'linear-gradient(90deg, #2dd4da 0%, #2563eb 100%)'
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
