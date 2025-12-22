import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { 
  Users, 
  FileText, 
  Mail, 
  MessageSquare,
  Phone,
  Calendar,
  Eye,
  Edit,
  ExternalLink,
  Bell,
  BellOff,
  Plus,
  UserCheck,
  TrendingUp,
  Printer,
  Building,
  MapPin,
  Globe,
  Linkedin,
  Download,
  BookOpen,
  HelpCircle,
  Shield,
  Star,
  Zap,
  Lightbulb,
  Share2,
  Target
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { DataService, type User, type Partnership, type LandingPage, type DashboardStats } from '../utils/dataService';
import { LoadingCard, LoadingSpinner } from './ui/loading';
import { ErrorAlert, ErrorDisplay } from './ui/error';
import { STATUS_CONFIG } from '../config/appConfig';

interface RealtorDashboardProps {
  userId: string;
}

export function RealtorDashboard({ userId }: RealtorDashboardProps) {
  // Data state  
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [loanOfficer, setLoanOfficer] = useState<User | null>(null);
  const [coBrandedPages, setCoBrandedPages] = useState<LandingPage[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    stats: true,
    partnership: true,
    pages: true
  });

  // Notification update state
  const [updatingNotifications, setUpdatingNotifications] = useState(false);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load all data in parallel
        const [
          statsData,
          partnershipData,
          coBrandedPagesData
        ] = await Promise.all([
          DataService.getDashboardStatsForRealtor(userId),
          DataService.getPartnershipForRealtor(userId),
          DataService.getCoBrandedPagesForRealtor(userId)
        ]);

        setStats(statsData);
        setPartnership(partnershipData);
        setCoBrandedPages(coBrandedPagesData);

        // Load loan officer data if partnership exists
        if (partnershipData) {
          const loData = await DataService.getUserById(partnershipData.loanOfficerId);
          setLoanOfficer(loData);
        }
        
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard loading error:', err);
      } finally {
        setIsLoading(false);
        setLoadingStates({
          stats: false,
          partnership: false,
          pages: false
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
      title: 'Partnership Status', 
      value: partnership?.status === 'active' ? 'Active' : partnership?.status === 'pending' ? 'Pending' : 'None', 
      icon: partnership?.status === 'active' ? UserCheck : Users,
      color: partnership?.status === 'active' ? 'text-[var(--brand-cyan)]' : 'text-[var(--brand-slate)]'
    },
    { 
      title: 'Co-branded Pages', 
      value: stats.coBrandedPages.toString(), 
      icon: FileText,
      color: 'text-[var(--brand-light-blue)]'
    },
    { 
      title: 'Leads Received', 
      value: stats.totalLeads.toString(), 
      icon: Mail,
      color: 'text-[var(--brand-electric-blue)]'
    }
  ] : [];

  const updateNotificationSetting = async (type: 'email' | 'sms', value: boolean) => {
    if (!partnership) return;

    try {
      setUpdatingNotifications(true);
      const newNotifications = { ...partnership.notifications, [type]: value };
      
      const success = await DataService.updateNotificationSettings(partnership.id, newNotifications);
      
      if (success) {
        setPartnership(prev => prev ? { ...prev, notifications: newNotifications } : null);
      } else {
        setError('Failed to update notification settings');
      }
    } catch (err) {
      setError('Failed to update notification settings');
      console.error('Notification update error:', err);
    } finally {
      setUpdatingNotifications(false);
    }
  };

  // Company resources data
  const companyResources = [
    {
      title: 'Loan Programs Guide',
      description: 'Complete overview of available loan programs',
      icon: BookOpen,
      type: 'PDF Guide',
      downloadUrl: '#'
    },
    {
      title: 'Rate Sheets',
      description: 'Current rates and terms for all programs',
      icon: TrendingUp,
      type: 'Live Document',
      downloadUrl: '#'
    },
    {
      title: 'Company Guidelines',
      description: 'Partnership policies and procedures',
      icon: Shield,
      type: 'Reference',
      downloadUrl: '#'
    },
    {
      title: 'Contact Directory',
      description: 'Key contacts and support information',
      icon: Phone,
      type: 'Directory',
      downloadUrl: '#'
    }
  ];

  // Portal features data
  const portalFeatures = [
    {
      icon: Zap,
      title: 'Co-branded Marketing',
      description: 'Access professionally designed landing pages and marketing materials with your partner\'s branding.'
    },
    {
      icon: Target,
      title: 'Lead Management',
      description: 'Receive and track leads generated from shared marketing campaigns automatically.'
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description: 'Share marketing materials via social media, email, or direct links with one click.'
    },
    {
      icon: Star,
      title: 'Performance Tracking',
      description: 'Monitor the success of your marketing efforts with detailed analytics and conversion data.'
    }
  ];

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
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loadingStates.stats ? (
          <LoadingCard type="stats" count={3} />
        ) : (
          statsDisplay.map((stat, index) => (
            <Card key={index} className="border-[var(--brand-powder-blue)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--brand-slate)]">{stat.title}</p>
                    <p className="text-2xl font-bold text-[var(--brand-dark-navy)]">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Partner Profile */}
        <Card className="border-[var(--brand-powder-blue)]">
          <CardHeader>
            <CardTitle className="text-[var(--brand-dark-navy)] flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Your Loan Officer Partner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStates.partnership ? (
              <LoadingCard type="profile" />
            ) : partnership && loanOfficer ? (
              <div className="space-y-4">
                {/* Partner Profile Card */}
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={loanOfficer.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-[var(--brand-electric-blue)] to-[var(--brand-cyan)] text-white text-lg">
                      {loanOfficer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--brand-dark-navy)]">{loanOfficer.name}</h4>
                    <p className="text-sm text-[var(--brand-slate)]">{loanOfficer.title || 'Senior Loan Officer'}</p>
                    <div className="flex items-center space-x-1 text-sm text-[var(--brand-slate)] mt-1">
                      <Building className="h-3 w-3" />
                      <span>{loanOfficer.company}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-[var(--brand-slate)] mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{loanOfficer.location}</span>
                    </div>
                  </div>
                </div>

                {/* Partnership Status */}
                <div className="bg-[var(--brand-pale-blue)] p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--brand-dark-navy)]">Partnership Status</span>
                    <Badge 
                      className={`${partnership.status === 'active' ? 'bg-[var(--brand-cyan)]' : 'bg-orange-500'} text-white`}
                    >
                      {partnership.status === 'active' ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--brand-slate)] mt-1">
                    {partnership.leadsReceived} leads received • Partnership since {new Date(partnership.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Contact Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>

                {/* Social Links */}
                {(loanOfficer.website || loanOfficer.linkedin) && (
                  <div className="pt-3 border-t border-[var(--brand-powder-blue)]">
                    <div className="flex space-x-2">
                      {loanOfficer.website && (
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </Button>
                      )}
                      {loanOfficer.linkedin && (
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                <div className="pt-3 border-t border-[var(--brand-powder-blue)]">
                  <h5 className="font-medium text-[var(--brand-dark-navy)] mb-3">Lead Notifications</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-[var(--brand-steel-blue)]" />
                        <span className="text-sm text-[var(--brand-dark-navy)]">Email</span>
                      </div>
                      <Switch
                        checked={partnership.notifications.email}
                        onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
                        disabled={updatingNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-[var(--brand-steel-blue)]" />
                        <span className="text-sm text-[var(--brand-dark-navy)]">SMS</span>
                      </div>
                      <Switch
                        checked={partnership.notifications.sms}
                        onCheckedChange={(checked) => updateNotificationSetting('sms', checked)}
                        disabled={updatingNotifications}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-[var(--brand-pale-blue)] mx-auto mb-3" />
                <h4 className="font-medium text-[var(--brand-dark-navy)] mb-2">No Partnership Yet</h4>
                <p className="text-sm text-[var(--brand-slate)]">
                  You haven't been invited to partner with a loan officer yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Middle Column - Company Resources */}
        <Card className="border-[var(--brand-powder-blue)]">
          <CardHeader>
            <CardTitle className="text-[var(--brand-dark-navy)] flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Company Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyResources.map((resource, index) => (
                <div 
                  key={index}
                  className="p-4 border border-[var(--brand-powder-blue)] rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[var(--brand-pale-blue)] rounded-lg flex items-center justify-center group-hover:bg-[var(--brand-electric-blue)] group-hover:text-white transition-colors">
                      <resource.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-[var(--brand-dark-navy)]">{resource.title}</h5>
                        <Badge variant="secondary" className="text-xs">
                          {resource.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--brand-slate)] mt-1">{resource.description}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 p-0 h-auto text-[var(--brand-electric-blue)] hover:text-[var(--brand-electric-blue)]/80"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Help Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-[var(--brand-pale-blue)] to-white rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[var(--brand-cyan)] rounded-lg flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-[var(--brand-dark-navy)]">Need Help?</h5>
                    <p className="text-sm text-[var(--brand-slate)]">Contact support for assistance</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-[var(--brand-cyan)] text-[var(--brand-cyan)] hover:bg-[var(--brand-cyan)] hover:text-white"
                  >
                    Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Portal Features */}
        <Card className="border-[var(--brand-powder-blue)]">
          <CardHeader>
            <CardTitle className="text-[var(--brand-dark-navy)] flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Portal Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Portal Overview */}
              <div className="text-center p-4 bg-gradient-to-br from-[var(--brand-electric-blue)] to-[var(--brand-cyan)] text-white rounded-lg">
                <Star className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-medium mb-1">21st Century Partnership Portal</h4>
                <p className="text-sm opacity-90">Your gateway to professional co-branded marketing</p>
              </div>

              {/* Feature List */}
              <div className="space-y-4">
                {portalFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[var(--brand-pale-blue)] rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-4 w-4 text-[var(--brand-electric-blue)]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-[var(--brand-dark-navy)] text-sm">{feature.title}</h5>
                      <p className="text-xs text-[var(--brand-slate)] mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-[var(--brand-powder-blue)]">
                <Button 
                  className="w-full bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white"
                  size="sm"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  View Marketing Materials
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-[var(--brand-electric-blue)] text-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)] hover:text-white"
                  size="sm"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--brand-powder-blue)]">
                <div className="text-center p-3 bg-[var(--brand-pale-blue)] rounded-lg">
                  <div className="text-lg font-bold text-[var(--brand-electric-blue)]">
                    {stats?.coBrandedPages || 0}
                  </div>
                  <div className="text-xs text-[var(--brand-slate)]">Pages Available</div>
                </div>
                <div className="text-center p-3 bg-[var(--brand-pale-blue)] rounded-lg">
                  <div className="text-lg font-bold text-[var(--brand-cyan)]">
                    {stats?.totalLeads || 0}
                  </div>
                  <div className="text-xs text-[var(--brand-slate)]">Total Leads</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}