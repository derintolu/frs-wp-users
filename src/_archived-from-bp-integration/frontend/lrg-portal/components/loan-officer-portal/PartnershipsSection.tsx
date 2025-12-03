/**
 * Partnerships Section - List of Partner Companies
 *
 * Shows all partner-org BuddyPress groups that the current user is a member of.
 * Each company card links to its hybrid group management page.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Building2, Users, Activity, TrendingUp, ChevronRight } from 'lucide-react';

interface PartnerCompany {
  id: number;
  name: string;
  description: string;
  slug: string;
  avatar_urls: {
    full: string;
    thumb: string;
  };
  member_count: number;
  user_role: 'admin' | 'mod' | 'member';
  branding: {
    primary_color: string;
    secondary_color: string;
  };
  stats: {
    activity_count: number;
    page_views: number;
  };
}

interface PartnershipsSectionProps {
  userId: string;
}

export function PartnershipsSection({ userId }: PartnershipsSectionProps) {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<PartnerCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPartnerCompanies();
  }, [userId]);

  const loadPartnerCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch partner-org groups user is a member of
      const response = await fetch('/wp-json/lrh/v1/partner-companies/my-companies', {
        credentials: 'include',
        headers: {
          'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load partner companies');
      }

      const result = await response.json();
      setCompanies(result.data || []);
    } catch (err) {
      console.error('Failed to load partner companies:', err);
      setError('Failed to load partner companies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCompany = (companySlug: string) => {
    navigate(`/partnerships/${companySlug}`);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <p className="brand-card-description">Loading partner companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="brand-page-header max-w-7xl mx-auto">
        <h1 className="brand-page-title">Partner Companies</h1>
        <p className="brand-page-subtitle">Manage your real estate partnerships</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Companies Grid */}
      <div className="max-w-7xl mx-auto">
        {companies.length === 0 ? (
          <Card className="brand-card text-center py-12">
            <CardContent>
              <div className="brand-card-icon w-16 h-16 mx-auto mb-4">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="brand-card-title text-xl mb-2">No Partner Companies Yet</h3>
              <p className="brand-card-description mb-6">You haven't been added to any partner companies yet.</p>
              <p className="text-sm text-[var(--brand-slate)]">Contact your administrator to be added to partner company groups.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card key={company.id} className="brand-card overflow-hidden cursor-pointer" onClick={() => handleViewCompany(company.slug)}>
                <CardHeader
                  className="border-b rounded-t-md"
                  style={{
                    background: `linear-gradient(135deg, ${company.branding.primary_color} 0%, ${company.branding.secondary_color} 100%)`,
                  }}
                >
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      <span className="truncate">{company.name}</span>
                    </div>
                    {company.user_role === 'admin' && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-md">Admin</span>
                    )}
                    {company.user_role === 'mod' && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-md">Moderator</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-[var(--brand-off-white)] rounded-md">
                      <Users className="h-5 w-5 text-[var(--brand-electric-blue)] mx-auto mb-1" />
                      <p className="text-2xl font-bold text-[var(--brand-dark-navy)]">{company.member_count}</p>
                      <p className="text-xs text-[var(--brand-slate)]">Members</p>
                    </div>
                    <div className="text-center p-3 bg-[var(--brand-off-white)] rounded-md">
                      <Activity className="h-5 w-5 text-[var(--brand-electric-blue)] mx-auto mb-1" />
                      <p className="text-2xl font-bold text-[var(--brand-dark-navy)]">{company.stats.activity_count}</p>
                      <p className="text-xs text-[var(--brand-slate)]">Activity</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="brand-card-description mb-4 line-clamp-2">{company.description}</p>

                  {/* View Button */}
                  <Button
                    className="w-full flex items-center justify-center gap-2 rounded-md"
                    style={{ background: `linear-gradient(135deg, ${company.branding.primary_color} 0%, ${company.branding.secondary_color} 100%)`, color: 'white' }}
                  >
                    <span>View Company</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
