import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { LoadingSpinner } from './ui/loading';
import { ErrorAlert } from './ui/error';
import { ProfileSection } from './ProfileSection';
import { ProfileTour, TourTrigger } from './ProfileTour';
import { User, Phone, Mail, Globe, Settings, LogOut, ChevronDown, Users, Calendar, Briefcase, ChevronLeft, ChevronRight, X, TrendingUp, BarChart3, Eye, Share2, Clock, CheckCircle, XCircle, Folder, Building, MapPin, Plus, Edit } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  UserPlus,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Building,
  MapPin,
  Plus,
  MoreHorizontal,
  ExternalLink,
  Download,
  Activity,
  Edit
} from 'lucide-react';
import { DataService, type User as UserType, type Partnership, type LandingPage, type DashboardStats, type Lead } from '../utils/dataService';
import { APP_CONFIG, STATUS_CONFIG } from '../config/appConfig';
import { PAGE_TYPE_LABELS, buildLandingEditorUrl } from '../constants/landing';
import { LoadingCard } from './ui/loading';
import { ErrorDisplay } from './ui/error';

interface BiolinkDashboardProps {
  userId: string;
  currentUser: UserType;
}

export function BiolinkDashboard({ userId, currentUser: initialUser }: BiolinkDashboardProps) {
  const [currentUser, setCurrentUser] = useState<UserType>(initialUser);
  const [activeSection, setActiveSection] = useState<'digital' | 'social-print' | 'partner'>('digital');
  const [digitalSubTab, setDigitalSubTab] = useState<'welcome' | 'biolink' | 'edit-profile'>('welcome');
  const [partnerSubTab, setPartnerSubTab] = useState<'dashboard' | 'landing-pages'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Tour state
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Get biolink URL for preview - using first name as slug (matching existing biolink pages)
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
        setError('Failed to load leads data');
      } finally {
        setIsLoadingLeads(false);
      }
    };

    loadLeads();
  }, [currentUser.id]);

  // Load biolink analytics data - using same stats structure as LO dashboard
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

        // Calculate conversion rate and trends from real data
        const totalLeads = biolinkLeads.length;
        const conversions = biolinkLeads.filter(lead => lead.status === 'converted').length;
        const conversionRate = totalLeads > 0 ? Math.round((conversions / totalLeads) * 100) : 0;

        // Calculate trends based on time periods
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentLeads = biolinkLeads.filter(lead => {
          const leadDate = new Date(lead.createdAt || lead.date);
          return leadDate >= thirtyDaysAgo;
        });

        const olderLeads = biolinkLeads.filter(lead => {
          const leadDate = new Date(lead.createdAt || lead.date);
          return leadDate < thirtyDaysAgo;
        });

        // Calculate lead trend
        const recentLeadsCount = recentLeads.length;
        const olderLeadsCount = olderLeads.length;
        const leadsTrend = olderLeadsCount > 0
          ? `${recentLeadsCount > olderLeadsCount ? '+' : ''}${Math.round(((recentLeadsCount - olderLeadsCount) / olderLeadsCount) * 100)}%`
          : recentLeadsCount > 0 ? `+${recentLeadsCount}` : '0%';

        // Calculate conversion trend
        const recentConversions = recentLeads.filter(lead => lead.status === 'converted').length;
        const olderConversions = olderLeads.filter(lead => lead.status === 'converted').length;
        const recentConversionRate = recentLeads.length > 0 ? (recentConversions / recentLeads.length) * 100 : 0;
        const olderConversionRate = olderLeads.length > 0 ? (olderConversions / olderLeads.length) * 100 : 0;
        const conversionTrend = olderConversionRate > 0
          ? `${recentConversionRate > olderConversionRate ? '+' : ''}${(recentConversionRate - olderConversionRate).toFixed(1)}%`
          : recentConversionRate > 0 ? `+${recentConversionRate.toFixed(1)}%` : '0%';

        setBiolinkStats({
          totalLeads,
          conversionRate,
          leadsTrend,
          conversionTrend
        });
      } catch (err) {
        console.error('Failed to load biolink stats:', err);
      } finally {
        setIsLoadingBiolinkStats(false);
      }
    };

    loadBiolinkStats();
  }, [currentUser.id]);

  // Build biolink stats display data - same structure as LO dashboard
  const biolinkStatsDisplay = [
    {
      title: 'Total Leads',
      value: biolinkStats.totalLeads.toString(),
      change: biolinkStats.leadsTrend,
      icon: TrendingUp,
      color: 'text-[var(--brand-electric-blue)]'
    },
    {
      title: 'Conversion Rate',
      value: `${biolinkStats.conversionRate}%`,
      change: biolinkStats.conversionTrend,
      icon: BarChart3,
      color: 'text-[var(--brand-steel-blue)]'
    }
  ];

  // Load email forwarding settings
  useEffect(() => {
    const loadEmailSettings = async () => {
      try {
        // Get user's email forwarding settings from user meta or People CPT
        const response = await fetch(`/wp-json/frs/v1/users/${currentUser.id}/email-settings`, {
          headers: {
            'X-WP-Nonce': (window as any).frsPortalData?.nonce || ''
          }
        });

        if (response.ok) {
          const settings = await response.json();
          setForwardingEmail(settings.primary_email || currentUser.email || '');
          setAdditionalEmail(settings.additional_email || '');
        }
      } catch (err) {
        console.error('Failed to load email settings:', err);
        // Use defaults
        setForwardingEmail(currentUser.email || '');
      }
    };

    loadEmailSettings();
  }, [currentUser.id, currentUser.email]);

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserDropdownOpen]);

  const handleLogout = () => {
    const logoutUrl = (window as any).frsPortalData?.logoutUrl;
    if (logoutUrl) {
      window.location.href = logoutUrl;
    } else {
      window.location.href = '/wp-login.php?action=logout';
    }
  };

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

      const response = await fetch(`/wp-json/frs/v1/users/${currentUser.id}/email-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': (window as any).frsPortalData?.nonce || ''
        },
        body: JSON.stringify({
          primary_email: tempForwardingEmail,
          additional_email: tempAdditionalEmail
        })
      });

      if (response.ok) {
        // Update the actual values and exit edit mode
        setForwardingEmail(tempForwardingEmail);
        setAdditionalEmail(tempAdditionalEmail);
        setIsEditingEmailSettings(false);
        console.log('Email settings saved successfully');
      } else {
        throw new Error('Failed to save email settings');
      }
    } catch (err) {
      console.error('Failed to save email settings:', err);
      setError('Failed to save email settings');
    } finally {
      setIsSavingEmailSettings(false);
    }
  };


  const renderBiolinkTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Leads - First Column */}
        <div className="space-y-4">
          {/* Biolink Leads Analytics Card - copied from LO dashboard */}
          <Card className="shadow-lg border-l-4 rounded-lg border-l-green-500">
            <CardHeader className="h-12 flex items-center px-4 rounded-t-lg" style={{ backgroundColor: '#B6C7D9' }}>
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
                    <div key={index} className="border border-[var(--brand-powder-blue)] rounded-lg">
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
          <Card className="shadow-lg border-l-4 rounded-lg border-l-blue-500">
            <CardHeader className="h-12 flex items-center px-4 rounded-t-lg" style={{ backgroundColor: '#B6C7D9' }}>
              <CardTitle className="flex items-center gap-1 text-gray-700 text-sm">
                <Users className="h-3 w-3" />
                Recent Leads
              </CardTitle>
            </CardHeader>
          <CardContent className="p-3">
            {isLoadingLeads ? (
              <div className="flex items-center justify-center py-6">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-gray-500">Loading leads...</span>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 pb-4">
                  {(() => {
                    const startIndex = (currentLeadPage - 1) * leadsPerPage;
                    const endIndex = startIndex + leadsPerPage;
                    const paginatedLeads = leads.slice(startIndex, endIndex);

                    return paginatedLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all bg-white hover:bg-blue-50 cursor-pointer"
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsLeadModalOpen(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {((lead.firstName && lead.lastName)
                                  ? `${lead.firstName[0]}${lead.lastName[0]}`
                                  : (lead.name || 'U')[0]
                                ).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate text-xs">
                                  {lead.firstName && lead.lastName
                                    ? `${lead.firstName} ${lead.lastName}`
                                    : lead.name || 'Unknown Lead'
                                  }
                                </h4>
                                <div className="text-xs text-gray-600 truncate">
                                  {lead.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-500">
                              {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : lead.date}
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0 bg-green-50 text-green-700 border-green-200 mt-1"
                            >
                              {lead.source || 'Biolink'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}

                  {leads.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 opacity-50" />
                      </div>
                      <p className="font-medium mb-1 text-sm">No leads yet</p>
                      <p className="text-xs">Share your biolink to start receiving leads!</p>
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium">Your biolink URL:</p>
                        <code className="text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded mt-1 inline-block break-all">{biolinkUrl}</code>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {leads.length > leadsPerPage && (
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      {Math.min((currentLeadPage - 1) * leadsPerPage + 1, leads.length)}-{Math.min(currentLeadPage * leadsPerPage, leads.length)} of {leads.length}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setCurrentLeadPage(prev => Math.max(1, prev - 1))}
                        disabled={currentLeadPage === 1}
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <span className="text-xs px-2">{currentLeadPage}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setCurrentLeadPage(prev => Math.min(Math.ceil(leads.length / leadsPerPage), prev + 1))}
                        disabled={currentLeadPage >= Math.ceil(leads.length / leadsPerPage)}
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Lead Email Notifications - Under Recent Leads */}
        <Card className={`shadow-lg border-l-4 transition-all duration-300 ${
          isEditingEmailSettings
            ? 'border-l-orange-500 bg-orange-50/30'
            : 'border-l-green-500 bg-white'
        }`}>
          <CardHeader className="h-12 flex items-center px-4 rounded-t-lg" style={{ backgroundColor: '#B6C7D9' }}>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-1 text-gray-700 text-sm">
                <Mail className="h-3 w-3" />
                Lead Email Settings
                {isEditingEmailSettings && (
                  <Badge variant="outline" className="ml-1 text-xs text-orange-700 border-orange-300 bg-orange-100">
                    Editing
                  </Badge>
                )}
              </CardTitle>
              {!isEditingEmailSettings && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditEmailSettings}
                  className="text-blue-700 border-blue-300 hover:bg-blue-50 h-6 px-2 text-xs"
                >
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-3">
            {isEditingEmailSettings ? (
              <>
                <div>
                  <Label htmlFor="tempForwardingEmail" className="text-sm font-medium">Primary Email for Leads</Label>
                  <Input
                    id="tempForwardingEmail"
                    type="email"
                    value={tempForwardingEmail}
                    onChange={(e) => setTempForwardingEmail(e.target.value)}
                    placeholder="Leads will be forwarded to this email"
                    className="mt-1 border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <Label htmlFor="tempAdditionalEmail" className="text-sm font-medium">Additional Email (Optional)</Label>
                  <Input
                    id="tempAdditionalEmail"
                    type="email"
                    value={tempAdditionalEmail}
                    onChange={(e) => setTempAdditionalEmail(e.target.value)}
                    placeholder="Send copies to additional email"
                    className="mt-1 border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleSaveEmailSettings}
                    disabled={isSavingEmailSettings}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {isSavingEmailSettings ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={handleCancelEmailEdit}
                    disabled={isSavingEmailSettings}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <Label className="text-sm font-medium text-gray-700">Primary Email</Label>
                    <p className="text-sm text-gray-900 mt-1">{forwardingEmail || 'Not set'}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <Label className="text-sm font-medium text-gray-700">Additional Email</Label>
                    <p className="text-sm text-gray-900 mt-1">{additionalEmail || 'Not set'}</p>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-xs text-gray-500">
                    Leads submitted through your biolink will be forwarded to these email addresses
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Biolink Preview - Second (Takes 2 columns) */}
      <div className="lg:col-span-2">
        <Card className="shadow-lg border-l-4 rounded-lg border-l-blue-500">
          <CardContent className="p-6">
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
                    className="h-6 px-3 text-xs bg-white hover:bg-blue-50"
                    onClick={() => {
                      navigator.clipboard.writeText(biolinkUrl);
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-6 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open(biolinkUrl, '_blank')}
                  >
                    Open
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-center py-6">
              <div className="relative">
                {/* Full Size Phone Frame with scrolled view */}
                <div className="w-96 h-auto bg-black rounded-[3rem] p-2 shadow-2xl">
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
  );

  const renderComingSoon = (tabName: string) => (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">{tabName} Features</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          We're working on exciting new features for this section. Stay tuned for updates!
        </p>
        <Badge variant="secondary" className="px-4 py-2">
          Coming Soon
        </Badge>
      </div>
    </div>
  );

  return (
    <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as 'digital' | 'social-print' | 'partner')} className="flex flex-col">
      <div className="min-h-screen bg-[var(--brand-page-background)]">
        {/* Header - Fixed Dark Navigation */}
        <header
          className="fixed top-0 left-0 right-0 z-40 px-6 py-4 shadow-lg"
          style={{
            backgroundColor: '#171A1F',
            borderBottom: '1px solid #263042'
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-4">
              {(window as any).frsPortalData?.siteLogo ? (
                <img
                  src={(window as any).frsPortalData.siteLogo}
                  alt="Site Logo"
                  className="h-8 w-auto max-w-40"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-2xl font-bold text-white">
                  {(window as any).frsPortalData?.siteName || APP_CONFIG.legal.companyName}
                </div>
              )}
              <div className="frs-portal-title text-sm" style={{color: '#C3D9F1'}}>Marketing Portal</div>
            </div>

            {/* User Controls */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                {/* User Role Display */}
                <div
                  className="frs-user-role text-sm px-3 py-1 rounded-md"
                  style={{color: '#C3D9F1', backgroundColor: '#263042'}}
                >
                  Loan Officer
                </div>

                {/* Settings Button - opens Profile tab */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#C3D9F1] hover:text-white"
                  style={{backgroundColor: '#263042'}}
                  data-tour="settings-button"
                  onClick={() => {
                    setActiveSection('digital');
                    setDigitalSubTab('edit-profile');
                  }}
                >
                  <Settings className="h-5 w-5" />
                </Button>

                {/* User Avatar Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 hover:bg-[#405C7A] rounded-lg px-3 py-2 transition-colors"
                    style={{backgroundColor: '#263042'}}
                  >
                    <img
                      src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=2DD4DA&color=fff`}
                      alt={currentUser.name || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-[#C3D9F1]"
                      onError={(e) => {
                        console.log('Avatar error, fallback to initials for:', currentUser.name);
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=2DD4DA&color=fff`;
                      }}
                    />
                    <ChevronDown className="w-4 h-4 text-[#C3D9F1]" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-30">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img
                            src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=2DD4DA&color=fff`}
                            alt={currentUser.name || 'User'}
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=2DD4DA&color=fff`;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {currentUser.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setActiveSection('digital');
                            setDigitalSubTab('edit-profile');
                            setIsUserDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profile Settings
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Tab Navigation */}
        <div className="fixed top-[80px] left-0 right-0 z-40 bg-white border-b shadow-sm">
          <div className="px-8 py-6 tab-navigation-container">
            <TabsList className="bg-[var(--brand-pale-blue)] w-full grid grid-cols-3 h-16 gap-4 rounded-lg" style={{ margin: 0, padding: '12px' }}>
              <TabsTrigger value="digital" className="text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:bg-white/70 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                My Profile
              </TabsTrigger>
              <TabsTrigger value="social-print" className="text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:bg-white/70 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                Social & Print
              </TabsTrigger>
              <TabsTrigger value="partner" className="text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:bg-white/70 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                Partner
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-4 pb-8 min-h-[calc(100vh-180px)]" style={{ paddingTop: '180px' }}>
          {error && (
            <div className="mb-6">
              <ErrorAlert
                type="error"
                title="Error"
                message={error}
                onDismiss={() => setError(null)}
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-[var(--brand-slate)]">Loading dashboard...</span>
            </div>
          ) : (
            <>
              <TabsContent value="digital" className="mt-0">
                <Tabs value={digitalSubTab} onValueChange={(value) => setDigitalSubTab(value as 'welcome' | 'biolink' | 'edit-profile')} className="w-full">
                  {/* Digital Section Header - Dynamic Title + Sub-tabs */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-blue-900 mb-2">
                          {(() => {
                            switch (digitalSubTab) {
                              case 'welcome': return `Welcome, ${currentUser.name.split(' ')[0] || 'User'}`;
                              case 'biolink': return 'Your Biolink Dashboard';
                              case 'edit-profile': return 'Edit Your Profile';
                              default: return 'Welcome';
                            }
                          })()}
                        </h2>
                        <p className="text-sm text-blue-700 max-w-2xl">
                          {(() => {
                            switch (digitalSubTab) {
                              case 'welcome': return 'View your profile overview, announcements, and quick links. Stay updated with important information and access your most-used tools.';
                              case 'biolink': return 'Manage your personal biolink page, view incoming leads, and configure forwarding settings. Your biolink connects clients to all your contact methods.';
                              case 'edit-profile': return 'Update your personal information, contact details, and professional links. Changes are saved automatically to your biolink and profile.';
                              default: return 'Welcome to your dashboard';
                            }
                          })()}
                        </p>
                        {digitalSubTab === 'welcome' && (
                          <div className="mt-4">
                            <TourTrigger
                              onStartTour={() => setIsTourOpen(true)}
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            />
                          </div>
                        )}
                      </div>
                      <div className="ml-16">
                        <TabsList className="bg-white border border-blue-200 rounded-lg shadow-sm py-8 px-4 flex gap-4" data-tour="profile-tabs">
                          <TabsTrigger value="welcome" className="px-8 py-3 text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                            Welcome
                          </TabsTrigger>
                          <TabsTrigger value="biolink" className="px-8 py-3 text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md" data-tour="biolink-tab">
                            Biolink
                          </TabsTrigger>
                          <TabsTrigger value="edit-profile" className="px-8 py-3 text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md" data-tour="edit-profile-tab">
                            Edit Profile
                          </TabsTrigger>
                        </TabsList>
                      </div>
                    </div>
                  </div>

                  <TabsContent value="welcome" className="mt-0">
                    <ProfileSection userRole="loan-officer" userId={currentUser.id} activeTab="welcome" tourAttributes={{
                      announcements: "announcements",
                      profileSummary: "profile-summary"
                    }} />
                  </TabsContent>

                  <TabsContent value="biolink" className="mt-0">
                    {renderBiolinkTab()}
                  </TabsContent>

                  <TabsContent value="edit-profile" className="mt-0">
                    <ProfileSection userRole="loan-officer" userId={currentUser.id} activeTab="personal" autoEdit={true} />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="social-print" className="mt-0">
                {renderComingSoon('Social & Print')}
              </TabsContent>

              <TabsContent value="partner" className="mt-0">
                <Tabs value={partnerSubTab} onValueChange={(value) => setPartnerSubTab(value as 'dashboard' | 'landing-pages')} className="w-full">
                  {/* Partner Section Header - Dynamic Title + Sub-tabs */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-blue-900 mb-2">
                          {(() => {
                            switch (partnerSubTab) {
                              case 'dashboard': return 'My Partnerships';
                              case 'landing-pages': return 'Landing Pages';
                              default: return 'Partner Portal';
                            }
                          })()}
                        </h2>
                        <p className="text-sm text-blue-700 max-w-2xl">
                          {(() => {
                            switch (partnerSubTab) {
                              case 'dashboard': return 'Manage your real estate partnerships, send invitations, and track collaboration activity with your partner network.';
                              case 'landing-pages': return 'Create and manage co-branded landing pages for lead generation with your real estate partners.';
                              default: return 'Manage your partnerships and marketing materials';
                            }
                          })()}
                        </p>
                      </div>
                      <div className="ml-16">
                        <TabsList className="bg-white border border-blue-200 rounded-lg shadow-sm py-8 px-4 flex gap-4">
                          <TabsTrigger value="dashboard" className="px-8 py-3 text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                            My Partnerships
                          </TabsTrigger>
                          <TabsTrigger value="landing-pages" className="px-8 py-3 text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                            Landing Pages
                          </TabsTrigger>
                        </TabsList>
                      </div>
                    </div>
                  </div>

                  <TabsContent value="dashboard" className="mt-0">
                    <PartnerDashboard userId={currentUser.id} currentUser={currentUser} />
                  </TabsContent>

                  <TabsContent value="landing-pages" className="mt-0">
                    <LandingPagesOnly
                      userRole="loan-officer"
                      userId={currentUser.id}
                      currentUser={currentUser}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </>
          )}
        </main>

        {/* Lead Details Modal */}
        {isLeadModalOpen && selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="space-y-6">
                  {/* Lead Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                      {((selectedLead.firstName && selectedLead.lastName)
                        ? `${selectedLead.firstName[0]}${selectedLead.lastName[0]}`
                        : (selectedLead.name || 'U')[0]
                      ).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {selectedLead.firstName && selectedLead.lastName
                          ? `${selectedLead.firstName} ${selectedLead.lastName}`
                          : selectedLead.name || 'Unknown Lead'
                        }
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {selectedLead.source || 'Biolink'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleDateString() : selectedLead.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedLead.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{selectedLead.email}</span>
                          </div>
                        )}
                        {selectedLead.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{selectedLead.phone}</span>
                          </div>
                        )}
                        {selectedLead.location && (
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{selectedLead.location}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Lead Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Source:</span>
                          <span className="text-sm ml-2">{selectedLead.source || 'Biolink'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Date:</span>
                          <span className="text-sm ml-2">
                            {selectedLead.createdAt
                              ? new Date(selectedLead.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : selectedLead.date
                            }
                          </span>
                        </div>
                        {selectedLead.leadType && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Type:</span>
                            <span className="text-sm ml-2">{selectedLead.leadType}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional Information */}
                  {(selectedLead.message || selectedLead.notes || selectedLead.interest) && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Additional Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedLead.message && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Message:</span>
                            <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{selectedLead.message}</p>
                          </div>
                        )}
                        {selectedLead.interest && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Interest:</span>
                            <span className="text-sm ml-2">{selectedLead.interest}</span>
                          </div>
                        )}
                        {selectedLead.notes && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Notes:</span>
                            <p className="text-sm mt-1">{selectedLead.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    {selectedLead.email && (
                      <Button
                        className="flex-1"
                        onClick={() => window.open(`mailto:${selectedLead.email}`, '_blank')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    )}
                    {selectedLead.phone && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`tel:${selectedLead.phone}`, '_blank')}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Tour */}
      <ProfileTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </Tabs>
  );
}

// Partner Dashboard component - copied from LoanOfficerDashboard
interface PartnerDashboardProps {
  userId: string;
  currentUser?: UserType;
}

function PartnerDashboard({ userId, currentUser }: PartnerDashboardProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isInviting, setIsInviting] = useState(false);

  // Data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [partners, setPartners] = useState<UserType[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    stats: true,
    partners: true,
    pages: true
  });

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load all data in parallel
        console.log('PartnerDashboard - Fetching data for userId:', userId);
        const [statsData, partnersData, partnershipsData, pagesData, leadsData] = await Promise.all([
          DataService.getDashboardStatsForLO(userId),
          DataService.getPartnersForLO(userId),
          DataService.getPartnershipsForLO(userId),
          DataService.getLandingPagesForLO(userId),
          DataService.getLeadsForLO(userId)
        ]);

        console.log('PartnerDashboard - Landing pages received:', pagesData);
        setStats(statsData);
        setPartners(partnersData);
        setPartnerships(partnershipsData);
        setLandingPages(pagesData);
        setLeads(leadsData);

      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard loading error:', err);
      } finally {
        setIsLoading(false);
        setLoadingStates({
          stats: false,
          partners: false,
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

  const getLeadStatusBadge = (status: 'new' | 'contacted' | 'qualified' | 'closed' | 'lost') => {
    const statusConfig = {
      new: { label: 'New', color: 'bg-blue-600' },
      contacted: { label: 'Contacted', color: 'bg-yellow-600' },
      qualified: { label: 'Qualified', color: 'bg-purple-600' },
      closed: { label: 'Closed', color: 'bg-green-600' },
      lost: { label: 'Lost', color: 'bg-red-600' }
    };

    const config = statusConfig[status];
    const icons = {
      new: Plus,
      contacted: Phone,
      qualified: CheckCircle,
      closed: CheckCircle,
      lost: XCircle
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
    const partnership = partnerships.find(p => p.realtorId === partnerId);
    return partnership?.status || 'inactive';
  };

  const getPartnershipDate = (partnerId: string): string => {
    const partnership = partnerships.find(p => p.realtorId === partnerId);
    return partnership ? new Date(partnership.createdAt).toLocaleDateString() : 'N/A';
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsInviting(true);
      const success = await DataService.invitePartner(
        userId,
        inviteForm.email,
        inviteForm.name,
        inviteForm.message
      );

      if (success) {
        setIsInviteModalOpen(false);
        setInviteForm({ name: '', email: '', message: '' });
        // TODO: Show success toast
        // Reload partnerships to reflect new pending invitation
        const updatedPartnerships = await DataService.getPartnershipsForLO(userId);
        setPartnerships(updatedPartnerships);
      }
    } catch (err) {
      setError('Failed to send invitation. Please try again.');
      console.error('Invite error:', err);
    } finally {
      setIsInviting(false);
    }
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
    <div className="space-y-6">
      {/* Two Column Layout: Left (Stats + Partners) | Right (Invite) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Stats Cards + Partner Profiles */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadingStates.stats ? (
              <LoadingCard type="stats" count={2} />
            ) : (
              statsDisplay.slice(0, 2).map((stat, index) => (
                <Card key={index} className="border-[var(--brand-powder-blue)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[var(--brand-slate)]">{stat.title}</p>
                        <p className="text-xl font-bold text-[var(--brand-dark-navy)]">{stat.value}</p>
                        <p className="text-xs text-[var(--brand-steel-blue)]">{stat.change}</p>
                      </div>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Partner Profiles Card */}
          <Card className="border-[var(--brand-powder-blue)] flex flex-col h-full">
            <CardHeader className="h-12 flex items-center px-4 rounded-t-lg" style={{ backgroundColor: '#B6C7D9' }}>
              <CardTitle className="flex items-center gap-1 text-gray-700 text-sm">
                <Users className="h-3 w-3" />
                Partner Profiles & Resources ({partners.length})
              </CardTitle>
            </CardHeader>
          <CardContent className="flex-1">
            {loadingStates.partners ? (
              <div className="space-y-4">
                <LoadingCard type="profile" count={3} />
              </div>
            ) : partners.length > 0 ? (
              <div className="space-y-4">
                {partners.map((partner) => (
                  <Card
                    key={partner.id}
                    className="border-[var(--brand-powder-blue)] hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        {/* Partner Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-[var(--brand-electric-blue)] to-[var(--brand-cyan)] rounded-full flex items-center justify-center text-white font-medium">
                            {partner.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>

                        {/* Partner Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-[var(--brand-dark-navy)] truncate">{partner.name}</h4>
                            {getStatusBadge(getPartnershipStatus(partner.id))}
                          </div>

                          <div className="space-y-1 mt-2">
                            <div className="flex items-center text-sm text-[var(--brand-slate)]">
                              <Building className="h-3 w-3 mr-1" />
                              <span className="truncate">{partner.company}</span>
                            </div>
                            <div className="flex items-center text-sm text-[var(--brand-slate)]">
                              <Mail className="h-3 w-3 mr-1" />
                              <span className="truncate">{partner.email}</span>
                            </div>
                            <div className="flex items-center text-sm text-[var(--brand-slate)]">
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
                                className="h-8 px-2 text-xs"
                                title="View Profile"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Profile
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                title="Shared Resources"
                              >
                                <Folder className="h-3 w-3 mr-1" />
                                Resources
                              </Button>
                            </div>

                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Contact">
                                <Mail className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Call">
                                <Phone className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Share">
                                <Share2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Shared Resources Preview */}
                          <div className="mt-3 p-3 bg-[var(--brand-pale-blue)] rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-[var(--brand-slate)]">
                                <span className="font-medium">Shared Resources:</span>
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-[var(--brand-slate)]">
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
                              <span className="text-xs text-[var(--brand-slate)]">Last activity: 2 days ago</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs border-[var(--brand-electric-blue)] text-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)] hover:text-white"
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
                <Users className="h-12 w-12 text-[var(--brand-pale-blue)] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--brand-dark-navy)] mb-2">No Partners Yet</h3>
                <p className="text-[var(--brand-slate)] mb-4">
                  Start building your realtor network by inviting your first partner.
                </p>
                <Button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Your First Partner
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* Right Column: Invite Card */}
        <div>
          <Card className="border-[var(--brand-powder-blue)] flex flex-col h-full">
            <CardHeader className="h-12 flex items-center px-4 rounded-t-lg" style={{ backgroundColor: '#B6C7D9' }}>
              <CardTitle className="flex items-center gap-1 text-gray-700 text-sm">
                <UserPlus className="h-3 w-3" />
                Invite New Realtor Partners
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-6 flex-1">
            {/* Instructions Section */}
            <div className="bg-gradient-to-r from-[var(--brand-pale-blue)] to-white p-4 rounded-lg border border-[var(--brand-powder-blue)]">
              <h4 className="font-medium text-[var(--brand-dark-navy)] mb-3">How Partnership Invitations Work</h4>
              <div className="space-y-2 text-sm text-[var(--brand-slate)]">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-[var(--brand-electric-blue)] text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">1</div>
                  <span>Send an invitation to realtor partners with your personal message</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-[var(--brand-electric-blue)] text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">2</div>
                  <span>Partners receive access to co-branded marketing materials</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-[var(--brand-electric-blue)] text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">3</div>
                  <span>Track shared resources and lead generation together</span>
                </div>
              </div>
            </div>

            {/* Quick Invite Form */}
            <div className="space-y-4">
              <h4 className="font-medium text-[var(--brand-dark-navy)]">Quick Invite</h4>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="quick-name" className="text-sm">Realtor Name</Label>
                  <Input
                    id="quick-name"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    placeholder="Enter full name"
                    className="bg-[var(--brand-input-background)]"
                    required
                    disabled={isInviting}
                  />
                </div>
                <div>
                  <Label htmlFor="quick-email" className="text-sm">Email Address</Label>
                  <Input
                    id="quick-email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="Enter email address"
                    className="bg-[var(--brand-input-background)]"
                    required
                    disabled={isInviting}
                  />
                </div>
                <div>
                  <Label htmlFor="quick-message" className="text-sm">Personal Message (Optional)</Label>
                  <Textarea
                    id="quick-message"
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    placeholder="Add a personal touch to your invitation..."
                    className="bg-[var(--brand-input-background)]"
                    rows={3}
                    disabled={isInviting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white"
                  disabled={isInviting}
                >
                  {isInviting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}

// Landing Pages component with actual previews - copied from MarketingMaterials
interface LandingPagesOnlyProps {
  userRole: 'loan-officer' | 'realtor';
  userId: string;
  currentUser?: UserType;
}

function LandingPagesOnly({ userRole, userId, currentUser }: LandingPagesOnlyProps) {
  const [loading, setLoading] = useState(true);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorPageId, setEditorPageId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPageId, setPreviewPageId] = useState<string | null>(null);

  useEffect(() => {
    const loadLandingPages = async () => {
      try {
        setLoading(true);

        // Load landing pages and leads based on user role
        if (userRole === 'loan-officer') {
          const [pages, leadsData] = await Promise.all([
            DataService.getLandingPagesForLO(userId),
            DataService.getLeadsForLO(userId)
          ]);
          // Filter out biolink pages - only show prequal and open house
          const filteredPages = pages.filter(page => page.type !== 'biolink');
          setLandingPages(filteredPages);
          setLeads(leadsData);
        } else {
          const pages = await DataService.getCoBrandedPagesForRealtor(userId);
          // Filter out biolink pages - only show prequal and open house
          const filteredPages = pages.filter(page => page.type !== 'biolink');
          setLandingPages(filteredPages);
          setLeads([]); // Realtors don't see leads
        }

      } catch (error) {
        console.error('Failed to load landing pages:', error);
        setLandingPages([]);
      } finally {
        setLoading(false);
      }
    };

    loadLandingPages();
  }, [userId, userRole]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event && event.data && event.data.type === 'frs:lp:saved') {
        setEditorOpen(false);
        setEditorPageId(null);
        (async () => {
          try {
            if (userRole === 'loan-officer') {
              const pages = await DataService.getLandingPagesForLO(userId);
              const filteredPages = pages.filter(page => page.type !== 'biolink');
              setLandingPages(filteredPages);
            } else {
              const pages = await DataService.getCoBrandedPagesForRealtor(userId);
              const filteredPages = pages.filter(page => page.type !== 'biolink');
              setLandingPages(filteredPages);
            }
          } catch (e) {}
        })();
      }

      if (event && event.data && event.data.type === 'frs:lp:close') {
        setEditorOpen(false);
        setEditorPageId(null);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [userId, userRole]);

  const openEditor = (pageId: string) => {
    // Use iframe editor for all page types (including biolink)
    setEditorPageId(pageId);
    setEditorOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      published: { color: 'bg-[var(--brand-cyan)]', label: 'Published' },
      draft: { color: 'bg-orange-500', label: 'Draft' },
      archived: { color: 'bg-[var(--brand-slate)]', label: 'Archived' }
    };

    const statusConfig = config[status as keyof typeof config] || config.draft;

    return (
      <Badge className={`${statusConfig.color} text-white`}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getLeadStatusBadge = (status: 'new' | 'contacted' | 'qualified' | 'closed' | 'lost') => {
    const statusConfig = {
      new: { label: 'New', color: 'bg-blue-600' },
      contacted: { label: 'Contacted', color: 'bg-yellow-600' },
      qualified: { label: 'Qualified', color: 'bg-purple-600' },
      closed: { label: 'Closed', color: 'bg-green-600' },
      lost: { label: 'Lost', color: 'bg-red-600' }
    };

    const config = statusConfig[status];
    const icons = {
      new: Plus,
      contacted: Phone,
      qualified: CheckCircle,
      closed: CheckCircle,
      lost: XCircle
    };
    const IconComponent = icons[status];

    return (
      <Badge className={`${config.color} text-white flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : landingPages.length === 0 ? (
        <Card className="border-[var(--brand-powder-blue)]">
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 text-[var(--brand-pale-blue)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--brand-dark-navy)] mb-2">No Landing Pages Yet</h3>
            <p className="text-[var(--brand-slate)]">
              {userRole === 'loan-officer'
                ? 'Create your first landing page to start generating leads'
                : 'Your loan officer hasn\'t created any landing pages yet. Check back later or contact them directly.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Landing Pages Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {landingPages.map((page) => (
          <Card
            key={page.id}
            className="group border-[var(--brand-powder-blue)] hover:shadow-2xl hover:border-[var(--brand-electric-blue)] transition-all duration-500 cursor-pointer relative overflow-hidden rounded-xl"
          >
            <CardContent className="p-0 relative">
              {/* Landing Page Preview (live iframe) */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <iframe
                    src={page.url || `/?p=${page.id}`}
                    title={`preview-${page.id}`}
                    className="w-full h-full"
                    style={{
                      border: '0',
                      pointerEvents: 'none',
                      width: '100%',
                      height: page.type === 'biolink' ? 'calc(100% + 90px)' : page.type === 'prequal' ? 'calc(100% + 280px)' : '100%',
                      position: 'absolute',
                      top: page.type === 'biolink' ? '-85px' : page.type === 'prequal' ? '-280px' : '0',
                      left: '0',
                      transform: page.type === 'biolink' ? 'scale(1.1)' : page.type === 'prequal' ? 'scale(1.2)' : 'scale(1)'
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Overlay with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35"></div>

                {/* Landing Page Info Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  {/* Top Section - Type Only */}
                  <div className="flex justify-start items-start">
                    <Badge variant="secondary" className="text-xs bg-white/90 text-[var(--brand-dark-navy)] backdrop-blur-sm shadow-lg">
                      {PAGE_TYPE_LABELS[(page.type as any) || 'loan_officer'] || page.type}
                    </Badge>
                  </div>

                  {/* Bottom Section - Title and Stats */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white leading-tight drop-shadow-lg">
                      {page.title}
                    </h4>
                    <div className="flex justify-between items-end">
                      <div className="flex space-x-4 text-white/90">
                        <div className="flex items-center space-x-1 text-sm">
                          <Eye className="h-4 w-4" />
                          <span className="font-medium">{page.views?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">{page.conversions || 0}</span>
                        </div>
                      </div>
                      <div className="text-xs text-white/75 flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(page.lastModified || page.updated || page.created).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Action Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-3 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                    {userRole === 'loan-officer' ? (
                      <>
                        <Button
                          size="lg"
                          className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white text-white shadow-xl border-0 backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); openEditor(page.id); }}
                        >
                          <Edit className="h-5 w-5 mr-2" />
                          Edit Page
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="bg-white/95 hover:bg-white border-white text-[var(--brand-dark-navy)] shadow-xl backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); setPreviewPageId(page.id); setPreviewOpen(true); }}
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          Preview
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="lg"
                          className="bg-[var(--brand-cyan)] hover:bg-[var(--brand-cyan)]/90 text-white shadow-xl border-0 backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); setPreviewPageId(page.id); setPreviewOpen(true); }}
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          View Page
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="bg-white/95 hover:bg-white border-white text-[var(--brand-dark-navy)] shadow-xl backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); window.open(page.url || `/?p=${page.id}`, '_blank'); }}
                        >
                          <Share2 className="h-5 w-5 mr-2" />
                          Share
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Summary Bar */}
              <div className="p-4 bg-gradient-to-r from-[var(--brand-pale-blue)] to-white border-t border-[var(--brand-powder-blue)]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-cyan)] animate-pulse"></div>
                    <span className="text-sm font-medium text-[var(--brand-dark-navy)]">Live</span>
                  </div>
                  <div className="text-sm text-[var(--brand-slate)]">
                    {page.views > 0 ? ((page.conversions / page.views) * 100).toFixed(1) : '0.0'}% conversion rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            ))}
          </div>
        </>
      )}

      {/* Full-width Preview Modal */}
      {previewOpen && previewPageId && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
          <div className="relative w-[95vw] h-[80vh] bg-white rounded-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-[var(--brand-dark-navy)] border-b border-gray-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Page Preview</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentPage = landingPages.find(p => p.id === previewPageId);
                    if (currentPage) {
                      window.open(currentPage.url || `/?p=${currentPage.id}`, '_blank');
                    }
                  }}
                >
                  Open in New Tab
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setPreviewOpen(false); setPreviewPageId(null); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Full Page iframe */}
            <iframe
              title="Page Preview"
              src={(() => {
                const currentPage = landingPages.find(p => p.id === previewPageId);
                return currentPage?.url || `/?p=${previewPageId}`;
              })()}
              className="w-full h-full border-0"
              style={{ paddingTop: '64px' }}
            />
          </div>
        </div>
      )}

      {/* Frontend Block Editor Modal (iframe) */}
      {editorOpen && editorPageId && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center pt-16">
          <div className="relative w-[95vw] h-[80vh] bg-white rounded-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-[var(--brand-dark-navy)] border-b border-gray-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Page Editor</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditorOpen(false); setEditorPageId(null); }}
                  className="text-gray-300 hover:text-white"
                >
                  ✕
                </Button>
              </div>
            </div>

            <iframe
              title="Landing Page Editor"
              src={(() => {
                const currentPage = landingPages.find(p => p.id === editorPageId);
                return buildLandingEditorUrl(editorPageId, true, currentPage?.type);
              })()}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

    </div>
  );
}