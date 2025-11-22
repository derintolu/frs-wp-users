import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import QRCodeStyling from 'qr-code-styling';

interface ProfileCardProps {
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
  onScheduleMeeting?: () => void;
  onApplyNow?: () => void;
  onMenuClick?: () => void;
}

export function ProfileCard({
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
  id,
  onScheduleMeeting,
  onApplyNow,
  onMenuClick
}: ProfileCardProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const fullName = `${first_name} ${last_name}`;
  const phoneNumber = phone_number || mobile_number || '';
  const gradientUrl = (window as any).frsPortalConfig?.gradientUrl || '';
  const contentUrl = (window as any).frsPortalConfig?.contentUrl || '/wp-content';
  const iconPath = `${contentUrl}/plugins/frs-wp-users/assets/images`;
  const profileUrl = `/profile/${profile_slug || id}`;
  const siteUrl = window.location.origin;
  const qrProfileUrl = `${siteUrl}${profileUrl}`;

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
    <div className="relative w-[874px] h-[862px] bg-white rounded-lg border-2 border-[#4678eb] overflow-hidden">
      {/* Gradient Video Background */}
      <div className="absolute top-0 left-0 right-0 h-[540px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={gradientUrl} type="video/mp4" />
        </video>
      </div>

      {/* 3-Dot Menu */}
      <button
        onClick={onMenuClick}
        className="absolute top-8 right-8 w-16 h-16 bg-white border-4 border-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-lg z-20"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
          <circle cx="12" cy="5" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="12" cy="19" r="2"/>
        </svg>
      </button>

      {/* Avatar Container */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
        <div className="relative w-[320px] h-[320px]" style={{ perspective: '1000px' }}>
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
              <div className="w-full h-full rounded-full overflow-hidden border-8 border-[#2563eb] bg-white shadow-2xl">
                <img
                  src={headshot_url || 'https://via.placeholder.com/320'}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Back - QR Code */}
            <div
              className="absolute inset-0 rounded-full bg-white border-8 border-[#2563eb] shadow-2xl"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="w-full h-full flex items-center justify-center p-12">
                <div ref={qrCodeRef} className="w-48 h-48" />
              </div>
            </div>
          </div>

          {/* QR Toggle Button */}
          <button
            onClick={() => setShowQRCode(!showQRCode)}
            className="absolute top-2 right-2 w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-lg z-20"
          >
            <img
              alt="Toggle QR"
              className="w-8 h-8"
              src={`${iconPath}/qr-flip.svg`}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 bg-white px-16 py-12">
        {/* Name */}
        <h2
          className="text-6xl font-bold text-center mb-4 text-[#020817]"
          style={{ fontFamily: 'Mona Sans, sans-serif' }}
        >
          {fullName}
        </h2>

        {/* Title and NMLS */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <p
            className="text-3xl text-center"
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

        {/* Contact Info */}
        <div className="flex flex-col items-center gap-3 mb-8">
          {/* Email */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <img alt="" className="w-12 h-12" src={`${iconPath}/Email.svg`} />
            </div>
            <a
              href={`mailto:${email}`}
              className="text-2xl text-[#4678eb] hover:underline"
              style={{ fontFamily: 'Mona Sans, sans-serif' }}
            >
              {email}
            </a>
          </div>

          {/* Phone and Location */}
          <div className="flex items-center gap-8">
            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <img alt="" className="w-12 h-12" src={`${iconPath}/Phne.svg`} />
              </div>
              <a
                href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`}
                className="text-2xl text-[#4678eb] hover:underline"
                style={{ fontFamily: 'Mona Sans, sans-serif' }}
              >
                {phoneNumber}
              </a>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <img alt="" className="w-12 h-12 rotate-[283deg]" src={`${iconPath}/location.svg`} />
              </div>
              <span
                className="text-2xl text-[#1d4fc4]"
                style={{ fontFamily: 'Mona Sans, sans-serif' }}
              >
                {city_state}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-8 justify-center">
          <Button
            variant="outline"
            onClick={onScheduleMeeting}
            className="h-20 px-12 text-2xl border-2 border-[#4678eb] text-[#4678eb] bg-white hover:bg-blue-50 rounded-lg font-normal"
            style={{ fontFamily: 'Mona Sans, sans-serif' }}
          >
            Schedule a Meeting
          </Button>
          <Button
            onClick={onApplyNow}
            className="h-20 px-16 text-2xl text-white border-0 rounded-lg font-bold hover:opacity-90"
            style={{
              fontFamily: 'Mona Sans, sans-serif',
              background: 'linear-gradient(90deg, #2dd4da 0%, #2563eb 100%)'
            }}
          >
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
}
