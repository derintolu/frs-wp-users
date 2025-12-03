import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  Users,
  TrendingUp,
  FileText,
  ExternalLink,
  Mail,
  Phone,
} from 'lucide-react';

interface LoanOfficer {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  nmls_id: string;
  company: string;
}

interface RealtorOverviewProps {
  userId: string;
}

export function RealtorOverview({ userId }: RealtorOverviewProps) {
  const [loanOfficers, setLoanOfficers] = useState<LoanOfficer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    partnerships: 0,
    leads: 0,
    landingPages: 0,
  });

  useEffect(() => {
    loadRealtorData();
  }, [userId]);

  const loadRealtorData = async () => {
    try {
      setIsLoading(true);

      // Load realtor's loan officer partnerships
      const response = await fetch(`/wp-json/lrh/v1/realtor-partners`, {
        credentials: 'include',
        headers: {
          'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || '',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setLoanOfficers(result.data || []);
        setStats({
          partnerships: (result.data || []).length,
          leads: 0, // TODO: Implement lead counting
          landingPages: 0, // TODO: Implement landing page counting
        });
      }
    } catch (err) {
      console.error('Failed to load realtor data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600 text-lg">Here's an overview of your partnership portal</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Loan Officer Partners</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.partnerships}</p>
                </div>
                <Users className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Leads This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.leads}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Landing Pages</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.landingPages}</p>
                </div>
                <FileText className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Loan Officer Partners */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Loan Officer Partners</CardTitle>
          </CardHeader>
          <CardContent>
            {loanOfficers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No partnerships yet</h3>
                <p className="text-gray-600 mb-4">
                  Connect with loan officers to access co-branded marketing materials and tools
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loanOfficers.map((lo) => {
                  const loName = lo.name || lo.email || 'Unknown';
                  const loCompany = lo.company || '21st Century Lending';

                  return (
                    <div
                      key={lo.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={lo.avatar_url} alt={loName} />
                        <AvatarFallback>{loName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{loName}</h3>
                        <p className="text-sm text-gray-600 mb-2">{loCompany}</p>
                        {lo.nmls_id && (
                          <Badge variant="outline" className="text-xs mb-2">
                            NMLS: {lo.nmls_id}
                          </Badge>
                        )}
                        <div className="flex gap-2 mt-2">
                          {lo.email && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`mailto:${lo.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {lo.phone && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`tel:${lo.phone}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Marketing Materials</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Access co-branded flyers, social media posts, and more
                </p>
                <Button variant="outline" size="sm">
                  View Materials
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Lead Tracking</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Track and manage your mortgage leads
                </p>
                <Button variant="outline" size="sm">
                  View Leads
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Resources</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Access mortgage guides, checklists, and tools
                </p>
                <Button variant="outline" size="sm">
                  View Resources
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
