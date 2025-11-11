/**
 * Profile Details Card - ARCHIVED
 *
 * This component was removed from the Welcome tab on 2025-10-12
 * Keeping for safe keeping in case it's needed elsewhere
 */

import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Facebook,
} from 'lucide-react';

interface ProfileDetailsCardProps {
  profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    title: string;
    company: string;
    nmls: string;
    location: string;
    profileImage: string;
    linkedin?: string;
    facebook?: string;
    website?: string;
  };
  personCPTData?: {
    arrive?: string;
  };
  tourAttributes?: {
    profileSummary?: string;
  };
}

export function ProfileDetailsCard({ profileData, personCPTData, tourAttributes }: ProfileDetailsCardProps) {
  return (
    <Card className="brand-card" data-tour={tourAttributes?.profileSummary}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{
              background: 'var(--gradient-brand-accent)',
              padding: '2px'
            }}>
              <img
                src={profileData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent((profileData.firstName || '') + ' ' + (profileData.lastName || ''))}&background=2DD4DA&color=fff`}
                alt={(profileData.firstName || '') + ' ' + (profileData.lastName || '')}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((profileData.firstName || 'User') + ' ' + (profileData.lastName || ''))}&background=2DD4DA&color=fff`;
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--brand-dark-navy)]">
                {profileData.firstName || 'User'} {profileData.lastName || ''}
              </h3>
              <p className="text-sm text-[var(--brand-slate)]">{profileData.title || 'Loan Officer'}</p>
              <p className="text-sm text-[var(--brand-steel-blue)]">
                {profileData.company || '21st Century Lending'}
                {profileData.nmls && <span className="ml-2">• NMLS #{profileData.nmls}</span>}
              </p>
            </div>
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{profileData.email}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium">{profileData.phone || 'Not provided'}</span>
            </div>
            {profileData.location && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm font-medium">{profileData.location}</span>
              </div>
            )}
          </div>

          {/* Arrive Link with copy button */}
          {personCPTData?.arrive && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Arrive Link:</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-blue-700 break-all flex-1">{personCPTData.arrive}</p>
                <Button
                  size="sm"
                  className="brand-button brand-button-hover h-8 px-3 text-xs flex-shrink-0 !bg-gradient-hero"
                  onClick={() => {
                    navigator.clipboard.writeText(personCPTData.arrive);
                  }}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          {/* Professional Links */}
          {(profileData.linkedin || profileData.facebook || profileData.website) && (
            <div className="flex space-x-2">
              {profileData.linkedin && (
                <Button size="sm" variant="outline" className="brand-button brand-button-hover" onClick={() => window.open(profileData.linkedin, '_blank')}>
                  <Linkedin className="h-4 w-4" />
                </Button>
              )}
              {profileData.facebook && (
                <Button size="sm" variant="outline" className="brand-button brand-button-hover" onClick={() => window.open(profileData.facebook, '_blank')}>
                  <Facebook className="h-4 w-4" />
                </Button>
              )}
              {profileData.website && (
                <Button size="sm" variant="outline" className="brand-button brand-button-hover" onClick={() => window.open(profileData.website, '_blank')}>
                  <Globe className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
