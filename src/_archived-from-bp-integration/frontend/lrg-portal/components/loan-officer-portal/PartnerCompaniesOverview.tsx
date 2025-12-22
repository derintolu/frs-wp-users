import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Building2, Users, Eye, ExternalLink, Edit, Trash2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PartnerCompany {
  id: number;
  company_name: string;
  title: string;
  slug: string;
  url: string;
  edit_url: string;
  buddypress_group_id: number;
  member_count: number;
  loan_officers: Array<{ id: number; type: string }>;
  branding: {
    primary_color: string;
    secondary_color: string;
    custom_logo: number;
    header_background: number;
    button_style: string;
  };
  analytics: {
    views: number;
    conversions: number;
  };
  created_at: string;
  modified_at: string;
}

interface PartnerCompaniesOverviewProps {
  userId: string;
  currentUser: any;
}

export function PartnerCompaniesOverview({ userId, currentUser }: PartnerCompaniesOverviewProps) {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<PartnerCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load partner companies on mount
  useEffect(() => {
    loadPartnerCompanies();
  }, []);

  const loadPartnerCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/wp-json/lrh/v1/partner-companies', {
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

  const handleCreateCompany = () => {
    navigate('/partnerships/companies/create');
  };

  const handleEditCompany = (companyId: number) => {
    navigate(`/partnerships/companies/${companyId}/edit`);
  };

  const handleBulkUpload = (companyId: number) => {
    navigate(`/partnerships/companies/${companyId}/upload`);
  };

  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm('Are you sure you want to delete this partner company?')) {
      return;
    }

    try {
      const response = await fetch(`/wp-json/lrh/v1/partner-companies/${companyId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete partner company');
      }

      // Reload companies
      loadPartnerCompanies();
    } catch (err) {
      console.error('Failed to delete partner company:', err);
      alert('Failed to delete partner company. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">Loading partner companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
      {/* Header Section */}
      <div className="mb-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Partner Companies</h1>
            <p className="text-gray-600 text-lg">Manage your real estate partner companies and their portals</p>
          </div>
          <Button
            onClick={handleCreateCompany}
            className="flex items-center gap-2"
            style={{ background: 'var(--gradient-hero)', color: 'white' }}
          >
            <Plus className="h-5 w-5" />
            Add Partner Company
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
      </div>

      {/* Companies Grid */}
      <div className="max-w-7xl mx-auto">
        {companies.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Partner Companies Yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first partner company</p>
              <Button onClick={handleCreateCompany} style={{ background: 'var(--gradient-hero)', color: 'white' }}>
                <Plus className="h-5 w-5 mr-2" />
                Add Partner Company
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader
                  className="border-b"
                  style={{
                    background: company.branding?.primary_color
                      ? `linear-gradient(135deg, ${company.branding.primary_color} 0%, ${company.branding.secondary_color || company.branding.primary_color} 100%)`
                      : 'var(--gradient-hero)',
                  }}
                >
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      <span className="truncate">{company.company_name || company.title}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Users className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-900">{company.member_count}</p>
                      <p className="text-xs text-gray-600">Members</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Eye className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-900">{company.analytics.views}</p>
                      <p className="text-xs text-gray-600">Views</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <a
                      href={company.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-gray-900"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Portal
                    </a>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCompany(company.id)}
                        className="flex items-center justify-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkUpload(company.id)}
                        className="flex items-center justify-center gap-1"
                      >
                        <Upload className="h-4 w-4" />
                        Upload
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCompany(company.id)}
                        className="flex items-center justify-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
