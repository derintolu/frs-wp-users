import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import {
  UserCheck,
  Users,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Star,
  ChevronRight,
  Plus,
  UserPlus,
  Calendar,
  BarChart3,
  Copy,
  ExternalLink,
  Settings
} from 'lucide-react';
import { usePartnerships } from '../../hooks/usePartnerships';

export function Partnerships() {
  const [activeTab, setActiveTab] = useState('overview');
  const { partnerships, loading, removePartnership } = usePartnerships('active');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter partnerships based on search term
  const filteredPartners = partnerships?.filter(p =>
    p.agent_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate partnership stats from partnerships array
  const partnershipStats = {
    totalPartners: partnerships?.length || 0,
    activePartners: partnerships?.filter(p => p.status === 'active').length || 0,
    pendingInvites: partnerships?.filter(p => p.status === 'pending').length || 0,
    totalReferrals: partnerships?.reduce((sum, p) => sum + (p.referrals || 0), 0) || 0,
    closedDeals: partnerships?.reduce((sum, p) => sum + (p.closed_deals || 0), 0) || 0,
    totalRevenue: partnerships?.reduce((sum, p) => sum + (p.revenue || 0), 0) || 0,
    avgConversionRate: partnerships?.length > 0
      ? ((partnerships.reduce((sum, p) => sum + (p.closed_deals || 0), 0) /
          partnerships.reduce((sum, p) => sum + (p.referrals || 0), 0)) * 100).toFixed(1) + '%'
      : '0%'
  };

  // Format revenue as currency
  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle email action
  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  // Handle phone action
  const handlePhone = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  // Handle remove partnership
  const handleRemove = async (id: number) => {
    if (confirm('Remove this partnership?')) {
      await removePartnership(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Partnerships</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Manage your professional partnerships and referral network
          </p>
        </div>
        <Button
          className="space-x-2"
          style={{
            background: 'var(--gradient-hero)',
            color: 'white',
            border: 'none'
          }}
        >
          <UserPlus className="size-4" />
          <span>Invite Partner</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
          <TabsTrigger value="cobranded">Co-branded Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Active Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: 'var(--brand-primary-blue)' }}>
                  {loading ? '...' : partnershipStats.activePartners}
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  of {partnershipStats.totalPartners} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: 'var(--brand-rich-teal)' }}>
                  {loading ? '...' : partnershipStats.totalReferrals}
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  from all partners
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Closed Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: 'var(--brand-navy)' }}>
                  {loading ? '...' : partnershipStats.closedDeals}
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {partnershipStats.avgConversionRate} conversion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: 'var(--brand-primary-blue)' }}>
                  {loading ? '...' : formatRevenue(partnershipStats.totalRevenue)}
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  from partnerships
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Partners</CardTitle>
                  <CardDescription>Your current partnership network</CardDescription>
                </div>
                <div className="w-72">
                  <Input
                    placeholder="Search partners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--muted-foreground)' }}>Loading partnerships...</p>
                </div>
              ) : filteredPartners.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="size-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
                  <h3 className="font-medium mb-2">
                    {searchTerm ? 'No partners found' : 'No active partnerships'}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                    {searchTerm ? 'Try adjusting your search term' : 'Start building your partnership network'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPartners.map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <Avatar className="size-12">
                          {partner.agent_avatar ? (
                            <AvatarImage src={partner.agent_avatar} />
                          ) : null}
                          <AvatarFallback>
                            {partner.agent_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{partner.agent_name}</h3>
                            <Badge
                              variant={partner.status === 'active' ? 'default' : 'secondary'}
                              style={{
                                background: partner.status === 'active' ? 'var(--brand-rich-teal)' : 'var(--secondary)',
                                color: partner.status === 'active' ? 'white' : 'var(--secondary-foreground)'
                              }}
                            >
                              {partner.status}
                            </Badge>
                          </div>
                          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            {partner.agent_role || 'Real Estate Agent'} at {partner.agent_company || 'N/A'}
                          </p>
                          <div className="flex items-center space-x-4 text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                            <span className="flex items-center space-x-1">
                              <TrendingUp className="size-3" />
                              <span>{partner.referrals || 0} referrals</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Star className="size-3 fill-current" style={{ color: 'var(--brand-primary-blue)' }} />
                              <span>{partner.rating || 0}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold" style={{ color: 'var(--brand-navy)' }}>
                          {formatRevenue(partner.revenue || 0)}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          {partner.closed_deals || 0} closed deals
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEmail(partner.agent_email)}
                          >
                            <Mail className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePhone(partner.agent_email)}
                            disabled
                            title="Phone number not available"
                          >
                            <Phone className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(partner.id)}
                          >
                            <Settings className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Partnership Invitations</CardTitle>
              <CardDescription>Send invitations to potential partners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="partner-name">Partner Name</Label>
                  <Input id="partner-name" placeholder="Enter partner's name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-email">Email Address</Label>
                  <Input id="partner-email" type="email" placeholder="partner@company.com" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="partner-company">Company</Label>
                  <Input id="partner-company" placeholder="Century 21 Branch" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-role">Role</Label>
                  <Input id="partner-role" placeholder="Real Estate Agent" />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Pending Invitations</h4>
                <div className="space-y-2">
                  {partnerships?.filter(p => p.status === 'pending').map((invite, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded border">
                      <div>
                        <p className="font-medium">{invite.agent_name}</p>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          {invite.agent_email} • Sent {new Date(invite.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">Resend</Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(invite.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--muted-foreground)' }}>
                      No pending invitations
                    </p>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                style={{
                  background: 'var(--gradient-hero)',
                  color: 'white',
                  border: 'none'
                }}
              >
                <UserPlus className="size-4 mr-2" />
                Send Invitation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cobranded" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Co-branded Marketing</CardTitle>
              <CardDescription>Create joint marketing materials with your partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <UserCheck className="size-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
                <h3 className="font-medium mb-2">Co-branded Campaigns</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  Create marketing materials that feature both you and your partners
                </p>
                <Button
                  style={{
                    background: 'var(--gradient-hero)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Create Co-branded Material
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
