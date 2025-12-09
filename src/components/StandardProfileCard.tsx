import { MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StandardProfileCardProps {
  avatar: string;
  className?: string;
  email: string;
  location: string;
  name: string;
  onSchedule?: () => void;
  phone: string;
  profileUrl?: string;
  title: string;
}

/**
 * StandardProfileCard - Uniform card size for all profile cards
 * Like a deck of cards - all cards are the same size
 *
 * Dimensions: 370px x 520px (standard business card aspect ratio scaled up)
 */
export function StandardProfileCard({
  avatar,
  className = '',
  email,
  location,
  name,
  onSchedule,
  phone,
  profileUrl,
  title
}: StandardProfileCardProps) {
  return (
    <div
      className={`relative h-[520px] w-[370px] overflow-hidden rounded-2xl bg-white shadow-xl ${className}`}
      style={{
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Video Background Header */}
      <div className="absolute inset-x-0 top-0 h-[200px] overflow-hidden">
        <video
          autoPlay
          className="-mt-[220px] h-[640px] w-full object-cover blur-[30px]"
          loop
          muted
          playsInline
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
            className="size-[140px] overflow-hidden rounded-full border-4 border-white shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)'
            }}
          >
            <img
              alt={name}
              className="size-full object-cover"
              src={avatar}
            />
          </div>

          {/* App Launcher Icon Badge */}
          <div
            className="absolute right-0 top-0 flex size-10 items-center justify-center rounded-full border-2 border-blue-500 bg-white shadow-md"
          >
            <svg fill="none" height="20" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24" width="20">
              <rect height="7" rx="1" width="7" x="3" y="3"/>
              <rect height="7" rx="1" width="7" x="14" y="3"/>
              <rect height="7" rx="1" width="7" x="14" y="14"/>
              <rect height="7" rx="1" width="7" x="3" y="14"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 pt-6 text-center">
        {/* Name */}
        <h2
          className="mb-2 text-3xl font-bold text-gray-900"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {name}
        </h2>

        {/* Title */}
        <p
          className="mb-8 text-lg font-medium text-blue-600"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {title}
        </p>

        {/* Contact Info */}
        <div className="mb-8 space-y-3">
          {/* Location */}
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <MapPin className="size-5 text-blue-600" />
            <span className="text-sm">{location}</span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Mail className="size-5 text-blue-600" />
            <a
              className="text-sm transition-colors hover:text-blue-600"
              href={`mailto:${email}`}
            >
              {email}
            </a>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Phone className="size-5 text-blue-600" />
            <a
              className="text-sm transition-colors hover:text-blue-600"
              href={`tel:${phone.replaceAll(/[^\d+]/g, '')}`}
            >
              {phone}
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            className="h-12 flex-1 rounded-lg border-2 border-blue-600 text-base font-bold text-blue-600 hover:bg-blue-50"
            onClick={onSchedule}
            style={{ fontFamily: 'Roboto, sans-serif' }}
            variant="outline"
          >
            Schedule a Time
          </Button>
          <Button
            asChild
            className="h-12 flex-1 rounded-lg text-base font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            <a href={profileUrl || '#'}>
              View
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
