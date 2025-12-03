import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from '../ui/loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Globe,
  Users,
  Mail,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Pencil,
  Copy,
  ExternalLink
} from 'lucide-react';
import { DataService } from '../../utils/dataService';

interface DigitalMarketingProps {
  userId: string;
  currentUser: any;
  defaultTab?: string;
}

export function DigitalMarketing({ userId, currentUser, defaultTab = 'biolink' }: DigitalMarketingProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // Lead forwarding settings
  const [forwardingEmail, setForwardingEmail] = useState(currentUser.email || '');
  const [additionalEmail, setAdditionalEmail] = useState('');
  const [isSavingEmailSettings, setIsSavingEmailSettings] = useState(false);
  const [isEditingEmailSettings, setIsEditingEmailSettings] = useState(false);
  const [tempForwardingEmail, setTempForwardingEmail] = useState('');
  const [tempAdditionalEmail, setTempAdditionalEmail] = useState('');

  // Real leads data
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [currentLeadPage, setCurrentLeadPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const leadsPerPage = 4;

  // Biolink analytics data
  const [biolinkStats, setBiolinkStats] = useState({
    totalLeads: 0,
    conversionRate: 0,
    leadsTrend: '+0%',
    conversionTrend: '+0%'
  });
  const [isLoadingBiolinkStats, setIsLoadingBiolinkStats] = useState(true);

  // Get biolink URL for preview
  const userSlug = currentUser.name.split(' ')[0].toLowerCase();
  const biolinkUrl = `${window.location.origin}/${userSlug}`;

  // Load real leads data
  useEffect(() => {
    const loadLeads = async () => {
      try {
        setIsLoadingLeads(true);
        const leadsData = await DataService.getLeadsForLO(currentUser.id);
        setLeads(leadsData || []);
      } catch (err) {
        console.error('Failed to load leads:', err);
      } finally {
        setIsLoadingLeads(false);
      }
    };

    loadLeads();
  }, [currentUser.id]);

  // Load biolink analytics data
  useEffect(() => {
    const loadBiolinkStats = async () => {
      try {
        setIsLoadingBiolinkStats(true);
        const leadsData = await DataService.getLeadsForLO(currentUser.id);

        // Filter leads that came from biolink sources only
        const biolinkLeads = (leadsData || []).filter(lead => {
          const source = lead.source?.toLowerCase() || '';
          return source.includes('biolink') || source.includes('fluentform') || source === 'biolink_form';
        });

        const totalLeads = biolinkLeads.length;
        const conversionRate = totalLeads > 0 ? Math.round((totalLeads / 100) * 100) / 100 : 0;

        setBiolinkStats({
          totalLeads,
          conversionRate,
          leadsTrend: '+12%',
          conversionTrend: '+8%'
        });
      } catch (err) {
        console.error('Failed to load biolink stats:', err);
      } finally {
        setIsLoadingBiolinkStats(false);
      }
    };

    loadBiolinkStats();
  }, [currentUser.id]);

  const biolinkStatsDisplay = [
    {
      title: 'Total Leads',
      value: biolinkStats.totalLeads,
      change: biolinkStats.leadsTrend,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Conversion',
      value: `${biolinkStats.conversionRate}%`,
      change: biolinkStats.conversionTrend,
      icon: TrendingUp,
      color: 'text-blue-600'
    }
  ];

  const handleEditEmailSettings = () => {
    setTempForwardingEmail(forwardingEmail);
    setTempAdditionalEmail(additionalEmail);
    setIsEditingEmailSettings(true);
  };

  const handleCancelEmailEdit = () => {
    setTempForwardingEmail('');
    setTempAdditionalEmail('');
    setIsEditingEmailSettings(false);
  };

  const handleSaveEmailSettings = async () => {
    try {
      setIsSavingEmailSettings(true);
      await DataService.updateLeadEmailSettings(userId, {
        forwardingEmail: tempForwardingEmail,
        additionalEmail: tempAdditionalEmail
      });
      setForwardingEmail(tempForwardingEmail);
      setAdditionalEmail(tempAdditionalEmail);
      setIsEditingEmailSettings(false);
    } catch (error) {
      console.error('Failed to save email settings:', error);
    } finally {
      setIsSavingEmailSettings(false);
    }
  };

  // Landing pages mock data
  const landingPages = [
    {
      id: 1,
      title: 'First-Time Buyer Special',
      url: 'https://21st-works.local/first-time-buyer',
      status: 'Live',
      conversionRate: '4.2%',
      views: 892,
      leads: 37,
      lastUpdated: '2024-03-10',
      partners: [
        { name: currentUser.name, initials: currentUser.name.split(' ').map((n: string) => n[0]).join('') }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 rounded-md" style={{ gap: '0.09rem' }}>
          <TabsTrigger value="biolink">Biolink</TabsTrigger>
          <TabsTrigger value="landing-pages">Landing Pages</TabsTrigger>
          <TabsTrigger value="email-campaigns">Email Campaigns</TabsTrigger>
          <TabsTrigger value="local-seo">Local SEO</TabsTrigger>
        </TabsList>

        {/* BIOLINK TAB - EXACT ORIGINAL 3-COLUMN LAYOUT */}
        <TabsContent value="biolink">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[800px] overflow-visible grid-rows-[1fr]">
            {/* Stats Only - First Column */}
            <div className="space-y-4 overflow-y-auto max-h-full">
              {/* Biolink Leads Analytics Card */}
              <Card className="brand-card shadow-sm border-l-4 border-l-green-500">
                <CardHeader className="h-12 flex items-center px-4 rounded-t-md" style={{ backgroundColor: '#B6C7D9' }}>
                  <CardTitle className="flex items-center gap-1 text-gray-700 text-sm">
                    <TrendingUp className="h-3 w-3" />
                    Biolink Leads
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {isLoadingBiolinkStats ? (
                    <div className="flex items-center justify-center py-6">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2 text-gray-500">Loading stats...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {biolinkStatsDisplay.map((stat, index) => (
                        <div key={index} className="border border-[var(--brand-powder-blue)] rounded-md">
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-[var(--brand-slate)]">{stat.title}</p>
                                <p className="text-xl font-bold text-[var(--brand-dark-navy)]">{stat.value}</p>
                                <p className="text-xs text-[var(--brand-steel-blue)]">{stat.change}</p>
                              </div>
                              <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Biolink Preview - Second Column (Takes 2 columns) */}
            <div className="lg:col-span-2 min-h-[800px]">
              <Card className="brand-card shadow-sm border-l-4 border-l-blue-500 h-full">
                <CardContent className="p-2 h-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Share Your Biolink</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-50 rounded-md p-2 border border-blue-200 flex items-center gap-3">
                        <a
                          href={biolinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 font-medium hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                        >
                          {biolinkUrl}
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          className="brand-button brand-button-hover h-6 px-3 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(biolinkUrl);
                          }}
                        >
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="brand-button brand-button-primary h-6 px-3 text-xs"
                          onClick={() => window.open(biolinkUrl, '_blank')}
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative">
                      {/* Full Size Phone Frame with scrolled view */}
                      <div className="w-96 h-[700px] bg-black rounded-[3rem] p-2 shadow-2xl">
                        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                          <iframe
                            key={previewKey}
                            src={`${biolinkUrl}?preview=1&t=${Date.now()}`}
                            className="w-full border-0"
                            style={{ height: 'calc(100% + 205px)', marginTop: '-105px' }}
                            title="Biolink Preview"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* LANDING PAGES TAB */}
        <TabsContent value="landing-pages" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: 'var(--brand-primary-blue)' }}>12</div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: 'var(--brand-rich-teal)' }}>1,295</div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  +18% this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: 'var(--brand-navy)' }}>4.1%</div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  +0.5% improvement
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Landing Pages</CardTitle>
              <CardDescription>Manage your campaign landing pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {landingPages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-4 rounded-md border">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium">{page.title}</h3>
                        <Badge
                          variant={page.status === 'Live' ? 'default' : 'secondary'}
                          style={{
                            background: page.status === 'Live' ? 'var(--brand-rich-teal)' : 'var(--secondary)',
                            color: page.status === 'Live' ? 'white' : 'var(--secondary-foreground)'
                          }}
                        >
                          {page.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <span className="flex items-center space-x-1">
                          <Eye className="size-3" />
                          <span>{page.views} views</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="size-3" />
                          <span>{page.leads} leads</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <TrendingUp className="size-3" />
                          <span>{page.conversionRate}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        {page.partners.map((partner, index) => (
                          <Avatar key={index} className="size-6">
                            <AvatarFallback className="text-xs">
                              {partner.initials}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="brand-hover">
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="brand-hover">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="brand-hover">
                        <Copy className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="brand-hover">
                        <ExternalLink className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMAIL CAMPAIGNS TAB */}
        <TabsContent value="email-campaigns" className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-md flex items-center justify-center">
              <div className="text-center">
                <div
                  className="text-2xl font-bold mb-2"
                  style={{ color: 'var(--brand-primary-blue)' }}
                >
                  Coming Soon
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Email campaigns feature is in development
                </p>
              </div>
            </div>
            <Card className="blur-sm">
              <CardHeader>
                <CardTitle>Email Campaigns</CardTitle>
                <CardDescription>Create and manage email marketing campaigns</CardDescription>
              </CardHeader>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  Email campaign management tools
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LOCAL SEO TAB */}
        <TabsContent value="local-seo" className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-md flex items-center justify-center">
              <div className="text-center">
                <div
                  className="text-2xl font-bold mb-2"
                  style={{ color: 'var(--brand-primary-blue)' }}
                >
                  Coming Soon
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Local SEO tools are in development
                </p>
              </div>
            </div>
            <Card className="blur-sm">
              <CardHeader>
                <CardTitle>Local SEO Management</CardTitle>
                <CardDescription>Optimize your local search presence and rankings</CardDescription>
              </CardHeader>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  Local SEO optimization tools
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
