/**
 * Partnerships List - Modern Bento Grid Layout
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Building2, Users, Activity, ArrowRight, Sparkles } from 'lucide-react';

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
  user_role: 'admin' | 'mod' | 'member' | 'non-member';
  branding: {
    primary_color: string;
    secondary_color: string;
  };
  stats: {
    activity_count: number;
    page_views: number;
  };
}

interface PartnershipsListProps {
  userId: string;
}

export function PartnershipsList({ userId }: PartnershipsListProps) {
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
    navigate(`/${companySlug}`);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Partner Companies</h1>
            <p className="text-gray-600 text-lg">Manage your real estate partnerships</p>
          </div>

          <Card className="text-center py-16 bg-white border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="p-4 rounded-md w-fit mx-auto mb-6" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                <Building2 className="h-12 w-12" style={{ color: 'var(--brand-electric-blue)' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Partner Companies Yet</h3>
              <p className="text-gray-600 leading-relaxed">
                Partner companies will appear here once they're set up. Contact your administrator to get started.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Determine featured company (first one)
  const featuredCompany = companies[0];
  const regularCompanies = companies.slice(1);

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
      {/* Header */}
      <div className="mb-10 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Partner Companies</h1>
        <p className="text-gray-600 text-lg">Manage your real estate partnerships</p>
      </div>

      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[240px]">

          {/* Featured Company - Large */}
          <Card
            className="lg:col-span-2 lg:row-span-2 relative overflow-hidden cursor-pointer group hover:shadow-md transition-all duration-300 bg-white border border-gray-200"
            onClick={() => handleViewCompany(featuredCompany.slug)}
          >
            <div
              className="absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10"
              style={{
                background: `linear-gradient(135deg, ${featuredCompany.branding.primary_color} 0%, ${featuredCompany.branding.secondary_color} 100%)`,
              }}
            />
            <div className="relative h-full p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="p-3 rounded-md transition-colors"
                    style={{
                      backgroundColor: `${featuredCompany.branding.primary_color}15`,
                    }}
                  >
                    <Building2 className="h-8 w-8" style={{ color: featuredCompany.branding.primary_color }} />
                  </div>
                  {featuredCompany.user_role !== 'non-member' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
                      <Sparkles className="h-3.5 w-3.5 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700 capitalize">{featuredCompany.user_role}</span>
                    </div>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{featuredCompany.name}</h2>
                <p className="text-gray-600 text-lg leading-relaxed line-clamp-2">
                  {featuredCompany.description || 'Partner company organization'}
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-gray-100">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{featuredCompany.member_count}</p>
                    <p className="text-xs text-gray-600">Members</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-gray-100">
                    <Activity className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{featuredCompany.stats.activity_count}</p>
                    <p className="text-xs text-gray-600">Activity</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 font-medium group-hover:gap-3 transition-all" style={{ color: featuredCompany.branding.primary_color }}>
                <span>Explore Partnership</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Card>

          {/* Regular Companies */}
          {regularCompanies.map((company) => (
            <Card
              key={company.id}
              className="relative overflow-hidden cursor-pointer group hover:shadow-md transition-all duration-300 bg-white border border-gray-200"
              onClick={() => handleViewCompany(company.slug)}
            >
              <div
                className="absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10"
                style={{
                  background: `linear-gradient(135deg, ${company.branding.primary_color} 0%, ${company.branding.secondary_color} 100%)`,
                }}
              />
              <div className="relative h-full p-6 flex flex-col justify-between">
                <div>
                  <div
                    className="p-2.5 rounded-md w-fit mb-4 transition-colors"
                    style={{
                      backgroundColor: `${company.branding.primary_color}15`,
                    }}
                  >
                    <Building2 className="h-6 w-6" style={{ color: company.branding.primary_color }} />
                  </div>
                  {company.user_role !== 'non-member' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 mb-3">
                      <span className="text-xs font-medium text-gray-700 capitalize">{company.user_role}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{company.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{company.member_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">{company.stats.activity_count}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{company.description}</p>
                </div>
              </div>
            </Card>
          ))}

        </div>
      </div>
    </div>
  );
}
