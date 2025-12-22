import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { LoadingSpinner } from '../ui/loading';
import { UserPlus, Mail } from 'lucide-react';
import { DataService } from '../../utils/dataService';

interface PartnershipsInvitesProps {
  userId: string;
  onInviteSent?: () => void;
}

export function PartnershipsInvites({ userId, onInviteSent }: PartnershipsInvitesProps) {
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      setIsInviting(true);
      const success = await DataService.invitePartner(
        userId,
        inviteForm.email,
        inviteForm.name,
        inviteForm.message
      );

      if (success) {
        setInviteForm({ name: '', email: '', message: '' });
        setSuccessMessage('Invitation sent successfully!');
        if (onInviteSent) {
          onInviteSent();
        }
      }
    } catch (err) {
      setError('Failed to send invitation. Please try again.');
      console.error('Invite error:', err);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="brand-card">
        <CardHeader className="h-12 flex items-center px-4 rounded-t-lg" style={{ backgroundColor: '#B6C7D9' }}>
          <CardTitle className="flex items-center gap-1 text-gray-700 text-sm">
            <UserPlus className="h-3 w-3" />
            Invite New Realtor Partners
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              {error}
            </div>
          )}

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
                className="brand-button brand-button-primary w-full"
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
  );
}
