import React from 'react';

interface ProfileCardCompactProps {
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
    region?: string;
    office?: string;
    nmls_number?: string;
    biography?: string;
    facebook_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
  };
  size?: 'small' | 'medium' | 'large';
  showContactButtons?: boolean;
  showBio?: boolean;
  className?: string;
}

export function ProfileCardCompact({
  profile,
  size = 'medium',
  showContactButtons = true,
  showBio = false,
  className = ''
}: ProfileCardCompactProps) {
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const socialIcons = [
    {
      name: 'LinkedIn',
      url: profile.linkedin_url,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    },
    {
      name: 'Twitter/X',
      url: profile.twitter_url,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'Facebook',
      url: profile.facebook_url,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: profile.instagram_url,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'YouTube',
      url: profile.youtube_url,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    }
  ].filter(social => social.url);

  // Size-based classes
  const sizeConfig = {
    small: {
      avatar: 'w-16 h-16',
      header: 'h-20',
      padding: 'p-4',
      name: 'text-lg',
      title: 'text-xs',
    },
    medium: {
      avatar: 'w-24 h-24',
      header: 'h-28',
      padding: 'p-5',
      name: 'text-xl',
      title: 'text-sm',
    },
    large: {
      avatar: 'w-32 h-32',
      header: 'h-36',
      padding: 'p-6',
      name: 'text-2xl',
      title: 'text-base',
    },
  }[size];

  return (
    <div className={`relative w-full rounded overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {/* Gradient Background Header */}
      <div className={`relative ${sizeConfig.header} overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600`}>
      </div>

      {/* Content */}
      <div className={`${sizeConfig.padding} relative z-10`}>
        {/* Avatar - Left Aligned and Overlapping */}
        <div className={`${size === 'small' ? '-mt-8' : size === 'medium' ? '-mt-12' : '-mt-16'} mb-3`}>
          {profile.headshot_url ? (
            <img
              src={profile.headshot_url}
              alt={profile.full_name}
              className={`${sizeConfig.avatar} rounded-full object-cover border-4 border-white shadow-lg`}
            />
          ) : (
            <div className={`${sizeConfig.avatar} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-4 border-white shadow-lg flex items-center justify-center`}>
              <span className={`text-white ${size === 'small' ? 'text-xl' : size === 'medium' ? 'text-2xl' : 'text-3xl'} font-bold`}>
                {getInitials(profile.first_name, profile.last_name)}
              </span>
            </div>
          )}
        </div>

        {/* Name & Title - Left Aligned */}
        <div className="mb-2">
          <h3 className={`${sizeConfig.name} font-bold text-gray-900 leading-tight`}>
            {profile.full_name}
          </h3>
          {profile.job_title && (
            <p className={`${sizeConfig.title} text-gray-600 mt-0.5`}>
              {profile.job_title}
            </p>
          )}
        </div>

        {/* Office/Company */}
        {profile.office && (
          <p className="text-xs text-blue-600 hover:underline text-center mb-2">
            <a href="#">{profile.office}</a>
          </p>
        )}

        {/* Location */}
        {profile.city_state && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-3">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{profile.city_state}</span>
          </div>
        )}

        {/* NMLS Badge */}
        {profile.nmls_number && (
          <div className="flex justify-center mb-3">
            <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
              NMLS# {profile.nmls_number}
            </span>
          </div>
        )}

        {/* Social Media Icons */}
        {socialIcons.length > 0 && (
          <div className="flex items-center justify-center gap-2 mb-3">
            {socialIcons.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        )}

        {/* Biography (if enabled) */}
        {showBio && profile.biography && (
          <p className="text-xs text-gray-700 mb-3 leading-relaxed line-clamp-2 text-center">
            {profile.biography}
          </p>
        )}

        {/* Contact Buttons */}
        {showContactButtons && (
          <div className="flex gap-2">
            {profile.phone_number && (
              <a
                href={`tel:${profile.phone_number}`}
                className="flex-1 py-2 px-3 border border-blue-600 text-blue-600 rounded text-xs font-semibold text-center hover:bg-blue-50 transition-colors"
              >
                Call
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="flex-1 py-2 px-3 border border-blue-600 text-blue-600 rounded text-xs font-semibold text-center hover:bg-blue-50 transition-colors"
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
