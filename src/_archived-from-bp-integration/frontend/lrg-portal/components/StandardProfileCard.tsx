import { MapPin, Mail, Phone } from 'lucide-react';
import { Button } from './ui/button';

interface StandardProfileCardProps {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  avatar: string;
  onApply?: () => void;
  className?: string;
}

/**
 * StandardProfileCard - Uniform card size for all profile cards
 * Like a deck of cards - all cards are the same size
 *
 * Dimensions: 370px x 520px (standard business card aspect ratio scaled up)
 */
export function StandardProfileCard({
  name,
  title,
  location,
  email,
  phone,
  avatar,
  onApply,
  className = ''
}: StandardProfileCardProps) {
  return (
    <div
      className={`relative w-[370px] h-[520px] overflow-hidden rounded-2xl bg-white shadow-xl ${className}`}
      style={{
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Video Background Header */}
      <div className="absolute top-0 left-0 right-0 h-[200px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-[640px] object-cover blur-[30px] -mt-[220px]"
          style={{ filter: 'blur(30px)' }}
        >
          <source src={(window as any).frsPortalConfig?.gradientUrl} type="video/mp4" />
        </video>
      </div>

      {/* Avatar with App Launcher Icon */}
      <div className="relative z-10 flex justify-center pt-12">
        <div className="relative">
          {/* Avatar Circle */}
          <div
            className="w-[140px] h-[140px] rounded-full overflow-hidden border-4 border-white shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)'
            }}
          >
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* App Launcher Icon Badge */}
          <div
            className="absolute top-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-blue-500"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 pt-6 text-center">
        {/* Name */}
        <h2
          className="text-3xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {name}
        </h2>

        {/* Title */}
        <p
          className="text-lg text-blue-600 font-medium mb-8"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {title}
        </p>

        {/* Contact Info */}
        <div className="space-y-3 mb-8">
          {/* Location */}
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="text-sm">{location}</span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Mail className="w-5 h-5 text-blue-600" />
            <a
              href={`mailto:${email}`}
              className="text-sm hover:text-blue-600 transition-colors"
            >
              {email}
            </a>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Phone className="w-5 h-5 text-blue-600" />
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
              className="text-sm hover:text-blue-600 transition-colors"
            >
              {phone}
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onApply}
            variant="outline"
            className="flex-1 h-12 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-base rounded-lg"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Schedule a Time
          </Button>
          <Button
            onClick={onApply}
            className="flex-1 h-12 text-white font-bold text-base rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
