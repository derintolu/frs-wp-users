import React from 'react';
import { User, Mail, Phone } from 'lucide-react';

interface ProfileCardProps {
  profile: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone_number?: string;
    mobile_number?: string;
    job_title?: string;
    headshot_url?: string;
    city_state?: string;
    office?: string;
    biography?: string;
    facebook_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
  };
  showQRCode?: boolean;
  showContactButtons?: boolean;
  className?: string;
}

export function ProfileCard({
  profile,
  showQRCode = false,
  showContactButtons = true,
  className = ''
}: ProfileCardProps) {
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const socialIcons = [
    {
      name: 'LinkedIn',
      url: profile.linkedin_url,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    },
    {
      name: 'Twitter/X',
      url: profile.twitter_url,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'Facebook',
      url: profile.facebook_url,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: profile.instagram_url,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'YouTube',
      url: profile.youtube_url,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    }
  ].filter(social => social.url);

  return (
    <div className={`relative w-full max-w-md rounded overflow-hidden bg-white ${className}`}>
      {/* Gradient Background Header */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600">
      </div>

      {/* Avatar Container - Left Aligned and Overlapping */}
      <div className="px-10 relative z-10">
        <div className="relative -mt-20 inline-block">
          {/* Avatar */}
          {profile.headshot_url ? (
            <img
              src={profile.headshot_url}
              alt={profile.full_name}
              className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {getInitials(profile.first_name, profile.last_name)}
              </span>
            </div>
          )}

          {/* QR Code Button (if enabled) */}
          {showQRCode && (
            <button className="absolute top-0 right-0 w-10 h-10 bg-gray-900 rounded-full border-2 border-white flex items-center justify-center hover:bg-gray-800 transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content - Left Aligned */}
      <div className="px-10 pt-4 pb-8">
        {/* Name */}
        <h2 className="text-3xl font-bold text-gray-900 mb-1">
          {profile.full_name}
        </h2>

        {/* Job Title and Company */}
        <div className="flex flex-wrap gap-1 text-base mb-1">
          {profile.job_title && (
            <span className="text-gray-700">{profile.job_title},</span>
          )}
          {profile.office && (
            <a href="#" className="text-blue-600 hover:underline">
              {profile.office}
            </a>
          )}
        </div>

        {/* Location */}
        {profile.city_state && (
          <p className="text-base text-blue-600 mb-4">
            {profile.city_state}
          </p>
        )}

        {/* Social Media Icons */}
        {socialIcons.length > 0 && (
          <div className="flex items-center gap-2 py-2 mb-4">
            {/* Verified Badge (placeholder) */}
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>

            <span className="text-gray-900">—</span>

            {/* Social Media Links */}
            {socialIcons.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        )}

        {/* Biography */}
        {profile.biography ? (
          <p className="text-base text-gray-700 mb-6 leading-relaxed">
            {profile.biography}
          </p>
        ) : (
          <p className="text-base text-gray-400 mb-6 leading-relaxed opacity-50">
            Add a short bio. Tell the world who you are and what you do.
          </p>
        )}

        {/* Contact Buttons */}
        {showContactButtons && (
          <div className="flex gap-4">
            {profile.phone_number && (
              <a
                href={`tel:${profile.phone_number}`}
                className="flex-1 py-2.5 px-4 border border-blue-600 text-blue-600 rounded font-bold text-center hover:bg-blue-50 transition-colors"
              >
                Call
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="flex-1 py-2.5 px-4 border border-blue-600 text-blue-600 rounded font-bold text-center hover:bg-blue-50 transition-colors"
              >
                Email
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
