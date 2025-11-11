import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSpinner, LoadingCard } from '../ui/loading';
import { ErrorDisplay } from '../ui/error';
import {
  Users,
  Mail,
  Phone,
  Building,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Folder,
  Share2,
  FileText,
  Activity,
  Download,
  UserPlus,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { DataService, type User as UserType, type Partnership, type DashboardStats } from '../../utils/dataService';
import { STATUS_CONFIG } from '../../config/appConfig';

interface PartnershipsOverviewProps {
  userId: string;
  currentUser?: UserType;
}

export function PartnershipsOverview({ userId, currentUser }: PartnershipsOverviewProps) {
  // Data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [partners, setPartners] = useState<UserType[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    stats: true,
    partners: true
  });

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [statsData, partnersData, partnershipsData] = await Promise.all([
          DataService.getDashboardStatsForLO(userId),
          DataService.getPartnersForLO(userId),
          DataService.getPartnershipsForLO(userId)
        ]);

        setStats(statsData);
        setPartners(Array.isArray(partnersData) ? partnersData : []);
        setPartnerships(Array.isArray(partnershipsData) ? partnershipsData : []);

      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard loading error:', err);
      } finally {
        setIsLoading(false);
        setLoadingStates({
          stats: false,
          partners: false
        });
      }
    };

    if (userId) {
      loadDashboardData();
    }
  }, [userId]);

  // Build stats display data
  const statsDisplay = stats ? [
    {
      title: 'Active Partnerships',
      value: stats.activePartnerships.toString(),
      change: '+2',
      icon: Users,
      color: 'text-[var(--brand-cyan)]'
    },
    {
      title: 'Pending Invitations',
      value: stats.pendingInvitations.toString(),
      change: '+1',
      icon: UserPlus,
      color: 'text-[var(--brand-light-blue)]'
    },
    {
      title: 'Total Leads',
      value: stats.totalLeads.toString(),
      change: '+23%',
      icon: TrendingUp,
      color: 'text-[var(--brand-electric-blue)]'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      change: '+2.1%',
      icon: BarChart3,
      color: 'text-[var(--brand-steel-blue)]'
    }
  ] : [];

  const getStatusBadge = (status: 'active' | 'pending' | 'inactive') => {
    const config = STATUS_CONFIG.partnership[status.toUpperCase() as keyof typeof STATUS_CONFIG.partnership];
    const icons = {
      active: CheckCircle,
      pending: Clock,
      inactive: XCircle
    };
    const IconComponent = icons[status];

    return (
      <Badge className={`${config.color} text-white flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getPartnershipStatus = (partnerId: string): 'active' | 'pending' | 'inactive' => {
    if (!Array.isArray(partnerships)) return 'inactive';
    const partnership = partnerships.find(p => p.realtorId === partnerId);
    return partnership?.status || 'inactive';
  };

  if (error) {
    return (
      <ErrorDisplay
        type="server"
        title="Dashboard Error"
        message={error}
        onRetry={() => window.location.reload()}
        showRetry={true}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingStates.stats ? (
            <LoadingCard type="stats" count={4} />
          ) : (
            statsDisplay.map((stat, index) => (
              <Card key={index} className="shadow-lg border-0 bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">{stat.title}</p>
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.change}</p>
                    </div>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Partner Profiles Card */}
        <Card className="shadow-lg border-0 bg-white flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-[#2DD4DA] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              Partner Profiles & Resources ({partners.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-6">
          {loadingStates.partners ? (
            <div className="space-y-4">
              <LoadingCard type="profile" count={3} />
            </div>
          ) : partners.length > 0 ? (
            <div className="space-y-4">
              {partners.map((partner) => (
                <Card
                  key={partner.id}
                  className="border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Partner Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)' }}>
                          {partner.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>

                      {/* Partner Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">{partner.name}</h4>
                          {getStatusBadge(getPartnershipStatus(partner.id))}
                        </div>

                        <div className="space-y-1 mt-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Building className="h-3 w-3 mr-1" />
                            <span className="truncate">{partner.company}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-1" />
                            <span className="truncate">{partner.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{partner.location || 'Location not specified'}</span>
                          </div>
                        </div>

                        {/* Partner Actions */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs hover:bg-blue-50"
                              title="View Profile"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Profile
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs hover:bg-blue-50"
                              title="Shared Resources"
                            >
                              <Folder className="h-3 w-3 mr-1" />
                              Resources
                            </Button>
                          </div>

                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50" title="Contact">
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50" title="Call">
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50" title="Share">
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Shared Resources Preview */}
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Shared Resources:</span>
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-gray-600">
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span>3 Pages</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Activity className="h-3 w-3" />
                                <span>247 Leads</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-600">Last activity: 2 days ago</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Reports
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-blue-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Partners Yet</h3>
              <p className="text-gray-600 mb-4">
                Start building your realtor network by inviting your first partner.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
