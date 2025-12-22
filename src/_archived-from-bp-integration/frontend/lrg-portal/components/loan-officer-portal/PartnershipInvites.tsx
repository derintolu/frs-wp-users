import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import {
  UserPlus,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Copy,
  Calendar,
  Loader2
} from 'lucide-react';
import { usePartnerships } from '../../hooks/usePartnerships';
import { LoanOfficerDataService } from '../../utils/loanOfficerDataService';
import { toast } from 'sonner';

interface FormData {
  name: string;
  email: string;
  company: string;
  role: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
}

export function PartnershipInvites() {
  const { partnerships: pendingInvites, loading, refetch } = usePartnerships('pending');
  const [inviteTemplate, setInviteTemplate] = useState('professional');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    role: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendingId, setResendingId] = useState<number | null>(null);

  const inviteTemplates = [
    { id: 'professional', name: 'Professional Partnership', description: 'Formal partnership invitation' },
    { id: 'friendly', name: 'Friendly Approach', description: 'Casual and personal invitation' },
    { id: 'referral', name: 'Referral Program', description: 'Focus on referral benefits' }
  ];

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Partner name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.company.trim()) {
      errors.company = 'Company name is required';
    }

    if (!formData.role.trim()) {
      errors.role = 'Role/Title is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendInvite = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      await LoanOfficerDataService.invitePartner({
        name: formData.name,
        email: formData.email,
        company: formData.company
      });

      // Reset form
      setFormData({ name: '', email: '', company: '', role: '', message: '' });
      setFormErrors({});
      setInviteTemplate('professional');

      // Refresh invites list
      await refetch();

      toast.success('Invitation sent successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
      toast.error(errorMessage);
      console.error('Invite error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (id: number) => {
    setResendingId(id);

    try {
      await LoanOfficerDataService.resendInvite(id);
      toast.success('Invitation resent successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend invitation';
      toast.error(errorMessage);
      console.error('Resend error:', error);
    } finally {
      setResendingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'var(--secondary)';
      case 'viewed':
        return 'var(--brand-primary-blue)';
      case 'accepted':
        return 'var(--brand-rich-teal)';
      case 'declined':
        return 'var(--destructive)';
      default:
        return 'var(--secondary)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="size-4" />;
      case 'viewed':
        return <Mail className="size-4" />;
      case 'accepted':
        return <CheckCircle className="size-4" />;
      case 'declined':
        return <XCircle className="size-4" />;
      default:
        return <Clock className="size-4" />;
    }
  };

  // Calculate stats from pending invites
  const stats = {
    totalSent: pendingInvites.length,
    accepted: pendingInvites.filter(inv => inv.status === 'accepted').length,
    pending: pendingInvites.filter(inv => inv.status === 'pending').length,
  };

  const successRate = stats.totalSent > 0
    ? Math.round((stats.accepted / stats.totalSent) * 100)
    : 0;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Partnership Invitations</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Manage and track your partnership invitations
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send New Invitation</CardTitle>
            <CardDescription>Invite a new partner to join your network</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="partner-name">Partner Name *</Label>
                  <Input
                    id="partner-name"
                    placeholder="Enter partner's full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isSubmitting}
                    className={formErrors.name ? 'border-destructive' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-destructive">{formErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-email">Email Address *</Label>
                  <Input
                    id="partner-email"
                    type="email"
                    placeholder="partner@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isSubmitting}
                    className={formErrors.email ? 'border-destructive' : ''}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-destructive">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="partner-company">Company *</Label>
                  <Input
                    id="partner-company"
                    placeholder="Century 21 Branch Name"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    disabled={isSubmitting}
                    className={formErrors.company ? 'border-destructive' : ''}
                  />
                  {formErrors.company && (
                    <p className="text-sm text-destructive">{formErrors.company}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner-role">Role/Title *</Label>
                  <Input
                    id="partner-role"
                    placeholder="Real Estate Agent"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    disabled={isSubmitting}
                    className={formErrors.role ? 'border-destructive' : ''}
                  />
                  {formErrors.role && (
                    <p className="text-sm text-destructive">{formErrors.role}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitation-template">Invitation Template</Label>
                <Select
                  value={inviteTemplate}
                  onValueChange={setInviteTemplate}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {inviteTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            {template.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="personal-message">Personal Message (Optional)</Label>
                <Textarea
                  id="personal-message"
                  placeholder="Add a personal note to your invitation..."
                  rows={3}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <Separator />

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <Copy className="size-4 mr-2" />
                  Preview
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                  style={{
                    background: isSubmitting ? 'var(--muted)' : 'var(--gradient-hero)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="size-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invitation Statistics</CardTitle>
            <CardDescription>Track your invitation performance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-8 animate-spin" style={{ color: 'var(--brand-primary-blue)' }} />
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2">
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--brand-off-white)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--brand-primary-blue)' }}>{stats.totalSent}</div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Total Sent</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--brand-off-white)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--brand-rich-teal)' }}>{stats.accepted}</div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Accepted</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--brand-off-white)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--brand-navy)' }}>{successRate}%</div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Success Rate</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--brand-off-white)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--brand-primary-blue)' }}>{stats.pending}</div>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Pending</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>Track the status of your sent invitations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-8 animate-spin" style={{ color: 'var(--brand-primary-blue)' }} />
            </div>
          ) : pendingInvites.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: 'var(--muted-foreground)' }}>No pending invitations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <div
                      className="size-10 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--gradient-brand-blue)' }}
                    >
                      <span className="text-white text-sm font-medium">
                        {invite.agent_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{invite.agent_name}</h3>
                        <Badge
                          variant="secondary"
                          style={{
                            background: getStatusColor(invite.status),
                            color: invite.status === 'pending' ? 'var(--secondary-foreground)' : 'white'
                          }}
                        >
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(invite.status)}
                            <span className="capitalize">{invite.status}</span>
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {invite.agent_role} at {invite.agent_company}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {invite.agent_email} • Sent {new Date(invite.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mt-2">
                      <Button variant="ghost" size="sm" disabled={resendingId === invite.id}>
                        <Mail className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" disabled={resendingId === invite.id}>
                        <Calendar className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleResend(invite.id)}
                        disabled={resendingId === invite.id}
                        style={{
                          background: resendingId === invite.id ? 'var(--muted)' : 'var(--gradient-hero)',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        {resendingId === invite.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          'Resend'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
