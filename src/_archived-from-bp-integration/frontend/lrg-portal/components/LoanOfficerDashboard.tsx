import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  User,
  Users, 
  UserPlus, 
  TrendingUp, 
  BarChart3, 
  Eye, 
  Edit, 
  Mail, 
  Phone,
  Calendar,
  Plus,
  MoreHorizontal,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Building,
  MapPin,
  Share2,
  Folder,
  Download,
  Activity
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { DataService, type User, type Partnership, type LandingPage, type DashboardStats, type Lead } from '../utils/dataService';
import { LoadingCard, LoadingSpinner } from './ui/loading';
import { ErrorAlert, ErrorDisplay } from './ui/error';
import { STATUS_CONFIG } from '../config/appConfig';

interface LoanOfficerDashboardProps {
  userId: string;
  currentUser?: User;
  onNavigateToProfile?: () => void;
}

export function LoanOfficerDashboard({ userId, currentUser, onNavigateToProfile }: LoanOfficerDashboardProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isInviting, setIsInviting] = useState(false);
  
  // Data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [partners, setPartners] = useState<User[]>([]);
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
        const [statsData, partnersData, partnershipsData, pagesData, leadsData] = await Promise.all([
          DataService.getDashboardStatsForLO(userId),
          DataService.getPartnersForLO(userId),
          DataService.getPartnershipsForLO(userId),
          DataService.getLandingPagesForLO(userId),
          DataService.getLeadsForLO(userId)
        ]);

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
      {/* Top Row: Welcome Card + 4 Stats Cards */}
        {/* Welcome Card with User Profile - Full width on mobile */}
        <Card className="border-[var(--brand-powder-blue)]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="flex-shrink-0">
                <button
                  onClick={onNavigateToProfile}
                  className="focus:outline-none focus:ring-2 focus:ring-[var(--brand-electric-blue)] rounded-full"
                  title="View Profile"
                >
                  <ImageWithFallback 
                    src={currentUser?.avatar || ''} 
                    alt={currentUser?.name || 'User'} 
                    className="w-12 h-12 sm:w-16 sm:h-16 aspect-square object-cover rounded-full bg-[var(--brand-pale-blue)] hover:ring-2 hover:ring-[var(--brand-electric-blue)] transition-all cursor-pointer flex-shrink-0"
                  />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2 sm:mb-3">
                  <button
                    onClick={onNavigateToProfile}
                    className="text-left focus:outline-none focus:ring-2 focus:ring-[var(--brand-electric-blue)] rounded-md p-1 -m-1"
                    title="View Profile"
                  >
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-[var(--brand-dark-navy)] truncate hover:text-[var(--brand-electric-blue)] transition-colors">
                      Welcome back, {currentUser?.name || 'User'}!
                    </h2>
                  </button>
                  <p className="text-xs sm:text-sm md:text-base text-[var(--brand-slate)] truncate">
                    {currentUser?.company}{currentUser?.location ? ` • ${currentUser.location}` : ''}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm space-y-1 sm:space-y-0">
                    <div className="flex items-center space-x-1 text-[var(--brand-steel-blue)]">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate text-xs sm:text-sm">{currentUser?.email}</span>
                    </div>
                    <Badge className="bg-[var(--brand-cyan)] text-white w-fit text-xs sm:text-sm">
                      {currentUser?.role === 'loan_officer' ? 'Loan Officer' : 'Partner'}
                    </Badge>
                  </div>
                  {onNavigateToProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNavigateToProfile}
                      className="text-[var(--brand-electric-blue)] border-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)] hover:text-white w-full sm:w-auto mt-2 sm:mt-0 sm:ml-4"
                    >
                      <User className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4 Separate Stats Cards - Responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {loadingStates.stats ? (
              <LoadingCard type="stats" count={4} />
            ) : (
              statsDisplay.map((stat, index) => (
                <Card key={index} className="border-[var(--brand-powder-blue)]">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-[var(--brand-slate)] truncate">{stat.title}</p>
                        <p className="text-base sm:text-lg md:text-xl font-bold text-[var(--brand-dark-navy)] mt-1">{stat.value}</p>
                        <p className="text-xs sm:text-sm text-[var(--brand-steel-blue)] mt-1">{stat.change}</p>
                      </div>
                      <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color} flex-shrink-0 ml-2`} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

      {/* Leads Management */}
      <Card className="border-[var(--brand-powder-blue)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[var(--brand-dark-navy)] flex items-center text-base sm:text-lg md:text-xl">
            <Activity className="h-5 w-5 mr-2" />
            Recent Leads ({leads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStates.partners ? (
            <LoadingCard type="table" />
          ) : leads.length > 0 ? (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-[var(--brand-dark-navy)]">
                              {lead.firstName} {lead.lastName}
                            </div>
                            <div className="text-sm text-[var(--brand-slate)]">{lead.propertyType}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm text-[var(--brand-slate)]">{lead.email}</div>
                            <div className="text-sm text-[var(--brand-slate)]">{lead.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getLeadStatusBadge(lead.status)}</TableCell>
                        <TableCell className="text-[var(--brand-slate)]">
                          ${lead.loanAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-[var(--brand-slate)]">{lead.source}</TableCell>
                        <TableCell className="text-[var(--brand-slate)]">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" title="Send email">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Call lead">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="View details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>
              
              {/* Mobile Card View - Visible on mobile */}
              <div className="block lg:hidden space-y-3">
                {leads.map((lead) => (
                  <Card key={lead.id} className="border-[var(--brand-light-gray)]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[var(--brand-dark-navy)] text-sm sm:text-base truncate">
                            {lead.firstName} {lead.lastName}
                          </h4>
                          <p className="text-xs sm:text-sm text-[var(--brand-slate)] mt-1">{lead.propertyType}</p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {getLeadStatusBadge(lead.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div>
                          <p className="text-[var(--brand-slate)] truncate">{lead.email}</p>
                          <p className="text-[var(--brand-slate)] truncate">{lead.phone}</p>
                        </div>
                        <div>
                          <p className="text-[var(--brand-slate)]">
                            ${lead.loanAmount.toLocaleString()}
                          </p>
                          <p className="text-[var(--brand-slate)]">{lead.source}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--brand-light-gray)]">
                        <p className="text-xs sm:text-sm text-[var(--brand-slate)]">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Send email">
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Call lead">
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View details">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-[var(--brand-pale-blue)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--brand-dark-navy)] mb-2">No Leads Yet</h3>
              <p className="text-[var(--brand-slate)] mb-4">
                Leads from your landing pages and partnership network will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partnership Management - Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column - Partner List with Profiles */}
        <Card className="border-[var(--brand-powder-blue)] flex flex-col h-full">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-[var(--brand-dark-navy)] flex items-center text-base sm:text-lg md:text-xl">
              <Users className="h-5 w-5 mr-2" />
              Partner Profiles & Resources ({partners.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 px-3 sm:px-6">
            {loadingStates.partners ? (
              <div className="space-y-4">
                <LoadingCard type="profile" count={3} />
              </div>
            ) : partners.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {partners.map((partner) => (
                  <Card 
                    key={partner.id} 
                    className="border-[var(--brand-powder-blue)] hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        {/* Partner Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 aspect-square bg-gradient-to-br from-[var(--brand-electric-blue)] to-[var(--brand-cyan)] rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm flex-shrink-0">
                            {partner.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        
                        {/* Partner Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-[var(--brand-dark-navy)] truncate text-sm sm:text-base">{partner.name}</h4>
                            <div className="ml-2 flex-shrink-0">
                              {getStatusBadge(getPartnershipStatus(partner.id))}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center text-xs sm:text-sm text-[var(--brand-slate)]">
                              <Building className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{partner.company}</span>
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-[var(--brand-slate)]">
                              <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{partner.email}</span>
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-[var(--brand-slate)]">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{partner.location || 'Location not specified'}</span>
                            </div>
                          </div>
                          
                          {/* Partner Actions */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex space-x-1 sm:space-x-2">
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

        {/* Right Column - Invitation Instructions and Form */}
        <Card className="border-[var(--brand-powder-blue)] flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-[var(--brand-dark-navy)] flex items-center text-base sm:text-lg md:text-xl">
              <UserPlus className="h-5 w-5 mr-2" />
              Invite New Realtor Partners
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            {/* Instructions Section */}
            <div className="bg-gradient-to-r from-[var(--brand-pale-blue)] to-white p-4 rounded-lg border border-[var(--brand-powder-blue)]">
              <h4 className="font-medium text-[var(--brand-dark-navy)] mb-3 text-sm sm:text-base">How Partnership Invitations Work</h4>
              <div className="space-y-2 text-xs sm:text-sm text-[var(--brand-slate)]">
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

            {/* Stats Summary */}
            <div className="bg-[var(--brand-pale-blue)] p-4 rounded-lg">
              <h4 className="font-medium text-[var(--brand-dark-navy)] mb-3">Partnership Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[var(--brand-electric-blue)]">
                    {stats?.activePartnerships || 0}
                  </div>
                  <div className="text-xs text-[var(--brand-slate)]">Active Partners</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--brand-cyan)]">
                    {stats?.pendingInvitations || 0}
                  </div>
                  <div className="text-xs text-[var(--brand-slate)]">Pending Invites</div>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="pt-4 border-t border-[var(--brand-powder-blue)]">
              <Button 
                variant="outline" 
                className="w-full border-[var(--brand-electric-blue)] text-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)] hover:text-white"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Advanced Invitation Options
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}