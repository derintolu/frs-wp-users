import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import QRCodeStyling from 'qr-code-styling';

interface ProfileCardProps {
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
}

export function ProfileCard({
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
  profile_slug
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
    <div className="relative h-[862px] w-[874px] overflow-hidden rounded-lg border-2 border-[#4678eb] bg-white">
      {/* Gradient Video Background */}
      <div className="absolute inset-x-0 top-0 h-[540px] overflow-hidden">
        <video
          autoPlay
          className="size-full object-cover"
          loop
          muted
          playsInline
        >
          <source src={gradientUrl} type="video/mp4" />
        </video>
      </div>

      {/* 3-Dot Menu */}
      <button
        className="absolute right-8 top-8 z-20 flex size-16 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg transition-colors hover:bg-gray-50"
        onClick={onMenuClick}
      >
        <svg className="text-gray-600" fill="currentColor" height="32" viewBox="0 0 24 24" width="32">
          <circle cx="12" cy="5" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="12" cy="19" r="2"/>
        </svg>
      </button>

      {/* Avatar Container */}
      <div className="absolute left-1/2 top-24 z-10 -translate-x-1/2">
        <div className="relative size-[320px]" style={{ perspective: '1000px' }}>
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
              <div className="size-full overflow-hidden rounded-full border-8 border-[#2563eb] bg-white shadow-2xl">
                <img
                  alt={fullName}
                  className="size-full object-cover"
                  src={headshot_url || 'https://via.placeholder.com/320'}
                />
              </div>
            </div>

            {/* Back - QR Code */}
            <div
              className="absolute inset-0 rounded-full border-8 border-[#2563eb] bg-white shadow-2xl"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="flex size-full items-center justify-center p-12">
                <div className="size-48" ref={qrCodeRef} />
              </div>
            </div>
          </div>

          {/* QR Toggle Button */}
          <button
            className="absolute right-2 top-2 z-20 flex size-16 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-50"
            onClick={() => setShowQRCode(!showQRCode)}
          >
            <img
              alt="Toggle QR"
              className="size-8"
              src={`${iconPath}/qr-flip.svg`}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 bg-white px-16 py-12">
        {/* Name */}
        <h2
          className="mb-4 text-center text-6xl font-bold text-[#020817]"
          style={{ fontFamily: 'Mona Sans, sans-serif' }}
        >
          {fullName}
        </h2>

        {/* Title and NMLS */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <p
            className="text-center text-3xl"
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

        {/* Contact Info */}
        <div className="mb-8 flex flex-col items-center gap-3">
          {/* Email */}
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full">
              <img alt="" className="size-12" src={`${iconPath}/Email.svg`} />
            </div>
            <a
              className="text-2xl text-[#4678eb] hover:underline"
              href={`mailto:${email}`}
              style={{ fontFamily: 'Mona Sans, sans-serif' }}
            >
              {email}
            </a>
          </div>

          {/* Phone and Location */}
          <div className="flex items-center gap-8">
            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center">
                <img alt="" className="size-12" src={`${iconPath}/Phne.svg`} />
              </div>
              <a
                className="text-2xl text-[#4678eb] hover:underline"
                href={`tel:${phoneNumber.replaceAll(/[^\d+]/g, '')}`}
                style={{ fontFamily: 'Mona Sans, sans-serif' }}
              >
                {phoneNumber}
              </a>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center">
                <img alt="" className="size-12 rotate-[283deg]" src={`${iconPath}/location.svg`} />
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
        <div className="flex justify-center gap-8">
          <Button
            className="h-20 rounded-lg border-2 border-[#4678eb] bg-white px-12 text-2xl font-normal text-[#4678eb] hover:bg-blue-50"
            onClick={onScheduleMeeting}
            style={{ fontFamily: 'Mona Sans, sans-serif' }}
            variant="outline"
          >
            Schedule a Meeting
          </Button>
          <Button
            className="h-20 rounded-lg border-0 px-16 text-2xl font-bold text-white hover:opacity-90"
            onClick={onApplyNow}
            style={{
              background: 'linear-gradient(90deg, #2dd4da 0%, #2563eb 100%)',
              fontFamily: 'Mona Sans, sans-serif'
            }}
          >
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
}
