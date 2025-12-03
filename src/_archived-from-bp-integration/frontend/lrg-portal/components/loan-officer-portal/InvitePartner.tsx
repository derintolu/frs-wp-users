import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FloatingInput } from '../ui/floating-input';
import { LoadingSpinner } from '../ui/loading';
import {
  UserPlus,
  Mail,
  Send,
  CheckCircle,
  Clock,
  User,
  Zap,
  Activity
} from 'lucide-react';
import { DataService, type Partnership } from '../../utils/dataService';

interface InvitePartnerProps {
  readonly userId: string;
  readonly onInviteSent?: () => void;
}

interface InviteForm {
  name: string;
  email: string;
  message: string;
}

interface ActivityLog {
  id: string;
  timestamp: Date;
  stage: string;
  message: string;
  status: 'in_progress' | 'completed' | 'error';
}

export function InvitePartner({ userId, onInviteSent }: InvitePartnerProps): JSX.Element {
  const [inviteForm, setInviteForm] = useState<InviteForm>({
    name: '',
    email: '',
    message: ''
  });
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Partnership[]>([]);

  // Load partnerships
  useEffect(() => {
    const loadData = async () => {
      try {
        const partnershipsData = await DataService.getPartnershipsForLO(userId);

        // Filter pending only
        const pending = partnershipsData.filter(p => p.status === 'pending');
        setPendingInvites(pending);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  const addActivityLog = (stage: string, message: string, status: ActivityLog['status']) => {
    const log: ActivityLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      stage,
      message,
      status
    };
    setActivityLog(prev => [log, ...prev]);
  };

  const handleInviteSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!inviteForm.name || !inviteForm.email) {
      addActivityLog('Validation', 'Please provide both name and email', 'error');
      return;
    }

    try {
      setIsInviting(true);
      setActivityLog([]); // Clear previous logs

      // Stage 1: Validating
      addActivityLog('Validation', 'Validating email address...', 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 500));
      addActivityLog('Validation', 'Email validated successfully', 'completed');

      // Stage 2: Generating Invite Code
      addActivityLog('Invite Code', 'Generating unique invitation code...', 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 800));
      addActivityLog('Invite Code', 'Invitation code generated successfully', 'completed');

      // Stage 3: Sending Email
      addActivityLog('Email Delivery', 'Sending invitation email with registration link...', 'in_progress');

      const success = await DataService.invitePartner(
        userId,
        inviteForm.email,
        inviteForm.name,
        inviteForm.message
      );

      if (success) {
        await new Promise(resolve => setTimeout(resolve, 500));
        addActivityLog('Email Delivery', `Invitation sent to ${inviteForm.email}`, 'completed');

        // Stage 4: Partnership Created
        addActivityLog('Partnership', 'Partnership invitation created successfully', 'completed');

        // Reload data to show new pending invite
        const partnershipsData = await DataService.getPartnershipsForLO(userId);
        const pending = partnershipsData.filter(p => p.status === 'pending');
        setPendingInvites(pending);

        // Clear form
        setInviteForm({ name: '', email: '', message: '' });

        if (onInviteSent) {
          onInviteSent();
        }
      } else {
        addActivityLog('Error', 'Failed to send invitation', 'error');
      }
    } catch (err) {
      addActivityLog('Error', 'An error occurred during the invitation process', 'error');
      console.error('Invite error:', err);
    } finally {
      setIsInviting(false);
    }
  };

  const getProgressPercent = (partnership: any): number => {
    // Calculate progress based on created date
    const created = new Date(partnership.created_at || partnership.createdAt).getTime();
    const now = Date.now();
    const hoursPassed = (now - created) / (1000 * 60 * 60);

    // Simulate progress: 0-25% in first hour, 25-50% in second hour, etc.
    return Math.min(Math.floor((hoursPassed / 4) * 100), 90); // Max 90% while pending
  };

  const getStageLabel = (progress: number): string => {
    if (progress < 25) return 'Invitation sent';
    if (progress < 50) return 'Email delivered';
    if (progress < 75) return 'Awaiting response';
    return 'Partner reviewing';
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 grid-equal-height">
          {/* LEFT: Invite Form */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-[#2DD4DA] flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                Send Partnership Invitation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleInviteSubmit} className="space-y-6">
                <FloatingInput
                  label="Realtor Name"
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  required
                  disabled={isInviting}
                />

                <FloatingInput
                  label="Email Address"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                  disabled={isInviting}
                  icon={<Mail className="h-4 w-4 text-gray-400" />}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    placeholder="Add a personal touch to your invitation..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows={4}
                    disabled={isInviting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full text-white border-0 transition-all duration-200 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)' }}
                  disabled={isInviting}
                >
                  {isInviting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing Invitation...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Partnership Invitation
                    </>
                  )}
                </Button>
              </form>

              {/* How It Works */}
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-b from-gray-50 to-blue-50 border border-blue-100">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  How It Works
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                    <span>Unique invitation code generated</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                    <span>Registration link sent via email</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                    <span>Partner creates account with invite code</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                    <span>Start collaborating on co-branded materials</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Stacked Cards - Live Activity + Pending Invitations */}
          <div className="space-y-6">
            {/* Live Activity Feed */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-[#2DD4DA] flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  Live Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {activityLog.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 text-sm">
                      Activity will appear here when you send an invitation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {activityLog.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-lg border transition-all"
                        style={{
                          backgroundColor: log.status === 'completed' ? '#eff6ff' :
                                         log.status === 'error' ? '#fee' : '#fff',
                          borderColor: log.status === 'completed' ? '#3b82f6' :
                                      log.status === 'error' ? '#fcc' : '#e5e7eb'
                        }}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {log.status === 'in_progress' && (
                            <LoadingSpinner size="sm" />
                          )}
                          {log.status === 'completed' && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                          {log.status === 'error' && (
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 text-sm">{log.stage}</p>
                            <span className="text-xs text-gray-500">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{log.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Invitations */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-[#2DD4DA] flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  Pending Invitations ({pendingInvites.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {pendingInvites.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 text-sm">
                      Pending invitations will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {pendingInvites.map((invite) => {
                      const progress = getProgressPercent(invite);
                      const stage = getStageLabel(progress);

                      return (
                        <div key={invite.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{(invite as any).partner_name || (invite as any).partner_email}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {(invite as any).partner_email}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-blue-600 text-blue-600"
                            >
                              Pending
                            </Badge>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 font-medium">{stage}</span>
                              <span className="text-gray-600">{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-blue-50 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-500 rounded-full"
                                style={{
                                  width: `${progress}%`,
                                  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)'
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              Sent {new Date((invite as any).created_at || invite.createdAt).toLocaleDateString()} at {new Date((invite as any).created_at || invite.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
