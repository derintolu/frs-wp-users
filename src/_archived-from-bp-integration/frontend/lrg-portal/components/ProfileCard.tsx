import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import QRCodeStyling from 'qr-code-styling';

interface ProfileCardProps {
  userId: string;
  name: string;
  title: string;
  company: string;
  location: string;
  license?: string;
  email: string;
  phone: string;
  avatar: string;
  socialLinks?: {
    wordpress?: string;
    twitter?: string;
    linkedin?: string;
    bluesky?: string;
    github?: string;
    instagram?: string;
  };
  biolinkUrl?: string;
}

export function ProfileCard({
  userId,
  name,
  title,
  company,
  location,
  license,
  email,
  phone,
  avatar,
  socialLinks = {},
  biolinkUrl
}: ProfileCardProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Generate QR Code
  useEffect(() => {
    if (qrCodeRef.current && biolinkUrl) {
      qrCodeRef.current.innerHTML = '';

      const qrCode = new QRCodeStyling({
        type: 'canvas',
        shape: 'square',
        width: 96,
        height: 96,
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
    }
  }, [biolinkUrl, showQRCode]);

  const phoneUrl = phone ? `tel:${phone.replace(/[^0-9+]/g, '')}` : '';
  const emailUrl = email ? `mailto:${email}` : '';

  return (
    <div className="relative w-full overflow-hidden rounded bg-white border border-gray-200 shadow-lg">
      {/* Gradient Background Header */}
      <div className="absolute top-0 left-0 right-0 h-[144px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-[640px] object-cover blur-[30px] -mt-[192px]"
          style={{ filter: 'blur(30px)' }}
        >
          <source src={(window as any).frsPortalConfig?.gradientUrl} type="video/mp4" />
        </video>
      </div>

      {/* Avatar with QR Code Flip */}
      <div className="relative z-10 ml-10 mt-8 mb-4 w-[148px] h-[164px]">
        <div className="relative w-[148px] h-[148px]">
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
                className="w-full h-full rounded-full overflow-hidden"
                style={{
                  border: '4px solid #5ce1e6',
                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)'
                }}
              >
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Back - QR Code */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div
                className="w-full h-full rounded-full overflow-hidden bg-white border border-gray-800 flex items-center justify-center p-[26px]"
              >
                <div ref={qrCodeRef} className="w-[96px] h-[96px]" />
              </div>
            </div>
          </div>

          {/* QR Code Toggle Button */}
          <button
            onClick={() => setShowQRCode(!showQRCode)}
            className="absolute top-0 right-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg border border-white z-20"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="5" height="5" x="3" y="3" rx="1"/>
              <rect width="5" height="5" x="16" y="3" rx="1"/>
              <rect width="5" height="5" x="3" y="16" rx="1"/>
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

      {/* Content Area */}
      <div className="relative z-10 px-10 pb-8">
        {/* Name and License */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[34px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {name}
          </h3>
          {license && (
            <span className="text-base text-[#1D4FC4]" style={{ fontFamily: 'Roboto, sans-serif' }}>
              License {license}
            </span>
          )}
        </div>

        {/* Title and Company */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="text-base text-[#020817]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {title},
          </span>
          <span className="text-base text-[#1D4FC4]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {company}
          </span>
        </div>

        {/* Location */}
        <div className="mb-8">
          <span className="text-base text-[#1D4FC4]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {location}
          </span>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-0 mb-6">
          <div className="flex items-center py-2">
            <div className="flex items-center pr-2.5">
              <div className="pr-1">
                <span className="text-base text-[#020817]" style={{ fontFamily: 'Roboto, sans-serif' }}>—</span>
              </div>
              {socialLinks.wordpress && (
                <a href={socialLinks.wordpress} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.158 12.786L9.46 20.625C10.27 20.865 11.13 21 12 21C13.16 21 14.27 20.78 15.3 20.38L15.26 20.3L12.158 12.786ZM3.009 12C3.009 13.42 3.339 14.77 3.929 16L8.46 4.615C7.37 4.84 6.33 5.25 5.38 5.79C3.92 7.03 3.009 9.36 3.009 12ZM21.991 12C21.991 8.58 19.64 5.74 16.5 4.61C17.14 5.56 17.71 6.76 17.71 8.14C17.71 9.74 16.67 11.59 15.76 13.29C14.94 14.82 14.23 16.12 14.23 17.66C14.23 19.09 14.83 20.29 15.43 21.07C18.95 19.54 21.5 16.08 21.991 12ZM12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z"/>
                  </svg>
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
              {socialLinks.bluesky && (
                <a href={socialLinks.bluesky} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                  </svg>
                </a>
              )}
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Top Row */}
        <div className="flex gap-4 mb-4">
          <Button
            className="flex-1 bg-[#0267ff] text-white hover:bg-[#0267ff]/90 h-[42px] rounded font-bold"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Apply Now
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-blue-600 text-[#4678eb] hover:bg-blue-50 h-[42px] rounded font-bold"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Schedule a Meeting
          </Button>
        </div>

        {/* Action Buttons Bottom Row */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1 border-blue-600 text-[#4678eb] hover:bg-blue-50 h-[42px] rounded font-bold"
            style={{ fontFamily: 'Roboto, sans-serif' }}
            onClick={() => phoneUrl && window.open(phoneUrl, '_self')}
          >
            Call
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-blue-600 text-[#4678eb] hover:bg-blue-50 h-[42px] rounded font-bold"
            style={{ fontFamily: 'Roboto, sans-serif' }}
            onClick={() => emailUrl && window.open(emailUrl, '_self')}
          >
            Email
          </Button>
          <Button
            variant="outline"
            className="border-blue-600 text-[#4678eb] hover:bg-blue-50 h-[42px] rounded font-bold px-[13px]"
            style={{ fontFamily: 'Roboto, sans-serif', width: '170.5px' }}
          >
            Add To Phone
          </Button>
        </div>
      </div>
    </div>
  );
}
